<?php

defined('ABSPATH') || exit;

/**
 * Default values for Developer → Features. Used by the installer and when a key was never saved.
 * Single source of truth for “after setup” / new-install behavior.
 *
 * @return array<string, int> Option key => 1 (on) or 0 (off).
 */
function bl_theme_feature_defaults(): array
{
	return [
		'enable_svg'                => 1,
		'enable_duplicate_post'     => 1,
		'enable_seo'                => 1,
		'enable_breadcrumbs'        => 1,
		'enable_post_expirator'     => 1,
		'enable_forms'              => 1,
		'enable_languages'          => 0,
		'language_mode'             => 'content',
		'enable_blocked_ips'        => 1,
		'enable_webp'               => 1,
		'enable_webp_convert_original' => 0,
		'enable_media_folders'      => 1,
		'enable_matomo'             => 0,
		'enable_block_creator'      => 0,
	];
}

/**
 * Keys that default to off when the option was never saved (backward compat for options added later).
 *
 * @return string[]
 */
function bl_theme_feature_default_off_when_missing(): array
{
	return ['enable_languages', 'enable_webp', 'enable_webp_convert_original', 'enable_matomo', 'enable_block_creator'];
}

/**
 * Feature slug → Developer → Features option key.
 *
 * @return array<string, string>
 */
function bl_theme_feature_option_keys_map(): array
{
	return [
		'svg'                     => 'enable_svg',
		'duplicate_post'          => 'enable_duplicate_post',
		'seo'                     => 'enable_seo',
		'breadcrumbs'             => 'enable_breadcrumbs',
		'post_expirator'          => 'enable_post_expirator',
		'forms'                   => 'enable_forms',
		'languages'               => 'enable_languages',
		'blocked_ips'             => 'enable_blocked_ips',
		'webp'                    => 'enable_webp',
		'webp_convert_original'   => 'enable_webp_convert_original',
		'media_folders'           => 'enable_media_folders',
		'matomo'                  => 'enable_matomo',
		'block_creator'           => 'enable_block_creator',
	];
}

/**
 * Admin body classes for enabled features (prefix bl-feature-), for CSS scoping in wp-admin only.
 *
 * @return list<string>
 */
function bl_theme_feature_body_classes(): array
{
	$classes = [];
	foreach (array_keys(bl_theme_feature_option_keys_map()) as $slug) {
		if (bl_theme_feature_enabled($slug)) {
			$classes[] = 'bl-feature-' . str_replace('_', '-', $slug);
		}
	}
	return $classes;
}

add_filter('admin_body_class', function (string $classes): string {
	$extra = bl_theme_feature_body_classes();
	if ($extra === []) {
		return $classes;
	}
	return $classes . ' ' . implode(' ', $extra);
});

/**
 * Check whether a theme feature is enabled (Settings → Developer → Features).
 * Uses saved option when present; otherwise central defaults or “off when missing” for backward compat.
 *
 * @param string $feature One of the keys from bl_theme_feature_option_keys_map().
 * @return bool
 */
function bl_theme_feature_enabled(string $feature): bool
{
	static $options = null;

	if ($options === null) {
		$options = get_option('baselayer_features', []);
		if (!is_array($options)) {
			$options = [];
		}
	}

	$map = bl_theme_feature_option_keys_map();
	$key = $map[$feature] ?? '';
	if ($key === '') {
		return false;
	}

	if (!array_key_exists($key, $options)) {
		$default_off = bl_theme_feature_default_off_when_missing();
		if (in_array($key, $default_off, true)) {
			return false;
		}
		$defaults = bl_theme_feature_defaults();
		return (int) ($defaults[$key] ?? 1) === 1;
	}

	return (int) $options[$key] === 1;
}

/**
 * Multilingual mode when Languages feature is on: content (per-post translations) or google_translate.
 *
 * @return 'content'|'google_translate'
 */
function bl_language_mode(): string
{
	if (!bl_theme_feature_enabled('languages')) {
		return 'content';
	}

	$options = get_option('baselayer_features', []);
	if (!is_array($options)) {
		return 'content';
	}

	$mode = isset($options['language_mode']) ? (string) $options['language_mode'] : 'content';

	return $mode === 'google_translate' ? 'google_translate' : 'content';
}

