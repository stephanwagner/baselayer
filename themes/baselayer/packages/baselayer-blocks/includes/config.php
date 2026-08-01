<?php

defined('ABSPATH') || exit;

const BL_BLOCK_POST_TYPE = 'bl_block';
const BL_BLOCK_CONFIG_META = '_bl_block_config';
const BL_BLOCK_TYPE_META = '_bl_block_type';

/** @return list<string> */
function bl_blocks_definition_types(): array
{
	return ['block', 'page_settings', 'site_settings'];
}

/**
 * @param mixed $type
 */
function bl_blocks_sanitize_definition_type($type): string
{
	$key = sanitize_key((string) $type);
	return in_array($key, bl_blocks_definition_types(), true) ? $key : 'block';
}

/**
 * @return array{active: bool, sidebar_editing: bool, slug: string, description: string, block_icon: string, block_category: string, block_keywords: string, post_types: list<string>, menu_label: string, menu_order: int}
 */
function bl_blocks_default_settings(string $type = 'block'): array
{
	$type = bl_blocks_sanitize_definition_type($type);

	return [
		'active'           => true,
		'sidebar_editing'  => false,
		'slug'             => '',
		'description'      => '',
		'block_icon'       => 'block-default',
		'block_category'   => 'widgets',
		'block_keywords'   => '',
		'post_types'       => $type === 'page_settings' ? ['page'] : [],
		'menu_label'       => '',
		'menu_order'       => 1,
	];
}

/**
 * @return array{fields: list<array<string, mixed>>, settings: array<string, mixed>}
 */
function bl_blocks_default_config(string $type = 'block'): array
{
	return [
		'fields'   => [],
		'settings' => bl_blocks_default_settings($type),
	];
}

/**
 * Sanitize block icon: catalog slug, dashicon, or inline SVG.
 *
 * @param mixed $icon
 */
function bl_blocks_sanitize_block_icon($icon): string
{
	$icon = is_string($icon) ? trim($icon) : '';
	if ($icon === '') {
		return 'block-default';
	}

	if (stripos($icon, '<svg') !== false) {
		$clean = wp_kses($icon, [
			'svg'  => [
				'xmlns'       => true,
				'viewbox'     => true,
				'viewBox'     => true,
				'width'       => true,
				'height'      => true,
				'fill'        => true,
				'aria-hidden' => true,
				'focusable'   => true,
				'role'        => true,
				'class'       => true,
				'style'       => true,
			],
			'path' => [
				'd'            => true,
				'fill'         => true,
				'stroke'       => true,
				'stroke-width' => true,
				'fill-rule'    => true,
				'clip-rule'    => true,
				'opacity'      => true,
			],
			'g'       => ['fill' => true, 'transform' => true, 'opacity' => true],
			'circle'  => ['cx' => true, 'cy' => true, 'r' => true, 'fill' => true],
			'rect'    => [
				'x' => true, 'y' => true, 'width' => true, 'height' => true,
				'rx' => true, 'ry' => true, 'fill' => true,
			],
			'polygon'  => ['points' => true, 'fill' => true],
			'polyline' => ['points' => true, 'fill' => true, 'stroke' => true],
			'line'     => [
				'x1' => true, 'y1' => true, 'x2' => true, 'y2' => true,
				'stroke' => true, 'stroke-width' => true,
			],
		]);

		return $clean !== '' ? $clean : 'block-default';
	}

	if (strpos($icon, 'dashicons-') === 0) {
		$key = sanitize_key($icon);

		return $key !== '' ? $key : 'block-default';
	}

	$key = sanitize_key($icon);

	return $key !== '' ? $key : 'block-default';
}

/**
 * Resolve stored icon for Gutenberg (dashicon slug without prefix, or SVG markup).
 */
function bl_blocks_resolve_gutenberg_icon(string $icon): string
{
	$icon = trim($icon);
	if ($icon === '') {
		return 'block-default';
	}

	if (stripos($icon, '<svg') !== false) {
		return $icon;
	}

	if (strpos($icon, 'dashicons-') === 0) {
		return substr($icon, strlen('dashicons-')) ?: 'block-default';
	}

	if (function_exists('bl_icon_svg_asset_path') && function_exists('bl_svg_code')) {
		$svg = bl_svg_code(bl_icon_svg_asset_path($icon), [
			'width'       => '24',
			'height'      => '24',
			'aria-hidden' => 'true',
			'focusable'   => 'false',
		]);
		if (is_string($svg) && $svg !== '' && stripos($svg, '<svg') !== false) {
			return $svg;
		}
	}

	return $icon;
}

