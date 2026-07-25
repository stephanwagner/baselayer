<?php

defined('ABSPATH') || exit;

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
			'public' => !empty($cfg['public']),
			'hierarchical' => !empty($cfg['hierarchical']),
			'show_ui' => true,
			'show_in_menu' => true,
			'show_in_rest' => true,
			'supports' => isset($cfg['supports']) && is_array($cfg['supports']) ? $cfg['supports'] : ['title', 'editor'],
			'has_archive' => !empty($archive['enabled']),
			'rewrite' => ['slug' => sanitize_title($archive_slug)],
			'menu_position' => isset($admin['menu_position']) ? (int) $admin['menu_position'] : 5,
			'menu_icon' => !empty($admin['menu_icon']) ? $admin['menu_icon'] : 'dashicons-calendar-alt',
		];

		if (is_string($args['menu_icon']) && stripos($args['menu_icon'], '<svg') !== false) {
			$args['menu_icon'] = 'data:image/svg+xml;base64,' . base64_encode(
				preg_replace('/\sfill="[^"]*"/i', ' fill="#a7aaad"', $args['menu_icon']) ?: $args['menu_icon']
			);
		}

		register_post_type($post_type, $args);

		$taxonomies = isset($cfg['taxonomies']) && is_array($cfg['taxonomies']) ? $cfg['taxonomies'] : [];
		foreach ($taxonomies as $tax => $tax_args) {
			$tax = sanitize_key((string) $tax);
			if ($tax === '' || !is_array($tax_args)) {
				continue;
			}
			if (!taxonomy_exists($tax)) {
				$label = isset($tax_args['label']) ? (string) $tax_args['label'] : $tax;
				$singular = isset($tax_args['singular_label']) ? (string) $tax_args['singular_label'] : $label;
				$url = isset($tax_args['url']) ? sanitize_title((string) $tax_args['url']) : $tax;
				register_taxonomy($tax, $post_type, [
					'labels' => [
						'name' => $label,
						'singular_name' => $singular !== '' ? $singular : $label,
					],
					'public' => true,
					'show_ui' => true,
					'show_admin_column' => true,
					'show_in_rest' => true,
					'hierarchical' => true,
					'rewrite' => ['slug' => $url],
				]);
			} else {
				register_taxonomy_for_object_type($tax, $post_type);
			}
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
