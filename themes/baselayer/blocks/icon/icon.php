<?php
/**
 * Icon block (BaseLayer Blocks).
 */

$icon_slug = bl_block_field('icon');
$icon_slug = is_string($icon_slug) ? sanitize_key($icon_slug) : '';
$icon_markup = '';
if ($icon_slug !== '') {
	$icon_markup = '<span class="bl-icon -icon-' . esc_attr($icon_slug) . '" aria-hidden="true"></span>';
}

$class_names = ['bl-wp-block', '-baselayer-block', 'icon__wrapper'];
$wrapper_attributes = get_block_wrapper_attributes([
	'class' => implode(' ', $class_names),
]);

if ($icon_markup || is_admin()) :
	?>
	<div <?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
		<div class="icon__container">
			<div class="icon__icon<?php echo $icon_markup ? ' -has-icon' : ''; ?>">
				<?php echo $icon_markup; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
			</div>
		</div>
	</div>
	<?php
endif;
