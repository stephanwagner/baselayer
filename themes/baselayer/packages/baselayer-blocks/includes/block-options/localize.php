<?php

defined('ABSPATH') || exit;

/**
 * Script handle for the package block-options editor bundle.
 */
function bl_block_options_editor_script_handle(): string
{
	return 'bl-block-options-editor';
}

/**
 * Package root (baselayer-blocks/).
 */
function bl_block_options_package_root(): string
{
	return trailingslashit(dirname(__DIR__, 2));
}

/**
 * Vendor kit paths under the package (for canvas/form builders when Blocks package helpers are absent).
 *
 * @return array{vendor_dir: string, vendor_url: string}
 */
function bl_block_options_vendor_kit_args(string $kit): array
{
	$kit = sanitize_key($kit);
	$root = bl_block_options_package_root();
	$rel = 'packages/baselayer-blocks/assets/vendor/' . $kit;

	return [
		'vendor_dir' => $root . 'assets/vendor/' . $kit,
		'vendor_url' => trailingslashit(get_template_directory_uri()) . $rel,
	];
}

/**
 * Enqueue a package CSS/JS asset when Blocks package helpers are not loaded.
 */
function bl_block_options_enqueue_package_asset(string $handle, string $name, string $type, array $deps = [], bool $in_footer = true): bool
{
	$asset = bl_block_options_resolve_asset($name, $type);
	if ($asset === null) {
		return false;
	}
	if ($type === 'css') {
		wp_enqueue_style($handle, $asset['uri'], $deps, $asset['ver']);
	} else {
		wp_enqueue_script($handle, $asset['uri'], $deps, $asset['ver'], $in_footer);
	}

	return true;
}

/**
 * Resolve a built asset under package assets/{css|js}/.
 *
 * @return array{uri: string, path: string, ver: string}|null
 */
function bl_block_options_resolve_asset(string $name, string $type): ?array
{
	if (function_exists('bl_blocks_resolve_asset')) {
		return bl_blocks_resolve_asset($name, $type);
	}

	$type = $type === 'css' ? 'css' : 'js';
	$root = bl_block_options_package_root();
	$dir = $root . 'assets/' . $type;
	$debug = function_exists('bl_is_debug') && bl_is_debug();
	$candidates = $debug
		? [$name . '.' . $type, $name . '.min.' . $type]
		: [$name . '.min.' . $type, $name . '.' . $type];

	$base_url = '';
	if (function_exists('bl_blocks_url')) {
		$base_url = bl_blocks_url('assets/' . $type);
	} elseif (function_exists('get_template_directory_uri')) {
		$base_url = trailingslashit(get_template_directory_uri()) . 'packages/baselayer-blocks/assets/' . $type;
	}

	foreach ($candidates as $file) {
		$path = $dir . '/' . $file;
		if (is_readable($path)) {
			return [
				'uri' => trailingslashit($base_url) . $file,
				'path' => $path,
				'ver' => $debug ? (string) time() : (string) filemtime($path),
			];
		}
	}

	return null;
}

/**
 * Enqueue block-options editor script + localize resolved options.
 */
function bl_block_options_enqueue_editor_assets(): void
{
	$handle = bl_block_options_editor_script_handle();
	$deps = ['wp-blocks', 'wp-element', 'wp-components', 'wp-compose', 'wp-hooks', 'wp-block-editor', 'wp-data', 'wp-i18n'];

	if (function_exists('bl_blocks_enqueue_script')) {
		bl_blocks_enqueue_script($handle, 'block-options-editor', $deps, true);
	} else {
		$asset = bl_block_options_resolve_asset('block-options-editor', 'js');
		if ($asset === null) {
			return;
		}
		wp_enqueue_script($handle, $asset['uri'], $deps, $asset['ver'], true);
	}

	if (!wp_script_is($handle, 'enqueued') && !wp_script_is($handle, 'registered')) {
		return;
	}

	wp_set_script_translations(
		$handle,
		'baselayer-blocks',
		bl_block_options_package_root() . 'languages'
	);

	wp_localize_script($handle, 'baselayerBlockOptions', bl_block_options_for_editor());

	if (function_exists('bl_icons_localize_payload')) {
		wp_localize_script($handle, 'baselayerIcons', bl_icons_localize_payload());
	}

	$css = bl_block_options_resolve_asset('block-options-editor', 'css');
	if ($css !== null) {
		wp_enqueue_style($handle, $css['uri'], [], $css['ver']);
	}
}
add_action('enqueue_block_editor_assets', 'bl_block_options_enqueue_editor_assets', 11);
