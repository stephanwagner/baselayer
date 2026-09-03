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
 * @return array{active: bool, sidebar_editing: bool, content_editing: bool, content_placement: string, supports_inner_blocks: bool, inner_blocks_allowed: string, inner_blocks_template: string, parent: string, align: string, slug: string, description: string, block_icon: string, block_category: string, block_keywords: string, post_types: list<string>, menu_label: string, menu_order: int}
 */
function bl_blocks_default_settings(string $type = 'block'): array
{
	$type = bl_blocks_sanitize_definition_type($type);

	return [
		'active'                 => true,
		'sidebar_editing'        => true,
		'content_editing'        => false,
		'content_placement'      => 'metabox',
		'supports_inner_blocks'  => false,
		'inner_blocks_allowed'   => '',
		'inner_blocks_template'  => '',
		'parent'                 => '',
		'align'                  => '',
		'slug'                   => '',
		'description'            => '',
		'block_icon'             => 'block-default',
		'block_category'         => 'design',
		'block_keywords'         => '',
		'post_types'             => $type === 'page_settings' ? ['page'] : [],
		'menu_label'             => '',
		'menu_order'             => 1,
	];
}

/**
 * Sanitize parent block names (comma-separated or list). Empty → ''.
 *
 * @param mixed $raw
 */
function bl_blocks_sanitize_parent_blocks($raw): string
{
	return bl_blocks_sanitize_inner_blocks_allowed($raw);
}

/**
 * Sanitize align supports: comma-separated wide/full (and optionally left/center/right).
 *
 * @param mixed $raw
 */
function bl_blocks_sanitize_align_supports($raw): string
{
	$allowed = ['wide', 'full', 'left', 'center', 'right'];
	$parts = [];
	if (is_string($raw)) {
		$parts = preg_split('/[\s,]+/', $raw) ?: [];
	} elseif (is_array($raw)) {
		foreach ($raw as $part) {
			if (is_string($part) || is_numeric($part)) {
				$parts[] = (string) $part;
			}
		}
	}

	$out = [];
	foreach ($parts as $part) {
		$key = sanitize_key(trim((string) $part));
		if ($key !== '' && in_array($key, $allowed, true)) {
			$out[] = $key;
		}
	}

	return implode(', ', array_values(array_unique($out)));
}

/**
 * @return list<string>
 */
function bl_blocks_parse_align_supports(string $align): array
{
	$sanitized = bl_blocks_sanitize_align_supports($align);
	if ($sanitized === '') {
		return [];
	}

	return array_values(array_filter(array_map('trim', explode(',', $sanitized))));
}

/**
 * Sanitize Gutenberg block names for InnerBlocks allow lists.
 *
 * Accepts a comma-separated string or list of strings. Empty input → ''.
 *
 * @param mixed $raw
 */
function bl_blocks_sanitize_inner_blocks_allowed($raw): string
{
	$names = [];
	if (is_string($raw)) {
		$parts = preg_split('/[\s,]+/', $raw) ?: [];
		foreach ($parts as $part) {
			$names[] = $part;
		}
	} elseif (is_array($raw)) {
		foreach ($raw as $part) {
			if (is_string($part)) {
				$names[] = $part;
			}
		}
	}

	$out = [];
	foreach ($names as $name) {
		$name = strtolower(trim((string) $name));
		if ($name === '' || !preg_match('/^[a-z0-9-]+\/[a-z0-9-]+$/', $name)) {
			continue;
		}
		$out[] = $name;
	}

	return implode(', ', array_values(array_unique($out)));
}

/**
 * Sanitize an InnerBlocks template (JSON string or array of [blockName, attrs]).
 *
 * Empty / invalid → ''.
 *
 * @param mixed $raw
 */
