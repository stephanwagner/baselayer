<?php

defined('ABSPATH') || exit;

/**
 * Front rendering for standalone (non-BaseLayer) themes.
 * When bl_render_template() exists, the theme owns singular/archive markup.
 */

/**
 * Whether the package should inject date/status/meta on the front.
 */
function bl_events_should_auto_render_front(): bool
{
	$default = !function_exists('bl_render_template');

	return (bool) apply_filters('bl_events_auto_render_front', $default);
}

/**
 * Render a package template to a string (no theme helper required).
 *
 * @param array<string, mixed> $data
 */
function bl_events_get_template_html(string $template, array $data = []): string
{
	$path = BL_EVENTS_PATH . 'templates/' . $template . '.php';
	if (!is_readable($path)) {
		return '';
	}

	ob_start();
	// phpcs:ignore WordPress.PHP.DontExtract.extract_extract -- template locals
	extract($data, EXTR_SKIP);
	include $path;

	return (string) ob_get_clean();
}

/**
 * Absolute path to a package template file, or empty string.
 */
function bl_events_template_path(string $template): string
{
	$path = BL_EVENTS_PATH . 'templates/' . $template . '.php';

	return is_readable($path) ? $path : '';
}

/**
 * @return list<string>
 */
function bl_events_front_post_types(): array
{
	return function_exists('bl_event_post_types') ? bl_event_post_types() : [];
}

/**
 * Post type for the current event CPT or category-tax archive, or ''.
 */
function bl_events_archive_current_post_type(): string
{
	if (is_post_type_archive()) {
		$pt = get_query_var('post_type');
		if (is_array($pt)) {
			$pt = (string) reset($pt);
		}
		$pt = is_string($pt) ? $pt : '';
		if ($pt !== '' && bl_is_event_post_type($pt)) {
			return $pt;
		}

		return '';
	}

	if (!is_tax()) {
		return '';
	}

	$obj = get_queried_object();
	$taxonomy = $obj instanceof \WP_Term ? $obj->taxonomy : '';
	if ($taxonomy === '' || !taxonomy_exists($taxonomy)) {
		return '';
	}

	$tax = get_taxonomy($taxonomy);
	$object_types = $tax && is_array($tax->object_type) ? $tax->object_type : [];
	foreach ($object_types as $object_type) {
		if (is_string($object_type) && bl_is_event_post_type($object_type)) {
			return $object_type;
		}
	}

	return '';
}

/**
 * Whether the main front view is an event CPT or event-category archive.
 */
function bl_events_is_event_listing_view(): bool
{
	return bl_events_archive_current_post_type() !== '';
}

/**
 * Archive settings + labels for the current listing.
 *
 * @return array{
 *   post_type: string,
 *   heading: string,
 *   empty: string,
 *   design: string,
 *   category_filter: bool,
 *   month_filter: bool,
 *   taxonomy: string,
 *   archive_slug: string,
 *   archive_url: string
 * }
 */
