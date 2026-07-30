<?php

defined('ABSPATH') || exit;

/**
 * Recurring events: master + materialized occurrence children.
 */

const BL_EVENT_META_RECURRENCE = '_bl_event_recurrence';
const BL_EVENT_META_OCCURRENCE_OF = '_bl_event_occurrence_of';
const BL_EVENT_META_SERIES_OVERRIDES = '_bl_event_series_overrides';
const BL_EVENT_META_STANDALONE_FROM = '_bl_event_standalone_from';
const BL_EVENT_META_EXDATES = '_bl_event_exdates';
const BL_EVENT_CRON_HOOK = 'bl_event_extend_recurring_series';
const BL_EVENT_RECURRENCE_LOOKAHEAD_DEFAULT = '1 year';

/** @var list<string> */
const BL_EVENT_SERIES_OVERRIDE_KEYS = [
	'title',
	'content',
	'excerpt',
	'status',
	'thumbnail',
	'taxonomies',
	'metadata',
];

/** @var bool */
$GLOBALS['bl_event_syncing'] = false;

/**
 * Lookahead window string (strtotime-relative) from config/theme.php → events.recurrence_lookahead.
 */
function bl_event_recurrence_lookahead(?string $post_type = null): string
{
	unset($post_type);
	$raw = '';
	if (function_exists('bl_config')) {
		$from_theme = bl_config('events.recurrence_lookahead');
		if (is_string($from_theme)) {
			$raw = trim($from_theme);
		}
	}
	if ($raw === '') {
		$raw = BL_EVENT_RECURRENCE_LOOKAHEAD_DEFAULT;
	}

	return apply_filters('bl_event_recurrence_lookahead', $raw, null);
}

/**
 * Human label for the lookahead (e.g. "1 year"), used in the editor.
 */
function bl_event_recurrence_lookahead_label(?string $post_type = null): string
{
	$lookahead = bl_event_recurrence_lookahead($post_type);

	return apply_filters('bl_event_recurrence_lookahead_label', $lookahead, $post_type);
}

/**
 * Horizon date Y-m-d = today + lookahead in site timezone.
 */
function bl_event_recurrence_horizon_date(?string $post_type = null): string
{
	$tz = bl_event_timezone();
	$now = new \DateTimeImmutable('now', $tz);
	$lookahead = bl_event_recurrence_lookahead($post_type);
	$horizon = $now->modify('+' . ltrim($lookahead, '+'));
	if (!$horizon instanceof \DateTimeImmutable) {
		$horizon = $now->modify('+1 year');
	}

	return $horizon->format('Y-m-d');
}

/**
 * @return array{freq: string, interval: int, byweekday: string[], ends: string, until: string|null, count: int|null}|null
 */
function bl_event_parse_recurrence($raw): ?array
{
	if (is_array($raw)) {
		$data = $raw;
	} elseif (is_string($raw)) {
		$raw = trim($raw);
		if ($raw === '') {
			return null;
		}
		$decoded = json_decode($raw, true);
		if (!is_array($decoded)) {
			return null;
		}
		$data = $decoded;
	} else {
		return null;
	}

	$freq = isset($data['freq']) ? strtolower(sanitize_key((string) $data['freq'])) : '';
	if (!in_array($freq, ['daily', 'weekly', 'monthly', 'yearly'], true)) {
		return null;
	}

	$interval = isset($data['interval']) ? (int) $data['interval'] : 1;
	if ($interval < 1) {
		$interval = 1;
	}
	if ($interval > 99) {
		$interval = 99;
	}

	$byweekday = [];
	if (!empty($data['byweekday']) && is_array($data['byweekday'])) {
		$allowed = ['mo', 'tu', 'we', 'th', 'fr', 'sa', 'su'];
		foreach ($data['byweekday'] as $day) {
			$day = strtolower(sanitize_key((string) $day));
			if (in_array($day, $allowed, true) && !in_array($day, $byweekday, true)) {
				$byweekday[] = $day;
			}
		}
	}

	$ends = isset($data['ends']) ? strtolower(sanitize_key((string) $data['ends'])) : 'never';
	if (!in_array($ends, ['never', 'on_date', 'after'], true)) {
		$ends = 'never';
	}

	$until = null;
	if (!empty($data['until']) && is_string($data['until'])) {
		$until = trim($data['until']);
		if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $until)) {
			$until = null;
		}
	}

	$count = null;
	if (isset($data['count']) && $data['count'] !== '' && $data['count'] !== null) {
		$count = max(1, min(999, (int) $data['count']));
	}

	if ($ends === 'on_date' && $until === null) {
		$ends = 'never';
	}
	if ($ends === 'after' && $count === null) {
		$ends = 'never';
	}

	if ($freq === 'weekly' && $byweekday === []) {
		return null;
	}

	return [
		'freq' => $freq,
		'interval' => $interval,
		'byweekday' => $byweekday,
		'ends' => $ends,
		'until' => $until,
		'count' => $count,
	];
}

/**
 * @return array{freq: string, interval: int, byweekday: string[], ends: string, until: string|null, count: int|null}|null
 */
function bl_event_get_recurrence(int $post_id): ?array
{
	$raw = get_post_meta($post_id, BL_EVENT_META_RECURRENCE, true);

	return bl_event_parse_recurrence(is_string($raw) ? $raw : '');
}

function bl_event_encode_recurrence(array $rule): string
{
	$parsed = bl_event_parse_recurrence($rule);
	if ($parsed === null) {
		return '';
	}

	return wp_json_encode($parsed, JSON_UNESCAPED_SLASHES);
}

/**
 * @param mixed $raw
 * @return list<string> Unique Y-m-d dates, sorted ascending.
 */
function bl_event_parse_exdates($raw): array
{
	$dates = [];
	if (is_string($raw)) {
		$raw = trim($raw);
		if ($raw === '') {
			return [];
		}
		$decoded = json_decode($raw, true);
		if (!is_array($decoded)) {
			return [];
		}
		$raw = $decoded;
	}
	if (!is_array($raw)) {
		return [];
	}
	foreach ($raw as $date) {
		if (!is_string($date)) {
			continue;
		}
		$date = trim($date);
		if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
			continue;
		}
		$dates[$date] = true;
	}
	$out = array_keys($dates);
	sort($out);

	return $out;
}

/**
 * @return list<string>
 */
function bl_event_get_exdates(int $master_id): array
{
	if ($master_id <= 0) {
		return [];
	}
	$raw = get_post_meta($master_id, BL_EVENT_META_EXDATES, true);

	return bl_event_parse_exdates(is_string($raw) ? $raw : '');
}

/**
 * @param list<string>|string $dates
 */
function bl_event_set_exdates(int $master_id, $dates): void
{
	if ($master_id <= 0) {
		return;
	}
	$parsed = bl_event_parse_exdates($dates);
	if ($parsed === []) {
		delete_post_meta($master_id, BL_EVENT_META_EXDATES);

		return;
	}
	update_post_meta($master_id, BL_EVENT_META_EXDATES, wp_json_encode($parsed, JSON_UNESCAPED_SLASHES));
}

function bl_event_add_exdate(int $master_id, string $date): void
{
	if ($master_id <= 0 || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
		return;
	}
	$dates = bl_event_get_exdates($master_id);
	if (in_array($date, $dates, true)) {
		return;
	}
	$dates[] = $date;
	bl_event_set_exdates($master_id, $dates);
}

function bl_event_remove_exdate(int $master_id, string $date): void
{
	if ($master_id <= 0 || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
		return;
	}
	$dates = array_values(array_filter(
		bl_event_get_exdates($master_id),
		static function (string $d) use ($date): bool {
			return $d !== $date;
		}
	));
	bl_event_set_exdates($master_id, $dates);
}

function bl_event_clear_exdates(int $master_id): void
{
	if ($master_id <= 0) {
		return;
	}
	delete_post_meta($master_id, BL_EVENT_META_EXDATES);
}

function bl_event_is_series_master(int $post_id): bool
{
	if ($post_id <= 0 || !bl_is_event_post_type(get_post_type($post_id))) {
		return false;
	}
	$parent = (int) wp_get_post_parent_id($post_id);
	if ($parent > 0) {
		return false;
	}

	return bl_event_get_recurrence($post_id) !== null;
}

