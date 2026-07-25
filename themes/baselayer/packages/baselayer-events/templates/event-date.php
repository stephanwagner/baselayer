<?php

defined('ABSPATH') || exit;

/**
 * Event date range for singular templates and blocks.
 *
 * Optional (via bl_render_template $data): post_id.
 */

$post_id = isset($post_id) ? (int) $post_id : get_the_ID();
if ($post_id <= 0 || !function_exists('bl_event_format_range_text')) {
	return;
}

$range = bl_event_format_range_text($post_id);
if ($range === '') {
	return;
}
?>

<div class="event-date"><?php echo esc_html($range); ?></div>
