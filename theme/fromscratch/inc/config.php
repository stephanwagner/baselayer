<?php

defined('ABSPATH') || exit;

/** Option name prefix for Content tab fields (Settings → Theme → Content). Format: {prefix}{section_id}_{variable_id}. */
if (!defined('FS_THEME_CONTENT_OPTION_PREFIX')) {
	define('FS_THEME_CONTENT_OPTION_PREFIX', 'theme_content_');
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
		$base = include get_template_directory() . '/config/theme.php';
		$design = include get_template_directory() . '/config/theme-design.php';
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
		$config = include get_template_directory() . '/config/theme-content.php';
	}
	return fs_config_resolve($config, $key);
}

/**
 * Load content type definitions from config/content-types/*.php.
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
	$dir = get_template_directory() . '/config/content-types';
	$files = glob($dir . '/*.php') ?: [];

	foreach ($files as $file) {
		$loaded = require $file;
		if (!is_array($loaded)) {
			continue;
		}

		$basename = basename($file, '.php');
		if (isset($loaded[$basename]) && is_array($loaded[$basename])) {
			$types[$basename] = $loaded[$basename];
			continue;
		}

		foreach ($loaded as $slug => $def) {
			if (is_string($slug) && is_array($def)) {
				$types[$slug] = $def;
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
	if ($slug === 'post') {
		return true;
	}
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
