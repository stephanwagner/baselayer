<?php

// Class names
$classNames = ['fs-wp-block'];

// ID for specific styling
$classNames[] = $block['id'];

// Align class ("alignwide") from block setting ("wide")
if (!empty($block['align'])) {
	$classNames[] = 'align' . $block['align'];
}

// Add class provided via class_field in WP Backend
if (!empty($block['className'])) {
	$classNames[] = $block['className'];
}

$iconMarkup = fs_acf_block_icon_markup($block);

// Add wrapper class
$classNames[] = 'icon-text__wrapper';
?>

<div class="<?= implode(' ', $classNames) ?>">
	<div class="icon-text__container">
		<div class="icon-text__content">
			<div class="icon-text__icon">
				<?php if ($iconMarkup !== ''): ?>
					<?= $iconMarkup ?>
				<?php else: ?>
					<span class="icon-text__placeholder"><?= esc_html__('Choose an icon', 'fromscratch') ?></span>
				<?php endif; ?>
			</div>
			<div class="icon-text__text">
				<InnerBlocks />
			</div>
		</div>
	</div>
</div>
