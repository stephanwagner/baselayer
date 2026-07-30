<?php
/**
 * Plugin Name: BaseLayer Events
 * Description: Event types with dates, recurrence, statuses, metadata, and archives. Supports multiple event CPTs (events, courses, workshops).
 * Version: 0.1.0
 * Author: BaseLayer
 * Author URI: https://baselayerwp.com/baselayer-events
 * Text Domain: baselayer-events
 * Domain Path: /languages
 * Requires at least: 6.0
 * Requires PHP: 8.0
 */

defined('ABSPATH') || exit;

if (defined('BL_EVENTS_LOADED')) {
	return;
}

define('BL_EVENTS_LOADED', true);
define('BL_EVENTS_VERSION', '0.1.0');
define('BL_EVENTS_FILE', __FILE__);
define('BL_EVENTS_PATH', trailingslashit(dirname(__FILE__)));
define('BL_EVENTS_TEXTDOMAIN', 'baselayer-events');

/**
 * Absolute path under the package root.
 */
function bl_events_path(string $relative = ''): string
{
	$relative = ltrim($relative, '/');

	return $relative === '' ? BL_EVENTS_PATH : BL_EVENTS_PATH . $relative;
}

/**
 * Whether this package is loaded as a WP plugin (copied or symlinked under wp-content/plugins).
 * Uses plugin_basename() so realpath outside WP_PLUGIN_DIR still counts when WP registered the symlink.
 */
function bl_events_loaded_as_plugin(): bool
{
	if (!defined('WP_PLUGIN_DIR') || !function_exists('plugin_basename')) {
		return false;
	}

	$basename = plugin_basename(BL_EVENTS_FILE);
	if ($basename === '' || strpos($basename, '.php') === false) {
		return false;
	}

	// Absolute / Windows paths mean basename did not map into the plugins directory.
	if ($basename[0] === '/' || preg_match('#^[a-zA-Z]:[/\\\\]#', $basename)) {
		return false;
	}

	$candidate = wp_normalize_path(trailingslashit(WP_PLUGIN_DIR) . $basename);
	$real_file = realpath(BL_EVENTS_FILE);
	$real_candidate = realpath($candidate);

	return is_string($real_file) && is_string($real_candidate) && $real_file === $real_candidate;
}

/**
 * Public URL for the package root (works as plugin — copy or symlink — or theme-loaded package).
 */
function bl_events_base_url(): string
{
	static $url = null;
	if ($url !== null) {
		return $url;
	}

	// Copy or symlink under wp-content/plugins (plugins_url resolves via $wp_plugin_paths).
	if (bl_events_loaded_as_plugin()) {
		$url = trailingslashit(plugins_url('', BL_EVENTS_FILE));
		return $url;
	}

	$path = wp_normalize_path(trailingslashit(realpath(BL_EVENTS_PATH) ?: BL_EVENTS_PATH));

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

	$url = trailingslashit(get_template_directory_uri() . '/packages/baselayer-events');
	return $url;
}

/**
 * URL under the package root.
 */
function bl_events_url(string $relative = ''): string
{
	$relative = ltrim($relative, '/');

	return $relative === '' ? bl_events_base_url() : bl_events_base_url() . $relative;
}

require_once BL_EVENTS_PATH . 'includes/instances.php';
require_once BL_EVENTS_PATH . 'includes/cpt.php';
require_once BL_EVENTS_PATH . 'includes/events.php';
require_once BL_EVENTS_PATH . 'includes/assets.php';
require_once BL_EVENTS_PATH . 'includes/i18n-defaults.php';

if (is_admin()) {
	require_once BL_EVENTS_PATH . 'includes/settings-page.php';
}

/**
 * Load package translations.
 */
function bl_events_load_textdomain(): void
{
	$domain = BL_EVENTS_TEXTDOMAIN;
	$locale = function_exists('determine_locale') ? determine_locale() : get_locale();
	$mofile = BL_EVENTS_PATH . 'languages/' . $domain . '-' . $locale . '.mo';
	if (is_readable($mofile)) {
		load_textdomain($domain, $mofile);
	}

	if (bl_events_loaded_as_plugin()) {
		load_plugin_textdomain($domain, false, dirname(plugin_basename(BL_EVENTS_FILE)) . '/languages');
	}
}
add_action('init', 'bl_events_load_textdomain', 1);

if (bl_events_loaded_as_plugin()) {
	register_deactivation_hook(BL_EVENTS_FILE, static function (): void {
		if (function_exists('bl_event_clear_recurrence_cron')) {
			bl_event_clear_recurrence_cron();
		} else {
			wp_clear_scheduled_hook('bl_event_extend_recurring_series');
		}
	});
}

/**
 * @return array{uri: string, path: string, ver: string}|null
 */
function bl_events_resolve_asset(string $name, string $type): ?array
{
	$type = $type === 'css' ? 'css' : 'js';
	$dir = bl_events_path('assets/' . $type);
	$uri_dir = bl_events_url('assets/' . $type);
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

function bl_events_enqueue_style(string $handle, string $name, array $deps = []): bool
{
	$asset = bl_events_resolve_asset($name, 'css');
	if ($asset === null) {
		return false;
	}

	wp_enqueue_style($handle, $asset['uri'], $deps, $asset['ver']);

	return true;
}

function bl_events_enqueue_script(string $handle, string $name, array $deps = [], bool $in_footer = true): bool
{
	$asset = bl_events_resolve_asset($name, 'js');
	if ($asset === null) {
		return false;
	}

	wp_enqueue_script($handle, $asset['uri'], $deps, $asset['ver'], $in_footer);

	return true;
}