function bl_events_archive_context(): array
{
	$post_type = bl_events_archive_current_post_type();
	$inst = $post_type !== '' && function_exists('bl_events_get_instance')
		? bl_events_get_instance($post_type)
		: null;
	$archive = is_array($inst) && isset($inst['archive']) && is_array($inst['archive'])
		? $inst['archive']
		: [];
	$texts = isset($archive['texts']) && is_array($archive['texts']) ? $archive['texts'] : [];
	$labels = is_array($inst) && isset($inst['labels']) && is_array($inst['labels'])
		? $inst['labels']
		: [];

	$heading = isset($texts['heading']) ? trim((string) $texts['heading']) : '';
	if ($heading === '') {
		$heading = isset($labels['name']) ? (string) $labels['name'] : __('Events', 'baselayer-events');
	}

	if (is_tax()) {
		$term = get_queried_object();
		if ($term instanceof \WP_Term && $term->name !== '') {
			$heading = $term->name;
		}
	}

	$empty = isset($texts['empty']) ? trim((string) $texts['empty']) : '';
	if ($empty === '') {
		$empty = __('No events found.', 'baselayer-events');
	}

	$design = isset($archive['design']) ? sanitize_key((string) $archive['design']) : 'list';
	if (!in_array($design, ['list', 'grid'], true)) {
		$design = 'list';
	}

	$taxonomy = $post_type !== '' && function_exists('bl_events_category_taxonomy')
		? bl_events_category_taxonomy($post_type)
		: '';

	$archive_slug = isset($archive['slug']) ? sanitize_title((string) $archive['slug']) : '';
	if ($archive_slug === '' && $post_type !== '') {
		$archive_slug = sanitize_title($post_type);
	}

	$archive_url = $post_type !== '' ? (string) get_post_type_archive_link($post_type) : '';

	return [
		'post_type' => $post_type,
		'heading' => $heading,
		'empty' => $empty,
		'design' => $design,
		'category_filter' => !empty($archive['category_filter']) && $taxonomy !== '' && taxonomy_exists($taxonomy),
		'month_filter' => !empty($archive['month_filter']),
		'taxonomy' => $taxonomy,
		'archive_slug' => $archive_slug,
		'archive_url' => $archive_url,
	];
}

/**
 * Query var used for standalone archive category filter.
 */
function bl_events_archive_filter_query_var(string $taxonomy): string
{
	if ($taxonomy === '' || !taxonomy_exists($taxonomy)) {
		return '';
	}

	$tax = get_taxonomy($taxonomy);
	if ($tax instanceof \WP_Taxonomy && is_string($tax->query_var) && $tax->query_var !== '') {
		return $tax->query_var;
	}

	return $taxonomy;
}

/**
 * Selected category term ID from the request (CPT archive filter), or 0.
 */
function bl_events_archive_filter_term_id(string $taxonomy): int
{
	$query_var = bl_events_archive_filter_query_var($taxonomy);
	if ($query_var === '') {
		return 0;
	}

	// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- public filter URLs.
	$raw = isset($_GET[$query_var]) ? wp_unslash($_GET[$query_var]) : '';
	if (!is_string($raw) || $raw === '') {
		return 0;
	}

	$raw = sanitize_text_field($raw);
	if ($raw === '') {
		return 0;
	}

	if (ctype_digit($raw)) {
		$term = get_term((int) $raw, $taxonomy);
	} else {
		$term = get_term_by('slug', $raw, $taxonomy);
	}

	if (!$term instanceof \WP_Term || is_wp_error($term)) {
		return 0;
	}

	return (int) $term->term_id;
}

/**
 * Terms for the standalone archive category filter.
 *
 * @return list<\WP_Term>
 */
function bl_events_archive_filter_terms(string $taxonomy): array
{
	if ($taxonomy === '' || !taxonomy_exists($taxonomy)) {
		return [];
	}

	$terms = get_terms([
		'taxonomy' => $taxonomy,
		'hide_empty' => true,
	]);

	if (!is_array($terms) || $terms === []) {
		return [];
	}

	return array_values(array_filter($terms, static function ($term) {
		return $term instanceof \WP_Term;
	}));
}

/**
 * Query arg for the archive “from month” picker.
 */
function bl_events_archive_from_query_var(): string
{
	return 'bl_event_from';
}

/**
 * Whether a string is a valid YYYY-MM month key.
 */
function bl_events_archive_is_month_key(string $value): bool
{
	if (!preg_match('/^(\d{4})-(\d{2})$/', $value, $m)) {
		return false;
	}
	$month = (int) $m[2];

	return $month >= 1 && $month <= 12;
}

/**
 * Unix timestamp for the first second of YYYY-MM in the site timezone, or 0.
 */
