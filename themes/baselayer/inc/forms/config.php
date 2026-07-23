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
		'column',
		'section',
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
	return ['heading', 'text_block', 'html', 'divider', 'spacer', 'column', 'section', 'captcha'];
}

/**
 * Layout container types (have nested children).
 *
 * @return list<string>
 */
function bl_forms_layout_field_types(): array
{
	return ['column', 'section'];
}

/**
 * Field types that must stay at the form root (not inside columns/sections).
 *
 * @return list<string>
 */
function bl_forms_root_only_field_types(): array
{
	return ['column', 'section', 'hidden', 'honeypot', 'captcha'];
}

/**
 * Yield every non-layout field in tree order (inputs + content).
 *
 * @param list<array<string, mixed>> $fields
 * @return \Generator<int, array<string, mixed>>
 */
function bl_forms_iter_fields(array $fields): \Generator
{
	foreach ($fields as $field) {
		if (!is_array($field)) {
			continue;
		}
		$type = (string) ($field['type'] ?? '');
		if (in_array($type, bl_forms_layout_field_types(), true)) {
			$children = isset($field['children']) && is_array($field['children']) ? $field['children'] : [];
			yield from bl_forms_iter_fields($children);
			continue;
		}
		yield $field;
	}
}

/**
 * Flat list of non-layout fields (for submit, mail, uploads checks).
 *
 * @param list<array<string, mixed>> $fields
 * @return list<array<string, mixed>>
 */
function bl_forms_flatten_fields(array $fields): array
{
	return iterator_to_array(bl_forms_iter_fields($fields), false);
}

/**
 * Generate a random honeypot field name.
 */
function bl_forms_generate_honeypot_name(): string
{
	return 'hp_' . strtolower(wp_generate_password(10, false, false));
}

/**
 * HMAC signature for the form load timestamp (min fill time).
 */
function bl_forms_fill_time_signature(int $form_id, int $loaded_at): string
{
	return hash_hmac('sha256', $form_id . '|' . $loaded_at, wp_salt('nonce'));
}

/**
 * Expected value for the JavaScript check field (set by front-end JS).
 */
function bl_forms_js_check_token(int $form_id, int $loaded_at): string
{
	return hash_hmac('sha256', 'js|' . $form_id . '|' . $loaded_at, wp_salt('nonce'));
}

/**
 * Default settings (empty strings mean use runtime fallbacks).
 *
 * @return array<string, mixed>
 */
function bl_forms_default_settings(): array
{
	return [
		'submit_label'           => '',
		'recipient'              => '',
		'success_message'        => '',
		'error_message'          => '',
		'validation_message'     => '',
		'required_message'       => '',
		'min_message'            => '',
		'max_message'            => '',
		'number_message'         => '',
		'email_message'          => '',
		'url_message'            => '',
		'phone_message'          => '',
		'date_message'           => '',
		'time_message'           => '',
		'datetime_message'       => '',
		'file_message'           => '',
		'option_message'         => '',
		'after_submit'           => 'message',
		'redirect_page_id'       => 0,
		'notify_user'            => false,
		'user_email_field'       => '',
		'admin_email_subject'    => '',
		'user_email_subject'     => '',
		'user_email_intro'       => '',
		'honeypot_name'          => '',
		'min_fill_time_enabled'  => true,
		'min_fill_time'          => 2,
		'rate_limit_enabled'     => true,
		'rate_limit_max'         => 3,
		'rate_limit_window'      => 5,
	];
}

/**
 * Resolve after-submit redirect URL from settings (empty when not redirecting).
 *
 * @param array<string, mixed> $settings
 */
