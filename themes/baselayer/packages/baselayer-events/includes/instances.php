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
		bl_events_default_post_type_key() => $def,
	];
}

/**
 * Default CPT key for the seeded Event type (namespaced; not the public URL slug).
 */
function bl_events_default_post_type_key(): string
{
	return 'bl_events';
}

/**
 * Build a unique internal CPT key from a label or URL stem (prefixed with bl_, max 20 chars).
 */
function bl_events_make_internal_key(string $stem): string
{
	$stem = sanitize_key($stem);
	$stem = preg_replace('/^bl_+/', '', $stem) ?: '';
	if ($stem === '' || $stem === 'event' || $stem === 'events') {
		return bl_events_unique_slug(bl_events_default_post_type_key());
	}

	// Prefer bl_{stem}; trim so total length stays within WP’s 20-char CPT limit.
	$max_stem = 20 - 3; // "bl_"
	if (strlen($stem) > $max_stem) {
		$stem = substr($stem, 0, $max_stem);
		$stem = rtrim($stem, '_-');
	}
	if ($stem === '') {
		return bl_events_unique_slug(bl_events_default_post_type_key());
	}

	return bl_events_unique_slug('bl_' . $stem);
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
 * Fixed supports for all event types (not user-configurable).
 *
 * @return list<string>
 */
function bl_events_forced_supports(): array
{
	return [
		'title',
		'editor',
		'thumbnail',
		'excerpt',
		'revisions',
		'author',
		'custom-fields',
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
	$cfg['enabled'] = true;
	$cfg['public'] = true;
	$cfg['hierarchical'] = false;
	$cfg['wp_categories'] = false;
	$cfg['wp_tags'] = false;

	$labels = isset($cfg['labels']) && is_array($cfg['labels']) ? $cfg['labels'] : [];
	$cfg['labels'] = [
		'name' => isset($labels['name']) ? sanitize_text_field((string) $labels['name']) : ($slug !== '' ? ucfirst($slug) . 's' : 'Events'),
		'singular_name' => isset($labels['singular_name']) ? sanitize_text_field((string) $labels['singular_name']) : ($slug !== '' ? ucfirst($slug) : 'Event'),
		'menu_name' => isset($labels['menu_name']) ? sanitize_text_field((string) $labels['menu_name']) : '',
	];
	if ($cfg['labels']['menu_name'] === '') {
		$cfg['labels']['menu_name'] = $cfg['labels']['name'];
	}

	$cfg['supports'] = bl_events_forced_supports();

	$cfg['archive'] = bl_events_sanitize_archive($cfg['archive'] ?? []);
	$cfg['admin'] = bl_events_sanitize_admin($cfg['admin'] ?? []);
	$cfg['statuses'] = bl_events_sanitize_statuses_config($cfg['statuses'] ?? []);
	$cfg['meta'] = bl_events_sanitize_meta_config($cfg['meta'] ?? []);
	$cfg['taxonomies'] = $slug !== ''
		? bl_events_build_category_taxonomies($slug, $cfg)
		: [];

	return $cfg;
}

/**
 * Per-type category taxonomy slug (e.g. bl_events → bl_events_category).
 */
function bl_events_category_taxonomy(string $post_type): string
{
	$post_type = sanitize_key($post_type);

	return $post_type !== '' ? $post_type . '_category' : '';
}

/**
 * Taxonomy config map for one event type (theme + instance storage).
 *
 * @param array<string, mixed> $cfg Sanitized instance (needs archive).
 * @return array<string, array<string, mixed>>
 */
function bl_events_build_category_taxonomies(string $post_type, array $cfg): array
{
	$tax = bl_events_category_taxonomy($post_type);
	if ($tax === '') {
		return [];
	}

	$archive = isset($cfg['archive']) && is_array($cfg['archive']) ? $cfg['archive'] : [];
	$archive_slug = !empty($archive['slug'])
		? sanitize_title((string) $archive['slug'])
		: sanitize_title($post_type);
	if ($archive_slug === '') {
		$archive_slug = $post_type;
	}

	return [
		$tax => [
			'label' => 'Categories',
			'singular_label' => 'Category',
			'url' => $archive_slug . '-category',
			'hierarchical' => true,
			'show_admin_column' => true,
			'show_in_rest' => true,
			'public' => true,
			'show_ui' => true,
		],
	];
}

/**
 * Args for register_taxonomy() (standalone plugin path).
 *
 * @param array<string, mixed> $cfg
 * @return array<string, mixed>
 */
function bl_events_category_taxonomy_args(string $post_type, array $cfg): array
{
	$taxonomies = bl_events_build_category_taxonomies($post_type, $cfg);
	$tax = bl_events_category_taxonomy($post_type);
	$row = $taxonomies[$tax] ?? [];
	$url = isset($row['url']) ? sanitize_title((string) $row['url']) : ($post_type . '-category');

	$label = __('Categories', 'baselayer-events');
	$singular = __('Category', 'baselayer-events');

	return [
		'labels' => [
			'name' => $label,
			'singular_name' => $singular,
			'menu_name' => $label,
			'search_items' => __('Search categories', 'baselayer-events'),
			'all_items' => __('All categories', 'baselayer-events'),
			'parent_item' => __('Parent category', 'baselayer-events'),
			'parent_item_colon' => __('Parent category:', 'baselayer-events'),
			'edit_item' => __('Edit category', 'baselayer-events'),
			'view_item' => __('View category', 'baselayer-events'),
			'update_item' => __('Update category', 'baselayer-events'),
			'add_new_item' => __('Add new category', 'baselayer-events'),
			'new_item_name' => __('New category name', 'baselayer-events'),
			'not_found' => __('No categories found.', 'baselayer-events'),
			'no_terms' => __('No categories', 'baselayer-events'),
			'filter_by_item' => __('Filter by category', 'baselayer-events'),
		],
		'public' => true,
		'hierarchical' => true,
		'show_ui' => true,
		'show_admin_column' => true,
		'show_in_rest' => true,
		'show_in_nav_menus' => true,
		'rewrite' => ['slug' => $url],
		'query_var' => true,
	];
}

/**
 * @param mixed $raw
 * @return array<string, array<string, mixed>>
 */
function bl_events_sanitize_taxonomies($raw): array
{
	unset($raw);

	// Built in bl_events_sanitize_instance via bl_events_build_category_taxonomies().
	return [];
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

	$posts_per_page = null;
	if (array_key_exists('posts_per_page', $raw) && $raw['posts_per_page'] !== '' && $raw['posts_per_page'] !== null) {
		$n = (int) $raw['posts_per_page'];
		if ($n > 0) {
			$posts_per_page = min(100, $n);
		}
	}

	return [
		'enabled' => !array_key_exists('enabled', $raw) || !empty($raw['enabled']),
		'slug' => isset($raw['slug']) ? sanitize_title((string) $raw['slug']) : '',
		'design' => $design,
		'category_filter' => !empty($raw['category_filter']),
		'month_filter' => !empty($raw['month_filter']),
		'posts_per_page' => $posts_per_page,
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
	// Allow dashicons, data URIs, URLs, inline SVG, or icon catalog names.
	if ($icon !== '' && stripos($icon, '<svg') === false && strpos($icon, 'dashicons-') !== 0
		&& strpos($icon, 'data:image/') !== 0 && !preg_match('#^https?://#i', $icon)) {
		$icon = preg_replace('/[^a-z0-9_-]/i', '', sanitize_text_field($icon)) ?: '';
	}

	return [
		'menu_icon' => $icon,
		'menu_position' => isset($raw['menu_position']) ? (int) $raw['menu_position'] : 5,
		'page_title_toggle' => !empty($raw['page_title_toggle']),
	];
}

/**
 * Sanitize the status items map (id => label/color).
 *
 * @param mixed $raw
 * @return array<string, array{label: string, color: string}>
 */
function bl_events_sanitize_statuses($raw): array
{
	if (!is_array($raw)) {
		return [];
	}
	$reserved = ['active', 'custom', 'enabled', 'items'];
	$out = [];
	foreach ($raw as $key => $row) {
		$key = sanitize_key((string) $key);
		if ($key === '' || in_array($key, $reserved, true) || !is_array($row)) {
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
 * Sanitize statuses config (`enabled` + `items`), matching metadata shape.
 *
 * @param mixed $raw
 * @return array{enabled: bool, items: array<string, array{label: string, color: string}>}
 */
function bl_events_sanitize_statuses_config($raw): array
{
	if (!is_array($raw)) {
		return ['enabled' => true, 'items' => []];
	}

	$enabled = array_key_exists('enabled', $raw) ? !empty($raw['enabled']) : true;
	if (isset($raw['items']) && is_array($raw['items'])) {
		$items = bl_events_sanitize_statuses($raw['items']);
	} else {
		$items = bl_events_sanitize_statuses($raw);
	}

	return [
		'enabled' => $enabled,
		'items' => $items,
	];
}

/**
 * Allowed metadata field types for Event types schema.
 *
 * @return list<string>
 */
function bl_events_meta_field_types(): array
{
	return ['text', 'textarea', 'number', 'email', 'phone', 'url', 'select'];
}

/**
 * @param mixed $raw
 * @return array{title: string, groups: array<string, array{title: string, fields: array<string, array<string, mixed>>}>}
 */
function bl_events_sanitize_meta_config($raw): array
{
	if (!is_array($raw)) {
		return ['enabled' => true, 'title' => '', 'groups' => []];
	}
	$enabled = !array_key_exists('enabled', $raw) || !empty($raw['enabled']);
	$title = isset($raw['title']) ? sanitize_text_field((string) $raw['title']) : '';
	$groups_in = isset($raw['groups']) && is_array($raw['groups']) ? $raw['groups'] : [];
	$allowed = bl_events_meta_field_types();
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
			if (!in_array($type, $allowed, true)) {
				$type = 'text';
			}
			$label = isset($field['label']) ? sanitize_text_field((string) $field['label']) : $field_id;
			$row = [
				'type' => $type,
				'label' => $label !== '' ? $label : $field_id,
			];
			if (isset($field['help']) && is_string($field['help']) && trim($field['help']) !== '') {
				$row['help'] = sanitize_text_field($field['help']);
			}
			if (isset($field['placeholder']) && is_string($field['placeholder']) && trim($field['placeholder']) !== '') {
				$row['placeholder'] = sanitize_text_field($field['placeholder']);
			}
			if ($type === 'select' && isset($field['options']) && is_array($field['options'])) {
				$options = [];
				foreach ($field['options'] as $opt) {
					if (!is_array($opt)) {
						continue;
					}
					$ovalue = isset($opt['value']) ? sanitize_text_field((string) $opt['value']) : '';
					if ($ovalue === '') {
						continue;
					}
					$olabel = isset($opt['label']) ? sanitize_text_field((string) $opt['label']) : $ovalue;
					$options[] = [
						'label' => $olabel !== '' ? $olabel : $ovalue,
						'value' => $ovalue,
					];
				}
				if ($options !== []) {
					$row['options'] = $options;
				}
			}
			if (array_key_exists('default_value', $field)) {
				if (is_scalar($field['default_value']) && (string) $field['default_value'] !== '') {
					$row['default_value'] = sanitize_text_field((string) $field['default_value']);
				}
			}
			$fields[$field_id] = $row;
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
		'enabled' => $enabled,
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
		$base = bl_events_default_post_type_key();
	}
	// CPT keys must be ≤ 20 characters (WordPress limit).
	if (strlen($base) > 20) {
		$base = substr($base, 0, 20);
		$base = rtrim($base, '_-');
		if ($base === '') {
			$base = bl_events_default_post_type_key();
		}
	}
	$existing = bl_events_get_instances(false);
	$reserved = bl_events_reserved_post_types();
	$candidate = $base;
	$i = 2;
	while (isset($existing[$candidate]) || in_array($candidate, $reserved, true) || post_type_exists($candidate)) {
		$suffix = '_' . $i;
		$trim = 20 - strlen($suffix);
		$stem = $trim > 0 ? substr($base, 0, $trim) : bl_events_default_post_type_key();
		$stem = rtrim($stem, '_-');
		$candidate = ($stem !== '' ? $stem : bl_events_default_post_type_key()) . $suffix;
		$i++;
		if ($i > 100) {
			$candidate = 'bl_e_' . wp_generate_password(4, false, false);
			break;
		}
	}

	return $candidate;
}
