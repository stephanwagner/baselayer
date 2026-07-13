<?php

defined('ABSPATH') || exit;

/**
 * Asset version for static assets (logo, etc.). Bump in Theme settings → General when you change files.
 * In debug mode (WP_DEBUG) returns time() so cache is bypassed on every request.
 *
 * @return string Version string for ?ver= query arg (default '1').
 */
function bl_asset_version(): string
{
	if (function_exists('bl_is_debug') && bl_is_debug()) {
		return (string) time();
	}
	$v = get_option('baselayer_asset_version', '1');
	return $v !== '' ? (string) $v : '1';
}

/**
 * Normalize a theme asset path to live under assets/.
 *
 * @param string $path Path relative to theme root, e.g. '/img/logo.png' or 'assets/img/logo.png'.
 */
function bl_normalize_asset_path(string $path): string
{
	$path = ltrim($path, '/');
	if ($path !== '' && strpos($path, 'assets/') !== 0) {
		$path = 'assets/' . $path;
	}
	return $path;
}

/**
 * Absolute filesystem path for a theme asset, preferring the child theme when the file exists there.
 */
function bl_asset_path(string $path): string
{
	$path = bl_normalize_asset_path($path);

	if (is_child_theme()) {
		$child = trailingslashit(get_stylesheet_directory()) . $path;
		if (is_file($child)) {
			return $child;
		}
	}

	return trailingslashit(get_template_directory()) . $path;
}

/**
 * URL for a static theme asset with cache-busting version (Theme settings → Developer).
 * Assets live under assets/ (css, js, img). Path is relative to theme root; e.g. '/img/logo.png' → assets/img/logo.png.
 * Prefers the active child theme file when present.
 *
 * @param string $path Path relative to theme root, e.g. '/img/logo.png' or '/css/baselayer.css'.
 * @return string Escaped URL safe for HTML output.
 */
function bl_asset_url(string $path): string
{
	$path = bl_normalize_asset_path($path);
	$base_uri = get_template_directory_uri();

	if (is_child_theme()) {
		$child = trailingslashit(get_stylesheet_directory()) . $path;
		if (is_file($child)) {
			$base_uri = get_stylesheet_directory_uri();
		}
	}

	$url = $base_uri . '/' . $path . '?ver=' . bl_asset_version();
	return esc_url($url);
}

/**
 * Read SVG code from theme assets (e.g. /img/logo.svg).
 * Prefers the active child theme file when present.
 *
 * @param string $path Path relative to theme root or assets/, e.g. '/img/logo.svg'.
 * @param array<string,string> $attributes Optional attributes added to the root <svg> element.
 * @return string Inline SVG markup (empty string on failure).
 */
function bl_svg_code(string $path, array $attributes = []): string
{
	$full = bl_asset_path($path);
	if (!is_file($full)) {
		return '';
	}

	$svg = (string) file_get_contents($full);
	if ($svg === '' || stripos($svg, '<svg') === false) {
		return '';
	}

	if ($attributes !== []) {
		$attr_html = '';
		foreach ($attributes as $name => $value) {
			$name = trim((string) $name);
			if ($name === '') {
				continue;
			}
			$attr_html .= ' ' . $name . '="' . esc_attr((string) $value) . '"';
		}
		if ($attr_html !== '') {
			$svg = (string) preg_replace('/<svg\b([^>]*)>/i', '<svg$1' . $attr_html . '>', $svg, 1);
		}
	}

	return $svg;
}

/**
 * Render an image tag from WordPress attachment input.
 *
 * @param int|string|\WP_Post|null $image Attachment ID (or numeric string) or attachment post object.
 * @param string|array<int,int>|int $size Attachment size for wp_get_attachment_image().
 * @param array<string,mixed> $args Attributes for the resulting <img>.
 * @return string
 */
function bl_img($image, $size = 'medium', array $args = []): string
{
	$defaults = [
		'class' => 'fs-img',
		'loading' => 'lazy',
		'decoding' => 'async',
	];
	$args = array_merge($defaults, $args);

	$image_id = 0;
	if ($image instanceof \WP_Post) {
		$image_id = (int) $image->ID;
	} elseif (is_numeric($image)) {
		$image_id = (int) $image;
	}
	if ($image_id <= 0) {
		return '';
	}

	if (!array_key_exists('alt', $args) || $args['alt'] === null || $args['alt'] === '') {
		$args['alt'] = (string) get_post_meta($image_id, '_wp_attachment_image_alt', true);
	}

	return wp_get_attachment_image($image_id, $size, false, $args) ?: '';
}

