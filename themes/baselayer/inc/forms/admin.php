<?php

defined('ABSPATH') || exit;

/**
 * Strip unused meta boxes on the form edit screen.
 * Builder is rendered outside a postbox (see edit_form_after_title).
 */
function bl_forms_admin_meta_boxes(): void
{
	remove_meta_box('slugdiv', BL_FORM_POST_TYPE, 'normal');
}
add_action('add_meta_boxes', 'bl_forms_admin_meta_boxes');

/**
 * Full-width builder shell below the title — not a draggable WP postbox.
 */
function bl_forms_render_builder_after_title(WP_Post $post): void
{
	if ($post->post_type !== BL_FORM_POST_TYPE) {
		return;
	}

	$config = bl_forms_get_config((int) $post->ID);
	$fallbacks = bl_forms_message_fallbacks();
	$site_name = wp_specialchars_decode(get_bloginfo('name'), ENT_QUOTES);
	$form_title = get_the_title($post);
	if ($form_title === '') {
		$form_title = sprintf(
			/* translators: %d: form post ID */
			__('Form #%d', 'baselayer'),
			(int) $post->ID
		);
	}
	$default_admin_subject = sprintf(
		/* translators: 1: site name, 2: form title */
		__('[%1$s] New submission: %2$s', 'baselayer'),
		$site_name,
		$form_title
	);
	wp_nonce_field('bl_forms_save_config', 'bl_forms_config_nonce');
	?>
	<input type="hidden" name="bl_forms_config_json" id="bl-forms-config-json" value="<?= esc_attr(wp_json_encode($config)) ?>">
	<div
		id="bl-forms-builder"
		class="bl-forms-builder"
		data-bl-forms-builder
		data-admin-email="<?= esc_attr((string) get_option('admin_email', '')) ?>"
		data-fallback-admin-subject="<?= esc_attr($default_admin_subject) ?>"
		data-fallback-submit="<?= esc_attr($fallbacks['submit']) ?>"
		data-fallback-success="<?= esc_attr($fallbacks['success']) ?>"
		data-fallback-error="<?= esc_attr($fallbacks['error']) ?>"
		data-fallback-validation="<?= esc_attr($fallbacks['validation']) ?>"
		data-fallback-required="<?= esc_attr($fallbacks['required']) ?>"
	></div>
	<?php
}
add_action('edit_form_after_title', 'bl_forms_render_builder_after_title');

/**
 * Save form config from builder JSON only.
 */
function bl_forms_save_post(int $post_id, WP_Post $post): void
{
	if ($post->post_type !== BL_FORM_POST_TYPE) {
		return;
	}
	if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
		return;
	}
	if (!bl_forms_user_can_manage()) {
		return;
	}
	if (!isset($_POST['bl_forms_config_nonce']) || !wp_verify_nonce((string) $_POST['bl_forms_config_nonce'], 'bl_forms_save_config')) {
		return;
	}

	$decoded = [];
	if (isset($_POST['bl_forms_config_json'])) {
		$json = (string) wp_unslash($_POST['bl_forms_config_json']);
		$parsed = json_decode($json, true);
		if (is_array($parsed)) {
			$decoded = $parsed;
		}
	}

	$config = bl_forms_sanitize_config($decoded);
	update_post_meta($post_id, BL_FORM_CONFIG_META, $config);
}
add_action('save_post', 'bl_forms_save_post', 10, 2);

/**
 * Inline SVG icons for the form builder field palette.
 *
 * @return array<string, string> field type => svg markup
 */
