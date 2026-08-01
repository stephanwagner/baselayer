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
 * Default site-wide form settings.
 *
 * @return array<string, mixed>
 */
function bl_forms_default_global_settings(): array
{
	return [
		'submit_label'           => '',
		'submit_button_class'    => '',
		'recipient'              => '',
		'success_message'        => '',
		'error_message'          => '',
		'validation_message'     => '',
		'required_message'       => '',
		'min_message'            => '',
		'max_message'            => '',
		'date_min_message'       => '',
		'date_max_message'       => '',
		'time_min_message'       => '',
		'time_max_message'       => '',
		'datetime_min_message'   => '',
		'datetime_max_message'   => '',
		'maxlength_message'      => '',
		'minlength_message'      => '',
		'char_count_text'        => '',
		'char_count_empty_text'  => '',
		'number_message'         => '',
		'email_message'          => '',
		'url_message'            => '',
		'phone_message'          => '',
		'date_message'           => '',
		'time_message'           => '',
		'datetime_message'       => '',
		'date_before_message'    => '',
		'date_after_message'     => '',
		'file_message'           => '',
		'file_type_message'      => '',
		'file_size_message'      => '',
		'file_max_message'       => '',
		'option_message'         => '',
		'selection_min_message'  => '',
		'selection_max_message'  => '',
		'admin_email_subject'    => '',
		'user_email_subject'     => '',
		'user_email_title'       => '',
		'user_email_intro'       => '',
		'user_email_footer'      => '',
		'notify_user'            => false,
		'upload_max_size_mb'     => '12',
		'allow_save_uploads'     => true,
		'save_uploads'           => true,
		'min_fill_time_enabled'  => true,
		'min_fill_time'          => 2,
		'rate_limit_enabled'     => true,
		'rate_limit_max'         => 3,
		'rate_limit_window'      => 5,
		'captcha_provider'       => 'turnstile',
		'captcha_site_key'       => '',
		'captcha_secret_key'     => '',
	];
}

/**
 * Sanitize site-wide form settings.
 *
 * @param mixed $input
 * @return array<string, mixed>
 */
function bl_forms_sanitize_global_settings($input): array
{
	$defaults = bl_forms_default_global_settings();
	if (!is_array($input)) {
		return $defaults;
	}

	$settings = $defaults;
	$bool_keys = [
		'notify_user',
		'allow_save_uploads',
		'save_uploads',
		'min_fill_time_enabled',
		'rate_limit_enabled',
	];
	$int_keys = [
		'min_fill_time'     => [1, 300],
		'rate_limit_max'    => [1, 100],
		'rate_limit_window' => [1, 1440],
	];
	$textarea_keys = [
		'success_message',
		'error_message',
		'validation_message',
		'user_email_intro',
		'user_email_footer',
		'recipient',
	];

	foreach ($defaults as $key => $default) {
		if (!array_key_exists($key, $input)) {
			continue;
		}
		if (in_array($key, $bool_keys, true)) {
			$settings[$key] = !empty($input[$key]);
			continue;
		}
		if (isset($int_keys[$key])) {
			[$min, $max] = $int_keys[$key];
			$settings[$key] = max($min, min($max, (int) $input[$key]));
			continue;
		}
		if ($key === 'upload_max_size_mb') {
			$raw = trim((string) $input[$key]);
			if ($raw === '') {
				$settings[$key] = '';
			} else {
				$n = (float) $raw;
				$settings[$key] = $n > 0 ? rtrim(rtrim(number_format($n, 2, '.', ''), '0'), '.') : '';
			}
			continue;
		}
		if ($key === 'captcha_provider') {
			$provider = sanitize_key((string) $input[$key]);
			$settings[$key] = in_array($provider, bl_forms_captcha_providers(), true)
				? $provider
				: 'turnstile';
			continue;
		}
		if ($key === 'captcha_site_key' || $key === 'captcha_secret_key') {
			$settings[$key] = sanitize_text_field((string) $input[$key]);
			continue;
		}
		if ($key === 'submit_button_class') {
			$settings[$key] = bl_forms_sanitize_css_classes((string) $input[$key]);
			continue;
		}
		if ($key === 'recipient') {
			$settings[$key] = implode("\n", bl_forms_parse_recipients($input[$key] ?? ''));
			continue;
		}
		$value = (string) $input[$key];
		$settings[$key] = in_array($key, $textarea_keys, true)
			? sanitize_textarea_field($value)
			: sanitize_text_field($value);
	}

	if (empty($settings['allow_save_uploads'])) {
		$settings['save_uploads'] = false;
	}

	return $settings;
}

/**
 * Load site-wide form settings.
 *
 * @return array<string, mixed>
 */
function bl_forms_get_global_settings(): array
{
	$raw = get_option(BL_FORMS_GLOBAL_SETTINGS_OPTION, null);
	if (!is_array($raw)) {
		return bl_forms_default_global_settings();
	}

	return bl_forms_sanitize_global_settings($raw);
}

/**
 * Persist site-wide form settings.
 *
 * @param array<string, mixed> $settings
 */
