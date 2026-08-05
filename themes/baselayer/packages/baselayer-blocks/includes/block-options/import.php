<?php

defined('ABSPATH') || exit;

/**
 * Core seed path (presets + core/* assignments).
 *
 * Ongoing Block Options live in the bl_block_options DB store (admin UI).
 * Core JSON fills an empty store on install / first bootstrap; later imports merge.
 * Resolution: child theme → parent theme → package seed (plugin export fallback).
 */
function bl_block_options_core_import_path(): string
{
	$relative = 'blocks/import-block-options-core.json';

	if (function_exists('get_stylesheet_directory')) {
		$child = trailingslashit(get_stylesheet_directory()) . $relative;
		if (is_readable($child)) {
			return $child;
		}
	}

	if (function_exists('get_template_directory')) {
		$parent = trailingslashit(get_template_directory()) . $relative;
		if (is_readable($parent)) {
			return $parent;
		}
	}

	$fallback = dirname(__DIR__, 2) . '/seed/import-block-options-core.json';
	return is_readable($fallback) ? $fallback : '';
}

/**
 * Theme ACF block-options assignments path (acf/* only).
 */
function bl_block_options_acf_import_path(): string
{
	$dirs = [];
	if (function_exists('get_stylesheet_directory')) {
		$dirs[] = get_stylesheet_directory();
	}
	if (function_exists('get_template_directory')) {
		$dirs[] = get_template_directory();
	}
	foreach (array_unique($dirs) as $dir) {
		$path = $dir . '/acf/import-block-options-acf.json';
		if (is_readable($path)) {
			return $path;
		}
	}

	return '';
}

/**
 * @deprecated Use bl_block_options_core_import_path().
 */
function bl_block_options_package_import_path(): string
{
	return bl_block_options_core_import_path();
}

/**
 * @deprecated Use bl_block_options_core_import_path().
 */
function bl_block_options_theme_import_path(): string
{
	return bl_block_options_core_import_path();
}

function bl_block_options_store_is_empty(): bool
{
	$store = bl_block_options_get_store();
	return ($store['presets'] ?? []) === [] && ($store['blocks'] ?? []) === [];
}

/**
 * Additive merge into the current store.
 *
 * - Upsert presets by slug
 * - Upsert block assignments by block name (overwrite that block’s items only)
 *
 * @param array<string, mixed> $partial Store-shaped partial (presets and/or blocks)
 * @return array{presets: int, blocks: int}
 */
function bl_block_options_merge_store(array $partial): array
{
	$incoming = bl_block_options_sanitize_store($partial);
	$store = bl_block_options_get_store();

	foreach ($incoming['presets'] as $slug => $preset) {
		$store['presets'][$slug] = $preset;
	}

	foreach ($incoming['blocks'] as $block_name => $entry) {
		$store['blocks'][$block_name] = $entry;
	}

	bl_block_options_save_store($store);

	return [
		'presets' => count($incoming['presets']),
		'blocks' => count($incoming['blocks']),
	];
}

/**
 * Import a store-shaped JSON string into bl_block_options.
 *
 * @param array{replace?: bool, merge?: bool} $args
 * @return array{presets: int, blocks: int}|WP_Error
 */
function bl_block_options_import_json_string(string $raw, array $args = [])
{
	$decoded = json_decode($raw, true);
	if (!is_array($decoded)) {
		return new WP_Error('bl_block_options_import_json', __('Invalid block options JSON.', 'baselayer-blocks'));
	}

	$replace = !empty($args['replace']);
	$merge = !empty($args['merge']);

	if ($merge) {
		return bl_block_options_merge_store($decoded);
	}

	$incoming = bl_block_options_sanitize_store($decoded);

	if (!$replace && !bl_block_options_store_is_empty()) {
		return new WP_Error(
			'bl_block_options_import_not_empty',
			__('Block options store is not empty. Use replace to overwrite.', 'baselayer-blocks')
		);
	}

	bl_block_options_save_store($incoming);

	return [
		'presets' => count($incoming['presets']),
		'blocks' => count($incoming['blocks']),
	];
}

/**
 * Import from a filesystem path.
 *
 * @param array{replace?: bool, merge?: bool} $args
 * @return array{presets: int, blocks: int}|WP_Error
 */
function bl_block_options_import_from_file(string $path, array $args = [])
{
	if ($path === '' || !is_readable($path)) {
		return new WP_Error(
			'bl_block_options_import_missing',
			__('Block options import file not found.', 'baselayer-blocks')
		);
	}

	$raw = file_get_contents($path);
	if (!is_string($raw) || $raw === '') {
		return new WP_Error(
			'bl_block_options_import_empty',
			__('Block options import file is empty.', 'baselayer-blocks')
		);
	}

	return bl_block_options_import_json_string($raw, $args);
}

/**
 * Import core seed (presets + core/*).
 *
 * @param array{replace?: bool, merge?: bool} $args
 * @return array{presets: int, blocks: int}|WP_Error
 */
function bl_block_options_import_core(array $args = [])
{
	$path = bl_block_options_core_import_path();
	if ($path === '') {
		return new WP_Error(
			'bl_block_options_import_missing',
			__('Block options core catalog JSON not found.', 'baselayer-blocks')
		);
	}

	return bl_block_options_import_from_file($path, $args);
}

/**
 * Import ACF block option assignments (merge by default).
 *
 * @param array{replace?: bool, merge?: bool} $args
 * @return array{presets: int, blocks: int}|WP_Error
 */
function bl_block_options_import_acf(array $args = [])
{
	$path = bl_block_options_acf_import_path();
	if ($path === '') {
		return new WP_Error(
			'bl_block_options_import_missing',
			__('ACF block options catalog JSON not found.', 'baselayer')
		);
	}

	if (!isset($args['replace']) && !isset($args['merge'])) {
		$args['merge'] = true;
	}

	return bl_block_options_import_from_file($path, $args);
}

/**
 * Apply block_options from a Baselayer block definition import item.
 *
 * @param string               $slug          Block settings slug (without baselayer/ prefix)
 * @param array<string, mixed> $block_options Typically { "items": [...] }
 * @return array{presets: int, blocks: int}|WP_Error|null Null when nothing to apply
 */
function bl_block_options_apply_from_block_definition(string $slug, array $block_options)
{
	$slug = sanitize_key($slug);
	if ($slug === '') {
		return null;
	}

	$items = $block_options['items'] ?? null;
	if (!is_array($items)) {
		return null;
	}

	$block_name = 'baselayer/' . $slug;

	return bl_block_options_merge_store([
		'blocks' => [
			$block_name => [
				'items' => $items,
			],
		],
	]);
}

/**
 * @deprecated Use bl_block_options_import_core().
 *
 * @param array{replace?: bool, merge?: bool} $args
 * @return array{presets: int, blocks: int}|WP_Error
 */
function bl_block_options_import_theme_defaults(array $args = [])
{
	return bl_block_options_import_core($args);
}

/**
 * Auto-import core seed once when the store is empty.
 */
function bl_block_options_maybe_bootstrap_from_theme(): void
{
	if (!is_admin() || !bl_block_options_store_is_empty()) {
		return;
	}

	if (get_option('bl_block_options_bootstrapped')) {
		return;
	}

	$result = bl_block_options_import_core(['replace' => true]);
	if (is_wp_error($result)) {
		return;
	}

	update_option('bl_block_options_bootstrapped', 1, false);
}
add_action('admin_init', 'bl_block_options_maybe_bootstrap_from_theme', 5);
