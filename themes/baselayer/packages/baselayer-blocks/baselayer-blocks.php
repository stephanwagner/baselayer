<?php
/**
 * Plugin Name: BaseLayer Blocks
 * Description: Create custom Gutenberg blocks with a field builder.
 * Version: 0.1.0
 * Author: BaseLayer
 * Author URI: https://baselayerwp.com/baselayer-blocks
 * Text Domain: baselayer-blocks
 * Domain Path: /languages
 * Requires at least: 6.0
 * Requires PHP: 8.0
 */

defined('ABSPATH') || exit;

if (defined('BL_BLOCKS_LOADED')) {
	return;
}

define('BL_BLOCKS_LOADED', true);
define('BL_BLOCKS_VERSION', '0.1.0');
define('BL_BLOCKS_FILE', __FILE__);
define('BL_BLOCKS_PATH', trailingslashit(dirname(__FILE__)));
define('BL_BLOCKS_TEXTDOMAIN', 'baselayer-blocks');

/**
 * Absolute path under the package root.
 */
function bl_blocks_path(string $relative = ''): string
{
	$relative = ltrim($relative, '/');

	return $relative === '' ? BL_BLOCKS_PATH : BL_BLOCKS_PATH . $relative;
}

/**
 * Whether this package is loaded as a WP plugin.
 */
function bl_blocks_loaded_as_plugin(): bool
{
	if (!defined('WP_PLUGIN_DIR') || !function_exists('plugin_basename')) {
		return false;
	}

	$basename = plugin_basename(BL_BLOCKS_FILE);
	if ($basename === '' || strpos($basename, '.php') === false) {
		return false;
	}

	if ($basename[0] === '/' || preg_match('#^[a-zA-Z]:[/\\\\]#', $basename)) {
		return false;
	}

	$candidate = wp_normalize_path(trailingslashit(WP_PLUGIN_DIR) . $basename);
	$real_file = realpath(BL_BLOCKS_FILE);
	$real_candidate = realpath($candidate);

	return is_string($real_file) && is_string($real_candidate) && $real_file === $real_candidate;
}

/**
 * Public URL for the package root.
 */
function bl_blocks_base_url(): string
{
	static $url = null;
	if ($url !== null) {
		return $url;
	}

	if (bl_blocks_loaded_as_plugin()) {
		$url = trailingslashit(plugins_url('', BL_BLOCKS_FILE));

		return $url;
	}

	$path = wp_normalize_path(trailingslashit(realpath(BL_BLOCKS_PATH) ?: BL_BLOCKS_PATH));
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

	$url = trailingslashit(get_template_directory_uri() . '/packages/baselayer-blocks');

	return $url;
}

/**
 * URL under the package root.
 */
function bl_blocks_url(string $relative = ''): string
{
	$relative = ltrim($relative, '/');

	return $relative === '' ? bl_blocks_base_url() : bl_blocks_base_url() . $relative;
}

/**
 * Whether the current user may manage blocks.
 */
function bl_blocks_user_can_manage(): bool
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
function bl_blocks_resolve_asset(string $name, string $type): ?array
{
	$type = $type === 'css' ? 'css' : 'js';
	$dir = bl_blocks_path('assets/' . $type);
	$uri_dir = bl_blocks_url('assets/' . $type);
	$debug = function_exists('bl_is_debug') && bl_is_debug();

	$candidates = $debug
		? [$name . '.' . $type, $name . '.min.' . $type]
		: [$name . '.min.' . $type, $name . '.' . $type];

	foreach ($candidates as $file) {
		$path = $dir . '/' . $file;
		if (is_readable($path)) {
			return [
				'uri' => trailingslashit($uri_dir) . $file,
				'path' => $path,
				'ver' => $debug ? (string) time() : (string) filemtime($path),
			];
		}
	}

	return null;
}

/**
 * Enqueue a blocks stylesheet if built.
 */
function bl_blocks_enqueue_style(string $handle, string $name, array $deps = []): bool
{
	$asset = bl_blocks_resolve_asset($name, 'css');
	if ($asset === null) {
		return false;
	}
	wp_enqueue_style($handle, $asset['uri'], $deps, $asset['ver']);

	return true;
}

/**
 * Enqueue a blocks script if built.
 */
function bl_blocks_enqueue_script(string $handle, string $name, array $deps = [], bool $in_footer = true): bool
{
	$asset = bl_blocks_resolve_asset($name, 'js');
	if ($asset === null) {
		return false;
	}
	wp_enqueue_script($handle, $asset['uri'], $deps, $asset['ver'], $in_footer);

	return true;
}

/**
 * Enqueue shared canvas-builder kit (theme helper, else Blocks vendor copy).
 */
