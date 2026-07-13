<?php

// Class names
$classNames = ['bl-wp-block'];

// ID for specific styling
$classNames[] = $block['id'];

// Align class ("alignwide") from block setting ("wide")
if (!empty($block['align'])) {
	$classNames[] = 'align' . $block['align'];
}

// Add class provided via class_field in WP backend
if (!empty($block['className'])) {
	$classNames[] = $block['className'];
}

$iconMarkup = bl_acf_block_icon_markup($block);

// Add wrapper class
$classNames[] = 'icon-text__wrapper';
?>

<div class="<?= implode(' ', $classNames) ?>">
	<div class="icon-text__container">
		<div class="icon-text__content">
			<div class="icon-text__icon icon__icon<?= $iconMarkup ? ' -has-icon' : '' ?>">
				<?php if ($iconMarkup) { ?>
					<?= $iconMarkup ?>
				<?php } ?>
			</div>
			<div class="icon-text__text-container">
				<div class="icon-text__text">
					<InnerBlocks />
				</div>
			</div>
		</div>
	</div>
</div>
