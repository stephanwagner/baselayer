<?php

defined('ABSPATH') || exit;

/**
 * Event CPTs (`type` => `event` in config/content-types/): dates, archive query, editor panel.
 */

require_once __DIR__ . '/events-recurrence.php';
require_once __DIR__ . '/events-meta.php';
require_once __DIR__ . '/events-ical.php';
require_once __DIR__ . '/events-status.php';

const BL_EVENT_META_START_DATE = '_bl_event_start_date';
const BL_EVENT_META_END_DATE = '_bl_event_end_date';
const BL_EVENT_META_START_TIME = '_bl_event_start_time';
const BL_EVENT_META_END_TIME = '_bl_event_end_time';
const BL_EVENT_META_START_TS = '_bl_event_start_ts';
const BL_EVENT_META_END_TS = '_bl_event_end_ts';

/**
 * @return string[]
 */
function bl_event_post_types(): array
{
	return bl_cpt_slugs_by_type('event');
}

function bl_is_event_post_type(?string $post_type = null): bool
{
	if ($post_type === null || $post_type === '') {
		$post_type = function_exists('get_post_type') ? (string) get_post_type() : '';
	}

	return $post_type !== '' && bl_cpt_type($post_type) === 'event';
}

/**
 * @return \DateTimeZone
 */
function bl_event_timezone(): \DateTimeZone
{
	return function_exists('wp_timezone') ? wp_timezone() : new \DateTimeZone(wp_timezone_string() ?: 'UTC');
}

function bl_event_normalize_time(string $time): string
{
	$time = trim($time);
	if (preg_match('/^(\d{2}:\d{2})(?::\d{2})?$/', $time, $m)) {
		return $m[1];
	}

	return '';
}

/**
 * Combine date + optional time into a Unix timestamp (site timezone).
 *
 * @param string    $date     Y-m-d
 * @param string    $time     H:i or ''
 * @param bool      $end_day  If no time, use end of day (23:59:59) instead of start (00:00:00).
 */
function bl_event_to_timestamp(string $date, string $time, bool $end_day): int
{
	if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
		return 0;
	}
	$tz = bl_event_timezone();
	$time = bl_event_normalize_time($time);
	$has_time = $time !== '';
	if ($has_time) {
		$dt = \DateTimeImmutable::createFromFormat('Y-m-d H:i', $date . ' ' . $time, $tz);
	} elseif ($end_day) {
		$dt = \DateTimeImmutable::createFromFormat('Y-m-d H:i:s', $date . ' 23:59:59', $tz);
	} else {
		$dt = \DateTimeImmutable::createFromFormat('Y-m-d H:i:s', $date . ' 00:00:00', $tz);
	}

	return $dt instanceof \DateTimeImmutable ? $dt->getTimestamp() : 0;
}

/**
 * Normalized event schedule from post meta, or null when no valid start date.
 *
 * @return array{start_date: string, end_date: string, start_time: string, end_time: string}|null
 */
function bl_event_get_schedule(int $post_id): ?array
{
	if (!bl_is_event_post_type(get_post_type($post_id))) {
		return null;
	}

	$start_date = get_post_meta($post_id, BL_EVENT_META_START_DATE, true);
	if (!is_string($start_date) || !preg_match('/^\d{4}-\d{2}-\d{2}$/', trim($start_date))) {
		return null;
	}
	$start_date = trim($start_date);

	$end_date = get_post_meta($post_id, BL_EVENT_META_END_DATE, true);
	if (!is_string($end_date) || !preg_match('/^\d{4}-\d{2}-\d{2}$/', trim($end_date))) {
		$end_date = $start_date;
	} else {
		$end_date = trim($end_date);
	}

	$start_time = get_post_meta($post_id, BL_EVENT_META_START_TIME, true);
	$end_time = get_post_meta($post_id, BL_EVENT_META_END_TIME, true);
	$start_time = is_string($start_time) ? bl_event_normalize_time($start_time) : '';
	$end_time = is_string($end_time) ? bl_event_normalize_time($end_time) : '';

	return [
		'start_date' => $start_date,
		'end_date' => $end_date,
		'start_time' => $start_time,
		'end_time' => $end_time,
	];
}

function bl_event_get_start_timestamp(int $post_id): int
{
	$schedule = bl_event_get_schedule($post_id);
	if ($schedule === null) {
		return 0;
	}

	return bl_event_to_timestamp($schedule['start_date'], $schedule['start_time'], false);
}

