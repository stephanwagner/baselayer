<?php

defined('ABSPATH') || exit;

/**
 * Site notice modal source. Override in a child theme as templates/site-notice.php.
 *
 * Optional (via bl_render_template $data): notice (array).
 */

$notice = isset($notice) && is_array($notice) ? $notice : null;
if ($notice === null) {
	return;
}

$id = isset($notice['id']) ? (string) $notice['id'] : '';
$title = isset($notice['title']) ? (string) $notice['title'] : '';
$extra_class = isset($notice['extra_class']) ? (string) $notice['extra_class'] : '';
$show_again = isset($notice['show_again']) ? (string) $notice['show_again'] : 'session';
$show_again_after = isset($notice['show_again_after']) ? (int) $notice['show_again_after'] : 7;
$buttons_alignment = isset($notice['buttons_alignment']) ? (string) $notice['buttons_alignment'] : 'right';
$content_html = isset($notice['content_html']) ? (string) $notice['content_html'] : '';
$buttons = isset($notice['buttons']) && is_array($notice['buttons']) ? $notice['buttons'] : [];
$show_close_button = !empty($notice['show_close_button']);
$close_button_text = isset($notice['close_button_text']) ? (string) $notice['close_button_text'] : __('Close', 'baselayer');
$close_button_style = isset($notice['close_button_style']) ? (string) $notice['close_button_style'] : 'primary';
$close_button_outline = !empty($notice['close_button_outline']);

if ($id === '') {
	return;
}

$modal_id = 'site-notice';
$classes = ['site-notice'];
if ($extra_class !== '') {
	$classes[] = $extra_class;
}

$close_classes = ['site-notice__close', 'button', '-small', '-' . sanitize_html_class($close_button_style)];
if ($close_button_outline) {
	$close_classes[] = '-outline';
}
?>

<div
	class="site-notice__source"
	hidden
	data-site-notice
	data-site-notice-id="<?= esc_attr($id) ?>"
	data-site-notice-show-close="<?= $show_close_button ? '1' : '0' ?>"
	data-site-notice-show-again="<?= esc_attr($show_again) ?>"
	data-site-notice-show-again-after="<?= esc_attr((string) $show_again_after) ?>"
>
	<div data-modal-content="<?= esc_attr($modal_id) ?>">
		<div class="<?= esc_attr(implode(' ', $classes)) ?>">
			<?php if ($title !== '') : ?>
				<div class="site-notice__title modal__title h3"><?= wp_kses($title, ['br' => []]) ?></div>
			<?php endif; ?>

			<?php if ($content_html !== '') : ?>
				<div class="site-notice__content">
					<?= $content_html ?>
				</div>
			<?php endif; ?>

			<?php if ($buttons !== [] || $show_close_button) : ?>
				<div class="site-notice__actions site-notice__actions--<?= esc_attr($buttons_alignment) ?>">
					<?php if ($show_close_button) : ?>
						<button
							type="button"
							class="<?= esc_attr(implode(' ', $close_classes)) ?>"
							data-site-notice-close
						><?= esc_html($close_button_text) ?></button>
					<?php endif; ?>

					<?php foreach ($buttons as $button) :
						if (!is_array($button)) {
							continue;
						}
						$url = isset($button['url']) ? (string) $button['url'] : '';
						if ($url === '') {
							continue;
						}
						$button_title = isset($button['title']) ? (string) $button['title'] : $url;
						$target = isset($button['target']) ? (string) $button['target'] : '';
						$rel = $target === '_blank' ? 'noopener noreferrer' : '';
						?>
						<a
							class="site-notice__button button -small"
							href="<?= esc_url($url) ?>"
							<?php if ($target !== '') : ?>target="<?= esc_attr($target) ?>"<?php endif; ?>
							<?php if ($rel !== '') : ?>rel="<?= esc_attr($rel) ?>"<?php endif; ?>
						><?= esc_html($button_title) ?></a>
					<?php endforeach; ?>
				</div>
			<?php endif; ?>
		</div>
	</div>
</div>
