<?php

defined('ABSPATH') || exit;

/**
 * Colored, icon-backed post status badges in admin list tables.
 */

/**
 * State key → icon / CSS modifier / optional label override.
 *
 * @return array<string, array{icon: string, modifier: string, label?: string}>
 */
function bl_admin_post_state_config(): array
{
	static $config = null;
	if ($config !== null) {
		return $config;
	}

	$config = [
		'draft' => [
			'icon' => 'edit',
			'modifier' => 'draft',
			'label' => _x('Draft', 'post status', 'baselayer'),
		],
		'pending' => [
			'icon' => 'hourglass',
			'modifier' => 'pending',
			'label' => _x('Pending', 'post status', 'baselayer'),
		],
		'scheduled' => [
			'icon' => 'clock',
			'modifier' => 'scheduled',
			'label' => _x('Scheduled', 'post status', 'baselayer'),
		],
		'private' => [
			'icon' => 'visibility-off',
			'modifier' => 'private',
			'label' => _x('Private', 'post status', 'baselayer'),
		],
		'protected' => [
			'icon' => 'lock',
			'modifier' => 'protected',
			'label' => __('Password', 'baselayer'),
		],
		'bl_event_recurring' => [
			'icon' => 'repeat',
			'modifier' => 'recurring',
			'label' => __('Recurring', 'baselayer'),
		],
	];

	/**
	 * Filter admin post-state badge config.
	 *
	 * @param array<string, array{icon: string, modifier: string, label?: string}> $config
	 */
	$config = apply_filters('bl_admin_post_state_config', $config);

	return $config;
}

/**
 * Ensure non-publish primary statuses are present when core omits them (e.g. current status view).
 * Published posts keep no status badge — same as WordPress default.
 *
 * @param array<string, string> $states
 * @return array<string, string>
 */
function bl_admin_enrich_post_states(array $states, $post): array
{
	if (!$post instanceof \WP_Post) {
		return $states;
	}

	$config = bl_admin_post_state_config();
	$status = (string) $post->post_status;
	$status_key = $status === 'future' ? 'scheduled' : $status;

	if (
		$status_key !== 'publish'
		&& isset($config[$status_key])
		&& !isset($states[$status_key])
		&& !isset($states[$status])
	) {
		$label = $config[$status_key]['label'] ?? $status_key;
		$states = [$status_key => $label] + $states;
	}

	// Prefer short "Password" label when protected.
	if (isset($states['protected']) && isset($config['protected']['label'])) {
		$states['protected'] = $config['protected']['label'];
	}

	return $states;
}

add_filter('display_post_states', 'bl_admin_enrich_post_states', 5, 2);

/**
 * Build a single badge span.
 */
function bl_admin_post_state_badge_html(string $key, string $label): string
{
	$config = bl_admin_post_state_config();
	$cfg = $config[$key] ?? null;
	$modifier = is_array($cfg) ? (string) ($cfg['modifier'] ?? 'neutral') : 'neutral';
	$icon = is_array($cfg) ? (string) ($cfg['icon'] ?? '') : '';
	$modifier = sanitize_html_class($modifier);
	if ($modifier === '') {
		$modifier = 'neutral';
	}

	$classes = ['bl-post-state', 'bl-post-state--' . $modifier, 'post-state'];
	if ($icon !== '' && preg_match('/^[a-z0-9]+(?:-[a-z0-9]+)*$/', $icon)) {
		$classes[] = '-icon-before';
		$classes[] = '-icon-' . $icon;
	}

	return '<span class="' . esc_attr(implode(' ', $classes)) . '">' . esc_html(wp_strip_all_tags($label)) . '</span>';
}

/**
 * Replace core post-states HTML with badge group (no em dash; CSS places left of title).
 *
 * @param array<string, string> $post_states
 */
function bl_admin_post_states_html(string $html, array $post_states, $post): string
{
	if (!$post instanceof \WP_Post || $post_states === []) {
		return '';
	}

	$badges = [];
	foreach ($post_states as $key => $label) {
		$key = is_string($key) ? $key : '';
		if ($key === '' || !is_string($label) || $label === '') {
			continue;
		}
		$badges[] = bl_admin_post_state_badge_html($key, $label);
	}

	if ($badges === []) {
		return '';
	}

	return '<span class="bl-post-states">' . implode('', $badges) . '</span>';
}

add_filter('post_states_html', 'bl_admin_post_states_html', 10, 3);

/**
 * Fallback on WP &lt; 6.9 (no post_states_html): wrap labels as badge HTML in-state.
 *
 * @param array<string, string> $states
 * @return array<string, string>
 */
function bl_admin_post_states_html_fallback(array $states, $post): array
{
	global $wp_version;
	if (is_string($wp_version) && version_compare($wp_version, '6.9', '>=')) {
		return $states;
	}
	if (!$post instanceof \WP_Post || $states === []) {
		return $states;
	}

	$out = [];
	foreach ($states as $key => $label) {
		$key = is_string($key) ? $key : '';
		if ($key === '' || !is_string($label)) {
			continue;
		}
		$out[$key] = bl_admin_post_state_badge_html($key, $label);
	}

	return $out;
}

add_filter('display_post_states', 'bl_admin_post_states_html_fallback', 1000, 2);

/**
 * Pin pending ("Ausstehend") posts to the top of admin list tables.
 * Runs after event recurring pin so pending wins: pending → recurring → rest.
 *
 * @param array<string, string> $clauses
 * @return array<string, string>
 */
function bl_admin_pin_pending_posts_clauses(array $clauses, \WP_Query $query): array
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
	if (!is_string($pt) || $pt === '' || $pt === 'attachment') {
		return $clauses;
	}

	// Respect an explicit status filter (Drafts / Pending / etc. views).
	$request_status = isset($_REQUEST['post_status']) ? (string) wp_unslash($_REQUEST['post_status']) : ''; // phpcs:ignore WordPress.Security.NonceVerification.Recommended
	if ($request_status !== '' && $request_status !== 'all') {
		return $clauses;
	}

	$pin = "(CASE WHEN {$wpdb->posts}.post_status = 'pending' THEN 0 ELSE 1 END)";
	$orderby = isset($clauses['orderby']) ? trim((string) $clauses['orderby']) : '';
	$clauses['orderby'] = $orderby !== ''
		? $pin . ', ' . $orderby
		: $pin . ', ' . $wpdb->posts . '.post_date DESC';

	return $clauses;
}

add_filter('posts_clauses', 'bl_admin_pin_pending_posts_clauses', 25, 2);
