<?php

defined('ABSPATH') || exit;

/**
 * Whether BaseLayer theme icon catalog / picker is available.
 */
function bl_events_has_theme_icon_picker(): bool
{
	return function_exists('bl_icons_localize_payload')
		&& function_exists('bl_cpt_menu_icon')
		&& function_exists('bl_enqueue_theme_icons_style');
}

/**
 * Default calendar SVG for menu icons (Material-style; works without the theme catalog).
 */
function bl_events_default_menu_icon_svg(): string
{
	return '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M212.31-100Q182-100 161-121q-21-21-21-51.31v-535.38Q140-738 161-759q21-21 51.31-21h55.38v-53.85q0-13.15 8.81-21.96 8.81-8.8 21.96-8.8 13.16 0 21.96 8.8 8.81 8.81 8.81 21.96V-780h303.08v-54.61q0-12.77 8.61-21.39 8.62-8.61 21.39-8.61 12.77 0 21.38 8.61 8.62 8.62 8.62 21.39V-780h55.38Q778-780 799-759q21 21 21 51.31v535.38Q820-142 799-121q-21 21-51.31 21H212.31Zm0-60h535.38q4.62 0 8.46-3.85 3.85-3.84 3.85-8.46v-375.38H200v375.38q0 4.62 3.85 8.46 3.84 3.85 8.46 3.85ZM200-607.69h560v-100q0-4.62-3.85-8.46-3.84-3.85-8.46-3.85H212.31q-4.62 0-8.46 3.85-3.85 3.84-3.85 8.46v100Zm0 0V-720v112.31Zm280 210.77q-14.69 0-25.04-10.35-10.34-10.34-10.34-25.04 0-14.69 10.34-25.04 10.35-10.34 25.04-10.34t25.04 10.34q10.34 10.35 10.34 25.04 0 14.7-10.34 25.04-10.35 10.35-25.04 10.35Zm-185.04-10.35q-10.34-10.34-10.34-25.04 0-14.69 10.34-25.04 10.35-10.34 25.04-10.34t25.04 10.34q10.34 10.35 10.34 25.04 0 14.7-10.34 25.04-10.35 10.35-25.04 10.35t-25.04-10.35ZM640-396.92q-14.69 0-25.04-10.35-10.34-10.34-10.34-25.04 0-14.69 10.34-25.04 10.35-10.34 25.04-10.34t25.04 10.34q10.34 10.35 10.34 25.04 0 14.7-10.34 25.04-10.35 10.35-25.04 10.35ZM480-240q-14.69 0-25.04-10.35-10.34-10.34-10.34-25.03 0-14.7 10.34-25.04 10.35-10.35 25.04-10.35t25.04 10.35q10.34 10.34 10.34 25.04 0 14.69-10.34 25.03Q494.69-240 480-240Zm-185.04-10.35q-10.34-10.34-10.34-25.03 0-14.7 10.34-25.04 10.35-10.35 25.04-10.35t25.04 10.35q10.34 10.34 10.34 25.04 0 14.69-10.34 25.03Q334.69-240 320-240t-25.04-10.35ZM640-240q-14.69 0-25.04-10.35-10.34-10.34-10.34-25.03 0-14.7 10.34-25.04 10.35-10.35 25.04-10.35t25.04 10.35q10.34 10.34 10.34 25.04 0 14.69-10.34 25.03Q654.69-240 640-240Z"/></svg>';
}

/**
 * Encode inline SVG as a menu_icon data URI for register_post_type.
 */
function bl_events_menu_icon_data_uri(string $svg): string
{
	$svg = preg_replace('/\sfill="[^"]*"/i', ' fill="#a7aaad"', $svg) ?: $svg;

	return 'data:image/svg+xml;base64,' . base64_encode($svg);
}

/**
 * Resolve event type menu icon for register_post_type.
 * Accepts dashicon, URL/data URI, inline SVG, or BaseLayer icon catalog name.
 * Without the theme catalog, catalog names fall back to the default calendar SVG.
 */
function bl_events_resolve_menu_icon(string $icon): string
{
	$icon = trim($icon);
	$fallback_svg = bl_events_default_menu_icon_svg();

	if ($icon === '') {
		$icon = 'calendar-month';
	}

	if (function_exists('bl_cpt_menu_icon')) {
		$resolved = bl_cpt_menu_icon($icon);
		return is_string($resolved) && $resolved !== ''
			? $resolved
			: bl_events_menu_icon_data_uri($fallback_svg);
	}

	if (strpos($icon, 'dashicons-') === 0 || strpos($icon, 'data:image/') === 0 || preg_match('#^https?://#i', $icon)) {
		return $icon;
	}

	if (stripos($icon, '<svg') !== false) {
		return bl_events_menu_icon_data_uri($icon);
	}

	// Catalog names (e.g. calendar-month) without theme → default SVG.
	return bl_events_menu_icon_data_uri($fallback_svg);
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