/**
 * Whether the site uses Google Translate for frontend language switching.
 */
function bl_uses_google_translate(): bool
{
	return bl_language_mode() === 'google_translate';
}

/**
 * Whether built-in content translations (taxonomy, URL prefixes, editor panels) are active.
 */
function bl_uses_content_languages(): bool
{
	return bl_theme_feature_enabled('languages') && !bl_uses_google_translate();
}

/**
 * Get the content languages list (Developer → Languages). Used for translatable fields when non-empty.
 * When the Languages feature is off, returns an empty array (no per-language options).
 *
 * @return list<array{id: string, name?: string, nameNative?: string}>
 */
function bl_get_content_languages(): array
{
	if (!bl_theme_feature_enabled('languages')) {
		return [];
	}
	$data = get_option('bl_theme_languages', ['list' => [], 'default' => '']);
	$list = isset($data['list']) && is_array($data['list']) ? $data['list'] : [];

	return array_values($list);
}

/**
 * Get the default content language id (Developer → Languages). Empty when the Languages feature is off.
 *
 * @return string
 */
function bl_get_default_language(): string
{
	if (!bl_theme_feature_enabled('languages')) {
		return '';
	}
	$data = get_option('bl_theme_languages', ['list' => [], 'default' => '']);
	$default = isset($data['default']) ? (string) $data['default'] : '';
	if ($default !== '') {
		return $default;
	}
	$list = isset($data['list']) && is_array($data['list']) ? $data['list'] : [];

	return (string) ($list[0]['id'] ?? '');
}

/**
 * Get a language label from a language array. Supports config shape (label) and option shape (name, nameNative).
 *
 * @param array<string, string> $lang Language item from bl_get_content_languages().
 * @param string $type 'native' for native/original name, 'name' for admin name; both use label when present.
 * @return string
 */
function bl_content_language_label(array $lang, string $type = 'native'): string
{
	if ($type === 'name') {
		$v = $lang['name'] ?? $lang['label'] ?? $lang['nameNative'] ?? '';
	} else {
		$v = $lang['nameNative'] ?? $lang['label'] ?? $lang['name'] ?? '';
	}
	return $v !== '' ? (string) $v : (string) ($lang['id'] ?? '');
}

/**
 * Whether language prefixes are used in URLs at all (e.g. /de/, /fr/).
 * When false: no language segment in URLs; when true: URLs can use a language prefix.
 *
 * @return bool
 */
function bl_use_language_url_prefix(): bool
{
	if (!function_exists('bl_uses_content_languages') || !bl_uses_content_languages()) {
		return false;
	}
	$data = get_option('bl_theme_languages', ['list' => [], 'default' => '', 'prefix_default' => false, 'use_url_prefix' => true]);
	return isset($data['use_url_prefix']) ? (bool) $data['use_url_prefix'] : true;
}

/**
 * Whether the default language should have a URL prefix (e.g. /en/).
 * When false: default language has no prefix; when true: all languages use a prefix.
 * Only applies when bl_use_language_url_prefix() is true.
 *
 * @return bool
 */
function bl_prefix_default_language(): bool
{
	if (!bl_use_language_url_prefix()) {
		return false;
	}
	$data = get_option('bl_theme_languages', ['list' => [], 'default' => '', 'prefix_default' => false]);
	return !empty($data['prefix_default']);
}

/**
 * Behavior when the language toggler has no translation for the current page for a given language.
 * One of: 'hide' (do not show), 'disabled' (show but link disabled), 'home' (link to language homepage or /).
 *
 * @return string
 */
function bl_language_no_translation_behavior(): string
{
	if (!function_exists('bl_uses_content_languages') || !bl_uses_content_languages()) {
		return 'disabled';
	}
	$data = get_option('bl_theme_languages', ['no_translation' => 'disabled']);
	$v = isset($data['no_translation']) ? $data['no_translation'] : 'disabled';
	return in_array($v, ['hide', 'disabled', 'home'], true) ? $v : 'disabled';
}
