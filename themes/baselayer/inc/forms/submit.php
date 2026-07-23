<?php

defined('ABSPATH') || exit;

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
			'message' => __('Please wait a moment before submitting.', 'baselayer'),
			'code'    => 'too_fast',
		], 429);
	}

	if (!bl_forms_rate_limit_ok($form_id, $settings)) {
		wp_send_json_error([
			'message' => __('Please wait a moment before submitting again.', 'baselayer'),
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
				'message' => __('Please complete the CAPTCHA and try again.', 'baselayer'),
				'code'    => 'captcha_failed',
			], 422);
		}
	}

	[$values, $invalid] = bl_forms_validate_submission($config['fields'], $raw_fields, $_FILES);
	if ($invalid !== []) {
		wp_send_json_error([
			'message' => bl_forms_resolve_message($settings, 'validation_message'),
			'code'    => 'validation',
			'fields'  => $invalid,
		], 422);
	}

	$form_title = get_the_title($form_id);
	if ($form_title === '') {
		$form_title = sprintf(__('Form #%d', 'baselayer'), $form_id);
	}

	$entry_id = wp_insert_post([
		'post_type'   => BL_FORM_ENTRY_POST_TYPE,
		'post_status' => 'publish',
		'post_title'  => sprintf(
			/* translators: 1: form title, 2: datetime */
			__('%1$s — %2$s', 'baselayer'),
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
 * @param array<string, mixed> $settings
 */
function bl_forms_rate_limit_ok(int $form_id, array $settings = []): bool
{
	if ($settings !== [] && empty($settings['rate_limit_enabled'])) {
		return true;
	}

	$max = max(1, (int) ($settings['rate_limit_max'] ?? 3));
	$window = max(1, (int) ($settings['rate_limit_window'] ?? 5));
	$key = 'bl_forms_rl_' . $form_id . '_' . bl_forms_client_ip_hash();
	$count = (int) get_transient($key);
	if ($count >= $max) {
		return false;
	}
	set_transient($key, $count + 1, $window * MINUTE_IN_SECONDS);

	return true;
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
 * @return array{0: array<string, mixed>, 1: list<string>}
 */
function bl_forms_validate_submission(array $fields, array $raw, array $files = []): array
{
	$values = [];
	$invalid = [];

	foreach (bl_forms_iter_fields($fields) as $field) {
		$type = (string) ($field['type'] ?? '');
		if (in_array($type, bl_forms_content_field_types(), true) || $type === 'honeypot') {
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
			[$stored, $ok] = bl_forms_process_field_uploads($name, $files, $type === 'image', $multiple);
			$values[$name] = $stored;
			if (!$ok || ($required && $stored === [])) {
				$invalid[] = $name;
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
				$invalid[] = $name;
			}
			continue;
		}

		if ($type === 'terms' || $type === 'toggle') {
			$checked = !empty($raw_value);
			$values[$name] = $checked ? '1' : '';
			if ($required && !$checked) {
				$invalid[] = $name;
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
				$invalid[] = $name;
				continue;
			}
		} elseif ($type === 'phone') {
			$value = sanitize_text_field($value);
			if ($value !== '' && !bl_forms_is_valid_phone($value)) {
				$values[$name] = $value;
				$invalid[] = $name;
				continue;
			}
		} elseif ($type === 'date') {
			$value = sanitize_text_field($value);
			if ($value !== '' && !bl_forms_is_valid_date($value)) {
				$values[$name] = $value;
				$invalid[] = $name;
				continue;
			}
		} elseif ($type === 'time') {
			$value = sanitize_text_field($value);
			if ($value !== '' && !bl_forms_is_valid_time($value)) {
				$values[$name] = $value;
				$invalid[] = $name;
				continue;
			}
		} elseif ($type === 'datetime') {
			$value = sanitize_text_field($value);
			if ($value !== '' && !bl_forms_is_valid_datetime($value)) {
				$values[$name] = $value;
				$invalid[] = $name;
				continue;
			}
		} else {
			$value = sanitize_text_field($value);
		}

		if (in_array($type, ['radio', 'select', 'button_group'], true) && $value !== '') {
			$allowed = bl_forms_filter_allowed_option_values($field, [$value]);
			$value = $allowed[0] ?? '';
			if ($value === '' && $raw_value !== null && (string) $raw_value !== '') {
				$invalid[] = $name;
				$values[$name] = '';
				continue;
			}
		}

		$values[$name] = $value;

		if ($required && $value === '') {
			$invalid[] = $name;
			continue;
		}

		if ($type === 'email' && $value !== '' && !is_email($value)) {
			$invalid[] = $name;
		}

		if ($type === 'url' && $value !== '') {
			$valid_url = function_exists('wp_http_validate_url')
				? (bool) wp_http_validate_url($value)
				: (bool) filter_var($value, FILTER_VALIDATE_URL);
			if (!$valid_url) {
				$invalid[] = $name;
			}
		}

		if ($type === 'number' && $value !== '' && !is_numeric($value)) {
			$invalid[] = $name;
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
 * @return array{0: list<array{id:int,url:string,name:string,mime:string}>, 1: bool}
 */
function bl_forms_process_field_uploads(string $name, array $files, bool $images_only, bool $multiple): array
{
	$bucket = bl_forms_extract_uploaded_files($name, $files);
	if ($bucket === []) {
		return [[], true];
	}

	if (!$multiple) {
		$bucket = [ $bucket[0] ];
	}

	$stored = [];
	$ok = true;
	foreach ($bucket as $file) {
		if (!is_array($file) || (int) ($file['error'] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_NO_FILE) {
			continue;
		}
		if ((int) ($file['error'] ?? UPLOAD_ERR_OK) !== UPLOAD_ERR_OK) {
			$ok = false;
			continue;
		}

		$result = bl_forms_store_uploaded_file($file, $images_only);
		if (is_wp_error($result)) {
			$ok = false;
			continue;
		}
		$stored[] = $result;
	}

	return [$stored, $ok];
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
 * @return array{id:int,url:string,name:string,mime:string}|\WP_Error
 */
function bl_forms_store_uploaded_file(array $file, bool $images_only = false)
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
	if ($images_only && strpos($mime, 'image/') !== 0) {
		return new WP_Error('bl_forms_not_image', __('Please upload an image file.', 'baselayer'));
	}

	$overrides = [
		'test_form' => false,
		'mimes'     => $images_only ? null : null,
	];
	if ($images_only) {
		$overrides['mimes'] = [
			'jpg|jpeg|jpe' => 'image/jpeg',
			'gif'          => 'image/gif',
			'png'          => 'image/png',
			'webp'         => 'image/webp',
		];
	}

	$moved = wp_handle_upload($file, $overrides);
	if (!is_array($moved) || !empty($moved['error'])) {
		return new WP_Error(
			'bl_forms_upload_failed',
			is_array($moved) && !empty($moved['error'])
				? (string) $moved['error']
				: __('Upload failed.', 'baselayer')
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
			: new WP_Error('bl_forms_attach_failed', __('Could not save uploaded file.', 'baselayer'));
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
