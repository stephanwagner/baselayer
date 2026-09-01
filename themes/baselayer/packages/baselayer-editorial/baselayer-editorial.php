<?php
/**
 * Plugin Name: BaseLayer Editorial
 * Description: Per-editor content access, publishing approval, page allowlists, and media library restrictions.
 * Version: 0.1.0
 * Author: BaseLayer
 * Author URI: https://baselayerwp.com/baselayer-editorial
 * Text Domain: baselayer-editorial
 * Domain Path: /languages
 * Requires at least: 6.0
 * Requires PHP: 8.0
 */

defined('ABSPATH') || exit;

if (defined('BL_EDITORIAL_LOADED')) {
	return;
}

define('BL_EDITORIAL_LOADED', true);
define('BL_EDITORIAL_VERSION', '0.1.0');
define('BL_EDITORIAL_FILE', __FILE__);
define('BL_EDITORIAL_PATH', trailingslashit(dirname(__FILE__)));
define('BL_EDITORIAL_TEXTDOMAIN', 'baselayer-editorial');

const BL_EDITORIAL_SETTINGS_OPTION = 'bl_editorial_settings';
const BL_EDITORIAL_USER_META = 'bl_editorial_rights';

/**
 * Absolute path under the package root.
 */
function bl_editorial_path(string $relative = ''): string
{
	$relative = ltrim($relative, '/');

	return $relative === '' ? BL_EDITORIAL_PATH : BL_EDITORIAL_PATH . $relative;
}

/**
 * Whether this package is loaded as a WP plugin (copied or symlinked under wp-content/plugins).
 */
function bl_editorial_loaded_as_plugin(): bool
{
	if (!defined('WP_PLUGIN_DIR') || !function_exists('plugin_basename')) {
		return false;
	}

	$basename = plugin_basename(BL_EDITORIAL_FILE);
	if ($basename === '' || strpos($basename, '.php') === false) {
		return false;
	}

	if ($basename[0] === '/' || preg_match('#^[a-zA-Z]:[/\\\\]#', $basename)) {
		return false;
	}

	$candidate = wp_normalize_path(trailingslashit(WP_PLUGIN_DIR) . $basename);
	$real_file = realpath(BL_EDITORIAL_FILE);
	$real_candidate = realpath($candidate);

	return is_string($real_file) && is_string($real_candidate) && $real_file === $real_candidate;
}

/**
 * Public URL for the package root (plugin copy/symlink or theme-loaded package).
 */
function bl_editorial_base_url(): string
{
	static $url = null;
	if ($url !== null) {
		return $url;
	}

	if (bl_editorial_loaded_as_plugin()) {
		$url = trailingslashit(plugins_url('', BL_EDITORIAL_FILE));
		return $url;
	}

	$path = wp_normalize_path(trailingslashit(realpath(BL_EDITORIAL_PATH) ?: BL_EDITORIAL_PATH));

	$theme_dir = get_template_directory();
	$theme = wp_normalize_path(trailingslashit(realpath($theme_dir) ?: $theme_dir));
	if (strpos($path, $theme) === 0) {
		$rel = ltrim(substr($path, strlen($theme)), '/');
		$url = trailingslashit(trailingslashit(get_template_directory_uri()) . $rel);
		return $url;
	}

	$abspath = wp_normalize_path(trailingslashit(realpath(ABSPATH) ?: ABSPATH));
	if (strpos($path, $abspath) === 0) {
		$rel = ltrim(substr($path, strlen($abspath)), '/');
		$url = trailingslashit(site_url($rel));
		return $url;
	}

	$url = trailingslashit(get_template_directory_uri() . '/packages/baselayer-editorial');
	return $url;
}

/**
 * URL under the package root.
 */
function bl_editorial_url(string $relative = ''): string
{
	$relative = ltrim($relative, '/');

	return $relative === '' ? bl_editorial_base_url() : bl_editorial_base_url() . $relative;
}

/**
 * Whether the current user may manage Editorial settings.
 */
function bl_editorial_user_can_manage_settings(): bool
{
	if (!current_user_can('manage_options')) {
		return false;
	}

	if (function_exists('bl_is_developer_user')) {
		return bl_is_developer_user((int) get_current_user_id());
	}

	return true;
}

/**
 * Resolve a built asset under assets/{css|js}/.
 *
 * @return array{uri: string, path: string, ver: string}|null
 */
