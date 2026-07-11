<?php

defined('ABSPATH') || exit;

/** Option name prefix for Content tab fields (Settings → Theme → Content). Format: {prefix}{section_id}_{variable_id}. */
if (!defined('FS_THEME_CONTENT_OPTION_PREFIX')) {
	define('FS_THEME_CONTENT_OPTION_PREFIX', 'theme_content_');
}

/**
 * Whether an array is a list (0..n keys) rather than an associative map.
 */
function fs_config_is_list(array $value): bool
{
	if ($value === []) {
		return true;
	}

	return array_keys($value) === range(0, count($value) - 1);
}

/**
 * Deep-merge config arrays; associative keys recurse, list values are replaced by the overlay.
 *
 * @param array<string|int, mixed> $base
 * @param array<string|int, mixed> $overlay
 * @return array<string|int, mixed>
 */
function fs_config_merge_deep(array $base, array $overlay): array
{
	foreach ($overlay as $key => $value) {
		if (
			is_array($value)
			&& isset($base[$key])
			&& is_array($base[$key])
			&& !fs_config_is_list($base[$key])
			&& !fs_config_is_list($value)
		) {
			$base[$key] = fs_config_merge_deep($base[$key], $value);
			continue;
		}

		$base[$key] = $value;
	}

	return $base;
}

/**
 * Load a PHP config file from the parent theme, then merge a same-path child override if present.
 *
 * @return array<string|int, mixed>
 */
function fs_load_theme_config_file(string $relative): array
{
	$relative = ltrim(str_replace('\\', '/', $relative), '/');
	$parent_path = trailingslashit(get_template_directory()) . $relative;
	$config = [];

	if (is_readable($parent_path)) {
		$loaded = include $parent_path;
		if (is_array($loaded)) {
			$config = $loaded;
		}
	}

	if (is_child_theme()) {
		$child_path = trailingslashit(get_stylesheet_directory()) . $relative;
		if ($child_path !== $parent_path && is_readable($child_path)) {
			$child = include $child_path;
			if (is_array($child)) {
				$config = fs_config_merge_deep($config, $child);
			}
		}
	}

	return $config;
}

/**
 * Get theme config: config/theme.php merged with config/theme-design.php.
 *
 * @param string|null $key Optional. Dot path, e.g. 'menus', 'colors'.
 * @return array|mixed Full config if $key is null, else value at $key.
 */
function fs_config(?string $key = null)
{
	static $config = null;
	if ($config === null) {
		$base = fs_load_theme_config_file('config/theme.php');
		$design = fs_load_theme_config_file('config/theme-design.php');
		$config = array_merge($base, $design);
	}
	return fs_config_resolve($config, $key);
}

/**
 * Get theme settings: Content (config/theme-content.php). Used for Settings → Theme → Content.
 *
 * @param string|null $key Optional. Dot path, e.g. 'content.tabs', 'languages'.
 * @return array|mixed Full config if $key is null, else value at $key.
 */
function fs_config_settings(?string $key = null)
{
	static $config = null;
	if ($config === null) {
		$config = fs_load_theme_config_file('config/theme-content.php');
	}
	return fs_config_resolve($config, $key);
}

/**
 * Load content type definitions from config/content-types/*.php (parent, then child overrides).
 *
 * Each file returns `[ 'slug' => [ ... ] ]`. Slug must match the filename.
 *
 * @return array<string, array<string, mixed>>
 */
function fs_get_content_types(): array
{
	static $types = null;
	if ($types !== null) {
		return $types;
	}

	$types = [];
	$dirs = [get_template_directory() . '/config/content-types'];
	if (is_child_theme()) {
		$dirs[] = get_stylesheet_directory() . '/config/content-types';
	}

	foreach ($dirs as $dir) {
		if (!is_dir($dir)) {
			continue;
		}

		$files = glob($dir . '/*.php') ?: [];
		foreach ($files as $file) {
			$loaded = require $file;
			if (!is_array($loaded)) {
				continue;
			}

			$basename = basename($file, '.php');
			if (isset($loaded[$basename]) && is_array($loaded[$basename])) {
				$types[$basename] = isset($types[$basename]) && is_array($types[$basename])
					? fs_config_merge_deep($types[$basename], $loaded[$basename])
					: $loaded[$basename];
				continue;
			}

			foreach ($loaded as $slug => $def) {
				if (is_string($slug) && is_array($def)) {
					$types[$slug] = isset($types[$slug]) && is_array($types[$slug])
						? fs_config_merge_deep($types[$slug], $def)
						: $def;
				}
			}
		}
	}

	return $types;
}

