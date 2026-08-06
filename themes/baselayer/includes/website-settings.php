<?php

defined('ABSPATH') || exit;

/**
 * Whether Website settings should use ACF options storage.
 */
function bl_website_uses_acf(): bool
{
	if (function_exists('bl_theme_blocks_system')) {
		return bl_theme_blocks_system() === 'acf';
	}

	return function_exists('get_field');
}

/**
 * Baselayer site_settings option values for a catalog slug.
 *
 * @return array<string, mixed>
 */
function bl_website_site_values(string $slug): array
{
	$slug = sanitize_key($slug);
	if ($slug === '') {
		return [];
	}

	if (function_exists('bl_blocks_site_option_key')) {
		$key = bl_blocks_site_option_key($slug);
	} else {
		$key = 'bl_blocks_site_' . $slug;
	}

	$raw = get_option($key, []);

	return is_array($raw) ? $raw : [];
}

/**
 * Company details from Website → General (or ACF company group).
 *
 * @return array{name: string, address: string, phone: string, email: string}
 */
function bl_get_company(): array
{
	$empty = [
		'name' => '',
		'address' => '',
		'phone' => '',
		'email' => '',
	];

	if (bl_website_uses_acf()) {
		if (!function_exists('get_field')) {
			return $empty;
		}
		$company = get_field('company', 'option');
		$company = is_array($company) ? $company : [];

		return [
			'name' => (string) ($company['name'] ?? ''),
			'address' => (string) ($company['address'] ?? ''),
			'phone' => (string) ($company['phone'] ?? ''),
			'email' => (string) ($company['email'] ?? ''),
		];
	}

	$values = bl_website_site_values('general');

	return [
		'name' => (string) ($values['name'] ?? ''),
		'address' => (string) ($values['address'] ?? ''),
		'phone' => (string) ($values['phone'] ?? ''),
		'email' => (string) ($values['email'] ?? ''),
	];
}

/**
 * Whether a stored toggle/checkbox value is on.
 *
 * @param mixed $value
 */
function bl_website_truthy($value): bool
{
	if (is_bool($value)) {
		return $value;
	}
	if (is_int($value) || is_float($value)) {
		return (int) $value !== 0;
	}
	if (is_string($value)) {
		$v = strtolower(trim($value));

		return $v !== '' && $v !== '0' && $v !== 'false' && $v !== 'off' && $v !== 'no';
	}

	return !empty($value);
}

/**
 * Normalize datetime strings from ACF (Y-m-d H:i:s) or HTML datetime-local (Y-m-d\TH:i).
 */
function bl_website_normalize_datetime(string $value): string
{
	$value = trim($value);
	if ($value === '') {
		return '';
	}

	$value = str_replace('T', ' ', $value);
	// datetime-local often omits seconds.
	if (preg_match('/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/', $value)) {
		$value .= ':00';
	}

	return $value;
}
