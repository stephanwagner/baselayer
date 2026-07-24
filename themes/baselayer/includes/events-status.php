<?php

defined('ABSPATH') || exit;

/**
 * Event status (one-offs + occurrences; not series masters).
 *
 * Colors live in CSS (--bl-color-* / --bl-event-status-*). PHP only stores
 * tokens (info, error, …) or free hex from CPT config.
 */

const BL_EVENT_META_STATUS = '_bl_event_status';
const BL_EVENT_META_STATUS_LABEL = '_bl_event_status_label';
const BL_EVENT_META_STATUS_INFO = '_bl_event_status_info';
const BL_EVENT_META_STATUS_COLOR = '_bl_event_status_color';

/** Default custom status color token. */
const BL_EVENT_STATUS_COLOR_DEFAULT = 'info';

/**
 * Theme status color tokens for Custom status (and config `color` values).
 * Actual colors come from CSS --bl-color-{token} (src/scss/_config.scss).
 *
 * @return array<string, string> token => label
 */
function bl_event_status_color_presets(): array
{
	return [
		'neutral' => __('Neutral', 'baselayer'),
		'info' => __('Info', 'baselayer'),
		'error' => __('Error', 'baselayer'),
		'warning' => __('Warning', 'baselayer'),
		'success' => __('Success', 'baselayer'),
		'highlight' => __('Highlight', 'baselayer'),
	];
}

/**
 * All CSS modifier tokens (presets + cancelled/postponed aliases).
 *
 * @return list<string>
 */
function bl_event_status_css_tokens(): array
{
	return array_merge(array_keys(bl_event_status_color_presets()), ['cancelled', 'postponed']);
}

/**
 * Sanitize a status color preset token.
 */
function bl_event_sanitize_status_color_token($token): string
{
	$token = is_string($token) ? sanitize_key($token) : '';
	$presets = bl_event_status_color_presets();

	return isset($presets[$token]) ? $token : BL_EVENT_STATUS_COLOR_DEFAULT;
}

/**
 * Whether a string is a known status color token (presets or cancelled/postponed).
 */
function bl_event_is_status_color_token(string $token): bool
{
	return in_array($token, bl_event_status_css_tokens(), true);
}

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
 * Parse config `color`: theme token (info, error, …) or hex.
 *
 * @return array{color_token: string, color: string}
 */
function bl_event_parse_status_color_value($raw): array
{
	$raw = is_string($raw) ? trim($raw) : '';
	if ($raw === '') {
		return [
			'color_token' => BL_EVENT_STATUS_COLOR_DEFAULT,
			'color' => '',
		];
	}

	$hex = bl_event_sanitize_status_color($raw);
	if ($hex !== '') {
		return [
			'color_token' => '',
			'color' => $hex,
		];
	}

	$token = sanitize_key($raw);
	if (bl_event_is_status_color_token($token)) {
		// cancelled/postponed are CSS aliases; custom picker uses presets only.
		if (isset(bl_event_status_color_presets()[$token]) || in_array($token, ['cancelled', 'postponed'], true)) {
			return [
				'color_token' => $token,
				'color' => '',
			];
		}
	}

	return [
		'color_token' => BL_EVENT_STATUS_COLOR_DEFAULT,
		'color' => '',
	];
}

/**
 * CSS custom property value for a status (var(--bl-color-*) or hex).
 * Maps cancelled→error, postponed→warning for --bl-color-* (admin / inline).
 */
function bl_event_status_css_color_value(array $status): string
{
	$token = isset($status['color_token']) ? sanitize_key((string) $status['color_token']) : '';
	if ($token !== '' && bl_event_is_status_color_token($token)) {
		$map = [
			'cancelled' => 'error',
			'postponed' => 'warning',
		];
		$css_token = $map[$token] ?? $token;

		return 'var(--bl-color-' . $css_token . ')';
	}

	$color = isset($status['color']) ? (string) $status['color'] : '';

	return $color !== '' ? $color : '';
}

/**
 * Built-in statuses (always available; order before config extras).
 *
 * @return array<string, array{label: string, color_token: string, color: string}>
 */
function bl_event_builtin_statuses(): array
{
	return [
		'active' => [
			'label' => __('None', 'baselayer'),
			'color_token' => '',
			'color' => '',
		],
		'cancelled' => [
			'label' => __('Cancelled', 'baselayer'),
			'color_token' => 'cancelled',
			'color' => '',
		],
		'postponed' => [
			'label' => __('Postponed', 'baselayer'),
			'color_token' => 'postponed',
			'color' => '',
		],
	];
}

/**
 * Custom status definition (always last in the dropdown).
 *
 * @return array{label: string, color_token: string, color: string}
 */
function bl_event_custom_status_definition(): array
{
	return [
		'label' => __('Custom', 'baselayer'),
		'color_token' => BL_EVENT_STATUS_COLOR_DEFAULT,
		'color' => '',
	];
}