/**
 * Whether a content type is enabled in config (`enabled` => false skips CPT registration).
 */
function fs_content_type_enabled(string $slug, ?array $cfg = null): bool
{
	if ($cfg === null) {
		$cfg = fs_config_cpt($slug);
	}
	if (!is_array($cfg)) {
		return false;
	}

	return !array_key_exists('enabled', $cfg) || !empty($cfg['enabled']);
}

/**
 * Archive section for a content type (`archive.enabled`, `archive.slug`, `archive.design`, `archive.category_filter`, `archive.filter_taxonomy`, `archive.texts`).
 *
 * @return array<string, mixed>
 */
function fs_content_type_archive(?string $post_type = null): array
{
	if ($post_type === null || $post_type === '') {
		$post_type = function_exists('fs_archive_current_post_type') ? fs_archive_current_post_type() : '';
	}
	if ($post_type === '') {
		return [];
	}

	$cfg = fs_config_cpt($post_type);
	if (!is_array($cfg)) {
		return [];
	}

	if (isset($cfg['archive']) && is_array($cfg['archive'])) {
		return $cfg['archive'];
	}

	return [
		'enabled' => !empty($cfg['has_archive']),
		'slug' => isset($cfg['url']) && is_string($cfg['url']) ? $cfg['url'] : '',
		'design' => isset($cfg['archive_design']) ? (string) $cfg['archive_design'] : 'list',
		'texts' => isset($cfg['texts']) && is_array($cfg['texts']) ? $cfg['texts'] : [],
	];
}

/**
 * Query section (`query.orderby`, `query.order`, `query.menu_order`).
 *
 * @return array<string, mixed>
 */
function fs_content_type_query(string $post_type): array
{
	$cfg = fs_config_cpt($post_type);
	if (!is_array($cfg)) {
		return [];
	}

	if (isset($cfg['query']) && is_array($cfg['query'])) {
		return $cfg['query'];
	}

	return [
		'orderby' => isset($cfg['orderby']) && is_string($cfg['orderby']) ? $cfg['orderby'] : '',
		'order' => isset($cfg['order']) && is_string($cfg['order']) ? $cfg['order'] : '',
		'menu_order' => !empty($cfg['has_order']),
	];
}

/**
 * Admin section (`admin.menu_icon`, `admin.menu_position`, `admin.page_title_toggle`).
 *
 * @return array<string, mixed>
 */
function fs_content_type_admin(string $post_type): array
{
	$cfg = fs_config_cpt($post_type);
	if (!is_array($cfg)) {
		return [];
	}

	if (isset($cfg['admin']) && is_array($cfg['admin'])) {
		return $cfg['admin'];
	}

	return [
		'menu_icon' => $cfg['menu_icon'] ?? null,
		'menu_position' => $cfg['menu_position'] ?? 5,
		'page_title_toggle' => !empty($cfg['has_page_title_toggle']),
	];
}

/**
 * Attach core `category` taxonomy to this type when true (`wp_categories`).
 */
function fs_content_type_uses_wp_categories(array $cfg): bool
{
	if (array_key_exists('wp_categories', $cfg)) {
		return (bool) $cfg['wp_categories'];
	}

	return !empty($cfg['has_categories']);
}

/**
 * Attach core `post_tag` taxonomy when true (`wp_tags`). Default false for all content types.
 */
function fs_content_type_uses_wp_tags(array $cfg): bool
{
	if (array_key_exists('wp_tags', $cfg)) {
		return (bool) $cfg['wp_tags'];
	}

	return !empty($cfg['has_tags']);
}

/**
 * Get content types config (config/content-types/*.php).
 *
 * @param string|null $key Optional. `all` / `cpts` (enabled CPTs only, excludes `post`), `post`, or a slug.
 * @return array|mixed Full config if $key is null, else value at $key.
 */
function fs_config_cpt(?string $key = null)
{
	$config = fs_get_content_types();

	if ($key === null) {
		return $config;
	}

	if ($key === 'all' || $key === 'cpts') {
		$out = [];
		foreach ($config as $slug => $cfg) {
			if ($slug === 'post' || !is_array($cfg) || !fs_content_type_enabled($slug, $cfg)) {
				continue;
			}
			$out[$slug] = $cfg;
		}

		return $out;
	}

	if (!empty($config[$key]) && is_array($config[$key])) {
		return $config[$key];
	}

	return null;
}

