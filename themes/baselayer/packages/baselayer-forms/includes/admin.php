<?php

defined('ABSPATH') || exit;

/**
 * Strip unused meta boxes on the form edit screen.
 * Builder is rendered outside a postbox (see edit_form_after_title).
 */
function bl_forms_admin_meta_boxes(): void
{
	remove_meta_box('slugdiv', BL_FORM_POST_TYPE, 'normal');

	if (!bl_forms_user_can_manage()) {
		return;
	}

	add_meta_box(
		'bl_forms_tools',
		__('Tools', 'baselayer-forms'),
		'bl_forms_render_tools_metabox',
		BL_FORM_POST_TYPE,
		'side',
		'default'
	);
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
			__('Form #%d', 'baselayer-forms'),
			(int) $post->ID
		);
	}
	$default_admin_subject = sprintf(
		/* translators: 1: site name, 2: form title */
		__('[%1$s] New submission: %2$s', 'baselayer-forms'),
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
 * Tools metabox (import/export) under Publish.
 */
function bl_forms_render_tools_metabox(WP_Post $post): void
{
	?>
	<div class="bl-forms-tools">
		<div class="bl-forms-tools__actions">
			<button type="button" class="button -small" data-bl-forms-export><?= esc_html__('Export', 'baselayer-forms') ?></button>
			<button type="button" class="button -small" data-bl-forms-import><?= esc_html__('Import', 'baselayer-forms') ?></button>
		</div>
	</div>
	<?php
}

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
		'inactive'     => 'visibility-off',
	];

	$icons = [];
	foreach ($map as $key => $icon_name) {
		$svg = bl_forms_svg_code($icon_name, [
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
			'wpMaxUploadSize' => size_format(wp_max_upload_size()),
			'i18n' => [
				'tabFields'         => __('Fields', 'baselayer-forms'),
				'tabNotifications'  => __('Notifications', 'baselayer-forms'),
				'tabSettings'       => __('Settings', 'baselayer-forms'),
				'tabValidation'     => __('Validation', 'baselayer-forms'),
				'tabSecurity'       => __('Security', 'baselayer-forms'),
				'paletteSearch'     => __('Search fields…', 'baselayer-forms'),
				'paletteSearchEmpty'=> __('No fields match your search.', 'baselayer-forms'),
				'paletteHide'       => __('Hide field templates', 'baselayer-forms'),
				'paletteShow'       => __('Show field templates', 'baselayer-forms'),
				'paletteSectionPopular' => __('Popular', 'baselayer-forms'),
				'paletteSectionInput' => __('Input', 'baselayer-forms'),
				'paletteSectionChoice' => __('Choice', 'baselayer-forms'),
				'paletteSectionDatetime' => __('Date & time', 'baselayer-forms'),
				'paletteSectionFiles' => __('Uploads', 'baselayer-forms'),
				'paletteSectionLayout' => __('Layout', 'baselayer-forms'),
				'paletteSectionContent' => __('Content', 'baselayer-forms'),
				'paletteSectionAdvanced' => __('Advanced', 'baselayer-forms'),
				'paletteAdd'        => __('Add field', 'baselayer-forms'),
				'canvasHeading'     => __('Form', 'baselayer-forms'),
				'empty'             => __('Drag a field here, or click a template to add it.', 'baselayer-forms'),
				'columnEmpty'       => __('Drop fields here', 'baselayer-forms'),
				'columnType'        => __('Columns', 'baselayer-forms'),
				'columnWidthTitle'  => __('Column width', 'baselayer-forms'),
				'sectionWidthTitle' => __('Section width', 'baselayer-forms'),
				'sectionDesignTitle' => __('Section design', 'baselayer-forms'),
				'sectionDesignStandard' => __('Standard', 'baselayer-forms'),
				'sectionDesignOutline' => __('Outline', 'baselayer-forms'),
				'sectionDesignCard' => __('Card', 'baselayer-forms'),
				'sectionType'       => __('Section', 'baselayer-forms'),
				'sectionLabel'      => __('Section title', 'baselayer-forms'),
				'sectionLabelPlaceholder' => __('Section title', 'baselayer-forms'),
				'sectionEmpty'      => __('Drop fields here', 'baselayer-forms'),
				'widthAuto'         => __('Auto', 'baselayer-forms'),
				'cancel'            => __('Cancel', 'baselayer-forms'),
				'apply'             => __('Apply', 'baselayer-forms'),
				'tools'             => __('Tools', 'baselayer-forms'),
				'export'            => __('Export', 'baselayer-forms'),
				'import'            => __('Import', 'baselayer-forms'),
				'importOverwriteTitle' => __('Import fields?', 'baselayer-forms'),
				'importOverwriteMessage' => __('Importing will overwrite all existing fields on this form. Settings (emails, messages, security) are not changed. This cannot be undone until you save or discard.', 'baselayer-forms'),
				'importOverwriteConfirm' => __('Overwrite fields', 'baselayer-forms'),
				'importInvalid'     => __('This file is not a valid form fields export.', 'baselayer-forms'),
				'importReadError'   => __('Could not read the selected file.', 'baselayer-forms'),
				'label'             => __('Label', 'baselayer-forms'),
				'name'              => __('Field name', 'baselayer-forms'),
				'nameHelp'          => __('Internal field key used in submissions, emails, and entry data.', 'baselayer-forms'),
				'hideLabel'         => __('Hide label', 'baselayer-forms'),
				'fieldTabGeneral'   => __('General', 'baselayer-forms'),
				'fieldTabAdvanced'  => __('Advanced', 'baselayer-forms'),
				'fieldTabAppearance'=> __('Appearance', 'baselayer-forms'),
				'fieldTabGeneralEmpty' => __('No general settings for this field.', 'baselayer-forms'),
				'fieldTabAdvancedEmpty' => __('No advanced settings for this field.', 'baselayer-forms'),
				'placeholder'       => __('Placeholder', 'baselayer-forms'),
				'description'       => __('Description', 'baselayer-forms'),
				'required'          => __('Required', 'baselayer-forms'),
				'readOnly'          => __('Read only', 'baselayer-forms'),
				'disabled'          => __('Disabled', 'baselayer-forms'),
				'autocomplete'      => __('Autocomplete', 'baselayer-forms'),
				'autocompleteAutomatic' => __('Automatic', 'baselayer-forms'),
				'autocompleteOff'   => __('Off', 'baselayer-forms'),
				'maxLength'         => __('Maximum length', 'baselayer-forms'),
				'showCharCount'     => __('Show remaining characters', 'baselayer-forms'),
				'textareaRows'      => __('Rows', 'baselayer-forms'),
				'charCountText'     => __('Character count text', 'baselayer-forms'),
				'charCountTextDefault' => __('%remaining% characters remaining', 'baselayer-forms'),
				'charCountTextHelp' => __('The placeholders %remaining%, %count%, and %max% are replaced by the remaining count, current count, and maximum.', 'baselayer-forms'),
				'charCountSection'  => __('Character count', 'baselayer-forms'),
				'charCountEmptyText'=> __('When limit is reached', 'baselayer-forms'),
				'charCountEmptyDefault' => __('No characters remaining', 'baselayer-forms'),
				'minValue'          => __('Minimum', 'baselayer-forms'),
				'maxValue'          => __('Maximum', 'baselayer-forms'),
				'prefix'            => __('Prefix', 'baselayer-forms'),
				'suffix'            => __('Suffix', 'baselayer-forms'),
				'boundNone'         => __('No limit', 'baselayer-forms'),
				'boundFixedDate'    => __('Fixed date', 'baselayer-forms'),
				'boundFixedTime'    => __('Fixed time', 'baselayer-forms'),
				'boundFixedDatetime'=> __('Fixed date & time', 'baselayer-forms'),
				'boundToday'        => __('Today', 'baselayer-forms'),
				'boundNow'          => __('Now', 'baselayer-forms'),
				'boundCurrentHour'  => __('Current hour', 'baselayer-forms'),
				'boundTodayOffset'  => __('Days relative to today', 'baselayer-forms'),
				'boundNowOffset'    => __('Minutes relative to now', 'baselayer-forms'),
				'boundTodayPlus'    => __('Today ±', 'baselayer-forms'),
				'boundNowPlus'      => __('Now ±', 'baselayer-forms'),
				'boundDays'         => __('days', 'baselayer-forms'),
				'boundMinutes'      => __('minutes', 'baselayer-forms'),
				'allowMultiple'     => __('Allow multiple', 'baselayer-forms'),
				'allowMultipleFiles'=> __('Allow multiple files', 'baselayer-forms'),
				'fieldStatus'       => __('Status', 'baselayer-forms'),
				'fieldActive'       => __('Active', 'baselayer-forms'),
				'fieldInactiveTitle'=> __('Not visible on the frontend', 'baselayer-forms'),
				'fieldActivateTitle'=> __('Show on the frontend', 'baselayer-forms'),
				'selectMultiple'    => __('Allow multiple selection', 'baselayer-forms'),
				'buttonGroupMultiple' => __('Allow multiple selection', 'baselayer-forms'),
				'defaultValue'      => __('Default value', 'baselayer-forms'),
				'defaultNone'       => __('None', 'baselayer-forms'),
				'defaultChecked'    => __('Checked by default', 'baselayer-forms'),
				'defaultValueOptionsHelp' => __('Use option slugs from the list above. For multiple values, separate with commas (e.g. option-1, option-2).', 'baselayer-forms'),
				'spacerHeight'      => __('Height', 'baselayer-forms'),
				'spacerHeightCustomPlaceholder' => __('e.g. 24px or 2rem', 'baselayer-forms'),
				'dividerMargin'     => __('Margin', 'baselayer-forms'),
				'dividerMarginCustomPlaceholder' => __('e.g. 24px or 2rem', 'baselayer-forms'),
				'headingLevel'      => __('Level', 'baselayer-forms'),
				'honeypotHelp'      => __('Hidden from visitors. If filled, the submission is treated as spam.', 'baselayer-forms'),
				'captchaHelp'       => __('Choose a CAPTCHA service and enter your keys.', 'baselayer-forms'),
				'captchaService'    => __('CAPTCHA service', 'baselayer-forms'),
				'captchaSiteKey'    => __('Site key', 'baselayer-forms'),
				'captchaSecretKey'  => __('Secret key', 'baselayer-forms'),
				'captchaApiKey'     => __('API key', 'baselayer-forms'),
				'captchaTurnstile'  => __('Cloudflare Turnstile', 'baselayer-forms'),
				'captchaTurnstileHelp' => __('Mostly invisible. Excellent privacy and very easy to set up.', 'baselayer-forms'),
				'captchaHcaptcha'   => __('hCaptcha', 'baselayer-forms'),
				'captchaHcaptchaHelp' => __('Good privacy and UX. Very easy to set up.', 'baselayer-forms'),
				'captchaFriendly'   => __('Friendly Captcha', 'baselayer-forms'),
				'captchaFriendlyHelp' => __('Excellent privacy and accessibility. Easy to set up.', 'baselayer-forms'),
				'captchaRecaptcha'  => __('Google reCAPTCHA v2', 'baselayer-forms'),
				'captchaRecaptchaHelp' => __('Familiar checkbox challenge. Weaker privacy. Very easy to set up.', 'baselayer-forms'),
				'termsDefaultLabel' => __('I agree to the [Privacy Policy](page:privacy).', 'baselayer-forms'),
				'termsDefaultFieldLabel' => __('Privacy Policy', 'baselayer-forms'),
				'checkboxText'      => __('Checkbox text', 'baselayer-forms'),
				'checkboxTextHelp'  => __("You can insert links using Markdown:\n[Privacy Policy](page:privacy)\n[Imprint](page:123)\n[AGB](/abg)", 'baselayer-forms'),
				'content'           => __('Content', 'baselayer-forms'),
				'htmlContent'       => __('HTML', 'baselayer-forms'),
				'options'           => __('Options', 'baselayer-forms'),
				'choices'           => __('Choices', 'baselayer-forms'),
				'addOption'         => __('Add option', 'baselayer-forms'),
				'optionLabel'       => __('Label', 'baselayer-forms'),
				'optionSlug'        => __('Slug', 'baselayer-forms'),
				'optionValue'       => __('Slug', 'baselayer-forms'),
				'optionOne'         => __('Option 1', 'baselayer-forms'),
				'optionTwo'         => __('Option 2', 'baselayer-forms'),
				'delete'            => __('Delete', 'baselayer-forms'),
				'editField'         => __('Edit field', 'baselayer-forms'),
				'doneEditing'       => __('Done editing', 'baselayer-forms'),
				'expandField'       => __('Expand field', 'baselayer-forms'),
				'collapseField'     => __('Collapse field', 'baselayer-forms'),
				'dragField'         => __('Drag to reorder', 'baselayer-forms'),
				'type'              => __('Type', 'baselayer-forms'),
				'width'             => __('Width', 'baselayer-forms'),
				'widthCustom'       => __('Custom', 'baselayer-forms'),
				'widthCustomPlaceholder' => __('e.g. 40% or 280px', 'baselayer-forms'),
				'layout'            => __('Layout', 'baselayer-forms'),
				'layoutVertical'    => __('Vertical', 'baselayer-forms'),
				'layoutHorizontal'  => __('Horizontal', 'baselayer-forms'),
				'cssClass'          => __('CSS class', 'baselayer-forms'),
				'cssClassPlaceholder' => __('e.g. my-field', 'baselayer-forms'),
				'cssClassHelp'      => __('Optional class names added to this field’s wrapper.', 'baselayer-forms'),
				'submitLabel'       => __('Submit button label', 'baselayer-forms'),
				'recipient'         => __('Recipient', 'baselayer-forms'),
				'recipientHelp'     => __('One email per line. Leave empty to use the site administrator email.', 'baselayer-forms'),
				'successMessage'    => __('Success message', 'baselayer-forms'),
				'errorMessage'      => __('Error message', 'baselayer-forms'),
				'validationMessage' => __('Validation message', 'baselayer-forms'),
				'requiredError'     => __('Required', 'baselayer-forms'),
				'invalidError'      => __('Invalid', 'baselayer-forms'),
				'minError'          => __('Minimum', 'baselayer-forms'),
				'maxError'          => __('Maximum', 'baselayer-forms'),
				'minMaxMessageHelp' => __('The placeholder %s is replaced by the limit.', 'baselayer-forms'),
				'numberError'       => __('Number', 'baselayer-forms'),
				'emailError'        => __('Email', 'baselayer-forms'),
				'urlError'          => __('URL', 'baselayer-forms'),
				'phoneError'        => __('Phone', 'baselayer-forms'),
				'dateError'         => __('Date', 'baselayer-forms'),
				'dateBeforeError'   => __('Before related field', 'baselayer-forms'),
				'dateAfterError'    => __('After related field', 'baselayer-forms'),
				'dateRelationMessageHelp' => __('The placeholder %s is replaced by the related field label.', 'baselayer-forms'),
				'dateRelation'      => __('Relation', 'baselayer-forms'),
				'dateRelationNone'  => __('No relation', 'baselayer-forms'),
				'dateRelationBefore'=> __('Must be before', 'baselayer-forms'),
				'dateRelationAfter' => __('Must be after', 'baselayer-forms'),
				'dateRelationSelect'=> __('Select field', 'baselayer-forms'),
				'timeError'         => __('Time', 'baselayer-forms'),
				'datetimeError'     => __('Date & time', 'baselayer-forms'),
				'fileError'         => __('File', 'baselayer-forms'),
				'fileTypeError'     => __('Wrong file type', 'baselayer-forms'),
				'fileTypeErrorHelp' => __('The placeholder %s is replaced by the allowed file types.', 'baselayer-forms'),
				'fileSizeError'     => __('File too large', 'baselayer-forms'),
				'fileSizeErrorHelp' => __('The placeholder %s is replaced by the maximum size.', 'baselayer-forms'),
				'fileMaxError'      => __('Too many files', 'baselayer-forms'),
				'fileMaxErrorHelp'  => __('The placeholder %s is replaced by the maximum number of files.', 'baselayer-forms'),
				'optionError'       => __('Choice', 'baselayer-forms'),
				'uploadButtonText'  => __('Button label', 'baselayer-forms'),
				'allowedExtensions' => __('Allowed extensions', 'baselayer-forms'),
				'allowedExtensionsHelp' => __('Comma-separated list without dots, e.g. pdf, docx, xlsx. Leave empty to allow all WordPress-permitted types.', 'baselayer-forms'),
				'maxFiles'          => __('Maximum files', 'baselayer-forms'),
				'maxFilesHelp'      => __('Maximum number of files visitors can upload.', 'baselayer-forms'),
				'showUploadPreview' => __('Show file preview', 'baselayer-forms'),
				'uploadStyle'       => __('Style', 'baselayer-forms'),
				'uploadStyleModern' => __('Modern', 'baselayer-forms'),
				'uploadStyleClassic'=> __('Classic', 'baselayer-forms'),
				'fileSettings'      => __('File settings', 'baselayer-forms'),
				'uploadMaxSize'     => __('Maximum file size', 'baselayer-forms'),
				'uploadMaxSizeUnit' => __('MB', 'baselayer-forms'),
				/* translators: %s: server max upload size, e.g. "64 MB" */
				'uploadMaxSizeHelp' => __('Leave empty to use the server limit (%s).', 'baselayer-forms'),
				'uploadMaxSizeHelpEmpty' => __('Leave empty to use the server limit.', 'baselayer-forms'),
				'afterSubmit'       => __('After submission', 'baselayer-forms'),
				'afterSubmitMessage'=> __('Show success message', 'baselayer-forms'),
				'afterSubmitRedirect' => __('Go to page', 'baselayer-forms'),
				'choosePage'        => __('Choose page', 'baselayer-forms'),
				'changePage'        => __('Change page', 'baselayer-forms'),
				'clearPage'         => __('Clear', 'baselayer-forms'),
				'choosePageHelp'    => __('Select the page visitors should land on.', 'baselayer-forms'),
				'selectedPage'      => __('Selected page', 'baselayer-forms'),
				'pagePickerTitle'   => __('Select a page', 'baselayer-forms'),
				'pagePickerSearch'  => __('Search pages…', 'baselayer-forms'),
				'pagePickerEmpty'   => __('No pages found.', 'baselayer-forms'),
				'pagePickerLoading' => __('Loading…', 'baselayer-forms'),
				'selectPage'        => __('Select', 'baselayer-forms'),
				'confirmationEmail' => __('Confirmation email', 'baselayer-forms'),
				'notifyUser'        => __('Enable', 'baselayer-forms'),
				'notifyUserHelp'    => __('Requires an Email field on the form.', 'baselayer-forms'),
				'emailField'        => __('Email field', 'baselayer-forms'),
				'subject'           => __('Subject', 'baselayer-forms'),
				'introText'         => __('Intro text', 'baselayer-forms'),
				'introTextHelp'     => __('This text appears above the submitted form data in the email. Placeholders can be used [field-id].', 'baselayer-forms'),
				'securityCsrf'      => __('CSRF protection', 'baselayer-forms'),
				'securityCsrfHelp'  => __('A WordPress nonce is verified on every submission to block forged requests.', 'baselayer-forms'),
				'securityAlwaysOn'  => __('Always on', 'baselayer-forms'),
				'securityRecommended' => __('Recommended', 'baselayer-forms'),
				'securityJsCheck'   => __('JavaScript check', 'baselayer-forms'),
				'securityJsCheckHelp' => __('A hidden field is set by JavaScript. If the expected value is missing, the submission is discarded.', 'baselayer-forms'),
				'securityHoneypot'  => __('Honeypot field', 'baselayer-forms'),
				'securityHoneypotHelp' => __('A field hidden from visitors detects simple bots. If it is filled, the submission is discarded.', 'baselayer-forms'),
				'securityHoneypotName' => __('Field name', 'baselayer-forms'),
				'securityMinFillTime' => __('Minimum fill time', 'baselayer-forms'),
				'securityMinFillTimeHelp' => __('Submissions are rejected when the form is sent unusually quickly.', 'baselayer-forms'),
				'securityMinFillTimeAtLeast' => __('At least', 'baselayer-forms'),
				'securityMinFillTimeSeconds' => __('seconds', 'baselayer-forms'),
				'securityRateLimit' => __('Submission limit', 'baselayer-forms'),
				'securityRateLimitHelp' => __('Limits how often the same visitor can submit the form within a time period.', 'baselayer-forms'),
				'securityRateLimitMax' => __('Max', 'baselayer-forms'),
				'securityRateLimitIn' => __('submissions in', 'baselayer-forms'),
				'securityRateLimitMinutes' => __('minutes', 'baselayer-forms'),
				'types'             => [
					'text'         => __('Text', 'baselayer-forms'),
					'email'        => __('Email', 'baselayer-forms'),
					'url'          => __('URL', 'baselayer-forms'),
					'number'       => __('Number', 'baselayer-forms'),
					'phone'        => __('Phone', 'baselayer-forms'),
					'textarea'     => __('Textarea', 'baselayer-forms'),
					'radio'        => __('Radio Buttons', 'baselayer-forms'),
					'checkboxes'   => __('Checkboxes', 'baselayer-forms'),
					'select'       => __('Select', 'baselayer-forms'),
					'toggle'       => __('Toggle', 'baselayer-forms'),
					'button_group' => __('Button Group', 'baselayer-forms'),
					'terms'        => __('Consent', 'baselayer-forms'),
					'date'         => __('Date', 'baselayer-forms'),
					'time'         => __('Time', 'baselayer-forms'),
					'datetime'     => __('Date & Time', 'baselayer-forms'),
					'file'         => __('File Upload', 'baselayer-forms'),
					'image'        => __('Image Upload', 'baselayer-forms'),
					'heading'      => __('Heading', 'baselayer-forms'),
					'text_block'   => __('Text', 'baselayer-forms'),
					'html'         => __('HTML', 'baselayer-forms'),
					'divider'      => __('Divider', 'baselayer-forms'),
					'spacer'       => __('Spacer', 'baselayer-forms'),
					'column'       => __('Columns', 'baselayer-forms'),
					'section'      => __('Section', 'baselayer-forms'),
					'hidden'       => __('Hidden', 'baselayer-forms'),
					'honeypot'     => __('Honeypot', 'baselayer-forms'),
					'captcha'      => __('CAPTCHA', 'baselayer-forms'),
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