function bl_forms_update_global_settings(array $settings): bool
{
	$clean = bl_forms_sanitize_global_settings($settings);

	return update_option(BL_FORMS_GLOBAL_SETTINGS_OPTION, $clean, false);
}

/**
 * Whether the site allows forms to keep uploaded files.
 */
function bl_forms_allow_save_uploads(): bool
{
	$globals = bl_forms_get_global_settings();

	return !empty($globals['allow_save_uploads']);
}

/**
 * Whether submitted files should be kept on disk (dedicated folder, not media library).
 *
 * @param array<string, mixed> $settings
 */
function bl_forms_save_uploads_enabled(array $settings): bool
{
	if (!bl_forms_allow_save_uploads()) {
		return false;
	}

	if (!array_key_exists('save_uploads', $settings)) {
		return true;
	}

	return !empty($settings['save_uploads']);
}

/**
 * Convert an MB setting string into bytes, capped by WordPress max upload.
 */
function bl_forms_mb_setting_to_bytes(string $raw): int
{
	$wp = (int) wp_max_upload_size();
	$raw = trim($raw);
	if ($raw === '') {
		return max(0, $wp);
	}

	$n = (float) $raw;
	if ($n <= 0) {
		return max(0, $wp);
	}

	$custom = (int) round($n * MB_IN_BYTES);
	if ($wp > 0) {
		return min($custom, $wp);
	}

	return max(0, $custom);
}

/**
 * Max upload bytes for a file/image field (field override → global → WP limit).
 *
 * @param array<string, mixed> $settings Form settings (unused for size; kept for call-site compat).
 * @param array<string, mixed> $field
 */
function bl_forms_upload_max_bytes(array $settings, array $field = []): int
{
	unset($settings);
	$raw = trim((string) ($field['max_size_mb'] ?? ''));
	if ($raw === '') {
		$globals = bl_forms_get_global_settings();
		$raw = trim((string) ($globals['upload_max_size_mb'] ?? ''));
	}

	return bl_forms_mb_setting_to_bytes($raw);
}

/**
 * Security settings always come from globals (not per-form).
 *
 * @return array{
 *   min_fill_time_enabled: bool,
 *   min_fill_time: int,
 *   rate_limit_enabled: bool,
 *   rate_limit_max: int,
 *   rate_limit_window: int
 * }
 */
function bl_forms_security_settings(): array
{
	$globals = bl_forms_get_global_settings();

	return [
		'min_fill_time_enabled' => !empty($globals['min_fill_time_enabled']),
		'min_fill_time'         => max(1, min(300, (int) ($globals['min_fill_time'] ?? 2))),
		'rate_limit_enabled'    => !empty($globals['rate_limit_enabled']),
		'rate_limit_max'        => max(1, min(100, (int) ($globals['rate_limit_max'] ?? 3))),
		'rate_limit_window'     => max(1, min(1440, (int) ($globals['rate_limit_window'] ?? 5))),
	];
}

/**
 * Global captcha credentials.
 *
 * @return array{provider: string, site_key: string, secret_key: string}
 */
function bl_forms_captcha_credentials(): array
{
	$globals = bl_forms_get_global_settings();
	$provider = sanitize_key((string) ($globals['captcha_provider'] ?? 'turnstile'));
	if (!in_array($provider, bl_forms_captcha_providers(), true)) {
		$provider = 'turnstile';
	}

	return [
		'provider'   => $provider,
		'site_key'   => trim((string) ($globals['captcha_site_key'] ?? '')),
		'secret_key' => trim((string) ($globals['captcha_secret_key'] ?? '')),
	];
}

/**
 * Resolve a string setting: form → global → empty.
 */
function bl_forms_resolve_setting_string(array $settings, string $key): string
{
	$form = isset($settings[$key]) && is_string($settings[$key]) ? trim($settings[$key]) : '';
	if ($form !== '') {
		return $form;
	}

	$globals = bl_forms_get_global_settings();
	$global = isset($globals[$key]) && is_string($globals[$key]) ? trim($globals[$key]) : '';

	return $global;
}

/**
 * Whether a field is active (shown on the frontend). Missing key = active.
 *
 * @param array<string, mixed> $field
 */
function bl_forms_field_is_active(array $field): bool
{
	return !array_key_exists('active', $field) || !empty($field['active']);
}

/**
 * Allowed conditional-logic operators.
 *
 * @return list<string>
 */
function bl_forms_conditional_logic_operators(): array
{
	return [
		'checked',
		'not_checked',
		'==',
		'!=',
		'contains',
		'not_contains',
		'==empty',
		'!=empty',
		'>',
		'<',
		'>=',
		'<=',
	];
}

/**
 * Sanitize field conditional_logic (ACF-style groups).
 *
 * @param mixed $raw
 * @return array{enabled: bool, groups: list<list<array{field: string, operator: string, value: string}>>}|null
 */
