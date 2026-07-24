<?php

defined('ABSPATH') || exit;

/**
 * Settings key for a min/max validation message (number vs date/time/datetime).
 *
 * @param array<string, mixed> $field
 * @param 'min'|'max'          $which
 */
function bl_forms_range_message_key(array $field, string $which): string
{
	$type = (string) ($field['type'] ?? '');
	if ($type === 'date') {
		return $which === 'max' ? 'date_max_message' : 'date_min_message';
	}
	if ($type === 'time') {
		return $which === 'max' ? 'time_max_message' : 'time_min_message';
	}
	if ($type === 'datetime') {
		return $which === 'max' ? 'datetime_max_message' : 'datetime_min_message';
	}

	return $which === 'max' ? 'max_message' : 'min_message';
}

/**
 * Human-readable validation message for a field error code.
 *
 * @param array<string, mixed> $field
 * @param array<string, mixed> $settings
 * @param string               $bound Resolved min/max value for range errors.
 */
function bl_forms_field_error_message(string $code, array $field = [], array $settings = [], string $bound = ''): string
{
	switch ($code) {
		case 'required':
			return bl_forms_resolve_message($settings, 'required_message');
		case 'min':
			$value = $bound !== '' ? $bound : (string) ($field['min'] ?? '');
			return sprintf(
				bl_forms_resolve_message($settings, bl_forms_range_message_key($field, 'min')),
				$value
			);
		case 'max':
			$value = $bound !== '' ? $bound : (string) ($field['max'] ?? '');
			return sprintf(
				bl_forms_resolve_message($settings, bl_forms_range_message_key($field, 'max')),
				$value
			);
		case 'maxlength':
			$value = $bound !== '' ? $bound : (string) (bl_forms_field_max_length($field) ?: '');
			return sprintf(
				bl_forms_resolve_message($settings, 'maxlength_message'),
				$value
			);
		case 'number':
			return bl_forms_resolve_message($settings, 'number_message');
		case 'email':
			return bl_forms_resolve_message($settings, 'email_message');
		case 'url':
			return bl_forms_resolve_message($settings, 'url_message');
		case 'phone':
			return bl_forms_resolve_message($settings, 'phone_message');
		case 'date':
			return bl_forms_resolve_message($settings, 'date_message');
		case 'time':
			return bl_forms_resolve_message($settings, 'time_message');
		case 'datetime':
			return bl_forms_resolve_message($settings, 'datetime_message');
		case 'date_before':
			return sprintf(
				bl_forms_resolve_message($settings, 'date_before_message'),
				$bound !== '' ? $bound : ''
			);
		case 'date_after':
			return sprintf(
				bl_forms_resolve_message($settings, 'date_after_message'),
				$bound !== '' ? $bound : ''
			);
		case 'file':
			return bl_forms_resolve_message($settings, 'file_message');
		case 'file_type':
			$template = bl_forms_resolve_message($settings, 'file_type_message');
			if ($bound !== '' && strpos($template, '%s') !== false) {
				return sprintf($template, $bound);
			}
			if ($template !== '' && strpos($template, '%s') === false) {
				return $template;
			}
			if ($bound !== '') {
				return sprintf(bl_forms_message_fallbacks()['file_type'], $bound);
			}
			return __('This file type is not allowed.', 'baselayer-forms');
		case 'file_size':
			$value = $bound !== '' ? $bound : (string) size_format(bl_forms_upload_max_bytes($settings));
			return sprintf(
				bl_forms_resolve_message($settings, 'file_size_message'),
				$value
			);
		case 'file_max':
			$value = $bound !== '' ? $bound : (string) bl_forms_field_max_files($field);
			return sprintf(
				bl_forms_resolve_message($settings, 'file_max_message'),
				$value
			);
		case 'option':
			return bl_forms_resolve_message($settings, 'option_message');
		default:
			return __('Please check this field.', 'baselayer-forms');
	}
}

/**
 * AJAX submit handler (logged-in + guests).
 */
