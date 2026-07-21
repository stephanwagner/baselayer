<?php

defined('ABSPATH') || exit;

/**
 * Allowed field types for the form builder.
 *
 * @return list<string>
 */
function bl_forms_field_types(): array
{
	return ['text', 'email', 'textarea', 'radio', 'checkboxes', 'terms', 'heading', 'text_block'];
}

/**
 * Default settings (empty strings mean use runtime fallbacks).
 *
 * @return array<string, mixed>
 */
function bl_forms_default_settings(): array
{
	return [
		'submit_label'        => '',
		'recipient'           => '',
		'success_message'     => '',
		'error_message'       => '',
		'validation_message'  => '',
		'notify_user'         => false,
		'admin_email_subject' => '',
		'user_email_subject'  => '',
		'user_email_intro'    => '',
	];
}

/**
 * Default form config.
 *
 * @return array{fields: list<array<string, mixed>>, settings: array<string, mixed>}
 */
function bl_forms_default_config(): array
{
	return [
		'fields'   => [],
		'settings' => bl_forms_default_settings(),
	];
}

/**
 * Runtime message fallbacks (translatable).
 *
 * @return array{success: string, error: string, validation: string, submit: string}
 */
function bl_forms_message_fallbacks(): array
{
	return [
		'success'    => __('Thank you. Your message has been sent.', 'baselayer'),
		'error'      => __('Something went wrong. Please try again.', 'baselayer'),
		'validation' => __('Please check the highlighted fields.', 'baselayer'),
		'submit'     => __('Send', 'baselayer'),
	];
}

/**
 * Resolve a settings message with fallback.
 */
function bl_forms_resolve_message(array $settings, string $key): string
{
	$fallbacks = bl_forms_message_fallbacks();
	$map = [
		'success_message'    => 'success',
		'error_message'      => 'error',
		'validation_message' => 'validation',
		'submit_label'       => 'submit',
	];

	$fallback_key = $map[$key] ?? '';
	$custom = isset($settings[$key]) && is_string($settings[$key]) ? trim($settings[$key]) : '';

	if ($custom !== '') {
		return $custom;
	}

	return $fallbacks[$fallback_key] ?? '';
}

/**
 * Load form config for a form post.
 *
 * @return array{fields: list<array<string, mixed>>, settings: array<string, mixed>}
 */
function bl_forms_get_config(int $form_id): array
{
	$raw = get_post_meta($form_id, BL_FORM_CONFIG_META, true);
	if (!is_array($raw)) {
		return bl_forms_default_config();
	}

	return bl_forms_sanitize_config($raw);
}

/**
 * Sanitize options list for radio/checkboxes.
 *
 * @param mixed $options
 * @return list<array{label: string, value: string}>
 */
function bl_forms_sanitize_options($options): array
{
	if (!is_array($options)) {
		return [];
	}

	$out = [];
	foreach ($options as $opt) {
		if (!is_array($opt)) {
			continue;
		}
		$label = sanitize_text_field((string) ($opt['label'] ?? ''));
		$value = sanitize_text_field((string) ($opt['value'] ?? $label));
		if ($label === '' && $value === '') {
			continue;
		}
		if ($label === '') {
			$label = $value;
		}
		if ($value === '') {
			$value = sanitize_title($label);
		}
		$out[] = [
			'label' => $label,
			'value' => $value,
		];
	}

	return $out;
}

/**
 * Allowed field width presets (percent).
 *
 * @return list<string>
 */
function bl_forms_width_presets(): array
{
	return ['100', '75', '66', '50', '33', '25'];
}

/**
 * Sanitize field width settings.
 *
 * @param array<string, mixed> $field
 * @return array{width: string, width_custom: string}
 */
function bl_forms_sanitize_width(array $field): array
{
	$width = sanitize_key((string) ($field['width'] ?? '100'));
	$presets = bl_forms_width_presets();
	if ($width !== 'custom' && !in_array($width, $presets, true)) {
		$width = '100';
	}

	$custom = sanitize_text_field((string) ($field['width_custom'] ?? ''));
	if ($width !== 'custom') {
		$custom = '';
	}

	return [
		'width'        => $width,
		'width_custom' => $custom,
	];
}

/**
 * CSS width value for a field.
 *
 * @param array<string, mixed> $field
 */