/**
 * Get the hash for assets (file modification time). Path is under assets/ (e.g. /assets/css/baselayer.css or /css/baselayer.css).
 *
 * @param string $file Path relative to theme root, e.g. '/assets/css/baselayer.css'.
 * @return string Hash/version string for enqueue versioning.
 */
function bl_asset_hash(string $file): string
{
	if (bl_is_debug()) {
		return (string) time();
	}
	$path = ltrim($file, '/');
	if ($path !== '' && strpos($path, 'assets/') !== 0) {
		$path = 'assets/' . $path;
	}
	$full = get_template_directory() . '/' . $path;
	if (!file_exists($full)) {
		// Never fatal on missing files; force cache miss while signaling issue.
		return (string) time();
	}
	return substr(md5((string) filemtime($full)), 0, 6);
}

/**
 * Enqueue front-end stylesheets (baselayer.css).
 *
 * @return void
 */
function bl_styles(): void
{
	$min = bl_is_debug() ? '' : '.min';

	$file = '/assets/css/baselayer' . $min . '.css';

	wp_enqueue_style(
		'baselayer-styles',
		get_template_directory_uri() . $file,
		[],
		bl_asset_hash($file),
	);
}
add_action('wp_enqueue_scripts', 'bl_styles');

/**
 * Resolve a built child theme asset (CSS or JS) when present.
 *
 * Prefers `.min` when not in debug, falls back to the unminified file.
 *
 * @param 'css'|'js' $kind
 * @return array{rel: string, path: string, uri: string, ver: string}|null
 */
function bl_child_theme_built_asset(string $kind): ?array
{
	if (!is_child_theme() || ($kind !== 'css' && $kind !== 'js')) {
		return null;
	}

	$min = bl_is_debug() ? '' : '.min';
	$base = trailingslashit(get_stylesheet_directory());
	$base_uri = trailingslashit(get_stylesheet_directory_uri());
	$dir = $kind === 'css' ? 'assets/css' : 'assets/js';
	$rel = $dir . '/main' . $min . '.' . $kind;
	$fallback = $dir . '/main.' . $kind;
	$file = is_readable($base . $rel) ? $rel : (is_readable($base . $fallback) ? $fallback : '');

	if ($file === '') {
		return null;
	}

	return [
		'rel' => $file,
		'path' => $base . $file,
		'uri' => $base_uri . $file,
		'ver' => (string) filemtime($base . $file),
	];
}

/**
 * Enqueue child theme front-end assets after parent (when built files exist).
 */
function bl_enqueue_child_theme_assets(): void
{
	$css = bl_child_theme_built_asset('css');
	if ($css !== null) {
		wp_enqueue_style(
			'child-main-styles',
			$css['uri'],
			['baselayer-styles'],
			$css['ver']
		);
	}

	$js = bl_child_theme_built_asset('js');
	if ($js !== null) {
		wp_enqueue_script(
			'child-main-scripts',
			$js['uri'],
			['baselayer-scripts'],
			$js['ver'],
			true
		);
	}
}
add_action('wp_enqueue_scripts', 'bl_enqueue_child_theme_assets', 20);

/**
 * Load child main.css in the block editor canvas (same path as admin.css).
 *
 * Child block styles compile into main.css; without this they only appear on the front.
 */
function bl_enqueue_child_theme_block_assets(): void
{
	if (!is_admin() || !bl_admin_is_block_editor_screen()) {
		return;
	}

	$css = bl_child_theme_built_asset('css');
	if ($css === null) {
		return;
	}

	wp_enqueue_style(
		'child-main-styles',
		$css['uri'],
		['main-admin-styles'],
		$css['ver']
	);
}
add_action('enqueue_block_assets', 'bl_enqueue_child_theme_block_assets', 20);

/**
 * Load child main.js in the block editor (ACF block scripts bundled there).
 */
function bl_enqueue_child_theme_editor_scripts(): void
{
	$js = bl_child_theme_built_asset('js');
	if ($js === null) {
		return;
	}

	wp_enqueue_script(
		'child-main-scripts',
		$js['uri'],
		[],
		$js['ver'],
		true
	);
}
add_action('enqueue_block_editor_assets', 'bl_enqueue_child_theme_editor_scripts', 20);

