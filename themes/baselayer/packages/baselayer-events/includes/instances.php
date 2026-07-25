<?php

defined('ABSPATH') || exit;

const BL_EVENTS_INSTANCES_OPTION = 'bl_events_instances';

/**
 * Default instance definition (without slug).
 *
 * @return array<string, mixed>
 */
function bl_events_default_instance_definition(): array
{
	$path = BL_EVENTS_PATH . 'config/default-instance.php';
	$def = is_readable($path) ? require $path : [];

	return is_array($def) ? $def : [];
}

/**
 * @return array<string, array<string, mixed>>
 */
function bl_events_default_instances(): array
{
	$def = bl_events_default_instance_definition();
	$def['type'] = 'event';

	return [
		'event' => $def,
	];
}

/**
 * Seed option from package defaults when empty.
 */
function bl_events_maybe_seed_instances(): void
{
	$existing = get_option(BL_EVENTS_INSTANCES_OPTION, null);
	if (is_array($existing) && $existing !== []) {
		return;
	}

	update_option(BL_EVENTS_INSTANCES_OPTION, bl_events_sanitize_instances(bl_events_default_instances()), false);
	update_option('bl_events_flush_rewrite', 1, false);
}

/**
 * @return array<string, array<string, mixed>>
 */
function bl_events_get_instances(bool $enabled_only = false): array
{
	static $cache = null;
	static $cache_bust = 0;
	static $cache_enabled = null;

	$bust = (int) ($GLOBALS['bl_events_instances_cache_bust'] ?? 0);
	if ($cache === null || $bust !== $cache_bust) {
		$cache_bust = $bust;
		$cache_enabled = null;
		bl_events_maybe_seed_instances();
		$raw = get_option(BL_EVENTS_INSTANCES_OPTION, []);
		if (!is_array($raw) || $raw === []) {
			$raw = bl_events_default_instances();
		}
		$cache = bl_events_sanitize_instances($raw);
		/**
		 * Filter all Events package instances (enabled and disabled).
		 *
		 * @param array<string, array<string, mixed>> $instances
		 */
		$cache = apply_filters('bl_events_instances', $cache);
		if (!is_array($cache)) {
			$cache = [];
		}
		$cache = bl_events_sanitize_instances($cache);
	}

	if (!$enabled_only) {
		return $cache;
	}

	if ($cache_enabled === null) {
		$cache_enabled = [];
		foreach ($cache as $slug => $cfg) {
			if (!empty($cfg['enabled'])) {
				$cache_enabled[$slug] = $cfg;
			}
		}
	}

	return $cache_enabled;
}

/**
 * Clear in-request instance cache (after settings save).
 */
function bl_events_reset_instances_cache(): void
{
	$GLOBALS['bl_events_instances_cache_bust'] = (int) ($GLOBALS['bl_events_instances_cache_bust'] ?? 0) + 1;
}

/**
 * @return array<string, mixed>|null
 */
function bl_events_get_instance(string $slug): ?array
{
	$slug = sanitize_key($slug);
	$all = bl_events_get_instances(false);

	return $all[$slug] ?? null;
}

/**
 * Whether the Events package owns this post type slug.
 */
function bl_events_owns_post_type(string $slug): bool
{
	$slug = sanitize_key($slug);
	if ($slug === '') {
		return false;
	}

	return isset(bl_events_get_instances(false)[$slug]);
}

/**
 * Persist instances and bust caches.
 *
 * @param array<string, array<string, mixed>> $instances
 */
function bl_events_save_instances(array $instances): bool
{
	$clean = bl_events_sanitize_instances($instances);
	$ok = update_option(BL_EVENTS_INSTANCES_OPTION, $clean, false);
	update_option('bl_events_flush_rewrite', 1, false);
	if (function_exists('bl_reset_content_types_cache')) {
		bl_reset_content_types_cache();
	}
	bl_events_reset_instances_cache();

	return (bool) $ok;
}

/**
 * Sanitize a map of instances.
 *
 * @param mixed $raw
 * @return array<string, array<string, mixed>>
 */
function bl_events_sanitize_instances($raw): array
{
	if (!is_array($raw)) {
		return [];
	}

	$out = [];
	foreach ($raw as $slug => $cfg) {
		if (!is_string($slug) || !is_array($cfg)) {
			continue;
		}
		$slug = sanitize_key($slug);
		if ($slug === '' || in_array($slug, bl_events_reserved_post_types(), true)) {
			continue;
		}
		$out[$slug] = bl_events_sanitize_instance($cfg, $slug);
	}

	return $out;
}

/**
 * @return list<string>
 */
