<?php

defined('ABSPATH') || exit;

/**
 * Whether the server is Apache (for redirect method suggestion).
 */
function bl_is_apache(): bool
{
	if (function_exists('apache_get_version')) {
		return true;
	}
	if (function_exists('apache_get_modules')) {
		return true;
	}
	if (!empty($_SERVER['SERVER_SOFTWARE']) && stripos($_SERVER['SERVER_SOFTWARE'], 'apache') !== false) {
		return true;
	}
	if (!empty($_SERVER['APACHE_RUN_DIR']) || !empty($_SERVER['APACHE_PID_FILE'])) {
		return true;
	}
	return false;
}

/**
 * Whether Apache has mod_rewrite loaded (required for .htaccess redirects).
 */
function bl_has_mod_rewrite(): bool
{
	if (!bl_is_apache()) {
		return false;
	}
	if (function_exists('apache_get_modules')) {
		return in_array('mod_rewrite', apache_get_modules(), true);
	}
	return true;
}

/**
 * Whether .htaccess can be written (file writable, or missing and directory writable).
 */
function bl_is_htaccess_writable(): bool
{
	$file = ABSPATH . '.htaccess';
	if (file_exists($file)) {
		return is_writable($file);
	}
	return is_writable(ABSPATH);
}

/**
 * Whether its save to use .htaccess redirects.
 */
function bl_can_use_htaccess_redirects(): bool
{
	return bl_is_apache() && bl_has_mod_rewrite() && bl_is_htaccess_writable();
}

/**
 * Redirect target for Apache RewriteRule.
 *
 * Internal paths stay as root-relative `/target` so .htaccess works on any domain/port in production.
 * External URLs are kept as full `https://…` (see {@see bl_normalize_redirect_to_path()}).
 */
function bl_redirect_htaccess_rewrite_target(string $to): string
{
	$to = trim($to);
	if ($to === '') {
		return '';
	}
	if (preg_match('#^https?://#i', $to)) {
		return $to;
	}

	if ($to[0] !== '/') {
		$to = '/' . $to;
	}

	// WordPress in a subdirectory: prefix install path so `/page` resolves under the site, not domain root.
	$home_path = parse_url(home_url('/'), PHP_URL_PATH);
	$home_path = is_string($home_path) ? trim($home_path, '/') : '';
	if ($home_path !== '' && !str_starts_with($to, '/' . $home_path . '/') && $to !== '/' . $home_path) {
		return '/' . $home_path . $to;
	}

	return $to;
}

/**
 * Paths that must never be overridden by the redirect router (WordPress internals).
 */
function bl_redirects_internal_paths(): array
{
	return ['wp-json', 'wp-sitemap', 'feed', 'sitemap.xml', 'robots.txt', 'favicon.ico'];
}

/**
 * Whether a path is an internal WP/system path that should never be redirected by the custom router.
 */
function bl_redirects_is_internal_path(string $path): bool
{
	foreach (bl_redirects_internal_paths() as $internal) {
		if ($path === $internal || str_starts_with($path, $internal . '/')) {
			return true;
		}
	}
	return false;
}

/**
 * Resolve and validate redirect target.
 * - Relative paths are treated as local URLs.
 * - External URLs are allowed only when host is in allowlist filter.
 *
 * @return string Empty string when invalid/disallowed.
 */
function bl_redirect_resolve_target_url(string $to): string
{
	$to = trim($to);
	if ($to === '') {
		return '';
	}
	if (strpos($to, 'http://') !== 0 && strpos($to, 'https://') !== 0) {
		return home_url($to);
	}

	$target_host = strtolower((string) wp_parse_url($to, PHP_URL_HOST));
	$home_host = strtolower((string) wp_parse_url(home_url('/'), PHP_URL_HOST));
	if ($target_host === '' || $home_host === '') {
		return '';
	}
	if ($target_host === $home_host) {
		return $to;
	}

	$allowed_hosts = apply_filters('baselayer_allowed_redirect_hosts', []);
	if (!is_array($allowed_hosts)) {
		$allowed_hosts = [];
	}
	$allowed_hosts = array_map(static fn($h) => strtolower(trim((string) $h)), $allowed_hosts);
	return in_array($target_host, $allowed_hosts, true) ? $to : '';
}

/**
 * Redirect manager: run redirects via WordPress when method is "wordpress".
 * When method is "htaccess", Apache handles redirects from .htaccess.
 */
add_action('template_redirect', function () {
	$method = function_exists('bl_config_redirects') ? bl_config_redirects('method') : get_option('bl_redirect_method', 'wordpress');
	if ($method !== 'wordpress') {
		return;
	}
	$redirects = get_option('bl_redirects', []);
	if (empty($redirects) || !is_array($redirects)) {
		return;
	}
	$path = isset($_SERVER['REQUEST_URI']) ? wp_unslash($_SERVER['REQUEST_URI']) : '';
	$path = trim((string) parse_url($path, PHP_URL_PATH), '/');
	$request = $path === '' ? '/' : '/' . $path;

	if (bl_redirects_is_internal_path($path)) {
		return;
	}
	if (!isset($redirects[$request])) {
		return;
	}
	$item = $redirects[$request];
	$to = is_array($item) ? ($item['to'] ?? '') : (string) $item;
	$code = is_array($item) ? (int) ($item['code'] ?? 301) : 301;
	if ($to === '') {
		return;
	}
	$to = bl_redirect_resolve_target_url($to);
	if ($to === '') {
		return;
	}
	wp_safe_redirect($to, $code);
	exit;
}, 1);
