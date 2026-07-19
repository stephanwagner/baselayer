<?php

defined('ABSPATH') || exit;

/**
 * Event status notice for singular templates.
 *
 * Optional (via bl_render_template $data): post_id.
 */

$post_id = isset($post_id) ? (int) $post_id : get_the_ID();
if ($post_id <= 0 || !function_exists('bl_event_should_display_status') || !bl_event_should_display_status($post_id)) {
	return;
}

$status = bl_event_get_status($post_id);
if ($status === null) {
	return;
}
?>

<aside
	class="event-status event-status--<?= esc_attr($status['key']) ?>"
	style="--event-status-color: <?= esc_attr($status['color']) ?>"
	role="status"
>
	<strong class="event-status__label"><?= esc_html($status['label']) ?></strong>
	<?php if ($status['info'] !== '') : ?>
		<p class="event-status__info"><?= esc_html($status['info']) ?></p>
	<?php endif; ?>
</aside>
