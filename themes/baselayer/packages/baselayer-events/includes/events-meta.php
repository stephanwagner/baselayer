<?php

defined('ABSPATH') || exit;

/**
 * Configurable event metadata (groups/fields from CPT config `meta`).
 */

const BL_EVENT_META_METADATA = '_bl_event_metadata';

/**
 * Event metadata config for a CPT (`meta` key in instance config).
 *
 * @return array{title: string, groups: array<string, array{title: string, fields: array<string, array{type: string, label: string}>}>}
 */
function bl_cpt_event_meta_config(?string $post_type = null): array
{
	if ($post_type === null || $post_type === '') {
		$post_type = function_exists('get_post_type') ? (string) get_post_type() : '';
	}
	$empty = ['title' => '', 'groups' => []];
	if ($post_type === '' || !bl_is_event_post_type($post_type)) {
		return $empty;
	}

	$cfg = function_exists('bl_events_get_instance') ? bl_events_get_instance($post_type) : null;
	if (!is_array($cfg) || empty($cfg['meta']) || !is_array($cfg['meta'])) {
		return $empty;
	}

	if (empty($cfg['meta']['enabled'])) {
		return $empty;
	}

	$title = isset($cfg['meta']['title']) ? trim((string) $cfg['meta']['title']) : '';
	$groups_in = isset($cfg['meta']['groups']) && is_array($cfg['meta']['groups'])
		? $cfg['meta']['groups']
		: [];

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
			$allowed = bl_events_meta_field_types();
			if (!in_array($type, $allowed, true)) {
				$type = 'text';
			}
			$label = isset($field['label']) ? trim((string) $field['label']) : $field_id;
			$row = [
				'type' => $type,
				'label' => $label !== '' ? __($label, 'baselayer-events') : $field_id, // phpcs:ignore WordPress.WP.I18n.NonSingularStringLiteralText -- config labels
			];
			if (!empty($field['help']) && is_string($field['help'])) {
				$row['help'] = __($field['help'], 'baselayer-events'); // phpcs:ignore WordPress.WP.I18n.NonSingularStringLiteralText
			}
			if (!empty($field['placeholder']) && is_string($field['placeholder'])) {
				$row['placeholder'] = (string) $field['placeholder'];
			}
			if ($type === 'select' && isset($field['options']) && is_array($field['options'])) {
				$row['options'] = $field['options'];
			}
			if (array_key_exists('default_value', $field)) {
				$row['default_value'] = $field['default_value'];
			}
			$fields[$field_id] = $row;
		}
		if ($fields === []) {
			continue;
		}
		$group_title = isset($group['title']) ? trim((string) $group['title']) : $group_id;
		$groups[$group_id] = [
			'title' => $group_title !== '' ? __($group_title, 'baselayer-events') : $group_id, // phpcs:ignore WordPress.WP.I18n.NonSingularStringLiteralText -- config titles
			'fields' => $fields,
		];
	}

	return [
		'title' => $title !== '' ? __($title, 'baselayer-events') : __('Event metadata', 'baselayer-events'), // phpcs:ignore WordPress.WP.I18n.NonSingularStringLiteralText -- config title
		'groups' => $groups,
	];
}

/**
 * Whether the post type has any metadata groups configured.
 */
function bl_event_has_meta_config(?string $post_type = null): bool
{
	$config = bl_cpt_event_meta_config($post_type);

	return $config['groups'] !== [];
}

/**
 * Normalize a metadata URL to https (strip http/https,// then re-prefix).
 */
function bl_event_force_https_url(string $value): string
{
	$value = trim($value);
	if ($value === '') {
		return '';
	}

	$value = preg_replace('#^(https?:)?//#i', '', $value) ?? $value;
	$value = ltrim($value, '/');
	if ($value === '') {
		return '';
	}

	$url = esc_url_raw('https://' . $value);
	return is_string($url) ? $url : '';
}

/**
 * Sanitize metadata payload against the CPT schema.
 *
 * @param mixed $raw
 * @return array<string, array<string, string>>
 */
