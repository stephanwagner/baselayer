<?php

// Class names
$classNames = ['bl-wp-block'];

// Scope
$classNames[] = '-acf-block';

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

// Add wrapper class
$classNames[] = 'number-ticker__wrapper';

// Items
$items = get_field('items');
$items = is_array($items) ? $items : [];
?>

<div class="<?= implode(' ', $classNames) ?>">
	<div class="number-ticker__container">

		<div class="number-ticker__items">
			<?php
			$col = 0;
			foreach ($items as $item) {
				if (!is_array($item)) {
					continue;
				}
				$number = $item['number'] ?? '';
				if ($number === '' || $number === null) {
					continue;
				}
				$col++;
				$prefix = (string) ($item['prefix'] ?? '');
				$suffix = (string) ($item['suffix'] ?? '');
				$label = (string) ($item['label'] ?? '');
				?>
				<div class="number-ticker__item -col<?= (int) $col ?>">
					<div class="number-ticker__number-container">
						<?php if ($prefix !== '') { ?>
							<span class="number-ticker__prefix"><?= esc_html($prefix) ?></span>
						<?php } ?>
						<span class="number-ticker__number" data-countup="<?= esc_attr((string) $number) ?>"><?= esc_html(is_admin() ? (string) $number : '0') ?></span>
						<?php if ($suffix !== '') { ?>
							<span class="number-ticker__suffix"><?= esc_html($suffix) ?></span>
						<?php } ?>
					</div>
					<?php if ($label !== '') { ?>
						<div class="number-ticker__label">
							<?= wp_kses_post(nl2br(esc_html($label))) ?>
						</div>
					<?php } ?>
				</div>
				<?php
			}
			?>
		</div>

	</div>
</div>
