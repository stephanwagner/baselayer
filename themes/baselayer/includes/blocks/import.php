<?php

defined('ABSPATH') || exit;

/**
 * Locate theme block-options import JSON (child overrides parent).
 */
function bl_block_options_theme_import_path(): string
{
	$relative = 'config/block-options-import.json';
	$candidates = [];

	if (function_exists('get_stylesheet_directory')) {
		$candidates[] = trailingslashit(get_stylesheet_directory()) . $relative;
	}
	if (function_exists('get_template_directory')) {
		$candidates[] = trailingslashit(get_template_directory()) . $relative;
	}

	foreach ($candidates as $path) {
		if (is_string($path) && $path !== '' && is_readable($path)) {
			return $path;
		}
	}

	return '';
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
		return new WP_Error('bl_block_options_import_json', __('Invalid block options JSON.', 'baselayer'));
	}

	$replace = !empty($args['replace']);
	$incoming = bl_block_options_sanitize_store($decoded);

	if (!$replace && !bl_block_options_store_is_empty()) {
		return new WP_Error(
			'bl_block_options_import_not_empty',
			__('Block options store is not empty. Use replace to overwrite.', 'baselayer')
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
			__('Block options import file not found.', 'baselayer')
		);
	}

	$raw = file_get_contents($path);
	if (!is_string($raw) || $raw === '') {
		return new WP_Error(
			'bl_block_options_import_empty',
			__('Block options import file is empty.', 'baselayer')
		);
	}

	return bl_block_options_import_json_string($raw, $args);
}

/**
 * Import theme defaults from config/block-options-import.json.
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
			__('Theme catalog JSON not found (config/block-options-import.json).', 'baselayer')
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
				__('Imported %1$d presets and %2$d block assignments.', 'baselayer'),
				(int) $result['presets'],
				(int) $result['blocks']
			),
		], 60);
		update_option('bl_block_options_bootstrapped', 1, false);
	}

	wp_safe_redirect(admin_url('admin.php?page=' . BL_BLOCK_OPTIONS_PAGE));
	exit;
}
add_action('admin_init', 'bl_block_options_handle_admin_import', 4);