function bl_event_get_end_timestamp(int $post_id): int
{
	$schedule = bl_event_get_schedule($post_id);
	if ($schedule === null) {
		return 0;
	}

	$end_ts = bl_event_to_timestamp($schedule['end_date'], $schedule['end_time'], $schedule['end_time'] === '');
	if ($end_ts <= 0) {
		return 0;
	}

	$start_ts = bl_event_get_start_timestamp($post_id);
	if ($start_ts > 0 && $end_ts < $start_ts) {
		return $start_ts;
	}

	return $end_ts;
}

function bl_event_is_upcoming(int $post_id, ?int $now = null): bool
{
	$end_ts = bl_event_get_end_timestamp($post_id);
	if ($end_ts <= 0) {
		return false;
	}

	return $end_ts >= ($now ?? time());
}

/**
 * Derive and persist sort/filter timestamps from date/time meta.
 */
function bl_event_recalculate_timestamps(int $post_id): void
{
	if (!bl_is_event_post_type(get_post_type($post_id))) {
		return;
	}
	if (wp_is_post_revision($post_id)) {
		return;
	}

	$start_date = get_post_meta($post_id, BL_EVENT_META_START_DATE, true);
	$end_date = get_post_meta($post_id, BL_EVENT_META_END_DATE, true);
	$start_time = get_post_meta($post_id, BL_EVENT_META_START_TIME, true);
	$end_time = get_post_meta($post_id, BL_EVENT_META_END_TIME, true);

	$start_date = is_string($start_date) ? trim($start_date) : '';
	$end_date = is_string($end_date) ? trim($end_date) : '';
	$start_time = is_string($start_time) ? bl_event_normalize_time($start_time) : '';
	$end_time = is_string($end_time) ? bl_event_normalize_time($end_time) : '';

	if ($start_date === '') {
		delete_post_meta($post_id, BL_EVENT_META_START_TS);
		delete_post_meta($post_id, BL_EVENT_META_END_TS);
		return;
	}

	if ($end_date === '') {
		$end_date = $start_date;
	}

	$start_ts = bl_event_to_timestamp($start_date, $start_time, false);
	$end_ts = bl_event_to_timestamp($end_date, $end_time, $end_time === '');

	if ($start_ts <= 0 || $end_ts <= 0) {
		delete_post_meta($post_id, BL_EVENT_META_START_TS);
		delete_post_meta($post_id, BL_EVENT_META_END_TS);
		return;
	}

	if ($end_ts < $start_ts) {
		$end_ts = $start_ts;
	}

	update_post_meta($post_id, BL_EVENT_META_START_TS, $start_ts);
	update_post_meta($post_id, BL_EVENT_META_END_TS, $end_ts);
}

/**
 * Persist sort/filter timestamps from date/time meta (classic save path).
 */
function bl_event_save_timestamps(int $post_id): void
{
	if (!bl_is_event_post_type(get_post_type($post_id))) {
		return;
	}
	if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
		return;
	}
	if (wp_is_post_revision($post_id)) {
		return;
	}
	if (!current_user_can('edit_post', $post_id)) {
		return;
	}

	bl_event_recalculate_timestamps($post_id);
}

/**
 * Register meta, save hooks, and admin columns for every CPT with `type` => `event`.
 */
