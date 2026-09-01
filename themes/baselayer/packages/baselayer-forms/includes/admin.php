<?php

defined('ABSPATH') || exit;

/**
 * Disable Quick Edit for forms (builder config is not inline-editable).
 */
function bl_forms_disable_quick_edit(bool $enable, string $post_type): bool
{
	if ($post_type === BL_FORM_POST_TYPE) {
		return false;
	}

	return $enable;
}
add_filter('quick_edit_enabled_for_post_type', 'bl_forms_disable_quick_edit', 10, 2);

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
		'low'
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
	$placeholders = bl_forms_form_message_placeholders();
	$global_admin_subject = bl_forms_resolve_setting_string([], 'admin_email_subject');
	$default_admin_subject = $global_admin_subject !== ''
		? $global_admin_subject
		: __('[{site_name}] New submission: {form_title}', 'baselayer-forms');
	$recipient_placeholder = bl_forms_resolve_setting_string([], 'recipient');
	if ($recipient_placeholder === '') {
		$recipient_placeholder = (string) get_option('admin_email', '');
	}
	$user_subject_placeholder = bl_forms_resolve_setting_string([], 'user_email_subject');
	if ($user_subject_placeholder === '') {
		$user_subject_placeholder = __('We received your message – {site_name}', 'baselayer-forms');
	}
	$user_title_placeholder = bl_forms_resolve_setting_string([], 'user_email_title');
	if ($user_title_placeholder === '') {
		$user_title_placeholder = __('Thank you', 'baselayer-forms');
	}
	$user_intro_placeholder = bl_forms_resolve_setting_string([], 'user_email_intro');
	if ($user_intro_placeholder === '') {
		$user_intro_placeholder = __('Thank you for your message. Here is a copy of what you sent:', 'baselayer-forms');
	}
	$user_footer_placeholder = bl_forms_resolve_setting_string([], 'user_email_footer');
	if ($user_footer_placeholder === '') {
		$user_footer_placeholder = __('You received this email because you submitted a form on {site_name}.', 'baselayer-forms');
	}
	wp_nonce_field('bl_forms_save_config', 'bl_forms_config_nonce');
	?>
	<input type="hidden" name="bl_forms_config_json" id="bl-forms-config-json" value="<?= esc_attr(wp_json_encode($config)) ?>">
	<div
		id="bl-forms-builder"
		class="bl-forms-builder"
		data-bl-forms-builder
		data-admin-email="<?= esc_attr($recipient_placeholder) ?>"
		data-fallback-admin-subject="<?= esc_attr($default_admin_subject) ?>"
		data-fallback-user-subject="<?= esc_attr($user_subject_placeholder) ?>"
		data-fallback-user-title="<?= esc_attr($user_title_placeholder) ?>"
		data-fallback-user-intro="<?= esc_attr($user_intro_placeholder) ?>"
		data-fallback-user-footer="<?= esc_attr($user_footer_placeholder) ?>"
		data-fallback-submit="<?= esc_attr($placeholders['submit']) ?>"
		data-fallback-submit-class="<?= esc_attr(bl_forms_resolve_setting_string([], 'submit_button_class')) ?>"
		data-fallback-success="<?= esc_attr($placeholders['success']) ?>"
		data-fallback-error="<?= esc_attr($placeholders['error']) ?>"
		data-fallback-validation="<?= esc_attr($placeholders['validation']) ?>"
		data-fallback-required="<?= esc_attr($placeholders['required']) ?>"
	>
		<div class="bl-forms-builder__skeleton" aria-hidden="true">
			<div class="bl-forms-builder__skeleton-tabs">
				<span class="bl-forms-builder__skeleton-tab"></span>
				<span class="bl-forms-builder__skeleton-tab"></span>
				<span class="bl-forms-builder__skeleton-tab"></span>
				<span class="bl-forms-builder__skeleton-tab"></span>
			</div>
			<div class="bl-forms-builder__skeleton-body"></div>
		</div>
	</div>
	<?php
}
add_action('edit_form_after_title', 'bl_forms_render_builder_after_title');

/**
 * Tools metabox (import/export + templates) under Publish.
 */
