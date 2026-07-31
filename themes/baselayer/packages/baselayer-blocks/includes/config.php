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
 * @return array{active: bool, slug: string, description: string, block_title: string, block_icon: string, block_category: string, block_keywords: string, post_types: list<string>, menu_label: string, menu_order: int}
 */
function bl_blocks_default_settings(string $type = 'block'): array
{
	$type = bl_blocks_sanitize_definition_type($type);

	return [
		'active'         => true,
		'slug'           => '',
		'description'    => '',
		'block_title'    => '',
		'block_icon'     => 'block-default',
		'block_category' => 'widgets',
		'block_keywords' => '',
		'post_types'     => $type === 'page_settings' ? ['page'] : [],
		'menu_label'     => '',
		'menu_order'     => 10,
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
	$out['slug'] = sanitize_key((string) ($settings['slug'] ?? ''));
	$out['description'] = sanitize_textarea_field((string) ($settings['description'] ?? ''));
	$out['block_title'] = sanitize_text_field((string) ($settings['block_title'] ?? ''));
	$out['block_icon'] = sanitize_key((string) ($settings['block_icon'] ?? 'block-default'));
	if ($out['block_icon'] === '') {
		$out['block_icon'] = 'block-default';
	}
	$out['block_category'] = sanitize_key((string) ($settings['block_category'] ?? 'widgets'));
	if ($out['block_category'] === '') {
		$out['block_category'] = 'widgets';
	}
	$out['block_keywords'] = sanitize_text_field((string) ($settings['block_keywords'] ?? ''));
	$out['menu_label'] = sanitize_text_field((string) ($settings['menu_label'] ?? ''));
	$out['menu_order'] = (int) ($settings['menu_order'] ?? 10);

	$post_types = [];
	if (isset($settings['post_types']) && is_array($settings['post_types'])) {
		foreach ($settings['post_types'] as $pt) {
			$pt = sanitize_key((string) $pt);
			if ($pt !== '' && post_type_exists($pt)) {
				$post_types[] = $pt;
			}
		}
	}
	$out['post_types'] = array_values(array_unique($post_types));
	if ($type === 'page_settings' && $out['post_types'] === []) {
		$out['post_types'] = ['page'];
	}

	return $out;
}

/**
 * Sanitize one field; prefer Forms sanitizer when available.
 *
 * @param mixed $field
 * @return array<string, mixed>|null
 */
function bl_blocks_sanitize_field($field): ?array
{
	if (function_exists('bl_forms_sanitize_field')) {
		return bl_forms_sanitize_field($field);
	}

	if (!is_array($field)) {
		return null;
	}

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
		'id'          => $id,
		'type'        => $type !== '' ? $type : 'text',
		'label'       => sanitize_text_field((string) ($field['label'] ?? '')),
		'name'        => $name,
		'name_manual' => !empty($field['name_manual']),
		'hide_label'  => !empty($field['hide_label']),
		'css_class'   => sanitize_html_class((string) ($field['css_class'] ?? '')),
		'width'       => sanitize_text_field((string) ($field['width'] ?? '100')),
		'width_custom'=> sanitize_text_field((string) ($field['width_custom'] ?? '')),
		'active'      => !array_key_exists('active', $field) || !empty($field['active']),
		'required'    => !empty($field['required']),
		'placeholder' => sanitize_text_field((string) ($field['placeholder'] ?? '')),
		'description' => sanitize_textarea_field((string) ($field['description'] ?? '')),
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

	if (isset($field['children']) && is_array($field['children'])) {
		$children = [];
		foreach ($field['children'] as $child) {
			$clean = bl_blocks_sanitize_field($child);
			if ($clean !== null) {
				$children[] = $clean;
			}
		}
		$out['children'] = $children;
	}

	if (isset($field['conditional_logic']) && is_array($field['conditional_logic'])) {
		$out['conditional_logic'] = $field['conditional_logic'];
	}

	return $out;
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
			$clean = bl_blocks_sanitize_field($field);
			if ($clean !== null) {
				$fields[] = $clean;
			}
		}
	}

	if (function_exists('bl_forms_ensure_unique_field_names')) {
		$fields = bl_forms_ensure_unique_field_names($fields);
	}

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
 * @return list<WP_Post>
 */
function bl_blocks_query_definitions(string $type, bool $active_only = false): array
{
	$type = bl_blocks_sanitize_definition_type($type);
	$posts = get_posts([
		'post_type'      => BL_BLOCK_POST_TYPE,
		'post_status'    => ['publish', 'draft', 'private'],
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
			$oa = (int) ($sa['menu_order'] ?? 10);
			$ob = (int) ($sb['menu_order'] ?? 10);
			if ($oa === $ob) {
				return strcasecmp($a->post_title, $b->post_title);
			}

			return $oa <=> $ob;
		});
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
	$walk = static function (array $list) use (&$walk, &$values, $raw): void {
		foreach ($list as $field) {
			if (!is_array($field)) {
				continue;
			}
			$type = (string) ($field['type'] ?? '');
			if (in_array($type, ['column', 'section', 'group'], true)) {
				$children = isset($field['children']) && is_array($field['children']) ? $field['children'] : [];
				$walk($children);
				continue;
			}
			if (in_array($type, ['divider', 'spacer', 'heading', 'text_block', 'html', 'captcha', 'honeypot'], true)) {
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

			if ($type === 'toggle' || $type === 'terms') {
				$values[$name] = !empty($raw_value) ? '1' : '';
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

			$values[$name] = sanitize_text_field(is_scalar($raw_value) ? (string) $raw_value : '');
		}
	};
	$walk($fields);

	return $values;
}