/**
 * Enqueue theme icon mask CSS (child assets/css/icons.css when present, else parent).
 *
 * Relative url() values are rewritten to absolute theme URIs so browsers resolve
 * them correctly when mask-image uses var(--fs-icon) from the parent stylesheet.
 *
 * @param string[] $deps Style handle dependencies.
 */
function bl_enqueue_theme_icons_style(array $deps = []): void
{
	$rel = 'assets/css/icons.css';
	$path = '';
	$uri_base = '';

	if (is_child_theme()) {
		$child_base = trailingslashit(get_stylesheet_directory());
		if (is_readable($child_base . $rel)) {
			$path = $child_base . $rel;
			$uri_base = trailingslashit(get_stylesheet_directory_uri());
		}
	}

	if ($path === '') {
		$parent_base = trailingslashit(get_template_directory());
		if (!is_readable($parent_base . $rel)) {
			return;
		}
		$path = $parent_base . $rel;
		$uri_base = trailingslashit(get_template_directory_uri());
	}

	$css = file_get_contents($path);
	if ($css === false || $css === '') {
		return;
	}

	$css = (string) preg_replace_callback(
		'#url\(\s*([\'"]?)\.\./([^/\'")\s]+)/#',
		static function (array $matches) use ($uri_base): string {
			return 'url(' . $matches[1] . $uri_base . 'assets/' . $matches[2] . '/';
		},
		$css
	);

	wp_register_style('theme-icons', false, $deps, (string) filemtime($path));
	wp_enqueue_style('theme-icons');
	wp_add_inline_style('theme-icons', $css);
}

/**
 * Theme icons on the front end (after parent styles).
 */
function bl_enqueue_theme_icons_front(): void
{
	bl_enqueue_theme_icons_style(['baselayer-styles']);
}
add_action('wp_enqueue_scripts', 'bl_enqueue_theme_icons_front', 25);

/**
 * Theme icons in wp-admin (developer cheatsheet, etc.).
 */
function bl_enqueue_theme_icons_admin(): void
{
	bl_enqueue_theme_icons_style(['main-admin-styles']);
}
add_action('admin_enqueue_scripts', 'bl_enqueue_theme_icons_admin', 20);

/**
 * Theme icons for the block editor canvas / shared block assets.
 */
function bl_enqueue_theme_icons_block_assets(): void
{
	if (!is_admin()) {
		return;
	}
	bl_enqueue_theme_icons_style(['main-admin-styles']);
}
add_action('enqueue_block_assets', 'bl_enqueue_theme_icons_block_assets', 5);

/**
 * Theme icons in the block editor chrome (icon picker).
 */
function bl_enqueue_theme_icons_editor(): void
{
	bl_enqueue_theme_icons_style(['main-admin-styles']);
}
add_action('enqueue_block_editor_assets', 'bl_enqueue_theme_icons_editor', 20);

/**
 * Enqueue theme admin.css (same bundle as wp-admin).
 * Used on login screen via login_enqueue_scripts as well.
 *
 * @return void
 */
function bl_enqueue_admin_styles(): void
{
	$min = bl_is_debug() ? '' : '.min';

	$file = '/assets/css/admin' . $min . '.css';
	wp_enqueue_style(
		'main-admin-styles',
		get_template_directory_uri() . $file,
		[],
		bl_asset_hash($file),
	);
}

/**
 * Block editor screens (post, site, widgets, etc.): admin.css must be registered via
 * enqueue_block_assets so WordPress does not inject it into the canvas iframe from
 * admin_enqueue_scripts (WP 6.3+).
 *
 * @return bool
 */
function bl_admin_is_block_editor_screen(): bool
{
	$screen = get_current_screen();

	return $screen instanceof \WP_Screen && $screen->is_block_editor();
}

/**
 * Load admin.css for the block editor (canvas + chrome) on the path WordPress expects.
 *
 * @return void
 */
function bl_enqueue_admin_styles_block_assets(): void
{
	if (!is_admin() || !bl_admin_is_block_editor_screen()) {
		return;
	}
	bl_enqueue_admin_styles();
}
add_action('enqueue_block_assets', 'bl_enqueue_admin_styles_block_assets', 1);

