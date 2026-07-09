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
 * New users: assign the FromScratch admin color scheme.
 */
add_action('user_register', static function (int $user_id): void {
	update_user_meta($user_id, 'admin_color', 'fromscratch');
}, 10, 1);

/**
 * Skip the wp-admin color scheme on the public site (core would leak global link/menu styles).
 */
add_action('wp_enqueue_scripts', static function (): void {
	if (is_admin() || !is_admin_bar_showing()) {
		return;
	}

	wp_dequeue_style('colors-fromscratch');
}, 100);
