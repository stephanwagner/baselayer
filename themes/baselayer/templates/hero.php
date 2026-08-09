<?php

defined('ABSPATH') || exit;

/**
 * Page hero. Override in a child theme as templates/hero.php.
 * Single slide = static; two or more = Swiper slider.
 *
 * Optional (via bl_render_template $data): post_id.
 */

$post_id = isset($post_id) ? (int) $post_id : (int) get_queried_object_id();
$ctx = function_exists('bl_hero_get_context') ? bl_hero_get_context($post_id) : null;
if ($ctx === null || empty($ctx['slides']) || !is_array($ctx['slides'])) {
	return;
}

$slides = $ctx['slides'];
$is_slider = !empty($ctx['is_slider']);
$classes = ['hero__wrapper', 'container-wide', 'alignwide', '-container-margin-m'];
if ($is_slider) {
	$classes[] = '-is-slider';
}
?>

<section class="<?= esc_attr(implode(' ', $classes)) ?>">
	<?php if ($is_slider) : ?>
		<div class="hero__slides">
			<div class="hero__swiper swiper" data-hero-slider>
				<div class="swiper-wrapper">
					<?php foreach ($slides as $index => $slide) : ?>
						<div class="swiper-slide">
							<?php
							bl_render_template('hero-slide', [
								'slide' => $slide,
								'heading_tag' => $index === 0 ? 'h1' : 'h2',
							]);
							?>
						</div>
					<?php endforeach; ?>
				</div>
			</div>
		</div>
		<div class="hero__navigation">
			<button type="button" class="hero__button-prev" aria-label="<?= esc_attr__('Previous slide', 'baselayer') ?>">
				<svg xmlns="http://www.w3.org/2000/svg" height="24" width="24" viewBox="0 -960 960 960" fill="currentColor" aria-hidden="true">
					<path d="m287.46-450 131.69 131.69q8.93 8.93 8.81 20.89-.11 11.96-8.81 21.27-9.3 9.3-21.38 9.61-12.08.31-21.38-9L197.23-454.69q-10.84-10.85-10.84-25.31 0-14.46 10.84-25.31l179.16-179.15q8.92-8.92 21.19-8.81 12.27.12 21.57 9.42 8.7 9.31 9 21.08.31 11.77-9 21.08L287.46-510h470.62q12.77 0 21.38 8.62 8.62 8.61 8.62 21.38t-8.62 21.38q-8.61 8.62-21.38 8.62H287.46Z" />
				</svg>
			</button>
			<button type="button" class="hero__button-next" aria-label="<?= esc_attr__('Next slide', 'baselayer') ?>">
				<svg xmlns="http://www.w3.org/2000/svg" height="24" width="24" viewBox="0 -960 960 960" fill="currentColor" aria-hidden="true">
					<path d="M664.46-450H210q-12.77 0-21.38-8.62Q180-467.23 180-480t8.62-21.38Q197.23-510 210-510h454.46L532.77-641.69q-8.92-8.93-8.81-20.89.12-11.96 8.81-21.27 9.31-9.3 21.38-9.61 12.08-.31 21.39 9l179.15 179.15q5.62 5.62 7.92 11.85 2.31 6.23 2.31 13.46t-2.31 13.46q-2.3 6.23-7.92 11.85L575.54-275.54q-8.93 8.92-21.19 8.81-12.27-.12-21.58-9.42-8.69-9.31-9-21.08-.31-11.77 9-21.08L664.46-450Z" />
				</svg>
			</button>
			<div class="hero__pagination" aria-hidden="true"></div>
		</div>
	<?php else : ?>
		<?php
		bl_render_template('hero-slide', [
			'slide' => $slides[0],
			'heading_tag' => 'h1',
		]);
		?>
	<?php endif; ?>
</section>
