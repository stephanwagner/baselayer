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

$modifier = function_exists('bl_event_status_css_modifier')
	? bl_event_status_css_modifier($status)
	: sanitize_html_class($status['key']);
$style = function_exists('bl_event_status_inline_style')
	? bl_event_status_inline_style($status)
	: '';
$modifier_class = $modifier !== '' ? ' event-status-' . sanitize_html_class($modifier) : '';
?>

<aside
	class="event-status<?= esc_attr($modifier_class) ?>"<?= $style ?>
	role="status"
>
	<strong class="event-status__label"><?= esc_html($status['label']) ?></strong>
	<?php if ($status['info'] !== '') : ?>
		<div class="event-status__info">
			<?php
			$lines = preg_split('/\R/u', $status['info']) ?: [];
			foreach ($lines as $line) {
				$line = trim($line);
				if ($line === '') {
					continue;
				}
				echo '<p>' . esc_html($line) . '</p>';
			}
			?>
		</div>
	<?php endif; ?>
</aside>
