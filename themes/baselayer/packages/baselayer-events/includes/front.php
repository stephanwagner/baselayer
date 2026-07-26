<?php

defined('ABSPATH') || exit;

/**
 * Front rendering for standalone (non-BaseLayer) themes.
 * When bl_render_template() exists, the theme owns singular markup.
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
 * @return list<string>
 */
function bl_events_front_post_types(): array
{
	return function_exists('bl_event_post_types') ? bl_event_post_types() : [];
}

/**
 * Singular: date + status before content, metadata after.
 *
 * @param string $content
 * @return string
 */
function bl_events_filter_the_content(string $content): string
{
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

	$before = bl_events_get_template_html('event-date', ['post_id' => $post_id]);
	$before .= bl_events_get_template_html('event-status', ['post_id' => $post_id]);
	$after = bl_events_get_template_html('event-meta', [
		'post_id' => $post_id,
		'plain_actions' => true,
	]);

	return $before . $content . $after;
}
add_filter('the_content', 'bl_events_filter_the_content', 12);

/**
 * Archives / Query Loop: append a compact date after the title.
 * Skips singular (handled by the_content) and non-loop contexts.
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
