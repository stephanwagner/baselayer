<?php

defined('ABSPATH') || exit;

/**
 * Permalink for a published page/post, or empty string.
 */
function bl_forms_permalink_for_post(?WP_Post $post): string
{
	if (!$post instanceof WP_Post || $post->post_status !== 'publish') {
		return '';
	}

	$url = get_permalink($post);

	return is_string($url) && $url !== '' ? $url : '';
}

/**
 * Resolve a consent-link target to a URL.
 *
 * Supports:
 * - Absolute/relative URLs: https://…, /privacy-policy
 * - page:123 (post ID)
 * - page:privacy (WordPress privacy policy page)
 * - page:privacy-policy / page:datenschutz (page slug/path)
 *
 * @return string URL, or empty string if a page: target cannot be resolved.
 */
function bl_forms_resolve_link_target(string $target): string
{
	$target = trim($target);
	if ($target === '') {
		return '';
	}

	if (preg_match('/^page:(.+)$/i', $target, $matches)) {
		$ref = trim((string) $matches[1]);
		if ($ref === '') {
			return '';
		}

		if (ctype_digit($ref)) {
			return bl_forms_permalink_for_post(get_post((int) $ref));
		}

		// Alias: page:privacy → Settings → Privacy page.
		if (strcasecmp($ref, 'privacy') === 0) {
			$privacy_id = (int) get_option('wp_page_for_privacy_policy');
			$url = bl_forms_permalink_for_post($privacy_id > 0 ? get_post($privacy_id) : null);
			if ($url !== '') {
				return $url;
			}
		}

		$page = get_page_by_path($ref, OBJECT, 'page');
		$url = bl_forms_permalink_for_post($page instanceof WP_Post ? $page : null);
		if ($url !== '') {
			return $url;
		}

		// Top-level slug lookup (get_page_by_path needs full path for nested pages).
		$by_name = get_posts([
			'name'           => $ref,
			'post_type'      => 'page',
			'post_status'    => 'publish',
			'posts_per_page' => 1,
			'no_found_rows'  => true,
		]);
		if (!empty($by_name[0]) && $by_name[0] instanceof WP_Post) {
			return bl_forms_permalink_for_post($by_name[0]);
		}

		return '';
	}

	// Allow scheme-relative and root-relative paths, plus http(s).
	$url = esc_url_raw($target, ['http', 'https']);
	if ($url !== '') {
		return $url;
	}

	if (str_starts_with($target, '/')) {
		$path = esc_url_raw(home_url($target));
		return is_string($path) ? $path : '';
	}

	return '';
}

/**
 * Format plain text with optional [label](target) links for consent checkbox copy.
 *
 * Unresolved page: targets omit the link and keep the label as plain text.
 */
function bl_forms_format_inline_links(string $text): string
{
	$text = trim($text);
	if ($text === '') {
		return '';
	}

	$parts = preg_split('/(\[[^\]]+\]\([^)]+\))/u', $text, -1, PREG_SPLIT_DELIM_CAPTURE);
	if (!is_array($parts)) {
		return esc_html($text);
	}

	$html = '';
	foreach ($parts as $part) {
		if ($part === '') {
			continue;
		}

		if (preg_match('/^\[([^\]]+)\]\(([^)]+)\)$/u', $part, $matches)) {
			$label = (string) $matches[1];
			$url = bl_forms_resolve_link_target((string) $matches[2]);
			if ($url === '') {
				$html .= esc_html($label);
				continue;
			}

			$is_external = (bool) preg_match('#^https?://#i', $url)
				&& strpos($url, home_url('/')) !== 0;

			$attrs = 'href="' . esc_url($url) . '" class="bl-form__inline-link"';
			if ($is_external) {
				$attrs .= ' target="_blank" rel="noopener noreferrer"';
			}

			$html .= '<a ' . $attrs . '>' . esc_html($label) . '</a>';
			continue;
		}

		$html .= esc_html($part);
	}

	$allowed = [
		'a' => [
			'href'   => true,
			'class'  => true,
			'target' => true,
			'rel'    => true,
		],
	];

	return wp_kses($html, $allowed);
}

