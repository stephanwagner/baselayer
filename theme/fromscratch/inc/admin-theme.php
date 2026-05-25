<?php

defined('ABSPATH') || exit;

/**
 * Custom wp-admin color scheme (Users → Profile → Admin Color Scheme).
 */
function fs_register_admin_color_scheme(): void
{
	static $registered = false;
	if ($registered) {
		return;
	}
	$registered = true;

	wp_admin_css_color(
		'fromscratch',
		__('FromScratch', 'fromscratch'),
		get_template_directory_uri() . '/assets/admin/theme-fromscratch.css',
		['#0c0c0c', '#1e1e1e', '#1d6ebf', '#4387db']
	);
}

/**
 * Register on init so the scheme exists on the frontend (admin bar), not only in wp-admin.
 */
add_action('init', 'fs_register_admin_color_scheme', 1);

/**
 * Default for newly created users.
 */
add_filter('default_admin_color', static function (): string {
	return 'fromscratch';
});

/**
 * Fallback when no scheme is stored yet.
 *
 * @param string|false $color
 */
add_filter('get_user_option_admin_color', static function ($color): string {
	if ($color === false || $color === '') {
		return 'fromscratch';
	}

	return is_string($color) ? $color : 'fresh';
}, 5);

/**
 * On theme switch: adopt FromScratch if the account still uses a stock WordPress scheme.
 * Does not override a scheme the user picked in Profile.
 */
add_action('after_switch_theme', static function (): void {
	$wp_defaults = ['fresh', 'light', 'blue', 'coffee', 'ectoplasm', 'midnight', 'ocean', 'sunrise'];
	$user_id = get_current_user_id();
	if ($user_id <= 0) {
		return;
	}

	$color = get_user_meta($user_id, 'admin_color', true);
	if ($color === '' || !is_string($color) || in_array($color, $wp_defaults, true)) {
		update_user_meta($user_id, 'admin_color', 'fromscratch');
	}
});

/**
 * Toolbar-only accent colors on the public site (logged in).
 * Do not load theme-fromscratch.css here: it imports wp-admin colors and global link rules.
 */
function fs_enqueue_admin_color_scheme_toolbar(): void
{
	if (!is_admin_bar_showing() || is_admin()) {
		return;
	}

	$user_id = get_current_user_id();
	if ($user_id <= 0 || get_user_option('admin_color', $user_id) !== 'fromscratch') {
		return;
	}

	// Core may enqueue the full wp-admin scheme; that leaks global link and menu styles.
	wp_dequeue_style('colors-fromscratch');

	if (wp_style_is('fromscratch-admin-color', 'enqueued') || wp_style_is('fromscratch-admin-color', 'done')) {
		return;
	}

	$file = 'assets/admin/theme-fromscratch-toolbar.css';

	wp_enqueue_style(
		'fromscratch-admin-color',
		get_template_directory_uri() . '/' . $file,
		['admin-bar'],
		function_exists('fs_asset_hash') ? fs_asset_hash($file) : (string) filemtime(get_template_directory() . '/' . $file)
	);
}

add_action('wp_enqueue_scripts', 'fs_enqueue_admin_color_scheme_toolbar', 20);