function bl_events_archive_month_start_ts(string $ym): int
{
	if (!bl_events_archive_is_month_key($ym)) {
		return 0;
	}

	try {
		$dt = new \DateTimeImmutable($ym . '-01 00:00:00', wp_timezone());
	} catch (\Exception $e) {
		return 0;
	}

	return $dt->getTimestamp();
}

/**
 * Unix timestamp for the last second of YYYY-MM in the site timezone, or 0.
 */
function bl_events_archive_month_end_ts(string $ym): int
{
	if (!bl_events_archive_is_month_key($ym)) {
		return 0;
	}

	try {
		$dt = (new \DateTimeImmutable($ym . '-01 00:00:00', wp_timezone()))
			->modify('last day of this month')
			->setTime(23, 59, 59);
	} catch (\Exception $e) {
		return 0;
	}

	return $dt->getTimestamp();
}

/**
 * Selected bl_event_from month key from the request, or ''.
 */
function bl_events_archive_selected_from_month(): string
{
	$qv = bl_events_archive_from_query_var();
	// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- public filter URLs.
	$raw = isset($_GET[$qv]) ? wp_unslash($_GET[$qv]) : '';
	if (!is_string($raw)) {
		return '';
	}
	$raw = sanitize_text_field($raw);
	if (!bl_events_archive_is_month_key($raw)) {
		return '';
	}

	return $raw;
}

/**
 * Next calendar month through 12 months ahead (site timezone).
 *
 * @return list<array{key: string, label: string}>
 */
function bl_events_archive_from_month_options(): array
{
	$options = [];
	try {
		$cursor = (new \DateTimeImmutable('first day of next month 00:00:00', wp_timezone()));
	} catch (\Exception $e) {
		return [];
	}

	/* translators: %s: localized month and year, e.g. "August 2026" */
	$label_tpl = __('From %s', 'baselayer-events');

	for ($i = 0; $i < 12; $i++) {
		$month = $cursor->modify('+' . $i . ' month');
		$key = $month->format('Y-m');
		$options[] = [
			'key' => $key,
			'label' => sprintf($label_tpl, wp_date('F Y', $month->getTimestamp())),
		];
	}

	return $options;
}

/**
 * Window for month-picker availability: start of next month → end of 12th option month.
 *
 * @return array{0: int, 1: int}|null
 */
function bl_events_archive_from_month_window(): ?array
{
	$options = bl_events_archive_from_month_options();
	if ($options === []) {
		return null;
	}
	$first = $options[0]['key'];
	$last = $options[count($options) - 1]['key'];
	$start = bl_events_archive_month_start_ts($first);
	$end = bl_events_archive_month_end_ts($last);
	if ($start <= 0 || $end <= 0) {
		return null;
	}

	return [$start, $end];
}

/**
 * Distinct Y-m keys that have at least one public upcoming event start in the from-picker window.
 *
 * @return list<string>
 */
function bl_events_archive_occupied_months(string $post_type): array
{
	global $wpdb;

	$post_type = sanitize_key($post_type);
	if ($post_type === '' || !bl_is_event_post_type($post_type)) {
		return [];
	}

	$window = bl_events_archive_from_month_window();
	if ($window === null) {
		return [];
	}
	[$window_start, $window_end] = $window;
	$now = time();

	$start_key = defined('BL_EVENT_META_START_TS') ? BL_EVENT_META_START_TS : '_bl_event_start_ts';
	$end_key = defined('BL_EVENT_META_END_TS') ? BL_EVENT_META_END_TS : '_bl_event_end_ts';
	$not_master = function_exists('bl_event_sql_not_series_master')
		? bl_event_sql_not_series_master('p')
		: '1=1';

	// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- meta keys and NOT-master fragment are fixed constants.
	$sql = $wpdb->prepare(
		"SELECT startm.meta_value
		FROM {$wpdb->posts} p
		INNER JOIN {$wpdb->postmeta} startm
			ON startm.post_id = p.ID AND startm.meta_key = %s
		INNER JOIN {$wpdb->postmeta} endm
			ON endm.post_id = p.ID AND endm.meta_key = %s
		WHERE p.post_type = %s
			AND p.post_status = 'publish'
			AND CAST(endm.meta_value AS UNSIGNED) >= %d
			AND CAST(startm.meta_value AS UNSIGNED) BETWEEN %d AND %d
			AND {$not_master}",
		$start_key,
		$end_key,
		$post_type,
		$now,
		$window_start,
		$window_end
	);

	// phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared -- prepared above.
	$rows = $wpdb->get_col($sql);
	if (!is_array($rows) || $rows === []) {
		return [];
	}

	$keys = [];
	foreach ($rows as $raw_ts) {
		$ts = (int) $raw_ts;
		if ($ts <= 0) {
			continue;
		}
		$keys[wp_date('Y-m', $ts)] = true;
	}

	return array_keys($keys);
}

