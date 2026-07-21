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

	$hp = isset($_POST['bl_forms_hp']) ? trim((string) wp_unslash($_POST['bl_forms_hp'])) : '';
	if ($hp !== '') {
		wp_send_json_success([
			'message' => bl_forms_resolve_message(bl_forms_get_config($form_id)['settings'], 'success_message'),
		]);
	}

	if (!bl_forms_rate_limit_ok($form_id)) {
		wp_send_json_error([
			'message' => __('Please wait a moment before submitting again.', 'baselayer'),
			'code'    => 'rate_limited',
		], 429);
	}

	$config = bl_forms_get_config($form_id);
	$settings = $config['settings'];
	$raw_fields = isset($_POST['fields']) && is_array($_POST['fields']) ? wp_unslash($_POST['fields']) : [];

	[$values, $invalid] = bl_forms_validate_submission($config['fields'], $raw_fields);
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
	]);
}
add_action('wp_ajax_bl_forms_submit', 'bl_forms_ajax_submit');
add_action('wp_ajax_nopriv_bl_forms_submit', 'bl_forms_ajax_submit');

/**
 * Soft rate limit: 5 submissions / form / IP / minute.
 */
function bl_forms_rate_limit_ok(int $form_id): bool
{
	$key = 'bl_forms_rl_' . $form_id . '_' . bl_forms_client_ip_hash();
	$count = (int) get_transient($key);
	if ($count >= 5) {
		return false;
	}
	set_transient($key, $count + 1, MINUTE_IN_SECONDS);

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
 * Validate and sanitize submitted fields.
 *
 * @param list<array<string, mixed>> $fields
 * @param array<string, mixed>       $raw
 * @return array{0: array<string, mixed>, 1: list<string>}
 */
function bl_forms_validate_submission(array $fields, array $raw): array
{
	$values = [];
	$invalid = [];

	foreach ($fields as $field) {
		$type = (string) ($field['type'] ?? '');
		if (in_array($type, ['heading', 'text_block'], true)) {
			continue;
		}

		$name = (string) ($field['name'] ?? '');
		if ($name === '') {
			continue;
		}

		$required = !empty($field['required']);
		$raw_value = $raw[$name] ?? null;

		if ($type === 'checkboxes') {
			$list = [];
			if (is_array($raw_value)) {
				foreach ($raw_value as $item) {
					$list[] = sanitize_text_field((string) $item);
				}
			}
			$values[$name] = $list;
			if ($required && $list === []) {
				$invalid[] = $name;
			}
			continue;
		}

		if ($type === 'terms') {
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
		} else {
			$value = sanitize_text_field($value);
		}

		$values[$name] = $value;

		if ($required && $value === '') {
			$invalid[] = $name;
			continue;
		}

		if ($type === 'email' && $value !== '' && !is_email($value)) {
			$invalid[] = $name;
		}
	}

	return [$values, $invalid];
}
