<?php
/**
 * Anchor block (BaseLayer Blocks).
 */

$id = bl_block_field('id');
$offset = bl_block_field('offset');
$offset = ($offset || $offset === 0 || $offset === '0' || $offset === -1) ? $offset : 0;
$id = is_string($id) ? $id : '';

$class_names = ['bl-wp-block', '-baselayer-block', 'anchor__wrapper'];
$wrapper_attributes = get_block_wrapper_attributes([
	'class' => implode(' ', $class_names),
]);

if (function_exists('bl_is_block_editor_preview') && bl_is_block_editor_preview()) {
	$label = esc_html__('Anchor:', 'baselayer');
	$hash = esc_html('#' . $id);
	echo bl_block_admin_preview_html('<strong>' . $label . '</strong> <code>' . $hash . '</code>'); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- helper wraps escaped HTML.
	return;
}
?>
<div
	<?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
	data-anchor-id="<?php echo esc_attr($id); ?>"
	data-anchor-offset="<?php echo esc_attr((string) $offset); ?>"></div>
