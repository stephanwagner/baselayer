<?php

defined('ABSPATH') || exit;

$links = isset($links) && is_array($links) ? $links : [];
if ($links === []) {
	return;
}
?>
<div class="social-media-links__wrapper">
	<ul class="social-media-links__items">
		<?php foreach ($links as $item) :
			if (!is_array($item)) {
				continue;
			}
			$url = trim((string) ($item['url'] ?? ''));
			if ($url === '') {
				continue;
			}

			$label = trim((string) ($item['label'] ?? ''));
			$aria = function_exists('bl_social_media_link_aria_label')
				? bl_social_media_link_aria_label($label)
				: sprintf(
					/* translators: %s: social network name or site host */
					__('Link to %s', 'baselayer'),
					$label !== '' ? $label : __('Social media', 'baselayer')
				);

			$svg = isset($item['svg']) ? (string) $item['svg'] : '';
			$icon_class = isset($item['icon_class']) ? (string) $item['icon_class'] : '';

			if ($svg === '' && $icon_class === '') {
				continue;
			}
			?>
			<li class="social-media-links__item">
				<a
					class="social-media-links__link"
					href="<?= esc_url($url) ?>"
					target="_blank"
					rel="noopener noreferrer"
					aria-label="<?= esc_attr($aria) ?>"
				>
					<?php if ($svg !== '') : ?>
						<?= $svg // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- sanitized via bl_svg_sanitize() ?>
					<?php else : ?>
						<span class="fs-icon <?= esc_attr($icon_class) ?>" aria-hidden="true"></span>
					<?php endif; ?>
				</a>
			</li>
		<?php endforeach; ?>
	</ul>
</div>