function bl_forms_ajax_submit(): void
{
	$form_id = isset($_POST['form_id']) ? (int) $_POST['form_id'] : 0;
	$nonce = isset($_POST['nonce']) ? (string) wp_unslash($_POST['nonce']) : '';

	if ($form_id <= 0 || get_post_type($form_id) !== BL_FORM_POST_TYPE || get_post_status($form_id) !== 'publish') {
		wp_send_json_error([
			'message' => bl_forms_message_fallbacks()['error'],
			'code'    => 'invalid_form',
		], 400);
	}

	if (!wp_verify_nonce($nonce, 'bl_forms_submit_' . $form_id)) {
		wp_send_json_error([
			'message' => bl_forms_message_fallbacks()['error'],
			'code'    => 'invalid_nonce',
		], 403);
	}

	$config = bl_forms_get_config($form_id);
	$settings = $config['settings'];
	$raw_fields = isset($_POST['fields']) && is_array($_POST['fields']) ? wp_unslash($_POST['fields']) : [];

	$hp_name = sanitize_key((string) ($settings['honeypot_name'] ?? ''));
	$hp = '';
	if ($hp_name !== '' && isset($_POST[$hp_name])) {
		$hp = trim((string) wp_unslash($_POST[$hp_name]));
	}
	// Legacy fixed honeypot name.
	if ($hp === '' && isset($_POST['bl_forms_hp'])) {
		$hp = trim((string) wp_unslash($_POST['bl_forms_hp']));
	}

	if ($hp !== '' || bl_forms_honeypot_triggered($config['fields'], $raw_fields)) {
		wp_send_json_success([
			'message' => bl_forms_resolve_message($settings, 'success_message'),
		]);
	}

	if (!bl_forms_js_check_ok($form_id)) {
		// No JS (or forged POST): pretend success like the honeypot.
		wp_send_json_success([
			'message' => bl_forms_resolve_message($settings, 'success_message'),
		]);
	}

	if (!bl_forms_fill_time_ok($form_id, $settings)) {
		wp_send_json_error([
			'message' => __('Please wait a moment before submitting.', 'baselayer-forms'),
			'code'    => 'too_fast',
		], 429);
	}

	if (!bl_forms_rate_limit_ok($form_id, $settings)) {
		wp_send_json_error([
			'message' => __('Please wait a moment before submitting again.', 'baselayer-forms'),
			'code'    => 'rate_limited',
		], 429);
	}

	$captcha_field = bl_forms_find_captcha_field($config['fields']);
	if ($captcha_field !== null) {
		$provider = sanitize_key((string) ($captcha_field['captcha_provider'] ?? 'turnstile'));
		$response_key = bl_forms_captcha_response_key($provider);
		$token = ($response_key !== '' && isset($_POST[$response_key]))
			? trim((string) wp_unslash($_POST[$response_key]))
			: '';
		$remote_ip = isset($_SERVER['REMOTE_ADDR']) ? (string) wp_unslash($_SERVER['REMOTE_ADDR']) : '';
		if (!bl_forms_verify_captcha($captcha_field, $token, $remote_ip)) {
			wp_send_json_error([
				'message' => __('Please complete the CAPTCHA and try again.', 'baselayer-forms'),
				'code'    => 'captcha_failed',
			], 422);
		}
	}

	[$values, $invalid] = bl_forms_validate_submission($config['fields'], $raw_fields, $_FILES, $settings);
	if ($invalid !== []) {
		wp_send_json_error([
			'message' => bl_forms_resolve_message($settings, 'validation_message'),
			'code'    => 'validation',
			'fields'  => $invalid,
		], 422);
	}

	$form_title = get_the_title($form_id);
	if ($form_title === '') {
		$form_title = sprintf(__('Form #%d', 'baselayer-forms'), $form_id);
	}

	$entry_id = wp_insert_post([
		'post_type'   => BL_FORM_ENTRY_POST_TYPE,
		'post_status' => 'publish',
		'post_title'  => sprintf(
			/* translators: 1: form title, 2: datetime */
			__('%1$s — %2$s', 'baselayer-forms'),
			$form_title,
			wp_date('Y-m-d H:i')
		),
	], true);

	if (is_wp_error($entry_id) || !$entry_id) {
		wp_send_json_error([
			'message' => bl_forms_resolve_message($settings, 'error_message'),
			'code'    => 'entry_failed',
		], 500);
	}

	$entry_id = (int) $entry_id;
	update_post_meta($entry_id, BL_FORM_ENTRY_FORM_META, $form_id);
	update_post_meta($entry_id, BL_FORM_ENTRY_FIELDS_META, $values);
	update_post_meta($entry_id, BL_FORM_ENTRY_META_META, [
		'ip_hash'    => bl_forms_client_ip_hash(),
		'user_agent' => isset($_SERVER['HTTP_USER_AGENT'])
			? substr(sanitize_text_field((string) wp_unslash($_SERVER['HTTP_USER_AGENT'])), 0, 255)
			: '',
		'created'    => time(),
	]);

	$mail = bl_forms_send_emails($form_id, $entry_id, $config, $values);
	update_post_meta($entry_id, BL_FORM_ENTRY_MAIL_META, $mail);

	// Count only completed submissions (not failed validation / early rejects).
	bl_forms_rate_limit_hit($form_id, $settings);

	wp_send_json_success([
		'message'  => bl_forms_resolve_message($settings, 'success_message'),
		'entry_id' => $entry_id,
		'redirect' => bl_forms_after_submit_redirect_url($settings),
	]);
}
add_action('wp_ajax_bl_forms_submit', 'bl_forms_ajax_submit');
add_action('wp_ajax_nopriv_bl_forms_submit', 'bl_forms_ajax_submit');