function bl_forms_sanitize_conditional_logic($raw): ?array
{
	if (!is_array($raw)) {
		return null;
	}

	$allowed = bl_forms_conditional_logic_operators();
	$no_value = ['checked', 'not_checked', '==empty', '!=empty'];
	$groups_in = isset($raw['groups']) && is_array($raw['groups']) ? $raw['groups'] : [];
	$groups = [];

	foreach ($groups_in as $group) {
		if (!is_array($group)) {
			continue;
		}
		$rules = [];
		foreach ($group as $rule) {
			if (!is_array($rule)) {
				continue;
			}
			$field_id = sanitize_key((string) ($rule['field'] ?? ''));
			$operator = (string) ($rule['operator'] ?? '');
			if ($field_id === '' || !in_array($operator, $allowed, true)) {
				continue;
			}
			$value = in_array($operator, $no_value, true)
				? ''
				: sanitize_text_field((string) ($rule['value'] ?? ''));
			$rules[] = [
				'field'    => $field_id,
				'operator' => $operator,
				'value'    => $value,
			];
		}
		if ($rules !== []) {
			$groups[] = $rules;
		}
	}

	$enabled = !empty($raw['enabled']) && $groups !== [];
	if (!$enabled && $groups === []) {
		return null;
	}

	return [
		'enabled' => $enabled,
		'groups'  => $groups,
	];
}

/**
 * Attach sanitized conditional_logic onto a field array when present.
 *
 * @param array<string, mixed> $out
 * @param array<string, mixed> $field
 * @return array<string, mixed>
 */
