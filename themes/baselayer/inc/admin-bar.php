<?php

defined('ABSPATH') || exit;

/**
 * Remove toolbar nodes whose parent is $parent_id (repeat until none left).
 */
function bl_admin_bar_remove_children_of(\WP_Admin_Bar $wp_admin_bar, string $parent_id): void
{
	for ($guard = 0; $guard < 100; $guard++) {
		$nodes = $wp_admin_bar->get_nodes();
		if (!is_array($nodes)) {
			return;
		}
		$removed = false;
		foreach (array_keys($nodes) as $id) {
			if ($id === 'site-name') {
				continue;
			}
			$n = $wp_admin_bar->get_node($id);
			if (!$n || !isset($n->parent)) {
				continue;
			}
			if ((string) $n->parent === $parent_id) {
				$wp_admin_bar->remove_node($id);
				$removed = true;
			}
		}
		if (!$removed) {
			break;
		}
	}
}

/**
 * Strip everything under Site Name (core uses ids like view-site, dashboard, appearance → themes/menus, plugins).
 */
function bl_admin_bar_strip_site_name_submenu(\WP_Admin_Bar $wp_admin_bar): void
{
	// Children of the Appearance group first, then the group itself.
	bl_admin_bar_remove_children_of($wp_admin_bar, 'appearance');
	$wp_admin_bar->remove_node('appearance');
	// Everything directly under site-name (Visit Site, Dashboard, Plugins, multisite items, etc.).
	bl_admin_bar_remove_children_of($wp_admin_bar, 'site-name');
}

add_action('admin_bar_menu', function (\WP_Admin_Bar $wp_admin_bar): void {
	if (!is_user_logged_in() || !is_admin_bar_showing()) {
		return;
	}

	$wp_admin_bar->remove_node('customize');

	$node = $wp_admin_bar->get_node('site-name');
	if (!$node) {
		return;
	}

	if (is_admin()) {

		bl_admin_bar_strip_site_name_submenu($wp_admin_bar);

		$node->title = esc_html__('View Site', 'baselayer');
		$node->href = home_url('/');
		if (isset($node->meta) && is_array($node->meta)) {
			$node->meta['menu_title'] = $node->title;
		}
		$wp_admin_bar->add_node($node);

		return;
	}

	// --- Frontend: top item = "Dashboard" → wp-admin; submenu only Menus + Theme settings (no duplicate Dashboard link).
	bl_admin_bar_strip_site_name_submenu($wp_admin_bar);

	if (current_user_can('read')) {
		$node->title = esc_html__('Dashboard', 'baselayer');
		$node->href = admin_url();
	} else {
		$title = get_bloginfo('name');
		if ($title === '') {
			$title = preg_replace('#^(https?://)?(www\.)?#', '', (string) get_home_url());
		}
		$node->title = wp_html_excerpt($title, 40, '…');
		$node->href = home_url('/');
	}
	if (isset($node->meta) && is_array($node->meta)) {
		$node->meta['menu_title'] = $node->title;
	}
	$wp_admin_bar->add_node($node);

	if (current_user_can('manage_options')
		&& function_exists('bl_theme_settings_has_any_access')
		&& bl_theme_settings_has_any_access()) {
		$wp_admin_bar->add_node([
			'id' => 'fs-site-theme-settings',
			'parent' => 'site-name',
			'title' => __('Theme settings', 'baselayer'),
			'href' => admin_url('options-general.php?page=fs-theme-settings'),
		]);
	}

	if (current_user_can('edit_theme_options')) {
		$wp_admin_bar->add_node([
			'id' => 'fs-site-menus',
			'parent' => 'site-name',
			'title' => __('Menus', 'baselayer'),
			'href' => admin_url('nav-menus.php'),
		]);
	}
}, 9999);