/**
 * Whether any builder honeypot field was filled (bot signal).
 *
 * @param list<array<string, mixed>> $fields
 * @param array<string, mixed>       $raw
 */
function bl_forms_honeypot_triggered(array $fields, array $raw): bool
{
	foreach (bl_forms_iter_fields($fields) as $field) {
		if ((string) ($field['type'] ?? '') !== 'honeypot') {
			continue;
		}
		$name = (string) ($field['name'] ?? '');
		if ($name === '') {
			continue;
		}
		$value = $raw[$name] ?? null;
		if (is_scalar($value) && trim((string) $value) !== '') {
			return true;
		}
	}

	return false;
}

/**
 * Whether the JavaScript check field was filled with the expected token.
 */
function bl_forms_js_check_ok(int $form_id): bool
{
	$loaded_at = isset($_POST['bl_forms_loaded']) ? (int) wp_unslash($_POST['bl_forms_loaded']) : 0;
	$token = isset($_POST['bl_forms_js']) ? (string) wp_unslash($_POST['bl_forms_js']) : '';
	if ($loaded_at <= 0 || $token === '') {
		return false;
	}

	return hash_equals(bl_forms_js_check_token($form_id, $loaded_at), $token);
}

/**
 * Whether the submission waited long enough after the form was rendered.
 *
 * @param array<string, mixed> $settings
 */
function bl_forms_fill_time_ok(int $form_id, array $settings): bool
{
	if (empty($settings['min_fill_time_enabled'])) {
		return true;
	}

	$min = max(1, (int) ($settings['min_fill_time'] ?? 2));
	$loaded_at = isset($_POST['bl_forms_loaded']) ? (int) wp_unslash($_POST['bl_forms_loaded']) : 0;
	$sig = isset($_POST['bl_forms_loaded_sig']) ? (string) wp_unslash($_POST['bl_forms_loaded_sig']) : '';

	if ($loaded_at <= 0 || $sig === '' || !hash_equals(bl_forms_fill_time_signature($form_id, $loaded_at), $sig)) {
		return false;
	}

	$elapsed = time() - $loaded_at;
	// Reject forged future timestamps and absurdly old loads (1 day).
	if ($elapsed < $min || $elapsed > DAY_IN_SECONDS) {
		return false;
	}

	return true;
}