function bl_forms_attach_conditional_logic(array $out, array $field): array
{
	$logic = bl_forms_sanitize_conditional_logic($field['conditional_logic'] ?? null);
	if ($logic !== null) {
		$out['conditional_logic'] = $logic;
	}

	return $out;
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
 * Default settings (empty strings mean use global / runtime fallbacks).
 *
 * Security, captcha, and upload max size live in global settings only.
 *
 * @return array<string, mixed>
 */
function bl_forms_default_settings(): array
{
	$globals = function_exists('bl_forms_get_global_settings')
		? bl_forms_get_global_settings()
		: bl_forms_default_global_settings();

	return [
		'submit_label'           => '',
		'submit_button_class'    => '',
		'recipient'              => '',
		'success_message'        => '',
		'error_message'          => '',
		'validation_message'     => '',
		'required_message'       => '',
		'min_message'            => '',
		'max_message'            => '',
		'date_min_message'       => '',
		'date_max_message'       => '',
		'time_min_message'       => '',
		'time_max_message'       => '',
		'datetime_min_message'   => '',
		'datetime_max_message'   => '',
		'maxlength_message'      => '',
		'minlength_message'      => '',
		'char_count_text'        => '',
		'char_count_empty_text'  => '',
		'number_message'         => '',
		'email_message'          => '',
		'url_message'            => '',
		'phone_message'          => '',
		'date_message'           => '',
		'time_message'           => '',
		'datetime_message'       => '',
		'date_before_message'    => '',
		'date_after_message'     => '',
		'file_message'           => '',
		'file_type_message'      => '',
		'file_size_message'      => '',
		'file_max_message'       => '',
		'save_uploads'           => !empty($globals['allow_save_uploads']) && !empty($globals['save_uploads']),
		'option_message'         => '',
		'selection_min_message'  => '',
		'selection_max_message'  => '',
		'after_submit'           => 'message',
		'redirect_page_id'       => 0,
		'notify_user'            => !empty($globals['notify_user']),
		'user_email_field'       => '',
		'admin_email_subject'    => '',
		'user_email_subject'     => '',
		'user_email_title'       => '',
		'user_email_intro'       => '',
		'user_email_footer'      => '',
		'honeypot_name'          => '',
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
		'success'    => __('Thank you. Your message has been sent.', 'baselayer-forms'),
		'error'      => __('Something went wrong. Please try again.', 'baselayer-forms'),
		'validation' => __('Some fields need attention. Please check the highlighted fields.', 'baselayer-forms'),
		'submit'     => __('Send', 'baselayer-forms'),
		'required'   => __('This field is required.', 'baselayer-forms'),
		/* translators: Placeholder: {limit} */
		'min'        => __('Enter a number of at least {limit}.', 'baselayer-forms'),
		/* translators: Placeholder: {limit} */
		'max'        => __('Enter a number of at most {limit}.', 'baselayer-forms'),
		/* translators: Placeholder: {limit} */
		'date_min'   => __('Enter a date on or after {limit}.', 'baselayer-forms'),
		/* translators: Placeholder: {limit} */
		'date_max'   => __('Enter a date on or before {limit}.', 'baselayer-forms'),
		/* translators: Placeholder: {limit} */
		'time_min'   => __('Enter a time on or after {limit}.', 'baselayer-forms'),
		/* translators: Placeholder: {limit} */
		'time_max'   => __('Enter a time on or before {limit}.', 'baselayer-forms'),
		/* translators: Placeholder: {limit} */
		'datetime_min' => __('Enter a date and time on or after {limit}.', 'baselayer-forms'),
		/* translators: Placeholder: {limit} */
		'datetime_max' => __('Enter a date and time on or before {limit}.', 'baselayer-forms'),
		/* translators: Placeholder: {limit} */
		'minlength'  => __('Enter at least {limit} characters.', 'baselayer-forms'),
		/* translators: Placeholder: {limit} */
		'maxlength'  => __('Enter no more than {limit} characters.', 'baselayer-forms'),
		/* translators: Placeholders: {remaining}, {count}, {max} */
		'char_count' => __('{remaining} characters remaining', 'baselayer-forms'),
		'char_count_empty' => __('No characters remaining', 'baselayer-forms'),
		'number'     => __('Enter a valid number.', 'baselayer-forms'),
		'email'      => __('Enter a valid email address.', 'baselayer-forms'),
		'url'        => __('Enter a valid URL.', 'baselayer-forms'),
		'phone'      => __('Enter a valid phone number.', 'baselayer-forms'),
		'date'       => __('Enter a valid date.', 'baselayer-forms'),
		'time'       => __('Enter a valid time.', 'baselayer-forms'),
		'datetime'   => __('Enter a valid date and time.', 'baselayer-forms'),
		/* translators: Placeholder: {field} */
		'date_before'=> __('This value must be before {field}.', 'baselayer-forms'),
		/* translators: Placeholder: {field} */
		'date_after' => __('This value must be after {field}.', 'baselayer-forms'),
		'file'       => __('Please upload a valid file.', 'baselayer-forms'),
		/* translators: Placeholder: {types} — allowed file types, e.g. "PDF, JPG, PNG" */
		'file_type'  => __('Please upload a file of type {types}.', 'baselayer-forms'),
		/* translators: Placeholder: {size} — maximum file size, e.g. "12 MB" */
		'file_size'  => __('This file is too large. Maximum size is {size}.', 'baselayer-forms'),
		/* translators: Placeholder: {max} — maximum number of files */
		'file_max'   => __('You can upload at most {max} files.', 'baselayer-forms'),
		'upload_button' => __('Choose file', 'baselayer-forms'),
		'upload_empty'  => __('No file chosen', 'baselayer-forms'),
		'option'     => __('Please choose a valid option.', 'baselayer-forms'),
		/* translators: Placeholder: {min} — minimum number of options (used when minimum is greater than 1) */
		'selection_min' => __('Select at least {min} options.', 'baselayer-forms'),
		/* translators: Placeholder: {max} — maximum number of options. Used as admin placeholder; runtime uses singular/plural via _n(). */
		'selection_max' => __('You can select at most {max} options.', 'baselayer-forms'),
	];
}

/**
 * Resolve a settings message with form → global → plugin fallback.
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
		'date_min_message'   => 'date_min',
		'date_max_message'   => 'date_max',
		'time_min_message'   => 'time_min',
		'time_max_message'   => 'time_max',
		'datetime_min_message' => 'datetime_min',
		'datetime_max_message' => 'datetime_max',
		'maxlength_message'  => 'maxlength',
		'minlength_message'  => 'minlength',
		'char_count_text'    => 'char_count',
		'char_count_empty_text' => 'char_count_empty',
		'number_message'     => 'number',
		'email_message'      => 'email',
		'url_message'        => 'url',
		'phone_message'      => 'phone',
		'date_message'       => 'date',
		'time_message'       => 'time',
		'datetime_message'   => 'datetime',
		'date_before_message'=> 'date_before',
		'date_after_message' => 'date_after',
		'file_message'       => 'file',
		'file_type_message'  => 'file_type',
		'file_size_message'  => 'file_size',
		'file_max_message'   => 'file_max',
		'option_message'     => 'option',
		'selection_min_message' => 'selection_min',
		'selection_max_message' => 'selection_max',
		'submit_label'       => 'submit',
	];

	$fallback_key = $map[$key] ?? '';
	$custom = bl_forms_resolve_setting_string($settings, $key);

	if ($custom !== '') {
		return $custom;
	}

	return $fallbacks[$fallback_key] ?? '';
}

/**
 * Message placeholders for the form builder (global → plugin fallback).
 *
 * @return array<string, string>
 */
function bl_forms_form_message_placeholders(): array
{
	$fallbacks = bl_forms_message_fallbacks();
	$empty = [];
	$map = [
		'success' => 'success_message',
		'error' => 'error_message',
		'validation' => 'validation_message',
		'submit' => 'submit_label',
		'required' => 'required_message',
		'min' => 'min_message',
		'max' => 'max_message',
		'date_min' => 'date_min_message',
		'date_max' => 'date_max_message',
		'time_min' => 'time_min_message',
		'time_max' => 'time_max_message',
		'datetime_min' => 'datetime_min_message',
		'datetime_max' => 'datetime_max_message',
		'maxlength' => 'maxlength_message',
		'minlength' => 'minlength_message',
		'char_count' => 'char_count_text',
		'char_count_empty' => 'char_count_empty_text',
		'number' => 'number_message',
		'email' => 'email_message',
		'url' => 'url_message',
		'phone' => 'phone_message',
		'date' => 'date_message',
		'time' => 'time_message',
		'datetime' => 'datetime_message',
		'date_before' => 'date_before_message',
		'date_after' => 'date_after_message',
		'file' => 'file_message',
		'file_type' => 'file_type_message',
		'file_size' => 'file_size_message',
		'file_max' => 'file_max_message',
		'option' => 'option_message',
		'selection_min' => 'selection_min_message',
		'selection_max' => 'selection_max_message',
		'upload_button' => '',
		'upload_empty' => '',
	];

	$out = [];
	foreach ($map as $short => $settings_key) {
		if ($settings_key === '') {
			$out[$short] = $fallbacks[$short] ?? '';
			continue;
		}
		$out[$short] = bl_forms_resolve_message($empty, $settings_key);
	}

	return $out;
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
 * Whether a stored value looks like a list of uploaded file items.
 *
 * @param mixed $value
 */
function bl_forms_value_looks_like_files($value): bool
{
	if (!is_array($value) || $value === []) {
		return false;
	}

	foreach ($value as $item) {
		if (!is_array($item) || !array_key_exists('name', $item)) {
			return false;
		}
	}

	return true;
}

/**
 * Format uploaded file items as filenames (one per line).
 *
 * @param mixed $value
 */
function bl_forms_format_file_display_value($value): string
{
	$items = is_array($value) ? $value : [];
	$parts = [];
	foreach ($items as $item) {
		if (!is_array($item)) {
			continue;
		}
		$fname = (string) ($item['name'] ?? '');
		if ($fname !== '') {
			$parts[] = $fname;
		}
	}

	return implode("\n", $parts);
}

/**
 * Flatten mixed array values into a safe display string (never casts arrays).
 *
 * @param mixed $value
 */
function bl_forms_flatten_display_value($value): string
{
	if ($value === null || $value === false) {
		return '';
	}
	if (is_bool($value)) {
		return $value ? '1' : '0';
	}
	if (is_scalar($value)) {
		return (string) $value;
	}
	if (!is_array($value)) {
		return '';
	}

	if (bl_forms_value_looks_like_files($value)) {
		return bl_forms_format_file_display_value($value);
	}

	// Single associative payload (e.g. one file item stored without a list wrapper).
	if ($value !== [] && !array_is_list($value)) {
		if (array_key_exists('name', $value) && is_scalar($value['name'])) {
			return (string) $value['name'];
		}
		$parts = [];
		foreach ($value as $item) {
			if (is_scalar($item) && (string) $item !== '') {
				$parts[] = (string) $item;
			}
		}

		return implode(', ', $parts);
	}

	$parts = [];
	foreach ($value as $item) {
		if (is_scalar($item) && (string) $item !== '') {
			$parts[] = (string) $item;
			continue;
		}
		if (!is_array($item)) {
			continue;
		}
		if (array_key_exists('name', $item) && is_scalar($item['name']) && (string) $item['name'] !== '') {
			$parts[] = (string) $item['name'];
			continue;
		}
		$nested = bl_forms_flatten_display_value($item);
		if ($nested !== '') {
			$parts[] = $nested;
		}
	}

	return implode(', ', $parts);
}

/**
 * Map stored option value(s) to option labels for display (email / entry UI).
 *
 * Defensive against form edits: when the live/snapshot type does not match the
 * stored value shape, infer from the value instead of casting arrays to string.
 *
 * @param array<string, mixed> $field
 * @param mixed                $value Stored submission value.
 */
function bl_forms_format_field_display_value(array $field, $value): string
{
	$type = (string) ($field['type'] ?? '');

	// Prefer value shape when type is missing or clearly mismatched.
	if ($type === '' || (in_array($type, ['text', 'email', 'phone', 'url', 'number', 'textarea', 'date', 'time', 'datetime'], true) && is_array($value))) {
		if (bl_forms_value_looks_like_files($value)) {
			return bl_forms_format_file_display_value($value);
		}
		if (is_array($value)) {
			return bl_forms_flatten_display_value($value);
		}
	}

	if ($type === 'terms' || $type === 'toggle') {
		return $value !== '' && $value !== '0' && $value !== null && $value !== false
			? __('Yes', 'baselayer-forms')
			: __('No', 'baselayer-forms');
	}

	if (in_array($type, ['file', 'image'], true) || bl_forms_value_looks_like_files($value)) {
		return bl_forms_format_file_display_value($value);
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
		return bl_forms_flatten_display_value($value);
	}

	if ($value === null || is_bool($value)) {
		return bl_forms_flatten_display_value($value);
	}

	return (string) $value;
}

/**
 * Lean field schema snapshot for an entry (submit-time labels/types/options).
 *
 * Only includes fields present in $values, in form order.
 *
 * @param list<array<string, mixed>> $fields
 * @param array<string, mixed>       $values
 * @return list<array<string, mixed>>
 */
function bl_forms_entry_schema_from_config(array $fields, array $values): array
{
	$schema = [];
	$choice_types = ['radio', 'checkboxes', 'select', 'button_group'];

	foreach (bl_forms_iter_fields($fields) as $field) {
		$name = sanitize_key((string) ($field['name'] ?? ''));
		if ($name === '' || !array_key_exists($name, $values)) {
			continue;
		}

		$type = sanitize_key((string) ($field['type'] ?? ''));
		$item = [
			'name'  => $name,
			'type'  => $type,
			'label' => (string) ($field['label'] ?? $name),
		];

		if (in_array($type, ['text', 'email', 'phone'], true)) {
			$item['show_in_list'] = !empty($field['show_in_list']);
		}

		if (in_array($type, $choice_types, true) && isset($field['options']) && is_array($field['options'])) {
			$options = [];
			foreach ($field['options'] as $opt) {
				if (!is_array($opt)) {
					continue;
				}
				$opt_value = (string) ($opt['value'] ?? '');
				if ($opt_value === '') {
					continue;
				}
				$opt_label = (string) ($opt['label'] ?? $opt_value);
				$options[] = [
					'value' => $opt_value,
					'label' => $opt_label !== '' ? $opt_label : $opt_value,
				];
			}
			if ($options !== []) {
				$item['options'] = $options;
			}
		}

		$schema[] = $item;
	}

	return $schema;
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
 * Allows: 24px, 1.5rem, 50%, 10vw, auto, or a bare number (treated as px).
 * Rejects ; } url( etc.
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
	// Unitless number → px (e.g. "4" → "4px").
	if (preg_match('/^(-?\d+(?:\.\d+)?)$/', $value)) {
		return $value . 'px';
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
 * Pack factor (0–1) for flex row grouping, or null when width is not a shareable %.
 *
 * @param array<string, mixed> $field
 */
function bl_forms_field_pack_factor(array $field): ?float
{
	$width = (string) ($field['width'] ?? '100');
	if ($width === 'auto') {
		return null;
	}
	if ($width === 'custom') {
		$custom = trim((string) ($field['width_custom'] ?? ''));
		if ($custom === '' || !preg_match('/^\d+(?:\.\d+)?%$/', $custom)) {
			return null;
		}
	}

	return (float) bl_forms_field_width_vars($field)['factor'];
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
		'active'       => bl_forms_field_is_active($field),
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
		$design = sanitize_key((string) ($field['design'] ?? 'standard'));
		if (!in_array($design, ['standard', 'outline', 'card'], true)) {
			$design = 'standard';
		}
		$out['design'] = $design;
		unset($out['name'], $out['name_manual'], $out['hide_label'], $out['label']);

		return bl_forms_attach_conditional_logic($out, $field);
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
		$design = sanitize_key((string) ($field['design'] ?? 'standard'));
		if (!in_array($design, ['standard', 'outline', 'card'], true)) {
			$design = 'standard';
		}
		$out['design'] = $design;
		// Default on when missing (no legacy “empty label hides title”).
		$out['show_title'] = !array_key_exists('show_title', $field) || !empty($field['show_title']);
		unset($out['name'], $out['name_manual'], $out['hide_label']);

		return bl_forms_attach_conditional_logic($out, $field);
	}

	if ($type === 'divider') {
		$presets = ['xs', 's', 'm', 'l', 'xl', 'custom'];
		$raw = sanitize_key((string) ($field['margin'] ?? 'm'));
		$legacy = trim((string) ($field['margin'] ?? ''));
		if ($raw === '' || !in_array($raw, $presets, true)) {
			if ($legacy !== '' && preg_match('/^(-?\d+(?:\.\d+)?)(px|rem|em|%|vh|vw|vmin|vmax|ch|ex)?$/i', $legacy)) {
				$out['margin'] = 'custom';
				$out['margin_custom'] = bl_forms_sanitize_css_length($legacy, '24px');
			} else {
				$out['margin'] = 'm';
				unset($out['margin_custom']);
			}
		} elseif ($raw === 'custom') {
			$custom = (string) ($field['margin_custom'] ?? '');
			if ($custom === '' && $legacy !== '' && $legacy !== 'custom') {
				$custom = $legacy;
			}
			$out['margin'] = 'custom';
			$out['margin_custom'] = bl_forms_sanitize_css_length($custom, '24px');
		} else {
			$out['margin'] = $raw;
			unset($out['margin_custom']);
		}
		unset(
			$out['name'],
			$out['label'],
			$out['name_manual'],
			$out['hide_label'],
			$out['placeholder'],
			$out['width'],
			$out['width_custom']
		);

		return bl_forms_attach_conditional_logic($out, $field);
	}

	if ($type === 'captcha') {
		unset(
			$out['name'],
			$out['label'],
			$out['name_manual'],
			$out['hide_label'],
			$out['captcha_provider'],
			$out['captcha_site_key'],
			$out['captcha_secret_key']
		);

		return bl_forms_attach_conditional_logic($out, $field);
	}

	if ($type === 'spacer') {
		$presets = ['xs', 's', 'm', 'l', 'xl', 'custom'];
		$raw = sanitize_key((string) ($field['height'] ?? 'm'));
		// Legacy free-form CSS lengths → custom.
		$legacy = trim((string) ($field['height'] ?? ''));
		if ($raw === '' || !in_array($raw, $presets, true)) {
			if ($legacy !== '' && preg_match('/^(-?\d+(?:\.\d+)?)(px|rem|em|%|vh|vw|vmin|vmax|ch|ex)?$/i', $legacy)) {
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
		unset(
			$out['name'],
			$out['label'],
			$out['name_manual'],
			$out['hide_label'],
			$out['placeholder'],
			$out['width'],
			$out['width_custom']
		);

		return bl_forms_attach_conditional_logic($out, $field);
	}

	if ($type === 'heading') {
		$content = (string) ($field['content'] ?? '');
		$out['content'] = sanitize_textarea_field($content);
		$level = sanitize_key((string) ($field['level'] ?? 'h2'));
		$allowed = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
		$out['level'] = in_array($level, $allowed, true) ? $level : 'h2';
		unset($out['name'], $out['name_manual'], $out['hide_label']);

		return bl_forms_attach_conditional_logic($out, $field);
	}

	if (in_array($type, ['text_block', 'html'], true)) {
		$content = (string) ($field['content'] ?? '');
		$out['content'] = $type === 'html'
			? wp_kses_post($content)
			: sanitize_textarea_field($content);
		unset($out['name'], $out['name_manual'], $out['hide_label'], $out['level']);

		return bl_forms_attach_conditional_logic($out, $field);
	}

	if ($type === 'hidden') {
		$out['default_value'] = sanitize_text_field((string) ($field['default_value'] ?? ''));
		$out['width'] = '100';
		$out['width_custom'] = '';
		unset($out['required'], $out['placeholder'], $out['hide_label']);

		return bl_forms_attach_conditional_logic($out, $field);
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

	$affix_types = ['text', 'email', 'phone', 'url', 'number', 'date', 'time', 'datetime'];
	if (in_array($type, $affix_types, true)) {
		$prefix = sanitize_text_field((string) ($field['prefix'] ?? ''));
		$suffix = sanitize_text_field((string) ($field['suffix'] ?? ''));
		if ($prefix !== '') {
			$out['prefix'] = $prefix;
		} else {
			unset($out['prefix']);
		}
		if ($suffix !== '') {
			$out['suffix'] = $suffix;
		} else {
			unset($out['suffix']);
		}
	} else {
		unset($out['prefix'], $out['suffix']);
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

	if (in_array($type, ['text', 'textarea'], true)) {
		$min_length = bl_forms_field_min_length([
			'type' => $type,
			'min_length' => $field['min_length'] ?? '',
		]);
		$max_length = bl_forms_field_max_length([
			'type' => $type,
			'max_length' => $field['max_length'] ?? '',
		]);
		if ($min_length > 0 && $max_length > 0 && $min_length > $max_length) {
			[$min_length, $max_length] = [$max_length, $min_length];
		}
		if ($min_length > 0) {
			$out['min_length'] = $min_length;
		} else {
			unset($out['min_length']);
		}
		if ($max_length > 0) {
			$out['max_length'] = $max_length;
			$out['show_char_count'] = !empty($field['show_char_count']);
		} else {
			unset($out['max_length'], $out['show_char_count']);
		}
		unset($out['char_count_text']);
	} else {
		unset($out['min_length'], $out['max_length'], $out['show_char_count'], $out['char_count_text']);
	}

	if (in_array($type, ['text', 'email', 'phone'], true)) {
		$out['show_in_list'] = !empty($field['show_in_list']);
	} else {
		unset($out['show_in_list']);
	}

	if ($type === 'textarea') {
		$rows = absint($field['rows'] ?? 5);
		if ($rows < 2) {
			$rows = 2;
		}
		if ($rows > 50) {
			$rows = 50;
		}
		$out['rows'] = $rows;
	} else {
		unset($out['rows']);
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

	if ($type === 'checkboxes') {
		$min_sel = bl_forms_sanitize_selection_limit($field['min_selections'] ?? '');
		$max_sel = bl_forms_sanitize_selection_limit($field['max_selections'] ?? '');
		if ($min_sel > 0 && $max_sel > 0 && $min_sel > $max_sel) {
			[$min_sel, $max_sel] = [$max_sel, $min_sel];
		}
		if ($min_sel > 0) {
			$out['min_selections'] = $min_sel;
		} else {
			unset($out['min_selections']);
		}
		if ($max_sel > 0) {
			$out['max_selections'] = $max_sel;
		} else {
			unset($out['max_selections']);
		}
	} else {
		unset($out['min_selections'], $out['max_selections']);
	}

	if (in_array($type, ['select', 'button_group', 'file', 'image'], true)) {
		$out['multiple'] = !empty($field['multiple']);
	}

	if (in_array($type, ['file', 'image'], true)) {
		if (array_key_exists('extensions', $field)) {
			$exts = bl_forms_sanitize_extensions($field['extensions']);
		} elseif ($type === 'image') {
			$exts = bl_forms_default_image_extensions();
		} else {
			$exts = [];
		}
		$out['extensions'] = $exts !== [] ? implode(', ', $exts) : '';
		$style = sanitize_key((string) ($field['upload_style'] ?? 'modern'));
		$out['upload_style'] = $style === 'classic' ? 'classic' : 'modern';
		if ($out['upload_style'] === 'modern') {
			$out['preview'] = !array_key_exists('preview', $field) || !empty($field['preview']);
		} else {
			unset($out['preview']);
		}
		if (!empty($out['multiple'])) {
			$out['max_files'] = bl_forms_field_max_files(array_merge($field, ['multiple' => true]));
		} else {
			unset($out['max_files']);
		}
		$raw_max = trim((string) ($field['max_size_mb'] ?? ''));
		if ($raw_max === '') {
			unset($out['max_size_mb']);
		} else {
			$n = (float) $raw_max;
			$out['max_size_mb'] = $n > 0 ? rtrim(rtrim(number_format($n, 2, '.', ''), '0'), '.') : '';
			if ($out['max_size_mb'] === '') {
				unset($out['max_size_mb']);
			}
		}
		$button = sanitize_text_field((string) ($field['button_text'] ?? ''));
		if ($button !== '') {
			$out['button_text'] = $button;
		} else {
			unset($out['button_text']);
		}
	} else {
		unset($out['extensions'], $out['preview'], $out['max_files'], $out['max_size_mb'], $out['upload_style'], $out['button_text']);
	}

	if ($type === 'terms') {
		$content = sanitize_textarea_field((string) ($field['content'] ?? ''));
		// Legacy configs stored the checkbox text in `label`.
		if ($content === '' && !array_key_exists('content', $field) && $out['label'] !== '') {
			$content = $out['label'];
			$out['label'] = '';
		}
		if ($content === '') {
			$content = __('I agree to the [Privacy Policy](page:privacy).', 'baselayer-forms');
		}
		$out['content'] = $content;
		$out['default_value'] = !empty($field['default_value']) ? '1' : '';
	}

	if ($type === 'toggle') {
		$out['label'] = $out['label'] !== ''
			? $out['label']
			: __('Enable', 'baselayer-forms');
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

	return bl_forms_attach_conditional_logic($out, $field);
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
	$bool_keys = ['notify_user', 'save_uploads'];
	$int_keys = [
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
		if ($key === 'submit_button_class') {
			$settings[$key] = bl_forms_sanitize_css_classes((string) $settings_in[$key]);
			continue;
		}
		if ($key === 'recipient') {
			$settings[$key] = implode("\n", bl_forms_parse_recipients($settings_in[$key] ?? ''));
			continue;
		}
		$value = (string) $settings_in[$key];
		if (in_array($key, ['success_message', 'error_message', 'validation_message', 'user_email_intro', 'user_email_footer'], true)) {
			$settings[$key] = sanitize_textarea_field($value);
		} else {
			$settings[$key] = sanitize_text_field($value);
		}
	}

	if (!bl_forms_allow_save_uploads()) {
		$settings['save_uploads'] = false;
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

	$fields = bl_forms_limit_show_in_list_fields($fields, 3);

	return [
		'fields'   => $fields,
		'settings' => $settings,
	];
}

/**
 * Keep at most $max fields marked show_in_list (form order).
 *
 * @param list<array<string, mixed>> $fields
 * @return list<array<string, mixed>>
 */
function bl_forms_limit_show_in_list_fields(array $fields, int $max = 3): array
{
	$count = 0;
	$walk = static function (array $list) use (&$walk, &$count, $max): array {
		foreach ($list as $i => $field) {
			if (!is_array($field)) {
				continue;
			}
			$type = (string) ($field['type'] ?? '');
			if (in_array($type, bl_forms_layout_field_types(), true)) {
				$children = isset($field['children']) && is_array($field['children']) ? $field['children'] : [];
				$list[$i]['children'] = $walk($children);
				continue;
			}
			if (!empty($field['show_in_list']) && in_array($type, ['text', 'email', 'phone'], true)) {
				if ($count >= $max) {
					$list[$i]['show_in_list'] = false;
				} else {
					$count++;
				}
			}
		}

		return $list;
	};

	return $walk($fields);
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
 * Parse recipient setting into a list of valid emails (one per line or comma-separated).
 *
 * @param mixed $raw
 * @return list<string>
 */
function bl_forms_parse_recipients($raw): array
{
	$chunks = preg_split('/[\r\n,;]+/', (string) $raw) ?: [];
	$out = [];
	foreach ($chunks as $chunk) {
		$email = sanitize_email(trim($chunk));
		if ($email !== '' && is_email($email) && !in_array($email, $out, true)) {
			$out[] = $email;
		}
	}

	return $out;
}

/**
 * Admin notification recipient(s) for a form (comma-separated for wp_mail).
 */
function bl_forms_recipient(array $settings): string
{
	$list = bl_forms_parse_recipients(bl_forms_resolve_setting_string($settings, 'recipient'));
	if ($list !== []) {
		return implode(', ', $list);
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
		if (!bl_forms_field_is_active($field)) {
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