function bl_event_register_post_type_hooks(): void
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

	foreach ($event_types as $post_type) {
		if (!post_type_exists($post_type)) {
			continue;
		}
		add_action('save_post_' . $post_type, 'bl_event_save_timestamps', 20);
	}

	$auth = static function (bool $allowed, string $meta_key, int $post_id): bool {
		return current_user_can('edit_post', $post_id);
	};

	$string_meta = [
		'type' => 'string',
		'single' => true,
		'show_in_rest' => true,
		'auth_callback' => $auth,
	];

	foreach ($event_types as $post_type) {
		if (!post_type_exists($post_type)) {
			continue;
		}

		register_post_meta($post_type, BL_EVENT_META_START_DATE, array_merge($string_meta, [
			'sanitize_callback' => static function ($value): string {
				$value = is_string($value) ? trim($value) : '';
				return preg_match('/^\d{4}-\d{2}-\d{2}$/', $value) ? $value : '';
			},
		]));
		register_post_meta($post_type, BL_EVENT_META_END_DATE, array_merge($string_meta, [
			'sanitize_callback' => static function ($value): string {
				$value = is_string($value) ? trim($value) : '';
				return preg_match('/^\d{4}-\d{2}-\d{2}$/', $value) ? $value : '';
			},
		]));
		register_post_meta($post_type, BL_EVENT_META_START_TIME, array_merge($string_meta, [
			'sanitize_callback' => static function ($value): string {
				$value = is_string($value) ? trim($value) : '';
				return bl_event_normalize_time($value);
			},
		]));
		register_post_meta($post_type, BL_EVENT_META_END_TIME, array_merge($string_meta, [
			'sanitize_callback' => static function ($value): string {
				$value = is_string($value) ? trim($value) : '';
				return bl_event_normalize_time($value);
			},
		]));

		foreach ([BL_EVENT_META_START_TS, BL_EVENT_META_END_TS] as $key) {
			register_post_meta($post_type, $key, [
				'type' => 'integer',
				'single' => true,
				'show_in_rest' => false,
				'auth_callback' => $auth,
				'sanitize_callback' => static function ($value): int {
					return (int) $value;
				},
			]);
		}

		add_filter('manage_' . $post_type . '_posts_columns', 'bl_event_posts_columns');
		add_action('manage_' . $post_type . '_posts_custom_column', 'bl_event_posts_custom_column', 10, 2);
	}

	add_filter('display_post_states', 'bl_event_display_post_states', 10, 2);
}

add_action('init', 'bl_event_register_post_type_hooks', 21);

/**
 * Admin Events list: hide occurrence children (masters + one-offs only), including Trash.
 */
function bl_event_admin_list_pre_get_posts(\WP_Query $query): void
{
	if (!is_admin() || !$query->is_main_query()) {
		return;
	}
	global $pagenow;
	if ($pagenow !== 'edit.php') {
		return;
	}

	$pt = $query->get('post_type');
	if (is_array($pt)) {
		$pt = (string) reset($pt);
	}
	if (!is_string($pt) || $pt === '' || !bl_is_event_post_type($pt)) {
		return;
	}

	// Hierarchical children are materialized occurrences — never list them (All or Trash).
	$query->set('post_parent', 0);
}

add_action('pre_get_posts', 'bl_event_admin_list_pre_get_posts', 20);

/**
 * Pin recurring masters to the top of the Events admin list.
 *
 * @param array<string, string> $clauses
 * @return array<string, string>
 */
function bl_event_admin_list_posts_clauses(array $clauses, \WP_Query $query): array
{
	if (!is_admin() || !$query->is_main_query()) {
		return $clauses;
	}
	global $pagenow, $wpdb;
	if ($pagenow !== 'edit.php') {
		return $clauses;
	}

	$pt = $query->get('post_type');
	if (is_array($pt)) {
		$pt = (string) reset($pt);
	}
	if (!is_string($pt) || $pt === '' || !bl_is_event_post_type($pt)) {
		return $clauses;
	}

	$alias = 'bl_event_rec_meta';
	$clauses['join'] .= $wpdb->prepare(
		" LEFT JOIN {$wpdb->postmeta} AS {$alias} ON ({$alias}.post_id = {$wpdb->posts}.ID AND {$alias}.meta_key = %s) ",
		BL_EVENT_META_RECURRENCE
	);
	$pin = "(CASE WHEN {$alias}.meta_value IS NOT NULL AND {$alias}.meta_value <> '' THEN 0 ELSE 1 END)";
	$orderby = isset($clauses['orderby']) ? trim((string) $clauses['orderby']) : '';
	$clauses['orderby'] = $orderby !== '' ? $pin . ', ' . $orderby : $pin . ', ' . $wpdb->posts . '.post_date DESC';

	return $clauses;
}

add_filter('posts_clauses', 'bl_event_admin_list_posts_clauses', 20, 2);

/**
 * Mark recurring masters in the title column.
 *
 * @param array<string, string> $states
 * @return array<string, string>
 */