/**
 * Theme admin.css everywhere in wp-admin except the block editor (handled above).
 *
 * @param string $hook_suffix Current admin page hook from admin_enqueue_scripts.
 */
function bl_admin_styles(string $hook_suffix): void
{
	if (bl_admin_is_block_editor_screen()) {
		return;
	}
	bl_enqueue_admin_styles();
}
add_action('admin_enqueue_scripts', 'bl_admin_styles');
add_action('login_enqueue_scripts', 'bl_enqueue_admin_styles');

/**
 * Enqueue admin-bar styles used in backend and frontend when the bar is visible.
 */
function bl_admin_bar_styles(): void
{
	if (!is_admin_bar_showing()) {
		return;
	}

	$min = bl_is_debug() ? '' : '.min';
	$file = '/assets/css/admin-bar' . $min . '.css';
	wp_enqueue_style(
		'baselayer-admin-bar-styles',
		get_template_directory_uri() . $file,
		['admin-bar'],
		bl_asset_hash($file)
	);
}
add_action('wp_enqueue_scripts', 'bl_admin_bar_styles', 20);
add_action('admin_enqueue_scripts', 'bl_admin_bar_styles', 20);

/**
 * Enqueue front-end scripts (baselayer.js).
 *
 * @return void
 */
function bl_scripts(): void
{
	$min = bl_is_debug() ? '' : '.min';

	$file = '/assets/js/baselayer' . $min . '.js';

	wp_enqueue_script(
		'baselayer-scripts',
		get_template_directory_uri() . $file,
		[],
		bl_asset_hash($file),
		true
	);

	if (function_exists('bl_uses_google_translate') && bl_uses_google_translate()) {
		$languages = function_exists('bl_get_content_languages') ? bl_get_content_languages() : [];
		$lang_codes = [];
		foreach ($languages as $lang) {
			if (!empty($lang['id'])) {
				$lang_codes[] = (string) $lang['id'];
			}
		}
		wp_localize_script('baselayer-scripts', 'fsGoogleTranslate', [
			'pageLang' => function_exists('bl_get_default_language') ? bl_get_default_language() : '',
			'languages' => $lang_codes,
			'triggerLabel' => __('Select language, current: %s', 'baselayer'),
			'triggerLabelEmpty' => __('Select language', 'baselayer'),
		]);
	}
}
add_action('wp_enqueue_scripts', 'bl_scripts');

/**
 * Enqueue admin scripts (admin.js).
 *
 * @return void
 */
function bl_admin_scripts(): void
{
	$min = bl_is_debug() ? '' : '.min';

	$file = '/assets/js/admin' . $min . '.js';

	wp_enqueue_script(
		'main-admin-scripts',
		get_template_directory_uri() . $file,
		[],
		bl_asset_hash($file),
		true
	);
}
add_action('admin_enqueue_scripts', 'bl_admin_scripts');

/**
 * Enqueue block editor scripts (editor.js).
 *
 * @return void
 */
function bl_editor_scripts(): void
{
	$min = bl_is_debug() ? '' : '.min';

	$file = '/assets/js/editor' . $min . '.js';

	wp_enqueue_script(
		'baselayer-editor',
		get_template_directory_uri() . $file,
		array_values(array_filter([
			'wp-plugins',
			'wp-edit-post',
			'wp-editor',
			'wp-element',
			'wp-block-editor',
			'wp-blocks',
			'wp-rich-text',
			'wp-components',
			'wp-data',
			'wp-core-data',
			'wp-i18n',
			'wp-date',
			'wp-preferences',
			wp_script_is('acf-input', 'registered') ? 'acf-input' : null,
		])),
		bl_asset_hash($file),
		true
	);
	wp_localize_script('baselayer-editor', 'baselayerFeatures', [
		'seo' => function_exists('bl_theme_feature_enabled') && bl_theme_feature_enabled('seo'),
		'post_expirator' => function_exists('bl_theme_feature_enabled') && bl_theme_feature_enabled('post_expirator'),
		'languages' => function_exists('bl_uses_content_languages') && bl_uses_content_languages(),
	]);

	if (function_exists('bl_block_settings_editor_config')) {
		wp_localize_script(
			'baselayer-editor',
			'baselayerBlockSettings',
			bl_block_settings_editor_config()
		);
	}
}
add_action('enqueue_block_editor_assets', 'bl_editor_scripts');
