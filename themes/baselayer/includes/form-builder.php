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
