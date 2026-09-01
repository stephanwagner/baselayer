<?php

defined('ABSPATH') || exit;

/**
 * Sanitize a field prefix/suffix while preserving leading/trailing spaces.
 *
 * WordPress `sanitize_text_field()` trims edges, but affixes often need a
 * deliberate space for display (e.g. "EUR " → "EUR 34", " m" → "28 m").
 *
 * @param mixed $raw
 */
function bl_forms_sanitize_affix($raw): string
{
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

	// Keep edge spacing as regular spaces (length preserved).
	$leading = preg_replace('/\s/u', ' ', $leading) ?? '';
	$trailing = preg_replace('/\s/u', ' ', $trailing) ?? '';

	return $leading . $core . $trailing;
}

/**
 * Sanitize a space-separated CSS class list (allows Baselayer modifiers like -primary).
 */
function bl_forms_sanitize_css_classes(string $raw): string
{
	$parts = preg_split('/\s+/', trim($raw), -1, PREG_SPLIT_NO_EMPTY);
	if (!is_array($parts) || $parts === []) {
		return '';
	}

	$clean = [];
	foreach ($parts as $part) {
		$class = preg_replace('/[^A-Za-z0-9_-]/', '', (string) $part);
		if (!is_string($class) || $class === '' || $class === '-' || $class === '_') {
			continue;
		}
		$clean[$class] = $class;
	}

	return implode(' ', array_values($clean));
}

/**
 * Sanitize a selection count limit (empty / 0 = no limit).
 *
 * @param mixed $raw
 */
function bl_forms_sanitize_selection_limit($raw): int
{
	if ($raw === '' || $raw === null) {
		return 0;
	}

	$n = (int) $raw;

	return $n > 0 ? min(50, $n) : 0;
}

/**
 * Minimum checkbox selections (0 = no minimum).
 *
 * @param array<string, mixed> $field
 */
function bl_forms_field_min_selections(array $field): int
{
	return bl_forms_sanitize_selection_limit($field['min_selections'] ?? '');
}

/**
 * Maximum checkbox selections (0 = no maximum).
 *
 * @param array<string, mixed> $field
 */
function bl_forms_field_max_selections(array $field): int
{
	return bl_forms_sanitize_selection_limit($field['max_selections'] ?? '');
}

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
 * Format plain text with optional Markdown for consent checkbox copy.
 *
 * Supports:
 * - Links: [label](target)
 * - Bold: **text**
 * - Italic: *text*
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
			$label = bl_forms_format_inline_emphasis(esc_html((string) $matches[1]));
			$url = bl_forms_resolve_link_target((string) $matches[2]);
			if ($url === '') {
				$html .= $label;
				continue;
			}

			$is_external = (bool) preg_match('#^https?://#i', $url)
				&& strpos($url, home_url('/')) !== 0;

			$attrs = 'href="' . esc_url($url) . '" class="bl-form__inline-link"';
			if ($is_external) {
				$attrs .= ' target="_blank" rel="noopener noreferrer"';
			}

			$html .= '<a ' . $attrs . '>' . $label . '</a>';
			continue;
		}

		$html .= bl_forms_format_inline_emphasis(esc_html($part));
	}

	$allowed = [
		'a' => [
			'href'   => true,
			'class'  => true,
			'target' => true,
			'rel'    => true,
		],
		'b' => [],
		'i' => [],
	];

	return wp_kses($html, $allowed);
}

/**
 * Convert **bold** and *italic* Markdown in already-escaped text.
 */
function bl_forms_format_inline_emphasis(string $escaped): string
{
	$escaped = preg_replace('/\*\*(.+?)\*\*/us', '<b>$1</b>', $escaped);
	if (!is_string($escaped)) {
		return '';
	}

	$escaped = preg_replace('/\*(.+?)\*/us', '<i>$1</i>', $escaped);

	return is_string($escaped) ? $escaped : '';
}

/**
 * Trim ASCII + common Unicode spaces from both ends.
 */
function bl_forms_trim_url_input(string $raw): string
{
	$trimmed = preg_replace('/^[\s\x{00A0}\x{2000}-\x{200B}\x{FEFF}]+|[\s\x{00A0}\x{2000}-\x{200B}\x{FEFF}]+$/u', '', $raw);
	return trim(is_string($trimmed) ? $trimmed : $raw);
}

/**
 * Force an absolute https URL (strip any scheme).
 *
 * Intentionally loose: any non-empty host-like value is accepted (.test, made-up TLDs, etc.).
 * Relative paths / fragments alone are rejected — use a text or link field for those.
 */