/**
 * Gutenberg block category choices for the Settings select.
 *
 * @return list<array{slug: string, title: string}>
 */
function bl_blocks_block_category_choices(): array
{
	$fallback = [
		['slug' => 'text', 'title' => __('Text', 'baselayer-blocks')],
		['slug' => 'media', 'title' => __('Media', 'baselayer-blocks')],
		['slug' => 'design', 'title' => __('Design', 'baselayer-blocks')],
		['slug' => 'widgets', 'title' => __('Widgets', 'baselayer-blocks')],
		['slug' => 'theme', 'title' => __('Theme', 'baselayer-blocks')],
		['slug' => 'embed', 'title' => __('Embeds', 'baselayer-blocks')],
	];

	if (!function_exists('get_block_categories')) {
		return $fallback;
	}

	$context = class_exists('WP_Block_Editor_Context')
		? new WP_Block_Editor_Context(['name' => 'core/edit-post'])
		: null;
	$raw = get_block_categories($context);
	if (!is_array($raw) || $raw === []) {
		return $fallback;
	}

	$out = [];
	foreach ($raw as $cat) {
		if (!is_array($cat)) {
			continue;
		}
		$slug = sanitize_key((string) ($cat['slug'] ?? ''));
		$title = sanitize_text_field((string) ($cat['title'] ?? $slug));
		if ($slug === '') {
			continue;
		}
		$out[] = [
			'slug'  => $slug,
			'title' => $title !== '' ? $title : $slug,
		];
	}

	return $out !== [] ? $out : $fallback;
}

/**
 * @param mixed $settings
 * @return array<string, mixed>
 */
function bl_blocks_sanitize_settings($settings, string $type = 'block'): array
{
	$type = bl_blocks_sanitize_definition_type($type);
	$defaults = bl_blocks_default_settings($type);
	if (!is_array($settings)) {
		return $defaults;
	}

	$out = $defaults;
	$out['active'] = array_key_exists('active', $settings) ? !empty($settings['active']) : true;
	$out['sidebar_editing'] = $type === 'block' && !empty($settings['sidebar_editing']);
	$out['slug'] = sanitize_key((string) ($settings['slug'] ?? ''));
	$out['description'] = sanitize_textarea_field((string) ($settings['description'] ?? ''));
	$out['block_icon'] = bl_blocks_sanitize_block_icon($settings['block_icon'] ?? 'block-default');
	$out['block_category'] = sanitize_key((string) ($settings['block_category'] ?? 'widgets'));
	if ($out['block_category'] === '') {
		$out['block_category'] = 'widgets';
	}
	$out['block_keywords'] = sanitize_text_field((string) ($settings['block_keywords'] ?? ''));
	$out['menu_label'] = sanitize_text_field((string) ($settings['menu_label'] ?? ''));
	$out['menu_order'] = (int) ($settings['menu_order'] ?? 1);

	$post_types = [];
	if (isset($settings['post_types']) && is_array($settings['post_types'])) {
		foreach ($settings['post_types'] as $pt) {
			$pt = sanitize_key((string) $pt);
			if ($pt === '' || $pt === 'attachment' || !post_type_exists($pt)) {
				continue;
			}
			$post_types[] = $pt;
		}
	}
	$out['post_types'] = array_values(array_unique($post_types));
	if ($type === 'page_settings' && $out['post_types'] === []) {
		$out['post_types'] = ['page'];
	}

	return $out;
}

/**
 * Max nesting depth for repeater fields (repeater → repeater → repeater).
 */
function bl_blocks_repeater_max_depth(): int
{
	return 3;
}

/**
 * Whether a field type is layout-only (no value of its own).
 */
function bl_blocks_is_layout_field_type(string $type): bool
{
	return in_array($type, ['column', 'section', 'tab', 'group'], true);
}

/**
 * Whether a field type is static content (no editable value).
 */
function bl_blocks_is_static_field_type(string $type): bool
{
	return in_array($type, ['divider', 'spacer', 'heading', 'text_block', 'html', 'captcha', 'honeypot'], true);
}

/**
 * Sanitize one field; Blocks handles repeater + layout so nested repeaters survive Forms whitelist.
 *
 * @param mixed $field
 * @param int   $repeater_depth Depth of the nearest ancestor repeater (0 = root).
 * @return array<string, mixed>|null
 */