/**
 * Theme override for event listings: archive-{post_type}.php, archive-{slug}.php, or taxonomy-{tax}.php.
 */
function bl_events_locate_theme_archive_override(string $post_type): string
{
	$candidates = [];

	if (is_tax()) {
		$obj = get_queried_object();
		if ($obj instanceof \WP_Term && $obj->taxonomy !== '') {
			$candidates[] = 'taxonomy-' . $obj->taxonomy . '.php';
		}
	}

	if ($post_type !== '') {
		$candidates[] = 'archive-' . $post_type . '.php';
		$inst = function_exists('bl_events_get_instance') ? bl_events_get_instance($post_type) : null;
		$archive = is_array($inst) && isset($inst['archive']) && is_array($inst['archive'])
			? $inst['archive']
			: [];
		$slug = isset($archive['slug']) ? sanitize_title((string) $archive['slug']) : '';
		if ($slug !== '' && $slug !== $post_type) {
			$candidates[] = 'archive-' . $slug . '.php';
		}
	}

	$candidates = array_values(array_unique(array_filter($candidates)));
	if ($candidates === []) {
		return '';
	}

	$found = locate_template($candidates, false, false);

	return is_string($found) ? $found : '';
}

/**
 * Use package archive (or theme override) on standalone event listings.
 *
 * @param string $template
 * @return string
 */
function bl_events_filter_template_include(string $template): string
{
	if (!bl_events_should_auto_render_front()) {
		return $template;
	}

	if (is_admin() || is_feed() || is_embed()) {
		return $template;
	}

	$post_type = bl_events_archive_current_post_type();
	if ($post_type === '') {
		return $template;
	}

	$override = bl_events_locate_theme_archive_override($post_type);
	if ($override !== '') {
		/**
		 * Filter the resolved event archive template path (theme override or package).
		 *
		 * @param string $path Absolute template path.
		 * @param string $post_type Event post type.
		 */
		return (string) apply_filters('bl_events_archive_template', $override, $post_type);
	}

	$package = bl_events_template_path('archive');
	if ($package === '') {
		return $template;
	}

	return (string) apply_filters('bl_events_archive_template', $package, $post_type);
}
add_filter('template_include', 'bl_events_filter_template_include', 99);

/**
 * Standalone CPT archive: apply category filter from the request.
 */
function bl_events_standalone_apply_category_filter(\WP_Query $query): void
{
	if (!bl_events_should_auto_render_front()) {
		return;
	}

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

	$inst = function_exists('bl_events_get_instance') ? bl_events_get_instance($pt) : null;
	$archive = is_array($inst) && isset($inst['archive']) && is_array($inst['archive'])
		? $inst['archive']
		: [];
	if (empty($archive['category_filter'])) {
		return;
	}

	$taxonomy = function_exists('bl_events_category_taxonomy')
		? bl_events_category_taxonomy($pt)
		: '';
	$term_id = bl_events_archive_filter_term_id($taxonomy);
	if ($term_id <= 0) {
		return;
	}

	$existing = $query->get('tax_query');
	$clause = [
		'taxonomy' => $taxonomy,
		'field' => 'term_id',
		'terms' => [$term_id],
	];
	if (is_array($existing) && $existing !== []) {
		$query->set('tax_query', [
			'relation' => 'AND',
			$existing,
			$clause,
		]);
	} else {
		$query->set('tax_query', [$clause]);
	}
}
add_action('pre_get_posts', 'bl_events_standalone_apply_category_filter', 30);

