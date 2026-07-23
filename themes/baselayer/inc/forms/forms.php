<?php

/**
 * BaseLayer Forms — isolated form builder module.
 *
 * Soft theme deps (optional):
 * - bl_is_developer_user() for builder access
 * - bl_get_email_template() / bl_compose_email_document() for HTML mail chrome
 * - bl_enqueue_theme_style/script() for asset helpers (falls back to theme URIs)
 */

defined('ABSPATH') || exit;

const BL_FORMS_VERSION = '1.0.0';
const BL_FORM_POST_TYPE = 'bl_form';
const BL_FORM_ENTRY_POST_TYPE = 'bl_form_entry';
const BL_FORM_CONFIG_META = '_bl_form_config';
const BL_FORM_ENTRY_FORM_META = '_bl_form_id';
const BL_FORM_ENTRY_FIELDS_META = '_bl_entry_fields';
const BL_FORM_ENTRY_META_META = '_bl_entry_meta';
const BL_FORM_ENTRY_MAIL_META = '_bl_entry_mail';

require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/captcha.php';
require_once __DIR__ . '/cpt.php';
require_once __DIR__ . '/render.php';
require_once __DIR__ . '/mail.php';
require_once __DIR__ . '/submit.php';
require_once __DIR__ . '/block.php';

if (is_admin()) {
	require_once __DIR__ . '/admin.php';
	require_once __DIR__ . '/entries.php';
}

/**
 * Whether the current user may manage form definitions (developer builder).
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
 * Theme directory URI for forms assets.
 */
function bl_forms_theme_uri(string $relative = ''): string
{
	$base = get_template_directory_uri();
	$relative = ltrim($relative, '/');

	return $relative === '' ? $base : trailingslashit($base) . $relative;
}

/**
 * Theme directory path for forms assets.
 */
function bl_forms_theme_path(string $relative = ''): string
{
	$base = get_template_directory();
	$relative = ltrim($relative, '/');

	return $relative === '' ? $base : trailingslashit($base) . $relative;
}

/**
 * Resolve a built asset under assets/{css|js}/ with .min preference in production style.
 *
 * @return array{uri: string, path: string, ver: string}|null
 */
function bl_forms_resolve_asset(string $name, string $type): ?array
{
	$type = $type === 'css' ? 'css' : 'js';
	$dir = bl_forms_theme_path('assets/' . $type);
	$uri_dir = bl_forms_theme_uri('assets/' . $type);
	$debug = function_exists('bl_is_debug') && bl_is_debug();

	$candidates = $debug
		? [$name . '.' . $type, $name . '.min.' . $type]
		: [$name . '.min.' . $type, $name . '.' . $type];

	foreach ($candidates as $file) {
		$path = $dir . '/' . $file;
		if (is_readable($path)) {
			return [
				'uri'  => $uri_dir . '/' . $file,
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