function bl_blocks_sanitize_field($field, int $repeater_depth = 0): ?array
{
	if (!is_array($field)) {
		return null;
	}

	$type = sanitize_key((string) ($field['type'] ?? 'text'));
	if ($type === '') {
		$type = 'text';
	}

	if ($type === 'repeater') {
		return bl_blocks_sanitize_repeater_field($field, $repeater_depth);
	}

	if (bl_blocks_is_layout_field_type($type)) {
		return bl_blocks_sanitize_layout_field($field, $repeater_depth);
	}

	if (function_exists('bl_forms_sanitize_field')) {
		$clean = bl_forms_sanitize_field($field);
		if ($clean === null) {
			return null;
		}
		// Leaf fields must not keep a children tree.
		unset($clean['children']);

		return $clean;
	}

	return bl_blocks_sanitize_leaf_field_fallback($field);
}

/**
 * @param array<string, mixed> $field
 * @return array<string, mixed>|null
 */
function bl_blocks_sanitize_repeater_field(array $field, int $repeater_depth): ?array
{
	$depth = $repeater_depth + 1;
	if ($depth > bl_blocks_repeater_max_depth()) {
		return null;
	}

	$id = sanitize_key((string) ($field['id'] ?? ''));
	if ($id === '') {
		$id = 'f' . wp_generate_password(8, false, false);
	}
	$name = sanitize_key((string) ($field['name'] ?? ''));
	if ($name === '') {
		$name = $id;
	}

	$min_rows = max(0, (int) ($field['min_rows'] ?? 0));
	$max_rows = max(0, (int) ($field['max_rows'] ?? 0));
	if ($max_rows > 0 && $max_rows < $min_rows) {
		$max_rows = $min_rows;
	}

	$children = [];
	$raw_children = isset($field['children']) && is_array($field['children']) ? $field['children'] : [];
	foreach ($raw_children as $child) {
		if (!is_array($child)) {
			continue;
		}
		$child_type = sanitize_key((string) ($child['type'] ?? ''));
		// No layout containers inside repeater rows.
		if (bl_blocks_is_layout_field_type($child_type)) {
			continue;
		}
		$clean = bl_blocks_sanitize_field($child, $depth);
		if ($clean !== null) {
			$children[] = $clean;
		}
	}

	$design = sanitize_key((string) ($field['design'] ?? 'standard'));
	if (!in_array($design, ['standard', 'outline', 'card'], true)) {
		$design = 'standard';
	}

	$out = [
		'id'            => $id,
		'type'          => 'repeater',
		'label'         => sanitize_text_field((string) ($field['label'] ?? '')),
		'name'          => $name,
		'name_manual'   => !empty($field['name_manual']),
		'hide_label'    => !empty($field['hide_label']),
		'show_title'    => !array_key_exists('show_title', $field) || !empty($field['show_title']),
		'css_class'     => function_exists('bl_forms_sanitize_css_class')
			? bl_forms_sanitize_css_class((string) ($field['css_class'] ?? ''))
			: sanitize_html_class((string) ($field['css_class'] ?? '')),
		'design'        => $design,
		'width'         => sanitize_text_field((string) ($field['width'] ?? '100')),
		'width_custom'  => sanitize_text_field((string) ($field['width_custom'] ?? '')),
		'active'        => !array_key_exists('active', $field) || !empty($field['active']),
		'required'      => !empty($field['required']),
		'description'   => sanitize_textarea_field((string) ($field['description'] ?? '')),
		'min_rows'      => $min_rows,
		'max_rows'      => $max_rows,
		'button_label'  => sanitize_text_field((string) ($field['button_label'] ?? '')),
		'collapsed'     => !empty($field['collapsed']),
		'children'      => $children,
	];

	if (function_exists('bl_forms_attach_conditional_logic')) {
		return bl_forms_attach_conditional_logic($out, $field);
	}

	if (isset($field['conditional_logic']) && is_array($field['conditional_logic'])) {
		$out['conditional_logic'] = $field['conditional_logic'];
	}

	return $out;
}

/**
 * @param array<string, mixed> $field
 * @return array<string, mixed>|null
 */