function bl_event_display_post_states(array $states, $post): array
{
	if (!$post instanceof \WP_Post || !bl_is_event_post_type($post->post_type)) {
		return $states;
	}
	if (function_exists('bl_event_is_series_master') && bl_event_is_series_master((int) $post->ID)) {
		$states['bl_event_recurring'] = __('Recurring', 'baselayer');

		return $states;
	}
	if (
		function_exists('bl_event_should_display_status')
		&& function_exists('bl_event_get_status')
		&& bl_event_should_display_status((int) $post->ID)
	) {
		$status = bl_event_get_status((int) $post->ID);
		if ($status !== null && $status['label'] !== '') {
			$states['bl_event_status'] = $status['label'];
		}
	}

	return $states;
}

/**
 * Frontend archive: show events that have not ended yet; sort by start date/time.
 */
function bl_event_archive_pre_get_posts(\WP_Query $query): void
{
	if (is_admin() || !$query->is_main_query() || !$query->is_post_type_archive()) {
		return;
	}
	$pt = $query->get('post_type');
	if (is_array($pt)) {
		$pt = (string) reset($pt);
	}
	if (!is_string($pt) || $pt === '' || !bl_is_event_post_type($pt)) {
		return;
	}

	$now = time();
	$candidate_ids = get_posts([
		'post_type' => $pt,
		'post_status' => 'publish',
		'posts_per_page' => -1,
		'fields' => 'ids',
		'orderby' => 'ID',
		'order' => 'ASC',
		'no_found_rows' => true,
	]);

	$upcoming = [];
	foreach ($candidate_ids as $post_id) {
		$post_id = (int) $post_id;
		if (function_exists('bl_event_is_series_master') && bl_event_is_series_master($post_id)) {
			continue;
		}
		if (bl_event_is_upcoming($post_id, $now)) {
			$upcoming[] = $post_id;
		}
	}

	usort($upcoming, static function (int $a, int $b): int {
		$start_a = bl_event_get_start_timestamp($a);
		$start_b = bl_event_get_start_timestamp($b);
		if ($start_a === $start_b) {
			return $a <=> $b;
		}

		return $start_a <=> $start_b;
	});

	$query->set('post__in', $upcoming !== [] ? $upcoming : [0]);
	$query->set('orderby', 'post__in');
}

add_action('pre_get_posts', 'bl_event_archive_pre_get_posts', 25);

/**
 * Published event IDs that have ended (same rule as the events archive).
 *
 * @return int[]
 */
function bl_event_past_published_ids(?int $now = null): array
{
	static $cache = null;
	if (is_array($cache)) {
		return $cache;
	}

	$now = $now ?? time();
	$past = [];
	foreach (bl_event_post_types() as $post_type) {
		$candidate_ids = get_posts([
			'post_type' => $post_type,
			'post_status' => 'publish',
			'posts_per_page' => -1,
			'fields' => 'ids',
			'orderby' => 'ID',
			'order' => 'ASC',
			'no_found_rows' => true,
		]);
		foreach ($candidate_ids as $post_id) {
			$post_id = (int) $post_id;
			if ($post_id <= 0) {
				continue;
			}
			if (function_exists('bl_event_is_series_master') && bl_event_is_series_master($post_id)) {
				continue;
			}
			if (!bl_event_is_upcoming($post_id, $now)) {
				$past[] = $post_id;
			}
		}
	}

	$cache = $past;

	return $past;
}

/**
 * Published series master IDs (excluded from public listings).
 *
 * @return int[]
 */
function bl_event_series_master_ids(): array
{
	static $cache = null;
	if (is_array($cache)) {
		return $cache;
	}

	$ids = [];
	foreach (bl_event_post_types() as $post_type) {
		$candidate_ids = get_posts([
			'post_type' => $post_type,
			'post_status' => 'publish',
			'posts_per_page' => -1,
			'fields' => 'ids',
			'post_parent' => 0,
			'meta_key' => BL_EVENT_META_RECURRENCE,
			'meta_compare' => '!=',
			'meta_value' => '',
			'no_found_rows' => true,
		]);
		foreach ($candidate_ids as $post_id) {
			$post_id = (int) $post_id;
			if ($post_id > 0 && bl_event_is_series_master($post_id)) {
				$ids[] = $post_id;
			}
		}
	}

	$cache = $ids;

	return $ids;
}

/**
 * Exclude ended events from front-end search (keep published for direct URLs / SEO).
 *
 * @param string    $where SQL WHERE clause.
 * @param \WP_Query $query Query instance.
 */
