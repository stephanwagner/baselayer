<?php

defined('ABSPATH') || exit;

/**
 * ISO 639-1 language flag helpers (flags-iso-639/).
 */

/**
 * @return array<string, string> ISO 639-1 => ISO 3166-1 alpha-2 source flag code.
 */
function fs_language_flag_map(): array
{
	static $map = null;
	if ($map !== null) {
		return $map;
	}

	$file = get_template_directory() . '/config/language-flags.json';
	if (!is_readable($file)) {
		$map = [];
		return $map;
	}

	$decoded = json_decode((string) file_get_contents($file), true);
	$map = is_array($decoded) ? $decoded : [];

	return $map;
}

/**
 * Path to an ISO 639-1 flag SVG relative to theme assets (e.g. img/flags-iso-639/de.svg).
 */
function fs_language_flag_asset_path(string $lang_id): string
{
	$lang_id = strtolower(preg_replace('/[^a-z]/', '', $lang_id));
	if ($lang_id === '') {
		return '';
	}

	$relative = 'img/flags-iso-639/' . $lang_id . '.svg';
	$full = get_template_directory() . '/assets/' . $relative;

	return is_readable($full) ? $relative : '';
}

/**
 * Public URL for a language flag, or empty string when missing.
 */
function fs_language_flag_url(string $lang_id): string
{
	$relative = fs_language_flag_asset_path($lang_id);
	if ($relative === '') {
		return '';
	}

	return function_exists('fs_asset_url') ? fs_asset_url('/' . $relative) : '';
}

/**
 * Flag <img> markup for a language switcher item.
 */
function fs_language_flag_img(string $lang_id, string $label): string
{
	$url = fs_language_flag_url($lang_id);
	if ($url === '') {
		return '';
	}

	$alt = $label !== '' ? sprintf(
		/* translators: %s: language name */
		__('Flag for %s', 'fromscratch'),
		$label
	) : '';

	return sprintf(
		'<img class="fs-lang-item__flag" src="%s" alt="%s" width="20" height="15" loading="lazy" decoding="async" />',
		esc_url($url),
		esc_attr($alt)
	);
}

/**
 * Inner HTML for a language switcher item (flag + label).
 */
function fs_language_switcher_item_content(string $lang_id, string $label): string
{
	$flag = fs_language_flag_img($lang_id, $label);
	$text = '<span class="fs-lang-item__label">' . esc_html($label) . '</span>';

	if ($flag === '') {
		return $text;
	}

	return $flag . $text;
}
