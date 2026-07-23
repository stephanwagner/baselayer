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