/**
 * Month bucket key (Y-m) for archive grouping from start timestamp, or ''.
 */
function bl_events_archive_month_key(int $post_id): string
{
	if ($post_id <= 0 || !defined('BL_EVENT_META_START_TS')) {
		return '';
	}

	$ts = (int) get_post_meta($post_id, BL_EVENT_META_START_TS, true);
	if ($ts <= 0) {
		return '';
	}

	return wp_date('Y-m', $ts);
}

/**
 * Localized month heading for archive separators (e.g. "August 2026").
 */
function bl_events_archive_month_label(int $post_id): string
{
	if ($post_id <= 0 || !defined('BL_EVENT_META_START_TS')) {
		return '';
	}

	$ts = (int) get_post_meta($post_id, BL_EVENT_META_START_TS, true);
	if ($ts <= 0) {
		return '';
	}

	return wp_date('F Y', $ts);
}

/**
 * Singular: date + status before content, metadata after.
 *
 * @param string $content
 * @return string
 */
function bl_events_filter_the_content(string $content): string
{
	static $rendering = false;
	if ($rendering) {
		return $content;
	}

	if (!bl_events_should_auto_render_front()) {
		return $content;
	}

	if (is_admin() || !is_singular() || !in_the_loop() || !is_main_query()) {
		return $content;
	}

	$post_id = (int) get_the_ID();
	if ($post_id <= 0 || !bl_is_event_post_type(get_post_type($post_id))) {
		return $content;
	}

	$rendering = true;
	try {
		$before = bl_events_get_template_html('event-date', ['post_id' => $post_id]);
		$before .= bl_events_get_template_html('event-status', ['post_id' => $post_id]);
		$after = bl_events_get_template_html('event-meta', [
			'post_id' => $post_id,
			'plain_actions' => true,
		]);
	} finally {
		$rendering = false;
	}

	return $before . $content . $after;
}
add_filter('the_content', 'bl_events_filter_the_content', 12);

/**
 * Archives / Query Loop: append a compact date after the title.
 * Skips singular (handled by the_content), event CPT/tax archives (plugin preview), and non-loop contexts.
 *
 * @param string $title
 * @param int|string $post_id
 * @return string
 */
function bl_events_filter_the_title(string $title, $post_id = 0): string
{
	if (!bl_events_should_auto_render_front()) {
		return $title;
	}

	if (is_admin() || is_feed() || wp_doing_ajax() || (function_exists('wp_is_json_request') && wp_is_json_request())) {
		return $title;
	}

	$post_id = (int) $post_id;
	if ($post_id <= 0) {
		return $title;
	}

	if (!bl_is_event_post_type(get_post_type($post_id))) {
		return $title;
	}

	// Singular date/status come from the_content.
	if (is_singular(bl_events_front_post_types())) {
		return $title;
	}

	// CPT / category archives use event-preview (date shown there).
	if (bl_events_is_event_listing_view()) {
		return $title;
	}

	if (!in_the_loop() || !is_main_query()) {
		return $title;
	}

	if (!function_exists('bl_event_format_range_text')) {
		return $title;
	}

	$range = bl_event_format_range_text($post_id);
	if ($range === '') {
		return $title;
	}

	return $title . ' <span class="event-date event-date--inline">' . esc_html($range) . '</span>';
}
add_filter('the_title', 'bl_events_filter_the_title', 12, 2);
