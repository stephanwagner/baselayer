<?php

defined('ABSPATH') || exit;

/**
 * Default site-wide editorial settings.
 *
 * @return array{
 *   approval_recipients: string,
 *   approval_subject: string,
 *   defaults: array
 * }
 */
function bl_editorial_settings_defaults(): array
{
	return [
		'approval_recipients' => '',
		'approval_subject'    => '',
		'defaults'            => bl_editorial_default_rights(),
	];
}

/**
 * Sanitize site-wide settings.
 *
 * @param mixed $raw
 * @return array{
 *   approval_recipients: string,
 *   approval_subject: string,
 *   defaults: array
 * }
 */
function bl_editorial_sanitize_settings($raw): array
{
	$defaults = bl_editorial_settings_defaults();
	if (!is_array($raw)) {
		return $defaults;
	}

	$recipients = isset($raw['approval_recipients']) ? (string) $raw['approval_recipients'] : '';
	$recipients = bl_editorial_normalize_recipients_string($recipients);

	$subject = isset($raw['approval_subject']) ? sanitize_text_field((string) $raw['approval_subject']) : '';

	$defaults_raw = isset($raw['defaults']) && is_array($raw['defaults']) ? $raw['defaults'] : [];

	return [
		'approval_recipients' => $recipients,
		'approval_subject'    => $subject,
		'defaults'            => bl_editorial_sanitize_rights($defaults_raw),
	];
}

/**
 * Normalize a free-text list of emails (comma/newline/semicolon) into a clean comma-separated string.
 */
function bl_editorial_normalize_recipients_string(string $raw): string
{
	$parts = preg_split('/[\s,;]+/', $raw) ?: [];
	$emails = [];
	foreach ($parts as $part) {
		$email = sanitize_email(trim((string) $part));
		if ($email !== '' && is_email($email)) {
			$emails[] = $email;
		}
	}

	return implode(', ', array_values(array_unique($emails)));
}

/**
 * @return list<string>
 */
function bl_editorial_parse_recipients(string $raw): array
{
	$normalized = bl_editorial_normalize_recipients_string($raw);
	if ($normalized === '') {
		return [];
	}

	return array_map('trim', explode(',', $normalized));
}

/**
 * Get site-wide editorial settings.
 *
 * @return array{
 *   approval_recipients: string,
 *   approval_subject: string,
 *   defaults: array
 * }
 */
function bl_editorial_get_settings(): array
{
	$raw = get_option(BL_EDITORIAL_SETTINGS_OPTION, null);
	if (!is_array($raw)) {
		return bl_editorial_settings_defaults();
	}

	return bl_editorial_sanitize_settings($raw);
}

/**
 * Save site-wide settings.
 *
 * @param array<string, mixed> $settings
 */
function bl_editorial_update_settings(array $settings): void
{
	update_option(BL_EDITORIAL_SETTINGS_OPTION, bl_editorial_sanitize_settings($settings), false);
}

/**
 * Apply site defaults to a newly created editor (only when meta is empty).
 */
function bl_editorial_maybe_apply_defaults_on_user_register(int $user_id): void
{
	if (!bl_editorial_user_is_editor($user_id)) {
		return;
	}

	$existing = get_user_meta($user_id, BL_EDITORIAL_USER_META, true);
	if (is_array($existing) && $existing !== []) {
		return;
	}

	$settings = bl_editorial_get_settings();
	bl_editorial_set_user_rights($user_id, $settings['defaults']);
}
add_action('user_register', 'bl_editorial_maybe_apply_defaults_on_user_register', 20);

/**
 * When a user’s role becomes editor and they have no rights yet, apply defaults.
 *
 * @param int    $user_id
 * @param string $role
 * @param array  $old_roles
 */
function bl_editorial_maybe_apply_defaults_on_set_role(int $user_id, string $role, array $old_roles = []): void
{
	if ($role !== 'editor') {
		return;
	}

	$existing = get_user_meta($user_id, BL_EDITORIAL_USER_META, true);
	if (is_array($existing) && $existing !== []) {
		return;
	}

	$settings = bl_editorial_get_settings();
	bl_editorial_set_user_rights($user_id, $settings['defaults']);
}
add_action('set_user_role', 'bl_editorial_maybe_apply_defaults_on_set_role', 20, 3);