function bl_forms_normalize_https_url(string $raw): string
{
	$trimmed = bl_forms_trim_url_input($raw);
	if ($trimmed === '') {
		return '';
	}

	// Strip scheme (http:, https:, ftp:, javascript:, …) and optional //.
	$rest = (string) preg_replace('#^[a-z][a-z0-9+.\-]*:#i', '', $trimmed);
	$rest = (string) preg_replace('#^//#', '', $rest);
	$rest = bl_forms_trim_url_input($rest);

	if ($rest === '' || str_starts_with($rest, '/') || str_starts_with($rest, '#') || str_starts_with($rest, '?')) {
		return '';
	}

	// No whitespace inside the value.
	if (preg_match('/\s/u', $rest)) {
		return '';
	}

	$host = explode('/', explode('?', explode('#', $rest, 2)[0], 2)[0], 2)[0];
	$host = explode(':', $host, 2)[0]; // drop port for the emptiness check
	if ($host === '' || !preg_match('/[a-z0-9]/i', $host)) {
		return '';
	}

	$path_before = explode('?', explode('#', $rest, 2)[0], 2)[0];
	$out = 'https://' . $rest;

	// Soft clean only — never fail solely because esc_url_raw emptied the value.
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
 * True when the value is already a usable absolute https URL.
 */
function bl_forms_is_valid_https_url(string $value): bool
{
	$trimmed = bl_forms_trim_url_input($value);
	if ($trimmed === '' || stripos($trimmed, 'https://') !== 0) {
		return false;
	}

	return bl_forms_normalize_https_url($trimmed) !== '';
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
			$out['default_offset'],
			$out['relation'],
			$out['relation_field']
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

	$relation = sanitize_key((string) ($field['relation'] ?? 'none'));
	$relation_field = sanitize_key((string) ($field['relation_field'] ?? ''));
	if (!in_array($relation, ['before', 'after'], true) || $relation_field === '') {
		unset($out['relation'], $out['relation_field']);
	} else {
		$out['relation'] = $relation;
		$out['relation_field'] = $relation_field;
	}

	return $out;
}

/**
 * Positive integer min length for text/textarea, or 0 if unset/invalid.
 *
 * @param array<string, mixed> $field
 */
function bl_forms_field_min_length(array $field): int
{
	$type = (string) ($field['type'] ?? '');
	if (!in_array($type, ['text', 'textarea'], true)) {
		return 0;
	}

	$raw = trim((string) ($field['min_length'] ?? ''));
	if ($raw === '' || !ctype_digit($raw)) {
		return 0;
	}

	return max(0, (int) $raw);
}

/**
 * Positive integer max length, or 0 if unset/invalid.
 *
 * Email / phone / URL use fixed limits (not editable in the builder).
 *
 * @param array<string, mixed> $field
 */
function bl_forms_field_max_length(array $field): int
{
	$type = (string) ($field['type'] ?? '');
	$forced = [
		'email' => 254,
		'phone' => 32,
		'url'   => 2048,
	];
	if (isset($forced[$type])) {
		return $forced[$type];
	}

	if (!in_array($type, ['text', 'textarea'], true)) {
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
	/* translators: Placeholders: {remaining}, {count}, {max} */
	return __('{remaining} characters remaining', 'baselayer-forms');
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
	return __('No characters remaining', 'baselayer-forms');
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
 * Replace {token} placeholders in a string.
 *
 * Also accepts legacy %token% (character count) and a single %s (filled from
 * limit / field / types / size / max, or the first provided value).
 *
 * @param array<string, string|int|float> $vars
 */
function bl_forms_replace_placeholders(string $text, array $vars): string
{
	if ($text === '' || $vars === []) {
		return $text;
	}

	$map = [];
	foreach ($vars as $key => $value) {
		$bare = sanitize_key((string) $key);
		if ($bare === '') {
			continue;
		}
		$str = (string) $value;
		$map['{' . $bare . '}'] = $str;
		$map['%' . $bare . '%'] = $str;
	}

	$out = strtr($text, $map);

	if (str_contains($out, '%s')) {
		$legacy = $vars['limit'] ?? $vars['field'] ?? $vars['types'] ?? $vars['size'] ?? $vars['max'] ?? null;
		if ($legacy === null) {
			$first = reset($vars);
			$legacy = $first === false ? null : $first;
		}
		if ($legacy !== null) {
			$replaced = preg_replace('/%s/', (string) $legacy, $out, 1);
			if (is_string($replaced)) {
				$out = $replaced;
			}
		}
	}

	return $out;
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

	return bl_forms_replace_placeholders($template, [
		'remaining' => (string) max(0, $remaining),
		'count'     => (string) max(0, $count),
		'max'       => (string) max(0, $max),
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

/**
 * Whether a range field is in single-value mode.
 *
 * @param array<string, mixed> $field
 */
function bl_forms_range_mode(array $field): string
{
	return (($field['mode'] ?? '') === 'single') ? 'single' : 'range';
}

/**
 * Resolved min/max/step for a range slider (0–10 when unset, matching the builder).
 *
 * @param array<string, mixed> $field
 * @return array{min: string, max: string, step: string}
 */
function bl_forms_range_bounds(array $field): array
{
	$min = bl_forms_sanitize_range_endpoint($field['min'] ?? '');
	$max = bl_forms_sanitize_range_endpoint($field['max'] ?? '');
	$step = bl_forms_sanitize_range_endpoint($field['step'] ?? '');
	if ($min === '') {
		$min = '0';
	}
	if ($max === '') {
		$max = '10';
	}
	if ((float) $min > (float) $max) {
		[$min, $max] = [$max, $min];
	}

	return [
		'min'  => $min,
		'max'  => $max,
		'step' => $step,
	];
}

/**
 * Sanitize one numeric range endpoint.
 *
 * @param mixed $raw
 */
function bl_forms_sanitize_range_endpoint($raw): string
{
	if (!is_scalar($raw) || (string) $raw === '') {
		return '';
	}

	$value = trim(sanitize_text_field((string) $raw));
	if ($value === '' || !is_numeric($value)) {
		return '';
	}

	return $value;
}

/**
 * Resolve effective default for a range field (scalar or from/to pair).
 *
 * @param array<string, mixed> $field
 * @return string|array{from: string, to: string}
 */
function bl_forms_resolve_range_default(array $field)
{
	if (function_exists('bl_blocks_effective_range_default')) {
		$resolved = bl_blocks_effective_range_default($field);
		if ($resolved === null) {
			return bl_forms_range_mode($field) === 'single'
				? bl_forms_sanitize_range_endpoint($field['min'] ?? '0')
				: [
					'from' => bl_forms_sanitize_range_endpoint($field['min'] ?? '0'),
					'to' => bl_forms_sanitize_range_endpoint($field['max'] ?? '10'),
				];
		}

		return $resolved;
	}

	$min = bl_forms_sanitize_range_endpoint($field['min'] ?? '');
	$max = bl_forms_sanitize_range_endpoint($field['max'] ?? '');
	if ($min === '') {
		$min = '0';
	}
	if ($max === '') {
		$max = '10';
	}

	if (bl_forms_range_mode($field) === 'single') {
		$raw = $field['default_value'] ?? '';
		if (is_array($raw)) {
			$raw = $raw['from'] ?? ($raw['value'] ?? '');
		}
		$value = bl_forms_sanitize_range_endpoint($raw);

		return $value !== '' ? $value : $min;
	}

	$raw = $field['default_value'] ?? null;
	$from = '';
	$to = '';
	if (is_array($raw)) {
		$from = bl_forms_sanitize_range_endpoint($raw['from'] ?? '');
		$to = bl_forms_sanitize_range_endpoint($raw['to'] ?? '');
	} elseif (is_scalar($raw) && (string) $raw !== '') {
		$from = bl_forms_sanitize_range_endpoint($raw);
	}

	return [
		'from' => $from !== '' ? $from : $min,
		'to' => $to !== '' ? $to : $max,
	];
}

/**
 * Format a range value for display (entries/mail).
 *
 * @param array<string, mixed> $field
 * @param mixed                $value
 */
function bl_forms_format_range_display_value(array $field, $value): string
{
	$prefix = function_exists('bl_forms_sanitize_affix')
		? bl_forms_sanitize_affix($field['prefix'] ?? '')
		: (string) ($field['prefix'] ?? '');
	$suffix = function_exists('bl_forms_sanitize_affix')
		? bl_forms_sanitize_affix($field['suffix'] ?? '')
		: (string) ($field['suffix'] ?? '');

	$wrap = static function (string $text) use ($prefix, $suffix): string {
		if ($text === '') {
			return '';
		}

		return $prefix . $text . $suffix;
	};

	if (bl_forms_range_mode($field) === 'single') {
		if (is_array($value)) {
			$value = $value['from'] ?? ($value['value'] ?? '');
		}
		if (!is_scalar($value) || (string) $value === '') {
			return '';
		}

		return $wrap((string) $value);
	}

	$from = '';
	$to = '';
	if (is_array($value)) {
		$from = is_scalar($value['from'] ?? null) ? (string) $value['from'] : '';
		$to = is_scalar($value['to'] ?? null) ? (string) $value['to'] : '';
	} elseif (is_scalar($value) && (string) $value !== '') {
		$from = (string) $value;
	}

	$from_label = $wrap($from);
	$to_label = $wrap($to);
	if ($from_label === '' && $to_label === '') {
		return '';
	}
	if ($from_label === '') {
		return $to_label;
	}
	if ($to_label === '') {
		return $from_label;
	}

	return $from_label . ' – ' . $to_label;
}

/**
 * Sanitize posted/submitted range value.
 *
 * @param array<string, mixed> $field
 * @param mixed                $raw
 * @return string|array{from: string, to: string}
 */
function bl_forms_sanitize_range_submitted_value(array $field, $raw)
{
	if (function_exists('bl_blocks_sanitize_range_stored_value')) {
		return bl_blocks_sanitize_range_stored_value($field, $raw);
	}

	$min = bl_forms_sanitize_range_endpoint($field['min'] ?? '');
	$max = bl_forms_sanitize_range_endpoint($field['max'] ?? '');

	$clamp = static function (string $value) use ($min, $max): string {
		if ($value === '' || !is_numeric($value)) {
			return '';
		}
		$n = (float) $value;
		if ($min !== '' && is_numeric($min) && $n < (float) $min) {
			$n = (float) $min;
		}
		if ($max !== '' && is_numeric($max) && $n > (float) $max) {
			$n = (float) $max;
		}

		return (string) $n;
	};

	if (bl_forms_range_mode($field) === 'single') {
		if (is_array($raw)) {
			$raw = $raw['from'] ?? ($raw['value'] ?? '');
		}
		$value = $clamp(bl_forms_sanitize_range_endpoint($raw));

		return $value;
	}

	$from = '';
	$to = '';
	if (is_array($raw)) {
		$from = $clamp(bl_forms_sanitize_range_endpoint($raw['from'] ?? ''));
		$to = $clamp(bl_forms_sanitize_range_endpoint($raw['to'] ?? ''));
	} elseif (is_scalar($raw)) {
		$from = $clamp(bl_forms_sanitize_range_endpoint($raw));
	}

	if ($from !== '' && $to !== '' && (float) $from > (float) $to) {
		[$from, $to] = [$to, $from];
	}

	return ['from' => $from, 'to' => $to];
}

/**
 * Fallback field sanitizer when Blocks package helpers are unavailable.
 *
 * @param array<string, mixed> $field
 * @return array<string, mixed>
 */
function bl_forms_sanitize_range_field_fallback(array $field): array
{
	$id = sanitize_key((string) ($field['id'] ?? ''));
	if ($id === '') {
		$id = 'f' . wp_generate_password(8, false, false);
	}
	$name = sanitize_key((string) ($field['name'] ?? ''));
	if ($name === '') {
		$name = $id;
	}

	$width = function_exists('bl_forms_sanitize_width')
		? bl_forms_sanitize_width($field)
		: ['width' => '100', 'width_custom' => ''];

	$min = bl_forms_sanitize_range_endpoint($field['min'] ?? '');
	$max = bl_forms_sanitize_range_endpoint($field['max'] ?? '');
	if ($min !== '' && $max !== '' && (float) $min > (float) $max) {
		$max = '';
	}
	$step = bl_forms_sanitize_range_endpoint($field['step'] ?? '');
	$mode = bl_forms_range_mode($field);

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
		'default_value' => bl_forms_sanitize_range_submitted_value(
			['min' => $min, 'max' => $max, 'mode' => $mode],
			$field['default_value'] ?? null
		),
	];
	if (!empty($field['readonly'])) {
		$out['readonly'] = true;
	}
	if (!empty($field['disabled'])) {
		$out['disabled'] = true;
	}

	if ($min !== '') {
		$out['min'] = $min;
	}
	if ($max !== '') {
		$out['max'] = $max;
	}
	if ($step !== '') {
		$out['step'] = $step;
	}

	$prefix = bl_forms_sanitize_affix($field['prefix'] ?? '');
	$suffix = bl_forms_sanitize_affix($field['suffix'] ?? '');
	if ($prefix !== '') {
		$out['prefix'] = $prefix;
	}
	if ($suffix !== '') {
		$out['suffix'] = $suffix;
	}

	if (function_exists('bl_forms_attach_conditional_logic')) {
		return bl_forms_attach_conditional_logic($out, $field);
	}

	return $out;
}

