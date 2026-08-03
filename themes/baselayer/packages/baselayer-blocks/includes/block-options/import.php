<?php

defined('ABSPATH') || exit;

/**
 * Package install/bootstrap seed path.
 *
 * Ongoing Block Options live in the bl_block_options DB store (admin UI).
 * This JSON only fills an empty store once (install / first bootstrap).
 */
function bl_block_options_package_import_path(): string
{
	$path = dirname(__DIR__, 2) . '/seed/block-options-import.json';
	return is_readable($path) ? $path : '';
}

/**
 * @deprecated Use bl_block_options_package_import_path(). Kept for callers of the old name.
 */
function bl_block_options_theme_import_path(): string
{
	return bl_block_options_package_import_path();
}

function bl_block_options_store_is_empty(): bool
{
	$store = bl_block_options_get_store();
	return ($store['presets'] ?? []) === [] && ($store['blocks'] ?? []) === [];
}

/**
 * Import a store-shaped JSON string into bl_block_options.
 *
 * @param array{replace?: bool} $args
 * @return array{presets: int, blocks: int}|WP_Error
 */
function bl_block_options_import_json_string(string $raw, array $args = [])
{
	$decoded = json_decode($raw, true);
	if (!is_array($decoded)) {
		return new WP_Error('bl_block_options_import_json', __('Invalid block options JSON.', 'baselayer-blocks'));
	}

	$replace = !empty($args['replace']);
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
 * @param array{replace?: bool} $args
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
 * Import package seed defaults into the store.
 *
 * @param array{replace?: bool} $args
 * @return array{presets: int, blocks: int}|WP_Error
 */
function bl_block_options_import_theme_defaults(array $args = [])
{
	$path = bl_block_options_package_import_path();
	if ($path === '') {
		return new WP_Error(
			'bl_block_options_import_missing',
			__('Block options catalog JSON not found.', 'baselayer-blocks')
		);
	}

	return bl_block_options_import_from_file($path, $args);
}

/**
 * Auto-import package seed once when the store is empty.
 */
function bl_block_options_maybe_bootstrap_from_theme(): void
{
	if (!is_admin() || !bl_block_options_store_is_empty()) {
		return;
	}

	if (get_option('bl_block_options_bootstrapped')) {
		return;
	}

	$result = bl_block_options_import_theme_defaults(['replace' => true]);
	if (is_wp_error($result)) {
		return;
	}

	update_option('bl_block_options_bootstrapped', 1, false);
}
add_action('admin_init', 'bl_block_options_maybe_bootstrap_from_theme', 5);
