<?php

defined('ABSPATH') || exit;

/**
 * Single hero slide markup. Override in a child theme as templates/hero-slide.php.
 *
 * Optional (via bl_render_template $data): slide (array), heading_tag (h1|h2).
 */

$slide = isset($slide) && is_array($slide) ? $slide : null;
if ($slide === null) {
	return;
}

$heading_tag = isset($heading_tag) && is_string($heading_tag) ? strtolower($heading_tag) : 'h1';
if (!in_array($heading_tag, ['h1', 'h2', 'h3'], true)) {
	$heading_tag = 'h1';
}

$background = isset($slide['background']) ? (string) $slide['background'] : 'featured';
$image_id = isset($slide['image_id']) ? (int) $slide['image_id'] : 0;
$video_url = isset($slide['video_url']) ? (string) $slide['video_url'] : '';
$title_html = isset($slide['title_html']) ? (string) $slide['title_html'] : '';
$text_html = isset($slide['text_html']) ? (string) $slide['text_html'] : '';
$links = isset($slide['links']) && is_array($slide['links']) ? $slide['links'] : [];

$has_image = $background !== 'video' && $image_id > 0;
$has_video = $background === 'video' && $video_url !== '';
$has_copy = $title_html !== '' || $text_html !== '' || $links !== [];

$classes = ['hero__slide'];
if ($has_video) {
	$classes[] = 'hero__slide--has-video';
} elseif ($has_image) {
	$classes[] = 'hero__slide--has-image';
}
if ($has_copy) {
	$classes[] = 'hero__slide--has-content';
}
?>

<div class="<?= esc_attr(implode(' ', $classes)) ?>">
	<div class="hero__container">
		<?php if ($has_image) : ?>
			<div class="hero__media hero__media--image">
				<?= function_exists('bl_img')
					? bl_img($image_id, 'large', ['class' => 'hero__image'])
					: bl_image_with_placeholder($image_id, 'large', ['class' => 'hero__image']); ?>
			</div>
		<?php endif; ?>

		<?php if ($has_video) : ?>
			<div class="hero__media hero__media--video">
				<video class="hero__video" autoplay muted loop playsinline>
					<source src="<?= esc_url($video_url) ?>">
				</video>
			</div>
		<?php endif; ?>

		<?php if ($has_copy) : ?>
			<div class="hero__content">
				<div class="hero__content-inner">
					<?php if ($title_html !== '') : ?>
						<<?= esc_attr($heading_tag) ?> class="hero__title"><?= $title_html ?></<?= esc_attr($heading_tag) ?>>
					<?php endif; ?>

					<?php if ($text_html !== '') : ?>
						<div class="hero__text"><?= $text_html ?></div>
					<?php endif; ?>

					<?php if ($links !== []) : ?>
						<div class="hero__links">
							<?php foreach ($links as $link) :
								if (!is_array($link)) {
									continue;
								}
								$url = isset($link['url']) ? (string) $link['url'] : '';
								if ($url === '') {
									continue;
								}
								$title = isset($link['title']) ? (string) $link['title'] : '';
								$label = $title !== '' ? $title : $url;
								$target = isset($link['target']) ? (string) $link['target'] : '';
								$rel = $target === '_blank' ? 'noopener noreferrer' : '';
								?>
								<a
									class="hero__link button"
									href="<?= esc_url($url) ?>"
									<?php if ($target !== '') : ?>target="<?= esc_attr($target) ?>"<?php endif; ?>
									<?php if ($rel !== '') : ?>rel="<?= esc_attr($rel) ?>"<?php endif; ?>
								><?= esc_html($label) ?></a>
							<?php endforeach; ?>
						</div>
					<?php endif; ?>
				</div>
			</div>
		<?php endif; ?>
	</div>
</div>
