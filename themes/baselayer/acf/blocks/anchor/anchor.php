<?php

// Class names
$classNames = ['bl-wp-block'];

// Scope
$classNames[] = '-acf-block';

// ID for specific styling
$classNames[] = $block['id'];

// Add class provided via class_field in WP backend
if (!empty($block['className'])) {
	$classNames[] = $block['className'];
}

// Add wrapper class
$classNames[] = 'anchor__wrapper';

// Fields
$id = get_field('id');
$offset = get_field('offset');
$offset = $offset || $offset === -1 ? $offset : 0;
$id = is_string($id) ? $id : (string) $id;

if (function_exists('bl_is_block_editor_preview') && bl_is_block_editor_preview()) {
	$label = esc_html__('Anchor:', 'baselayer');
	$hash = esc_html('#' . $id);
	echo bl_block_admin_preview_html('<strong>' . $label . '</strong> <code>' . $hash . '</code>'); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- helper wraps escaped HTML.
	return;
}
?>
<div
	class="<?= esc_attr(implode(' ', $classNames)) ?>"
	data-anchor-id="<?= esc_attr($id) ?>"
	data-anchor-offset="<?= esc_attr((string) $offset) ?>"></div>
