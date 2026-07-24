<?php

defined('ABSPATH') || exit;

/**
 * Supported CAPTCHA providers.
 *
 * @return list<string>
 */
function bl_forms_captcha_providers(): array
{
	return ['turnstile', 'hcaptcha', 'friendly', 'recaptcha_v2'];
}

/**
 * Find the first captcha field in a form config.
 *
 * @param list<array<string, mixed>> $fields
 * @return array<string, mixed>|null
 */
function bl_forms_find_captcha_field(array $fields): ?array
{
	foreach (bl_forms_iter_fields($fields) as $field) {
		if ((string) ($field['type'] ?? '') === 'captcha') {
			return $field;
		}
	}

	return null;
}

/**
 * Client token POST field name for a provider.
 */
function bl_forms_captcha_response_key(string $provider): string
{
	switch ($provider) {
		case 'turnstile':
			return 'cf-turnstile-response';
		case 'hcaptcha':
			return 'h-captcha-response';
		case 'friendly':
			return 'frc-captcha-response';
		case 'recaptcha_v2':
			return 'g-recaptcha-response';
		default:
			return '';
	}
}

/**
 * Enqueue the provider script(s) once per request.
 */
function bl_forms_enqueue_captcha_script(string $provider): void
{
	static $done = [];
	if (isset($done[$provider])) {
		return;
	}
	$done[$provider] = true;

	if ($provider === 'turnstile') {
		wp_enqueue_script(
			'bl-forms-captcha-turnstile',
			'https://challenges.cloudflare.com/turnstile/v0/api.js',
			[],
			null,
			true
		);
		wp_script_add_data('bl-forms-captcha-turnstile', 'strategy', 'defer');
		return;
	}

	if ($provider === 'hcaptcha') {
		wp_enqueue_script(
			'bl-forms-captcha-hcaptcha',
			'https://js.hcaptcha.com/1/api.js',
			[],
			null,
			true
		);
		wp_script_add_data('bl-forms-captcha-hcaptcha', 'strategy', 'defer');
		return;
	}

	if ($provider === 'recaptcha_v2') {
		wp_enqueue_script(
			'bl-forms-captcha-recaptcha',
			'https://www.google.com/recaptcha/api.js',
			[],
			null,
			true
		);
		wp_script_add_data('bl-forms-captcha-recaptcha', 'strategy', 'defer');
		return;
	}

	if ($provider === 'friendly') {
		wp_enqueue_script(
			'bl-forms-captcha-friendly',
			'https://cdn.jsdelivr.net/npm/@friendlycaptcha/sdk@0.1.26/site.min.js',
			[],
			null,
			true
		);
		wp_enqueue_script(
			'bl-forms-captcha-friendly-compat',
			'https://cdn.jsdelivr.net/npm/@friendlycaptcha/sdk@0.1.26/site.compat.min.js',
			[],
			null,
			true
		);
		add_filter('script_loader_tag', 'bl_forms_captcha_friendly_script_tags', 10, 2);
	}
}

/**
 * Mark Friendly Captcha scripts as module / nomodule.
 *
 * @param string $tag
 * @param string $handle
 */
function bl_forms_captcha_friendly_script_tags(string $tag, string $handle): string
{
	if ($handle === 'bl-forms-captcha-friendly') {
		$tag = str_replace('<script ', '<script type="module" async defer ', $tag);
	}
	if ($handle === 'bl-forms-captcha-friendly-compat') {
		$tag = str_replace('<script ', '<script nomodule async defer ', $tag);
	}

	return $tag;
}

/**
 * Verify a captcha response with the provider.
 *
 * @param array<string, mixed> $field
 */
function bl_forms_verify_captcha(array $field, string $response, string $remote_ip = ''): bool
{
	$provider = sanitize_key((string) ($field['captcha_provider'] ?? 'turnstile'));
	$site_key = trim((string) ($field['captcha_site_key'] ?? ''));
	$secret = trim((string) ($field['captcha_secret_key'] ?? ''));

	if ($site_key === '' || $secret === '' || $response === '') {
		return false;
	}

	if (!in_array($provider, bl_forms_captcha_providers(), true)) {
		return false;
	}

	if ($provider === 'friendly') {
		return bl_forms_verify_friendly_captcha($response, $secret, $site_key);
	}

	$endpoints = [
		'turnstile'    => 'https://challenges.cloudflare.com/turnstile/v0/siteverify',
		'hcaptcha'     => 'https://hcaptcha.com/siteverify',
		'recaptcha_v2' => 'https://www.google.com/recaptcha/api/siteverify',
	];
	$endpoint = $endpoints[$provider] ?? '';
	if ($endpoint === '') {
		return false;
	}

	$body = [
		'secret'   => $secret,
		'response' => $response,
	];
	if ($remote_ip !== '') {
		$body['remoteip'] = $remote_ip;
	}

	$res = wp_remote_post($endpoint, [
		'timeout' => 10,
		'body'    => $body,
	]);

	if (is_wp_error($res)) {
		return false;
	}

	$data = json_decode((string) wp_remote_retrieve_body($res), true);

	return is_array($data) && !empty($data['success']);
}

/**
 * Friendly Captcha v2 siteverify (API key header).
 */
function bl_forms_verify_friendly_captcha(string $response, string $api_key, string $site_key): bool
{
	$payload = [
		'response' => $response,
	];
	if ($site_key !== '') {
		$payload['sitekey'] = $site_key;
	}

	$res = wp_remote_post('https://global.frcapi.com/api/v2/captcha/siteverify', [
		'timeout' => 10,
		'headers' => [
			'Content-Type' => 'application/json',
			'X-API-Key'    => $api_key,
		],
		'body' => wp_json_encode($payload),
	]);

	if (is_wp_error($res)) {
		return false;
	}

	$data = json_decode((string) wp_remote_retrieve_body($res), true);

	return is_array($data) && !empty($data['success']);
}