function bl_blocks_enqueue_canvas_builder_kit(): string
{
	$args = [
		'vendor_dir' => bl_blocks_path('assets/vendor/canvas-builder'),
		'vendor_url' => bl_blocks_url('assets/vendor/canvas-builder'),
	];

	if (function_exists('bl_canvas_builder_enqueue_kit')) {
		return bl_canvas_builder_enqueue_kit($args);
	}

	$handle = 'baselayer-canvas-builder-admin';
	$debug = function_exists('bl_is_debug') && bl_is_debug();
	$base = $args['vendor_dir'];
	$uri = $args['vendor_url'];
	$enqueued = false;
	$name = 'canvas-builder-admin';

	foreach (['css', 'js'] as $type) {
		$candidates = $debug
			? [$name . '.' . $type, $name . '.min.' . $type]
			: [$name . '.min.' . $type, $name . '.' . $type];
		foreach ($candidates as $file) {
			$path = trailingslashit($base) . $file;
			if (!is_readable($path)) {
				continue;
			}
			$url = trailingslashit($uri) . $file;
			$ver = $debug ? (string) time() : (string) filemtime($path);
			if ($type === 'css') {
				wp_enqueue_style($handle, $url, [], $ver);
			} else {
				wp_enqueue_script($handle, $url, [], $ver, true);
			}
			$enqueued = true;
			break;
		}
	}

	return $enqueued ? $handle : '';
}

/**
 * Enqueue shared form-builder kit (theme helper, else Blocks vendor copy).
 *
 * @param string[] $deps Style/script handles (typically canvas-builder).
 */
function bl_blocks_enqueue_form_builder_kit(array $deps = []): string
{
	$args = [
		'vendor_dir' => bl_blocks_path('assets/vendor/form-builder'),
		'vendor_url' => bl_blocks_url('assets/vendor/form-builder'),
		'deps'       => $deps,
	];

	if (function_exists('bl_form_builder_enqueue_kit')) {
		return bl_form_builder_enqueue_kit($args);
	}

	$handle = 'baselayer-form-builder-admin';
	$debug = function_exists('bl_is_debug') && bl_is_debug();
	$base = $args['vendor_dir'];
	$uri = $args['vendor_url'];
	$enqueued = false;
	$name = 'form-builder-admin';

	foreach (['css', 'js'] as $type) {
		$candidates = $debug
			? [$name . '.' . $type, $name . '.min.' . $type]
			: [$name . '.min.' . $type, $name . '.' . $type];
		foreach ($candidates as $file) {
			$path = trailingslashit($base) . $file;
			if (!is_readable($path)) {
				continue;
			}
			$url = trailingslashit($uri) . $file;
			$ver = $debug ? (string) time() : (string) filemtime($path);
			if ($type === 'css') {
				wp_enqueue_style($handle, $url, $deps, $ver);
			} else {
				wp_enqueue_script($handle, $url, $deps, $ver, true);
			}
			$enqueued = true;
			break;
		}
	}

	return $enqueued ? $handle : '';
}

require_once BL_BLOCKS_PATH . 'includes/config.php';
require_once BL_BLOCKS_PATH . 'includes/cpt.php';
require_once BL_BLOCKS_PATH . 'includes/builder-icons.php';
require_once BL_BLOCKS_PATH . 'includes/field-ui.php';
require_once BL_BLOCKS_PATH . 'includes/field-api.php';
require_once BL_BLOCKS_PATH . 'includes/runtime-site.php';
require_once BL_BLOCKS_PATH . 'includes/runtime-page.php';
require_once BL_BLOCKS_PATH . 'includes/runtime-blocks.php';
require_once BL_BLOCKS_PATH . 'includes/template-starter.php';

if (is_admin()) {
	require_once BL_BLOCKS_PATH . 'includes/admin.php';
	require_once BL_BLOCKS_PATH . 'includes/admin-editor.php';
	require_once BL_BLOCKS_PATH . 'includes/import-export.php';
}

/**
 * Load package translations.
 */
function bl_blocks_load_textdomain(): void
{
	$domain = BL_BLOCKS_TEXTDOMAIN;
	$locale = function_exists('determine_locale') ? determine_locale() : get_locale();
	$mofile = BL_BLOCKS_PATH . 'languages/' . $domain . '-' . $locale . '.mo';
	if (is_readable($mofile)) {
		load_textdomain($domain, $mofile);
	}

	if (bl_blocks_loaded_as_plugin()) {
		load_plugin_textdomain($domain, false, dirname(plugin_basename(BL_BLOCKS_FILE)) . '/languages');
	}
}
add_action('init', 'bl_blocks_load_textdomain', 1);
