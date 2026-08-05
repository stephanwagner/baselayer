<?php
/**
 * Accordion block (BaseLayer Blocks).
 *
 * Available: bl_block_field(), bl_block_inner_blocks(), $values, $fields, $block, $attributes, $def, $content
 * Inner content: <InnerBlocks /> or <?php echo bl_block_inner_blocks(); ?>
 */

$title = bl_block_field('title');
$id = bl_block_field('id');
$close_neighbouring = (bool) bl_block_field('close_neighbouring_accordions');
$scroll_to_top = (bool) bl_block_field('scroll_to_accordion_top');
$is_open = (bool) bl_block_field('accordion_is_open');
$add_to_faq_schema = (bool) bl_block_field('has_advanced_settings') && (bool) bl_block_field('add_to_faq_schema');

$class_names = ['bl-wp-block', '-baselayer-block', 'accordion__wrapper'];

if ($is_open) {
	$class_names[] = 'accordion-open';
}

$wrapper_attributes = get_block_wrapper_attributes([
	'class' => implode(' ', $class_names),
]);

global $globalAccordionId;
if (empty($globalAccordionId)) {
	$globalAccordionId = 0;
}
$globalAccordionId += 1;

$accordion_id = is_string($id) && $id !== '' ? $id : 'accordion-' . $globalAccordionId;
$inner = bl_block_inner_blocks();
?>
<div
	<?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
	data-accordion-id="<?php echo esc_attr($accordion_id); ?>"
	data-close-neighbouring-accordions="<?php echo $close_neighbouring ? 'true' : 'false'; ?>"
	data-scroll-to-accordion-top="<?php echo $scroll_to_top ? 'true' : 'false'; ?>"
	data-accordion-is-open="<?php echo $is_open ? 'true' : 'false'; ?>">
	<div class="accordion__container">
		<div
			class="accordion__header noselect"
			id="accordion-header-<?php echo esc_attr($accordion_id); ?>"
			role="button"
			tabindex="0"
			aria-expanded="<?php echo $is_open ? 'true' : 'false'; ?>"
			aria-controls="accordion-content-<?php echo esc_attr($accordion_id); ?>">
			<div class="accordion__title">
				<?= $title ? esc_html($title) : '&nbsp;' ?>
			</div>
			<div class="accordion__icon">
				<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor" aria-hidden="true">
					<path d="M466.54-375.23q-6.23-2.31-11.85-7.92L274.92-562.92q-8.3-8.31-8.5-20.89-.19-12.57 8.5-21.27 8.7-8.69 21.08-8.69 12.38 0 21.08 8.69L480-442.15l162.92-162.93q8.31-8.3 20.89-8.5 12.57-.19 21.27 8.5 8.69 8.7 8.69 21.08 0 12.38-8.69 21.08L505.31-383.15q-5.62 5.61-11.85 7.92-6.23 2.31-13.46 2.31t-13.46-2.31Z" />
				</svg>
			</div>
		</div>
		<div
			class="accordion__content"
			id="accordion-content-<?php echo esc_attr($accordion_id); ?>"
			aria-labelledby="accordion-header-<?php echo esc_attr($accordion_id); ?>">
			<div class="accordion__content-inner">
				<InnerBlocks />
			</div>
		</div>
	</div>
</div>
<?php
if ($add_to_faq_schema && function_exists('bl_schema_faq_collect')) {
	bl_schema_faq_collect(
		is_string($title) ? $title : '',
		$inner
	);
}