function bl_event_search_exclude_past_posts_where(string $where, \WP_Query $query): string
{
	if (is_admin()) {
		return $where;
	}
	if (apply_filters('bl_event_search_exclude_past_apply', true, $query) === false) {
		return $where;
	}
	if (!$query->is_search()) {
		return $where;
	}
	$s = $query->get('s');
	if ($s === null || $s === '') {
		return $where;
	}

	$event_types = bl_event_post_types();
	if ($event_types === []) {
		return $where;
	}

	$past_ids = bl_event_past_published_ids();
	$master_ids = function_exists('bl_event_series_master_ids') ? bl_event_series_master_ids() : [];
	$exclude_ids = array_values(array_unique(array_merge($past_ids, $master_ids)));
	if ($exclude_ids === []) {
		return $where;
	}

	global $wpdb;
	$type_list = "'" . implode("','", array_map('esc_sql', $event_types)) . "'";
	$id_list = implode(',', array_map('intval', $exclude_ids));
	$where .= " AND NOT ({$wpdb->posts}.post_type IN ({$type_list}) AND {$wpdb->posts}.ID IN ({$id_list}))";

	return $where;
}

add_filter('posts_where', 'bl_event_search_exclude_past_posts_where', 10, 2);

/**
 * REST collection search: hide ended events via stored end timestamp.
 *
 * @param array<string, mixed>            $args    Query args.
 * @param \WP_REST_Request<string, mixed> $request Request.
 * @return array<string, mixed>
 */
function bl_event_rest_search_exclude_past(array $args, \WP_REST_Request $request): array
{
	if (!$request->has_param('search')) {
		return $args;
	}
	$search = $request->get_param('search');
	if ($search === null || $search === '' || (is_string($search) && trim($search) === '')) {
		return $args;
	}

	$clause = [
		'key' => BL_EVENT_META_END_TS,
		'value' => time(),
		'compare' => '>=',
		'type' => 'NUMERIC',
	];
	$old = isset($args['meta_query']) ? $args['meta_query'] : null;
	if (empty($old)) {
		$args['meta_query'] = $clause;

		return $args;
	}
	$args['meta_query'] = [
		'relation' => 'AND',
		$old,
		$clause,
	];

	return $args;
}

/**
 * @return void
 */
function bl_event_register_rest_search_filters(): void
{
	foreach (bl_event_post_types() as $post_type) {
		add_filter('rest_' . $post_type . '_query', 'bl_event_rest_search_exclude_past', 10, 2);
	}
}

add_action('init', 'bl_event_register_rest_search_filters', 22);

/**
 * Block editor: strings for the Event panel (same script as expirator).
 */