function bl_blocks_sanitize_layout_field(array $field, int $repeater_depth): ?array
{
	$type = sanitize_key((string) ($field['type'] ?? 'column'));
	$id = sanitize_key((string) ($field['id'] ?? ''));
	if ($id === '') {
		$id = 'f' . wp_generate_password(8, false, false);
	}

	$design = sanitize_key((string) ($field['design'] ?? 'standard'));
	if (!in_array($design, ['standard', 'outline', 'card'], true)) {
		$design = 'standard';
	}

	$out = [
		'id'           => $id,
		'type'         => $type,
		'width'        => sanitize_text_field((string) ($field['width'] ?? '100')),
		'width_custom' => sanitize_text_field((string) ($field['width_custom'] ?? '')),
		'css_class'    => function_exists('bl_forms_sanitize_css_class')
			? bl_forms_sanitize_css_class((string) ($field['css_class'] ?? ''))
			: sanitize_html_class((string) ($field['css_class'] ?? '')),
		'design'       => $design,
		'active'       => !array_key_exists('active', $field) || !empty($field['active']),
		'collapsed'    => !empty($field['collapsed']),
	];

	if ($type === 'section') {
		$out['label'] = sanitize_text_field((string) ($field['label'] ?? ''));
		$out['show_title'] = !array_key_exists('show_title', $field) || !empty($field['show_title']);
	}

	if ($type === 'tab') {
		$out['label'] = sanitize_text_field((string) ($field['label'] ?? ''));
	}

	$children = [];
	$raw_children = isset($field['children']) && is_array($field['children']) ? $field['children'] : [];
	foreach ($raw_children as $child) {
		$clean = bl_blocks_sanitize_field($child, $repeater_depth);
		if ($clean === null) {
			continue;
		}
		$child_type = (string) ($clean['type'] ?? '');
		// One level only — no nested columns/sections/tabs inside layout containers.
		if (bl_blocks_is_layout_field_type($child_type)) {
			continue;
		}
		$children[] = $clean;
	}
	$out['children'] = $children;

	if (function_exists('bl_forms_attach_conditional_logic')) {
		return bl_forms_attach_conditional_logic($out, $field);
	}

	if (isset($field['conditional_logic']) && is_array($field['conditional_logic'])) {
		$out['conditional_logic'] = $field['conditional_logic'];
	}

	return $out;
}

/**
 * Fallback leaf sanitize when Forms is not loaded.
 *
 * @param array<string, mixed> $field
 * @return array<string, mixed>
 */
function bl_blocks_sanitize_leaf_field_fallback(array $field): array
{
	$type = sanitize_key((string) ($field['type'] ?? 'text'));
	$id = sanitize_key((string) ($field['id'] ?? ''));
	if ($id === '') {
		$id = 'f' . wp_generate_password(8, false, false);
	}
	$name = sanitize_key((string) ($field['name'] ?? ''));
	if ($name === '') {
		$name = $id;
	}

	$out = [
		'id'            => $id,
		'type'          => $type !== '' ? $type : 'text',
		'label'         => sanitize_text_field((string) ($field['label'] ?? '')),
		'name'          => $name,
		'name_manual'   => !empty($field['name_manual']),
		'hide_label'    => !empty($field['hide_label']),
		'css_class'     => sanitize_html_class((string) ($field['css_class'] ?? '')),
		'width'         => sanitize_text_field((string) ($field['width'] ?? '100')),
		'width_custom'  => sanitize_text_field((string) ($field['width_custom'] ?? '')),
		'active'        => !array_key_exists('active', $field) || !empty($field['active']),
		'required'      => !empty($field['required']),
		'placeholder'   => sanitize_text_field((string) ($field['placeholder'] ?? '')),
		'description'   => sanitize_textarea_field((string) ($field['description'] ?? '')),
		'default_value' => sanitize_text_field((string) ($field['default_value'] ?? '')),
	];

	if (isset($field['options']) && is_array($field['options'])) {
		$options = [];
		foreach ($field['options'] as $opt) {
			if (!is_array($opt)) {
				continue;
			}
			$label = sanitize_text_field((string) ($opt['label'] ?? ''));
			$value = sanitize_text_field((string) ($opt['value'] ?? $label));
			if ($label === '' && $value === '') {
				continue;
			}
			$options[] = [
				'label' => $label !== '' ? $label : $value,
				'value' => $value !== '' ? $value : $label,
			];
		}
		$out['options'] = $options;
	}

	if (in_array($out['type'], ['select', 'button_group', 'file', 'image', 'page'], true)) {
		$out['multiple'] = !empty($field['multiple']);
	}
	if ($out['type'] === 'page') {
		$out['multiple'] = !empty($field['multiple']);
		unset($out['placeholder'], $out['default_value']);
	}
	if ($out['type'] === 'link') {
		$allowed = ['page', 'url', 'email', 'phone'];
		$raw_types = isset($field['link_types']) && is_array($field['link_types']) ? $field['link_types'] : $allowed;
		$types = [];
		foreach ($raw_types as $lt) {
			$key = sanitize_key((string) $lt);
			if (in_array($key, $allowed, true) && !in_array($key, $types, true)) {
				$types[] = $key;
			}
		}
		if ($types === []) {
			$types = $allowed;
		}
		$out['link_types'] = $types;
		$out['allow_target'] = !array_key_exists('allow_target', $field) || !empty($field['allow_target']);
		unset($out['placeholder'], $out['default_value'], $out['multiple']);
	}

	if (isset($field['conditional_logic']) && is_array($field['conditional_logic'])) {
		$out['conditional_logic'] = $field['conditional_logic'];
	}

	return $out;
}

