<?php

defined('ABSPATH') || exit;

/**
 * iCal (.ics) download for event posts.
 */

/**
 * Public download URL for an event’s iCal file.
 */
function bl_event_ical_url(int $post_id): string
{
	$url = get_permalink($post_id);
	if (!is_string($url) || $url === '') {
		return '';
	}

	return add_query_arg('bl_ical', '1', $url);
}

/**
 * Whether an event can provide an iCal download (valid schedule).
 */
function bl_event_can_download_ical(int $post_id): bool
{
	return bl_event_build_ical($post_id) !== null;
}

/**
 * Escape text for iCalendar property values (RFC 5545).
 */
function bl_event_ical_escape_text(string $value): string
{
	$value = str_replace(["\r\n", "\r", "\n"], '\n', $value);
	$value = str_replace(['\\', ';', ','], ['\\\\', '\;', '\,'], $value);

	return $value;
}

/**
 * Fold an iCalendar content line to ≤75 octets (RFC 5545).
 */
function bl_event_ical_fold_line(string $line): string
{
	if (strlen($line) <= 75) {
		return $line;
	}

	$chunks = [];
	while (strlen($line) > 75) {
		$chunks[] = substr($line, 0, 75);
		$line = substr($line, 75);
	}
	$chunks[] = $line;

	return implode("\r\n ", $chunks);
}

/**
 * Format a DateTimeImmutable for iCal (local floating or all-day).
 *
 * @return array{0: string, 1: string} Property name suffix and value.
 */
function bl_event_ical_format_dt(\DateTimeImmutable $dt, bool $all_day, bool $end): array
{
	if ($all_day) {
		if ($end) {
			// DTEND for all-day is exclusive.
			$dt = $dt->modify('+1 day');
		}

		return [';VALUE=DATE', $dt->format('Ymd')];
	}

	return ['', $dt->format('Ymd\THis')];
}

/**
 * Build a DESCRIPTION / LOCATION string from event metadata.
 *
 * @return array{description: string, location: string}
 */
function bl_event_ical_meta_fields(int $post_id): array
{
	$description = [];
	$location_parts = [];

	if (function_exists('bl_event_get_metadata')) {
		$meta = bl_event_get_metadata($post_id);
		$loc = isset($meta['location']) && is_array($meta['location']) ? $meta['location'] : [];
		if (!empty($loc['venue'])) {
			$location_parts[] = (string) $loc['venue'];
		}
		if (!empty($loc['address'])) {
			$location_parts[] = (string) $loc['address'];
		}

		$org = isset($meta['organizer']) && is_array($meta['organizer']) ? $meta['organizer'] : [];
		if (!empty($org['name'])) {
			$description[] = sprintf(
				/* translators: %s: organizer name */
				__('Organizer: %s', 'baselayer'),
				(string) $org['name']
			);
		}
		if (!empty($org['email'])) {
			$description[] = (string) $org['email'];
		}
		if (!empty($org['website'])) {
			$description[] = (string) $org['website'];
		}

		$contact = isset($meta['contact']) && is_array($meta['contact']) ? $meta['contact'] : [];
		$contact_bits = array_filter([
			isset($contact['person']) ? (string) $contact['person'] : '',
			isset($contact['email']) ? (string) $contact['email'] : '',
			isset($contact['phone']) ? (string) $contact['phone'] : '',
		]);
		if ($contact_bits !== []) {
			$description[] = sprintf(
				/* translators: %s: contact details */
				__('Contact: %s', 'baselayer'),
				implode(', ', $contact_bits)
			);
		}
	}

	$excerpt = get_the_excerpt($post_id);
	if (is_string($excerpt) && trim(wp_strip_all_tags($excerpt)) !== '') {
		$description[] = trim(wp_strip_all_tags($excerpt));
	}

	return [
		'description' => implode("\n", array_filter($description)),
		'location' => implode(', ', array_filter($location_parts)),
	];
}

/**
 * Build a complete iCalendar document for a post, or null when not possible.
 */