function bl_event_is_occurrence(int $post_id): bool
{
	if ($post_id <= 0 || !bl_is_event_post_type(get_post_type($post_id))) {
		return false;
	}
	$of = (int) get_post_meta($post_id, BL_EVENT_META_OCCURRENCE_OF, true);
	if ($of > 0) {
		return true;
	}

	return (int) wp_get_post_parent_id($post_id) > 0;
}

function bl_event_get_master_id(int $post_id): int
{
	$of = (int) get_post_meta($post_id, BL_EVENT_META_OCCURRENCE_OF, true);
	if ($of > 0) {
		return $of;
	}
	$parent = (int) wp_get_post_parent_id($post_id);

	return $parent > 0 ? $parent : 0;
}

/**
 * Field keys that are not synced from the master onto this occurrence.
 *
 * @return list<string>
 */
function bl_event_get_series_overrides(int $post_id): array
{
	$raw = get_post_meta($post_id, BL_EVENT_META_SERIES_OVERRIDES, true);
	if (is_string($raw) && $raw !== '') {
		$decoded = json_decode($raw, true);
		$raw = is_array($decoded) ? $decoded : [];
	}
	if (!is_array($raw)) {
		return [];
	}
	$allowed = array_fill_keys(BL_EVENT_SERIES_OVERRIDE_KEYS, true);
	$out = [];
	foreach ($raw as $key) {
		if (!is_string($key)) {
			continue;
		}
		$key = sanitize_key($key);
		if (isset($allowed[$key])) {
			$out[] = $key;
		}
	}

	return array_values(array_unique($out));
}

function bl_event_occurrence_has_overrides(int $post_id): bool
{
	return bl_event_get_series_overrides($post_id) !== [];
}

function bl_event_occurrence_overrides_field(int $post_id, string $field): bool
{
	return in_array($field, bl_event_get_series_overrides($post_id), true);
}

/**
 * @param list<string> $keys
 */
function bl_event_set_series_overrides(int $post_id, array $keys): void
{
	$allowed = array_fill_keys(BL_EVENT_SERIES_OVERRIDE_KEYS, true);
	$clean = [];
	foreach ($keys as $key) {
		if (!is_string($key)) {
			continue;
		}
		$key = sanitize_key($key);
		if (isset($allowed[$key])) {
			$clean[] = $key;
		}
	}
	$clean = array_values(array_unique($clean));
	if ($clean === []) {
		delete_post_meta($post_id, BL_EVENT_META_SERIES_OVERRIDES);

		return;
	}
	update_post_meta(
		$post_id,
		BL_EVENT_META_SERIES_OVERRIDES,
		(string) wp_json_encode($clean, JSON_UNESCAPED_SLASHES)
	);
}

/**
 * @param list<string>|null $post_status Null = live statuses (not trash).
 * @return int[]
 */
function bl_event_get_occurrence_ids(int $master_id, ?array $post_status = null): array
{
	$post_type = get_post_type($master_id);
	if (!$post_type || !bl_is_event_post_type($post_type)) {
		return [];
	}

	if ($post_status === null) {
		$post_status = ['publish', 'draft', 'pending', 'future', 'private'];
	}

	$ids = get_posts([
		'post_type' => $post_type,
		'post_status' => $post_status,
		'posts_per_page' => -1,
		'fields' => 'ids',
		'post_parent' => $master_id,
		'orderby' => 'ID',
		'order' => 'ASC',
		'no_found_rows' => true,
	]);

	return array_map('intval', $ids);
}

/**
 * Occurrence IDs including trash (for cascade lifecycle).
 *
 * @return int[]
 */
function bl_event_get_occurrence_ids_including_trash(int $master_id): array
{
	return bl_event_get_occurrence_ids($master_id, [
		'publish',
		'draft',
		'pending',
		'future',
		'private',
		'trash',
	]);
}

/**
 * Whether this post is a series master (including when already in trash).
 */
function bl_event_is_series_master_post(int $post_id): bool
{
	if ($post_id <= 0 || !bl_is_event_post_type(get_post_type($post_id))) {
		return false;
	}
	if ((int) wp_get_post_parent_id($post_id) > 0) {
		return false;
	}
	if (bl_event_get_recurrence($post_id) !== null) {
		return true;
	}

	return bl_event_get_occurrence_ids_including_trash($post_id) !== [];
}

/**
 * Weekday key from DateTimeImmutable (mo…su).
 */
function bl_event_weekday_key(\DateTimeImmutable $dt): string
{
	$map = [1 => 'mo', 2 => 'tu', 3 => 'we', 4 => 'th', 5 => 'fr', 6 => 'sa', 7 => 'su'];

	return $map[(int) $dt->format('N')] ?? 'mo';
}

/**
 * Expand rule into occurrence start/end dates within horizon.
 *
 * @param array{freq: string, interval: int, byweekday: string[], ends: string, until: string|null, count: int|null} $rule
 * @return list<array{start_date: string, end_date: string}>
 */
function bl_event_expand_occurrences(array $rule, string $anchor_start, string $anchor_end, string $horizon_ymd): array
{
	if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $anchor_start)) {
		return [];
	}
	if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $anchor_end)) {
		$anchor_end = $anchor_start;
	}
	if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $horizon_ymd)) {
		return [];
	}

	$tz = bl_event_timezone();
	$start = \DateTimeImmutable::createFromFormat('Y-m-d', $anchor_start, $tz);
	$end = \DateTimeImmutable::createFromFormat('Y-m-d', $anchor_end, $tz);
	$horizon = \DateTimeImmutable::createFromFormat('Y-m-d', $horizon_ymd, $tz);
	if (!$start || !$end || !$horizon) {
		return [];
	}

	$span_days = (int) $start->diff($end)->format('%r%a');
	if ($span_days < 0) {
		$span_days = 0;
	}

	$until = $horizon;
	if ($rule['ends'] === 'on_date' && !empty($rule['until'])) {
		$until_dt = \DateTimeImmutable::createFromFormat('Y-m-d', $rule['until'], $tz);
		if ($until_dt && $until_dt < $until) {
			$until = $until_dt;
		}
	}

	$max = 500;
	if ($rule['ends'] === 'after' && !empty($rule['count'])) {
		$max = min($max, (int) $rule['count']);
	}

	$out = [];
	$freq = $rule['freq'];
	$interval = max(1, (int) $rule['interval']);

	if ($freq === 'weekly') {
		$wanted = $rule['byweekday'];
		if ($wanted === []) {
			return [];
		}
		// Monday of the week containing the anchor (ISO weekday: Mon=1).
		$n = (int) $start->format('N');
		$week_start = $start->modify('-' . ($n - 1) . ' days');
		$week_index = 0;
		$cursor = $week_start;
		$guard = 0;
		while ($cursor <= $until && count($out) < $max && $guard < 5000) {
			++$guard;
			if ($week_index % $interval === 0) {
				foreach (['mo', 'tu', 'we', 'th', 'fr', 'sa', 'su'] as $day) {
					if (!in_array($day, $wanted, true)) {
						continue;
					}
					$day_offset = ['mo' => 0, 'tu' => 1, 'we' => 2, 'th' => 3, 'fr' => 4, 'sa' => 5, 'su' => 6][$day];
					$occ = $cursor->modify('+' . $day_offset . ' days');
					if ($occ < $start || $occ > $until) {
						continue;
					}
					$occ_end = $occ->modify('+' . $span_days . ' days');
					$out[] = [
						'start_date' => $occ->format('Y-m-d'),
						'end_date' => $occ_end->format('Y-m-d'),
					];
					if (count($out) >= $max) {
						break 2;
					}
				}
			}
			$cursor = $cursor->modify('+7 days');
			++$week_index;
		}

		return $out;
	}

	$cursor = $start;
	$guard = 0;
	while ($cursor <= $until && count($out) < $max && $guard < 5000) {
		++$guard;
		$occ_end = $cursor->modify('+' . $span_days . ' days');
		$out[] = [
			'start_date' => $cursor->format('Y-m-d'),
			'end_date' => $occ_end->format('Y-m-d'),
		];

		if ($freq === 'daily') {
			$cursor = $cursor->modify('+' . $interval . ' days');
		} elseif ($freq === 'monthly') {
			$day = (int) $start->format('j');
			$next = $cursor->modify('+' . $interval . ' months');
			$last = (int) $next->format('t');
			$next = $next->setDate((int) $next->format('Y'), (int) $next->format('m'), min($day, $last));
			$cursor = $next;
		} elseif ($freq === 'yearly') {
			$cursor = $cursor->modify('+' . $interval . ' years');
		} else {
			break;
		}
	}

	return $out;
}