/**
 * Soft phone number check (digits with common separators / leading +).
 */
function bl_forms_is_valid_phone(string $value): bool
{
	$trimmed = trim($value);
	if ($trimmed === '') {
		return false;
	}

	// Allow +, spaces, dashes, dots, parentheses; require at least 6 digits.
	if (!preg_match('/^\+?[\d\s.\-()]{6,}$/u', $trimmed)) {
		return false;
	}

	$digits = preg_replace('/\D+/', '', $trimmed);

	return is_string($digits) && strlen($digits) >= 6 && strlen($digits) <= 20;
}

/**
 * HTML date input format: YYYY-MM-DD.
 */
function bl_forms_is_valid_date(string $value): bool
{
	if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $value)) {
		return false;
	}
	$dt = \DateTimeImmutable::createFromFormat('!Y-m-d', $value);

	return $dt instanceof \DateTimeImmutable && $dt->format('Y-m-d') === $value;
}

/**
 * HTML time input format: HH:MM or HH:MM:SS.
 */
function bl_forms_is_valid_time(string $value): bool
{
	if (preg_match('/^\d{2}:\d{2}$/', $value)) {
		$dt = \DateTimeImmutable::createFromFormat('!H:i', $value);

		return $dt instanceof \DateTimeImmutable && $dt->format('H:i') === $value;
	}
	if (preg_match('/^\d{2}:\d{2}:\d{2}$/', $value)) {
		$dt = \DateTimeImmutable::createFromFormat('!H:i:s', $value);

		return $dt instanceof \DateTimeImmutable && $dt->format('H:i:s') === $value;
	}

	return false;
}

/**
 * HTML datetime-local format: YYYY-MM-DDTHH:MM.
 */
function bl_forms_is_valid_datetime(string $value): bool
{
	if (!preg_match('/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/', $value)) {
		return false;
	}
	$dt = \DateTimeImmutable::createFromFormat('!Y-m-d\TH:i', $value);

	return $dt instanceof \DateTimeImmutable && $dt->format('Y-m-d\TH:i') === $value;
}

/**
 * Bound modes for date / time / datetime fields.
 *
 * @param string $type Field type (time includes `hour`).
 * @return list<string>
 */
function bl_forms_temporal_bound_modes(string $type = ''): array
{
	if ($type === 'time') {
		return ['fixed', 'today', 'hour', 'offset'];
	}

	return ['fixed', 'today', 'offset'];
}

/**
 * Current site time as DateTimeImmutable.
 */
function bl_forms_site_now(): \DateTimeImmutable
{
	return new \DateTimeImmutable('now', wp_timezone());
}

/**
 * Format a DateTimeImmutable for an HTML date/time/datetime-local control.
 */
function bl_forms_format_temporal_value(\DateTimeImmutable $dt, string $type): string
{
	switch ($type) {
		case 'date':
			return $dt->format('Y-m-d');
		case 'time':
			return $dt->format('H:i');
		case 'datetime':
			return $dt->format('Y-m-d\TH:i');
		default:
			return '';
	}
}

/**
 * Whether a fixed bound string matches the field type.
 */
function bl_forms_is_valid_temporal_value(string $type, string $value): bool
{
	if ($value === '') {
		return false;
	}
	switch ($type) {
		case 'date':
			return bl_forms_is_valid_date($value);
		case 'time':
			return bl_forms_is_valid_time($value);
		case 'datetime':
			return bl_forms_is_valid_datetime($value);
		default:
			return false;
	}
}

/**
 * Resolve a temporal min/max/default bound to a concrete value string (empty = none).
 *
 * Modes: fixed | today | offset
 * Offset unit: days for date/datetime, minutes for time.
 *
 * @param array<string, mixed> $field
 * @param 'min'|'max'|'default' $which
 */
