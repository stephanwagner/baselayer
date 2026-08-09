<?php
/**
 * wysiwyg test
 */

$wysiwyg = bl_block_field('wysiwyg');

$wrapper_attributes = get_block_wrapper_attributes([
	'class' => 'bl-wysiwyg-test',
]);
?>
<div <?php echo $wrapper_attributes; ?>>
	<?php if ($wysiwyg) : ?>
		<div class="bl-wysiwyg-test__wysiwyg"><?php echo wp_kses_post($wysiwyg); ?></div>
	<?php endif; ?>
</div>