/**
 * Weekday labels for summaries (translated short names).
 *
 * @return array<string, string>
 */
function bl_event_weekday_labels(): array
{
	return [
		'mo' => __('Mon', 'baselayer-events'),
		'tu' => __('Tue', 'baselayer-events'),
		'we' => __('Wed', 'baselayer-events'),
		'th' => __('Thu', 'baselayer-events'),
		'fr' => __('Fri', 'baselayer-events'),
		'sa' => __('Sat', 'baselayer-events'),
		'su' => __('Sun', 'baselayer-events'),
	];
}

/**
 * Multi-line human summary for the sidebar.
 *
 * @return string[]
 */
function bl_event_format_recurrence_summary_lines(?array $rule): array
{
	if ($rule === null) {
		return [__('Not repeating', 'baselayer-events')];
	}

	$lines = [];
	$freq_labels = [
		'daily' => __('Daily', 'baselayer-events'),
		'weekly' => __('Weekly', 'baselayer-events'),
		'monthly' => __('Monthly', 'baselayer-events'),
		'yearly' => __('Yearly', 'baselayer-events'),
	];
	$freq = $freq_labels[$rule['freq']] ?? ucfirst($rule['freq']);
	if ($rule['interval'] > 1) {
		if ($rule['freq'] === 'daily') {
			/* translators: %d: interval */
			$freq = sprintf(__('Every %d days', 'baselayer-events'), $rule['interval']);
		} elseif ($rule['freq'] === 'weekly') {
			/* translators: %d: interval */
			$freq = sprintf(__('Every %d weeks', 'baselayer-events'), $rule['interval']);
		} elseif ($rule['freq'] === 'monthly') {
			/* translators: %d: interval */
			$freq = sprintf(__('Every %d months', 'baselayer-events'), $rule['interval']);
		} else {
			/* translators: %d: interval */
			$freq = sprintf(__('Every %d years', 'baselayer-events'), $rule['interval']);
		}
	}
	$lines[] = $freq;

	if ($rule['freq'] === 'weekly' && $rule['byweekday'] !== []) {
		$labels = bl_event_weekday_labels();
		$days = [];
		foreach ($rule['byweekday'] as $key) {
			if (isset($labels[$key])) {
				$days[] = $labels[$key];
			}
		}
		if ($days !== []) {
			$lines[] = implode(', ', $days);
		}
	}

	if ($rule['ends'] === 'on_date' && !empty($rule['until'])) {
		$tz = bl_event_timezone();
		$ts = bl_event_to_timestamp($rule['until'], '', false);
		if ($ts > 0) {
			/* translators: %s: formatted end date */
			$lines[] = sprintf(__('Until %s', 'baselayer-events'), wp_date(get_option('date_format', 'F j, Y'), $ts, $tz));
		}
	} elseif ($rule['ends'] === 'after' && !empty($rule['count'])) {
		/* translators: %d: number of occurrences */
		$lines[] = sprintf(_n('After %d occurrence', 'After %d occurrences', (int) $rule['count'], 'baselayer-events'), (int) $rule['count']);
	}

	return $lines;
}

/**
 * Copy taxonomies from master to occurrence.
 */
function bl_event_copy_taxonomies(int $master_id, int $occurrence_id): void
{
	$taxonomies = get_object_taxonomies(get_post_type($master_id));
	foreach ($taxonomies as $taxonomy) {
		$terms = wp_get_object_terms($master_id, $taxonomy, ['fields' => 'ids']);
		if (is_wp_error($terms)) {
			continue;
		}
		wp_set_object_terms($occurrence_id, array_map('intval', $terms), $taxonomy, false);
	}
}

/**
 * Push master content onto an occurrence (skips fields listed in series overrides).
 *
 * @param list<string>|null $force_fields When set, only these fields are applied (ignores overrides). Null = all non-overridden.
 */
function bl_event_apply_master_content(int $master_id, int $occurrence_id, ?array $force_fields = null): void
{
	$master = get_post($master_id);
	$occurrence = get_post($occurrence_id);
	if (!$master || !$occurrence) {
		return;
	}

	$overrides = $force_fields !== null
		? []
		: array_fill_keys(bl_event_get_series_overrides($occurrence_id), true);
	$only = $force_fields !== null ? array_fill_keys($force_fields, true) : null;
	$should = static function (string $field) use ($overrides, $only): bool {
		if ($only !== null) {
			return isset($only[$field]);
		}

		return !isset($overrides[$field]);
	};

	$GLOBALS['bl_event_syncing'] = true;

	$post_update = ['ID' => $occurrence_id];
	if ($should('title')) {
		$post_update['post_title'] = $master->post_title;
	}
	if ($should('content')) {
		$post_update['post_content'] = $master->post_content;
	}
	if ($should('excerpt')) {
		$post_update['post_excerpt'] = $master->post_excerpt;
	}
	if ($should('status')) {
		$post_update['post_status'] = $master->post_status;
	}
	if (count($post_update) > 1) {
		wp_update_post($post_update);
	}

	if ($should('thumbnail')) {
		$thumb = get_post_thumbnail_id($master_id);
		if ($thumb) {
			set_post_thumbnail($occurrence_id, $thumb);
		} else {
			delete_post_thumbnail($occurrence_id);
		}
	}
	if ($should('taxonomies')) {
		bl_event_copy_taxonomies($master_id, $occurrence_id);
	}
	if ($should('metadata') && function_exists('bl_event_copy_metadata')) {
		bl_event_copy_metadata($master_id, $occurrence_id);
	}

	$GLOBALS['bl_event_syncing'] = false;
}

/**
 * Create or update occurrence children for a master within the lookahead.
 * Past occurrences are never modified or deleted.
 * Customized (field-override) future occurrences are still removed when the date leaves the rule.
 */