/**
 * Soft rate limit per form / IP, using form security settings.
 *
 * Check only — the counter is incremented via bl_forms_rate_limit_hit()
 * after a successful submission.
 *
 * @param array<string, mixed> $settings
 */
function bl_forms_rate_limit_ok(int $form_id, array $settings = []): bool
{
	if ($settings !== [] && empty($settings['rate_limit_enabled'])) {
		return true;
	}

	$max = max(1, (int) ($settings['rate_limit_max'] ?? 3));
	$count = (int) get_transient(bl_forms_rate_limit_key($form_id));

	return $count < $max;
}

/**
 * Record a successful submission against the rate limit.
 *
 * @param array<string, mixed> $settings
 */
function bl_forms_rate_limit_hit(int $form_id, array $settings = []): void
{
	if ($settings !== [] && empty($settings['rate_limit_enabled'])) {
		return;
	}

	$window = max(1, (int) ($settings['rate_limit_window'] ?? 5));
	$key = bl_forms_rate_limit_key($form_id);
	$count = (int) get_transient($key);
	set_transient($key, $count + 1, $window * MINUTE_IN_SECONDS);
}

/**
 * Transient key for the form / IP rate limit.
 */
function bl_forms_rate_limit_key(int $form_id): string
{
	return 'bl_forms_rl_' . $form_id . '_' . bl_forms_client_ip_hash();
}

/**
 * Hashed client IP (privacy-friendly).
 */
function bl_forms_client_ip_hash(): string
{
	$ip = '';
	if (!empty($_SERVER['REMOTE_ADDR'])) {
		$ip = (string) wp_unslash($_SERVER['REMOTE_ADDR']);
	}

	return hash('sha256', $ip . wp_salt('nonce'));
}

/**
 * Validate and sanitize submitted fields (including uploads).
 *
 * @param list<array<string, mixed>> $fields
 * @param array<string, mixed>       $raw
 * @param array<string, mixed>       $files Raw $_FILES.
 * @param array<string, mixed>       $settings Form settings (for custom validation copy).
 * @return array{0: array<string, mixed>, 1: array<string, string>}
 */