function bl_forms_palette_icons(): array
{
	if (!function_exists('bl_svg_code') || !function_exists('bl_icon_svg_asset_path')) {
		return [];
	}

	$map = [
		'text'         => 'text-short',
		'textarea'     => 'article',
		'email'        => 'mail',
		'url'          => 'link',
		'number'       => '123',
		'phone'        => 'phone',
		'checkboxes'   => 'checklist',
		'radio'        => 'radio-button-checked',
		'select'       => 'dropdown',
		'toggle'       => 'toggle-on',
		'button_group' => 'view-column',
		'terms'        => 'checkbox-checked',
		'date'         => 'calendar',
		'time'         => 'clock',
		'datetime'     => 'calendar-month',
		'file'         => 'upload',
		'image'        => 'image',
		'heading'      => 'format-size',
		'text_block'   => 'paragraph',
		'html'         => 'code-slash',
		'divider'      => 'horizontal-rule',
		'spacer'       => 'expand',
		'column'       => 'view-column',
		'section'      => 'layers',
		'hidden'       => 'visibility-off',
		'honeypot'     => 'bug',
		'captcha'      => 'shield-lock',
		'add'          => 'chevron-right',
		'caret'        => 'chevron-down',
		'panelCollapse'=> 'arrow-menu-close',
		'panelExpand'  => 'arrow-menu-open',
		'edit'         => 'edit',
		'done'         => 'checkmark',
		'trash'        => 'delete',
		'drag'         => 'drag-handle',
		'lock'         => 'lock',
		'shield'       => 'shield',
		'design'       => 'palette',
	];

	$icons = [];
	foreach ($map as $key => $icon_name) {
		$svg = bl_svg_code(bl_icon_svg_asset_path($icon_name), [
			'width'  => '16',
			'height' => '16',
			'aria-hidden' => 'true',
			'focusable' => 'false',
		]);
		if ($svg !== '') {
			$icons[$key] = $svg;
		}
	}

	return $icons;
}

/**
 * Enqueue builder assets on form edit screens.
 */