function bl_event_sync_series(int $master_id): void
{
	if (!empty($GLOBALS['bl_event_syncing'])) {
		return;
	}
	if ($master_id <= 0 || !bl_is_event_post_type(get_post_type($master_id))) {
		return;
	}
	if (wp_is_post_revision($master_id)) {
		return;
	}
	if (bl_event_is_occurrence($master_id)) {
		return;
	}

	$rule = bl_event_get_recurrence($master_id);
	$schedule = bl_event_get_schedule($master_id);
	$post_type = get_post_type($master_id);
	$now = time();

	$existing = bl_event_get_occurrence_ids($master_id);
	$by_date = [];
	foreach ($existing as $oid) {
		$sd = get_post_meta($oid, BL_EVENT_META_START_DATE, true);
		if (is_string($sd) && preg_match('/^\d{4}-\d{2}-\d{2}$/', $sd)) {
			$by_date[$sd] = $oid;
		}
	}

	if ($rule === null) {
		// No rule: remove future occurrences only.
		$GLOBALS['bl_event_syncing'] = true;
		foreach ($existing as $oid) {
			$start_ts = bl_event_get_start_timestamp($oid);
			if ($start_ts >= $now) {
				wp_delete_post($oid, true);
			}
		}
		$GLOBALS['bl_event_syncing'] = false;
		bl_event_clear_exdates($master_id);

		return;
	}

	// Rule without a start date: keep existing children; cannot expand new ones yet.
	if ($schedule === null) {
		return;
	}

	$exdates = array_fill_keys(bl_event_get_exdates($master_id), true);

	$horizon = bl_event_recurrence_horizon_date($post_type);
	$dates = bl_event_expand_occurrences(
		$rule,
		$schedule['start_date'],
		$schedule['end_date'],
		$horizon
	);
	$wanted_dates = [];

	$GLOBALS['bl_event_syncing'] = true;

	foreach ($dates as $slot) {
		$wanted_dates[$slot['start_date']] = true;
		if (isset($exdates[$slot['start_date']])) {
			// User excluded this date — do not create or revive.
			continue;
		}
		$start_ts = bl_event_to_timestamp($slot['start_date'], $schedule['start_time'], false);
		if ($start_ts > 0 && $start_ts < $now) {
			// Past slot: leave existing alone; do not create missing past.
			continue;
		}

		if (isset($by_date[$slot['start_date']])) {
			$oid = $by_date[$slot['start_date']];
			update_post_meta($oid, BL_EVENT_META_START_DATE, $slot['start_date']);
			update_post_meta($oid, BL_EVENT_META_END_DATE, $slot['end_date']);
			update_post_meta($oid, BL_EVENT_META_START_TIME, $schedule['start_time']);
			update_post_meta($oid, BL_EVENT_META_END_TIME, $schedule['end_time']);
			update_post_meta($oid, BL_EVENT_META_OCCURRENCE_OF, $master_id);
			bl_event_recalculate_timestamps($oid);
			continue;
		}

		$master = get_post($master_id);
		if (!$master) {
			continue;
		}

		$new_id = wp_insert_post([
			'post_type' => $post_type,
			'post_title' => $master->post_title,
			'post_content' => $master->post_content,
			'post_excerpt' => $master->post_excerpt,
			'post_status' => $master->post_status,
			'post_author' => (int) $master->post_author,
			'post_parent' => $master_id,
		], true);

		if (is_wp_error($new_id) || !$new_id) {
			continue;
		}

		$new_id = (int) $new_id;
		update_post_meta($new_id, BL_EVENT_META_START_DATE, $slot['start_date']);
		update_post_meta($new_id, BL_EVENT_META_END_DATE, $slot['end_date']);
		update_post_meta($new_id, BL_EVENT_META_START_TIME, $schedule['start_time']);
		update_post_meta($new_id, BL_EVENT_META_END_TIME, $schedule['end_time']);
		update_post_meta($new_id, BL_EVENT_META_OCCURRENCE_OF, $master_id);
		$thumb = get_post_thumbnail_id($master_id);
		if ($thumb) {
			set_post_thumbnail($new_id, $thumb);
		}
		bl_event_copy_taxonomies($master_id, $new_id);
		if (function_exists('bl_event_copy_metadata')) {
			bl_event_copy_metadata($master_id, $new_id);
		}
		bl_event_recalculate_timestamps($new_id);
		$by_date[$slot['start_date']] = $new_id;
	}

	// Prune future occurrences that are no longer in the rule (or are excluded).
	foreach ($by_date as $date => $oid) {
		$start_ts = bl_event_get_start_timestamp($oid);
		if ($start_ts < $now) {
			continue;
		}
		if (!isset($wanted_dates[$date]) || isset($exdates[$date])) {
			wp_delete_post($oid, true);
		}
	}

	$GLOBALS['bl_event_syncing'] = false;
}

/**
 * Sync master content to future occurrences (respecting per-field overrides).
 */
function bl_event_sync_series_content(int $master_id): void
{
	if (!empty($GLOBALS['bl_event_syncing'])) {
		return;
	}
	if ($master_id <= 0 || bl_event_is_occurrence($master_id)) {
		return;
	}
	if (bl_event_get_recurrence($master_id) === null) {
		return;
	}

	$now = time();
	foreach (bl_event_get_occurrence_ids($master_id) as $oid) {
		$start_ts = bl_event_get_start_timestamp($oid);
		if ($start_ts > 0 && $start_ts < $now) {
			continue;
		}
		bl_event_apply_master_content($master_id, $oid);
	}
}

/**
 * Revert an occurrence to master content and clear field overrides.
 */
function bl_event_revert_occurrence_to_master(int $occurrence_id): bool
{
	$master_id = bl_event_get_master_id($occurrence_id);
	if ($master_id <= 0) {
		return false;
	}
	bl_event_set_series_overrides($occurrence_id, []);
	bl_event_apply_master_content($master_id, $occurrence_id, BL_EVENT_SERIES_OVERRIDE_KEYS);

	return true;
}

/**
 * Promote an occurrence to a standalone event (leaves the series permanently).
 * Adds an EXDATE on the master so sync does not recreate the date.
 *
 * @return true|\WP_Error
 */
function bl_event_make_occurrence_standalone(int $occurrence_id)
{
	if ($occurrence_id <= 0 || !bl_event_is_occurrence($occurrence_id)) {
		return new \WP_Error('bl_not_occurrence', __('Not an occurrence.', 'baselayer-events'), ['status' => 400]);
	}
	if (!current_user_can('edit_post', $occurrence_id)) {
		return new \WP_Error('bl_forbidden', __('Sorry, you are not allowed to edit this event.', 'baselayer-events'), ['status' => 403]);
	}

	$master_id = bl_event_get_master_id($occurrence_id);
	if ($master_id <= 0) {
		return new \WP_Error('bl_no_master', __('Master event not found.', 'baselayer-events'), ['status' => 400]);
	}

	$start = get_post_meta($occurrence_id, BL_EVENT_META_START_DATE, true);
	if (!is_string($start) || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $start)) {
		return new \WP_Error('bl_bad_date', __('Invalid date.', 'baselayer-events'), ['status' => 400]);
	}

	$GLOBALS['bl_event_syncing'] = true;
	bl_event_add_exdate($master_id, $start);
	update_post_meta($occurrence_id, BL_EVENT_META_STANDALONE_FROM, $master_id);
	wp_update_post([
		'ID' => $occurrence_id,
		'post_parent' => 0,
	]);
	delete_post_meta($occurrence_id, BL_EVENT_META_OCCURRENCE_OF);
	bl_event_set_series_overrides($occurrence_id, []);
	$GLOBALS['bl_event_syncing'] = false;

	return true;
}

/**
 * Find a standalone event that left this master on the given start date.
 */
function bl_event_find_standalone_for_date(int $master_id, string $start_date): int
{
	if ($master_id <= 0 || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $start_date)) {
		return 0;
	}
	$post_type = get_post_type($master_id);
	if (!$post_type || !bl_is_event_post_type($post_type)) {
		return 0;
	}

	$ids = get_posts([
		'post_type' => $post_type,
		'post_status' => ['publish', 'draft', 'pending', 'future', 'private'],
		'posts_per_page' => 1,
		'fields' => 'ids',
		'no_found_rows' => true,
		'meta_query' => [
			'relation' => 'AND',
			[
				'key' => BL_EVENT_META_STANDALONE_FROM,
				'value' => $master_id,
				'compare' => '=',
				'type' => 'NUMERIC',
			],
			[
				'key' => BL_EVENT_META_START_DATE,
				'value' => $start_date,
				'compare' => '=',
			],
		],
	]);

	return $ids !== [] ? (int) $ids[0] : 0;
}

/**
 * After user saves an occurrence, mark diverged fields so master sync skips them.
 */
function bl_event_maybe_update_occurrence_overrides_on_save(int $post_id): void
{
	if (!empty($GLOBALS['bl_event_syncing'])) {
		return;
	}
	if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
		return;
	}
	if (wp_is_post_revision($post_id)) {
		return;
	}
	if (!bl_event_is_occurrence($post_id)) {
		return;
	}
	if (!current_user_can('edit_post', $post_id)) {
		return;
	}

	$master_id = bl_event_get_master_id($post_id);
	if ($master_id <= 0) {
		return;
	}

	$master = get_post($master_id);
	$post = get_post($post_id);
	if (!$master || !$post) {
		return;
	}

	$overrides = [];

	if ($master->post_title !== $post->post_title) {
		$overrides[] = 'title';
	}
	if ($master->post_content !== $post->post_content) {
		$overrides[] = 'content';
	}
	if ($master->post_excerpt !== $post->post_excerpt) {
		$overrides[] = 'excerpt';
	}
	if ($master->post_status !== $post->post_status) {
		$overrides[] = 'status';
	}
	if ((int) get_post_thumbnail_id($master_id) !== (int) get_post_thumbnail_id($post_id)) {
		$overrides[] = 'thumbnail';
	}

	$tax_diverged = false;
	$taxonomies = get_object_taxonomies($post->post_type);
	foreach ($taxonomies as $taxonomy) {
		$a = wp_get_object_terms($master_id, $taxonomy, ['fields' => 'ids']);
		$b = wp_get_object_terms($post_id, $taxonomy, ['fields' => 'ids']);
		if (is_wp_error($a) || is_wp_error($b)) {
			continue;
		}
		sort($a);
		sort($b);
		if ($a !== $b) {
			$tax_diverged = true;
			break;
		}
	}
	if ($tax_diverged) {
		$overrides[] = 'taxonomies';
	}

	if (function_exists('bl_event_get_metadata')) {
		$meta_m = bl_event_get_metadata($master_id);
		$meta_o = bl_event_get_metadata($post_id);
		if ($meta_m !== $meta_o) {
			$overrides[] = 'metadata';
		}
	}

	bl_event_set_series_overrides($post_id, $overrides);
}

