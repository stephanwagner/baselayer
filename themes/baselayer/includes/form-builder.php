<?php

defined('ABSPATH') || exit;

const BL_FORM_BUILDER_HANDLE = 'baselayer-form-builder-admin';
const BL_FORM_BUILDER_ASSET = 'form-builder-admin';

/**
 * Resolve form-builder kit asset: theme build first, then optional vendor paths.
 *
 * @param 'css'|'js'               $kind
 * @param array{vendor_dir?: string, vendor_url?: string} $args
 * @return array{uri: string, path: string, ver: string}|null
 */
function bl_form_builder_resolve_asset(string $kind, array $args = []): ?array
{
	$kind = $kind === 'css' ? 'css' : 'js';

	if (function_exists('bl_resolve_built_asset')) {
		$theme = bl_resolve_built_asset(BL_FORM_BUILDER_ASSET, $kind);
		if (is_array($theme)) {
			return [
				'uri' => $theme['uri'],
				'path' => $theme['path'],
				'ver' => $theme['ver'],
			];
		}
	}

	$vendor_dir = isset($args['vendor_dir']) ? (string) $args['vendor_dir'] : '';
	$vendor_url = isset($args['vendor_url']) ? (string) $args['vendor_url'] : '';
	if ($vendor_dir === '' || $vendor_url === '') {
		return null;
	}

	$debug = function_exists('bl_is_debug') && bl_is_debug();
	$name = BL_FORM_BUILDER_ASSET;
	$candidates = $debug
		? [$name . '.' . $kind, $name . '.min.' . $kind]
		: [$name . '.min.' . $kind, $name . '.' . $kind];

	foreach ($candidates as $file) {
		$path = trailingslashit($vendor_dir) . $file;
		if (is_readable($path)) {
			return [
				'uri' => trailingslashit($vendor_url) . $file,
				'path' => $path,
				'ver' => $debug ? (string) time() : (string) filemtime($path),
			];
		}
	}

	return null;
}

/**
 * Enqueue isolatable form-builder kit (JS + CSS). Theme first, vendor fallback.
 *
 * @param array{vendor_dir?: string, vendor_url?: string, deps?: string[]} $args
 * @return string Script/style handle (empty string if nothing enqueued).
 */
function bl_form_builder_enqueue_kit(array $args = []): string
{
	$handle = BL_FORM_BUILDER_HANDLE;
	$enqueued = false;
	$deps = isset($args['deps']) && is_array($args['deps']) ? $args['deps'] : [];

	$css = bl_form_builder_resolve_asset('css', $args);
	if (is_array($css)) {
		wp_enqueue_style($handle, $css['uri'], $deps, $css['ver']);
		$enqueued = true;
	}

	$js = bl_form_builder_resolve_asset('js', $args);
	if (is_array($js)) {
		wp_enqueue_script($handle, $js['uri'], $deps, $js['ver'], true);
		$enqueued = true;
	}

	return $enqueued ? $handle : '';
}

/**
 * Sanitize page-field noun overrides. Empty values are omitted so the UI
 * falls back to the translated Page / Pages defaults.
 *
 * @param mixed $singular
 * @param mixed $plural
 * @return array{text_singular?: string, text_plural?: string}
 */
function bl_page_picker_sanitize_nouns($singular, $plural): array
{
	$out = [];
	$s = sanitize_text_field(trim((string) $singular));
	$p = sanitize_text_field(trim((string) $plural));
	if ($s !== '') {
		$out['text_singular'] = $s;
	}
	if ($p !== '') {
		$out['text_plural'] = $p;
	}

	return $out;
}

/**
 * i18n strings for page-picker field nouns and interpolated picker copy.
 *
 * @param string $domain Text domain (baselayer-forms or baselayer-blocks).
 * @return array<string, string>
 */
function bl_page_picker_field_i18n(string $domain): array
{
	return [
		'pageNounSingular' => __('Page', $domain),
		'pageNounPlural'   => __('Pages', $domain),
		'textSingular'     => __('Text singular', $domain),
		'textPlural'       => __('Text plural', $domain),
		/* translators: %s: singular or plural noun, e.g. Page or Pages */
		'chooseNoun'       => __('Choose %s', $domain),
		/* translators: %s: singular or plural noun, e.g. Page or Pages */
		'changeNoun'       => __('Change %s', $domain),
		/* translators: %s: plural noun, e.g. Pages */
		'selectNoun'       => __('Select %s', $domain),
		/* translators: %s: singular noun, e.g. Page */
		'selectANoun'      => __('Select a %s', $domain),
		/* translators: %s: plural noun, e.g. Pages */
		'selectNounsHelp'  => __('Select one or more %s.', $domain),
		'searchNouns'      => __('Search…', $domain),
		/* translators: %s: plural noun, e.g. Pages */
		'noNounsFound'     => __('No %s found.', $domain),
	];
}

/**
 * Public REST-enabled post types for the shared page picker (excludes attachment).
 *
 * @return list<array{value: string, label: string, restBase: string}>
 */
function bl_page_picker_post_types(): array
{
	$out = [];
	foreach (get_post_types(['public' => true, 'show_in_rest' => true], 'objects') as $pt) {
		if (!$pt instanceof WP_Post_Type || $pt->name === 'attachment') {
			continue;
		}
		$rest_base = is_string($pt->rest_base) && $pt->rest_base !== ''
			? $pt->rest_base
			: $pt->name;
		$out[] = [
			'value'    => $pt->name,
			'label'    => (string) ($pt->labels->name ?: $pt->name),
			'restBase' => $rest_base,
		];
	}

	return $out;
}

/**
 * Sanitize a page-field post_types list. Empty / invalid → all known picker types.
 *
 * @param mixed $raw
 * @return list<string>
 */
function bl_page_picker_sanitize_post_types($raw): array
{
	$catalog = bl_page_picker_post_types();
	$allowed = array_values(array_map(static fn ($row) => $row['value'], $catalog));
	if ($allowed === []) {
		return ['page'];
	}

	$types = [];
	if (is_array($raw)) {
		foreach ($raw as $item) {
			$key = sanitize_key((string) $item);
			if ($key !== '' && in_array($key, $allowed, true) && !in_array($key, $types, true)) {
				$types[] = $key;
			}
		}
	}

	return $types === [] ? $allowed : $types;
}

/**
 * Keep only post IDs whose post_type is in $allowed_types.
 *
 * @param list<int>    $ids
 * @param list<string> $allowed_types
 * @return list<int>
 */
function bl_page_picker_filter_post_ids(array $ids, array $allowed_types): array
{
	if ($allowed_types === []) {
		return [];
	}
	$out = [];
	foreach ($ids as $id) {
		$n = absint($id);
		if ($n <= 0) {
			continue;
		}
		$type = get_post_type($n);
		if (is_string($type) && in_array($type, $allowed_types, true)) {
			$out[] = $n;
		}
	}

	return array_values(array_unique($out));
}