function bl_forms_field_width_css(array $field): string
{
	$width = (string) ($field['width'] ?? '100');
	if ($width === 'custom') {
		$custom = trim((string) ($field['width_custom'] ?? ''));
		return $custom !== '' ? $custom : '100%';
	}

	$map = [
		'100' => '100%',
		'75'  => '75%',
		'66'  => '66.6667%',
		'50'  => '50%',
		'33'  => '33.3333%',
		'25'  => '25%',
	];

	return $map[$width] ?? '100%';
}

/**
 * Sanitize one field definition.
 *
 * @param mixed $field
 * @return array<string, mixed>|null
 */
function bl_forms_sanitize_field($field): ?array
{
	if (!is_array($field)) {
		return null;
	}

	$type = sanitize_key((string) ($field['type'] ?? 'text'));
	if (!in_array($type, bl_forms_field_types(), true)) {
		$type = 'text';
	}

	$id = sanitize_key((string) ($field['id'] ?? ''));
	if ($id === '') {
		$id = 'f' . wp_generate_password(8, false, false);
	}

	$name = sanitize_key((string) ($field['name'] ?? ''));
	if ($name === '' && !in_array($type, ['heading', 'text_block'], true)) {
		$name = $id;
	}

	$width = bl_forms_sanitize_width($field);

	$out = [
		'id'           => $id,
		'type'         => $type,
		'label'        => sanitize_text_field((string) ($field['label'] ?? '')),
		'name'         => $name,
		'width'        => $width['width'],
		'width_custom' => $width['width_custom'],
	];

	if (in_array($type, ['heading', 'text_block'], true)) {
		$out['content'] = sanitize_textarea_field((string) ($field['content'] ?? ''));
		unset($out['name']);

		return $out;
	}

	$out['required'] = !empty($field['required']);
	$out['placeholder'] = sanitize_text_field((string) ($field['placeholder'] ?? ''));

	if (in_array($type, ['text', 'email', 'textarea'], true)) {
		$out['description'] = sanitize_textarea_field((string) ($field['description'] ?? ''));
	}

	if (in_array($type, ['radio', 'checkboxes'], true)) {
		$out['options'] = bl_forms_sanitize_options($field['options'] ?? []);
	}

	if ($type === 'terms') {
		$out['label'] = $out['label'] !== ''
			? $out['label']
			: __('I agree to the terms.', 'baselayer');
	}

	return $out;
}

/**
 * Sanitize full form config.
 *
 * @param mixed $config
 * @return array{fields: list<array<string, mixed>>, settings: array<string, mixed>}
 */
function bl_forms_sanitize_config($config): array
{
	$defaults = bl_forms_default_config();
	if (!is_array($config)) {
		return $defaults;
	}

	$fields = [];
	if (isset($config['fields']) && is_array($config['fields'])) {
		foreach ($config['fields'] as $field) {
			$clean = bl_forms_sanitize_field($field);
			if ($clean !== null) {
				$fields[] = $clean;
			}
		}
	}

	$settings_in = isset($config['settings']) && is_array($config['settings'])
		? $config['settings']
		: [];
	$settings = bl_forms_default_settings();

	foreach ($settings as $key => $default) {
		if (!array_key_exists($key, $settings_in)) {
			continue;
		}
		if ($key === 'notify_user') {
			$settings[$key] = !empty($settings_in[$key]);
			continue;
		}
		if ($key === 'recipient') {
			$email = sanitize_email((string) $settings_in[$key]);
			$settings[$key] = is_email($email) ? $email : '';
			continue;
		}
		$value = (string) $settings_in[$key];
		if (in_array($key, ['success_message', 'error_message', 'validation_message', 'user_email_intro'], true)) {
			$settings[$key] = sanitize_textarea_field($value);
		} else {
			$settings[$key] = sanitize_text_field($value);
		}
	}

	return [
		'fields'   => $fields,
		'settings' => $settings,
	];
}

/**
 * Admin notification recipient for a form.
 */
function bl_forms_recipient(array $settings): string
{
	$custom = isset($settings['recipient']) ? trim((string) $settings['recipient']) : '';
	if ($custom !== '' && is_email($custom)) {
		return $custom;
	}

	$admin = get_option('admin_email', '');

	return is_email($admin) ? $admin : '';
}

/**
 * First email field name in config (for reply-to / user notify).
 */
function bl_forms_primary_email_field_name(array $config): string
{
	foreach ($config['fields'] as $field) {
		if (($field['type'] ?? '') === 'email' && !empty($field['name'])) {
			return (string) $field['name'];
		}
	}

	return '';
}