function bl_forms_validate_submission(array $fields, array $raw, array $files = [], array $settings = []): array
{
	$values = [];
	/** @var array<string, string> $invalid */
	$invalid = [];

	foreach (bl_forms_iter_fields($fields) as $field) {
		$type = (string) ($field['type'] ?? '');
		if (in_array($type, bl_forms_content_field_types(), true) || $type === 'honeypot') {
			continue;
		}
		if (!bl_forms_field_is_active($field)) {
			continue;
		}

		$name = (string) ($field['name'] ?? '');
		if ($name === '') {
			continue;
		}

		$required = !empty($field['required']);
		$raw_value = $raw[$name] ?? null;
		$multiple = !empty($field['multiple']);

		// Disabled controls are not posted — use configured defaults and skip required checks.
		if (!empty($field['disabled'])) {
			if (in_array($type, ['file', 'image'], true)) {
				$values[$name] = [];
			} elseif ($type === 'checkboxes' || ($type === 'button_group' && $multiple) || ($type === 'select' && $multiple)) {
				$values[$name] = bl_forms_field_default_values($field);
			} elseif ($type === 'terms' || $type === 'toggle') {
				$values[$name] = bl_forms_field_default_checked($field) ? '1' : '';
			} elseif (in_array($type, ['date', 'time', 'datetime'], true)) {
				$values[$name] = bl_forms_resolve_temporal_bound($field, 'default');
			} else {
				$values[$name] = sanitize_text_field((string) ($field['default_value'] ?? ''));
			}
			continue;
		}

		if ($type === 'hidden') {
			$value = is_scalar($raw_value) ? sanitize_text_field((string) $raw_value) : '';
			if ($value === '') {
				$value = sanitize_text_field((string) ($field['default_value'] ?? ''));
			}
			$values[$name] = $value;
			continue;
		}

		if (in_array($type, ['file', 'image'], true)) {
			[$stored, $error_code, $error_bound] = bl_forms_process_field_uploads(
				$name,
				$files,
				$field,
				$multiple,
				$settings
			);
			$values[$name] = $stored;
			if ($error_code !== '') {
				$invalid[$name] = bl_forms_field_error_message($error_code, $field, $settings, $error_bound);
			} elseif ($required && $stored === []) {
				$invalid[$name] = bl_forms_field_error_message('required', $field, $settings);
			}
			continue;
		}

		if ($type === 'checkboxes' || ($type === 'button_group' && $multiple) || ($type === 'select' && $multiple)) {
			$list = [];
			if (is_array($raw_value)) {
				foreach ($raw_value as $item) {
					$list[] = sanitize_text_field((string) $item);
				}
			} elseif (is_scalar($raw_value) && (string) $raw_value !== '') {
				$list[] = sanitize_text_field((string) $raw_value);
			}

			if (in_array($type, ['checkboxes', 'button_group', 'select'], true)) {
				$list = bl_forms_filter_allowed_option_values($field, $list);
			}

			$values[$name] = $list;
			if ($required && $list === []) {
				$invalid[$name] = bl_forms_field_error_message('required', $field, $settings);
			}
			continue;
		}

		if ($type === 'terms' || $type === 'toggle') {
			$checked = !empty($raw_value);
			$values[$name] = $checked ? '1' : '';
			if ($required && !$checked) {
				$invalid[$name] = bl_forms_field_error_message('required', $field, $settings);
			}
			continue;
		}

		$value = is_scalar($raw_value) ? trim((string) $raw_value) : '';
		if ($type === 'textarea') {
			$value = sanitize_textarea_field($value);
		} elseif ($type === 'email') {
			$value = sanitize_email($value);
		} elseif ($type === 'url') {
			$value = esc_url_raw($value);
		} elseif ($type === 'number') {
			if ($value !== '' && !is_numeric($value)) {
				$values[$name] = sanitize_text_field($value);
				$invalid[$name] = bl_forms_field_error_message('number', $field, $settings);
				continue;
			}
		} elseif ($type === 'phone') {
			$value = sanitize_text_field($value);
			if ($value !== '' && !bl_forms_is_valid_phone($value)) {
				$values[$name] = $value;
				$invalid[$name] = bl_forms_field_error_message('phone', $field, $settings);
				continue;
			}
		} elseif ($type === 'date') {
			$value = sanitize_text_field($value);
			if ($value !== '' && !bl_forms_is_valid_date($value)) {
				$values[$name] = $value;
				$invalid[$name] = bl_forms_field_error_message('date', $field, $settings);
				continue;
			}
		} elseif ($type === 'time') {
			$value = sanitize_text_field($value);
			if ($value !== '' && !bl_forms_is_valid_time($value)) {
				$values[$name] = $value;
				$invalid[$name] = bl_forms_field_error_message('time', $field, $settings);
				continue;
			}
		} elseif ($type === 'datetime') {
			$value = sanitize_text_field($value);
			if ($value !== '' && !bl_forms_is_valid_datetime($value)) {
				$values[$name] = $value;
				$invalid[$name] = bl_forms_field_error_message('datetime', $field, $settings);
				continue;
			}
		} else {
			$value = sanitize_text_field($value);
		}

		if (in_array($type, ['radio', 'select', 'button_group'], true) && $value !== '') {
			$allowed = bl_forms_filter_allowed_option_values($field, [$value]);
			$value = $allowed[0] ?? '';
			if ($value === '' && $raw_value !== null && (string) $raw_value !== '') {
				$invalid[$name] = bl_forms_field_error_message('option', $field, $settings);
				$values[$name] = '';
				continue;
			}
		}

		$values[$name] = $value;

		if ($required && $value === '') {
			$invalid[$name] = bl_forms_field_error_message('required', $field, $settings);
			continue;
		}

		if (in_array($type, ['text', 'textarea', 'email', 'phone', 'url'], true) && $value !== '') {
			$max_length = bl_forms_field_max_length($field);
			if ($max_length > 0 && bl_forms_string_length($value) > $max_length) {
				$invalid[$name] = bl_forms_field_error_message('maxlength', $field, $settings, (string) $max_length);
				continue;
			}
		}

		if ($type === 'email' && $value !== '' && !is_email($value)) {
			$invalid[$name] = bl_forms_field_error_message('email', $field, $settings);
			continue;
		}

		if ($type === 'url' && $value !== '') {
			$valid_url = function_exists('wp_http_validate_url')
				? (bool) wp_http_validate_url($value)
				: (bool) filter_var($value, FILTER_VALIDATE_URL);
			if (!$valid_url) {
				$invalid[$name] = bl_forms_field_error_message('url', $field, $settings);
				continue;
			}
		}

		if ($type === 'number' && $value !== '' && is_numeric($value)) {
			$num = (float) $value;
			$min = isset($field['min']) ? bl_forms_sanitize_optional_number((string) $field['min']) : '';
			$max = isset($field['max']) ? bl_forms_sanitize_optional_number((string) $field['max']) : '';
			if ($min !== '' && $num < (float) $min) {
				$invalid[$name] = bl_forms_field_error_message('min', $field, $settings, $min);
				continue;
			}
			if ($max !== '' && $num > (float) $max) {
				$invalid[$name] = bl_forms_field_error_message('max', $field, $settings, $max);
				continue;
			}
		}

		if (in_array($type, ['date', 'time', 'datetime'], true) && $value !== '') {
			$min = bl_forms_resolve_temporal_bound($field, 'min');
			$max = bl_forms_resolve_temporal_bound($field, 'max');
			if ($min !== '' && bl_forms_compare_temporal_values($type, $value, $min) < 0) {
				$invalid[$name] = bl_forms_field_error_message('min', $field, $settings, $min);
				continue;
			}
			if ($max !== '' && bl_forms_compare_temporal_values($type, $value, $max) > 0) {
				$invalid[$name] = bl_forms_field_error_message('max', $field, $settings, $max);
				continue;
			}
		}
	}

	// Second pass: date/time relations (before / after another field).
	$field_by_name = [];
	foreach (bl_forms_iter_fields($fields) as $field) {
		$fname = (string) ($field['name'] ?? '');
		if ($fname !== '') {
			$field_by_name[$fname] = $field;
		}
	}
	foreach ($field_by_name as $name => $field) {
		if (isset($invalid[$name])) {
			continue;
		}
		$type = (string) ($field['type'] ?? '');
		if (!in_array($type, ['date', 'time', 'datetime'], true)) {
			continue;
		}
		$relation = sanitize_key((string) ($field['relation'] ?? ''));
		$related_name = sanitize_key((string) ($field['relation_field'] ?? ''));
		if (!in_array($relation, ['before', 'after'], true) || $related_name === '') {
			continue;
		}
		$value = isset($values[$name]) ? (string) $values[$name] : '';
		$other = isset($values[$related_name]) ? (string) $values[$related_name] : '';
		if ($value === '' || $other === '') {
			continue;
		}
		$related = $field_by_name[$related_name] ?? null;
		if (!is_array($related) || (string) ($related['type'] ?? '') !== $type) {
			continue;
		}
		$cmp = bl_forms_compare_temporal_values($type, $value, $other);
		$other_label = trim((string) ($related['label'] ?? ''));
		if ($other_label === '') {
			$other_label = $related_name;
		}
		if ($relation === 'before' && $cmp >= 0) {
			$invalid[$name] = bl_forms_field_error_message('date_before', $field, $settings, $other_label);
		} elseif ($relation === 'after' && $cmp <= 0) {
			$invalid[$name] = bl_forms_field_error_message('date_after', $field, $settings, $other_label);
		}
	}

	return [$values, $invalid];
}

