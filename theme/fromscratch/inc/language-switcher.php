<?php

defined('ABSPATH') || exit;

/**
 * Whether the language switcher should output anything.
 */
function fs_language_switcher_available(): bool
{
	return function_exists('fs_theme_feature_enabled') && fs_theme_feature_enabled('languages');
}

/**
 * Language switcher markup (same output as shortcode [fs_language_switcher]).
 */
function fs_language_switcher_html(): string
{
	if (!fs_language_switcher_available()) {
		return '';
	}

	if (function_exists('fs_uses_google_translate') && fs_uses_google_translate()) {
		return fs_google_translate_switcher_html();
	}

	return fs_content_language_switcher_html();
}

add_shortcode('fs_language_switcher', static function ($atts = [], $content = null, $tag = ''): string {
	unset($atts, $content, $tag);
	return fs_language_switcher_html();
});
