<?php

defined('ABSPATH') || exit;

/**
 * Path to bundled language data (not user-editable theme config).
 */
function fs_language_data_path(string $filename): string
{
	return get_template_directory() . '/data/languages/' . ltrim($filename, '/');
}

/**
 * ISO 639-1 language catalog for Developer → Languages quick-add.
 *
 * @return list<array{id: string, name: string, nameNative: string}>
 */
function fs_iso639_language_catalog(): array
{
	static $catalog = null;
	if ($catalog !== null) {
		return $catalog;
	}

	$file = fs_language_data_path('iso639-catalog.json');
	if (!is_readable($file)) {
		$catalog = [];
		return $catalog;
	}

	$decoded = json_decode((string) file_get_contents($file), true);
	if (!is_array($decoded)) {
		$catalog = [];
		return $catalog;
	}

	$catalog = [];
	foreach ($decoded as $entry) {
		if (!is_array($entry) || empty($entry['id']) || !is_string($entry['id'])) {
			continue;
		}
		$id = strtolower(preg_replace('/[^a-z]/', '', $entry['id']));
		if ($id === '') {
			continue;
		}
		$catalog[] = [
			'id' => $id,
			'name' => isset($entry['name']) && is_string($entry['name']) ? $entry['name'] : $id,
			'nameNative' => isset($entry['nameNative']) && is_string($entry['nameNative']) ? $entry['nameNative'] : '',
		];
	}

	usort($catalog, static function (array $a, array $b): int {
		return strcasecmp($a['name'], $b['name']);
	});

	return $catalog;
}

/**
 * @return array<string, array{id: string, name: string, nameNative: string}> Keyed by language id.
 */
function fs_iso639_language_catalog_by_id(): array
{
	$by_id = [];
	foreach (fs_iso639_language_catalog() as $entry) {
		$by_id[$entry['id']] = $entry;
	}
	return $by_id;
}

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

	$file = fs_language_data_path('flag-map.json');
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
 * Admin flag preview markup (Developer → Languages table).
 */
function fs_language_flag_preview_markup(string $lang_id = ''): string
{
	$url = fs_language_flag_url($lang_id);
	$hidden = $url === '' ? ' hidden' : '';

	return sprintf(
		'<span class="fs-language-flag-preview"><img class="fs-language-flag-preview__img" src="%s" width="28" height="21" alt="" decoding="async"%s /></span>',
		$url !== '' ? esc_url($url) : '',
		$hidden
	);
}

/**
 * Table cell with language flag preview for the languages settings table.
 */
function fs_language_flag_admin_cell(string $lang_id = ''): string
{
	return '<td class="fs-language-flag-cell">' . fs_language_flag_preview_markup($lang_id) . '</td>';
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
