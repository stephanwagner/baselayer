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
$classNames[] = 'map-dsgvo__wrapper';

// Add margin class
$classNames[] = '-container-margin-xs';

if (function_exists('bl_is_block_editor_preview') && bl_is_block_editor_preview()) {
	echo bl_block_admin_preview_html( // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- helper wraps escaped HTML.
		'<strong>' . esc_html__('Map: GDPR', 'baselayer') . '</strong>'
	);
	return;
}
?>
<div class="<?= esc_attr(implode(' ', $classNames)) ?>" data-google-maps-dsgvo-container></div>