function bl_events_reserved_post_types(): array
{
	return [
		'post',
		'page',
		'attachment',
		'revision',
		'nav_menu_item',
		'custom_css',
		'customize_changeset',
		'oembed_cache',
		'user_request',
		'wp_block',
		'wp_template',
		'wp_template_part',
		'wp_global_styles',
		'wp_navigation',
		'wp_font_family',
		'wp_font_face',
		'bl_form',
		'bl_form_entry',
	];
}

/**
 * @param array<string, mixed> $cfg
 * @return array<string, mixed>
 */
function bl_events_sanitize_instance(array $cfg, string $slug = ''): array
{
	$defaults = bl_events_default_instance_definition();
	$cfg = array_merge($defaults, $cfg);
	$cfg['type'] = 'event';
	$cfg['enabled'] = !array_key_exists('enabled', $cfg) || !empty($cfg['enabled']);
	$cfg['public'] = !array_key_exists('public', $cfg) || !empty($cfg['public']);
	$cfg['hierarchical'] = !empty($cfg['hierarchical']);
	$cfg['wp_categories'] = !empty($cfg['wp_categories']);
	$cfg['wp_tags'] = !empty($cfg['wp_tags']);

	$labels = isset($cfg['labels']) && is_array($cfg['labels']) ? $cfg['labels'] : [];
	$cfg['labels'] = [
		'name' => isset($labels['name']) ? sanitize_text_field((string) $labels['name']) : ($slug !== '' ? ucfirst($slug) . 's' : 'Events'),
		'singular_name' => isset($labels['singular_name']) ? sanitize_text_field((string) $labels['singular_name']) : ($slug !== '' ? ucfirst($slug) : 'Event'),
		'menu_name' => isset($labels['menu_name']) ? sanitize_text_field((string) $labels['menu_name']) : '',
	];
	if ($cfg['labels']['menu_name'] === '') {
		$cfg['labels']['menu_name'] = $cfg['labels']['name'];
	}

	$supports_in = isset($cfg['supports']) && is_array($cfg['supports']) ? $cfg['supports'] : $defaults['supports'];
	$allowed_supports = [
		'title', 'editor', 'thumbnail', 'excerpt', 'revisions', 'page-attributes',
		'custom-fields', 'author', 'comments', 'trackbacks', 'post-formats',
	];
	$supports = [];
	foreach ($supports_in as $s) {
		$s = sanitize_key((string) $s);
		if (in_array($s, $allowed_supports, true)) {
			$supports[] = $s;
		}
	}
	if ($supports === []) {
		$supports = ['title', 'editor', 'custom-fields'];
	}
	if (!in_array('custom-fields', $supports, true)) {
		$supports[] = 'custom-fields';
	}
	$cfg['supports'] = array_values(array_unique($supports));

	$cfg['taxonomies'] = bl_events_sanitize_taxonomies($cfg['taxonomies'] ?? []);
	$cfg['archive'] = bl_events_sanitize_archive($cfg['archive'] ?? []);
	$cfg['admin'] = bl_events_sanitize_admin($cfg['admin'] ?? []);
	$cfg['statuses'] = bl_events_sanitize_statuses($cfg['statuses'] ?? []);
	$cfg['meta'] = bl_events_sanitize_meta_config($cfg['meta'] ?? []);

	return $cfg;
}

/**
 * @param mixed $raw
 * @return array<string, array<string, mixed>>
 */
function bl_events_sanitize_taxonomies($raw): array
{
	if (!is_array($raw)) {
		return [];
	}
	$out = [];
	foreach ($raw as $tax => $args) {
		$tax = sanitize_key((string) $tax);
		if ($tax === '' || !is_array($args)) {
			continue;
		}
		$out[$tax] = [
			'label' => isset($args['label']) ? sanitize_text_field((string) $args['label']) : $tax,
			'singular_label' => isset($args['singular_label']) ? sanitize_text_field((string) $args['singular_label']) : '',
			'url' => isset($args['url']) ? sanitize_title((string) $args['url']) : $tax,
		];
	}

	return $out;
}

/**
 * @param mixed $raw
 * @return array<string, mixed>
 */
function bl_events_sanitize_archive($raw): array
{
	if (!is_array($raw)) {
		$raw = [];
	}
	$design = isset($raw['design']) ? sanitize_key((string) $raw['design']) : 'list';
	if (!in_array($design, ['list', 'grid'], true)) {
		$design = 'list';
	}
	$texts = isset($raw['texts']) && is_array($raw['texts']) ? $raw['texts'] : [];

	return [
		'enabled' => !array_key_exists('enabled', $raw) || !empty($raw['enabled']),
		'slug' => isset($raw['slug']) ? sanitize_title((string) $raw['slug']) : '',
		'design' => $design,
		'category_filter' => !empty($raw['category_filter']),
		'texts' => [
			'heading' => isset($texts['heading']) ? sanitize_text_field((string) $texts['heading']) : '',
			'empty' => isset($texts['empty']) ? sanitize_text_field((string) $texts['empty']) : '',
		],
	];
}

