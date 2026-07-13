<?php

defined('ABSPATH') || exit;

/** @var string Block editor + front: show `<h1>` on the page (default on). */
const BL_SHOW_PAGE_TITLE_META = '_bl_show_page_title';

/** @var string Admin dashboard welcome panel: list under “Pinned”. */
const BL_PIN_TO_DASHBOARD_META = '_bl_pin_to_dashboard';

/**
 * Post types that get “Pin to dashboard” (block editor + theme types: post, page, CPTs).
 *
 * @return array<int, string>
 */
function bl_pin_to_dashboard_post_types(): array
{
	$result = [];
	foreach (bl_theme_post_types() as $name) {
		if (post_type_supports($name, 'editor')) {
			$result[] = $name;
		}
	}

	return apply_filters('bl_pin_to_dashboard_post_types', $result);
}

/**
 * Whether this post type supports the “Show title” Summary control and singular &lt;h1&gt; toggle.
 * Pages always do. Blog (`post`) and CPTs only when `admin.page_title_toggle` is true in config/content-types/.
 *
 * @param string $post_type Post type slug.
 */
function bl_post_type_has_page_title_toggle(string $post_type): bool
{
	if ($post_type === 'page') {
		return true;
	}
	if ($post_type === 'post') {
		if (!function_exists('bl_content_type_enabled') || !bl_content_type_enabled('post')) {
			return false;
		}
		$post_cfg = bl_config_cpt('post');

		$admin = is_array($post_cfg) ? bl_content_type_admin('post') : [];

		return !empty($admin['page_title_toggle']);
	}
	$cpts = bl_config_cpt('all');
	if (!is_array($cpts) || !isset($cpts[$post_type]) || !is_array($cpts[$post_type])) {
		return false;
	}

	$admin = bl_content_type_admin($post_type);

	return !empty($admin['page_title_toggle']);
}

/**
 * Post types that register {@see BL_SHOW_PAGE_TITLE_META} and show the editor control.
 *
 * @return array<int, string>
 */
function bl_show_title_toggle_post_types(): array
{
	$result = [];
	foreach (bl_theme_post_types() as $slug) {
		if (bl_post_type_has_page_title_toggle($slug)) {
			$result[] = $slug;
		}
	}

	return apply_filters('bl_show_title_toggle_post_types', array_unique($result));
}

/**
 * Register post meta for pages (REST / block editor).
 *
 * @return void
 */
function bl_page_editor_options_register_meta(): void
{
	$auth = static function (bool $allowed, string $meta_key, int $post_id): bool {
		return current_user_can('edit_post', $post_id);
	};
	$show_title_args = [
		'type' => 'boolean',
		'single' => true,
		'show_in_rest' => true,
		'auth_callback' => $auth,
		'sanitize_callback' => static function ($value): bool {
			return (bool) $value;
		},
		'default' => true,
	];
	foreach (bl_show_title_toggle_post_types() as $post_type) {
		register_post_meta($post_type, BL_SHOW_PAGE_TITLE_META, $show_title_args);
	}
	$pin_args = [
		'type' => 'boolean',
		'single' => true,
		'show_in_rest' => true,
		'auth_callback' => $auth,
		'sanitize_callback' => static function ($value): bool {
			return (bool) $value;
		},
		'default' => false,
	];
	foreach (bl_pin_to_dashboard_post_types() as $post_type) {
		register_post_meta($post_type, BL_PIN_TO_DASHBOARD_META, $pin_args);
	}
}
add_action('init', 'bl_page_editor_options_register_meta');

/**
 * Whether the singular template should output a visible &lt;h1&gt; title (default: yes).
 *
 * @param int $post_id Post ID.
 * @return bool
 */
function bl_page_should_show_title(int $post_id): bool
{
	$type = get_post_type($post_id);
	if (!$type || !bl_post_type_has_page_title_toggle($type)) {
		return true;
	}
	$raw = get_post_meta($post_id, BL_SHOW_PAGE_TITLE_META, true);
	if ($raw === '' || $raw === false) {
		return false;
	}

	return filter_var($raw, FILTER_VALIDATE_BOOLEAN);
}

/**
 * Mark the block editor admin body when the page title is hidden (for canvas styling).
 */
add_filter('admin_body_class', function (string $classes): string {
	if (!function_exists('get_current_screen')) {
		return $classes;
	}

	$screen = get_current_screen();
	if (!$screen instanceof WP_Screen || !$screen->is_block_editor()) {
		return $classes;
	}

	$post_id = isset($_GET['post']) ? (int) $_GET['post'] : 0;
	if ($post_id <= 0) {
		return $classes;
	}

	$type = get_post_type($post_id);
	if (!$type || !bl_post_type_has_page_title_toggle($type)) {
		return $classes;
	}

	if (bl_page_should_show_title($post_id)) {
		return $classes;
	}

	return $classes . ' bl-page-title-hidden';
});

/**
 * Strings for the block editor (Summary sidebar).
 *
 * @return void
 */
function bl_page_editor_options_localize(): void
{
	wp_localize_script('baselayer-editor', 'baselayerPageSidebarOptions', [
		'labelShowTitlePage' => __('Show page title', 'baselayer'),
		'labelPinDashboard' => __('Pin to dashboard', 'baselayer'),
		'pinPostTypes' => bl_pin_to_dashboard_post_types(),
		'showTitlePostTypes' => bl_show_title_toggle_post_types(),
	]);
}
add_action('enqueue_block_editor_assets', 'bl_page_editor_options_localize', 12);