/**
 * Get redirect config from theme config (config/theme.php → redirects). Method (wordpress/htaccess) is not exposed in the UI.
 *
 * @param string|null $key Optional. Dot path, e.g. 'method'.
 * @return array|mixed Full redirect config if $key is null, else value at $key.
 */
function fs_config_redirects(?string $key = null)
{
	$config = fs_config('redirects');
	if (!is_array($config)) {
		$config = ['method' => 'wordpress'];
	}
	return fs_config_resolve($config, $key);
}

/**
 * Whether Redis integration is enabled in theme config.
 */
function fs_config_redis_enabled(): bool
{
	$v = fs_config('redis_object_cache.enabled');
	if ($v === null) {
		// Backward compatibility with old key.
		$v = fs_config('redis.enabled');
	}
	if ($v === null) {
		return true;
	}
	return (bool) $v;
}

/**
 * Whether comments are enabled in theme config.
 */
function fs_config_comments_enabled(): bool
{
	$v = fs_config('comments');
	if ($v === null) {
		return true;
	}
	return (bool) $v;
}

/**
 * Normalized theme menus from config (`id`, `title`, `options`).
 *
 * @return array<int, array{id: string, title: string, options: array<int, array{id: string, className: string, label: string, default: bool}>}>
 */
function fs_theme_menus_config(): array
{
	static $normalized = null;
	if ($normalized !== null) {
		return $normalized;
	}

	$raw = fs_config('menus');
	if (!is_array($raw)) {
		$normalized = [];
		return $normalized;
	}

	$normalized = [];
	foreach ($raw as $key => $entry) {
		if (is_string($entry) && is_string($key) && $key !== '') {
			$normalized[] = [
				'id' => $key,
				'title' => $entry,
				'options' => [],
			];
			continue;
		}

		if (!is_array($entry)) {
			continue;
		}

		$id = isset($entry['id']) && is_string($entry['id']) && $entry['id'] !== ''
			? $entry['id']
			: (is_string($key) ? $key : '');
		if ($id === '') {
			continue;
		}

		$title = isset($entry['title']) && is_string($entry['title']) && $entry['title'] !== ''
			? $entry['title']
			: $id;

		$options = [];
		if (!empty($entry['options']) && is_array($entry['options'])) {
			foreach ($entry['options'] as $option) {
				if (!is_array($option) || empty($option['id']) || !is_string($option['id'])) {
					continue;
				}
				$options[] = [
					'id' => sanitize_key($option['id']),
					'className' => isset($option['className']) && is_string($option['className']) ? $option['className'] : '',
					'label' => isset($option['label']) && is_string($option['label']) ? $option['label'] : '',
					'default' => !empty($option['default']),
				];
			}
		}

		$normalized[] = [
			'id' => $id,
			'title' => $title,
			'options' => $options,
		];
	}

	return $normalized;
}

/**
 * @return array<string, string> Slug => title for register_nav_menus().
 */
function fs_theme_menu_register_map(): array
{
	$map = [];
	foreach (fs_theme_menus_config() as $menu) {
		$map[$menu['id']] = $menu['title'];
	}
	return $map;
}

/**
 * @return array{id: string, title: string, options: array<int, array{id: string, className: string, label: string, default: bool}>}|null
 */
function fs_theme_menu(string $menu_id): ?array
{
	$menu_id = sanitize_key($menu_id);
	if ($menu_id === '') {
		return null;
	}

	foreach (fs_theme_menus_config() as $menu) {
		if ($menu['id'] === $menu_id) {
			return $menu;
		}
	}

	return null;
}

/**
 * Menu item options for a theme location.
 *
 * @return array<int, array{id: string, className: string, label: string, default: bool}>
 */
function fs_theme_menu_options(string $menu_id): array
{
	$menu = fs_theme_menu($menu_id);
	if ($menu === null) {
		return [];
	}

	return $menu['options'];
}

/**
 * Post meta key for a menu item option checkbox.
 */
function fs_menu_item_option_meta_key(string $option_id): string
{
	return '_menu_item_fs_option_' . sanitize_key($option_id);
}

/**
 * Resolve dot-path key into config value.
 *
 * @param array $config Config array.
 * @param string|null $key Dot path or null.
 * @return array|mixed
 */
function fs_config_resolve(array $config, ?string $key)
{
	if ($key === null || $key === '') {
		return $config;
	}
	$keys = explode('.', $key);
	$val = $config;
	foreach ($keys as $k) {
		if (!is_array($val) || !array_key_exists($k, $val)) {
			return null;
		}
		$val = $val[$k];
	}
	return $val;
}
