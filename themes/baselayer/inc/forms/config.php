<?php

defined('ABSPATH') || exit;

/**
 * Allowed field types for the form builder.
 *
 * @return list<string>
 */
function bl_forms_field_types(): array
{
	return [
		'text',
		'email',
		'url',
		'number',
		'password',
		'phone',
		'textarea',
		'radio',
		'checkboxes',
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
		'hidden',
		'honeypot',
		'captcha',
	];
}

/**
 * Non-submittable layout / content field types.
 *
 * @return list<string>
 */
function bl_forms_content_field_types(): array
{
	return ['heading', 'text_block', 'html', 'divider', 'spacer', 'captcha'];
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
		'user_email_field'    => '',
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
 * Map stored option value(s) to option labels for display (email / entry UI).
 *
 * @param array<string, mixed> $field
 * @param mixed                $value Stored submission value.
 */
function bl_forms_format_field_display_value(array $field, $value): string
{
	$type = (string) ($field['type'] ?? '');

	if ($type === 'terms' || $type === 'toggle') {
		return $value !== '' && $value !== '0' && $value !== null && $value !== false
			? __('Yes', 'baselayer')
			: __('No', 'baselayer');
	}

	if ($type === 'password') {
		return $value !== '' && $value !== null ? '••••••••' : '';
	}

	if (in_array($type, ['file', 'image'], true)) {
		$items = is_array($value) ? $value : [];
		$parts = [];
		foreach ($items as $item) {
			if (!is_array($item)) {
				continue;
			}
			$fname = (string) ($item['name'] ?? '');
			$furl = (string) ($item['url'] ?? '');
			if ($fname !== '' && $furl !== '') {
				$parts[] = $fname . ' — ' . $furl;
			} elseif ($fname !== '') {
				$parts[] = $fname;
			} elseif ($furl !== '') {
				$parts[] = $furl;
			}
		}

		return implode("\n", $parts);
	}

	if (in_array($type, ['radio', 'checkboxes', 'select', 'button_group'], true)) {
		$map = [];
		$options = isset($field['options']) && is_array($field['options']) ? $field['options'] : [];
		foreach ($options as $opt) {
			if (!is_array($opt)) {
				continue;
			}
			$opt_value = (string) ($opt['value'] ?? '');
			$opt_label = (string) ($opt['label'] ?? $opt_value);
			if ($opt_value !== '') {
				$map[$opt_value] = $opt_label !== '' ? $opt_label : $opt_value;
			}
		}

		$selected = is_array($value) ? $value : [$value];
		$labels = [];
		foreach ($selected as $item) {
			if (!is_scalar($item) || (string) $item === '') {
				continue;
			}
			$key = (string) $item;
			$labels[] = $map[$key] ?? $key;
		}

		return implode(', ', $labels);
	}

	if (is_array($value)) {
		return implode(', ', array_map('strval', $value));
	}

	return (string) $value;
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
 * Sanitize one or more CSS class names.
 */
function bl_forms_sanitize_css_class(string $raw): string
{
	$parts = preg_split('/\s+/', trim($raw)) ?: [];
	$clean = [];
	foreach ($parts as $part) {
		$class = sanitize_html_class($part);
		if ($class !== '') {
			$clean[] = $class;
		}
	}

	return implode(' ', array_unique($clean));
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
 * CSS width value + flex gap factor for a field.
 *
 * Factor is the width as 0–1 so siblings can share row gap:
 * width: calc(var(--bl-form-field-width) - gap * (1 - factor))
 *
 * @param array<string, mixed> $field
 * @return array{width: string, factor: string}
 */
function bl_forms_field_width_vars(array $field): array
{
	$width = (string) ($field['width'] ?? '100');
	if ($width === 'custom') {
		$custom = trim((string) ($field['width_custom'] ?? ''));
		if ($custom === '') {
			return [
				'width'  => '100%',
				'factor' => '1',
			];
		}
		if (preg_match('/^(\d+(?:\.\d+)?)%$/', $custom, $matches)) {
			$pct = (float) $matches[1];
			$factor = max(0, min(1, $pct / 100));

			return [
				'width'  => $custom,
				'factor' => rtrim(rtrim(sprintf('%.6F', $factor), '0'), '.'),
			];
		}

		// px / rem / etc. — use as-is, no gap share.
		return [
			'width'  => $custom,
			'factor' => '1',
		];
	}

	$map = [
		'100' => ['100%', '1'],
		'75'  => ['75%', '0.75'],
		'66'  => ['66.6667%', '0.666667'],
		'50'  => ['50%', '0.5'],
		'33'  => ['33.3333%', '0.333333'],
		'25'  => ['25%', '0.25'],
	];

	[$css, $factor] = $map[$width] ?? ['100%', '1'];

	return [
		'width'  => $css,
		'factor' => $factor,
	];
}

/**
 * Inline CSS custom properties for field width layout.
 *
 * @param array<string, mixed> $field
 */
function bl_forms_field_width_style(array $field): string
{
	$vars = bl_forms_field_width_vars($field);

	return '--bl-form-field-width:' . $vars['width'] . ';--bl-form-field-width-factor:' . $vars['factor'];
}

/**
 * CSS width value for a field.
 *
 * @param array<string, mixed> $field
 */
function bl_forms_field_width_css(array $field): string
{
	return bl_forms_field_width_vars($field)['width'];
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
	if ($name === '' && !in_array($type, bl_forms_content_field_types(), true)) {
		$name = $id;
	}

	$width = bl_forms_sanitize_width($field);

	$out = [
		'id'           => $id,
		'type'         => $type,
		'label'        => sanitize_text_field((string) ($field['label'] ?? '')),
		'name'         => $name,
		'name_manual'  => !empty($field['name_manual']),
		'hide_label'   => !empty($field['hide_label']),
		'css_class'    => bl_forms_sanitize_css_class((string) ($field['css_class'] ?? '')),
		'width'        => $width['width'],
		'width_custom' => $width['width_custom'],
	];

	if ($type === 'divider' || $type === 'captcha') {
		unset($out['name'], $out['label'], $out['name_manual'], $out['hide_label']);

		return $out;
	}

	if ($type === 'spacer') {
		$height = sanitize_text_field((string) ($field['height'] ?? '24px'));
		if ($height === '') {
			$height = '24px';
		}
		$out['height'] = $height;
		unset($out['name'], $out['label'], $out['name_manual'], $out['hide_label']);

		return $out;
	}

	if (in_array($type, ['heading', 'text_block', 'html'], true)) {
		$content = (string) ($field['content'] ?? '');
		$out['content'] = $type === 'html'
			? wp_kses_post($content)
			: sanitize_textarea_field($content);
		unset($out['name'], $out['name_manual'], $out['hide_label']);

		return $out;
	}

	if ($type === 'honeypot') {
		$out['label'] = $out['label'] !== '' ? $out['label'] : __('Honeypot', 'baselayer');
		unset($out['required'], $out['placeholder'], $out['hide_label']);

		return $out;
	}

	if ($type === 'hidden') {
		$out['default_value'] = sanitize_text_field((string) ($field['default_value'] ?? ''));
		$out['width'] = '100';
		$out['width_custom'] = '';
		unset($out['required'], $out['placeholder'], $out['hide_label']);

		return $out;
	}

	$out['required'] = !empty($field['required']);
	$out['placeholder'] = sanitize_text_field((string) ($field['placeholder'] ?? ''));

	if (in_array($type, ['text', 'email', 'url', 'number', 'password', 'phone', 'textarea', 'date', 'time', 'datetime', 'file', 'image', 'toggle'], true)) {
		$out['description'] = sanitize_textarea_field((string) ($field['description'] ?? ''));
	}

	if (in_array($type, ['radio', 'checkboxes', 'select', 'button_group'], true)) {
		$out['options'] = bl_forms_sanitize_options($field['options'] ?? []);
	}

	if (in_array($type, ['radio', 'checkboxes'], true)) {
		$out['layout'] = (($field['layout'] ?? 'vertical') === 'horizontal') ? 'horizontal' : 'vertical';
	}

	if (in_array($type, ['select', 'button_group', 'file', 'image'], true)) {
		$out['multiple'] = !empty($field['multiple']);
	}

	if ($type === 'terms') {
		$content = sanitize_textarea_field((string) ($field['content'] ?? ''));
		// Legacy configs stored the checkbox text in `label`.
		if ($content === '' && !array_key_exists('content', $field) && $out['label'] !== '') {
			$content = $out['label'];
			$out['label'] = '';
		}
		if ($content === '') {
			$content = __('I agree to the [Privacy Policy](page:privacy).', 'baselayer');
		}
		$out['content'] = $content;
		$out['default_value'] = !empty($field['default_value']) ? '1' : '';
	}

	if ($type === 'toggle') {
		$out['label'] = $out['label'] !== ''
			? $out['label']
			: __('Enable', 'baselayer');
		$out['default_value'] = !empty($field['default_value']) ? '1' : '';
	}

	$no_default = ['password', 'file', 'image', 'honeypot', 'captcha'];
	if (
		!isset($out['default_value'])
		&& !in_array($type, $no_default, true)
	) {
		if ($type === 'textarea') {
			$out['default_value'] = sanitize_textarea_field((string) ($field['default_value'] ?? ''));
		} else {
			$out['default_value'] = sanitize_text_field((string) ($field['default_value'] ?? ''));
		}
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
	$fields = bl_forms_ensure_unique_field_names($fields);

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
		if ($key === 'user_email_field') {
			$settings[$key] = sanitize_key((string) $settings_in[$key]);
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
 * Ensure field name keys are unique within a form.
 *
 * @param list<array<string, mixed>> $fields
 * @return list<array<string, mixed>>
 */
function bl_forms_ensure_unique_field_names(array $fields): array
{
	$used = [];

	foreach ($fields as $index => $field) {
		if (!isset($field['name']) || !is_string($field['name']) || $field['name'] === '') {
			continue;
		}

		$base = sanitize_key($field['name']);
		if ($base === '') {
			$base = 'field';
		}

		$candidate = $base;
		$suffix = 2;
		while (isset($used[$candidate])) {
			$candidate = $base . '_' . $suffix;
			$suffix++;
		}

		$fields[$index]['name'] = $candidate;
		$used[$candidate] = true;
	}

	return $fields;
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
 * Email field name used for reply-to / user confirmation.
 *
 * Prefers settings.user_email_field when it still exists on the form.
 */
function bl_forms_primary_email_field_name(array $config): string
{
	$preferred = sanitize_key((string) ($config['settings']['user_email_field'] ?? ''));
	$first = '';

	foreach ($config['fields'] as $field) {
		if (($field['type'] ?? '') !== 'email' || empty($field['name'])) {
			continue;
		}
		$name = (string) $field['name'];
		if ($first === '') {
			$first = $name;
		}
		if ($preferred !== '' && $name === $preferred) {
			return $name;
		}
	}

	return $first;
}
