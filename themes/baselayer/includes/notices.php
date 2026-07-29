<?php

defined('ABSPATH') || exit;

/**
 * Whether site notices are enabled in Website settings.
 */
function bl_notices_are_enabled(): bool
{
	if (!function_exists('get_field')) {
		return false;
	}

	return (bool) get_field('notices_enabled', 'option');
}

/**
 * Whether a scheduled notice is active now (site timezone).
 *
 * Empty start => already started. Empty end => no end.
 */
function bl_notice_schedule_is_active(string $start, string $end): bool
{
	$tz = wp_timezone();
	$now = new DateTimeImmutable('now', $tz);

	$start = trim($start);
	$end = trim($end);

	if ($start !== '') {
		$start_dt = DateTimeImmutable::createFromFormat('Y-m-d H:i:s', $start, $tz);
		if (!$start_dt instanceof DateTimeImmutable) {
			$start_dt = date_create_immutable($start, $tz) ?: null;
		}
		if ($start_dt instanceof DateTimeImmutable && $now < $start_dt) {
			return false;
		}
	}

	if ($end !== '') {
		$end_dt = DateTimeImmutable::createFromFormat('Y-m-d H:i:s', $end, $tz);
		if (!$end_dt instanceof DateTimeImmutable) {
			$end_dt = date_create_immutable($end, $tz) ?: null;
		}
		if ($end_dt instanceof DateTimeImmutable && $now > $end_dt) {
			return false;
		}
	}

	return true;
}

/**
 * Whether a notice should show on the current request.
 *
 * @param array<string, mixed> $row
 */
function bl_notice_matches_current_page(array $row): bool
{
	$show_on = isset($row['show_on']) ? (string) $row['show_on'] : 'all';

	if ($show_on === 'home') {
		return is_front_page();
	}

	if ($show_on === 'pages') {
		$pages = isset($row['pages']) && is_array($row['pages']) ? $row['pages'] : [];
		$page_ids = array_map('intval', $pages);
		$page_ids = array_values(array_filter($page_ids, static fn(int $id): bool => $id > 0));
		if ($page_ids === []) {
			return false;
		}
		if (!is_singular('page')) {
			return false;
		}
		return in_array((int) get_queried_object_id(), $page_ids, true);
	}

	return true;
}

/**
 * Sanitize a space-separated CSS class list for notices.
 */
function bl_notice_sanitize_extra_class(string $raw): string
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
 * Normalize one notice row for the template / JS.
 *
 * @param array<string, mixed> $row
 * @return array{
 *   id: string,
 *   title: string,
 *   extra_class: string,
 *   dismissible: bool,
 *   show_again_after: int,
 *   content_html: string,
 *   buttons: list<array{url: string, title: string, target: string}>,
 *   show_close_button: bool,
 *   close_button_text: string,
 *   close_button_style: string,
 *   close_button_outline: bool
 * }|null
 */
function bl_notice_normalize_row(array $row, int $index): ?array
{
	$title = isset($row['title']) ? trim((string) $row['title']) : '';
	$content = isset($row['content']) ? trim((string) $row['content']) : '';
	$buttons_raw = isset($row['buttons']) && is_array($row['buttons']) ? $row['buttons'] : [];
	$buttons = [];
	foreach ($buttons_raw as $button_row) {
		if (!is_array($button_row)) {
			continue;
		}
		$link = isset($button_row['link']) && is_array($button_row['link']) ? $button_row['link'] : null;
		if ($link === null) {
			continue;
		}
		$url = isset($link['url']) ? (string) $link['url'] : '';
		if ($url === '') {
			continue;
		}
		$link_title = isset($link['title']) ? (string) $link['title'] : '';
		$buttons[] = [
			'url' => $url,
			'title' => $link_title !== '' ? $link_title : $url,
			'target' => isset($link['target']) ? (string) $link['target'] : '',
		];
	}

	if ($title === '' && $content === '' && $buttons === []) {
		return null;
	}

	$extra_class = bl_notice_sanitize_extra_class(
		isset($row['extra_class']) ? (string) $row['extra_class'] : ''
	);

	$dismissible = !empty($row['dismissible']);
	$show_again_after = isset($row['show_again_after']) ? (int) $row['show_again_after'] : 7;
	if ($show_again_after < 0) {
		$show_again_after = 0;
	}

	$show_close_button = $dismissible && !empty($row['show_close_button']);
	$close_text = isset($row['close_button_text']) ? trim((string) $row['close_button_text']) : '';
	if ($close_text === '') {
		$close_text = __('Close', 'baselayer');
	}
	$close_style = isset($row['close_button_style']) ? (string) $row['close_button_style'] : 'secondary';
	if (!in_array($close_style, ['primary', 'secondary'], true)) {
		$close_style = 'secondary';
	}

	$id = 'n' . substr(md5($index . '|' . $extra_class . '|' . $title . '|' . wp_strip_all_tags($content)), 0, 12);

	return [
		'id' => $id,
		'title' => $title,
		'extra_class' => $extra_class,
		'dismissible' => $dismissible,
		'show_again_after' => $show_again_after,
		'content_html' => $content,
		'buttons' => $buttons,
		'show_close_button' => $show_close_button,
		'close_button_text' => $close_text,
		'close_button_style' => $close_style,
		'close_button_outline' => !empty($row['close_button_outline']),
	];
}

/**
 * First enabled notice that matches schedule + current page, or null.
 *
 * @return array<string, mixed>|null
 */
function bl_notices_get_active(): ?array
{
	if (!bl_notices_are_enabled() || !function_exists('get_field')) {
		return null;
	}

	$rows = get_field('notices', 'option');
	if (!is_array($rows) || $rows === []) {
		return null;
	}

	foreach ($rows as $index => $row) {
		if (!is_array($row) || empty($row['enabled'])) {
			continue;
		}

		$display = isset($row['display']) ? (string) $row['display'] : 'always';
		if ($display === 'schedule') {
			$start = isset($row['start']) ? (string) $row['start'] : '';
			$end = isset($row['end']) ? (string) $row['end'] : '';
			if (!bl_notice_schedule_is_active($start, $end)) {
				continue;
			}
		}

		if (!bl_notice_matches_current_page($row)) {
			continue;
		}

		$normalized = bl_notice_normalize_row($row, (int) $index);
		if ($normalized !== null) {
			return $normalized;
		}
	}

	return null;
}

/**
 * Render the active site notice modal source in the footer.
 */
function bl_notices_render(): void
{
	$notice = bl_notices_get_active();
	if ($notice === null) {
		return;
	}

	bl_render_template('site-notice', ['notice' => $notice]);
}
// Before wp_print_footer_scripts (priority 20) so markup exists when footer JS runs.
add_action('wp_footer', 'bl_notices_render', 5);
