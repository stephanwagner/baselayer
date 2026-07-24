<?php

defined('ABSPATH') || exit;

/**
 * Maintenance mode: when enabled, the whole frontend returns 503 with an editable title and description.
 * Logged-in administrators and editors bypass. Options in Settings → Developer → Security.
 */

/**
 * If maintenance mode is on, block frontend with 503 and show maintenance page. Admins/editors bypass.
 */
function bl_maintenance_gate(): void
{
	if (get_option('baselayer_maintenance_mode') !== '1') {
		return;
	}
	if (is_admin()) {
		return;
	}
	if (defined('DOING_CRON') && DOING_CRON) {
		return;
	}
	if (defined('WP_CLI') && constant('WP_CLI')) {
		return;
	}
	// Logged-in admins and editors bypass
	if (is_user_logged_in()) {
		$user = wp_get_current_user();
		if ($user->exists() && (user_can($user, 'edit_posts') || user_can($user, 'manage_options'))) {
			return;
		}
	}
	bl_maintenance_show_page();
}

/**
 * Output maintenance page with 503 status and exit.
 */
function bl_maintenance_show_page(): void
{
	// Load text domain for maintenance page
	if (!is_textdomain_loaded('baselayer')) {
		load_theme_textdomain('baselayer');
		if (!is_textdomain_loaded('baselayer')) {
			$mofile = get_template_directory() . '/languages/baselayer-' . determine_locale() . '.mo';
			if (file_exists($mofile)) {
				load_textdomain('baselayer', $mofile);
			}
		}
	}

	$title = get_option('baselayer_maintenance_title', '');
	if ($title === '') {
		$title = __('Maintenance', 'baselayer');
	}
	$description = get_option('baselayer_maintenance_description', '');
	if ($description === '') {
		$description = __('We are currently performing scheduled maintenance. Please check back shortly.', 'baselayer');
	}
	$body = '<div class="notice">' . esc_html($description) . '</div>';
	bl_block_page($title, $body, ['status' => 503]);
}

/**
 * Initialize maintenance gate.
 */
add_action('init', 'bl_maintenance_gate', 0);
