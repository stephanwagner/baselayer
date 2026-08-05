<?php
/**
 * Map GDPR consent block (BaseLayer Blocks).
 */

$class_names = ['bl-wp-block', '-baselayer-block', 'map-dsgvo__wrapper', '-container-margin-xs'];
$wrapper_attributes = get_block_wrapper_attributes([
	'class' => implode(' ', $class_names),
]);

if (function_exists('bl_is_block_editor_preview') && bl_is_block_editor_preview()) {
	echo bl_block_admin_preview_html( // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- helper wraps escaped HTML.
		'<strong>' . esc_html__('Map: GDPR', 'baselayer') . '</strong>'
	);
	return;
}
?>
<div <?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?> data-google-maps-dsgvo-container></div>
