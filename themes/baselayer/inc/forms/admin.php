<?php

defined('ABSPATH') || exit;

/**
 * Builder meta box on form edit screen (single full-width UI).
 */
function bl_forms_admin_meta_boxes(): void
{
	remove_meta_box('slugdiv', BL_FORM_POST_TYPE, 'normal');

	add_meta_box(
		'bl_forms_builder',
		__('Form builder', 'baselayer'),
		'bl_forms_render_builder_metabox',
		BL_FORM_POST_TYPE,
		'normal',
		'high'
	);
}
add_action('add_meta_boxes', 'bl_forms_admin_meta_boxes');

/**
 * Full-width builder shell — tabs/panels mounted by JS.
 */
function bl_forms_render_builder_metabox(WP_Post $post): void
{
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

	if ($is_form_edit && bl_forms_user_can_manage()) {
		bl_forms_enqueue_script('bl-forms-admin', 'forms-admin', [], true);
		wp_localize_script('bl-forms-admin', 'blFormsAdmin', [
			'i18n' => [
				'tabFields'         => __('Fields', 'baselayer'),
				'tabNotifications'  => __('Notifications', 'baselayer'),
				'tabSettings'       => __('Settings', 'baselayer'),
				'paletteHeading'    => __('Field templates', 'baselayer'),
				'canvasHeading'     => __('Form', 'baselayer'),
				'empty'             => __('Drag a field here, or click a template to add it.', 'baselayer'),
				'label'             => __('Label', 'baselayer'),
				'name'              => __('Name (key)', 'baselayer'),
				'placeholder'       => __('Placeholder', 'baselayer'),
				'description'       => __('Description', 'baselayer'),
				'required'          => __('Required', 'baselayer'),
				'content'           => __('Content', 'baselayer'),
				'options'           => __('Options', 'baselayer'),
				'addOption'         => __('Add option', 'baselayer'),
				'optionLabel'       => __('Label', 'baselayer'),
				'optionValue'       => __('Value', 'baselayer'),
				'delete'            => __('Delete', 'baselayer'),
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
					'text'       => __('Text', 'baselayer'),
					'email'      => __('Email', 'baselayer'),
					'textarea'   => __('Textarea', 'baselayer'),
					'radio'      => __('Radio', 'baselayer'),
					'checkboxes' => __('Checkboxes', 'baselayer'),
					'terms'      => __('Terms checkbox', 'baselayer'),
					'heading'    => __('Title', 'baselayer'),
					'text_block' => __('Text block', 'baselayer'),
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