/**
 * Keep only option values that exist on the field definition.
 *
 * @param array<string, mixed> $field
 * @param list<string>         $values
 * @return list<string>
 */
function bl_forms_filter_allowed_option_values(array $field, array $values): array
{
	$allowed = [];
	$options = isset($field['options']) && is_array($field['options']) ? $field['options'] : [];
	foreach ($options as $opt) {
		if (is_array($opt) && isset($opt['value'])) {
			$allowed[] = (string) $opt['value'];
		}
	}
	if ($allowed === []) {
		return $values;
	}

	return array_values(array_filter($values, static function ($value) use ($allowed) {
		return in_array((string) $value, $allowed, true);
	}));
}

/**
 * Normalize and store uploads for one field.
 *
 * @param array<string, mixed> $files Raw $_FILES.
 * @param array<string, mixed> $field Field config.
 * @param array<string, mixed> $settings Form settings.
 * @return array{0: list<array{id:int,url:string,name:string,mime:string}>, 1: string, 2: string}
 *         [stored, error_code, error_bound]. Empty error_code means success.
 */
function bl_forms_process_field_uploads(string $name, array $files, array $field, bool $multiple, array $settings = []): array
{
	$bucket = bl_forms_extract_uploaded_files($name, $files);
	if ($bucket === []) {
		return [[], '', ''];
	}

	if (!$multiple) {
		$bucket = [$bucket[0]];
	} else {
		$max_files = bl_forms_field_max_files($field);
		$present = 0;
		foreach ($bucket as $file) {
			if (!is_array($file) || (int) ($file['error'] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_NO_FILE) {
				continue;
			}
			$present++;
		}
		if ($present > $max_files) {
			return [[], 'file_max', (string) $max_files];
		}
	}

	$images_only = ((string) ($field['type'] ?? '')) === 'image';
	$extensions = bl_forms_field_extensions($field);
	$max_bytes = bl_forms_upload_max_bytes($settings);
	$ext_label = $extensions !== []
		? strtoupper(implode(', ', $extensions))
		: '';
	$size_label = $max_bytes > 0 ? (string) size_format($max_bytes) : '';
	$stored = [];
	$error_code = '';
	$error_bound = '';

	foreach ($bucket as $file) {
		if (!is_array($file) || (int) ($file['error'] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_NO_FILE) {
			continue;
		}
		if ((int) ($file['error'] ?? UPLOAD_ERR_OK) !== UPLOAD_ERR_OK) {
			if ($error_code === '') {
				$error_code = 'file';
			}
			continue;
		}
		if (!bl_forms_extension_allowed((string) ($file['name'] ?? ''), $extensions)) {
			if ($error_code === '') {
				$error_code = 'file_type';
				$error_bound = $ext_label;
			}
			continue;
		}
		if ($max_bytes > 0 && (int) ($file['size'] ?? 0) > $max_bytes) {
			if ($error_code === '') {
				$error_code = 'file_size';
				$error_bound = $size_label;
			}
			continue;
		}

		$result = bl_forms_store_uploaded_file($file, $images_only, $extensions);
		if (is_wp_error($result)) {
			if ($error_code === '') {
				$error_code = 'file';
			}
			continue;
		}
		$stored[] = $result;
	}

	return [$stored, $error_code, $error_bound];
}

/**
 * Pull one field's file entries out of nested $_FILES['fields'].
 *
 * @param array<string, mixed> $files
 * @return list<array{name:string,type:string,tmp_name:string,error:int,size:int}>
 */
function bl_forms_extract_uploaded_files(string $name, array $files): array
{
	if (!isset($files['fields']) || !is_array($files['fields'])) {
		return [];
	}

	$root = $files['fields'];
	if (!isset($root['name'][$name])) {
		return [];
	}

	$names = $root['name'][$name];
	if (!is_array($names)) {
		return [[
			'name'     => (string) $names,
			'type'     => (string) ($root['type'][$name] ?? ''),
			'tmp_name' => (string) ($root['tmp_name'][$name] ?? ''),
			'error'    => (int) ($root['error'][$name] ?? UPLOAD_ERR_NO_FILE),
			'size'     => (int) ($root['size'][$name] ?? 0),
		]];
	}

	$out = [];
	foreach ($names as $i => $filename) {
		$out[] = [
			'name'     => (string) $filename,
			'type'     => (string) ($root['type'][$name][$i] ?? ''),
			'tmp_name' => (string) ($root['tmp_name'][$name][$i] ?? ''),
			'error'    => (int) ($root['error'][$name][$i] ?? UPLOAD_ERR_NO_FILE),
			'size'     => (int) ($root['size'][$name][$i] ?? 0),
		];
	}

	return $out;
}

/**
 * Move an uploaded file into the media library.
 *
 * @param array{name:string,type:string,tmp_name:string,error:int,size:int} $file
 * @param list<string>                                                       $extensions
 * @return array{id:int,url:string,name:string,mime:string}|\WP_Error
 */
function bl_forms_store_uploaded_file(array $file, bool $images_only = false, array $extensions = [])
{
	if (!function_exists('wp_handle_upload')) {
		require_once ABSPATH . 'wp-admin/includes/file.php';
	}
	if (!function_exists('wp_generate_attachment_metadata')) {
		require_once ABSPATH . 'wp-admin/includes/image.php';
	}
	if (!function_exists('media_handle_upload') && !function_exists('wp_insert_attachment')) {
		require_once ABSPATH . 'wp-admin/includes/media.php';
	}

	$check = wp_check_filetype_and_ext($file['tmp_name'], $file['name']);
	$mime = (string) ($check['type'] ?: $file['type']);
	if ($images_only && $mime !== '' && strpos($mime, 'image/') !== 0) {
		$ext = strtolower(pathinfo((string) $file['name'], PATHINFO_EXTENSION));
		if (!in_array($ext, ['heic', 'heif'], true)) {
			return new WP_Error('bl_forms_not_image', __('Please upload an image file.', 'baselayer-forms'));
		}
	}

	$overrides = [
		'test_form' => false,
		'mimes'     => null,
	];
	$mimes = bl_forms_mimes_for_extensions($extensions);
	if ($mimes !== null) {
		$overrides['mimes'] = $mimes;
	} elseif ($images_only) {
		$overrides['mimes'] = bl_forms_mimes_for_extensions(bl_forms_default_image_extensions());
	}

	$moved = wp_handle_upload($file, $overrides);
	if (!is_array($moved) || !empty($moved['error'])) {
		return new WP_Error(
			'bl_forms_upload_failed',
			is_array($moved) && !empty($moved['error'])
				? (string) $moved['error']
				: __('Upload failed.', 'baselayer-forms')
		);
	}

	$attachment = [
		'post_mime_type' => (string) ($moved['type'] ?? $mime),
		'post_title'     => sanitize_file_name(wp_basename((string) $moved['file'])),
		'post_content'   => '',
		'post_status'    => 'inherit',
	];
	$attach_id = wp_insert_attachment($attachment, (string) $moved['file']);
	if (is_wp_error($attach_id) || !$attach_id) {
		return is_wp_error($attach_id)
			? $attach_id
			: new WP_Error('bl_forms_attach_failed', __('Could not save uploaded file.', 'baselayer-forms'));
	}

	$attach_id = (int) $attach_id;
	$meta = wp_generate_attachment_metadata($attach_id, (string) $moved['file']);
	if (is_array($meta)) {
		wp_update_attachment_metadata($attach_id, $meta);
	}

	return [
		'id'   => $attach_id,
		'url'  => (string) ($moved['url'] ?? wp_get_attachment_url($attach_id)),
		'name' => (string) ($file['name'] ?? wp_basename((string) $moved['file'])),
		'mime' => (string) ($moved['type'] ?? $mime),
	];
}