function bl_forms_render_tools_metabox(WP_Post $post): void
{
	?>
	<div class="bl-forms-tools">
		<div class="bl-forms-tools__section">
			<h3 class="bl-forms-tools__heading"><?= esc_html__('Export and Import', 'baselayer-forms') ?></h3>
			<p class="description bl-forms-tools__help">
				<?= esc_html__('Export the current form as JSON, or import a previously exported file.', 'baselayer-forms') ?>
			</p>
			<div class="bl-forms-tools__actions">
				<button type="button" class="button bl-button" data-bl-forms-export><?= esc_html__('Export', 'baselayer-forms') ?></button>
				<button type="button" class="button bl-button" data-bl-forms-import><?= esc_html__('Import', 'baselayer-forms') ?></button>
			</div>
		</div>
		<div class="bl-forms-tools__section">
			<h3 class="bl-forms-tools__heading"><?= esc_html__('Templates', 'baselayer-forms') ?></h3>
			<p class="description bl-forms-tools__help">
				<?= esc_html__('Start with a ready-made form layout and adjust it as needed.', 'baselayer-forms') ?>
			</p>
			<button type="button" class="button bl-button bl-forms-tools__browse" data-bl-forms-browse-templates>
				<?= esc_html__('Browse Templates', 'baselayer-forms') ?>
			</button>
		</div>
	</div>
	<?php
}

/**
 * Hint under the publish date: how to place the form on the site.
 */
function bl_forms_submitbox_placement_help(): void
{
	$screen = function_exists('get_current_screen') ? get_current_screen() : null;
	if (!$screen instanceof WP_Screen || $screen->post_type !== BL_FORM_POST_TYPE) {
		return;
	}

	$form_id = (int) get_the_ID();
	?>
	<div class="misc-pub-section bl-forms-submitbox-help">
		<?php
		if ($form_id > 0) {
			echo esc_html(
				sprintf(
					/* translators: %d: form post ID for bl_render_form() */
					__('Use the Form block to insert this form on your site, or call bl_render_form(%d) in PHP.', 'baselayer-forms'),
					$form_id
				)
			);
		} else {
			echo esc_html__('Use the Form block to insert this form on your site, or call bl_render_form(ID) in PHP.', 'baselayer-forms');
		}
		?>
	</div>
	<?php
}
add_action('post_submitbox_misc_actions', 'bl_forms_submitbox_placement_help');

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
 * Inline SVG icons for the form builder field palette / chrome.
 *
 * @return array<string, string> logical key => svg markup
 */
function bl_forms_palette_icons(): array
{
	$keys = [
		'text',
		'textarea',
		'email',
		'url',
		'number',
		'phone',
		'checkboxes',
		'radio',
		'select',
		'toggle',
		'button_group',
		'terms',
		'date',
		'time',
		'datetime',
		'file',
		'image',
		'heading',
		'text_block',
		'html',
		'divider',
		'spacer',
		'row_break',
		'column',
		'section',
		'tab',
		'repeater',
		'hidden',
		'honeypot',
		'captcha',
		'page',
		'link',
		'caret',

		'expandContent',
		'collapseContent',
		'edit',
		'done',
		'trash',
		'close',
		'duplicate',
		'drag',
		'lock',
		'shield',
		'design',
		'tune',
		'inactive',
		'fullscreen',
		'fullscreenExit',
	];

	$icons = [];
	foreach ($keys as $key) {
		$svg = bl_forms_svg_code($key, [
			'width'       => '16',
			'height'      => '16',
			'aria-hidden' => 'true',
			'focusable'   => 'false',
		]);
		if ($svg !== '') {
			$icons[$key] = $svg;
		}
	}

	return $icons;
}

/**
 * Enqueue shared canvas-builder kit (theme helper, else Forms vendor copy).
 */
function bl_forms_enqueue_builder_kit(): string
{
	$args = [
		'vendor_dir' => bl_forms_path('assets/vendor/canvas-builder'),
		'vendor_url' => bl_forms_url('assets/vendor/canvas-builder'),
	];

	if (function_exists('bl_canvas_builder_enqueue_kit')) {
		return bl_canvas_builder_enqueue_kit($args);
	}

	// Plugin-only fallback when theme helper is unavailable.
	$handle = 'baselayer-canvas-builder-admin';
	$debug = function_exists('bl_is_debug') && bl_is_debug();
	$base = $args['vendor_dir'];
	$uri = $args['vendor_url'];
	$enqueued = false;
	$name = 'canvas-builder-admin';

	foreach (['css', 'js'] as $type) {
		$candidates = $debug
			? [$name . '.' . $type, $name . '.min.' . $type]
			: [$name . '.min.' . $type, $name . '.' . $type];
		foreach ($candidates as $file) {
			$path = trailingslashit($base) . $file;
			if (!is_readable($path)) {
				continue;
			}
			$url = trailingslashit($uri) . $file;
			$ver = $debug ? (string) time() : (string) filemtime($path);
			if ($type === 'css') {
				wp_enqueue_style($handle, $url, [], $ver);
			} else {
				wp_enqueue_script($handle, $url, [], $ver, true);
			}
			$enqueued = true;
			break;
		}
	}

	return $enqueued ? $handle : '';
}

