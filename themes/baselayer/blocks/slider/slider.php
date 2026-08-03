<?php
/**
 * Slider block (BaseLayer Blocks).
 */

$slides_per_view = bl_block_field('slides_per_view') ?? 1;
$slides_per_group = bl_block_field('slides_per_group') ?? 1;
$animation = bl_block_field('animation') ?: 'slide';
$space_between = (int) (bl_block_field('space_between') ?? 16);
$loop = (bool) bl_block_field('loop');
$autoplay = (bool) bl_block_field('autoplay');
$autoplay_delay = bl_block_field('autoplay_delay') ?? 6;
$pagination = (bool) bl_block_field('pagination');
$dynamic_bullets = (bool) bl_block_field('dynamic_bullets');
$navigation = (bool) bl_block_field('navigation');
$ratio = bl_block_field('ratio') ?: '2-1';
$ratio_x = (float) (bl_block_field('ratio_x') ?? 1);
$ratio_y = (float) (bl_block_field('ratio_y') ?? 1);
$has_content = (bool) bl_block_field('has_content');
$content_align = bl_block_field('content_align') ?: 'left';
$content_visibility_mobile = (bool) bl_block_field('content_visibility_mobile');

$padding_top = 100.0;
if ($ratio === 'custom' && $ratio_x > 0 && $ratio_y > 0) {
	$padding_top = $ratio_y / $ratio_x * 100;
} else {
	$ratio_arr = explode('-', (string) $ratio);
	if (count($ratio_arr) === 2) {
		$padding_top = (float) $ratio_arr[1] / (float) $ratio_arr[0] * 100;
	}
}
$space_between = max(0, $space_between);

$slider_id = 'slider-' . wp_unique_id();
$class_names = ['bl-wp-block', '-baselayer-block', 'slider__wrapper'];
$wrapper_attributes = get_block_wrapper_attributes([
	'class' => implode(' ', $class_names),
	'style' => '--slider-padding-top: ' . $padding_top . '%; --slider-editor-slide-gap: ' . $space_between . 'px;',
]);
?>
<div
	<?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
	data-slider-id="<?php echo esc_attr($slider_id); ?>"
	data-slider-slides-per-view="<?php echo esc_attr((string) $slides_per_view); ?>"
	data-slider-slides-per-group="<?php echo esc_attr((string) $slides_per_group); ?>"
	data-slider-animation="<?php echo esc_attr((string) $animation); ?>"
	data-slider-space-between="<?php echo esc_attr((string) $space_between); ?>"
	data-slider-loop="<?php echo $loop ? 'true' : 'false'; ?>"
	data-slider-autoplay="<?php echo $autoplay ? 'true' : 'false'; ?>"
	data-slider-autoplay-delay="<?php echo esc_attr((string) $autoplay_delay); ?>"
	data-slider-pagination="<?php echo $pagination ? 'true' : 'false'; ?>"
	data-slider-navigation="<?php echo $navigation ? 'true' : 'false'; ?>"
	data-slider-dynamic-bullets="<?php echo $dynamic_bullets ? 'true' : 'false'; ?>"
	data-slider-has-content="<?php echo $has_content ? 'true' : 'false'; ?>"
	data-slider-content-align="<?php echo esc_attr((string) $content_align); ?>"
	data-slider-content-visibility-mobile="<?php echo $content_visibility_mobile ? 'true' : 'false'; ?>">
	<?php if (is_admin()) : ?>
		<div class="slider__editor-badge" aria-hidden="true">
			<span class="slider__editor-badge-label"><?php echo esc_html__('Slider', 'baselayer'); ?></span>
		</div>
	<?php endif; ?>
	<div class="slider__container">
		<div class="slider__slides">
			<div class="swiper">
				<div class="swiper-wrapper">
					<InnerBlocks />
				</div>
			</div>
		</div>
		<div class="slider__navigation">
			<button class="slider__button-prev" type="button" aria-label="<?php echo esc_attr__('Previous slide', 'baselayer'); ?>">
				<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor" aria-hidden="true">
					<path d="m287.46-450 131.69 131.69q8.93 8.93 8.81 20.89-.11 11.96-8.81 21.27-9.3 9.3-21.38 9.61-12.08.31-21.38-9L197.23-454.69q-10.84-10.85-10.84-25.31 0-14.46 10.84-25.31l179.16-179.15q8.92-8.92 21.19-8.81 12.27.12 21.57 9.42 8.7 9.31 9 21.08.31 11.77-9 21.08L287.46-510h470.62q12.77 0 21.38 8.62 8.62 8.61 8.62 21.38t-8.62 21.38q-8.61 8.62-21.38 8.62H287.46Z" />
				</svg>
			</button>
			<button class="slider__button-next" type="button" aria-label="<?php echo esc_attr__('Next slide', 'baselayer'); ?>">
				<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor" aria-hidden="true">
					<path d="M664.46-450H210q-12.77 0-21.38-8.62Q180-467.23 180-480t8.62-21.38Q197.23-510 210-510h454.46L532.77-641.69q-8.92-8.93-8.81-20.89.12-11.96 8.81-21.27 9.31-9.3 21.38-9.61 12.08-.31 21.39 9l179.15 179.15q5.62 5.62 7.92 11.85 2.31 6.23 2.31 13.46t-2.31 13.46q-2.3 6.23-7.92 11.85L575.54-275.54q-8.93 8.92-21.19 8.81-12.27-.12-21.58-9.42-8.69-9.31-9-21.08-.31-11.77 9-21.08L664.46-450Z" />
				</svg>
			</button>
			<div class="slider__pagination" aria-hidden="true"></div>
		</div>
	</div>
</div>
