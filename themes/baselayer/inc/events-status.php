<?php

defined('ABSPATH') || exit;

/**
 * Event status (one-offs + occurrences; not series masters).
 */

const BL_EVENT_META_STATUS = '_bl_event_status';
const BL_EVENT_META_STATUS_LABEL = '_bl_event_status_label';
const BL_EVENT_META_STATUS_INFO = '_bl_event_status_info';
const BL_EVENT_STATUS_COLOR_FALLBACK = '#2563eb';

/**
 * Normalize a color string to #RGB or #RRGGBB, or empty if invalid.
 */
function bl_event_sanitize_status_color($color): string
{
	if (!is_string($color)) {
		return '';
	}
	$color = trim($color);
	if (preg_match('/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/', $color)) {
		return strtolower($color);
	}

	return '';
}

/**
 * Built-in statuses (always available; order before config extras).
 *
 * @return array<string, array{label: string, color: string}>
 */
function bl_event_builtin_statuses(): array
{
	return [
		'active' => [
			'label' => __('Active', 'baselayer'),
			'color' => '#16a34a',
		],
		'cancelled' => [
			'label' => __('Cancelled', 'baselayer'),
			'color' => '#dc2626',
		],
		'postponed' => [
			'label' => __('Postponed', 'baselayer'),
			'color' => '#d97706',
		],
	];
}

/**
 * Custom status definition (always last in the dropdown).
 *
 * @return array{label: string, color: string}
 */
function bl_event_custom_status_definition(): array
{
	return [
		'label' => __('Custom', 'baselayer'),
		'color' => BL_EVENT_STATUS_COLOR_FALLBACK,
	];
}

/**
 * Extra statuses from CPT config `statuses`.
 *
 * @return array<string, array{label: string, color: string}>
 */
function bl_event_config_statuses(?string $post_type = null): array
{
	if ($post_type === null || $post_type === '') {
		$post_type = function_exists('get_post_type') ? (string) get_post_type() : '';
	}
	if ($post_type === '' || !bl_is_event_post_type($post_type)) {
		return [];
	}

	$cfg = function_exists('bl_config_cpt') ? bl_config_cpt($post_type) : null;
	if (!is_array($cfg) || empty($cfg['statuses']) || !is_array($cfg['statuses'])) {
		return [];
	}

	$reserved = ['active', 'cancelled', 'postponed', 'custom'];
	$out = [];
	foreach ($cfg['statuses'] as $key => $row) {
		$key = sanitize_key((string) $key);
		if ($key === '' || in_array($key, $reserved, true) || !is_array($row)) {
			continue;
		}
		$label = isset($row['label']) ? trim((string) $row['label']) : '';
		if ($label === '') {
			$label = $key;
		}
		$color = bl_event_sanitize_status_color($row['color'] ?? '');
		if ($color === '') {
			$color = BL_EVENT_STATUS_COLOR_FALLBACK;
		}
		$out[$key] = [
			'label' => $label,
			'color' => $color,
		];
	}

	return $out;
}

/**
 * Full status map for a post type: built-ins + config + custom.
 *
 * @return array<string, array{label: string, color: string}>
 */
function bl_event_get_status_definitions(?string $post_type = null): array
{
	$defs = bl_event_builtin_statuses();
	foreach (bl_event_config_statuses($post_type) as $key => $row) {
		$defs[$key] = $row;
	}
	$defs['custom'] = bl_event_custom_status_definition();

	return $defs;
}

/**
 * Ordered options for the editor select (includes a disabled separator before Custom).
 *
 * @return list<array{key: string, label: string, color: string, disabled?: bool}>
 */
function bl_event_get_status_options(?string $post_type = null): array
{
	$options = [];
	foreach (bl_event_builtin_statuses() as $key => $row) {
		$options[] = [
			'key' => $key,
			'label' => $row['label'],
			'color' => $row['color'],
		];
	}
	foreach (bl_event_config_statuses($post_type) as $key => $row) {
		$options[] = [
			'key' => $key,
			'label' => $row['label'],
			'color' => $row['color'],
		];
	}
	$options[] = [
		'key' => '__sep__',
		'label' => '────────',
		'color' => '',
		'disabled' => true,
	];
	$custom = bl_event_custom_status_definition();
	$options[] = [
		'key' => 'custom',
		'label' => $custom['label'],
		'color' => $custom['color'],
	];

	return $options;
}

