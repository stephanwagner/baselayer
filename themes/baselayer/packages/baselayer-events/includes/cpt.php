<?php

defined('ABSPATH') || exit;

/**
 * Resolve event type menu icon for register_post_type.
 * Accepts dashicon, URL/data URI, inline SVG, or BaseLayer icon catalog name.
 */
function bl_events_resolve_menu_icon(string $icon): string
{
	$icon = trim($icon);
	$fallback = 'dashicons-calendar-alt';

	if ($icon === '') {
		return $fallback;
	}

	if (function_exists('bl_cpt_menu_icon')) {
		$resolved = bl_cpt_menu_icon($icon);
		return is_string($resolved) && $resolved !== '' ? $resolved : $fallback;
	}

	if (strpos($icon, 'dashicons-') === 0 || strpos($icon, 'data:image/') === 0 || preg_match('#^https?://#i', $icon)) {
		return $icon;
	}

	if (stripos($icon, '<svg') !== false) {
		$svg = preg_replace('/\sfill="[^"]*"/i', ' fill="#a7aaad"', $icon) ?: $icon;
		return 'data:image/svg+xml;base64,' . base64_encode($svg);
	}

	return $fallback;
}

/**
 * Inject Events instances into BaseLayer content-types map (theme archives, menus, etc.).
 *
 * @param array<string, array<string, mixed>> $types
 * @return array<string, array<string, mixed>>
 */
function bl_events_inject_content_types(array $types): array
{
	foreach (bl_events_get_instances(false) as $slug => $cfg) {
		$types[$slug] = $cfg;
	}

	return $types;
}

/**
 * Standalone CPT registration when BaseLayer theme helpers are unavailable.
 */
function bl_events_register_cpts_standalone(): void
{
	if (function_exists('bl_register_cpts')) {
		return;
	}

	foreach (bl_events_get_instances(true) as $post_type => $cfg) {
		if (!is_string($post_type) || $post_type === '' || post_type_exists($post_type)) {
			continue;
		}

		$labels = isset($cfg['labels']) && is_array($cfg['labels']) ? $cfg['labels'] : [];
		$archive = isset($cfg['archive']) && is_array($cfg['archive']) ? $cfg['archive'] : [];
		$admin = isset($cfg['admin']) && is_array($cfg['admin']) ? $cfg['admin'] : [];
		$archive_slug = !empty($archive['slug']) ? (string) $archive['slug'] : $post_type;

		$args = [
			'labels' => [
				'name' => $labels['name'] ?? $post_type,
				'singular_name' => $labels['singular_name'] ?? $post_type,
				'menu_name' => $labels['menu_name'] ?? ($labels['name'] ?? $post_type),
			],
			'public' => true,
			'hierarchical' => false,
			'show_ui' => true,
			'show_in_menu' => true,
			'show_in_rest' => true,
			'supports' => bl_events_forced_supports(),
			'has_archive' => !empty($archive['enabled']),
			'rewrite' => ['slug' => sanitize_title($archive_slug)],
			'menu_position' => isset($admin['menu_position']) ? (int) $admin['menu_position'] : 5,
			'menu_icon' => bl_events_resolve_menu_icon((string) ($admin['menu_icon'] ?? '')),
		];

		register_post_type($post_type, $args);

		if (!empty($cfg['wp_categories'])) {
			register_taxonomy_for_object_type('category', $post_type);
		}
	}
}

/**
 * Flush rewrites after settings / seed when flagged.
 */
function bl_events_maybe_flush_rewrites(): void
{
	if (!get_option('bl_events_flush_rewrite')) {
		return;
	}
	delete_option('bl_events_flush_rewrite');
	flush_rewrite_rules(false);
}

add_action('init', 'bl_events_register_cpts_standalone', 2);
add_action('init', 'bl_events_maybe_flush_rewrites', 99);

if (function_exists('add_filter')) {
	add_filter('bl_content_types', 'bl_events_inject_content_types');
}
