<?php

// Class names
$classNames = ['bl-wp-block'];

// ID for specific styling
$classNames[] = $block['id'];

// Align class ("alignwide") from block setting ("wide")
if (!empty($block['align'])) {
	$classNames[] = 'align' . $block['align'];
}

// Add class provided via class_field in WP backend
if (!empty($block['className'])) {
	$classNames[] = $block['className'];
}

// Add wrapper class
$classNames[] = 'slider__wrapper';

// Fields
$slidesPerView = get_field('slides_per_view') ?? 1;
$slidesPerGroup = get_field('slides_per_group') ?? 1;
$animation = get_field('animation') ?? 'slide';
$spaceBetween = get_field('space_between') ?? 16;
$loop = get_field('loop') ?? false;
$autoplay = get_field('autoplay') ?? false;
$autoplayDelay = get_field('autoplay_delay') ?? 6;
$pagination = get_field('pagination') ?? false;
$dynamicBullets = get_field('dynamic_bullets') ?? false;
$navigation = get_field('navigation') ?? false;
$ratio = get_field('ratio') ?? '3-2';
$ratioX = get_field('ratio_x') ?? 3;
$ratioY = get_field('ratio_y') ?? 2;
$hasCallToAction = get_field('has_call_to_action') ?? false;
$callToActionAlign = get_field('call_to_action_align') ?? 'left';


// Ratio
$paddingTop = 100;
if ($ratio == 'custom' && $ratioX > 0 && $ratioY > 0) {
	$paddingTop = $ratioY / $ratioX * 100;
} else {
	$ratioArr = explode('-', $ratio);
	if (count($ratioArr) === 2) {
		$paddingTop = floatval($ratioArr[1]) / floatval($ratioArr[0]) * 100;
	}
}
$paddingTop = floatval($paddingTop);

// Space between
$spaceBetween = max(0, (int) $spaceBetween);
?>

<div
	class="<?= implode(' ', $classNames) ?>"
	style="--slider-padding-top: <?= $paddingTop ?>%; --slider-editor-slide-gap: <?= $spaceBetween ?>px;"
	data-slider-id="<?= esc_attr($block['id']) ?>"
	data-slider-slides-per-view="<?= $slidesPerView ?>"
	data-slider-slides-per-group="<?= $slidesPerGroup ?>"
	data-slider-animation="<?= $animation ?>"
	data-slider-space-between="<?= $spaceBetween ?>"
	data-slider-loop="<?= $loop ? 'true' : 'false' ?>"
	data-slider-autoplay="<?= $autoplay ? 'true' : 'false' ?>"
	data-slider-autoplay-delay="<?= $autoplayDelay ?>"
	data-slider-pagination="<?= $pagination ? 'true' : 'false' ?>"
	data-slider-navigation="<?= $navigation ? 'true' : 'false' ?>"
	data-slider-dynamic-bullets="<?= $dynamicBullets ? 'true' : 'false' ?>"
	data-slider-has-call-to-action="<?= $hasCallToAction ? 'true' : 'false' ?>"
	data-slider-call-to-action-align="<?= $callToActionAlign ?>">
	<?php if (is_admin()) { ?>
		<div class="slider__editor-badge" aria-hidden="true">
			<span class="slider__editor-badge-icon">
				<svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentColor" aria-hidden="true">
					<path d="M682.31-168.08v-624.23q28.38 1.93 48.04 22.73Q750-748.77 750-720v479.62q0 28.76-19.65 49.57-19.66 20.81-48.04 22.73ZM194.62-95.39q-29.92 0-51.12-21.19-21.19-21.19-21.19-51.11v-624.62q0-29.92 21.19-51.11 21.2-21.19 51.12-21.19H550q29.93 0 51.12 21.19 21.19 21.19 21.19 51.11v624.62q0 29.92-21.19 51.11Q579.93-95.39 550-95.39H194.62ZM810-240.38V-720q20.38 1.92 34.04 16.73 13.65 14.81 13.65 35.58v375q0 20.77-13.65 35.57-13.66 14.81-34.04 16.74Zm-615.38 85H550q4.62 0 8.46-3.85 3.85-3.85 3.85-8.46v-624.62q0-4.61-3.85-8.46-3.84-3.85-8.46-3.85H194.62q-4.62 0-8.46 3.85-3.85 3.85-3.85 8.46v624.62q0 4.61 3.85 8.46 3.84 3.85 8.46 3.85Zm-12.31-649.24v649.24-649.24Z" />
				</svg>
			</span>
			<span class="slider__editor-badge-label"><?= esc_html__('Slider', 'baselayer') ?></span>
		</div>
	<?php } ?>
	<div class="slider__container">
		<div class="slider__slides">
			<div class="swiper">
				<InnerBlocks allowedBlocks="<?= esc_attr(wp_json_encode(['acf/slider-slide'])) ?>" />
			</div>
		</div>
		<div class="slider__navigation">
			<button class="slider__button-prev"
				aria-label="<?= __('Previous slide', 'baselayer') ?>"
				aria-controls="slider-<?= $block['id'] ?>">
				<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
					<path d="m287.46-450 131.69 131.69q8.93 8.93 8.81 20.89-.11 11.96-8.81 21.27-9.3 9.3-21.38 9.61-12.08.31-21.38-9L197.23-454.69q-10.84-10.85-10.84-25.31 0-14.46 10.84-25.31l179.16-179.15q8.92-8.92 21.19-8.81 12.27.12 21.57 9.42 8.7 9.31 9 21.08.31 11.77-9 21.08L287.46-510h470.62q12.77 0 21.38 8.62 8.62 8.61 8.62 21.38t-8.62 21.38q-8.61 8.62-21.38 8.62H287.46Z" />
				</svg>
			</button>
			<button
				class="slider__button-next"
				aria-label="<?= __('Next slide', 'baselayer') ?>"
				aria-controls="slider-<?= $block['id'] ?>">
				<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
					<path d="M664.46-450H210q-12.77 0-21.38-8.62Q180-467.23 180-480t8.62-21.38Q197.23-510 210-510h454.46L532.77-641.69q-8.92-8.93-8.81-20.89.12-11.96 8.81-21.27 9.31-9.3 21.38-9.61 12.08-.31 21.39 9l179.15 179.15q5.62 5.62 7.92 11.85 2.31 6.23 2.31 13.46t-2.31 13.46q-2.3 6.23-7.92 11.85L575.54-275.54q-8.93 8.92-21.19 8.81-12.27-.12-21.58-9.42-8.69-9.31-9-21.08-.31-11.77 9-21.08L664.46-450Z" />
				</svg>
			</button>
			<div class="slider__pagination" aria-hidden="true"></div>
		</div>
	</div>
</div>