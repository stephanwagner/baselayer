<?php
/**
 * Icon + text block (BaseLayer Blocks).
 */

$icon_slug = bl_block_field('icon');
$icon_slug = is_string($icon_slug) ? sanitize_key($icon_slug) : '';
$icon_markup = '';
if ($icon_slug !== '') {
	$icon_markup = '<span class="bl-icon -icon-' . esc_attr($icon_slug) . '" aria-hidden="true"></span>';
}

$class_names = ['bl-wp-block', '-baselayer-block', 'icon-text__wrapper'];
$wrapper_attributes = get_block_wrapper_attributes([
	'class' => implode(' ', $class_names),
]);
?>
<div <?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
	<div class="icon-text__container">
		<div class="icon-text__content">
			<div class="icon-text__icon icon__icon<?php echo $icon_markup ? ' -has-icon' : ''; ?>">
				<?php echo $icon_markup; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
			</div>
			<div class="icon-text__text-container">
				<div class="icon-text__text">
					<InnerBlocks />
				</div>
			</div>
		</div>
	</div>
</div>
