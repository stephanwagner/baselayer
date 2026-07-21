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
	wp_nonce_field('bl_forms_save_config', 'bl_forms_config_nonce');
	?>
	<input type="hidden" name="bl_forms_config_json" id="bl-forms-config-json" value="<?= esc_attr(wp_json_encode($config)) ?>">
	<div
		id="bl-forms-builder"
		class="bl-forms-builder"
		data-bl-forms-builder
		data-admin-email="<?= esc_attr((string) get_option('admin_email', '')) ?>"
		data-fallback-submit="<?= esc_attr($fallbacks['submit']) ?>"
		data-fallback-success="<?= esc_attr($fallbacks['success']) ?>"
		data-fallback-error="<?= esc_attr($fallbacks['error']) ?>"
		data-fallback-validation="<?= esc_attr($fallbacks['validation']) ?>"
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
		'password'     => 'password',
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
		'divider'      => 'minus',
		'spacer'       => 'arrow-up-down',
		'hidden'       => 'visibility-off',
		'honeypot'     => 'bug',
		'captcha'      => 'shield-lock',
		'add'          => 'chevron-right',
		'caret'        => 'chevron-down',
		'edit'         => 'edit',
		'trash'        => 'delete',
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
		wp_add_inline_script(
			'postbox',
			"jQuery(function($){
				$('.meta-box-sortables').sortable('destroy');
				$('.postbox .hndle').css('cursor', 'default');
			});"
		);
	}

	if ($is_form_edit && bl_forms_user_can_manage()) {
		bl_forms_enqueue_script('bl-forms-admin', 'forms-admin', [], true);
		wp_localize_script('bl-forms-admin', 'blFormsAdmin', [
			'icons' => bl_forms_palette_icons(),
			'i18n' => [
				'tabFields'         => __('Fields', 'baselayer'),
				'tabNotifications'  => __('Notifications', 'baselayer'),
				'tabSettings'       => __('Settings', 'baselayer'),
				'paletteHeading'    => __('Field templates', 'baselayer'),
				'paletteSectionPopular' => __('Popular', 'baselayer'),
				'paletteSectionInput' => __('Input', 'baselayer'),
				'paletteSectionChoice' => __('Choice', 'baselayer'),
				'paletteSectionDatetime' => __('Date & time', 'baselayer'),
				'paletteSectionFiles' => __('Uploads', 'baselayer'),
				'paletteSectionContent' => __('Content', 'baselayer'),
				'paletteSectionAdvanced' => __('Advanced', 'baselayer'),
				'paletteAdd'        => __('Add field', 'baselayer'),
				'canvasHeading'     => __('Form', 'baselayer'),
				'empty'             => __('Drag a field here, or click a template to add it.', 'baselayer'),
				'label'             => __('Label', 'baselayer'),
				'name'              => __('Name (key)', 'baselayer'),
				'placeholder'       => __('Placeholder', 'baselayer'),
				'description'       => __('Description', 'baselayer'),
				'required'          => __('Required', 'baselayer'),
				'allowMultiple'     => __('Allow multiple', 'baselayer'),
				'selectMultiple'    => __('Allow multiple selection', 'baselayer'),
				'buttonGroupMultiple' => __('Allow multiple selection', 'baselayer'),
				'defaultValue'      => __('Default value', 'baselayer'),
				'spacerHeight'      => __('Height', 'baselayer'),
				'honeypotHelp'      => __('Hidden from visitors. If filled, the submission is treated as spam.', 'baselayer'),
				'captchaHelp'       => __('CAPTCHA will be wired up later. This is a placeholder field.', 'baselayer'),
				'termsDefaultLabel' => __('I agree to the [Privacy Policy](page:privacy).', 'baselayer'),
				'checkboxText'      => __('Checkbox text', 'baselayer'),
				'checkboxTextHelp'  => __('Links: [Privacy Policy](page:privacy) (site privacy page), [Privacy Policy](/privacy-policy), or [Privacy Policy](page:234). Unresolved page links show as plain text.', 'baselayer'),
				'content'           => __('Content', 'baselayer'),
				'htmlContent'       => __('HTML', 'baselayer'),
				'options'           => __('Options', 'baselayer'),
				'addOption'         => __('Add option', 'baselayer'),
				'optionLabel'       => __('Label', 'baselayer'),
				'optionValue'       => __('Value', 'baselayer'),
				'delete'            => __('Delete', 'baselayer'),
				'editField'         => __('Edit field', 'baselayer'),
				'expandField'       => __('Expand field', 'baselayer'),
				'collapseField'     => __('Collapse field', 'baselayer'),
				'dragField'         => __('Drag to reorder', 'baselayer'),
				'type'              => __('Type', 'baselayer'),
				'width'             => __('Width', 'baselayer'),
				'widthCustom'       => __('Custom', 'baselayer'),
				'widthCustomPlaceholder' => __('e.g. 40% or 280px', 'baselayer'),
				'submitLabel'       => __('Submit button label', 'baselayer'),
				'recipient'         => __('Notification recipient', 'baselayer'),
				'recipientHelp'     => __('Leave empty to use the site admin email.', 'baselayer'),
				'successMessage'    => __('Success message', 'baselayer'),
				'errorMessage'      => __('Error message', 'baselayer'),
				'validationMessage' => __('Validation message', 'baselayer'),
				'notifyUser'        => __('Send confirmation email to submitter', 'baselayer'),
				'notifyUserHelp'    => __('Requires an Email field on the form.', 'baselayer'),
				'adminSubject'      => __('Admin email subject', 'baselayer'),
				'userSubject'       => __('User email subject', 'baselayer'),
				'userIntro'         => __('User email intro', 'baselayer'),
				'types'             => [
					'text'         => __('Text', 'baselayer'),
					'email'        => __('Email', 'baselayer'),
					'url'          => __('URL', 'baselayer'),
					'number'       => __('Number', 'baselayer'),
					'password'     => __('Password', 'baselayer'),
					'phone'        => __('Phone', 'baselayer'),
					'textarea'     => __('Textarea', 'baselayer'),
					'radio'        => __('Radio Buttons', 'baselayer'),
					'checkboxes'   => __('Checkboxes', 'baselayer'),
					'select'       => __('Select', 'baselayer'),
					'toggle'       => __('Toggle', 'baselayer'),
					'button_group' => __('Button Group', 'baselayer'),
					'terms'        => __('Consent Checkbox', 'baselayer'),
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
