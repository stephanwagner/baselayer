<?php

defined('ABSPATH') || exit;

require_once get_template_directory() . '/inc/menu-walker.php';
require_once get_template_directory() . '/inc/menu-options.php';

/**
 * Normalize a URL to its path for menu/archive comparison (no trailing slash).
 */
function fs_menu_url_path(string $url): string
{
	$path = parse_url($url, PHP_URL_PATH);
	if (!is_string($path) || $path === '') {
		return '';
	}

	return untrailingslashit($path);
}

/**
 * Whether a menu item URL points at a post type archive (exact or custom link).
 */
function fs_menu_item_matches_post_type_archive(object $item, string $post_type): bool
{
	if ($item->type === 'post_type_archive' && $item->object === $post_type) {
		return true;
	}

	$archive_url = get_post_type_archive_link($post_type);
	if (!$archive_url || empty($item->url)) {
		return false;
	}

	return fs_menu_url_path((string) $item->url) === fs_menu_url_path($archive_url);
}

/**
 * Highlight CPT archive menu items while viewing a single post of that type.
 *
 * Core only marks post_type_archive items automatically when the menu item type is
 * "Post Type Archive". Custom links and pages pointing at /events/ do not get
 * current-menu-parent on singular views.
 */
add_filter('nav_menu_css_class', function (array $classes, $item, $args, $depth): array {
	unset($args, $depth);

	if (is_admin() || !is_singular()) {
		return $classes;
	}

	$post_type = get_post_type();
	if (!is_string($post_type) || $post_type === '' || in_array($post_type, ['post', 'page'], true)) {
		return $classes;
	}

	$obj = get_post_type_object($post_type);
	if (!$obj || empty($obj->has_archive)) {
		return $classes;
	}

	if (in_array('current-menu-item', $classes, true) || in_array('current-menu-parent', $classes, true)) {
		return $classes;
	}

	if (!fs_menu_item_matches_post_type_archive($item, $post_type)) {
		return $classes;
	}

	$classes[] = in_array('menu-item-has-children', $classes, true)
		? 'current-menu-parent'
		: 'current-menu-item';

	return $classes;
}, 10, 4);

/**
 * Use archive menu label from config for post type archive nav items (not “Veranstaltung-Archive”).
 */
add_filter('nav_menu_item_title', function (string $title, $item, $args, $depth): string {
	unset($args, $depth);

	if (is_admin() || !isset($item->type, $item->object) || $item->type !== 'post_type_archive') {
		return $title;
	}

	$post_type = is_string($item->object) ? $item->object : '';
	if ($post_type === '' || !function_exists('fs_cpt_archive_menu_label')) {
		return $title;
	}

	$label = fs_cpt_archive_menu_label($post_type);

	return $label !== '' ? $label : $title;
}, 10, 4);