function bl_forms_admin_enqueue(string $hook): void
{
	$screen = function_exists('get_current_screen') ? get_current_screen() : null;
	if (!$screen instanceof WP_Screen) {
		return;
	}

	$is_form_edit = in_array($hook, ['post.php', 'post-new.php'], true)
		&& $screen->post_type === BL_FORM_POST_TYPE;
	$is_entry = $screen->post_type === BL_FORM_ENTRY_POST_TYPE;

	if (!$is_form_edit && !$is_entry) {
		return;
	}

	bl_forms_enqueue_style('bl-forms-admin', 'forms-admin');

	if ($is_form_edit) {
		// Publish (and any other) side boxes are WP defaults — keep them, but not draggable.
		// Defer until after postbox initializes sortable; only destroy when present.
		wp_add_inline_script(
			'postbox',
			"jQuery(function($){
				function blFormsDisableMetaBoxSort() {
					$('.meta-box-sortables').each(function(){
						var \$el = $(this);
						if (\$el.data('ui-sortable')) {
							\$el.sortable('destroy');
						}
					});
					$('.postbox .hndle, .postbox .handlediv').css('cursor', 'default');
				}
				blFormsDisableMetaBoxSort();
				setTimeout(blFormsDisableMetaBoxSort, 0);
			});"
		);
	}

	if ($is_form_edit && bl_forms_user_can_manage()) {
		bl_forms_enqueue_script('bl-forms-admin', 'forms-admin', [], true);
		$form_id = 0;
		if (!empty($_GET['post'])) {
			$form_id = (int) $_GET['post'];
		} elseif (isset($GLOBALS['post']) && $GLOBALS['post'] instanceof WP_Post) {
			$form_id = (int) $GLOBALS['post']->ID;
		}
		$redirect_page = null;
		if ($form_id > 0) {
			$config = bl_forms_get_config($form_id);
			$redirect_page_id = (int) ($config['settings']['redirect_page_id'] ?? 0);
			if ($redirect_page_id > 0) {
				$page = get_post($redirect_page_id);
				if ($page instanceof WP_Post) {
					$redirect_page = [
						'id'    => $redirect_page_id,
						'title' => get_the_title($page),
						'url'   => bl_forms_permalink_for_post($page),
					];
				}
			}
		}
		wp_localize_script('bl-forms-admin', 'blFormsAdmin', [
			'icons' => bl_forms_palette_icons(),
			'pagesRestUrl' => esc_url_raw(rest_url('wp/v2/pages')),
			'restNonce' => wp_create_nonce('wp_rest'),
			'redirectPage' => $redirect_page,
			'messageFallbacks' => bl_forms_message_fallbacks(),
			'i18n' => [
				'tabFields'         => __('Fields', 'baselayer'),
				'tabNotifications'  => __('Notifications', 'baselayer'),
				'tabSettings'       => __('Settings', 'baselayer'),
				'tabSecurity'       => __('Security', 'baselayer'),
				'paletteSearch'     => __('Search fields…', 'baselayer'),
				'paletteSearchEmpty'=> __('No fields match your search.', 'baselayer'),
				'paletteHide'       => __('Hide field templates', 'baselayer'),
				'paletteShow'       => __('Show field templates', 'baselayer'),
				'paletteSectionPopular' => __('Popular', 'baselayer'),
				'paletteSectionInput' => __('Input', 'baselayer'),
				'paletteSectionChoice' => __('Choice', 'baselayer'),
				'paletteSectionDatetime' => __('Date & time', 'baselayer'),
				'paletteSectionFiles' => __('Uploads', 'baselayer'),
				'paletteSectionLayout' => __('Layout', 'baselayer'),
				'paletteSectionContent' => __('Content', 'baselayer'),
				'paletteSectionAdvanced' => __('Advanced', 'baselayer'),
				'paletteAdd'        => __('Add field', 'baselayer'),
				'canvasHeading'     => __('Form', 'baselayer'),
				'empty'             => __('Drag a field here, or click a template to add it.', 'baselayer'),
				'columnEmpty'       => __('Drop fields here', 'baselayer'),
				'columnType'        => __('Columns', 'baselayer'),
				'columnWidthTitle'  => __('Column width', 'baselayer'),
				'sectionWidthTitle' => __('Section width', 'baselayer'),
				'sectionDesignTitle' => __('Section design', 'baselayer'),
				'sectionDesignStandard' => __('Standard', 'baselayer'),
				'sectionDesignOutline' => __('Outline', 'baselayer'),
				'sectionDesignCard' => __('Card', 'baselayer'),
				'sectionType'       => __('Section', 'baselayer'),
				'sectionLabel'      => __('Section title', 'baselayer'),
				'sectionLabelPlaceholder' => __('Section title', 'baselayer'),
				'sectionEmpty'      => __('Drop fields here', 'baselayer'),
				'widthAuto'         => __('Auto', 'baselayer'),
				'cancel'            => __('Cancel', 'baselayer'),
				'apply'             => __('Apply', 'baselayer'),
				'label'             => __('Label', 'baselayer'),
				'name'              => __('Field name', 'baselayer'),
				'nameHelp'          => __('Internal field key used in submissions, emails, and entry data.', 'baselayer'),
				'hideLabel'         => __('Hide label', 'baselayer'),
				'fieldTabGeneral'   => __('General', 'baselayer'),
				'fieldTabAdvanced'  => __('Advanced', 'baselayer'),
				'fieldTabAppearance'=> __('Appearance', 'baselayer'),
				'fieldTabGeneralEmpty' => __('No general settings for this field.', 'baselayer'),
				'fieldTabAdvancedEmpty' => __('No advanced settings for this field.', 'baselayer'),
				'placeholder'       => __('Placeholder', 'baselayer'),
				'description'       => __('Description', 'baselayer'),
				'required'          => __('Required', 'baselayer'),
				'readOnly'          => __('Read only', 'baselayer'),
				'disabled'          => __('Disabled', 'baselayer'),
				'autocomplete'      => __('Autocomplete', 'baselayer'),
				'autocompleteAutomatic' => __('Automatic', 'baselayer'),
				'autocompleteOff'   => __('Off', 'baselayer'),
				'maxLength'         => __('Maximum length', 'baselayer'),
				'showCharCount'     => __('Show remaining characters', 'baselayer'),
				'textareaRows'      => __('Rows', 'baselayer'),
				'charCountText'     => __('Character count text', 'baselayer'),
				'charCountTextDefault' => __('%remaining% characters remaining', 'baselayer'),
				'charCountTextHelp' => __('Use %remaining%, %count%, and %max% as placeholders.', 'baselayer'),
				'charCountEmptyText'=> __('When limit is reached', 'baselayer'),
				'charCountEmptyDefault' => __('No characters remaining', 'baselayer'),
				'minValue'          => __('Minimum', 'baselayer'),
				'maxValue'          => __('Maximum', 'baselayer'),
				'boundNone'         => __('No limit', 'baselayer'),
				'boundFixedDate'    => __('Fixed date', 'baselayer'),
				'boundFixedTime'    => __('Fixed time', 'baselayer'),
				'boundFixedDatetime'=> __('Fixed date & time', 'baselayer'),
				'boundToday'        => __('Today', 'baselayer'),
				'boundNow'          => __('Now', 'baselayer'),
				'boundCurrentHour'  => __('Current hour', 'baselayer'),
				'boundTodayOffset'  => __('Days relative to today', 'baselayer'),
				'boundNowOffset'    => __('Minutes relative to now', 'baselayer'),
				'boundTodayPlus'    => __('Today ±', 'baselayer'),
				'boundNowPlus'      => __('Now ±', 'baselayer'),
				'boundDays'         => __('days', 'baselayer'),
				'boundMinutes'      => __('minutes', 'baselayer'),
				'allowMultiple'     => __('Allow multiple', 'baselayer'),
				'selectMultiple'    => __('Allow multiple selection', 'baselayer'),
				'buttonGroupMultiple' => __('Allow multiple selection', 'baselayer'),
				'defaultValue'      => __('Default value', 'baselayer'),
				'defaultNone'       => __('None', 'baselayer'),
				'defaultChecked'    => __('Checked by default', 'baselayer'),
				'defaultValueOptionsHelp' => __('Use option slugs from the list above. For multiple values, separate with commas (e.g. option-1, option-2).', 'baselayer'),
				'spacerHeight'      => __('Height', 'baselayer'),
				'spacerHeightCustomPlaceholder' => __('e.g. 24px or 2rem', 'baselayer'),
				'dividerMargin'     => __('Margin', 'baselayer'),
				'dividerMarginCustomPlaceholder' => __('e.g. 24px or 2rem', 'baselayer'),
				'headingLevel'      => __('Level', 'baselayer'),
				'honeypotHelp'      => __('Hidden from visitors. If filled, the submission is treated as spam.', 'baselayer'),
				'captchaHelp'       => __('Choose a CAPTCHA service and enter your keys.', 'baselayer'),
				'captchaService'    => __('CAPTCHA service', 'baselayer'),
				'captchaSiteKey'    => __('Site key', 'baselayer'),
				'captchaSecretKey'  => __('Secret key', 'baselayer'),
				'captchaApiKey'     => __('API key', 'baselayer'),
				'captchaTurnstile'  => __('Cloudflare Turnstile', 'baselayer'),
				'captchaTurnstileHelp' => __('Mostly invisible. Excellent privacy and very easy to set up.', 'baselayer'),
				'captchaHcaptcha'   => __('hCaptcha', 'baselayer'),
				'captchaHcaptchaHelp' => __('Good privacy and UX. Very easy to set up.', 'baselayer'),
				'captchaFriendly'   => __('Friendly Captcha', 'baselayer'),
				'captchaFriendlyHelp' => __('Excellent privacy and accessibility. Easy to set up.', 'baselayer'),
				'captchaRecaptcha'  => __('Google reCAPTCHA v2', 'baselayer'),
				'captchaRecaptchaHelp' => __('Familiar checkbox challenge. Weaker privacy. Very easy to set up.', 'baselayer'),
				'termsDefaultLabel' => __('I agree to the [Privacy Policy](page:privacy).', 'baselayer'),
				'termsDefaultFieldLabel' => __('Privacy Policy', 'baselayer'),
				'checkboxText'      => __('Checkbox text', 'baselayer'),
				'checkboxTextHelp'  => __("You can insert links using Markdown:\n[Privacy Policy](page:privacy)\n[Imprint](page:123)\n[AGB](/abg)", 'baselayer'),
				'content'           => __('Content', 'baselayer'),
				'htmlContent'       => __('HTML', 'baselayer'),
				'options'           => __('Options', 'baselayer'),
				'choices'           => __('Choices', 'baselayer'),
				'addOption'         => __('Add option', 'baselayer'),
				'optionLabel'       => __('Label', 'baselayer'),
				'optionSlug'        => __('Slug', 'baselayer'),
				'optionValue'       => __('Slug', 'baselayer'),
				'optionOne'         => __('Option 1', 'baselayer'),
				'optionTwo'         => __('Option 2', 'baselayer'),
				'delete'            => __('Delete', 'baselayer'),
				'editField'         => __('Edit field', 'baselayer'),
				'doneEditing'       => __('Done editing', 'baselayer'),
				'expandField'       => __('Expand field', 'baselayer'),
				'collapseField'     => __('Collapse field', 'baselayer'),
				'dragField'         => __('Drag to reorder', 'baselayer'),
				'type'              => __('Type', 'baselayer'),
				'width'             => __('Width', 'baselayer'),
				'widthCustom'       => __('Custom', 'baselayer'),
				'widthCustomPlaceholder' => __('e.g. 40% or 280px', 'baselayer'),
				'layout'            => __('Layout', 'baselayer'),
				'layoutVertical'    => __('Vertical', 'baselayer'),
				'layoutHorizontal'  => __('Horizontal', 'baselayer'),
				'cssClass'          => __('CSS class', 'baselayer'),
				'cssClassPlaceholder' => __('e.g. my-field', 'baselayer'),
				'cssClassHelp'      => __('Optional class names added to this field’s wrapper.', 'baselayer'),
				'submitLabel'       => __('Submit button label', 'baselayer'),
				'recipient'         => __('Recipient', 'baselayer'),
				'recipientHelp'     => __('Leave empty to use the site administrator email.', 'baselayer'),
				'successMessage'    => __('Success message', 'baselayer'),
				'errorMessage'      => __('Error message', 'baselayer'),
				'validationMessage' => __('Validation message', 'baselayer'),
				'fieldErrors'       => __('Field errors', 'baselayer'),
				'requiredError'     => __('Required', 'baselayer'),
				'invalidError'      => __('Invalid', 'baselayer'),
				'minError'          => __('Minimum', 'baselayer'),
				'maxError'          => __('Maximum', 'baselayer'),
				'minMaxMessageHelp' => __('Use %s where the limit should appear.', 'baselayer'),
				'numberError'       => __('Number', 'baselayer'),
				'emailError'        => __('Email', 'baselayer'),
				'urlError'          => __('URL', 'baselayer'),
				'phoneError'        => __('Phone', 'baselayer'),
				'dateError'         => __('Date', 'baselayer'),
				'dateBeforeError'   => __('Before related field', 'baselayer'),
				'dateAfterError'    => __('After related field', 'baselayer'),
				'dateRelationMessageHelp' => __('Use %s where the related field label should appear.', 'baselayer'),
				'dateRelation'      => __('Relation', 'baselayer'),
				'dateRelationNone'  => __('No relation', 'baselayer'),
				'dateRelationBefore'=> __('Must be before', 'baselayer'),
				'dateRelationAfter' => __('Must be after', 'baselayer'),
				'dateRelationSelect'=> __('Select field', 'baselayer'),
				'timeError'         => __('Time', 'baselayer'),
				'datetimeError'     => __('Date & time', 'baselayer'),
				'fileError'         => __('File', 'baselayer'),
				'optionError'       => __('Choice', 'baselayer'),
				'uploadTexts'       => __('File upload', 'baselayer'),
				'uploadButtonText'  => __('Button label', 'baselayer'),
				'uploadEmptyText'   => __('Empty text', 'baselayer'),
				'uploadDropText'    => __('Drop hint', 'baselayer'),
				'uploadRemoveText'  => __('Remove label', 'baselayer'),
				'allowedExtensions' => __('Allowed extensions', 'baselayer'),
				'allowedExtensionsHelp' => __('Comma-separated list without dots, e.g. pdf, docx, xlsx. Leave empty to allow all WordPress-permitted types.', 'baselayer'),
				'showUploadPreview' => __('Show file preview', 'baselayer'),
				'afterSubmit'       => __('After submission', 'baselayer'),
				'afterSubmitHelp'   => __('Choose what visitors see after a successful submission.', 'baselayer'),
				'afterSubmitMessage'=> __('Show message', 'baselayer'),
				'afterSubmitRedirect' => __('Go to page', 'baselayer'),
				'choosePage'        => __('Choose page', 'baselayer'),
				'changePage'        => __('Change page', 'baselayer'),
				'clearPage'         => __('Clear', 'baselayer'),
				'choosePageHelp'    => __('Select the page visitors should land on.', 'baselayer'),
				'selectedPage'      => __('Selected page', 'baselayer'),
				'pagePickerTitle'   => __('Select a page', 'baselayer'),
				'pagePickerSearch'  => __('Search pages…', 'baselayer'),
				'pagePickerEmpty'   => __('No pages found.', 'baselayer'),
				'pagePickerLoading' => __('Loading…', 'baselayer'),
				'selectPage'        => __('Select', 'baselayer'),
				'confirmationEmail' => __('Confirmation email', 'baselayer'),
				'notifyUser'        => __('Enable', 'baselayer'),
				'notifyUserHelp'    => __('Requires an Email field on the form.', 'baselayer'),
				'emailField'        => __('Email field', 'baselayer'),
				'subject'           => __('Subject', 'baselayer'),
				'introText'         => __('Intro text', 'baselayer'),
				'introTextHelp'     => __('This text appears above the submitted form data in the email. Placeholders can be used [field-id].', 'baselayer'),
				'securityCsrf'      => __('CSRF protection', 'baselayer'),
				'securityCsrfHelp'  => __('A WordPress nonce is verified on every submission to block forged requests.', 'baselayer'),
				'securityAlwaysOn'  => __('Always on', 'baselayer'),
				'securityRecommended' => __('Recommended', 'baselayer'),
				'securityJsCheck'   => __('JavaScript check', 'baselayer'),
				'securityJsCheckHelp' => __('A hidden field is set by JavaScript. If the expected value is missing, the submission is discarded.', 'baselayer'),
				'securityHoneypot'  => __('Honeypot field', 'baselayer'),
				'securityHoneypotHelp' => __('A field hidden from visitors detects simple bots. If it is filled, the submission is discarded.', 'baselayer'),
				'securityHoneypotName' => __('Field name', 'baselayer'),
				'securityMinFillTime' => __('Minimum fill time', 'baselayer'),
				'securityMinFillTimeHelp' => __('Submissions are rejected when the form is sent unusually quickly.', 'baselayer'),
				'securityMinFillTimeAtLeast' => __('At least', 'baselayer'),
				'securityMinFillTimeSeconds' => __('seconds', 'baselayer'),
				'securityRateLimit' => __('Submission limit', 'baselayer'),
				'securityRateLimitHelp' => __('Limits how often the same visitor can submit the form within a time period.', 'baselayer'),
				'securityRateLimitMax' => __('Max', 'baselayer'),
				'securityRateLimitIn' => __('submissions in', 'baselayer'),
				'securityRateLimitMinutes' => __('minutes', 'baselayer'),
				'types'             => [
					'text'         => __('Text', 'baselayer'),
					'email'        => __('Email', 'baselayer'),
					'url'          => __('URL', 'baselayer'),
					'number'       => __('Number', 'baselayer'),
					'phone'        => __('Phone', 'baselayer'),
					'textarea'     => __('Textarea', 'baselayer'),
					'radio'        => __('Radio Buttons', 'baselayer'),
					'checkboxes'   => __('Checkboxes', 'baselayer'),
					'select'       => __('Select', 'baselayer'),
					'toggle'       => __('Toggle', 'baselayer'),
					'button_group' => __('Button Group', 'baselayer'),
					'terms'        => __('Consent', 'baselayer'),
					'date'         => __('Date', 'baselayer'),
					'time'         => __('Time', 'baselayer'),
					'datetime'     => __('Date & Time', 'baselayer'),
					'file'         => __('File Upload', 'baselayer'),
					'image'        => __('Image Upload', 'baselayer'),
					'heading'      => __('Heading', 'baselayer'),
					'text_block'   => __('Text', 'baselayer'),
					'html'         => __('HTML', 'baselayer'),
					'divider'      => __('Divider', 'baselayer'),
					'spacer'       => __('Spacer', 'baselayer'),
					'column'       => __('Columns', 'baselayer'),
					'section'      => __('Section', 'baselayer'),
					'hidden'       => __('Hidden', 'baselayer'),
					'honeypot'     => __('Honeypot', 'baselayer'),
					'captcha'      => __('CAPTCHA', 'baselayer'),
				],
			],
		]);
	}
}
add_action('admin_enqueue_scripts', 'bl_forms_admin_enqueue');

/**
 * Disable block editor for forms/entries (classic meta boxes).
 */
function bl_forms_use_classic_editor(bool $use_block_editor, string $post_type): bool
{
	if (in_array($post_type, [BL_FORM_POST_TYPE, BL_FORM_ENTRY_POST_TYPE], true)) {
		return false;
	}

	return $use_block_editor;
}
add_filter('use_block_editor_for_post_type', 'bl_forms_use_classic_editor', 10, 2);