function bl_forms_resolve_temporal_bound(array $field, string $which): string
{
	$type = (string) ($field['type'] ?? '');
	if (!in_array($type, ['date', 'time', 'datetime'], true)) {
		return '';
	}

	$mode = sanitize_key((string) ($field[$which . '_mode'] ?? ''));
	if (!in_array($mode, bl_forms_temporal_bound_modes($type), true)) {
		// Legacy: plain default_value without a mode → treat as fixed.
		if ($which === 'default') {
			$value = trim((string) ($field['default_value'] ?? ''));
			if ($type === 'time' && preg_match('/^\d{2}:\d{2}:\d{2}$/', $value)) {
				$value = substr($value, 0, 5);
			}

			return bl_forms_is_valid_temporal_value($type, $value) ? $value : '';
		}

		return '';
	}

	$now = bl_forms_site_now();

	if ($mode === 'today') {
		return bl_forms_format_temporal_value($now, $type);
	}

	if ($mode === 'hour') {
		// Floor to the start of the current hour (HH:00).
		$dt = $now->setTime((int) $now->format('G'), 0, 0);

		return bl_forms_format_temporal_value($dt, 'time');
	}

	if ($mode === 'offset') {
		$n = (int) ($field[$which . '_offset'] ?? 0);
		if ($type === 'time') {
			$dt = $now->modify(($n >= 0 ? '+' : '') . $n . ' minutes');
		} else {
			$dt = $now->modify(($n >= 0 ? '+' : '') . $n . ' days');
		}

		return bl_forms_format_temporal_value($dt, $type);
	}

	// fixed
	$value_key = $which === 'default' ? 'default_value' : $which;
	$value = trim((string) ($field[$value_key] ?? ''));
	if ($type === 'time' && preg_match('/^\d{2}:\d{2}:\d{2}$/', $value)) {
		$value = substr($value, 0, 5);
	}

	return bl_forms_is_valid_temporal_value($type, $value) ? $value : '';
}

/**
 * Compare two temporal values of the same type.
 *
 * @return int -1 if $a < $b, 0 if equal, 1 if $a > $b, or 0 if either invalid
 */
function bl_forms_compare_temporal_values(string $type, string $a, string $b): int
{
	if (!bl_forms_is_valid_temporal_value($type, $a) || !bl_forms_is_valid_temporal_value($type, $b)) {
		return 0;
	}

	$normalize_time = static function (string $value): string {
		return preg_match('/^\d{2}:\d{2}:\d{2}$/', $value) ? substr($value, 0, 5) : $value;
	};

	if ($type === 'time') {
		$a = $normalize_time($a);
		$b = $normalize_time($b);
	}

	return $a <=> $b;
}

/**
 * Sanitize temporal bound keys onto a field (or strip them).
 *
 * @param array<string, mixed> $out
 * @param array<string, mixed> $field
 * @return array<string, mixed>
 */
function bl_forms_sanitize_temporal_bounds(array $out, array $field): array
{
	$type = (string) ($out['type'] ?? '');
	if (!in_array($type, ['date', 'time', 'datetime'], true)) {
		unset(
			$out['min_mode'],
			$out['max_mode'],
			$out['default_mode'],
			$out['min_offset'],
			$out['max_offset'],
			$out['default_offset']
		);
		if ($type !== 'number') {
			unset($out['min'], $out['max']);
		}

		return $out;
	}

	foreach (['min', 'max', 'default'] as $which) {
		$mode_key = $which . '_mode';
		$offset_key = $which . '_offset';
		$value_key = $which === 'default' ? 'default_value' : $which;

		$mode = sanitize_key((string) ($field[$mode_key] ?? ''));

		// Legacy plain default_value without mode → fixed.
		if (
			$which === 'default'
			&& $mode === ''
			&& trim((string) ($field['default_value'] ?? '')) !== ''
		) {
			$legacy = trim((string) $field['default_value']);
			if ($type === 'time' && preg_match('/^\d{2}:\d{2}:\d{2}$/', $legacy)) {
				$legacy = substr($legacy, 0, 5);
			}
			if (bl_forms_is_valid_temporal_value($type, $legacy)) {
				$mode = 'fixed';
				$field['default_value'] = $legacy;
			}
		}

		if (!in_array($mode, bl_forms_temporal_bound_modes($type), true)) {
			unset($out[$mode_key], $out[$offset_key]);
			if ($which === 'default') {
				$out['default_value'] = '';
			} else {
				unset($out[$which]);
			}
			continue;
		}

		$out[$mode_key] = $mode;

		if ($mode === 'fixed') {
			$value = trim((string) ($field[$value_key] ?? ''));
			if ($type === 'time' && preg_match('/^\d{2}:\d{2}:\d{2}$/', $value)) {
				$value = substr($value, 0, 5);
			}
			if (bl_forms_is_valid_temporal_value($type, $value)) {
				$out[$value_key] = $value;
			} else {
				unset($out[$mode_key], $out[$offset_key]);
				if ($which === 'default') {
					$out['default_value'] = '';
				} else {
					unset($out[$which]);
				}
				continue;
			}
			unset($out[$offset_key]);
		} elseif ($mode === 'offset') {
			$out[$offset_key] = (int) ($field[$offset_key] ?? 0);
			if ($which === 'default') {
				$out['default_value'] = '';
			} else {
				unset($out[$which]);
			}
		} else {
			// today / now / current hour
			unset($out[$offset_key]);
			if ($which === 'default') {
				$out['default_value'] = '';
			} else {
				unset($out[$which]);
			}
		}
	}

	return $out;
}

