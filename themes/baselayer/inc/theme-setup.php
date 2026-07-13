<?php

defined('ABSPATH') || exit;

/**
 * Post types used by theme features: post, page, and CPTs from config/content-types/.
 * Used by SEO panel, post expirator, duplicate row action, and similar.
 *
 * @return string[]
 */
function bl_theme_post_types(): array
{
	$types = ['page'];
	if (function_exists('bl_content_type_enabled') && bl_content_type_enabled('post')) {
		$types[] = 'post';
	}
	$cpts = bl_config_cpt('all');
	if (is_array($cpts) && $cpts !== []) {
		$types = array_merge($types, array_keys($cpts));
	}
	return array_unique($types);
}

/**
 * Register theme menus from config.
 * Runs on init so the text domain is loaded before translating labels (WordPress 6.7+).
 *
 * @return void
 */
function bl_menus(): void
{
	add_theme_support('menus');
	$menus = bl_theme_menu_register_map();
	if ($menus === []) {
		return;
	}
	$translated = [];
	foreach ($menus as $slug => $label) {
		$translated[$slug] = __($label, 'baselayer');
	}
	register_nav_menus($translated);
}
add_action('init', 'bl_menus', 10);

/**
 * Support alignwide and alignfull for block editor.
 *
 * @return void
 */
function bl_add_alignwide(): void
{
	add_theme_support('align-wide');
}
add_action('after_setup_theme', 'bl_add_alignwide');

/**
 * Support post thumbnails (featured images) and register extra image sizes from config (options {slug}_size_w, {slug}_size_h on Settings → Media).
 *
 * @return void
 */
function bl_add_post_thumbnails(): void
{
	add_theme_support('post-thumbnails');

	$extra = bl_config('image_sizes_extra');
	if (!is_array($extra)) {
		return;
	}
	foreach ($extra as $size) {
		$slug = isset($size['slug']) ? $size['slug'] : '';
		if ($slug === '') {
			continue;
		}
		$default_w = isset($size['width']) ? (int) $size['width'] : 0;
		$default_h = isset($size['height']) ? (int) $size['height'] : 0;
		$w = (int) get_option($slug . '_size_w', $default_w);
		$h = (int) get_option($slug . '_size_h', $default_h);
		if ($w > 0) {
			add_image_size($slug, $w, $h, false);
		}
	}
}
add_action('after_setup_theme', 'bl_add_post_thumbnails');

/**
 * Site logo (Customizer / Theme settings → custom_logo).
 */
function bl_add_custom_logo(): void
{
	add_theme_support('custom-logo', [
		'height' => 120,
		'width' => 320,
		'flex-height' => true,
		'flex-width' => true,
	]);
}
add_action('after_setup_theme', 'bl_add_custom_logo');

/**
 * Setup image sizes
 * 
 * - Disable image threshold if set so in config theme.php
 * - Remove medium_large and the 1536x1536, 2048x2048 image sizes
 */
if (bl_config('image_threshold') === false) {
	add_filter('big_image_size_threshold', '__return_false');
}
add_filter('image_size_names_choose', function (array $sizes): array {
	unset($sizes['medium_large']);
	unset($sizes['1536x1536']);
	unset($sizes['2048x2048']);
	return $sizes;
});
add_filter('intermediate_image_sizes_advanced', function ($sizes) {
	unset($sizes['medium_large']);
	unset($sizes['1536x1536']);
	unset($sizes['2048x2048']);
	return $sizes;
});

/**
 * Remove Posts admin menu when `config/content-types/post.php` has `enabled` => false.
 */
function bl_disable_builtin_posts_admin(): void
{
	add_action('admin_menu', function (): void {
		remove_menu_page('edit.php');
	});

	add_action('admin_init', function (): void {
		global $pagenow;

		if ($pagenow === 'edit.php') {
			$post_type = isset($_GET['post_type'])
				? sanitize_key((string) wp_unslash($_GET['post_type']))
				: 'post';
			if ($post_type === 'post') {
				wp_safe_redirect(admin_url());
				exit;
			}

			return;
		}

		if ($pagenow === 'post-new.php') {
			$post_type = isset($_GET['post_type'])
				? sanitize_key((string) wp_unslash($_GET['post_type']))
				: 'post';
			if ($post_type === 'post') {
				wp_safe_redirect(admin_url());
				exit;
			}

			return;
		}

		if ($pagenow === 'post.php') {
			$post_id = isset($_GET['post']) ? (int) $_GET['post'] : 0;
			if ($post_id > 0 && get_post_type($post_id) === 'post') {
				wp_safe_redirect(admin_url());
				exit;
			}
		}
	});
}

add_action('after_setup_theme', function (): void {
	if (function_exists('bl_content_type_enabled') && !bl_content_type_enabled('post')) {
		bl_disable_builtin_posts_admin();
	}
}, 20);

/**
 * Filter excerpt length from Theme settings (Settings → Theme → General).
 *
 * @return int Length used when trimming excerpts.
 */
function bl_excerpt_length(): int
{
	$opt = get_option('baselayer_excerpt_length', '');
	if ($opt !== '') {
		return (int) $opt;
	}
	return 60;
}
add_filter('excerpt_length', 'bl_excerpt_length');

/**
 * Filter excerpt "more" string from Theme settings (Settings → Theme → General).
 *
 * @return string Text shown after truncated excerpt (e.g. "…").
 */
function bl_excerpt_more(): string
{
	$opt = get_option('baselayer_excerpt_more');
	if ($opt !== false) {
		return (string) $opt;
	}
	return '…';
}
add_filter('excerpt_more', 'bl_excerpt_more');

/**
 * Sync config/design.php into theme.json (colors, typography, layout).
 */
add_filter('wp_theme_json_data_theme', function ($theme_json) {
	$data = $theme_json->get_data();

	$data['settings']['color']['palette'] = bl_config('colors');
	$data['settings']['color']['gradients'] = bl_config('gradients');

	if (function_exists('bl_theme_json_color_settings')) {
		foreach (bl_theme_json_color_settings() as $key => $value) {
			$data['settings']['color'][$key] = $value;
		}
	}

	$data['settings']['typography']['fontSizes'] = bl_config('font_sizes');

	if (function_exists('bl_theme_json_typography_settings')) {
		foreach (bl_theme_json_typography_settings() as $key => $value) {
			$data['settings']['typography'][$key] = $value;
		}
	}

	$layout_sizes = function_exists('bl_theme_json_layout_sizes')
		? bl_theme_json_layout_sizes()
		: ['contentSize' => '840px', 'wideSize' => '968px'];

	$data['settings']['layout']['contentSize'] = $layout_sizes['contentSize'];
	$data['settings']['layout']['wideSize'] = $layout_sizes['wideSize'];

	if (function_exists('bl_theme_json_root_spacing')) {
		$root_spacing = bl_theme_json_root_spacing();
		$data['settings']['useRootPaddingAwareAlignments'] = $root_spacing['useRootPaddingAwareAlignments'];
		$data['styles']['spacing']['padding'] = $root_spacing['padding'];
	}

	return new WP_Theme_JSON_Data($data, 'theme');
});
