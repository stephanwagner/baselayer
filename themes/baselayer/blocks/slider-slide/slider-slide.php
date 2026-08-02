<?php
/**
 * Slider slide block (BaseLayer Blocks).
 */

$type = bl_block_field('type') ?: 'image';
$image = bl_block_field('image');
$video = bl_block_field('video');

$image_id = 0;
if (is_array($image) && !empty($image['id'])) {
	$image_id = (int) $image['id'];
} elseif (is_numeric($image)) {
	$image_id = (int) $image;
}

$video_id = 0;
$video_url = '';
$video_mime = '';
if (is_array($video) && !empty($video['id'])) {
	$video_id = (int) $video['id'];
} elseif (is_numeric($video)) {
	$video_id = (int) $video;
}
if ($video_id > 0) {
	$video_url = (string) wp_get_attachment_url($video_id);
	$video_mime = (string) get_post_mime_type($video_id);
}

$class_names = ['bl-wp-block', 'slider-slide__wrapper', 'swiper-slide', '-type-' . sanitize_html_class((string) $type)];
$wrapper_attributes = get_block_wrapper_attributes([
	'class' => implode(' ', $class_names),
]);
?>
<div <?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
	<div class="slider-slide__container">
		<?php if ($type === 'image' && $image_id > 0 && function_exists('bl_img')) : ?>
			<div class="slider-slide__image-container">
				<?php echo bl_img($image_id, 'large', ['class' => 'slider-slide__image']); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
			</div>
		<?php endif; ?>
		<?php if ($type === 'video' && $video_url !== '') : ?>
			<div class="slider-slide__video-container">
				<video controls class="slider-slide__video">
					<source src="<?php echo esc_url($video_url); ?>" type="<?php echo esc_attr($video_mime !== '' ? $video_mime : 'video/mp4'); ?>">
				</video>
			</div>
		<?php endif; ?>
		<div class="slider-slide__content">
			<InnerBlocks />
		</div>
	</div>
</div>
