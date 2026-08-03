<?php
/**
 * Number ticker block (BaseLayer Blocks).
 */

$items = bl_block_field('items');
$items = is_array($items) ? $items : [];

$class_names = ['bl-wp-block', '-baselayer-block', 'number-ticker__wrapper'];
$wrapper_attributes = get_block_wrapper_attributes([
	'class' => implode(' ', $class_names),
]);
?>
<div <?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
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
				<div class="number-ticker__item -col<?php echo (int) $col; ?>">
					<div class="number-ticker__number-container">
						<?php if ($prefix !== '') : ?>
							<span class="number-ticker__prefix"><?php echo esc_html($prefix); ?></span>
						<?php endif; ?>
						<span class="number-ticker__number" data-countup="<?php echo esc_attr((string) $number); ?>">
							<?php echo esc_html(is_admin() ? (string) $number : '0'); ?>
						</span>
						<?php if ($suffix !== '') : ?>
							<span class="number-ticker__suffix"><?php echo esc_html($suffix); ?></span>
						<?php endif; ?>
					</div>
					<?php if ($label !== '') : ?>
						<div class="number-ticker__label"><?php echo wp_kses_post(nl2br(esc_html($label))); ?></div>
					<?php endif; ?>
				</div>
				<?php
			}
			?>
		</div>
	</div>
</div>