/**
 * Ensure field names are unique among siblings; repeater children get a fresh scope.
 *
 * @param list<array<string, mixed>> $fields
 * @param array<string, true>        $used
 * @return list<array<string, mixed>>
 */
function bl_blocks_ensure_unique_field_names(array $fields, array &$used = []): array
{
	foreach ($fields as $index => $field) {
		if (!is_array($field)) {
			continue;
		}
		$type = (string) ($field['type'] ?? '');

		if (bl_blocks_is_layout_field_type($type)) {
			$children = isset($field['children']) && is_array($field['children']) ? $field['children'] : [];
			$fields[$index]['children'] = bl_blocks_ensure_unique_field_names($children, $used);
			continue;
		}

		if ($type === 'repeater') {
			if (isset($field['name']) && is_string($field['name']) && $field['name'] !== '') {
				$fields[$index]['name'] = bl_blocks_mint_unique_name($field['name'], $used);
			}
			$child_used = [];
			$children = isset($field['children']) && is_array($field['children']) ? $field['children'] : [];
			$fields[$index]['children'] = bl_blocks_ensure_unique_field_names($children, $child_used);
			continue;
		}

		if (!isset($field['name']) || !is_string($field['name']) || $field['name'] === '') {
			continue;
		}
		$fields[$index]['name'] = bl_blocks_mint_unique_name($field['name'], $used);
	}

	return $fields;
}

/**
 * @param array<string, true> $used
 */
function bl_blocks_mint_unique_name(string $name, array &$used): string
{
	$base = sanitize_key($name);
	if ($base === '') {
		$base = 'field';
	}
	$candidate = $base;
	$suffix = 2;
	while (isset($used[$candidate])) {
		$candidate = $base . '_' . $suffix;
		$suffix++;
	}
	$used[$candidate] = true;

	return $candidate;
}

/**
 * @param mixed  $config
 * @param string $type
 * @return array{fields: list<array<string, mixed>>, settings: array<string, mixed>}
 */
function bl_blocks_sanitize_config($config, string $type = 'block'): array
{
	$type = bl_blocks_sanitize_definition_type($type);
	$defaults = bl_blocks_default_config($type);
	if (!is_array($config)) {
		return $defaults;
	}

	$fields = [];
	if (isset($config['fields']) && is_array($config['fields'])) {
		foreach ($config['fields'] as $field) {
			$clean = bl_blocks_sanitize_field($field, 0);
			if ($clean !== null) {
				$fields[] = $clean;
			}
		}
	}

	$fields = bl_blocks_ensure_unique_field_names($fields);

	$settings = bl_blocks_sanitize_settings($config['settings'] ?? [], $type);

	return [
		'fields'   => $fields,
		'settings' => $settings,
	];
}

/**
 * @return array{fields: list<array<string, mixed>>, settings: array<string, mixed>}
 */
function bl_blocks_get_config(int $post_id): array
{
	$type = bl_blocks_get_definition_type($post_id);
	$raw = get_post_meta($post_id, BL_BLOCK_CONFIG_META, true);
	if (!is_array($raw)) {
		return bl_blocks_default_config($type);
	}

	return bl_blocks_sanitize_config($raw, $type);
}

function bl_blocks_get_definition_type(int $post_id): string
{
	$raw = get_post_meta($post_id, BL_BLOCK_TYPE_META, true);

	return bl_blocks_sanitize_definition_type($raw);
}

/**
 * @param array<string, mixed> $settings
 */