/**
 * Extra statuses from CPT config `statuses`.
 *
 * @return array<string, array{label: string, color_token: string, color: string}>
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
		} else {
			// Translate parent-theme defaults (e.g. "Sold Out"); unknown labels pass through.
			$label = __($label, 'baselayer');
		}
		$parsed = bl_event_parse_status_color_value($row['color'] ?? '');
		$out[$key] = [
			'label' => $label,
			'color_token' => $parsed['color_token'],
			'color' => $parsed['color'],
		];
	}

	return $out;
}

/**
 * Full status map for a post type: built-ins + config + custom.
 *
 * @return array<string, array{label: string, color_token: string, color: string}>
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
 * @return list<array{key: string, label: string, color_token: string, color: string, disabled?: bool}>
 */
function bl_event_get_status_options(?string $post_type = null): array
{
	$options = [];
	foreach (bl_event_builtin_statuses() as $key => $row) {
		$options[] = [
			'key' => $key,
			'label' => $row['label'],
			'color_token' => $row['color_token'],
			'color' => $row['color'],
		];
	}
	foreach (bl_event_config_statuses($post_type) as $key => $row) {
		$options[] = [
			'key' => $key,
			'label' => $row['label'],
			'color_token' => $row['color_token'],
			'color' => $row['color'],
		];
	}
	$options[] = [
		'key' => '__sep__',
		'label' => '────────',
		'color_token' => '',
		'color' => '',
		'disabled' => true,
	];
	$custom = bl_event_custom_status_definition();
	$options[] = [
		'key' => 'custom',
		'label' => $custom['label'],
		'color_token' => $custom['color_token'],
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
 * @return array{key: string, label: string, color: string, color_token: string, info: string, is_active: bool}|null
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
	$color_token = $defs[$key]['color_token'];
	$color = $defs[$key]['color'];
	if ($key === 'custom') {
		$custom_label = get_post_meta($post_id, BL_EVENT_META_STATUS_LABEL, true);
		if (is_string($custom_label) && trim($custom_label) !== '') {
			$label = trim($custom_label);
		}
		$color_token = bl_event_sanitize_status_color_token(
			get_post_meta($post_id, BL_EVENT_META_STATUS_COLOR, true)
		);
		$color = '';
	}

	$info = get_post_meta($post_id, BL_EVENT_META_STATUS_INFO, true);
	$info = is_string($info) ? trim($info) : '';

	return [
		'key' => $key,
		'label' => $label,
		'color' => $color,
		'color_token' => $color_token,
		'info' => $info,
		'is_active' => $key === 'active',
	];
}

/**
 * Whether the frontend should show a status badge/notice.
 * None never displays (no badge / no notice / no info).
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
 * CSS modifier key for a status (token for custom/config; status key for builtins).
 */
function bl_event_status_css_modifier(array $status): string
{
	$token = isset($status['color_token']) ? sanitize_key((string) $status['color_token']) : '';
	if ($token !== '' && bl_event_is_status_color_token($token)) {
		return $token;
	}

	$key = isset($status['key']) ? sanitize_key((string) $status['key']) : '';
	if (in_array($key, ['cancelled', 'postponed'], true)) {
		return $key;
	}

	return '';
}

/**
 * Whether a status uses frontend SCSS modifiers (no PHP inline hex).
 */
function bl_event_status_uses_frontend_scss_color(array $status): bool
{
	return bl_event_status_css_modifier($status) !== '';
}

/**
 * Inline style for free hex colors only (config).
 */
function bl_event_status_inline_style(array $status): string
{
	if (bl_event_status_uses_frontend_scss_color($status)) {
		return '';
	}

	$color = isset($status['color']) ? (string) $status['color'] : '';
	if ($color === '' || !preg_match('/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/', $color)) {
		return '';
	}

	return ' style="--bl-status-color: ' . esc_attr($color) . '; --bl-status-bg: color-mix(in srgb, ' . esc_attr($color) . ' 10%, #fff)"';
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
	$modifier = bl_event_status_css_modifier($status);
	$style = bl_event_status_inline_style($status);
	$modifier_class = $modifier !== '' ? ' event-status-badge-' . $modifier : '';
	printf(
		'<span class="%1$s%2$s"%3$s>%4$s</span>',
		esc_attr($class),
		esc_attr($modifier_class),
		$style,
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

		register_post_meta($post_type, BL_EVENT_META_STATUS_COLOR, [
			'type' => 'string',
			'single' => true,
			'show_in_rest' => true,
			'default' => BL_EVENT_STATUS_COLOR_DEFAULT,
			'auth_callback' => $auth,
			'sanitize_callback' => static function ($value): string {
				return bl_event_sanitize_status_color_token($value);
			},
		]);
	}
}

add_action('init', 'bl_event_register_status_hooks', 24);