/**
 * Whether this post can carry a public event status (not a series master).
 */
function bl_event_supports_status(int $post_id): bool
{
	if ($post_id <= 0 || !bl_is_event_post_type(get_post_type($post_id))) {
		return false;
	}
	if (function_exists('bl_event_is_series_master') && bl_event_is_series_master($post_id)) {
		return false;
	}

	return true;
}

/**
 * @return array{key: string, label: string, color: string, info: string, is_active: bool}|null
 */
function bl_event_get_status(int $post_id): ?array
{
	if ($post_id <= 0 || !bl_event_supports_status($post_id)) {
		return null;
	}

	$post_type = get_post_type($post_id);
	$defs = bl_event_get_status_definitions(is_string($post_type) ? $post_type : null);
	$key = get_post_meta($post_id, BL_EVENT_META_STATUS, true);
	$key = is_string($key) ? sanitize_key($key) : '';
	if ($key === '' || !isset($defs[$key])) {
		$key = 'active';
	}

	$label = $defs[$key]['label'];
	$color = $defs[$key]['color'];
	if ($key === 'custom') {
		$custom_label = get_post_meta($post_id, BL_EVENT_META_STATUS_LABEL, true);
		if (is_string($custom_label) && trim($custom_label) !== '') {
			$label = trim($custom_label);
		}
	}

	$info = get_post_meta($post_id, BL_EVENT_META_STATUS_INFO, true);
	$info = is_string($info) ? trim($info) : '';

	return [
		'key' => $key,
		'label' => $label,
		'color' => $color,
		'info' => $info,
		'is_active' => $key === 'active',
	];
}

/**
 * Whether the frontend should show a status badge/notice.
 * Active never displays (no badge / no notice / no info).
 */
function bl_event_should_display_status(int $post_id): bool
{
	$status = bl_event_get_status($post_id);
	if ($status === null) {
		return false;
	}

	return !$status['is_active'];
}

/**
 * Render a small status badge (admin list / archive).
 */
function bl_event_render_status_badge(int $post_id, string $class = 'event-status-badge'): void
{
	$status = bl_event_get_status($post_id);
	if ($status === null || $status['is_active']) {
		return;
	}
	printf(
		'<span class="%1$s event-status-badge--%2$s" style="--event-status-color: %3$s">%4$s</span>',
		esc_attr($class),
		esc_attr($status['key']),
		esc_attr($status['color']),
		esc_html($status['label'])
	);
}

/**
 * Register status meta for event post types.
 */
function bl_event_register_status_hooks(): void
{
	static $registered = false;
	if ($registered) {
		return;
	}
	$registered = true;

	$event_types = bl_event_post_types();
	if ($event_types === []) {
		return;
	}

	$auth = static function (bool $allowed, string $meta_key, int $post_id): bool {
		return current_user_can('edit_post', $post_id);
	};

	foreach ($event_types as $post_type) {
		if (!post_type_exists($post_type)) {
			continue;
		}

		register_post_meta($post_type, BL_EVENT_META_STATUS, [
			'type' => 'string',
			'single' => true,
			'show_in_rest' => true,
			'auth_callback' => $auth,
			'sanitize_callback' => static function ($value) use ($post_type): string {
				$key = is_string($value) ? sanitize_key($value) : '';
				$defs = bl_event_get_status_definitions($post_type);

				return isset($defs[$key]) ? $key : 'active';
			},
		]);

		register_post_meta($post_type, BL_EVENT_META_STATUS_LABEL, [
			'type' => 'string',
			'single' => true,
			'show_in_rest' => true,
			'auth_callback' => $auth,
			'sanitize_callback' => static function ($value): string {
				return is_string($value) ? sanitize_text_field($value) : '';
			},
		]);

		register_post_meta($post_type, BL_EVENT_META_STATUS_INFO, [
			'type' => 'string',
			'single' => true,
			'show_in_rest' => true,
			'auth_callback' => $auth,
			'sanitize_callback' => static function ($value): string {
				return is_string($value) ? sanitize_textarea_field($value) : '';
			},
		]);
	}
}

add_action('init', 'bl_event_register_status_hooks', 24);