function bl_blocks_definition_slug(int $post_id, array $settings = []): string
{
	if ($settings === []) {
		$config = bl_blocks_get_config($post_id);
		$settings = $config['settings'];
	}
	$slug = sanitize_key((string) ($settings['slug'] ?? ''));
	if ($slug !== '') {
		return $slug;
	}
	$post = get_post($post_id);
	if ($post instanceof WP_Post) {
		$from_title = sanitize_key(sanitize_title($post->post_title));
		if ($from_title !== '') {
			return $from_title;
		}
	}

	return 'block-' . $post_id;
}

/**
 * Next Website tab order: existing site_settings count + 1.
 */
function bl_blocks_next_site_settings_order(int $exclude_id = 0): int
{
	$count = 0;
	foreach (bl_blocks_query_definitions('site_settings', false) as $post) {
		if ($exclude_id > 0 && (int) $post->ID === $exclude_id) {
			continue;
		}
		// Skip unsaved auto-drafts.
		if ($post->post_status === 'auto-draft') {
			continue;
		}
		$count++;
	}

	return $count + 1;
}

/**
 * @return list<WP_Post>
 */
function bl_blocks_query_definitions(string $type, bool $active_only = false): array
{
	$type = bl_blocks_sanitize_definition_type($type);
	// Runtime (blocks / Website / page panels): published only.
	// Admin lists / meta registration: include drafts & pending too.
	$statuses = $active_only
		? ['publish']
		: ['publish', 'draft', 'pending', 'private'];
	$posts = get_posts([
		'post_type'      => BL_BLOCK_POST_TYPE,
		'post_status'    => $statuses,
		'posts_per_page' => -1,
		'orderby'        => 'menu_order title',
		'order'          => 'ASC',
		'meta_key'       => BL_BLOCK_TYPE_META,
		'meta_value'     => $type,
	]);

	if (!$active_only) {
		return $posts;
	}

	$out = [];
	foreach ($posts as $post) {
		$config = bl_blocks_get_config((int) $post->ID);
		if (!empty($config['settings']['active'])) {
			$out[] = $post;
		}
	}

	if ($type === 'site_settings') {
		usort($out, static function (WP_Post $a, WP_Post $b): int {
			$sa = bl_blocks_get_config((int) $a->ID)['settings'];
			$sb = bl_blocks_get_config((int) $b->ID)['settings'];
			$oa = (int) ($sa['menu_order'] ?? 1);
			$ob = (int) ($sb['menu_order'] ?? 1);
			if ($oa === $ob) {
				return strcasecmp($a->post_title, $b->post_title);
			}

			return $oa <=> $ob;
		});
	}

	return $out;
}

/**
 * Force an absolute https URL (strip any scheme).
 * Intentionally loose — any non-empty host-like value is accepted.
 */
function bl_blocks_normalize_https_url(string $raw): string
{
	$trimmed = preg_replace('/^[\s\x{00A0}\x{2000}-\x{200B}\x{FEFF}]+|[\s\x{00A0}\x{2000}-\x{200B}\x{FEFF}]+$/u', '', $raw);
	$trimmed = trim(is_string($trimmed) ? $trimmed : $raw);
	if ($trimmed === '') {
		return '';
	}

	$rest = (string) preg_replace('#^[a-z][a-z0-9+.\-]*:#i', '', $trimmed);
	$rest = (string) preg_replace('#^//#', '', $rest);
	$rest_trim = preg_replace('/^[\s\x{00A0}\x{2000}-\x{200B}\x{FEFF}]+|[\s\x{00A0}\x{2000}-\x{200B}\x{FEFF}]+$/u', '', $rest);
	$rest = trim(is_string($rest_trim) ? $rest_trim : $rest);

	if ($rest === '' || str_starts_with($rest, '/') || str_starts_with($rest, '#') || str_starts_with($rest, '?')) {
		return '';
	}

	if (preg_match('/\s/u', $rest)) {
		return '';
	}

	$host = explode('/', explode('?', explode('#', $rest, 2)[0], 2)[0], 2)[0];
	$host = explode(':', $host, 2)[0];
	if ($host === '' || !preg_match('/[a-z0-9]/i', $host)) {
		return '';
	}

	$path_before = explode('?', explode('#', $rest, 2)[0], 2)[0];
	$out = 'https://' . $rest;

	$clean = esc_url_raw($out);
	if (is_string($clean) && stripos($clean, 'https://') === 0) {
		if (!str_ends_with($path_before, '/')) {
			$stripped = preg_replace('~^(https://[^/?#]+)/$~i', '$1', $clean);
			$clean = is_string($stripped) ? $stripped : $clean;
		}
		return $clean;
	}

	if (!str_ends_with($path_before, '/')) {
		$stripped = preg_replace('~^(https://[^/?#]+)/$~i', '$1', $out);
		$out = is_string($stripped) ? $stripped : $out;
	}

	return $out;
}

