<?php

defined('ABSPATH') || exit;

/**
 * Compact event card for standalone archive listings.
 *
 * Optional (via bl_events_get_template_html $data): post_id.
 */

$post_id = isset($post_id) ? (int) $post_id : (int) get_the_ID();
if ($post_id <= 0) {
	return;
}

$post = get_post($post_id);
if (!$post instanceof \WP_Post) {
	return;
}

$url = get_permalink($post_id);
$url = is_string($url) ? $url : '';
$title = get_the_title($post_id);

$range = function_exists('bl_event_format_range_text')
	? bl_event_format_range_text($post_id)
	: '';

$status_badge = '';
if (
	function_exists('bl_event_should_display_status')
	&& function_exists('bl_event_render_status_badge')
	&& bl_event_should_display_status($post_id)
) {
	ob_start();
	bl_event_render_status_badge($post_id, 'event-status-badge bl-event-preview__status');
	$status_badge = trim((string) ob_get_clean());
}

// Raw excerpt only — never get_the_excerpt() (can re-enter the_content).
$excerpt = trim(wp_strip_all_tags((string) $post->post_excerpt));
if ($excerpt === '' && is_string($post->post_content) && $post->post_content !== '') {
	$excerpt = trim(wp_strip_all_tags(wp_trim_words($post->post_content, 24, '…')));
}
?>

<article id="post-<?= (int) $post_id ?>" <?php post_class('bl-event-preview'); ?>>
	<?php if ($url !== '') { ?>
		<a class="bl-event-preview__link" href="<?= esc_url($url) ?>">
	<?php } else { ?>
		<div class="bl-event-preview__link">
	<?php } ?>

		<?php if ($range !== '' || $status_badge !== '') { ?>
			<div class="bl-event-preview__meta">
				<?php if ($range !== '') { ?>
					<p class="bl-event-preview__date"><?= esc_html($range) ?></p>
				<?php } ?>
				<?php if ($status_badge !== '') { ?>
					<?= $status_badge /* phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- built by bl_event_render_status_badge */ ?>
				<?php } ?>
			</div>
		<?php } ?>

		<h2 class="bl-event-preview__title"><?= esc_html($title) ?></h2>

		<?php if ($excerpt !== '') { ?>
			<p class="bl-event-preview__excerpt"><?= esc_html($excerpt) ?></p>
		<?php } ?>

	<?php if ($url !== '') { ?>
		</a>
	<?php } else { ?>
		</div>
	<?php } ?>
</article>