function bl_event_build_ical(int $post_id): ?string
{
	if ($post_id <= 0 || !function_exists('bl_event_get_schedule')) {
		return null;
	}
	if (!bl_is_event_post_type(get_post_type($post_id))) {
		return null;
	}

	$schedule = bl_event_get_schedule($post_id);
	if ($schedule === null) {
		return null;
	}

	$tz = bl_event_timezone();
	$all_day = $schedule['start_time'] === '' && $schedule['end_time'] === '';

	try {
		$start = new \DateTimeImmutable(
			$schedule['start_date'] . ' ' . ($schedule['start_time'] !== '' ? $schedule['start_time'] : '00:00'),
			$tz
		);
		$end = new \DateTimeImmutable(
			$schedule['end_date'] . ' ' . ($schedule['end_time'] !== '' ? $schedule['end_time'] : ($all_day ? '00:00' : '23:59')),
			$tz
		);
	} catch (\Exception $e) {
		return null;
	}

	if ($end < $start) {
		$end = $start;
	}

	[$start_param, $start_val] = bl_event_ical_format_dt($start, $all_day, false);
	[$end_param, $end_val] = bl_event_ical_format_dt($end, $all_day, true);

	$host = wp_parse_url(home_url(), PHP_URL_HOST);
	$host = is_string($host) && $host !== '' ? $host : 'localhost';
	$uid = sprintf('baselayer-event-%d@%s', $post_id, $host);
	$now = (new \DateTimeImmutable('now', new \DateTimeZone('UTC')))->format('Ymd\THis\Z');
	$title = get_the_title($post_id);
	$permalink = get_permalink($post_id);
	$fields = bl_event_ical_meta_fields($post_id);

	$tzid = $tz->getName();
	$lines = [
		'BEGIN:VCALENDAR',
		'VERSION:2.0',
		'PRODID:-//BaseLayer//Events//EN',
		'CALSCALE:GREGORIAN',
		'METHOD:PUBLISH',
		'BEGIN:VEVENT',
		'UID:' . $uid,
		'DTSTAMP:' . $now,
	];

	if ($all_day) {
		$lines[] = 'DTSTART;' . $start_param . ':' . $start_val;
		$lines[] = 'DTEND;' . $end_param . ':' . $end_val;
	} else {
		$lines[] = 'DTSTART;TZID=' . $tzid . ':' . $start_val;
		$lines[] = 'DTEND;TZID=' . $tzid . ':' . $end_val;
	}

	$lines[] = 'SUMMARY:' . bl_event_ical_escape_text(is_string($title) ? $title : '');
	if ($fields['description'] !== '') {
		$lines[] = 'DESCRIPTION:' . bl_event_ical_escape_text($fields['description']);
	}
	if ($fields['location'] !== '') {
		$lines[] = 'LOCATION:' . bl_event_ical_escape_text($fields['location']);
	}
	if (is_string($permalink) && $permalink !== '') {
		$lines[] = 'URL:' . $permalink;
	}
	$lines[] = 'END:VEVENT';
	$lines[] = 'END:VCALENDAR';

	$folded = array_map('bl_event_ical_fold_line', $lines);

	return implode("\r\n", $folded) . "\r\n";
}

/**
 * Suggested download filename for an event’s .ics file.
 */
function bl_event_ical_filename(int $post_id): string
{
	$slug = get_post_field('post_name', $post_id);
	$slug = is_string($slug) && $slug !== '' ? $slug : 'event-' . $post_id;
	$name = sanitize_file_name($slug);
	if ($name === '') {
		$name = 'event-' . $post_id;
	}

	return $name . '.ics';
}

/**
 * Serve .ics when `?bl_ical=1` is requested on a singular event.
 */
function bl_event_serve_ical(): void
{
	if (!isset($_GET['bl_ical'])) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
		return;
	}
	if (!is_singular()) {
		return;
	}

	$post_id = (int) get_queried_object_id();
	if ($post_id <= 0 || !bl_is_event_post_type(get_post_type($post_id))) {
		return;
	}

	$post = get_post($post_id);
	if (!$post instanceof \WP_Post) {
		return;
	}
	if ($post->post_status !== 'publish' && !current_user_can('read_post', $post_id)) {
		return;
	}

	$ics = bl_event_build_ical($post_id);
	if ($ics === null) {
		status_header(404);
		nocache_headers();
		exit;
	}

	nocache_headers();
	header('Content-Type: text/calendar; charset=utf-8');
	header('Content-Disposition: attachment; filename="' . bl_event_ical_filename($post_id) . '"');
	header('Content-Length: ' . (string) strlen($ics));
	echo $ics; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- binary calendar payload
	exit;
}

add_action('template_redirect', 'bl_event_serve_ical', 5);
