<?php

defined('ABSPATH') || exit;

/**
 * Package default seed path.
 */
function bl_block_options_package_import_path(): string
{
	$path = dirname(__DIR__, 2) . '/seed/block-options-import.json';
	return is_readable($path) ? $path : '';
}

/**
 * Locate block-options import JSON.
 * Theme/child overrides package seed when present.
 */
function bl_block_options_theme_import_path(): string
{
	$relatives = [
		'config/block-options/import.json',
		'config/block-options-import.json', // legacy path
	];
	$dirs = [];

	if (function_exists('get_stylesheet_directory')) {
		$dirs[] = trailingslashit(get_stylesheet_directory());
	}
	if (function_exists('get_template_directory')) {
		$dirs[] = trailingslashit(get_template_directory());
	}

	foreach ($dirs as $dir) {
		foreach ($relatives as $relative) {
			$path = $dir . $relative;
			if (is_readable($path)) {
				return $path;
			}
		}
	}

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
 * Import defaults from theme override or package seed.
 *
 * @param array{replace?: bool} $args
 * @return array{presets: int, blocks: int}|WP_Error
 */
function bl_block_options_import_theme_defaults(array $args = [])
{
	$path = bl_block_options_theme_import_path();
	if ($path === '') {
		return new WP_Error(
			'bl_block_options_import_missing',
			__('Block options catalog JSON not found.', 'baselayer-blocks')
		);
	}

	return bl_block_options_import_from_file($path, $args);
}

/**
 * Auto-import theme defaults once when the store is empty.
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

/**
 * Handle Block Options admin import POST.
 */
function bl_block_options_handle_admin_import(): void
{
	if (!isset($_POST['bl_block_options_import_theme'])) {
		return;
	}
	if (!current_user_can('manage_options')) {
		return;
	}
	check_admin_referer('bl_block_options_import_theme', 'bl_block_options_import_theme_nonce');

	$result = bl_block_options_import_theme_defaults(['replace' => true]);
	$user_id = get_current_user_id();
	$key = 'bl_block_options_import_notice_' . $user_id;

	if (is_wp_error($result)) {
		set_transient($key, [
			'type' => 'error',
			'message' => $result->get_error_message(),
		], 60);
	} else {
		set_transient($key, [
			'type' => 'success',
			'message' => sprintf(
				/* translators: 1: preset count, 2: block count */
				__('Imported %1$d presets and %2$d block assignments.', 'baselayer-blocks'),
				(int) $result['presets'],
				(int) $result['blocks']
			),
		], 60);
		update_option('bl_block_options_bootstrapped', 1, false);
	}

	$redirect = admin_url('admin.php?page=bl-blocks-import-export');
	if (!defined('BL_BLOCK_POST_TYPE') || !post_type_exists(BL_BLOCK_POST_TYPE)) {
		$redirect = admin_url('admin.php?page=' . BL_BLOCK_OPTIONS_PAGE);
	}
	wp_safe_redirect($redirect);
	exit;
}
add_action('admin_init', 'bl_block_options_handle_admin_import', 4);
