<?php

defined('ABSPATH') || exit;

const BL_HTACCESS_MARKER_START = '# BEGIN BaseLayer performance';
const BL_HTACCESS_MARKER_END = '# END BaseLayer performance';

/**
 * Build the recommended performance .htaccess block (with markers).
 */
function bl_build_htaccess_performance_block(): string
{
	$template = __DIR__ . '/template-htaccess.txt';
	if (!is_readable($template)) {
		return '';
	}

	return BL_HTACCESS_MARKER_START . "\n"
		. trim((string) file_get_contents($template)) . "\n"
		. BL_HTACCESS_MARKER_END . "\n";
}

/**
 * Remove a marked .htaccess block by exact start/end marker strings.
 */
function bl_remove_htaccess_marked_block(string $content, string $start_marker, string $end_marker): string
{
	$pattern = '/(?:^|(\r\n|\r|\n))' . preg_quote($start_marker, '/')
		. '.*?' . preg_quote($end_marker, '/') . '(?:\r?\n|$)/s';

	return (string) preg_replace($pattern, '$1', $content, 1);
}

/**
 * Write recommended .htaccess rules to WP root (Apache only).
 * Adds: MIME types, Cache-Control via mod_headers, Brotli/deflate, Vary Accept-Encoding.
 * Safe to call multiple times; replaces existing BaseLayer block when present.
 *
 * @return bool True if block was written or already present, false if skipped (Nginx, unwritable, etc.)
 */
function bl_write_htaccess(): bool
{
	$htaccess = ABSPATH . '.htaccess';
	$block = bl_build_htaccess_performance_block();
	if ($block === '') {
		return false;
	}

	if (!file_exists($htaccess)) {
		if (!is_writable(ABSPATH)) {
			return false;
		}
		return file_put_contents($htaccess, $block, LOCK_EX) !== false;
	}

	$content = file_get_contents($htaccess);
	if ($content === false || !is_writable($htaccess)) {
		return false;
	}

	$content = bl_remove_htaccess_marked_block($content, BL_HTACCESS_MARKER_START, BL_HTACCESS_MARKER_END);

	$content = rtrim($content) . "\n\n" . $block;
	$content = trim($content) . "\n";

	return file_put_contents($htaccess, $content, LOCK_EX) !== false;
}

/**
 * Return recommended .htaccess rules for display on the install page (without block markers).
 *
 * @return string Rule body or empty string if template missing.
 */
function bl_get_htaccess_config(): string
{
	$template = __DIR__ . '/template-htaccess.txt';
	if (!is_readable($template)) {
		return '';
	}

	return trim((string) file_get_contents($template));
}

/**
 * Return recommended nginx config snippet (for copy/paste into server block). Nginx config cannot be written from PHP.
 *
 * @return string Nginx config content or empty string if template missing.
 */
function bl_get_nginx_config(): string
{
	$template = __DIR__ . '/template-nginx.conf';
	if (!is_readable($template)) {
		return '';
	}
	return trim(file_get_contents($template));
}

/**
 * Path to wp-config.php (ABSPATH or one level above).
 */
function bl_install_wp_config_path(): string
{
	$path = trailingslashit(ABSPATH) . 'wp-config.php';
	if (is_file($path)) {
		return $path;
	}

	$parent = trailingslashit(dirname(ABSPATH)) . 'wp-config.php';
	if (is_file($parent) && !is_file(trailingslashit(dirname(ABSPATH)) . 'wp-settings.php')) {
		return $parent;
	}

	return $path;
}

/**
 * Whether ACF_PRO_LICENSE is already defined in PHP or present in wp-config.php.
 */
function bl_install_acf_pro_license_is_defined(): bool
{
	if (defined('ACF_PRO_LICENSE')) {
		return true;
	}

	$path = bl_install_wp_config_path();
	if (!is_file($path) || !is_readable($path)) {
		return false;
	}

	$contents = file_get_contents($path);
	if (!is_string($contents) || $contents === '') {
		return false;
	}

	return (bool) preg_match("/define\s*\(\s*['\"]ACF_PRO_LICENSE['\"]/", $contents);
}

/**
 * Sanitize an ACF Pro license key from installer input.
 */
function bl_install_sanitize_acf_pro_license(string $key): string
{
	$key = trim(wp_unslash($key));
	$key = preg_replace('/\s+/', '', $key) ?? '';

	return $key;
}

/**
 * Add ACF_PRO_LICENSE to wp-config.php when missing and a key was provided.
 *
 * @return true|WP_Error True when written or skipped (already defined / empty key); WP_Error on failure.
 */
function bl_install_write_acf_pro_license(string $key)
{
	$key = bl_install_sanitize_acf_pro_license($key);
	if ($key === '') {
		return true;
	}

	if (bl_install_acf_pro_license_is_defined()) {
		return true;
	}

	$path = bl_install_wp_config_path();
	if (!is_file($path) || !is_readable($path) || !is_writable($path)) {
		return new WP_Error(
			'bl_acf_wp_config',
			__('Could not write the ACF Pro license to wp-config.php (file missing or not writable).', 'baselayer')
		);
	}

	$contents = file_get_contents($path);
	if (!is_string($contents)) {
		return new WP_Error(
			'bl_acf_wp_config',
			__('Failed to read wp-config.php.', 'baselayer')
		);
	}

	$block = "// BaseLayer: ACF Pro license\n"
		. 'define( \'ACF_PRO_LICENSE\', ' . var_export($key, true) . " );\n\n";

	$needle = "/* That's all, stop editing! Happy publishing. */";
	if (strpos($contents, $needle) !== false) {
		$contents = str_replace($needle, $block . $needle, $contents);
	} else {
		$contents .= "\n" . $block;
	}

	if (file_put_contents($path, $contents) === false) {
		return new WP_Error(
			'bl_acf_wp_config',
			__('Failed to write the ACF Pro license to wp-config.php.', 'baselayer')
		);
	}

	return true;
}

/**
 * Find the ACF Pro plugin basename if it is installed (active or not).
 *
 * @return string Plugin basename (e.g. advanced-custom-fields-pro/acf.php) or empty string.
 */
function bl_find_acf_pro_plugin(): string
{
	if (!function_exists('get_plugins')) {
		require_once ABSPATH . 'wp-admin/includes/plugin.php';
	}

	$known = [
		'advanced-custom-fields-pro/acf.php',
		'acf-pro/acf.php',
	];

	foreach ($known as $basename) {
		if (file_exists(WP_PLUGIN_DIR . '/' . $basename)) {
			return $basename;
		}
	}

	foreach (get_plugins() as $basename => $plugin) {
		$name = (string) ($plugin['Name'] ?? '');
		if (
			stripos($name, 'Advanced Custom Fields PRO') !== false
			|| stripos($name, 'Advanced Custom Fields Pro') !== false
		) {
			return $basename;
		}
	}

	return '';
}

/**
 * Activate ACF Pro when it is installed but inactive.
 *
 * @return bool True if already active or newly activated; false if missing or activation failed.
 */
function bl_install_activate_acf_pro(): bool
{
	if (!current_user_can('activate_plugins')) {
		return false;
	}

	if (!function_exists('is_plugin_active')) {
		require_once ABSPATH . 'wp-admin/includes/plugin.php';
	}

	$plugin = bl_find_acf_pro_plugin();
	if ($plugin === '') {
		return false;
	}

	if (is_plugin_active($plugin)) {
		return true;
	}

	$result = activate_plugin($plugin, '', false, false);

	return !is_wp_error($result);
}