add_action('enqueue_block_editor_assets', function (): void {
	$post_types = bl_event_post_types();
	if ($post_types === []) {
		return;
	}
	$pt = $post_types[0];
	$lookahead = function_exists('bl_event_recurrence_lookahead_label')
		? bl_event_recurrence_lookahead_label($pt)
		: '1 year';
	$horizon = function_exists('bl_event_recurrence_horizon_date')
		? bl_event_recurrence_horizon_date($pt)
		: '';

	$meta_by_type = [];
	$statuses_by_type = [];
	foreach ($post_types as $type) {
		$meta_by_type[$type] = function_exists('bl_cpt_event_meta_config')
			? bl_cpt_event_meta_config($type)
			: ['title' => '', 'groups' => []];
		$statuses_by_type[$type] = function_exists('bl_event_get_status_options')
			? bl_event_get_status_options($type)
			: [];
	}

	wp_localize_script('baselayer-editor', 'baselayerEvents', [
		'postTypes' => $post_types,
		'postType' => $pt,
		'panelTitle' => __('Event', 'baselayer'),
		'startDateLabel' => __('Start date', 'baselayer'),
		'endDateLabel' => __('End date', 'baselayer'),
		'includeTimesLabel' => __('Include times', 'baselayer'),
		'startTimeLabel' => __('Start time', 'baselayer'),
		'endTimeLabel' => __('End time', 'baselayer'),
		'statusLabel' => __('Status', 'baselayer'),
		'statusCustomLabel' => __('Status label', 'baselayer'),
		'statusInfoLabel' => __('Status information', 'baselayer'),
		'statuses' => $statuses_by_type[$pt] ?? [],
		'statusesByType' => $statuses_by_type,
		'recurringTitle' => __('Recurring', 'baselayer'),
		'notRepeating' => __('Not repeating', 'baselayer'),
		'editRecurrence' => __('Edit recurrence', 'baselayer'),
		'recurrenceNeedsDate' => __('Set a start date to create occurrence posts.', 'baselayer'),
		'partOfRecurring' => __('Part of a recurring event.', 'baselayer'),
		'masterLabel' => __('Master:', 'baselayer'),
		'editInMaster' => __('Edit in master event', 'baselayer'),
		'occurrencesLabel' => __('%d occurrences', 'baselayer'),
		'occurrenceLabel' => __('%d occurrence', 'baselayer'),
		'customContentTitle' => __('This occurrence has custom content.', 'baselayer'),
		'customContentHelp' => __('It will not update when the master event changes.', 'baselayer'),
		'revertToMaster' => __('Revert to master', 'baselayer'),
		'modalTitle' => __('Recurrence settings', 'baselayer'),
		'freqLabel' => __('Repeats', 'baselayer'),
		'everyLabel' => __('Every', 'baselayer'),
		'onLabel' => __('On weekday', 'baselayer'),
		'endsLabel' => __('Ends', 'baselayer'),
		'endsNever' => __('Never', 'baselayer'),
		'endsOnDate' => __('On date', 'baselayer'),
		'endsAfter' => __('After', 'baselayer'),
		'occurrencesUnit' => __('occurrences', 'baselayer'),
		'nextOccurrences' => __('Next occurrences', 'baselayer'),
		'moreOccurrences' => __('+%d more', 'baselayer'),
		'cancelLabel' => __('Cancel', 'baselayer'),
		'saveLabel' => __('Save', 'baselayer'),
		'clearRecurrence' => __('Stop repeating', 'baselayer'),
		'freqDaily' => __('Daily', 'baselayer'),
		'freqWeekly' => __('Weekly', 'baselayer'),
		'freqMonthly' => __('Monthly', 'baselayer'),
		'freqYearly' => __('Yearly', 'baselayer'),
		'unitDay' => __('day(s)', 'baselayer'),
		'unitWeek' => __('week(s)', 'baselayer'),
		'unitMonth' => __('month(s)', 'baselayer'),
		'unitYear' => __('year(s)', 'baselayer'),
		/* translators: %d: interval */
		'everyNDays' => __('Every %d days', 'baselayer'),
		/* translators: %d: interval */
		'everyNWeeks' => __('Every %d weeks', 'baselayer'),
		/* translators: %d: interval */
		'everyNMonths' => __('Every %d months', 'baselayer'),
		/* translators: %d: interval */
		'everyNYears' => __('Every %d years', 'baselayer'),
		'weekdayLabels' => [
			'mo' => __('Mon', 'baselayer'),
			'tu' => __('Tue', 'baselayer'),
			'we' => __('Wed', 'baselayer'),
			'th' => __('Thu', 'baselayer'),
			'fr' => __('Fri', 'baselayer'),
			'sa' => __('Sat', 'baselayer'),
			'su' => __('Sun', 'baselayer'),
		],
		'lookaheadLabel' => $lookahead,
		'horizonDate' => $horizon,
		'revertRestUrl' => esc_url_raw(rest_url('baselayer/v1/event-revert/')),
		'restNonce' => wp_create_nonce('wp_rest'),
		'dateFormat' => get_option('date_format', 'F j, Y'),
		'meta' => $meta_by_type[$pt] ?? ['title' => '', 'groups' => []],
		'metaByType' => $meta_by_type,
		'editMetadata' => __('Edit metadata', 'baselayer'),
		'noMetadata' => __('No metadata', 'baselayer'),
		'metadataModalTitle' => __('Event metadata', 'baselayer'),
	]);
}, 12);

/**
 * Admin list table: Event dates column (display only).
 *
 * @param array<string, string> $columns
 * @return array<string, string>
 */
function bl_event_posts_columns(array $columns): array
{
	$label = __('Event dates', 'baselayer');
	$new = [];
	$inserted = false;
	foreach ($columns as $key => $heading) {
		if ($key === 'date' && !$inserted) {
			$new['bl_event_dates'] = $label;
			$inserted = true;
		}
		$new[$key] = $heading;
	}
	if ($inserted) {
		return $new;
	}
	$out = [];
	foreach ($columns as $key => $heading) {
		$out[$key] = $heading;
		if ($key === 'title') {
			$out['bl_event_dates'] = $label;
		}
	}

	return $out;
}

