<?php

defined('ABSPATH') || exit;

require_once get_template_directory() . '/includes/menu-walker.php';
require_once get_template_directory() . '/includes/menu-options.php';

/**
 * Normalize a URL to its path for menu/archive comparison (no trailing slash).
 */
function bl_menu_url_path(string $url): string
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
function bl_menu_item_matches_post_type_archive(object $item, string $post_type): bool
{
	if ($item->type === 'post_type_archive' && $item->object === $post_type) {
		return true;
	}

	$archive_url = get_post_type_archive_link($post_type);
	if (!$archive_url || empty($item->url)) {
		return false;
	}

	return bl_menu_url_path((string) $item->url) === bl_menu_url_path($archive_url);
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

	if (!bl_menu_item_matches_post_type_archive($item, $post_type)) {
		return $classes;
	}

	$classes[] = in_array('menu-item-has-children', $classes, true)
		? 'current-menu-parent'
		: 'current-menu-item';

	return $classes;
}, 10, 4);

/**
 * Use archive menu label from config for post type archive nav items (not “Veranstaltung-Archive”).
 * Also applies to custom links that point at a content-type archive URL.
 */
add_filter('nav_menu_item_title', function (string $title, $item, $args, $depth): string {
	unset($args, $depth);

	if (is_admin() || !isset($item->type) || !function_exists('bl_cpt_archive_menu_label')) {
		return $title;
	}

	$post_type = '';
	if ($item->type === 'post_type_archive' && isset($item->object) && is_string($item->object)) {
		$post_type = $item->object;
	} elseif ($item->type === 'custom' && !empty($item->url) && function_exists('bl_get_content_types')) {
		foreach (array_keys(bl_get_content_types()) as $candidate) {
			if (!is_string($candidate) || $candidate === '') {
				continue;
			}
			if (function_exists('bl_menu_item_matches_post_type_archive')
				&& bl_menu_item_matches_post_type_archive($item, $candidate)
			) {
				$post_type = $candidate;
				break;
			}
		}
	}

	if ($post_type === '') {
		return $title;
	}

	$label = bl_cpt_archive_menu_label($post_type);

	return $label !== '' ? $label : $title;
}, 10, 4);