/**
 * Whether series sync should run for this post id.
 */
function bl_event_can_sync_series_for_post(int $post_id): bool
{
	if ($post_id <= 0 || !bl_is_event_post_type(get_post_type($post_id))) {
		return false;
	}
	if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
		return false;
	}
	if (wp_is_post_revision($post_id)) {
		return false;
	}
	if (!current_user_can('edit_post', $post_id)) {
		return false;
	}
	if (!empty($GLOBALS['bl_event_syncing'])) {
		return false;
	}

	return true;
}

/**
 * Recalc timestamps, update occurrence overrides, sync master series (meta must already be written).
 */
function bl_event_run_series_sync(int $post_id): void
{
	if (!bl_event_can_sync_series_for_post($post_id)) {
		return;
	}

	bl_event_recalculate_timestamps($post_id);

	if (bl_event_is_occurrence($post_id)) {
		bl_event_maybe_update_occurrence_overrides_on_save($post_id);

		return;
	}

	bl_event_sync_series($post_id);
	bl_event_sync_series_content($post_id);
}

/**
 * Classic editor / non-REST saves: meta is usually available during save_post.
 * Block editor REST saves meta AFTER save_post — defer sync to rest_after_*.
 */
function bl_event_save_series(int $post_id): void
{
	if (!bl_event_can_sync_series_for_post($post_id)) {
		return;
	}

	// During REST, meta from the request is not written yet; rest_after_* handles sync.
	if (defined('REST_REQUEST') && REST_REQUEST) {
		if (bl_event_is_occurrence($post_id)) {
			bl_event_recalculate_timestamps($post_id);
			bl_event_maybe_update_occurrence_overrides_on_save($post_id);
		}

		return;
	}

	bl_event_run_series_sync($post_id);
}

/**
 * Block editor: post meta is written after wp_update_post; sync here so the rule exists.
 *
 * @param \WP_Post         $post     Inserted/updated post.
 * @param \WP_REST_Request $request  Request.
 * @param bool             $creating Whether this is a create.
 */
function bl_event_rest_after_save_event($post, $request, $creating): void
{
	unset($request, $creating);
	if (!$post instanceof \WP_Post) {
		return;
	}
	bl_event_run_series_sync((int) $post->ID);
}

/**
 * Register recurrence meta + hooks for event post types.
 */
function bl_event_register_recurrence_hooks(): void
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

		register_post_meta($post_type, BL_EVENT_META_RECURRENCE, [
			'type' => 'string',
			'single' => true,
			'show_in_rest' => true,
			'auth_callback' => $auth,
			'sanitize_callback' => static function ($value): string {
				if (!is_string($value)) {
					return '';
				}
				$value = trim($value);
				if ($value === '') {
					return '';
				}
				$parsed = bl_event_parse_recurrence($value);

				return $parsed ? bl_event_encode_recurrence($parsed) : '';
			},
		]);

		register_post_meta($post_type, BL_EVENT_META_OCCURRENCE_OF, [
			'type' => 'integer',
			'single' => true,
			'show_in_rest' => true,
			'auth_callback' => $auth,
			'sanitize_callback' => static function ($value): int {
				return max(0, (int) $value);
			},
		]);

		register_post_meta($post_type, BL_EVENT_META_SERIES_OVERRIDES, [
			'type' => 'string',
			'single' => true,
			'show_in_rest' => true,
			'auth_callback' => $auth,
			'sanitize_callback' => static function ($value): string {
				if (is_array($value)) {
					$keys = $value;
				} elseif (is_string($value) && $value !== '') {
					$decoded = json_decode($value, true);
					$keys = is_array($decoded) ? $decoded : [];
				} else {
					$keys = [];
				}
				$allowed = array_fill_keys(BL_EVENT_SERIES_OVERRIDE_KEYS, true);
				$clean = [];
				foreach ($keys as $key) {
					if (!is_string($key)) {
						continue;
					}
					$key = sanitize_key($key);
					if (isset($allowed[$key])) {
						$clean[] = $key;
					}
				}
				$clean = array_values(array_unique($clean));

				return $clean === [] ? '' : (string) wp_json_encode($clean, JSON_UNESCAPED_SLASHES);
			},
		]);

		register_post_meta($post_type, BL_EVENT_META_STANDALONE_FROM, [
			'type' => 'integer',
			'single' => true,
			'show_in_rest' => true,
			'auth_callback' => $auth,
			'sanitize_callback' => static function ($value): int {
				return max(0, (int) $value);
			},
		]);

		add_action('save_post_' . $post_type, 'bl_event_save_series', 30);
		// After meta from the REST request has been persisted.
		add_action('rest_after_insert_' . $post_type, 'bl_event_rest_after_save_event', 20, 3);

		register_post_meta($post_type, BL_EVENT_META_EXDATES, [
			'type' => 'string',
			'single' => true,
			'show_in_rest' => true,
			'auth_callback' => $auth,
			'sanitize_callback' => static function ($value): string {
				$parsed = bl_event_parse_exdates($value);

				return $parsed === [] ? '' : (string) wp_json_encode($parsed, JSON_UNESCAPED_SLASHES);
			},
		]);
	}

	add_action('before_delete_post', 'bl_event_on_occurrence_before_delete');
	add_filter('pre_trash_post', 'bl_event_pre_trash_occurrence', 10, 3);
	add_action('trashed_post', 'bl_event_on_master_trashed', 5);
	add_action('untrashed_post', 'bl_event_on_master_untrashed', 5);
	add_action('before_delete_post', 'bl_event_on_master_before_delete', 5);

	if (!wp_next_scheduled(BL_EVENT_CRON_HOOK)) {
		wp_schedule_event(time() + HOUR_IN_SECONDS, 'daily', BL_EVENT_CRON_HOOK);
	}
}

add_action('init', 'bl_event_register_recurrence_hooks', 22);
add_action(BL_EVENT_CRON_HOOK, 'bl_event_cron_extend_recurring_series');

/**
 * Series-linkage meta keys that must never be cloned onto a duplicate.
 *
 * @return list<string>
 */
function bl_event_series_linkage_meta_keys(): array
{
	return [
		BL_EVENT_META_RECURRENCE,
		BL_EVENT_META_OCCURRENCE_OF,
		BL_EVENT_META_SERIES_OVERRIDES,
		BL_EVENT_META_STANDALONE_FROM,
		BL_EVENT_META_EXDATES,
	];
}

/**
 * @param list<string> $keys
 * @return list<string>
 */
function bl_event_duplicate_exclude_meta_keys(array $keys, int $source_id, string $post_type): array
{
	unset($source_id);
	if (!bl_is_event_post_type($post_type)) {
		return $keys;
	}

	return array_values(array_unique(array_merge($keys, bl_event_series_linkage_meta_keys())));
}

/**
 * Duplicates are always standalone one-offs (never series children / masters).
 *
 * @param array<string, mixed> $new_post
 * @return array<string, mixed>
 */
function bl_event_duplicate_post_args(array $new_post, $post): array
{
	if (!$post instanceof \WP_Post || !bl_is_event_post_type($post->post_type)) {
		return $new_post;
	}
	$new_post['post_parent'] = 0;

	return $new_post;
}

/**
 * Belt-and-suspenders: strip series linkage after meta copy.
 *
 * @param \WP_Post $source Source post.
 */
function bl_event_on_duplicate_post(int $new_post_id, int $source_id, $source): void
{
	unset($source_id);
	if ($new_post_id <= 0 || !$source instanceof \WP_Post || !bl_is_event_post_type($source->post_type)) {
		return;
	}

	if ((int) wp_get_post_parent_id($new_post_id) !== 0) {
		wp_update_post([
			'ID' => $new_post_id,
			'post_parent' => 0,
		]);
	}

	foreach (bl_event_series_linkage_meta_keys() as $key) {
		delete_post_meta($new_post_id, $key);
	}
}

