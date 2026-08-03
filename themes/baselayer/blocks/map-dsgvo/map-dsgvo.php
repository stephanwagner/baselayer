<?php
/**
 * Map GDPR consent block (BaseLayer Blocks).
 */

$class_names = ['bl-wp-block', '-baselayer-block', 'map-dsgvo__wrapper', '-container-margin-xs'];
$wrapper_attributes = get_block_wrapper_attributes([
	'class' => implode(' ', $class_names),
]);
?>
<?php if (is_admin()) : ?>
	<div class="admin-block-preview">
		<strong><?php echo esc_html__('Map: GDPR', 'baselayer'); ?></strong>
	</div>
<?php else : ?>
	<div <?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?> data-google-maps-dsgvo-container></div>
<?php endif; ?>