function bl_event_sanitize_metadata($raw, ?string $post_type = null): array
{
	$config = bl_cpt_event_meta_config($post_type);
	if ($config['groups'] === []) {
		return [];
	}

	if (is_string($raw)) {
		$decoded = json_decode($raw, true);
		$raw = is_array($decoded) ? $decoded : [];
	}
	if (!is_array($raw)) {
		return [];
	}

	$out = [];
	foreach ($config['groups'] as $group_id => $group) {
		$group_vals = isset($raw[$group_id]) && is_array($raw[$group_id]) ? $raw[$group_id] : [];
		$row = [];
		foreach ($group['fields'] as $field_id => $field) {
			$type = isset($field['type']) ? (string) $field['type'] : 'text';
			$value = isset($group_vals[$field_id]) ? $group_vals[$field_id] : '';
			if (!is_scalar($value)) {
				$value = '';
			}
			$value = trim((string) $value);
			if ($type === 'email') {
				$value = $value !== '' ? sanitize_email($value) : '';
			} elseif ($type === 'url') {
				$value = $value !== '' ? bl_event_force_https_url($value) : '';
			} elseif ($type === 'textarea') {
				$value = sanitize_textarea_field($value);
			} elseif ($type === 'number') {
				$value = $value !== '' && is_numeric($value) ? (string) $value : '';
			} elseif ($type === 'select') {
				$allowed_values = [];
				if (isset($field['options']) && is_array($field['options'])) {
					foreach ($field['options'] as $opt) {
						if (is_array($opt) && isset($opt['value'])) {
							$allowed_values[] = (string) $opt['value'];
						}
					}
				}
				if ($value !== '' && $allowed_values !== [] && !in_array($value, $allowed_values, true)) {
					$value = '';
				} else {
					$value = sanitize_text_field($value);
				}
			} else {
				$value = sanitize_text_field($value);
			}
			if ($value !== '') {
				$row[$field_id] = $value;
			}
		}
		if ($row !== []) {
			$out[$group_id] = $row;
		}
	}

	return $out;
}

/**
 * @return array<string, array<string, string>>
 */
function bl_event_get_metadata(int $post_id): array
{
	if ($post_id <= 0 || !bl_is_event_post_type(get_post_type($post_id))) {
		return [];
	}
	$raw = get_post_meta($post_id, BL_EVENT_META_METADATA, true);

	return bl_event_sanitize_metadata($raw, get_post_type($post_id));
}

/**
 * @return array<string, string>
 */
function bl_event_get_metadata_group(int $post_id, string $group_id): array
{
	$all = bl_event_get_metadata($post_id);
	$group_id = sanitize_key($group_id);

	return isset($all[$group_id]) && is_array($all[$group_id]) ? $all[$group_id] : [];
}

/**
 * Copy metadata from master onto an occurrence.
 */
function bl_event_copy_metadata(int $master_id, int $occurrence_id): void
{
	$value = get_post_meta($master_id, BL_EVENT_META_METADATA, true);
	$sanitized = bl_event_sanitize_metadata($value, get_post_type($master_id));
	if ($sanitized === []) {
		delete_post_meta($occurrence_id, BL_EVENT_META_METADATA);
		return;
	}
	update_post_meta($occurrence_id, BL_EVENT_META_METADATA, wp_json_encode($sanitized, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
}

/**
 * Register metadata post meta for event CPTs.
 */
function bl_event_register_metadata_hooks(): void
{
	static $registered = false;
	if ($registered) {
		return;
	}
	$registered = true;

	$auth = static function (bool $allowed, string $meta_key, int $post_id): bool {
		return current_user_can('edit_post', $post_id);
	};

	foreach (bl_event_post_types() as $post_type) {
		if (!post_type_exists($post_type) || !bl_event_has_meta_config($post_type)) {
			continue;
		}

		register_post_meta($post_type, BL_EVENT_META_METADATA, [
			'type' => 'string',
			'single' => true,
			'show_in_rest' => true,
			'auth_callback' => $auth,
			'sanitize_callback' => static function ($value) use ($post_type): string {
				$sanitized = bl_event_sanitize_metadata($value, $post_type);
				if ($sanitized === []) {
					return '';
				}

				return (string) wp_json_encode($sanitized, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
			},
		]);
	}
}

add_action('init', 'bl_event_register_metadata_hooks', 23);
