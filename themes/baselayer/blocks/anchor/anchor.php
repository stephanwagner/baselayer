<?php
/**
 * Anchor block (BaseLayer Blocks).
 */

$id = bl_block_field('id');
$offset = bl_block_field('offset');
$offset = ($offset || $offset === 0 || $offset === '0' || $offset === -1) ? $offset : 0;

$class_names = ['bl-wp-block', 'anchor__wrapper'];
$wrapper_attributes = get_block_wrapper_attributes([
	'class' => implode(' ', $class_names),
]);
?>
<?php if (is_admin()) : ?>
	<div class="admin-block-preview">
		<strong><?php echo esc_html__('Anchor:', 'baselayer'); ?></strong>
		<code>#<?php echo esc_html(is_string($id) ? $id : ''); ?></code>
	</div>
<?php else : ?>
	<div
		<?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
		data-anchor-id="<?php echo esc_attr(is_string($id) ? $id : ''); ?>"
		data-anchor-offset="<?php echo esc_attr((string) $offset); ?>"></div>
<?php endif; ?>