function bl_forms_after_submit_redirect_url(array $settings): string
{
	if (sanitize_key((string) ($settings['after_submit'] ?? 'message')) !== 'redirect') {
		return '';
	}

	$page_id = (int) ($settings['redirect_page_id'] ?? 0);
	if ($page_id <= 0) {
		return '';
	}

	return bl_forms_permalink_for_post(get_post($page_id));
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
 * @return array<string, string>
 */
function bl_forms_message_fallbacks(): array
{
	return [
		'success'    => __('Thank you. Your message has been sent.', 'baselayer'),
		'error'      => __('Something went wrong. Please try again.', 'baselayer'),
		'validation' => __('Some fields need attention. Please check the highlighted fields.', 'baselayer'),
		'submit'     => __('Send', 'baselayer'),
		'required'   => __('This field is required.', 'baselayer'),
		/* translators: %s: minimum value (number, date, time, …) */
		'min'        => __('Enter a value of at least %s.', 'baselayer'),
		/* translators: %s: maximum value (number, date, time, …) */
		'max'        => __('Enter a value of at most %s.', 'baselayer'),
		'number'     => __('Enter a valid number.', 'baselayer'),
		'email'      => __('Enter a valid email address.', 'baselayer'),
		'url'        => __('Enter a valid URL.', 'baselayer'),
		'phone'      => __('Enter a valid phone number.', 'baselayer'),
		'date'       => __('Enter a valid date.', 'baselayer'),
		'time'       => __('Enter a valid time.', 'baselayer'),
		'datetime'   => __('Enter a valid date and time.', 'baselayer'),
		'file'       => __('Please upload a valid file.', 'baselayer'),
		'option'     => __('Please choose a valid option.', 'baselayer'),
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
		'required_message'   => 'required',
		'min_message'        => 'min',
		'max_message'        => 'max',
		'number_message'     => 'number',
		'email_message'      => 'email',
		'url_message'        => 'url',
		'phone_message'      => 'phone',
		'date_message'       => 'date',
		'time_message'       => 'time',
		'datetime_message'   => 'datetime',
		'file_message'       => 'file',
		'option_message'     => 'option',
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
	return ['100', '75', '66', '50', '33', '25', 'auto'];
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
 * Sanitize a single CSS length for inline styles (blocks injection).
 *
 * Allows: 24px, 1.5rem, 50%, 10vw, auto. Rejects ; } url( etc.
 */
function bl_forms_sanitize_css_length(string $raw, string $fallback = ''): string
{
	$value = trim($raw);
	if ($value === '') {
		return $fallback;
	}
	if (strcasecmp($value, 'auto') === 0) {
		return 'auto';
	}
	if (preg_match('/^(-?\d+(?:\.\d+)?)(px|rem|em|%|vh|vw|vmin|vmax|ch|ex)$/i', $value)) {
		return $value;
	}

	return $fallback;
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

	$custom = '';
	if ($width === 'custom') {
		$custom = bl_forms_sanitize_css_length((string) ($field['width_custom'] ?? ''), '');
		if ($custom === '') {
			$width = '100';
		}
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
	if ($width === 'auto') {
		return [
			'width'  => 'auto',
			'factor' => '0',
		];
	}
	if ($width === 'custom') {
		$custom = bl_forms_sanitize_css_length(trim((string) ($field['width_custom'] ?? '')), '');
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
 * Sanitize an optional numeric string (empty allowed).
 */
function bl_forms_sanitize_optional_number(string $raw): string
{
	$value = trim(sanitize_text_field($raw));
	if ($value === '' || !is_numeric($value)) {
		return '';
	}

	return $value;
}

/**
 * Sanitize a field default so it matches the field type (or clear it).
 */
function bl_forms_sanitize_typed_default(string $type, string $raw): string
{
	if ($type === 'textarea') {
		return sanitize_textarea_field($raw);
	}

	$value = sanitize_text_field($raw);
	if ($value === '') {
		return '';
	}

	switch ($type) {
		case 'number':
			return is_numeric($value) ? $value : '';
		case 'email':
			$email = sanitize_email($value);
			return is_email($email) ? $email : '';
		case 'url':
			$url = esc_url_raw($value);
			return $url !== '' ? $url : '';
		case 'phone':
			return bl_forms_is_valid_phone($value) ? $value : '';
		case 'date':
			return bl_forms_is_valid_date($value) ? $value : '';
		case 'time':
			return bl_forms_is_valid_time($value) ? $value : '';
		case 'datetime':
			return bl_forms_is_valid_datetime($value) ? $value : '';
		default:
			return $value;
	}
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

	// Built-in form honeypot lives in settings; drop palette honeypot fields.
	if ($type === 'honeypot') {
		return null;
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

	if ($type === 'column') {
		$children_in = isset($field['children']) && is_array($field['children']) ? $field['children'] : [];
		$children = [];
		$blocked = bl_forms_root_only_field_types();
		foreach ($children_in as $child) {
			$clean = bl_forms_sanitize_field($child);
			if ($clean === null) {
				continue;
			}
			$child_type = (string) ($clean['type'] ?? '');
			if (in_array($child_type, $blocked, true)) {
				continue;
			}
			$children[] = $clean;
		}
		$out['children'] = $children;
		unset($out['name'], $out['name_manual'], $out['hide_label'], $out['label']);

		return $out;
	}

	if ($type === 'section') {
		$children_in = isset($field['children']) && is_array($field['children']) ? $field['children'] : [];
		$children = [];
		$blocked = bl_forms_root_only_field_types();
		foreach ($children_in as $child) {
			$clean = bl_forms_sanitize_field($child);
			if ($clean === null) {
				continue;
			}
			$child_type = (string) ($clean['type'] ?? '');
			// One level only — no nested columns/sections.
			if (in_array($child_type, $blocked, true)) {
				continue;
			}
			$children[] = $clean;
		}
		$out['label'] = sanitize_text_field((string) ($field['label'] ?? ''));
		$out['children'] = $children;
		$out['width'] = '100';
		$out['width_custom'] = '';
		unset($out['name'], $out['name_manual'], $out['hide_label']);

		return $out;
	}

	if ($type === 'divider') {
		unset($out['name'], $out['label'], $out['name_manual'], $out['hide_label']);

		return $out;
	}

	if ($type === 'captcha') {
		$provider = sanitize_key((string) ($field['captcha_provider'] ?? 'turnstile'));
		if (!in_array($provider, bl_forms_captcha_providers(), true)) {
			$provider = 'turnstile';
		}
		$out['captcha_provider'] = $provider;
		$out['captcha_site_key'] = sanitize_text_field((string) ($field['captcha_site_key'] ?? ''));
		$out['captcha_secret_key'] = sanitize_text_field((string) ($field['captcha_secret_key'] ?? ''));
		unset($out['name'], $out['label'], $out['name_manual'], $out['hide_label']);

		return $out;
	}

	if ($type === 'spacer') {
		$presets = ['xs', 's', 'm', 'l', 'xl', 'custom'];
		$raw = sanitize_key((string) ($field['height'] ?? 'm'));
		// Legacy free-form CSS lengths → custom.
		$legacy = trim((string) ($field['height'] ?? ''));
		if ($raw === '' || !in_array($raw, $presets, true)) {
			if ($legacy !== '' && preg_match('/^(-?\d+(?:\.\d+)?)(px|rem|em|%|vh|vw|vmin|vmax|ch|ex)$/i', $legacy)) {
				$out['height'] = 'custom';
				$out['height_custom'] = bl_forms_sanitize_css_length($legacy, '24px');
			} else {
				$out['height'] = 'm';
				unset($out['height_custom']);
			}
		} elseif ($raw === 'custom') {
			$custom = (string) ($field['height_custom'] ?? '');
			if ($custom === '' && $legacy !== '' && $legacy !== 'custom') {
				$custom = $legacy;
			}
			$out['height'] = 'custom';
			$out['height_custom'] = bl_forms_sanitize_css_length($custom, '24px');
		} else {
			$out['height'] = $raw;
			unset($out['height_custom']);
		}
		unset($out['name'], $out['label'], $out['name_manual'], $out['hide_label'], $out['placeholder']);

		return $out;
	}

	if ($type === 'heading') {
		$content = (string) ($field['content'] ?? '');
		$out['content'] = sanitize_textarea_field($content);
		$level = sanitize_key((string) ($field['level'] ?? 'h2'));
		$allowed = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
		$out['level'] = in_array($level, $allowed, true) ? $level : 'h2';
		unset($out['name'], $out['name_manual'], $out['hide_label']);

		return $out;
	}

	if (in_array($type, ['text_block', 'html'], true)) {
		$content = (string) ($field['content'] ?? '');
		$out['content'] = $type === 'html'
			? wp_kses_post($content)
			: sanitize_textarea_field($content);
		unset($out['name'], $out['name_manual'], $out['hide_label'], $out['level']);

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
	$out['readonly'] = !empty($field['readonly']);
	$out['disabled'] = !empty($field['disabled']);
	$out['placeholder'] = sanitize_text_field((string) ($field['placeholder'] ?? ''));

	$no_readonly = ['radio', 'checkboxes', 'button_group', 'toggle', 'terms', 'file', 'image'];
	if (in_array($type, $no_readonly, true)) {
		unset($out['readonly']);
	}

	$autocomplete_types = ['text', 'email', 'url', 'number', 'phone', 'textarea', 'select'];
	if (in_array($type, $autocomplete_types, true)) {
		$out['autocomplete'] = (($field['autocomplete'] ?? 'auto') === 'off') ? 'off' : 'auto';
	} else {
		unset($out['autocomplete']);
	}

	if ($type === 'number') {
		$min = bl_forms_sanitize_optional_number((string) ($field['min'] ?? ''));
		$max = bl_forms_sanitize_optional_number((string) ($field['max'] ?? ''));
		if ($min !== '' && $max !== '' && (float) $min > (float) $max) {
			$max = '';
		}
		if ($min !== '') {
			$out['min'] = $min;
		} else {
			unset($out['min']);
		}
		if ($max !== '') {
			$out['max'] = $max;
		} else {
			unset($out['max']);
		}
		unset(
			$out['min_mode'],
			$out['max_mode'],
			$out['default_mode'],
			$out['min_offset'],
			$out['max_offset'],
			$out['default_offset']
		);
	} else {
		$out = bl_forms_sanitize_temporal_bounds($out, $field);
	}

	if (in_array($type, ['date', 'time', 'datetime'], true)) {
		unset($out['placeholder']);
	}

	if (in_array($type, ['text', 'email', 'url', 'number', 'phone', 'textarea', 'date', 'time', 'datetime', 'file', 'image', 'toggle'], true)) {
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

	$no_default = ['file', 'image', 'honeypot', 'captcha'];
	if (
		!isset($out['default_value'])
		&& !in_array($type, $no_default, true)
		&& !in_array($type, ['date', 'time', 'datetime'], true)
	) {
		$out['default_value'] = bl_forms_sanitize_typed_default(
			$type,
			(string) ($field['default_value'] ?? '')
		);
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
			if (!is_array($field)) {
				continue;
			}
			// Legacy layout groups → consecutive root columns.
			if (($field['type'] ?? '') === 'group') {
				$children = isset($field['children']) && is_array($field['children']) ? $field['children'] : [];
				foreach ($children as $child) {
					$clean = bl_forms_sanitize_field($child);
					if ($clean !== null && ($clean['type'] ?? '') === 'column') {
						$fields[] = $clean;
					}
				}
				continue;
			}
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
	$bool_keys = ['notify_user', 'min_fill_time_enabled', 'rate_limit_enabled'];
	$int_keys = [
		'min_fill_time'      => [1, 300],
		'rate_limit_max'     => [1, 100],
		'rate_limit_window'  => [1, 1440],
		'redirect_page_id'   => [0, PHP_INT_MAX],
	];

	foreach ($settings as $key => $default) {
		if (!array_key_exists($key, $settings_in)) {
			continue;
		}
		if (in_array($key, $bool_keys, true)) {
			$settings[$key] = !empty($settings_in[$key]);
			continue;
		}
		if (isset($int_keys[$key])) {
			[$min, $max] = $int_keys[$key];
			$settings[$key] = max($min, min($max, (int) $settings_in[$key]));
			continue;
		}
		if ($key === 'after_submit') {
			$mode = sanitize_key((string) $settings_in[$key]);
			$settings[$key] = in_array($mode, ['message', 'redirect'], true) ? $mode : 'message';
			continue;
		}
		if ($key === 'user_email_field' || $key === 'honeypot_name') {
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

	$used_names = [];
	foreach (bl_forms_iter_fields($fields) as $field) {
		$name = sanitize_key((string) ($field['name'] ?? ''));
		if ($name !== '') {
			$used_names[$name] = true;
		}
	}

	$hp = (string) ($settings['honeypot_name'] ?? '');
	$reserved = ['action', 'form_id', 'nonce', 'fields', 'bl_forms_loaded', 'bl_forms_loaded_sig', 'bl_forms_js'];
	if ($hp === '') {
		// Stable until the builder saves a random name.
		$hp = 'bl_forms_hp';
	}
	if (isset($used_names[$hp]) || in_array($hp, $reserved, true)) {
		do {
			$hp = bl_forms_generate_honeypot_name();
		} while (isset($used_names[$hp]) || in_array($hp, $reserved, true));
	}
	$settings['honeypot_name'] = $hp;

	return [
		'fields'   => $fields,
		'settings' => $settings,
	];
}

/**
 * Ensure field name keys are unique within a form (walks layout trees).
 *
 * @param list<array<string, mixed>> $fields
 * @param array<string, true>        $used
 * @return list<array<string, mixed>>
 */
function bl_forms_ensure_unique_field_names(array $fields, array &$used = []): array
{
	foreach ($fields as $index => $field) {
		$type = (string) ($field['type'] ?? '');
		if (in_array($type, bl_forms_layout_field_types(), true)) {
			$children = isset($field['children']) && is_array($field['children']) ? $field['children'] : [];
			$fields[$index]['children'] = bl_forms_ensure_unique_field_names($children, $used);
			continue;
		}

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

	foreach (bl_forms_iter_fields($config['fields'] ?? []) as $field) {
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
