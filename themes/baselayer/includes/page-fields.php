<?php

defined('ABSPATH') || exit;

/**
 * Resolve an active page_settings definition ID by slug.
 */
function bl_page_fields_definition_id(string $slug): int
{
	$slug = sanitize_key($slug);
	if ($slug === '' || !function_exists('bl_blocks_query_definitions') || !function_exists('bl_blocks_definition_slug')) {
		return 0;
	}

	static $cache = [];
	if (array_key_exists($slug, $cache)) {
		return $cache[$slug];
	}

	$cache[$slug] = 0;
	foreach (bl_blocks_query_definitions('page_settings', true) as $post) {
		if (!$post instanceof WP_Post) {
			continue;
		}
		if (bl_blocks_definition_slug((int) $post->ID) === $slug) {
			$cache[$slug] = (int) $post->ID;
			break;
		}
	}

	return $cache[$slug];
}

/**
 * Page Fields values for a definition slug (raw stored bag).
 *
 * @return array<string, mixed>
 */
function bl_page_fields(string $slug, int $post_id = 0): array
{
	$slug = sanitize_key($slug);
	if ($slug === '') {
		return [];
	}

	if ($post_id <= 0) {
		$post_id = (int) get_the_ID();
	}
	if ($post_id <= 0) {
		return [];
	}

	$def_id = bl_page_fields_definition_id($slug);
	if ($def_id <= 0 || !function_exists('bl_blocks_page_meta_key')) {
		return [];
	}

	$raw = get_post_meta($post_id, bl_blocks_page_meta_key($def_id), true);

	return is_array($raw) ? $raw : [];
}

/**
 * One Page Fields value (formatted like bl_block_field when possible).
 *
 * @return mixed
 */
function bl_page_field(string $slug, string $name, int $post_id = 0)
{
	$name = (string) $name;
	if ($name === '') {
		return null;
	}

	$values = bl_page_fields($slug, $post_id);
	$raw = array_key_exists($name, $values) ? $values[$name] : null;

	if (!function_exists('bl_blocks_get_config') || !function_exists('bl_blocks_field_map') || !function_exists('bl_blocks_format_field_value')) {
		return $raw;
	}

	$def_id = bl_page_fields_definition_id($slug);
	if ($def_id <= 0) {
		return $raw;
	}

	$config = bl_blocks_get_config($def_id);
	$fields = isset($config['fields']) && is_array($config['fields']) ? $config['fields'] : [];
	$field_map = bl_blocks_field_map($fields);
	$field = $field_map[$name] ?? null;
	if (!is_array($field)) {
		return null;
	}

	return bl_blocks_format_field_value($field, $raw);
}
