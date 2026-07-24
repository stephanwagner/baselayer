<?php

defined('ABSPATH') || exit;

/**
 * Enable theme support for title-tag (document title).
 *
 * @return void
 */
function bl_add_title_tag(): void
{
	add_theme_support('title-tag');
}
add_action('after_setup_theme', 'bl_add_title_tag');

/**
 * Document title without site name / tagline suffix.
 *
 * WordPress default: "Page not found - Site Name" (and tagline on home). We keep only
 * the primary title part (plus optional "Page 2" pagination).
 *
 * @param array<string, string> $title Parts (title, page, tagline, site).
 * @return array<string, string>
 */
function bl_document_title_parts(array $title): array
{
	unset($title['site'], $title['tagline']);

	return $title;
}
add_filter('document_title_parts', 'bl_document_title_parts', 20);

/**
 * Output manifest link in head.
 * Prefers the active child theme file when present.
 *
 * @return void
 */
function bl_add_manifest(): void
{
	$uri = get_template_directory_uri() . '/manifest.json';
	if (is_child_theme() && is_file(trailingslashit(get_stylesheet_directory()) . 'manifest.json')) {
		$uri = get_stylesheet_directory_uri() . '/manifest.json';
	}
	echo '<link rel="manifest" href="' . esc_url($uri) . '">' . "\n";
}
add_action('wp_head', 'bl_add_manifest');

/**
 * Favicon fallback when no site icon is set in Customizer.
 * Uses theme assets/img/favicon.png and favicon-192.png (after wp_site_icon at priority 99).
 *
 * @return void
 */
function bl_favicon_fallback(): void
{
	if (has_site_icon()) {
		return;
	}
	$dir = get_template_directory() . '/assets/img';
	if (file_exists($dir . '/favicon.png')) {
		echo '<link rel="icon" href="' . esc_url(bl_asset_url('/img/favicon.png')) . '" sizes="any">' . "\n";
	}
	if (file_exists($dir . '/favicon-192.png')) {
		echo '<link rel="icon" href="' . esc_url(bl_asset_url('/img/favicon-192.png')) . '" sizes="192x192">' . "\n";
	}
}
add_action('wp_head', 'bl_favicon_fallback', 100);

/**
 * Output meta charset and config meta tags in head.
 *
 * @return void
 */
function bl_meta_tags(): void
{
	echo '<meta charset="utf-8">' . "\n";
	foreach (bl_config('meta') as $name => $content) {
		echo '<meta name="' . $name . '" content="' . $content . '">' . "\n";
	}
}
add_action('wp_head', 'bl_meta_tags', 1);