function bl_blocks_sanitize_inner_blocks_template($raw): string
{
	if (is_string($raw)) {
		$raw = trim($raw);
		if ($raw === '') {
			return '';
		}
		$decoded = json_decode($raw);
		if (!is_array($decoded)) {
			return '';
		}
		$raw = $decoded;
	}

	if (!is_array($raw) || $raw === []) {
		return '';
	}

	$template = [];
	foreach ($raw as $entry) {
		if (!is_array($entry) && !is_object($entry)) {
			continue;
		}
		$entry = (array) $entry;
		if ($entry === []) {
			continue;
		}
		$name = bl_blocks_sanitize_inner_blocks_allowed((string) ($entry[0] ?? ''));
		if ($name === '' || strpos($name, ',') !== false) {
			continue;
		}
		$attrs = new stdClass();
		if (isset($entry[1]) && (is_array($entry[1]) || is_object($entry[1]))) {
			// Empty list from json_decode(..., true) of {} → keep as object for Gutenberg.
			if (is_array($entry[1]) && $entry[1] === []) {
				$attrs = new stdClass();
			} else {
				$encoded = wp_json_encode($entry[1]);
				$decoded_attrs = is_string($encoded) ? json_decode($encoded) : null;
				if (is_object($decoded_attrs)) {
					$attrs = $decoded_attrs;
				} elseif (is_array($decoded_attrs) && $decoded_attrs !== []) {
					$attrs = $decoded_attrs;
				}
			}
		}
		$template[] = [$name, $attrs];
	}

	if ($template === []) {
		return '';
	}

	$json = wp_json_encode($template, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
	return is_string($json) ? $json : '';
}

/**
 * Parse stored allow-list string into a list of block names.
 *
 * @return list<string>
 */
function bl_blocks_parse_inner_blocks_allowed(string $allowed): array
{
	$sanitized = bl_blocks_sanitize_inner_blocks_allowed($allowed);
	if ($sanitized === '') {
		return [];
	}

	return array_values(array_filter(array_map('trim', explode(',', $sanitized))));
}

/**
 * Parse stored template JSON into a Gutenberg template array.
 *
 * @return list<array{0: string, 1: object|array<string, mixed>}>|null
 */
function bl_blocks_parse_inner_blocks_template(string $template): ?array
{
	$sanitized = bl_blocks_sanitize_inner_blocks_template($template);
	if ($sanitized === '') {
		return null;
	}

	$decoded = json_decode($sanitized);
	if (!is_array($decoded) || $decoded === []) {
		return null;
	}

	$out = [];
	foreach ($decoded as $entry) {
		if (!is_array($entry) || !isset($entry[0]) || !is_string($entry[0])) {
			continue;
		}
		if (!isset($entry[1])) {
			$attrs = new stdClass();
		} elseif (is_object($entry[1])) {
			$attrs = $entry[1];
		} elseif (is_array($entry[1]) && $entry[1] === []) {
			$attrs = new stdClass();
		} elseif (is_array($entry[1])) {
			$attrs = $entry[1];
		} else {
			$attrs = new stdClass();
		}
		$out[] = [$entry[0], $attrs];
	}

	return $out !== [] ? $out : null;
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
	// Sidebar editing defaults on for block + page settings (same pattern as active).
	if (in_array($type, ['block', 'page_settings'], true)) {
		$out['sidebar_editing'] = array_key_exists('sidebar_editing', $settings)
			? !empty($settings['sidebar_editing'])
			: true;
	} else {
		$out['sidebar_editing'] = false;
	}
	$out['content_editing'] = $type === 'page_settings' && !empty($settings['content_editing']);
	if ($type === 'page_settings') {
		$placement = sanitize_key((string) ($settings['content_placement'] ?? 'metabox'));
		$out['content_placement'] = $placement === 'after_title' ? 'after_title' : 'metabox';
	} else {
		unset($out['content_placement']);
	}
	$out['supports_inner_blocks'] = $type === 'block' && !empty($settings['supports_inner_blocks']);
	$out['inner_blocks_allowed'] = $type === 'block' && $out['supports_inner_blocks']
		? bl_blocks_sanitize_inner_blocks_allowed($settings['inner_blocks_allowed'] ?? '')
		: '';
	$out['inner_blocks_template'] = $type === 'block' && $out['supports_inner_blocks']
		? bl_blocks_sanitize_inner_blocks_template($settings['inner_blocks_template'] ?? '')
		: '';
	$out['parent'] = $type === 'block'
		? bl_blocks_sanitize_parent_blocks($settings['parent'] ?? '')
		: '';
	$out['align'] = $type === 'block'
		? bl_blocks_sanitize_align_supports($settings['align'] ?? '')
		: '';
	$out['slug'] = sanitize_key((string) ($settings['slug'] ?? ''));
	$out['description'] = sanitize_textarea_field((string) ($settings['description'] ?? ''));
	$out['block_icon'] = bl_blocks_sanitize_block_icon($settings['block_icon'] ?? 'block-default');
	$out['block_category'] = sanitize_key((string) ($settings['block_category'] ?? 'design'));
	if ($out['block_category'] === '') {
		$out['block_category'] = 'design';
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
	return in_array($type, ['divider', 'spacer', 'row_break', 'heading', 'text_block', 'html', 'captcha', 'honeypot'], true);
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

	// Blocks-only leaf: Forms coerces unknown types to text.
	if ($type === 'icon') {
		return bl_blocks_sanitize_icon_field($field);
	}

	if ($type === 'wysiwyg') {
		return bl_blocks_sanitize_wysiwyg_field($field);
	}

	if ($type === 'range') {
		return bl_blocks_sanitize_range_field($field);
	}

	if (function_exists('bl_forms_sanitize_field')) {
		// Numeric widths outside Forms presets (e.g. 20/80) → custom % so packing survives import.
		if (isset($field['width']) && is_scalar($field['width'])) {
			$w = sanitize_key((string) $field['width']);
			$presets = function_exists('bl_forms_width_presets')
				? bl_forms_width_presets()
				: ['100', '75', '66', '50', '33', '25', 'auto'];
			if ($w !== '' && $w !== 'custom' && !in_array($w, $presets, true) && ctype_digit($w)) {
				$n = (int) $w;
				if ($n > 0 && $n < 100) {
					$field['width'] = 'custom';
					$field['width_custom'] = $n . '%';
				}
			}
		}
		$clean = bl_forms_sanitize_field($field);
		if ($clean === null) {
			return null;
		}
		// Leaf fields must not keep a children tree.
		unset($clean['children']);

		// Block field UI only supports h2–h4 headings (Forms keep h1–h6).
		if (($clean['type'] ?? '') === 'heading') {
			$level = strtolower((string) ($clean['level'] ?? 'h4'));
			$clean['level'] = in_array($level, ['h2', 'h3', 'h4'], true) ? $level : 'h4';
		}

		// ACF-parity mime restriction for media library pickers (e.g. mp4,webm).
		if (in_array(($clean['type'] ?? ''), ['file', 'image'], true)) {
			$mime_types = sanitize_text_field((string) ($field['mime_types'] ?? ''));
			if ($mime_types !== '') {
				$clean['mime_types'] = $mime_types;
			}
		}

		// Allow HTML (or SVG) on specific textareas (e.g. notice content, custom channel SVG).
		if (($clean['type'] ?? '') === 'textarea' && array_key_exists('allow_html', $field)) {
			$allow = $field['allow_html'];
			if ($allow === true || $allow === 1 || $allow === '1' || $allow === 'post') {
				$clean['allow_html'] = true;
			} elseif ($allow === 'svg') {
				$clean['allow_html'] = 'svg';
			}
		}

		return $clean;
	}

	return bl_blocks_sanitize_leaf_field_fallback($field);
}

/**
 * Sanitize blocks-only icon field definition (theme catalog slug).
 *
 * @param array<string, mixed> $field
 * @return array<string, mixed>
 */
function bl_blocks_sanitize_icon_field(array $field): array
{
	$id = sanitize_key((string) ($field['id'] ?? ''));
	if ($id === '') {
		$id = 'f' . wp_generate_password(8, false, false);
	}
	$name = sanitize_key((string) ($field['name'] ?? ''));
	if ($name === '') {
		$name = $id;
	}

	$width = ['width' => sanitize_text_field((string) ($field['width'] ?? '100')), 'width_custom' => sanitize_text_field((string) ($field['width_custom'] ?? ''))];
	if (function_exists('bl_forms_sanitize_width')) {
		$width = bl_forms_sanitize_width($field);
	}

	$out = [
		'id'            => $id,
		'type'          => 'icon',
		'label'         => sanitize_text_field((string) ($field['label'] ?? '')),
		'name'          => $name,
		'name_manual'   => !empty($field['name_manual']) || $name !== '',
		'hide_label'    => !empty($field['hide_label']),
		'css_class'     => function_exists('bl_forms_sanitize_css_class')
			? bl_forms_sanitize_css_class((string) ($field['css_class'] ?? ''))
			: sanitize_html_class((string) ($field['css_class'] ?? '')),
		'width'         => $width['width'],
		'width_custom'  => $width['width_custom'],
		'active'        => function_exists('bl_forms_field_is_active')
			? bl_forms_field_is_active($field)
			: (!array_key_exists('active', $field) || !empty($field['active'])),
		'required'      => !empty($field['required']),
		'description'   => sanitize_textarea_field((string) ($field['description'] ?? '')),
		'default_value' => sanitize_key((string) ($field['default_value'] ?? '')),
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
 * Sanitize blocks-only WYSIWYG field definition.
 *
 * @param array<string, mixed> $field
 * @return array<string, mixed>
 */
function bl_blocks_sanitize_wysiwyg_field(array $field): array
{
	$id = sanitize_key((string) ($field['id'] ?? ''));
	if ($id === '') {
		$id = 'f' . wp_generate_password(8, false, false);
	}
	$name = sanitize_key((string) ($field['name'] ?? ''));
	if ($name === '') {
		$name = $id;
	}

	$width = ['width' => sanitize_text_field((string) ($field['width'] ?? '100')), 'width_custom' => sanitize_text_field((string) ($field['width_custom'] ?? ''))];
	if (function_exists('bl_forms_sanitize_width')) {
		$width = bl_forms_sanitize_width($field);
	}

	$toolbar = sanitize_key((string) ($field['toolbar'] ?? 'basic'));
	if (!in_array($toolbar, ['basic', 'standard', 'full', 'custom'], true)) {
		$toolbar = 'basic';
	}

	$out = [
		'id'            => $id,
		'type'          => 'wysiwyg',
		'label'         => sanitize_text_field((string) ($field['label'] ?? '')),
		'name'          => $name,
		'name_manual'   => !empty($field['name_manual']) || $name !== '',
		'hide_label'    => !empty($field['hide_label']),
		'css_class'     => function_exists('bl_forms_sanitize_css_class')
			? bl_forms_sanitize_css_class((string) ($field['css_class'] ?? ''))
			: sanitize_html_class((string) ($field['css_class'] ?? '')),
		'width'         => $width['width'],
		'width_custom'  => $width['width_custom'],
		'active'        => function_exists('bl_forms_field_is_active')
			? bl_forms_field_is_active($field)
			: (!array_key_exists('active', $field) || !empty($field['active'])),
		'required'      => !empty($field['required']),
		'description'   => sanitize_textarea_field((string) ($field['description'] ?? '')),
		'default_value'       => wp_kses_post((string) ($field['default_value'] ?? '')),
		'toolbar'             => $toolbar,
		'allow_code_editing'  => !empty($field['allow_code_editing']),
	];

	$height = isset($field['height']) ? (int) $field['height'] : 0;
	// TinyMCE will not shrink the edit area below 100px.
	if ($height >= 100) {
		$out['height'] = $height;
	}

	if ($toolbar === 'custom') {
		$custom = strtolower((string) ($field['toolbar_custom'] ?? ''));
		$custom = preg_replace('/[^a-z0-9_,|\s-]/', '', $custom) ?? '';
		$out['toolbar_custom'] = trim(preg_replace('/\s+/', '', $custom) ?? '');
	}

	if (function_exists('bl_forms_attach_conditional_logic')) {
		return bl_forms_attach_conditional_logic($out, $field);
	}

	if (isset($field['conditional_logic']) && is_array($field['conditional_logic'])) {
		$out['conditional_logic'] = $field['conditional_logic'];
	}

	return $out;
}

/**
 * Sanitize one numeric endpoint for a range field.
 *
 * @param mixed $raw
 */
function bl_blocks_sanitize_range_endpoint($raw): string
{
	if (!is_scalar($raw) || (string) $raw === '') {
		return '';
	}

	$value = function_exists('bl_forms_sanitize_optional_number')
		? bl_forms_sanitize_optional_number((string) $raw)
		: (is_numeric($raw) ? (string) $raw : '');

	return is_numeric($value) ? $value : '';
}

/**
 * Sanitize prefix/suffix while keeping leading/trailing spaces.
 *
 * @param mixed $raw
 */
function bl_blocks_sanitize_affix($raw): string
{
	if (function_exists('bl_forms_sanitize_affix')) {
		return bl_forms_sanitize_affix($raw);
	}

	$str = (string) $raw;
	if ($str === '') {
		return '';
	}

	$leading = preg_match('/^\s+/u', $str, $m) ? (string) $m[0] : '';
	$trailing = preg_match('/\s+$/u', $str, $m) ? (string) $m[0] : '';
	$core = sanitize_text_field($str);
	if ($core === '') {
		return '';
	}

	$leading = preg_replace('/\s/u', ' ', $leading) ?? '';
	$trailing = preg_replace('/\s/u', ' ', $trailing) ?? '';

	return $leading . $core . $trailing;
}

/**
 * @param array<string, mixed> $field
 */
function bl_blocks_range_mode(array $field): string
{
	return (($field['mode'] ?? '') === 'single') ? 'single' : 'range';
}

/**
 * Clamp a single numeric value to field min/max.
 *
 * @param array<string, mixed> $field
 */
function bl_blocks_clamp_range_single(array $field, string $value): string
{
	if ($value === '' || !is_numeric($value)) {
		return $value;
	}

	$min = isset($field['min']) ? bl_blocks_sanitize_range_endpoint($field['min']) : '';
	$max = isset($field['max']) ? bl_blocks_sanitize_range_endpoint($field['max']) : '';
	$v = (float) $value;
	if ($min !== '' && is_numeric($min) && $v < (float) $min) {
		$value = $min;
		$v = (float) $value;
	}
	if ($max !== '' && is_numeric($max) && $v > (float) $max) {
		$value = $max;
	}

	return $value;
}

/**
 * Clamp from/to to field min/max and ensure from <= to.
 *
 * @param array<string, mixed> $field
 * @return array{from: string, to: string}
 */
function bl_blocks_clamp_range_pair(array $field, string $from, string $to): array
{
	$min = isset($field['min']) ? bl_blocks_sanitize_range_endpoint($field['min']) : '';
	$max = isset($field['max']) ? bl_blocks_sanitize_range_endpoint($field['max']) : '';

	$clamp = static function (string $n) use ($min, $max): string {
		if ($n === '' || !is_numeric($n)) {
			return $n;
		}
		$v = (float) $n;
		if ($min !== '' && is_numeric($min) && $v < (float) $min) {
			$n = $min;
			$v = (float) $n;
		}
		if ($max !== '' && is_numeric($max) && $v > (float) $max) {
			$n = $max;
		}

		return $n;
	};

	$from = $clamp($from);
	$to = $clamp($to);

	if ($from !== '' && $to !== '' && is_numeric($from) && is_numeric($to) && (float) $from > (float) $to) {
		[$from, $to] = [$to, $from];
	}

	return [
		'from' => $from,
		'to'   => $to,
	];
}

/**
 * @param mixed $raw
 * @return array{from: string, to: string}
 */
function bl_blocks_sanitize_range_value(array $field, $raw): array
{
	$from = '';
	$to = '';
	if (is_array($raw)) {
		$from = bl_blocks_sanitize_range_endpoint($raw['from'] ?? '');
		$to = bl_blocks_sanitize_range_endpoint($raw['to'] ?? '');
	}

	return bl_blocks_clamp_range_pair($field, $from, $to);
}

/**
 * Sanitize stored/editor value for a range field (scalar or from/to pair).
 *
 * @param array<string, mixed> $field
 * @param mixed $raw
 * @return array{from: string, to: string}|string
 */
function bl_blocks_sanitize_range_stored_value(array $field, $raw)
{
	if (bl_blocks_range_mode($field) === 'single') {
		$value = '';
		if (is_array($raw)) {
			$value = bl_blocks_sanitize_range_endpoint($raw['from'] ?? ($raw['value'] ?? ''));
		} else {
			$value = bl_blocks_sanitize_range_endpoint($raw);
		}

		return bl_blocks_clamp_range_single($field, $value);
	}

	return bl_blocks_sanitize_range_value($field, $raw);
}

/**
 * Effective default when empty defaults should fall back to min/max.
 *
 * @param array<string, mixed> $field
 * @return array{from: string, to: string}|string|null
 */
function bl_blocks_effective_range_default(array $field)
{
	$min = bl_blocks_sanitize_range_endpoint($field['min'] ?? '');
	$max = bl_blocks_sanitize_range_endpoint($field['max'] ?? '');

	if (bl_blocks_range_mode($field) === 'single') {
		$raw = $field['default_value'] ?? '';
		if (is_array($raw)) {
			$raw = $raw['from'] ?? '';
		}
		$value = bl_blocks_sanitize_range_endpoint($raw);
		if ($value === '') {
			$value = $min;
		}
		$value = bl_blocks_clamp_range_single(['min' => $min, 'max' => $max], $value);

		return $value !== '' ? $value : null;
	}

	$pair = bl_blocks_sanitize_range_value(['min' => $min, 'max' => $max], $field['default_value'] ?? null);
	if ($pair['from'] === '') {
		$pair['from'] = $min;
	}
	if ($pair['to'] === '') {
		$pair['to'] = $max;
	}
	$pair = bl_blocks_clamp_range_pair(['min' => $min, 'max' => $max], $pair['from'], $pair['to']);
	if ($pair['from'] === '' && $pair['to'] === '') {
		return null;
	}

	return $pair;
}

/**
 * Sanitize blocks-only from/to number field.
 *
 * @param array<string, mixed> $field
 * @return array<string, mixed>
 */
function bl_blocks_sanitize_range_field(array $field): array
{
	$id = sanitize_key((string) ($field['id'] ?? ''));
	if ($id === '') {
		$id = 'f' . wp_generate_password(8, false, false);
	}
	$name = sanitize_key((string) ($field['name'] ?? ''));
	if ($name === '') {
		$name = $id;
	}

	$width = ['width' => sanitize_text_field((string) ($field['width'] ?? '100')), 'width_custom' => sanitize_text_field((string) ($field['width_custom'] ?? ''))];
	if (function_exists('bl_forms_sanitize_width')) {
		$width = bl_forms_sanitize_width($field);
	}

	$min = bl_blocks_sanitize_range_endpoint($field['min'] ?? '');
	$max = bl_blocks_sanitize_range_endpoint($field['max'] ?? '');
	if ($min !== '' && $max !== '' && (float) $min > (float) $max) {
		$max = '';
	}
	$step = bl_blocks_sanitize_range_endpoint($field['step'] ?? '');
	$mode = bl_blocks_range_mode($field);
	$bounds = ['min' => $min, 'max' => $max];

	$out = [
		'id'            => $id,
		'type'          => 'range',
		'label'         => sanitize_text_field((string) ($field['label'] ?? '')),
		'name'          => $name,
		'name_manual'   => !empty($field['name_manual']) || $name !== '',
		'hide_label'    => !empty($field['hide_label']),
		'css_class'     => function_exists('bl_forms_sanitize_css_class')
			? bl_forms_sanitize_css_class((string) ($field['css_class'] ?? ''))
			: sanitize_html_class((string) ($field['css_class'] ?? '')),
		'width'         => $width['width'],
		'width_custom'  => $width['width_custom'],
		'active'        => function_exists('bl_forms_field_is_active')
			? bl_forms_field_is_active($field)
			: (!array_key_exists('active', $field) || !empty($field['active'])),
		'required'      => !empty($field['required']),
		'description'   => sanitize_textarea_field((string) ($field['description'] ?? '')),
		'mode'          => $mode,
		'show_inputs'   => !empty($field['show_inputs']),
		'default_value' => bl_blocks_sanitize_range_stored_value($bounds + ['mode' => $mode], $field['default_value'] ?? null),
	];

	if ($min !== '') {
		$out['min'] = $min;
	}
	if ($max !== '') {
		$out['max'] = $max;
	}
	if ($step !== '') {
		$out['step'] = $step;
	}

	$suffix = bl_blocks_sanitize_affix($field['suffix'] ?? '');
	if ($suffix !== '') {
		$out['suffix'] = $suffix;
	}
	$prefix = bl_blocks_sanitize_affix($field['prefix'] ?? '');
	if ($prefix !== '') {
		$out['prefix'] = $prefix;
	}

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
		'name_manual'   => !empty($field['name_manual']) || $name !== '',
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
		'name_manual'   => !empty($field['name_manual']) || $name !== '',
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

	$affix_types = ['text', 'email', 'phone', 'url', 'number', 'date', 'time', 'datetime'];
	if (in_array($out['type'], $affix_types, true)) {
		$prefix = bl_blocks_sanitize_affix($field['prefix'] ?? '');
		$suffix = bl_blocks_sanitize_affix($field['suffix'] ?? '');
		if ($prefix !== '') {
			$out['prefix'] = $prefix;
		}
		if ($suffix !== '') {
			$out['suffix'] = $suffix;
		}
	}

	if ($out['type'] === 'number') {
		$min = sanitize_text_field((string) ($field['min'] ?? ''));
		$max = sanitize_text_field((string) ($field['max'] ?? ''));
		$step = sanitize_text_field((string) ($field['step'] ?? ''));
		if ($min !== '') {
			$out['min'] = $min;
		}
		if ($max !== '') {
			$out['max'] = $max;
		}
		if ($step !== '') {
			$out['step'] = $step;
		}
	}

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
	if ($out['type'] === 'select') {
		if (!empty($out['multiple'])) {
			unset($out['allow_null']);
		} else {
			$out['allow_null'] = !array_key_exists('allow_null', $field)
				? true
				: !empty($field['allow_null']);
		}
	} else {
		unset($out['allow_null']);
	}
	if (in_array($out['type'], ['file', 'image'], true)) {
		$mime_types = sanitize_text_field((string) ($field['mime_types'] ?? ''));
		if ($mime_types !== '') {
			$out['mime_types'] = $mime_types;
		}
	}
	if (in_array($out['type'], ['radio', 'checkboxes'], true)) {
		$out['layout'] = (($field['layout'] ?? 'vertical') === 'horizontal') ? 'horizontal' : 'vertical';
	}
	if ($out['type'] === 'button_group') {
		$out['layout'] = (($field['layout'] ?? 'horizontal') === 'vertical') ? 'vertical' : 'horizontal';
	}
	if ($out['type'] === 'page') {
		$out['multiple'] = !empty($field['multiple']);
		$out['post_types'] = function_exists('bl_page_picker_sanitize_post_types')
			? bl_page_picker_sanitize_post_types($field['post_types'] ?? null)
			: (isset($field['post_types']) && is_array($field['post_types'])
				? array_values(array_unique(array_filter(array_map('sanitize_key', $field['post_types']))))
				: ['page']);
		if ($out['post_types'] === []) {
			$out['post_types'] = ['page'];
		}
		$nouns = function_exists('bl_page_picker_sanitize_nouns')
			? bl_page_picker_sanitize_nouns($field['text_singular'] ?? '', $field['text_plural'] ?? '')
			: [];
		if (isset($nouns['text_singular'])) {
			$out['text_singular'] = $nouns['text_singular'];
		} else {
			unset($out['text_singular']);
		}
		if (isset($nouns['text_plural'])) {
			$out['text_plural'] = $nouns['text_plural'];
		} else {
			unset($out['text_plural']);
		}
		$out['orderby'] = function_exists('bl_page_picker_sanitize_orderby')
			? bl_page_picker_sanitize_orderby($field['orderby'] ?? 'automatic')
			: 'automatic';
		$out['allow_reorder'] = !array_key_exists('allow_reorder', $field)
			? true
			: !empty($field['allow_reorder']);
		unset($out['placeholder'], $out['default_value']);
	} else {
		unset($out['text_singular'], $out['text_plural'], $out['orderby'], $out['allow_reorder']);
	}
	if ($out['type'] === 'link') {
		$allowed = ['page', 'url', 'email', 'phone', 'file'];
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
	if ($out['type'] === 'icon') {
		$out['default_value'] = sanitize_key((string) ($field['default_value'] ?? ''));
		unset($out['placeholder'], $out['multiple']);
	}

	if ($out['type'] === 'textarea' && array_key_exists('allow_html', $field)) {
		$allow = $field['allow_html'];
		if ($allow === true || $allow === 1 || $allow === '1' || $allow === 'post') {
			$out['allow_html'] = true;
		} elseif ($allow === 'svg') {
			$out['allow_html'] = 'svg';
		}
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
 * Next settings order for Website / Content Fields: existing definitions of type + 1.
 */
function bl_blocks_next_settings_order(string $type, int $exclude_id = 0): int
{
	$type = bl_blocks_sanitize_definition_type($type);
	$count = 0;
	foreach (bl_blocks_query_definitions($type, false) as $post) {
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
 * @deprecated Use bl_blocks_next_settings_order( 'site_settings', $exclude_id ).
 */
function bl_blocks_next_site_settings_order(int $exclude_id = 0): int
{
	return bl_blocks_next_settings_order('site_settings', $exclude_id);
}

/**
 * @return list<WP_Post>
 */
function bl_blocks_query_definitions(string $type, bool $active_only = false): array
{
	$type = bl_blocks_sanitize_definition_type($type);
	$cache_key = bl_blocks_definitions_query_cache_key($type, $active_only);
	$cache_v = bl_blocks_definitions_cache_version();

	static $memo = [];
	static $memo_v = 0;
	if ($memo_v !== $cache_v) {
		$memo = [];
		$memo_v = $cache_v;
	}
	if (isset($memo[$cache_key])) {
		return $memo[$cache_key];
	}

	$cached_ids = wp_cache_get($cache_key, 'bl_blocks');
	if ($cached_ids === false) {
		$cached_ids = get_transient($cache_key);
	}
	if (is_array($cached_ids)) {
		$posts = bl_blocks_hydrate_definition_posts($cached_ids);
		$memo[$cache_key] = $posts;

		return $posts;
	}

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

	if ($active_only) {
		$out = [];
		foreach ($posts as $post) {
			$config = bl_blocks_get_config((int) $post->ID);
			if (!empty($config['settings']['active'])) {
				$out[] = $post;
			}
		}

		if (in_array($type, ['site_settings', 'page_settings'], true)) {
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
		$posts = $out;
	}

	$ids = array_map(static fn(WP_Post $p): int => (int) $p->ID, $posts);
	wp_cache_set($cache_key, $ids, 'bl_blocks', HOUR_IN_SECONDS);
	set_transient($cache_key, $ids, HOUR_IN_SECONDS);
	$memo[$cache_key] = $posts;

	return $posts;
}

/**
 * Cache version for block-definition queries / payloads (bumped on save/delete).
 */
function bl_blocks_definitions_cache_version(): int
{
	return max(1, (int) get_option('bl_blocks_defs_cache_v', 1));
}

/**
 * Invalidate cached definition lists and active block payloads.
 */
function bl_blocks_invalidate_definitions_cache(): void
{
	$next = bl_blocks_definitions_cache_version() + 1;
	update_option('bl_blocks_defs_cache_v', $next, true);
}

/**
 * @param string $type
 */
function bl_blocks_definitions_query_cache_key(string $type, bool $active_only): string
{
	return 'bl_blocks_defs_' . bl_blocks_definitions_cache_version() . '_' . $type . '_' . ($active_only ? 'a' : 'all');
}

function bl_blocks_active_payloads_cache_key(): string
{
	return 'bl_blocks_payloads_' . bl_blocks_definitions_cache_version();
}

/**
 * @param list<int|string> $ids
 * @return list<WP_Post>
 */
function bl_blocks_hydrate_definition_posts(array $ids): array
{
	$ids = array_values(array_filter(array_map('intval', $ids), static fn(int $id): bool => $id > 0));
	if ($ids === []) {
		return [];
	}

	$posts = get_posts([
		'post_type'              => BL_BLOCK_POST_TYPE,
		'post_status'            => 'any',
		'post__in'               => $ids,
		'orderby'                => 'post__in',
		'posts_per_page'         => count($ids),
		'no_found_rows'          => true,
		'update_post_meta_cache' => true,
		'update_post_term_cache' => false,
	]);

	return array_values(array_filter($posts, static fn($p): bool => $p instanceof WP_Post));
}

/**
 * Bump definition caches when a bl_block post is saved, trashed, or deleted.
 */
function bl_blocks_maybe_invalidate_definitions_cache($post_id): void
{
	$post_id = (int) $post_id;
	if ($post_id <= 0 || get_post_type($post_id) !== BL_BLOCK_POST_TYPE) {
		return;
	}
	bl_blocks_invalidate_definitions_cache();
}
add_action('save_post_' . BL_BLOCK_POST_TYPE, 'bl_blocks_maybe_invalidate_definitions_cache', 99);
add_action('trashed_post', 'bl_blocks_maybe_invalidate_definitions_cache', 99);
add_action('untrashed_post', 'bl_blocks_maybe_invalidate_definitions_cache', 99);
add_action('before_delete_post', 'bl_blocks_maybe_invalidate_definitions_cache', 99);

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
 * @return array{type:string,url:string,title:string,page_id?:int,attachment_id?:int,target?:string}
 */
function bl_blocks_sanitize_link_value(array $field, $raw): array
{
	$allowed = ['page', 'url', 'email', 'phone', 'file'];
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
	$attachment_id = 0;

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
	} elseif ($type === 'file') {
		$attachment_id = absint($raw['attachment_id'] ?? 0);
		if ($attachment_id > 0) {
			$post = get_post($attachment_id);
			if ($post && $post->post_type === 'attachment' && $post->post_status !== 'trash') {
				$att_url = wp_get_attachment_url($attachment_id);
				$url = is_string($att_url) ? $att_url : '';
				if ($title === '') {
					$file = get_attached_file($attachment_id);
					$title = is_string($file) && $file !== '' ? wp_basename($file) : (get_the_title($post) ?: '');
				}
			} else {
				$attachment_id = 0;
			}
		}
		if ($url === '' && !empty($raw['url'])) {
			$url = esc_url_raw((string) $raw['url']);
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
	if ($type === 'file') {
		$out['attachment_id'] = $attachment_id;
	}
	if ($allow_target && in_array($type, ['page', 'url', 'file'], true) && (($raw['target'] ?? '') === '_blank')) {
		$out['target'] = '_blank';
	}

	return $out;
}

/**
 * Default stored value for a field when its key is absent from raw values.
 * Returns null when the field should not be seeded (no meaningful default).
 *
 * @param array<string, mixed> $field
 * @return mixed|null
 */
function bl_blocks_default_value_for_field(array $field)
{
	$type = (string) ($field['type'] ?? '');
	if ($type === '' || bl_blocks_is_layout_field_type($type) || bl_blocks_is_static_field_type($type)) {
		return null;
	}
	if (in_array($type, ['page', 'link', 'image', 'file', 'repeater'], true)) {
		return null;
	}
	if (isset($field['active']) && empty($field['active'])) {
		return null;
	}

	if ($type === 'toggle' || $type === 'terms') {
		$dv = $field['default_value'] ?? '';
		if ($dv === '' || $dv === null || $dv === false || $dv === 0 || $dv === '0') {
			return null;
		}

		return '1';
	}

	if ($type === 'range') {
		return bl_blocks_effective_range_default($field);
	}

	$multi = $type === 'checkboxes'
		|| ($type === 'button_group' && !empty($field['multiple']))
		|| ($type === 'select' && !empty($field['multiple']));

	$dv = $field['default_value'] ?? null;
	if ($dv === null || $dv === '') {
		return null;
	}

	if ($multi) {
		$list = [];
		if (is_array($dv)) {
			foreach ($dv as $item) {
				if (is_scalar($item) && (string) $item !== '') {
					$list[] = sanitize_text_field((string) $item);
				}
			}
		} elseif (is_scalar($dv) && (string) $dv !== '') {
			$list[] = sanitize_text_field((string) $dv);
		}

		return $list === [] ? null : $list;
	}

	if ($type === 'icon') {
		$key = sanitize_key(is_scalar($dv) ? (string) $dv : '');

		return $key !== '' ? $key : null;
	}

	if ($type === 'wysiwyg') {
		$html = wp_kses_post(is_scalar($dv) ? (string) $dv : '');

		return $html !== '' ? $html : null;
	}

	if (in_array($type, ['textarea', 'html'], true)) {
		$raw_str = is_scalar($dv) ? (string) $dv : '';
		$allow = $field['allow_html'] ?? false;
		if ($allow === true || $allow === 1 || $allow === '1' || $allow === 'post') {
			$out = wp_kses_post($raw_str);
		} elseif ($allow === 'svg' && function_exists('bl_svg_sanitize')) {
			$out = bl_svg_sanitize($raw_str);
		} elseif ($allow === 'svg') {
			$out = $raw_str;
		} else {
			$out = sanitize_textarea_field($raw_str);
		}

		return $out !== '' ? $out : null;
	}

	if ($type === 'url') {
		$url = bl_blocks_normalize_https_url(is_scalar($dv) ? (string) $dv : '');

		return $url !== '' ? $url : null;
	}

	$str = sanitize_text_field(is_scalar($dv) ? (string) $dv : '');

	return $str !== '' ? $str : null;
}

/**
 * Build a values map of seedable field defaults (layout children included).
 *
 * @param list<array<string, mixed>> $fields
 * @return array<string, mixed>
 */
function bl_blocks_default_values_from_fields(array $fields): array
{
	$out = [];
	foreach ($fields as $field) {
		if (!is_array($field)) {
			continue;
		}
		$type = (string) ($field['type'] ?? '');
		if (bl_blocks_is_layout_field_type($type)) {
			$children = isset($field['children']) && is_array($field['children']) ? $field['children'] : [];
			$out = array_merge($out, bl_blocks_default_values_from_fields($children));
			continue;
		}
		if (bl_blocks_is_static_field_type($type) || $type === 'repeater') {
			continue;
		}
		if (isset($field['active']) && empty($field['active'])) {
			continue;
		}
		$name = (string) ($field['name'] ?? '');
		if ($name === '') {
			continue;
		}
		$seeded = bl_blocks_default_value_for_field($field);
		if ($seeded !== null) {
			$out[$name] = $seeded;
		}
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

		// Seed definition defaults only when the key was never set (not when cleared).
		if (!array_key_exists($name, $raw)) {
			$seeded = bl_blocks_default_value_for_field($field);
			if ($seeded !== null) {
				$values[$name] = $seeded;
				continue;
			}
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
			$allowed_types = function_exists('bl_page_picker_sanitize_post_types')
				? bl_page_picker_sanitize_post_types($field['post_types'] ?? null)
				: ['page'];
			if (function_exists('bl_page_picker_filter_post_ids')) {
				$ids = bl_page_picker_filter_post_ids($ids, $allowed_types);
			}
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

		if ($type === 'icon') {
			$values[$name] = sanitize_key(is_scalar($raw_value) ? (string) $raw_value : '');
			continue;
		}

		if ($type === 'range') {
			$values[$name] = bl_blocks_sanitize_range_stored_value($field, $raw_value);
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

		if (in_array($type, ['textarea', 'html', 'wysiwyg'], true)) {
			$raw_str = is_scalar($raw_value) ? (string) $raw_value : '';
			if ($type === 'wysiwyg') {
				$values[$name] = wp_kses_post($raw_str);
				continue;
			}
			$allow = $field['allow_html'] ?? false;
			if ($allow === true || $allow === 1 || $allow === '1' || $allow === 'post') {
				$values[$name] = wp_kses_post($raw_str);
			} elseif ($allow === 'svg' && function_exists('bl_svg_sanitize')) {
				$values[$name] = bl_svg_sanitize($raw_str);
			} elseif ($allow === 'svg') {
				$values[$name] = $raw_str;
			} else {
				$values[$name] = sanitize_textarea_field($raw_str);
			}
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
