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
$type = isset($notice['type']) ? (string) $notice['type'] : 'info';
$title = isset($notice['title']) ? (string) $notice['title'] : '';
$dismissible = !empty($notice['dismissible']);
$show_again_after = isset($notice['show_again_after']) ? (int) $notice['show_again_after'] : 7;
$content_html = isset($notice['content_html']) ? (string) $notice['content_html'] : '';
$buttons = isset($notice['buttons']) && is_array($notice['buttons']) ? $notice['buttons'] : [];
$show_close_button = !empty($notice['show_close_button']);
$close_button_text = isset($notice['close_button_text']) ? (string) $notice['close_button_text'] : __('Close', 'baselayer');
$close_button_style = isset($notice['close_button_style']) ? (string) $notice['close_button_style'] : 'secondary';
$close_button_outline = !empty($notice['close_button_outline']);

if ($id === '') {
	return;
}

$modal_id = 'site-notice';
$classes = [
	'site-notice',
	'site-notice--' . sanitize_html_class($type),
];
if ($dismissible) {
	$classes[] = 'site-notice--dismissible';
}

$close_classes = ['site-notice__close', 'button', '-' . sanitize_html_class($close_button_style)];
if ($close_button_outline) {
	$close_classes[] = '-outline';
}
?>

<div
	class="site-notice__source"
	hidden
	data-site-notice
	data-site-notice-id="<?= esc_attr($id) ?>"
	data-site-notice-dismissible="<?= $dismissible ? '1' : '0' ?>"
	data-site-notice-show-again-after="<?= esc_attr((string) $show_again_after) ?>"
>
	<div data-modal-content="<?= esc_attr($modal_id) ?>">
		<div class="<?= esc_attr(implode(' ', $classes)) ?>">
			<?php if ($title !== '') : ?>
				<h2 class="site-notice__title modal__title"><?= esc_html($title) ?></h2>
			<?php endif; ?>

			<?php if ($content_html !== '') : ?>
				<div class="site-notice__content">
					<?= $content_html ?>
				</div>
			<?php endif; ?>

			<?php if ($buttons !== [] || $show_close_button) : ?>
				<div class="site-notice__actions">
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
							class="site-notice__button button"
							href="<?= esc_url($url) ?>"
							<?php if ($target !== '') : ?>target="<?= esc_attr($target) ?>"<?php endif; ?>
							<?php if ($rel !== '') : ?>rel="<?= esc_attr($rel) ?>"<?php endif; ?>
						><?= esc_html($button_title) ?></a>
					<?php endforeach; ?>

					<?php if ($show_close_button) : ?>
						<button
							type="button"
							class="<?= esc_attr(implode(' ', $close_classes)) ?>"
							data-site-notice-close
						><?= esc_html($close_button_text) ?></button>
					<?php endif; ?>
				</div>
			<?php endif; ?>
		</div>
	</div>
</div>