function bl_editorial_resolve_asset(string $name, string $type): ?array
{
	$type = $type === 'css' ? 'css' : 'js';
	$dir = bl_editorial_path('assets/' . $type);
	$uri_dir = bl_editorial_url('assets/' . $type);
	$debug = function_exists('bl_is_debug') && bl_is_debug();

	$candidates = $debug
		? [$name . '.' . $type, $name . '.min.' . $type]
		: [$name . '.min.' . $type, $name . '.' . $type];

	foreach ($candidates as $file) {
		$path = $dir . '/' . $file;
		if (is_readable($path)) {
			return [
				'uri'  => trailingslashit($uri_dir) . $file,
				'path' => $path,
				'ver'  => $debug ? (string) time() : (string) filemtime($path),
			];
		}
	}

	return null;
}

/**
 * Enqueue a package stylesheet if built.
 */
function bl_editorial_enqueue_style(string $handle, string $name, array $deps = []): bool
{
	$asset = bl_editorial_resolve_asset($name, 'css');
	if ($asset === null) {
		return false;
	}

	wp_enqueue_style($handle, $asset['uri'], $deps, $asset['ver']);

	return true;
}

/**
 * Enqueue a package script if built.
 */
function bl_editorial_enqueue_script(string $handle, string $name, array $deps = [], bool $in_footer = true): bool
{
	$asset = bl_editorial_resolve_asset($name, 'js');
	if ($asset === null) {
		return false;
	}

	wp_enqueue_script($handle, $asset['uri'], $deps, $asset['ver'], $in_footer);

	return true;
}

require_once BL_EDITORIAL_PATH . 'includes/helpers.php';
require_once BL_EDITORIAL_PATH . 'includes/settings.php';
require_once BL_EDITORIAL_PATH . 'includes/capabilities.php';
require_once BL_EDITORIAL_PATH . 'includes/content-access.php';
require_once BL_EDITORIAL_PATH . 'includes/pages.php';
require_once BL_EDITORIAL_PATH . 'includes/media.php';
require_once BL_EDITORIAL_PATH . 'includes/publishing.php';
require_once BL_EDITORIAL_PATH . 'includes/assets.php';

if (is_admin()) {
	require_once BL_EDITORIAL_PATH . 'includes/settings-page.php';
	require_once BL_EDITORIAL_PATH . 'includes/user-profile.php';
}

/**
 * Packaged .mo path for a locale, with a short regional fallback (de_CH_informal → de_CH).
 */
function bl_editorial_packaged_mofile(?string $locale = null): string
{
	$domain = BL_EDITORIAL_TEXTDOMAIN;
	$locale = $locale ?: (function_exists('determine_locale') ? determine_locale() : get_locale());
	$dir = BL_EDITORIAL_PATH . 'languages/';
	$candidates = [$locale];
	if (preg_match('/^([a-z]{2,3}_[A-Z]{2})/', $locale, $m) && $m[1] !== $locale) {
		$candidates[] = $m[1];
	}

	foreach (array_unique($candidates) as $loc) {
		$file = $dir . $domain . '-' . $loc . '.mo';
		if (is_readable($file)) {
			return $file;
		}
	}

	return '';
}

/**
 * Point JIT / WP_LANG_DIR lookups at the packaged catalog when the domain is not loaded yet,
 * so a partial Loco or language-pack file cannot become the only catalog.
 */
function bl_editorial_load_textdomain_mofile(string $mofile, string $domain): string
{
	if ($domain !== BL_EDITORIAL_TEXTDOMAIN) {
		return $mofile;
	}

	$locale = function_exists('determine_locale') ? determine_locale() : get_locale();
	$packaged = bl_editorial_packaged_mofile($locale);
	if ($packaged === '') {
		return $mofile;
	}

	$requested = function_exists('wp_normalize_path') ? wp_normalize_path($mofile) : $mofile;
	$packaged_norm = function_exists('wp_normalize_path') ? wp_normalize_path($packaged) : $packaged;
	if ($requested === $packaged_norm) {
		return $mofile;
	}

	if (!is_textdomain_loaded($domain) || !is_readable($mofile)) {
		return $packaged;
	}

	return $mofile;
}

/**
 * Load package translations.
 */
function bl_editorial_load_textdomain(): void
{
	$domain = BL_EDITORIAL_TEXTDOMAIN;
	$mofile = bl_editorial_packaged_mofile();
	if ($mofile !== '') {
		load_textdomain($domain, $mofile);
	}

	if (bl_editorial_loaded_as_plugin()) {
		load_plugin_textdomain($domain, false, dirname(plugin_basename(BL_EDITORIAL_FILE)) . '/languages');
	}
}
add_filter('load_textdomain_mofile', 'bl_editorial_load_textdomain_mofile', 10, 2);
add_action('init', 'bl_editorial_load_textdomain', 1);