/**
 * Enqueue shared form-builder kit (theme helper, else Forms vendor copy).
 *
 * @param string[] $deps Style/script handles (typically canvas-builder).
 */
function bl_forms_enqueue_form_builder_kit(array $deps = []): string
{
	$args = [
		'vendor_dir' => bl_forms_path('assets/vendor/form-builder'),
		'vendor_url' => bl_forms_url('assets/vendor/form-builder'),
		'deps'       => $deps,
	];

	if (function_exists('bl_form_builder_enqueue_kit')) {
		return bl_form_builder_enqueue_kit($args);
	}

	$handle = 'baselayer-form-builder-admin';
	$debug = function_exists('bl_is_debug') && bl_is_debug();
	$base = $args['vendor_dir'];
	$uri = $args['vendor_url'];
	$enqueued = false;
	$name = 'form-builder-admin';

	foreach (['css', 'js'] as $type) {
		$candidates = $debug
			? [$name . '.' . $type, $name . '.min.' . $type]
			: [$name . '.min.' . $type, $name . '.' . $type];
		foreach ($candidates as $file) {
			$path = trailingslashit($base) . $file;
			if (!is_readable($path)) {
				continue;
			}
			$url = trailingslashit($uri) . $file;
			$ver = $debug ? (string) time() : (string) filemtime($path);
			if ($type === 'css') {
				wp_enqueue_style($handle, $url, $deps, $ver);
			} else {
				wp_enqueue_script($handle, $url, $deps, $ver, true);
			}
			$enqueued = true;
			break;
		}
	}

	return $enqueued ? $handle : '';
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

	if ($is_entry) {
		bl_forms_enqueue_style('bl-forms-admin', 'forms-admin');
	} elseif ($is_form_edit && !bl_forms_user_can_manage()) {
		bl_forms_enqueue_style('bl-forms-admin', 'forms-admin');
	}

	if ($is_form_edit && bl_forms_user_can_manage()) {
		$canvas_handle = bl_forms_enqueue_builder_kit();
		$form_builder_deps = $canvas_handle !== '' ? [$canvas_handle] : [];
		$form_builder_handle = bl_forms_enqueue_form_builder_kit($form_builder_deps);

		$style_deps = $form_builder_handle !== '' ? [$form_builder_handle] : ($canvas_handle !== '' ? [$canvas_handle] : []);
		bl_forms_enqueue_style('bl-forms-admin', 'forms-admin', $style_deps);

		$deps = [];
		if ($form_builder_handle !== '') {
			$deps[] = $form_builder_handle;
		} elseif ($canvas_handle !== '') {
			$deps[] = $canvas_handle;
		}
		bl_forms_enqueue_script('bl-forms-admin', 'forms-admin', $deps, true);
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
			'pickerPostTypes' => function_exists('bl_page_picker_post_types') ? bl_page_picker_post_types() : [],
			'restNonce' => wp_create_nonce('wp_rest'),
			'redirectPage' => $redirect_page,
			'messageFallbacks' => bl_forms_form_message_placeholders(),
			'wpMaxUploadSize' => size_format(wp_max_upload_size()),
			'uploadMaxSizeMb' => (string) (bl_forms_get_global_settings()['upload_max_size_mb'] ?? ''),
			'allowSaveUploads' => bl_forms_allow_save_uploads(),
			'captchaConfigured' => (static function (): bool {
				$creds = bl_forms_captcha_credentials();
				return $creds['site_key'] !== '' && $creds['secret_key'] !== '';
			})(),
			'settingsUrl' => esc_url(bl_forms_settings_url()),
			'captchaSettingsUrl' => esc_url(bl_forms_settings_url('captcha')),
			'uploadsSettingsUrl' => esc_url(bl_forms_settings_url('uploads')),
			'messagesSettingsUrl' => esc_url(bl_forms_settings_url('messages')),
			'i18n' => [
				'tabFields'         => __('Fields', 'baselayer-forms'),
				'tabNotifications'  => __('Notifications', 'baselayer-forms'),
				'tabSettings'       => __('Settings', 'baselayer-forms'),
				'tabValidation'     => __('Validation', 'baselayer-forms'),
				'validationPanelHelp' => __('These settings apply to this form only.', 'baselayer-forms'),
				'validationPanelHelpGlobal' => __('You can also set them globally in', 'baselayer-forms'),
				'validationPanelHelpLink' => __('Forms → Settings', 'baselayer-forms'),
				'fullscreenEnter'   => __('Fullscreen', 'baselayer-forms'),
				'fullscreenExit'    => __('Exit fullscreen', 'baselayer-forms'),
				'tabSecurity'       => __('Security', 'baselayer-forms'),
				'paletteSearch'     => __('Search fields…', 'baselayer-forms'),
				'paletteSearchEmpty'=> __('No fields match your search.', 'baselayer-forms'),
				'paletteSectionPopular' => __('Popular', 'baselayer-forms'),
				'paletteSectionInput' => __('Input', 'baselayer-forms'),
				'paletteSectionChoice' => __('Choice', 'baselayer-forms'),
				'paletteSectionDatetime' => __('Date & time', 'baselayer-forms'),
				'paletteSectionFiles' => __('Uploads', 'baselayer-forms'),
				'paletteSectionLayout' => __('Layout', 'baselayer-forms'),
				'paletteSectionContent' => __('Content', 'baselayer-forms'),
				'paletteSectionAdvanced' => __('Advanced', 'baselayer-forms'),
				'paletteSectionRelations' => __('Relations', 'baselayer-forms'),
				'canvasHeading'     => __('Form', 'baselayer-forms'),
				'empty'             => __('Drag a field here, or click a template to add it.', 'baselayer-forms'),
				'columnEmpty'       => __('Drop fields here', 'baselayer-forms'),
				'columnType'        => __('Column', 'baselayer-forms'),
				'columnWidthTitle'  => __('Column width', 'baselayer-forms'),
				'sectionWidthTitle' => __('Section width', 'baselayer-forms'),
				'layoutDesignTitle' => __('Design', 'baselayer-forms'),
				'layoutDesignStyle' => __('Style', 'baselayer-forms'),
				'layoutSettingsTitle' => __('Settings', 'baselayer-forms'),
				'sectionDesignStandard' => __('Standard', 'baselayer-forms'),
				'sectionDesignOutline' => __('Outline', 'baselayer-forms'),
				'sectionDesignCard' => __('Card', 'baselayer-forms'),
				'sectionHideTitle'  => __('Hide title', 'baselayer-forms'),
				'sectionType'       => __('Section', 'baselayer-forms'),
				'sectionLabel'      => __('Section title', 'baselayer-forms'),
				'sectionLabelPlaceholder' => __('Title', 'baselayer-forms'),
				'sectionLabelPlaceholderHidden' => __('Name', 'baselayer-forms'),
				'sectionEmpty'      => __('Drop fields here', 'baselayer-forms'),
				'tabType'           => __('Tab', 'baselayer-forms'),
				'tabEmpty'          => __('Drop fields here', 'baselayer-forms'),
				'tabWidthTitle'     => __('Tab width', 'baselayer-forms'),
				'widthAuto'         => __('Auto', 'baselayer-forms'),
				'cancel'            => __('Cancel', 'baselayer-forms'),
				'apply'             => __('Apply', 'baselayer-forms'),
				'tools'             => __('Tools', 'baselayer-forms'),
				'exportImport'      => __('Export and Import', 'baselayer-forms'),
				'export'            => __('Export', 'baselayer-forms'),
				'import'            => __('Import', 'baselayer-forms'),
				'templates'         => __('Templates', 'baselayer-forms'),
				'templatesHelp'     => __('Start with a ready-made form layout and adjust it as needed.', 'baselayer-forms'),
				'browseTemplates'   => __('Browse Templates', 'baselayer-forms'),
				'templatesBrowseHelp' => __('Choose a template to create this form with predefined fields.', 'baselayer-forms'),
				'templateContact'   => __('Contact Form', 'baselayer-forms'),
				'templateNewsletter'=> __('Newsletter Signup', 'baselayer-forms'),
				'templateJob'       => __('Job Application', 'baselayer-forms'),
				'templateApplyTitle'=> __('Apply template?', 'baselayer-forms'),
				'templateApplyMessage' => __('Applying this template will overwrite all existing fields on this form. Other settings stay as they are, except the submit button label when the template defines one.', 'baselayer-forms'),
				'templateApplyConfirm' => __('Apply template', 'baselayer-forms'),
				'templateFieldName' => __('Name', 'baselayer-forms'),
				'templateFieldEmail'=> __('Email', 'baselayer-forms'),
				'templateFieldSubject' => __('Subject', 'baselayer-forms'),
				'templateFieldMessage' => __('Message', 'baselayer-forms'),
				'templateFieldFullName' => __('Full name', 'baselayer-forms'),
				'templateFieldCv'   => __('CV / Résumé', 'baselayer-forms'),
				'templateNewsletterSection' => __('Sign up to our Newsletter', 'baselayer-forms'),
				'templatePlaceholderName' => __('Jane Doe', 'baselayer-forms'),
				'templatePlaceholderSubject' => __('How can we help?', 'baselayer-forms'),
				'templatePlaceholderMessage' => __('Tell us a bit more…', 'baselayer-forms'),
				'templatePlaceholderCover' => __('A short note about your application…', 'baselayer-forms'),
				'templateSubmitContact' => __('Send message', 'baselayer-forms'),
				'templateSubmitSubscribe' => __('Subscribe', 'baselayer-forms'),
				'templateSubmitApplication' => __('Submit Application', 'baselayer-forms'),
				'importOverwriteTitle' => __('Import fields?', 'baselayer-forms'),
				'importOverwriteTitleWithSettings' => __('Import form?', 'baselayer-forms'),
				'importOverwriteMessage' => __('Importing will overwrite all existing fields on this form. Settings (emails, messages) are not changed because this file does not include them. This cannot be undone until you save or discard.', 'baselayer-forms'),
				'importOverwriteMessageWithSettings' => __('Importing will overwrite all existing fields on this form and apply any messages, subjects, and other texts included in the file. This cannot be undone until you save or discard.', 'baselayer-forms'),
				'importOverwriteConfirm' => __('Overwrite fields', 'baselayer-forms'),
				'importOverwriteConfirmWithSettings' => __('Overwrite form', 'baselayer-forms'),
				'importInvalid'     => __('This file is not a valid form export.', 'baselayer-forms'),
				'importReadError'   => __('Could not read the selected file.', 'baselayer-forms'),
				'label'             => __('Label', 'baselayer-forms'),
				'name'              => __('Field name', 'baselayer-forms'),
				'nameHelp'          => __('Internal field key used in submissions, emails, and entry data.', 'baselayer-forms'),
				'hideLabel'         => __('Hide', 'baselayer-forms'),
				'fieldTabGeneral'   => __('General', 'baselayer-forms'),
				'fieldTabAdvanced'  => __('Advanced', 'baselayer-forms'),
				'fieldTabAppearance'=> __('Appearance', 'baselayer-forms'),
				'fieldTabLogic'     => __('Logic', 'baselayer-forms'),
				'fieldTabSettings'  => __('Settings', 'baselayer-forms'),
				'fieldTabGeneralEmpty' => __('No general settings for this field.', 'baselayer-forms'),
				'fieldTabAdvancedEmpty' => __('No advanced settings for this field.', 'baselayer-forms'),
				'logicEnable'       => __('Conditional logic', 'baselayer-forms'),
				'logicHelp'         => __('Show this field only when the conditions below are met.', 'baselayer-forms'),
				'logicHelpContainer'=> __('Show this block only when the conditions below are met.', 'baselayer-forms'),
				'logicHelpSection'  => __('Show this section only when the conditions below are met.', 'baselayer-forms'),
				'logicHelpColumn'   => __('Show this column only when the conditions below are met.', 'baselayer-forms'),
				'logicHelpTab'      => __('Show this tab only when the conditions below are met.', 'baselayer-forms'),
				'logicHelpRepeater' => __('Show this repeater only when the conditions below are met.', 'baselayer-forms'),
				'repeaterMinRows'   => __('Min rows', 'baselayer-forms'),
				'repeaterMaxRows'   => __('Max rows', 'baselayer-forms'),
				'repeaterMaxRowsHelp' => __('0 = unlimited', 'baselayer-forms'),
				'repeaterButtonLabel' => __('Add button label', 'baselayer-forms'),
				'addRow'           => __('Add row', 'baselayer-forms'),
				'logicShowIf'       => __('Show this field if', 'baselayer-forms'),
				'logicAnd'          => __('and', 'baselayer-forms'),
				'logicOr'           => __('or', 'baselayer-forms'),
				'logicAddRule'      => __('Add rule', 'baselayer-forms'),
				'logicAddGroup'     => __('Add rule group', 'baselayer-forms'),
				'logicField'        => __('Field', 'baselayer-forms'),
				'logicOperator'     => __('Operator', 'baselayer-forms'),
				'logicValue'        => __('Value', 'baselayer-forms'),
				'logicSelectValue'  => __('— Select —', 'baselayer-forms'),
				'logicNoFields'     => __('No fields available', 'baselayer-forms'),
				'logicThisField'    => __('This field', 'baselayer-forms'),
				'logicMissingField' => __('Missing field', 'baselayer-forms'),
				'logicOpChecked'    => __('Checked', 'baselayer-forms'),
				'logicOpNotChecked' => __('Not checked', 'baselayer-forms'),
				'logicOpEquals'     => __('Is equal to', 'baselayer-forms'),
				'logicOpNotEquals'  => __('Is not equal to', 'baselayer-forms'),
				'logicOpContains'   => __('Contains', 'baselayer-forms'),
				'logicOpNotContains'=> __('Does not contain', 'baselayer-forms'),
				'logicOpEmpty'      => __('Has no value', 'baselayer-forms'),
				'logicOpNotEmpty'   => __('Has any value', 'baselayer-forms'),
				'logicOpGreater'    => __('Greater than', 'baselayer-forms'),
				'logicOpLess'       => __('Less than', 'baselayer-forms'),
				'logicOpGreaterOrEqual' => __('Greater than or equal to', 'baselayer-forms'),
				'logicOpLessOrEqual'=> __('Less than or equal to', 'baselayer-forms'),
				'placeholder'       => __('Placeholder', 'baselayer-forms'),
				'description'       => __('Description', 'baselayer-forms'),
				'required'          => __('Required', 'baselayer-forms'),
				'readOnly'          => __('Read only', 'baselayer-forms'),
				'disabled'          => __('Disabled', 'baselayer-forms'),
				'autocomplete'      => __('Autocomplete', 'baselayer-forms'),
				'autocompleteAutomatic' => __('Automatic', 'baselayer-forms'),
				'autocompleteOff'   => __('Off', 'baselayer-forms'),
				'maxLength'         => __('Maximum length', 'baselayer-forms'),
				'minLength'         => __('Minimum length', 'baselayer-forms'),
				'showCharCount'     => __('Show character count', 'baselayer-forms'),
				'list'              => __('List', 'baselayer-forms'),
				'showInList'        => __('Show in overview', 'baselayer-forms'),
				'showInListMax'     => __('You can show at most 3 fields in the entries list.', 'baselayer-forms'),
				'textareaRows'      => __('Rows', 'baselayer-forms'),
				'charCountText'     => __('Character count text', 'baselayer-forms'),
				'charCountTextDefault' => __('{remaining} characters remaining', 'baselayer-forms'),
				'charCountTextHelp' => __('The placeholders {remaining}, {count}, and {max} are replaced by the remaining count, current count, and maximum.', 'baselayer-forms'),
				'charCountSection'  => __('Character count', 'baselayer-forms'),
				'charCountEmptyText'=> __('When limit is reached', 'baselayer-forms'),
				'charCountEmptyDefault' => __('No characters remaining', 'baselayer-forms'),
				'minLengthError'    => __('Min length', 'baselayer-forms'),
				'maxLengthError'    => __('Max length', 'baselayer-forms'),
				'textError'         => __('Text', 'baselayer-forms'),
				'minValue'          => __('Minimum', 'baselayer-forms'),
				'maxValue'          => __('Maximum', 'baselayer-forms'),
				'stepValue'         => __('Step', 'baselayer-forms'),
				'rangeDefaultFrom'  => __('Default from', 'baselayer-forms'),
				'rangeDefaultTo'    => __('Default to', 'baselayer-forms'),
				'rangeMode'         => __('Mode', 'baselayer-forms'),
				'rangeModeSingle'   => __('Single value', 'baselayer-forms'),
				'rangeModeRange'    => __('Range', 'baselayer-forms'),
				'showRangeInputs'   => __('Allow number input', 'baselayer-forms'),
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
				'pageMultiple'      => __('Allow multiple pages', 'baselayer-forms'),
				'pageAllowedPostTypes' => __('Allowed post types', 'baselayer-forms'),
				'pagePickerAll'     => __('All', 'baselayer-forms'),
				'fieldStatus'       => __('Status', 'baselayer-forms'),
				'fieldActive'       => __('Active', 'baselayer-forms'),
				'fieldInactiveTitle'=> __('Not visible on the frontend', 'baselayer-forms'),
				'fieldActivateTitle'=> __('Show on the frontend', 'baselayer-forms'),
				'selectMultiple'    => __('Allow multiple selection', 'baselayer-forms'),
				'selectAllowNull'   => __('Allow empty selection', 'baselayer-forms'),
				'selectEmptyOptionLabel' => __('Empty option label', 'baselayer-forms'),
				'selectEmptyOptionHelp' => __('Label for the blank choice. Leave empty for “Please select…”. Required still shows this option, but the user must pick a real value.', 'baselayer-forms'),
				'selectEmptyOptionPlaceholder' => __('Please select…', 'baselayer-forms'),
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
				'captchaHelp'       => __('Uses the CAPTCHA keys from Forms → Settings.', 'baselayer-forms'),
				'captchaService'    => __('CAPTCHA service', 'baselayer-forms'),
				'captchaSiteKey'    => __('Site key', 'baselayer-forms'),
				'captchaSecretKey'  => __('Secret key', 'baselayer-forms'),
				'captchaApiKey'     => __('API key', 'baselayer-forms'),
				'captchaNotConfigured' => __('CAPTCHA keys are not configured yet. Add them under Forms → Settings.', 'baselayer-forms'),
				'captchaOpenSettings' => __('Open settings', 'baselayer-forms'),
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
				'toggleText'        => __('Toggle text', 'baselayer-forms'),
				'showAsCheckbox'    => __('Show as checkbox', 'baselayer-forms'),
				'checkboxTextHelp'  => __(
					'Markdown is supported, e.g. <b>**Bold**</b>, <i>*Italic*</i>, and <span style="white-space: nowrap">[Link](...)</span>. For the target you can use a URL (/agb), a WordPress page (page:123), or a standard page such as page:privacy.',
					'baselayer-forms'
				),
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
				'duplicate'         => __('Duplicate', 'baselayer-forms'),
				'collapseGroup'     => __('Collapse', 'baselayer-forms'),
				'expandGroup'       => __('Expand', 'baselayer-forms'),
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
				'buttonClass'       => __('Button class', 'baselayer-forms'),
				'buttonClassPlaceholder' => __('e.g. button -outline', 'baselayer-forms'),
				'buttonClassHelp'   => __('Optional CSS classes on each option (space-separated). Add “button” to use theme button styles.', 'baselayer-forms'),
				'submitLabel'       => __('Submit button label', 'baselayer-forms'),
				'submitButtonClass' => __('Submit button classes', 'baselayer-forms'),
				'submitButtonClassHelp' => __('Extra CSS classes for the submit button (space-separated), e.g. button -primary.', 'baselayer-forms'),
				'recipient'         => __('Recipient', 'baselayer-forms'),
				'recipientHelp'     => __('One email per line. Leave empty to use the global default (or the site administrator email).', 'baselayer-forms'),
				'successMessage'    => __('Success message', 'baselayer-forms'),
				'errorMessage'      => __('Error message', 'baselayer-forms'),
				'validationMessage' => __('Validation message', 'baselayer-forms'),
				'requiredError'     => __('Required', 'baselayer-forms'),
				'invalidError'      => __('Invalid', 'baselayer-forms'),
				'minError'          => __('Minimum', 'baselayer-forms'),
				'maxError'          => __('Maximum', 'baselayer-forms'),
				'minMaxMessageHelp' => __('The placeholder {limit} is replaced by the limit.', 'baselayer-forms'),
				'numberError'       => __('Number', 'baselayer-forms'),
				'emailError'        => __('Email', 'baselayer-forms'),
				'urlError'          => __('URL', 'baselayer-forms'),
				'phoneError'        => __('Phone', 'baselayer-forms'),
				'dateError'         => __('Date', 'baselayer-forms'),
				'dateBeforeError'   => __('Before related field', 'baselayer-forms'),
				'dateAfterError'    => __('After related field', 'baselayer-forms'),
				'dateRelationMessageHelp' => __('The placeholder {field} is replaced by the related field label.', 'baselayer-forms'),
				'dateRelation'      => __('Relation', 'baselayer-forms'),
				'dateRelationNone'  => __('No relation', 'baselayer-forms'),
				'dateRelationBefore'=> __('Must be before', 'baselayer-forms'),
				'dateRelationAfter' => __('Must be after', 'baselayer-forms'),
				'dateRelationSelect'=> __('Select field', 'baselayer-forms'),
				'timeError'         => __('Time', 'baselayer-forms'),
				'datetimeError'     => __('Date & time', 'baselayer-forms'),
				'fileError'         => __('File', 'baselayer-forms'),
				'fileTypeError'     => __('Wrong file type', 'baselayer-forms'),
				'fileTypeErrorHelp' => __('The placeholder {types} is replaced by the allowed file types.', 'baselayer-forms'),
				'fileSizeError'     => __('File too large', 'baselayer-forms'),
				'fileSizeErrorHelp' => __('The placeholder {size} is replaced by the maximum size.', 'baselayer-forms'),
				'fileMaxError'      => __('Too many files', 'baselayer-forms'),
				'fileMaxErrorHelp'  => __('The placeholder {max} is replaced by the maximum number of files.', 'baselayer-forms'),
				'optionError'       => __('Choice', 'baselayer-forms'),
				'selectionMinError' => __('Minimum selections', 'baselayer-forms'),
				'selectionMaxError' => __('Maximum selections', 'baselayer-forms'),
				'selectionMinErrorHelp' => __('The placeholder {min} is replaced by the minimum number of options.', 'baselayer-forms'),
				'selectionMaxErrorHelp' => __('The placeholder {max} is replaced by the maximum number of options.', 'baselayer-forms'),
				'minSelections'     => __('Minimum selections', 'baselayer-forms'),
				'maxSelections'     => __('Maximum selections', 'baselayer-forms'),
				'selectionBoundsHelp' => __('Leave empty for no limit. When the maximum is reached, further options cannot be selected.', 'baselayer-forms'),
				'uploadButtonText'  => __('Button label', 'baselayer-forms'),
				'uploadButtonDefault' => __('Choose file', 'baselayer-forms'),
				'allowedExtensions' => __('Allowed extensions', 'baselayer-forms'),
				'allowedExtensionsHelp' => __('Comma-separated list without dots, e.g. pdf, docx, xlsx. Leave empty to allow all WordPress-permitted types.', 'baselayer-forms'),
				'maxFiles'          => __('Maximum files', 'baselayer-forms'),
				'maxFilesHelp'      => __('Maximum number of files visitors can upload.', 'baselayer-forms'),
				'fieldMaxSize'      => __('Maximum file size', 'baselayer-forms'),
				/* translators: %s: global max upload size, e.g. "12 MB" */
				'fieldMaxSizeHelp'  => __('Leave empty to use the global default (%s).', 'baselayer-forms'),
				'fieldMaxSizeHelpEmpty' => __('Leave empty to use the global default.', 'baselayer-forms'),
				'showUploadPreview' => __('Show file preview', 'baselayer-forms'),
				'uploadStyle'       => __('Style', 'baselayer-forms'),
				'uploadStyleModern' => __('Modern', 'baselayer-forms'),
				'uploadStyleClassic'=> __('Classic', 'baselayer-forms'),
				'fileSettings'      => __('File settings', 'baselayer-forms'),
				'uploadMaxSize'     => __('Maximum file size', 'baselayer-forms'),
				'uploadMaxSizeUnit' => __('MB', 'baselayer-forms'),
				'saveUploads'       => __('Save uploaded files', 'baselayer-forms'),
				'saveUploadsHelp'   => __('Uploaded files are stored securely outside the Media Library using unguessable filenames.', 'baselayer-forms'),
				'saveUploadsDisabled' => __('Saving uploaded files is disabled in Forms → Settings.', 'baselayer-forms'),
				'saveUploadsOpenSettings' => __('Open settings', 'baselayer-forms'),
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
				'subject'           => __('Email subject', 'baselayer-forms'),
				'subjectHelp'       => __('The placeholders {form_title} and {site_name} are replaced by the form title and site name.', 'baselayer-forms'),
				'emailTitle'        => __('Email title', 'baselayer-forms'),
				'emailTitleHelp'    => __('Shown as the heading inside the confirmation email.', 'baselayer-forms'),
				'introText'         => __('Intro text', 'baselayer-forms'),
				'introTextHelp'     => __('This text appears above the submitted form data in the email. Placeholders like {field-id} can be used.', 'baselayer-forms'),
				'footerText'        => __('Footer text', 'baselayer-forms'),
				'footerTextHelp'    => __('The placeholders {form_title} and {site_name} are supported.', 'baselayer-forms'),
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
				'securityMinFillTimeAtLeast' => __('Min.', 'baselayer-forms'),
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
					'range'        => __('Value range', 'baselayer-forms'),
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
					'row_break'    => __('Row break', 'baselayer-forms'),
					'column'       => __('Column', 'baselayer-forms'),
					'section'      => __('Section', 'baselayer-forms'),
					'tab'          => __('Tab', 'baselayer-forms'),
					'hidden'       => __('Hidden', 'baselayer-forms'),
					'honeypot'     => __('Honeypot', 'baselayer-forms'),
					'captcha'      => __('CAPTCHA', 'baselayer-forms'),
					'page'         => __('Page', 'baselayer-forms'),
					'link'         => __('Link', 'baselayer-forms'),
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