function bl_event_posts_custom_column(string $column, int $post_id): void
{
	if ($column !== 'bl_event_dates' || !bl_is_event_post_type(get_post_type($post_id))) {
		return;
	}

	if (function_exists('bl_event_is_series_master') && bl_event_is_series_master($post_id)) {
		$lines = bl_event_format_recurrence_summary_lines(bl_event_get_recurrence($post_id));
		foreach ($lines as $i => $line) {
			if ($i === 0) {
				echo esc_html($line);
			} else {
				echo '<br>' . esc_html($line);
			}
		}

		if (get_post_status($post_id) === 'trash') {
			return;
		}

		$upcoming = function_exists('bl_event_get_upcoming_occurrence_rows')
			? count(bl_event_get_upcoming_occurrence_rows($post_id))
			: 0;
		$total = count(bl_event_get_occurrence_ids($post_id));
		$title = get_the_title($post_id);
		echo '<br>';
		echo '<button type="button" class="button-link bl-event-edit-occurrences"';
		echo ' data-master-id="' . esc_attr((string) $post_id) . '"';
		echo ' data-master-title="' . esc_attr($title !== '' ? $title : __('Event', 'baselayer')) . '">';
		echo esc_html__('Edit occurrences', 'baselayer');
		if ($upcoming > 0) {
			echo ' (' . esc_html((string) $upcoming) . ')';
		} elseif ($total > 0) {
			echo ' (' . esc_html((string) $total) . ')';
		}
		echo '</button>';

		return;
	}

	if (function_exists('bl_event_is_occurrence') && bl_event_is_occurrence($post_id)) {
		// Occurrences are hidden from the list; keep a fallback if shown elsewhere.
		$master_id = bl_event_get_master_id($post_id);
		echo '<span class="description">' . esc_html__('Occurrence', 'baselayer') . '</span><br>';
		if ($master_id > 0) {
			$edit = get_edit_post_link($master_id, 'raw');
			$title = get_the_title($master_id);
			if ($edit) {
				echo '<a href="' . esc_url($edit) . '">' . esc_html($title !== '' ? $title : __('Master', 'baselayer')) . '</a><br>';
			}
		}
	}

	$range = bl_event_format_range_text($post_id, true);
	if ($range === '') {
		echo '<span aria-hidden="true">–</span>';
		return;
	}
	echo esc_html($range);
}

add_action('admin_head', static function (): void {
	global $pagenow;
	if ($pagenow !== 'edit.php') {
		return;
	}
	$screen_type = sanitize_key(wp_unslash((string) ($_GET['post_type'] ?? '')));
	if ($screen_type === '' || !bl_is_event_post_type($screen_type)) {
		return;
	}
	echo '<style>.column-bl_event_dates{width:14em;} @media(min-width:900px){.column-bl_event_dates{width:20em}}</style>';
});

/**
 * Localize occurrences-modal strings on the Events list screen.
 */
add_action('admin_enqueue_scripts', static function (string $hook_suffix): void {
	if ($hook_suffix !== 'edit.php') {
		return;
	}
	$pt = sanitize_key(wp_unslash((string) ($_GET['post_type'] ?? '')));
	if ($pt === '' || !bl_is_event_post_type($pt)) {
		return;
	}
	if (!wp_script_is('main-admin-scripts', 'enqueued') && !wp_script_is('main-admin-scripts', 'registered')) {
		return;
	}
	wp_localize_script('main-admin-scripts', 'baselayerEventOccurrences', [
		'restUrl' => esc_url_raw(rest_url('baselayer/v1/event-occurrences/')),
		'restoreUrl' => esc_url_raw(rest_url('baselayer/v1/event-restore-occurrence')),
		'softDeleteUrl' => esc_url_raw(rest_url('baselayer/v1/event-soft-delete-occurrence')),
		'restNonce' => wp_create_nonce('wp_rest'),
		'modalTitle' => __('Occurrences', 'baselayer'),
		'empty' => __('No upcoming occurrences.', 'baselayer'),
		'editLabel' => __('Edit', 'baselayer'),
		'restoreLabel' => __('Restore', 'baselayer'),
		'deleteLabel' => __('Delete', 'baselayer'),
		'deleteConfirm' => __('Remove this date from the series? It will not appear in Trash; you can restore it here later.', 'baselayer'),
		'deleteDetachedConfirm' => __('This occurrence has custom content. Deleting removes that content permanently. Continue?', 'baselayer'),
		'closeLabel' => __('Close', 'baselayer'),
		'loadingLabel' => __('Loading…', 'baselayer'),
		'customContent' => __('Custom content', 'baselayer'),
		'deletedLabel' => __('Deleted', 'baselayer'),
		'errorLabel' => __('Could not load occurrences.', 'baselayer'),
	]);
}, 20);