/**
 * Positive integer max length, or 0 if unset/invalid.
 *
 * @param array<string, mixed> $field
 */
function bl_forms_field_max_length(array $field): int
{
	if (!in_array((string) ($field['type'] ?? ''), ['text', 'textarea'], true)) {
		return 0;
	}

	$raw = trim((string) ($field['max_length'] ?? ''));
	if ($raw === '' || !ctype_digit($raw)) {
		return 0;
	}

	return max(0, (int) $raw);
}

/**
 * Whether the field should show a live character counter.
 *
 * @param array<string, mixed> $field
 */
function bl_forms_field_shows_char_count(array $field): bool
{
	return bl_forms_field_max_length($field) > 0 && !empty($field['show_char_count']);
}

/**
 * Default character-count template (translatable).
 */
function bl_forms_char_count_text_default(): string
{
	/* translators: Placeholders: %remaining%, %count%, %max% */
	return __('%remaining% characters remaining', 'baselayer');
}

/**
 * Resolve character-count template from form settings.
 *
 * @param array<string, mixed> $settings
 */
function bl_forms_resolve_char_count_text(array $settings = []): string
{
	if (function_exists('bl_forms_resolve_message')) {
		$text = bl_forms_resolve_message($settings, 'char_count_text');
		if ($text !== '') {
			return $text;
		}
	}

	return bl_forms_char_count_text_default();
}

/**
 * Default text when no characters remain.
 */
function bl_forms_char_count_empty_text_default(): string
{
	return __('No characters remaining', 'baselayer');
}

/**
 * Resolve “no characters remaining” text from form settings.
 *
 * @param array<string, mixed> $settings
 */
function bl_forms_resolve_char_count_empty_text(array $settings = []): string
{
	if (function_exists('bl_forms_resolve_message')) {
		$text = bl_forms_resolve_message($settings, 'char_count_empty_text');
		if ($text !== '') {
			return $text;
		}
	}

	return bl_forms_char_count_empty_text_default();
}

/**
 * Format character-count text with named placeholders.
 *
 * @param array<string, mixed> $settings
 */
function bl_forms_format_char_count_text(string $template, int $remaining, int $max, int $count, array $settings = []): string
{
	if ($remaining <= 0) {
		return bl_forms_resolve_char_count_empty_text($settings);
	}

	$template = trim($template) !== '' ? $template : bl_forms_char_count_text_default();

	return strtr($template, [
		'%remaining%' => (string) max(0, $remaining),
		'%count%'     => (string) max(0, $count),
		'%max%'       => (string) max(0, $max),
	]);
}

/**
 * Character length using mb_strlen when available.
 */
function bl_forms_string_length(string $value): int
{
	if (function_exists('mb_strlen')) {
		return (int) mb_strlen($value);
	}

	return strlen($value);
}