add_filter('bl_duplicate_post_exclude_meta_keys', 'bl_event_duplicate_exclude_meta_keys', 10, 3);
add_filter('bl_duplicate_post_args', 'bl_event_duplicate_post_args', 10, 2);
add_action('bl_duplicate_post', 'bl_event_on_duplicate_post', 10, 3);

/**
 * Unschedule the daily series lookahead cron.
 */
function bl_event_clear_recurrence_cron(): void
{
	wp_clear_scheduled_hook(BL_EVENT_CRON_HOOK);
}

/**
 * Theme package path: clear cron when leaving BaseLayer (plugin path stays active).
 */
function bl_event_on_switch_theme(): void
{
	if (function_exists('bl_events_loaded_as_plugin') && bl_events_loaded_as_plugin()) {
		return;
	}
	bl_event_clear_recurrence_cron();
}

add_action('switch_theme', 'bl_event_on_switch_theme');

/**
 * Soft-delete an occurrence: EXDATE on master + force-remove the child post (never WP Trash).
 *
 * @return true|\WP_Error
 */
function bl_event_soft_delete_occurrence(int $occurrence_id)
{
	if ($occurrence_id <= 0 || !bl_event_is_occurrence($occurrence_id)) {
		return new \WP_Error('bl_not_occurrence', __('Not an occurrence.', 'baselayer-events'), ['status' => 400]);
	}
	$master_id = bl_event_get_master_id($occurrence_id);
	if ($master_id <= 0) {
		return new \WP_Error('bl_no_master', __('Master event not found.', 'baselayer-events'), ['status' => 400]);
	}
	$master_status = get_post_status($master_id);
	if ($master_status === false || $master_status === 'trash') {
		return new \WP_Error('bl_master_unavailable', __('Master event is not available.', 'baselayer-events'), ['status' => 400]);
	}

	$start = get_post_meta($occurrence_id, BL_EVENT_META_START_DATE, true);
	if (is_string($start) && preg_match('/^\d{4}-\d{2}-\d{2}$/', $start)) {
		bl_event_add_exdate($master_id, $start);
	}

	$GLOBALS['bl_event_syncing'] = true;
	wp_delete_post($occurrence_id, true);
	$GLOBALS['bl_event_syncing'] = false;

	return true;
}

/**
 * Intercept Move to Trash on occurrences → soft-delete instead.
 *
 * @param mixed         $check            Non-null aborts core trash.
 * @param \WP_Post|null $post             Post being trashed.
 * @param string        $previous_status  Previous status.
 * @return mixed
 */
function bl_event_pre_trash_occurrence($check, $post, $previous_status)
{
	unset($previous_status);
	if ($check !== null) {
		return $check;
	}
	if (!empty($GLOBALS['bl_event_syncing'])) {
		return $check;
	}
	if (!$post instanceof \WP_Post || !bl_event_is_occurrence((int) $post->ID)) {
		return $check;
	}

	$master_id = bl_event_get_master_id((int) $post->ID);
	$result = bl_event_soft_delete_occurrence((int) $post->ID);
	if (is_wp_error($result)) {
		return false;
	}

	if (is_admin() && !wp_doing_ajax() && !(defined('REST_REQUEST') && REST_REQUEST)) {
		$redirect = '';
		if ($master_id > 0) {
			$link = get_edit_post_link($master_id, 'raw');
			$redirect = is_string($link) ? $link : '';
		}
		if ($redirect === '') {
			$redirect = admin_url('edit.php?post_type=' . rawurlencode($post->post_type));
		}
		wp_safe_redirect(add_query_arg('bl_occurrence_removed', '1', $redirect));
		exit;
	}

	return true;
}

/**
 * Trash master → force-delete all occurrence children (never leave them in Trash).
 * Keep EXDATEs on the master so untrash does not recreate soft-deleted or standalone dates.
 */
function bl_event_on_master_trashed(int $post_id): void
{
	if (!empty($GLOBALS['bl_event_syncing'])) {
		return;
	}
	if ($post_id <= 0 || !bl_event_is_series_master_post($post_id)) {
		return;
	}
	if (bl_event_is_occurrence($post_id)) {
		return;
	}

	$GLOBALS['bl_event_syncing'] = true;
	foreach (bl_event_get_occurrence_ids_including_trash($post_id) as $oid) {
		wp_delete_post($oid, true);
	}
	$GLOBALS['bl_event_syncing'] = false;
}

/**
 * Ensure EXDATEs still cover every standalone event that left this master.
 * Heals masters whose EXDATEs were wiped by older trash handling.
 */
function bl_event_reapply_standalone_exdates(int $master_id): void
{
	if ($master_id <= 0 || !bl_is_event_post_type(get_post_type($master_id))) {
		return;
	}
	$post_type = get_post_type($master_id);
	if (!$post_type) {
		return;
	}

	$ids = get_posts([
		'post_type' => $post_type,
		'post_status' => ['publish', 'draft', 'pending', 'future', 'private'],
		'posts_per_page' => -1,
		'fields' => 'ids',
		'no_found_rows' => true,
		'meta_query' => [
			[
				'key' => BL_EVENT_META_STANDALONE_FROM,
				'value' => $master_id,
				'compare' => '=',
				'type' => 'NUMERIC',
			],
		],
	]);

	foreach ($ids as $oid) {
		$start = get_post_meta((int) $oid, BL_EVENT_META_START_DATE, true);
		if (is_string($start) && preg_match('/^\d{4}-\d{2}-\d{2}$/', $start)) {
			bl_event_add_exdate($master_id, $start);
		}
	}
}

/**
 * Untrash master → rebuild occurrence window via sync (EXDATEs + standalones preserved).
 */
function bl_event_on_master_untrashed(int $post_id): void
{
	if (!empty($GLOBALS['bl_event_syncing'])) {
		return;
	}
	if ($post_id <= 0 || !bl_is_event_post_type(get_post_type($post_id))) {
		return;
	}
	if ((int) wp_get_post_parent_id($post_id) > 0) {
		return;
	}
	if (bl_event_get_recurrence($post_id) === null) {
		return;
	}

	bl_event_reapply_standalone_exdates($post_id);
	bl_event_sync_series($post_id);
	bl_event_sync_series_content($post_id);
}

/**
 * Permanent delete master → permanently delete all occurrence children.
 */
function bl_event_on_master_before_delete(int $post_id): void
{
	if (!empty($GLOBALS['bl_event_syncing'])) {
		return;
	}
	if ($post_id <= 0 || !bl_is_event_post_type(get_post_type($post_id))) {
		return;
	}
	if ((int) wp_get_post_parent_id($post_id) > 0) {
		return;
	}
	if (!bl_event_is_series_master_post($post_id)) {
		return;
	}

	$GLOBALS['bl_event_syncing'] = true;
	foreach (bl_event_get_occurrence_ids_including_trash($post_id) as $oid) {
		wp_delete_post($oid, true);
	}
	$GLOBALS['bl_event_syncing'] = false;
}

/**
 * Permanent delete of an occurrence (non-helper path) → keep the date excluded.
 */
function bl_event_on_occurrence_before_delete(int $post_id): void
{
	if (!empty($GLOBALS['bl_event_syncing'])) {
		return;
	}
	if ($post_id <= 0 || !bl_event_is_occurrence($post_id)) {
		return;
	}
	$master_id = bl_event_get_master_id($post_id);
	if ($master_id <= 0 || (int) $master_id === $post_id) {
		return;
	}
	if (get_post_status($master_id) === false || get_post_status($master_id) === 'trash') {
		return;
	}
	$start = get_post_meta($post_id, BL_EVENT_META_START_DATE, true);
	if (!is_string($start) || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $start)) {
		return;
	}
	bl_event_add_exdate($master_id, $start);
}

/**
 * Daily: re-sync all masters so the lookahead window stays filled.
 */