/**
 * Soft-normalize a link field URL-type destination.
 * Keeps relative paths, fragments, and existing schemes; bare hosts get https://.
 */
function bl_blocks_normalize_link_href(string $raw): string
{
	$v = trim($raw);
	if ($v === '') {
		return '';
	}

	if (preg_match('~^([/#?]|//|[a-z][a-z0-9+.\-]*:)~i', $v)) {
		return sanitize_text_field($v);
	}

	return sanitize_text_field('https://' . $v);
}

/**
 * Sanitize a stored link field value.
 *
 * @param array<string, mixed> $field
 * @param mixed                $raw
 * @return array{type:string,url:string,title:string,page_id?:int,target?:string}
 */
function bl_blocks_sanitize_link_value(array $field, $raw): array
{
	$allowed = ['page', 'url', 'email', 'phone'];
	$link_types = [];
	if (isset($field['link_types']) && is_array($field['link_types'])) {
		foreach ($field['link_types'] as $lt) {
			$key = sanitize_key((string) $lt);
			if (in_array($key, $allowed, true) && !in_array($key, $link_types, true)) {
				$link_types[] = $key;
			}
		}
	}
	if ($link_types === []) {
		$link_types = $allowed;
	}
	$allow_target = !array_key_exists('allow_target', $field) || !empty($field['allow_target']);

	$raw = is_array($raw) ? $raw : [];
	$type = sanitize_key((string) ($raw['type'] ?? $link_types[0]));
	if (!in_array($type, $link_types, true)) {
		$type = $link_types[0];
	}

	$title = sanitize_text_field((string) ($raw['title'] ?? ''));
	$url = '';
	$page_id = 0;

	if ($type === 'page') {
		$page_id = absint($raw['page_id'] ?? 0);
		if ($page_id > 0) {
			$post = get_post($page_id);
			if ($post && $post->post_type === 'page' && $post->post_status !== 'trash') {
				$url = (string) get_permalink($post);
				if ($title === '') {
					$title = get_the_title($post) ?: '';
				}
			} else {
				$page_id = 0;
			}
		}
		// Allow explicit url from editor hydrate when post lookup fails in REST-only contexts.
		if ($url === '' && !empty($raw['url'])) {
			$url = sanitize_text_field((string) $raw['url']);
		}
	} elseif ($type === 'email') {
		$addr = sanitize_email(preg_replace('/^mailto:/i', '', (string) ($raw['url'] ?? '')));
		$url = $addr !== '' ? 'mailto:' . $addr : '';
		if ($title === '' && $addr !== '') {
			$title = $addr;
		}
	} elseif ($type === 'phone') {
		$num = sanitize_text_field(preg_replace('/^tel:/i', '', (string) ($raw['url'] ?? '')));
		$url = $num !== '' ? 'tel:' . $num : '';
		if ($title === '' && $num !== '') {
			$title = $num;
		}
	} else {
		// Soft href: keep /…, #…, schemes; bare hosts get https://.
		$url = bl_blocks_normalize_link_href((string) ($raw['url'] ?? ''));
		if ($title === '' && $url !== '') {
			$host = wp_parse_url($url, PHP_URL_HOST);
			$title = is_string($host) && $host !== '' ? $host : $url;
		}
	}

	$out = [
		'type'  => $type,
		'url'   => $url,
		'title' => $title,
	];
	if ($type === 'page') {
		$out['page_id'] = $page_id;
	}
	if ($allow_target && in_array($type, ['page', 'url'], true) && (($raw['target'] ?? '') === '_blank')) {
		$out['target'] = '_blank';
	}

	return $out;
}

/**
 * Sanitize a map of field values against a definition's fields.
 *
 * @param list<array<string, mixed>> $fields
 * @param mixed                      $raw
 * @return array<string, mixed>
 */