/**
 * Adapt a php date()/wp_date format string so full-month tokens (F) become abbreviated months (M).
 * Respects backslash escapes: e.g. \F stays a literal letter F in output.
 *
 * @param string $php_format Same style as Options → Date format option.
 */
function bl_event_abbr_month_datetime_format(string $php_format): string
{
	$out = '';
	$len = strlen($php_format);
	for ($i = 0; $i < $len; ++$i) {
		$c = $php_format[$i];
		if ($c === '\\') {
			$out .= '\\';
			if (++$i < $len) {
				$out .= $php_format[$i];
			}
			continue;
		}
		$out .= $c === 'F' ? 'M' : $c;
	}

	return $out;
}

/**
 * Some locales (e.g. de_DE) include a trailing period on month abbreviations ("Jul.").
 * Strip those dots for compact admin UI dates.
 */
function bl_event_strip_month_abbrev_dots(string $formatted): string
{
	global $wp_locale;
	if (!$wp_locale instanceof \WP_Locale) {
		return $formatted;
	}

	for ($m = 1; $m <= 12; ++$m) {
		$full = $wp_locale->get_month($m);
		$abbr = $wp_locale->get_month_abbrev($full);
		if (!is_string($abbr) || $abbr === '' || !str_ends_with($abbr, '.')) {
			continue;
		}
		$formatted = str_replace($abbr, rtrim($abbr, '.'), $formatted);
	}

	return $formatted;
}

/**
 * Human-readable range for templates.
 *
 * @param bool $abbr_month_names When true (e.g. admin list column), formatted months use abbreviated names (M not F).
 */
function bl_event_format_range_text(int $post_id, bool $abbr_month_names = false): string
{
	$schedule = bl_event_get_schedule($post_id);
	if ($schedule === null) {
		return '';
	}

	return bl_event_format_slot_range_text(
		$schedule['start_date'],
		$schedule['end_date'],
		$schedule['start_time'],
		$schedule['end_time'],
		$abbr_month_names
	);
}

/**
 * Format a date/time slot the same way as bl_event_format_range_text (no post required).
 */
function bl_event_format_slot_range_text(
	string $start_date,
	string $end_date,
	string $start_time = '',
	string $end_time = '',
	bool $abbr_month_names = false
): string {
	if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $start_date)) {
		return '';
	}
	if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $end_date)) {
		$end_date = $start_date;
	}

	$st = bl_event_normalize_time($start_time);
	$et = bl_event_normalize_time($end_time);
	$start_ts = bl_event_to_timestamp($start_date, $st, false);
	$end_ts = bl_event_to_timestamp($end_date, $et, $et === '');
	if ($start_ts <= 0 || $end_ts <= 0) {
		return '';
	}

	$tz = bl_event_timezone();
	$df = get_option('date_format', 'F j, Y');
	if ($abbr_month_names) {
		$df = bl_event_abbr_month_datetime_format((string) $df);
	}
	$tf = get_option('time_format', 'g:i a');
	$ds = wp_date($df, $start_ts, $tz);
	$de = wp_date($df, $end_ts, $tz);

	if ($start_date === $end_date) {
		if ($st !== '' || $et !== '') {
			$ts_fmt = $df . ' ' . $tf;
			$out = trim(wp_date($ts_fmt, $start_ts, $tz) . ' – ' . wp_date($tf, $end_ts, $tz));
		} else {
			$out = $ds;
		}
	} elseif ($st !== '' || $et !== '') {
		$out = trim(wp_date($df . ' ' . $tf, $start_ts, $tz) . ' – ' . wp_date($df . ' ' . $tf, $end_ts, $tz));
	} else {
		$out = $ds . ' – ' . $de;
	}

	return $abbr_month_names ? bl_event_strip_month_abbrev_dots($out) : $out;
}