function bl_event_cron_extend_recurring_series(): void
{
	foreach (bl_event_post_types() as $post_type) {
		$masters = get_posts([
			'post_type' => $post_type,
			'post_status' => ['publish', 'draft', 'pending', 'future', 'private'],
			'posts_per_page' => -1,
			'fields' => 'ids',
			'post_parent' => 0,
			'meta_key' => BL_EVENT_META_RECURRENCE,
			'meta_compare' => '!=',
			'meta_value' => '',
			'no_found_rows' => true,
		]);
		foreach ($masters as $master_id) {
			$master_id = (int) $master_id;
			if (bl_event_get_recurrence($master_id) !== null) {
				bl_event_sync_series($master_id);
			}
		}
	}
}

/**
 * Exclude series masters from front archives / upcoming candidate lists.
 */
function bl_event_is_public_occurrence_listing_id(int $post_id): bool
{
	if (bl_event_is_series_master($post_id)) {
		return false;
	}

	return true;
}

/**
 * REST: revert occurrence content to master.
 */
function bl_event_register_revert_rest_route(): void
{
	register_rest_route('baselayer/v1', '/event-revert/(?P<id>\d+)', [
		'methods' => 'POST',
		'permission_callback' => static function (\WP_REST_Request $request): bool {
			$id = (int) $request['id'];

			return $id > 0 && current_user_can('edit_post', $id);
		},
		'callback' => static function (\WP_REST_Request $request) {
			$id = (int) $request['id'];
			if (!bl_event_is_occurrence($id)) {
				return new \WP_Error('bl_not_occurrence', __('Not an occurrence.', 'baselayer-events'), ['status' => 400]);
			}
			bl_event_revert_occurrence_to_master($id);
			$post = get_post($id);

			return rest_ensure_response([
				'id' => $id,
				'customized' => false,
				'title' => $post ? $post->post_title : '',
			]);
		},
	]);
}

add_action('rest_api_init', 'bl_event_register_revert_rest_route');

/**
 * REST: promote occurrence to a standalone event.
 */
function bl_event_register_standalone_rest_route(): void
{
	register_rest_route('baselayer/v1', '/event-standalone/(?P<id>\d+)', [
		'methods' => 'POST',
		'permission_callback' => static function (\WP_REST_Request $request): bool {
			$id = (int) $request['id'];

			return $id > 0 && current_user_can('edit_post', $id);
		},
		'callback' => static function (\WP_REST_Request $request) {
			$id = (int) $request['id'];
			$result = bl_event_make_occurrence_standalone($id);
			if (is_wp_error($result)) {
				return $result;
			}
			$edit = get_edit_post_link($id, 'raw');

			return rest_ensure_response([
				'id' => $id,
				'standalone' => true,
				'edit_link' => is_string($edit) ? $edit : '',
			]);
		},
	]);
}

add_action('rest_api_init', 'bl_event_register_standalone_rest_route');

/**
 * Upcoming occurrence rows for a master (start_ts >= now), ascending.
 * Includes user-deleted dates (EXDATEs) and standalone dates marked accordingly.
 *
 * @return list<array{id: int, title: string, start_date: string, end_date: string, range_text: string, edit_link: string, customized: bool, standalone: bool, deleted: bool}>
 */
function bl_event_get_upcoming_occurrence_rows(int $master_id, int $limit = 200): array
{
	if ($master_id <= 0 || !bl_event_is_series_master($master_id)) {
		return [];
	}

	$now = time();
	$tz = bl_event_timezone();
	$today = (new \DateTimeImmutable('now', $tz))->format('Y-m-d');
	$master_schedule = bl_event_get_schedule($master_id);
	$span_days = 0;
	$start_time = '';
	$end_time = '';
	if ($master_schedule !== null) {
		$start_time = $master_schedule['start_time'];
		$end_time = $master_schedule['end_time'];
		$ms = \DateTimeImmutable::createFromFormat('Y-m-d', $master_schedule['start_date'], $tz);
		$me = \DateTimeImmutable::createFromFormat('Y-m-d', $master_schedule['end_date'], $tz);
		if ($ms && $me) {
			$span_days = max(0, (int) $ms->diff($me)->format('%r%a'));
		}
	}

	$rows = [];
	$seen_dates = [];

	foreach (bl_event_get_occurrence_ids($master_id) as $oid) {
		$start_ts = bl_event_get_start_timestamp($oid);
		if ($start_ts <= 0 || $start_ts < $now) {
			continue;
		}
		$schedule = bl_event_get_schedule($oid);
		$start_date = $schedule['start_date'] ?? '';
		if ($start_date !== '') {
			$seen_dates[$start_date] = true;
		}
		$edit = get_edit_post_link($oid, 'raw');
		$rows[] = [
			'id' => $oid,
			'title' => (string) get_the_title($oid),
			'start_date' => $start_date,
			'end_date' => $schedule['end_date'] ?? '',
			'start_ts' => $start_ts,
			'range_text' => bl_event_format_range_text($oid, true),
			'edit_link' => is_string($edit) ? $edit : '',
			'customized' => bl_event_occurrence_has_overrides($oid),
			'standalone' => false,
			'deleted' => false,
			'status_key' => '',
			'status_label' => '',
			'status_color' => '',
		];
		if (function_exists('bl_event_get_status')) {
			$status = bl_event_get_status($oid);
			if ($status !== null) {
				$rows[count($rows) - 1]['status_key'] = $status['key'];
				$rows[count($rows) - 1]['status_label'] = $status['label'];
				$rows[count($rows) - 1]['status_color'] = function_exists('bl_event_status_css_color_value')
					? bl_event_status_css_color_value($status)
					: (string) ($status['color'] ?? '');
			}
		}
	}

	$rule = bl_event_get_recurrence($master_id);
	$exdates = bl_event_get_exdates($master_id);
	$wanted_exdates = [];
	if ($rule !== null && $master_schedule !== null && $exdates !== []) {
		$horizon = bl_event_recurrence_horizon_date(get_post_type($master_id) ?: null);
		$expanded = bl_event_expand_occurrences(
			$rule,
			$master_schedule['start_date'],
			$master_schedule['end_date'],
			$horizon
		);
		foreach ($expanded as $slot) {
			$wanted_exdates[$slot['start_date']] = $slot['end_date'];
		}
	}

	foreach ($exdates as $exdate) {
		if ($exdate < $today || isset($seen_dates[$exdate])) {
			continue;
		}
		// Only list exclusions that still belong to the current rule window.
		if ($wanted_exdates !== [] && !isset($wanted_exdates[$exdate])) {
			continue;
		}
		$end_date = $wanted_exdates[$exdate] ?? $exdate;
		if ($end_date === $exdate && $span_days > 0) {
			$dt = \DateTimeImmutable::createFromFormat('Y-m-d', $exdate, $tz);
			if ($dt) {
				$end_date = $dt->modify('+' . $span_days . ' days')->format('Y-m-d');
			}
		}
		$start_ts = bl_event_to_timestamp($exdate, $start_time, false);
		if ($start_ts > 0 && $start_ts < $now) {
			continue;
		}

		$standalone_id = bl_event_find_standalone_for_date($master_id, $exdate);
		if ($standalone_id > 0) {
			$edit = get_edit_post_link($standalone_id, 'raw');
			$schedule = bl_event_get_schedule($standalone_id);
			$row = [
				'id' => $standalone_id,
				'title' => (string) get_the_title($standalone_id),
				'start_date' => $exdate,
				'end_date' => $schedule['end_date'] ?? $end_date,
				'start_ts' => $start_ts > 0 ? $start_ts : 0,
				'range_text' => bl_event_format_range_text($standalone_id, true),
				'edit_link' => is_string($edit) ? $edit : '',
				'customized' => false,
				'standalone' => true,
				'deleted' => false,
				'status_key' => '',
				'status_label' => '',
				'status_color' => '',
			];
			if (function_exists('bl_event_get_status')) {
				$status = bl_event_get_status($standalone_id);
				if ($status !== null) {
					$row['status_key'] = $status['key'];
					$row['status_label'] = $status['label'];
					$row['status_color'] = function_exists('bl_event_status_css_color_value')
						? bl_event_status_css_color_value($status)
						: (string) ($status['color'] ?? '');
				}
			}
			$rows[] = $row;
			continue;
		}

		$rows[] = [
			'id' => 0,
			'title' => '',
			'start_date' => $exdate,
			'end_date' => $end_date,
			'start_ts' => $start_ts > 0 ? $start_ts : 0,
			'range_text' => bl_event_format_slot_range_text($exdate, $end_date, $start_time, $end_time, true),
			'edit_link' => '',
			'customized' => false,
			'standalone' => false,
			'deleted' => true,
			'status_key' => '',
			'status_label' => '',
			'status_color' => '',
		];
	}

	usort($rows, static function (array $a, array $b): int {
		if ($a['start_ts'] === $b['start_ts']) {
			return $a['id'] <=> $b['id'];
		}

		return $a['start_ts'] <=> $b['start_ts'];
	});

	if ($limit > 0 && count($rows) > $limit) {
		$rows = array_slice($rows, 0, $limit);
	}

	foreach ($rows as &$row) {
		unset($row['start_ts']);
	}
	unset($row);

	return $rows;
}

