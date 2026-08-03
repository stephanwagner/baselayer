<?php
/**
 * Map block (BaseLayer Blocks).
 */

$type = bl_block_field('type') ?: 'address';
$address = bl_block_field('address');
$lat = bl_block_field('lat');
$lng = bl_block_field('lng');
$zoom = bl_block_field('zoom') ?: '17';
$image = bl_block_field('image');

$address_attr = is_string($address) ? htmlspecialchars($address, ENT_QUOTES, 'UTF-8') : '';

$image_src = '';
if (is_array($image) && !empty($image['id'])) {
	$image_src = wp_get_attachment_image_url((int) $image['id'], 'full') ?: '';
} elseif (is_numeric($image)) {
	$image_src = wp_get_attachment_image_url((int) $image, 'full') ?: '';
}
if ($image_src === '') {
	$preview = get_template_directory_uri() . '/blocks/map/preview.jpg';
	$child = get_stylesheet_directory() . '/blocks/map/preview.jpg';
	if (is_readable($child)) {
		$preview = get_stylesheet_directory_uri() . '/blocks/map/preview.jpg';
	}
	$image_src = $preview;
}

$class_names = ['bl-wp-block', '-baselayer-block', 'map__wrapper'];
$wrapper_attributes = get_block_wrapper_attributes([
	'class' => implode(' ', $class_names),
]);
?>
<div <?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
	<div
		class="map__container"
		data-google-maps-wrapper
		data-type="<?php echo esc_attr(is_string($type) ? $type : 'address'); ?>"
		data-address="<?php echo esc_attr($address_attr); ?>"
		data-lat="<?php echo esc_attr(is_scalar($lat) ? (string) $lat : ''); ?>"
		data-lng="<?php echo esc_attr(is_scalar($lng) ? (string) $lng : ''); ?>"
		data-zoom="<?php echo esc_attr(is_scalar($zoom) ? (string) $zoom : '17'); ?>">
		<div class="map__notice-container" style="background-image: url('<?php echo esc_url($image_src); ?>')" data-google-maps-notice-container>
			<div class="map__notice">
				<div class="map__notice-title"><?php echo esc_html__('Load map', 'baselayer'); ?></div>
				<div class="map__notice-text">
					<?php echo esc_html__('By clicking “Show map”, a connection to Google Maps is established. Data will be transferred to Google.', 'baselayer'); ?>
					<br>
					<a href="/datenschutz"><?php echo esc_html__('Privacy', 'baselayer'); ?></a>
				</div>
				<div class="map__notice-button-container">
					<button class="map__notice-button button" data-google-maps-accept-button type="button">
						<?php echo esc_html__('Show map', 'baselayer'); ?>
					</button>
				</div>
			</div>
		</div>
		<div class="map__canvas-container" data-google-maps-canvas></div>
	</div>
</div>
