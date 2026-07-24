<?php
/**
 * Plugin Name: BaseLayer Forms
 * Description: Form builder, submissions, and notifications for WordPress.
 * Version: 1.0.0
 * Author: BaseLayer
 * Text Domain: baselayer-forms
 * Domain Path: /languages
 * Requires at least: 6.0
 * Requires PHP: 8.0
 */

defined('ABSPATH') || exit;

if (defined('BL_FORMS_LOADED')) {
	return;
}

define('BL_FORMS_LOADED', true);
define('BL_FORMS_VERSION', '1.0.0');
define('BL_FORMS_FILE', __FILE__);
define('BL_FORMS_PATH', trailingslashit(dirname(__FILE__)));
define('BL_FORMS_TEXTDOMAIN', 'baselayer-forms');

const BL_FORM_POST_TYPE = 'bl_form';
const BL_FORM_ENTRY_POST_TYPE = 'bl_form_entry';
const BL_FORM_CONFIG_META = '_bl_form_config';
const BL_FORM_ENTRY_FORM_META = '_bl_form_id';
const BL_FORM_ENTRY_FIELDS_META = '_bl_entry_fields';
const BL_FORM_ENTRY_META_META = '_bl_entry_meta';
const BL_FORM_ENTRY_MAIL_META = '_bl_entry_mail';

/**
 * Absolute path under the package root.
 */
function bl_forms_path(string $relative = ''): string
{
	$relative = ltrim($relative, '/');

	return $relative === '' ? BL_FORMS_PATH : BL_FORMS_PATH . $relative;
}

/**
 * Public URL for the package root (works as plugin or theme-loaded package).
 */
function bl_forms_base_url(): string
{
	static $url = null;
	if ($url !== null) {
		return $url;
	}

	$path = wp_normalize_path(trailingslashit(realpath(BL_FORMS_PATH) ?: BL_FORMS_PATH));
	$plugin_dir = wp_normalize_path(trailingslashit(realpath(WP_PLUGIN_DIR) ?: WP_PLUGIN_DIR));

	// Installed as a real plugin under wp-content/plugins.
	if (strpos($path, $plugin_dir) === 0) {
		$url = trailingslashit(plugins_url('', BL_FORMS_FILE));
		return $url;
	}

	// Bundled under the active parent theme (…/packages/baselayer-forms/).
	$theme_dir = get_template_directory();
	$theme = wp_normalize_path(trailingslashit(realpath($theme_dir) ?: $theme_dir));
	if (strpos($path, $theme) === 0) {
		$rel = ltrim(substr($path, strlen($theme)), '/');
		$url = trailingslashit(trailingslashit(get_template_directory_uri()) . $rel);
		return $url;
	}

	// Last resort: relative to ABSPATH when the package is web-served from there.
	$abspath = wp_normalize_path(trailingslashit(realpath(ABSPATH) ?: ABSPATH));
	if (strpos($path, $abspath) === 0) {
		$rel = ltrim(substr($path, strlen($abspath)), '/');
		$url = trailingslashit(site_url($rel));
		return $url;
	}

	// Do not call plugins_url() for non-plugin paths — it produces invalid URLs.
	$url = trailingslashit(get_template_directory_uri() . '/packages/baselayer-forms');
	return $url;
}

/**
 * URL under the package root.
 */
function bl_forms_url(string $relative = ''): string
{
	$relative = ltrim($relative, '/');

	return $relative === '' ? bl_forms_base_url() : bl_forms_base_url() . $relative;
}

require_once BL_FORMS_PATH . 'includes/icons.php';
require_once BL_FORMS_PATH . 'includes/helpers.php';
require_once BL_FORMS_PATH . 'includes/file-types.php';
require_once BL_FORMS_PATH . 'includes/config.php';
require_once BL_FORMS_PATH . 'includes/captcha.php';
require_once BL_FORMS_PATH . 'includes/cpt.php';
require_once BL_FORMS_PATH . 'includes/render.php';
require_once BL_FORMS_PATH . 'includes/mail.php';
require_once BL_FORMS_PATH . 'includes/submit.php';
require_once BL_FORMS_PATH . 'includes/block.php';

if (is_admin()) {
	require_once BL_FORMS_PATH . 'includes/admin.php';
	require_once BL_FORMS_PATH . 'includes/entries.php';
}

/**
 * Load package translations.
 */
function bl_forms_load_textdomain(): void
{
	$domain = BL_FORMS_TEXTDOMAIN;
	$locale = function_exists('determine_locale') ? determine_locale() : get_locale();
	$mofile = BL_FORMS_PATH . 'languages/' . $domain . '-' . $locale . '.mo';
	if (is_readable($mofile)) {
		load_textdomain($domain, $mofile);
	}

	// When installed as a real plugin, also use the standard lookup.
	if (strpos(wp_normalize_path(BL_FORMS_PATH), wp_normalize_path(WP_PLUGIN_DIR)) === 0) {
		load_plugin_textdomain($domain, false, dirname(plugin_basename(BL_FORMS_FILE)) . '/languages');
	}
}
add_action('init', 'bl_forms_load_textdomain', 1);

/**
 * Whether the current user may manage form definitions.
 */
function bl_forms_user_can_manage(): bool
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
 * Whether the current user may view form entries.
 */
function bl_forms_user_can_view_entries(): bool
{
	return current_user_can('manage_options');
}

/**
 * Resolve a built asset under assets/{css|js}/.
 *
 * @return array{uri: string, path: string, ver: string}|null
 */
function bl_forms_resolve_asset(string $name, string $type): ?array
{
	$type = $type === 'css' ? 'css' : 'js';
	$dir = bl_forms_path('assets/' . $type);
	$uri_dir = bl_forms_url('assets/' . $type);
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
 * Enqueue a forms stylesheet if built.
 */
function bl_forms_enqueue_style(string $handle, string $name, array $deps = []): bool
{
	$asset = bl_forms_resolve_asset($name, 'css');
	if ($asset === null) {
		return false;
	}

	wp_enqueue_style($handle, $asset['uri'], $deps, $asset['ver']);

	return true;
}

/**
 * Enqueue a forms script if built.
 */
function bl_forms_enqueue_script(string $handle, string $name, array $deps = [], bool $in_footer = true): bool
{
	$asset = bl_forms_resolve_asset($name, 'js');
	if ($asset === null) {
		return false;
	}

	wp_enqueue_script($handle, $asset['uri'], $deps, $asset['ver'], $in_footer);

	return true;
}