/**
 * REST: list upcoming occurrences for a master (admin modal).
 */
function bl_event_register_occurrences_list_rest_route(): void
{
	register_rest_route('baselayer/v1', '/event-occurrences/(?P<id>\d+)', [
		'methods' => 'GET',
		'permission_callback' => static function (\WP_REST_Request $request): bool {
			$id = (int) $request['id'];

			return $id > 0 && current_user_can('edit_post', $id);
		},
		'callback' => static function (\WP_REST_Request $request) {
			$id = (int) $request['id'];
			if (!bl_event_is_series_master($id)) {
				return new \WP_Error('bl_not_master', __('Not a recurring master event.', 'baselayer-events'), ['status' => 400]);
			}

			return rest_ensure_response([
				'master_id' => $id,
				'master_title' => (string) get_the_title($id),
				'occurrences' => bl_event_get_upcoming_occurrence_rows($id),
			]);
		},
	]);
}

add_action('rest_api_init', 'bl_event_register_occurrences_list_rest_route');

/**
 * Restore a skipped (EXDATE) occurrence date on a master.
 *
 * @return true|\WP_Error
 */
function bl_event_restore_occurrence_date(int $master_id, string $start_date)
{
	if ($master_id <= 0 || !bl_event_is_series_master($master_id)) {
		return new \WP_Error('bl_not_master', __('Not a recurring master event.', 'baselayer-events'), ['status' => 400]);
	}
	if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $start_date)) {
		return new \WP_Error('bl_bad_date', __('Invalid date.', 'baselayer-events'), ['status' => 400]);
	}
	if (bl_event_find_standalone_for_date($master_id, $start_date) > 0) {
		return new \WP_Error(
			'bl_standalone_date',
			__('This date is a standalone event and cannot be restored into the series.', 'baselayer-events'),
			['status' => 400]
		);
	}

	bl_event_remove_exdate($master_id, $start_date);
	bl_event_sync_series($master_id);
	bl_event_sync_series_content($master_id);

	return true;
}

/**
 * REST: restore a deleted occurrence date on a master.
 */
function bl_event_register_restore_occurrence_rest_route(): void
{
	register_rest_route('baselayer/v1', '/event-restore-occurrence', [
		'methods' => 'POST',
		'permission_callback' => static function (\WP_REST_Request $request): bool {
			$master_id = (int) $request->get_param('master_id');

			return $master_id > 0 && current_user_can('edit_post', $master_id);
		},
		'args' => [
			'master_id' => [
				'required' => true,
				'type' => 'integer',
			],
			'start_date' => [
				'required' => true,
				'type' => 'string',
			],
		],
		'callback' => static function (\WP_REST_Request $request) {
			$master_id = (int) $request->get_param('master_id');
			$start_date = (string) $request->get_param('start_date');
			$result = bl_event_restore_occurrence_date($master_id, $start_date);
			if (is_wp_error($result)) {
				return $result;
			}

			return rest_ensure_response([
				'master_id' => $master_id,
				'start_date' => $start_date,
				'occurrences' => bl_event_get_upcoming_occurrence_rows($master_id),
			]);
		},
	]);
}

add_action('rest_api_init', 'bl_event_register_restore_occurrence_rest_route');

/**
 * REST: soft-delete an occurrence (EXDATE + remove child post).
 */
function bl_event_register_soft_delete_occurrence_rest_route(): void
{
	register_rest_route('baselayer/v1', '/event-soft-delete-occurrence', [
		'methods' => 'POST',
		'permission_callback' => static function (\WP_REST_Request $request): bool {
			$master_id = (int) $request->get_param('master_id');

			return $master_id > 0 && current_user_can('edit_post', $master_id);
		},
		'args' => [
			'master_id' => [
				'required' => true,
				'type' => 'integer',
			],
			'occurrence_id' => [
				'required' => false,
				'type' => 'integer',
				'default' => 0,
			],
			'start_date' => [
				'required' => false,
				'type' => 'string',
				'default' => '',
			],
		],
		'callback' => static function (\WP_REST_Request $request) {
			$master_id = (int) $request->get_param('master_id');
			$occurrence_id = (int) $request->get_param('occurrence_id');
			$start_date = trim((string) $request->get_param('start_date'));

			if ($master_id <= 0 || !bl_event_is_series_master($master_id)) {
				return new \WP_Error('bl_not_master', __('Not a recurring master event.', 'baselayer-events'), ['status' => 400]);
			}

			if ($occurrence_id <= 0 && preg_match('/^\d{4}-\d{2}-\d{2}$/', $start_date)) {
				foreach (bl_event_get_occurrence_ids($master_id) as $oid) {
					$sd = get_post_meta($oid, BL_EVENT_META_START_DATE, true);
					if (is_string($sd) && $sd === $start_date) {
						$occurrence_id = $oid;
						break;
					}
				}
			}

			if ($occurrence_id <= 0) {
				return new \WP_Error('bl_not_occurrence', __('Not an occurrence.', 'baselayer-events'), ['status' => 400]);
			}
			if (bl_event_get_master_id($occurrence_id) !== $master_id) {
				return new \WP_Error('bl_wrong_master', __('Occurrence does not belong to this master.', 'baselayer-events'), ['status' => 400]);
			}

			$result = bl_event_soft_delete_occurrence($occurrence_id);
			if (is_wp_error($result)) {
				return $result;
			}

			return rest_ensure_response([
				'master_id' => $master_id,
				'occurrences' => bl_event_get_upcoming_occurrence_rows($master_id),
			]);
		},
	]);
}

add_action('rest_api_init', 'bl_event_register_soft_delete_occurrence_rest_route');

/**
 * Expose occurrence count on masters for the editor sidebar.
 */
function bl_event_register_occurrence_count_rest_field(): void
{
	foreach (bl_event_post_types() as $post_type) {
		register_rest_field($post_type, 'bl_occurrence_count', [
			'get_callback' => static function (array $post): int {
				$id = (int) ($post['id'] ?? 0);
				if ($id <= 0 || !bl_event_is_series_master($id)) {
					return 0;
				}

				return count(bl_event_get_occurrence_ids($id));
			},
			'schema' => [
				'description' => 'Number of materialized occurrence children.',
				'type' => 'integer',
				'context' => ['view', 'edit'],
			],
		]);
		register_rest_field($post_type, 'bl_is_series_master', [
			'get_callback' => static function (array $post): bool {
				return bl_event_is_series_master((int) ($post['id'] ?? 0));
			},
			'schema' => [
				'type' => 'boolean',
				'context' => ['view', 'edit'],
			],
		]);
		register_rest_field($post_type, 'bl_master_title', [
			'get_callback' => static function (array $post): string {
				$id = (int) ($post['id'] ?? 0);
				$master = bl_event_get_master_id($id);
				if ($master <= 0) {
					return '';
				}
				$title = get_the_title($master);

				return is_string($title) ? $title : '';
			},
			'schema' => [
				'type' => 'string',
				'context' => ['view', 'edit'],
			],
		]);
		register_rest_field($post_type, 'bl_master_edit_link', [
			'get_callback' => static function (array $post): string {
				$id = (int) ($post['id'] ?? 0);
				$master = bl_event_get_master_id($id);
				if ($master <= 0) {
					return '';
				}
				$link = get_edit_post_link($master, 'raw');

				return is_string($link) ? $link : '';
			},
			'schema' => [
				'type' => 'string',
				'context' => ['edit'],
			],
		]);
	}
}

add_action('rest_api_init', 'bl_event_register_occurrence_count_rest_field');