/**
 * @param mixed $raw
 * @return array<string, mixed>
 */
function bl_events_sanitize_admin($raw): array
{
	if (!is_array($raw)) {
		$raw = [];
	}
	$icon = isset($raw['menu_icon']) ? (string) $raw['menu_icon'] : '';
	// Allow dashicons, data URIs, URLs, or inline SVG.
	if ($icon !== '' && stripos($icon, '<svg') === false && strpos($icon, 'dashicons-') !== 0
		&& strpos($icon, 'data:image/') !== 0 && !preg_match('#^https?://#i', $icon)) {
		$icon = sanitize_text_field($icon);
	}

	return [
		'menu_icon' => $icon,
		'menu_position' => isset($raw['menu_position']) ? (int) $raw['menu_position'] : 5,
		'page_title_toggle' => !empty($raw['page_title_toggle']),
	];
}

/**
 * @param mixed $raw
 * @return array<string, array{label: string, color: string}>
 */
function bl_events_sanitize_statuses($raw): array
{
	if (!is_array($raw)) {
		return [];
	}
	$builtin = ['active', 'cancelled', 'postponed', 'custom'];
	$out = [];
	foreach ($raw as $key => $row) {
		$key = sanitize_key((string) $key);
		if ($key === '' || in_array($key, $builtin, true) || !is_array($row)) {
			continue;
		}
		$label = isset($row['label']) ? sanitize_text_field((string) $row['label']) : $key;
		$color = isset($row['color']) ? trim((string) $row['color']) : '';
		if ($color !== '' && !preg_match('/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/', $color)) {
			$color = sanitize_key($color);
		}
		$out[$key] = [
			'label' => $label !== '' ? $label : $key,
			'color' => $color,
		];
	}

	return $out;
}

/**
 * @param mixed $raw
 * @return array{title: string, groups: array<string, array{title: string, fields: array<string, array{type: string, label: string}>}>}
 */
function bl_events_sanitize_meta_config($raw): array
{
	if (!is_array($raw)) {
		return ['title' => '', 'groups' => []];
	}
	$title = isset($raw['title']) ? sanitize_text_field((string) $raw['title']) : '';
	$groups_in = isset($raw['groups']) && is_array($raw['groups']) ? $raw['groups'] : [];
	$groups = [];
	foreach ($groups_in as $group_id => $group) {
		$group_id = sanitize_key((string) $group_id);
		if ($group_id === '' || !is_array($group)) {
			continue;
		}
		$fields_in = isset($group['fields']) && is_array($group['fields']) ? $group['fields'] : [];
		$fields = [];
		foreach ($fields_in as $field_id => $field) {
			$field_id = sanitize_key((string) $field_id);
			if ($field_id === '' || !is_array($field)) {
				continue;
			}
			$type = isset($field['type']) ? sanitize_key((string) $field['type']) : 'text';
			if (!in_array($type, ['text', 'textarea', 'email', 'url'], true)) {
				$type = 'text';
			}
			$label = isset($field['label']) ? sanitize_text_field((string) $field['label']) : $field_id;
			$fields[$field_id] = [
				'type' => $type,
				'label' => $label !== '' ? $label : $field_id,
			];
		}
		if ($fields === []) {
			continue;
		}
		$group_title = isset($group['title']) ? sanitize_text_field((string) $group['title']) : $group_id;
		$groups[$group_id] = [
			'title' => $group_title !== '' ? $group_title : $group_id,
			'fields' => $fields,
		];
	}

	return [
		'title' => $title,
		'groups' => $groups,
	];
}

/**
 * Suggest a unique slug for a new instance.
 */
function bl_events_unique_slug(string $base): string
{
	$base = sanitize_key($base);
	if ($base === '') {
		$base = 'event';
	}
	$existing = bl_events_get_instances(false);
	$reserved = bl_events_reserved_post_types();
	$candidate = $base;
	$i = 2;
	while (isset($existing[$candidate]) || in_array($candidate, $reserved, true) || post_type_exists($candidate)) {
		$candidate = $base . '_' . $i;
		$i++;
		if ($i > 100) {
			$candidate = $base . '_' . wp_generate_password(4, false, false);
			break;
		}
	}

	return $candidate;
}