function bl_blocks_sanitize_values(array $fields, $raw): array
{
	if (!is_array($raw)) {
		$raw = [];
	}

	$values = [];
	foreach ($fields as $field) {
		if (!is_array($field)) {
			continue;
		}
		$type = (string) ($field['type'] ?? '');
		if (bl_blocks_is_layout_field_type($type)) {
			$children = isset($field['children']) && is_array($field['children']) ? $field['children'] : [];
			$values = array_merge($values, bl_blocks_sanitize_values($children, $raw));
			continue;
		}
		if (bl_blocks_is_static_field_type($type)) {
			continue;
		}
		if (isset($field['active']) && empty($field['active'])) {
			continue;
		}
		$name = (string) ($field['name'] ?? '');
		if ($name === '') {
			continue;
		}
		$raw_value = $raw[$name] ?? null;

		if ($type === 'repeater') {
			$children = isset($field['children']) && is_array($field['children']) ? $field['children'] : [];
			$rows_out = [];
			$rows_in = is_array($raw_value) ? $raw_value : [];
			foreach ($rows_in as $row) {
				if (!is_array($row)) {
					continue;
				}
				$rows_out[] = bl_blocks_sanitize_values($children, $row);
			}
			$min_rows = max(0, (int) ($field['min_rows'] ?? 0));
			while (count($rows_out) < $min_rows) {
				$rows_out[] = bl_blocks_sanitize_values($children, []);
			}
			$max_rows = max(0, (int) ($field['max_rows'] ?? 0));
			if ($max_rows > 0 && count($rows_out) > $max_rows) {
				$rows_out = array_slice($rows_out, 0, $max_rows);
			}
			$values[$name] = array_values($rows_out);
			continue;
		}

		if ($type === 'toggle' || $type === 'terms') {
			$values[$name] = !empty($raw_value) ? '1' : '';
			continue;
		}

		if ($type === 'page') {
			$ids = [];
			if (is_array($raw_value)) {
				foreach ($raw_value as $item) {
					$n = absint($item);
					if ($n > 0) {
						$ids[] = $n;
					}
				}
			} elseif (is_scalar($raw_value) && (string) $raw_value !== '') {
				$n = absint($raw_value);
				if ($n > 0) {
					$ids[] = $n;
				}
			}
			$ids = array_values(array_unique($ids));
			if (!empty($field['multiple'])) {
				$values[$name] = $ids;
			} else {
				$values[$name] = $ids[0] ?? 0;
			}
			continue;
		}

		if ($type === 'image' || $type === 'file') {
			$ids = [];
			if (is_array($raw_value)) {
				foreach ($raw_value as $item) {
					$n = absint($item);
					if ($n <= 0 || get_post_type($n) !== 'attachment') {
						continue;
					}
					if ($type === 'image') {
						$mime = (string) get_post_mime_type($n);
						if ($mime === '' || strpos($mime, 'image/') !== 0) {
							continue;
						}
					}
					$ids[] = $n;
				}
			} elseif (is_scalar($raw_value) && (string) $raw_value !== '') {
				$n = absint($raw_value);
				if ($n > 0 && get_post_type($n) === 'attachment') {
					if ($type === 'image') {
						$mime = (string) get_post_mime_type($n);
						if ($mime !== '' && strpos($mime, 'image/') === 0) {
							$ids[] = $n;
						}
					} else {
						$ids[] = $n;
					}
				}
			}
			$ids = array_values(array_unique($ids));
			if (!empty($field['multiple'])) {
				$max_files = max(1, min(50, (int) ($field['max_files'] ?? 10)));
				if (count($ids) > $max_files) {
					$ids = array_slice($ids, 0, $max_files);
				}
				$values[$name] = $ids;
			} else {
				$values[$name] = $ids[0] ?? 0;
			}
			continue;
		}

		if ($type === 'link') {
			$values[$name] = bl_blocks_sanitize_link_value($field, $raw_value);
			continue;
		}

		$multi = $type === 'checkboxes'
			|| ($type === 'button_group' && !empty($field['multiple']))
			|| ($type === 'select' && !empty($field['multiple']));

		if ($multi) {
			$list = [];
			if (is_array($raw_value)) {
				foreach ($raw_value as $item) {
					if (is_scalar($item) && (string) $item !== '') {
						$list[] = sanitize_text_field((string) $item);
					}
				}
			} elseif (is_scalar($raw_value) && (string) $raw_value !== '') {
				$list[] = sanitize_text_field((string) $raw_value);
			}
			$values[$name] = $list;
			continue;
		}

		if (in_array($type, ['textarea', 'html'], true)) {
			$values[$name] = sanitize_textarea_field(is_scalar($raw_value) ? (string) $raw_value : '');
			continue;
		}

		if ($type === 'url') {
			$values[$name] = bl_blocks_normalize_https_url(is_scalar($raw_value) ? (string) $raw_value : '');
			continue;
		}

		$values[$name] = sanitize_text_field(is_scalar($raw_value) ? (string) $raw_value : '');
	}

	return $values;
}
