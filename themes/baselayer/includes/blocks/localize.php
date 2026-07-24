<?php

defined('ABSPATH') || exit;

/**
 * Localize resolved block options for the block editor.
 */
function bl_block_options_localize_editor(): void
{
	if (!wp_script_is('baselayer-editor', 'enqueued') && !wp_script_is('baselayer-editor', 'registered')) {
		return;
	}

	wp_localize_script(
		'baselayer-editor',
		'baselayerBlockOptions',
		bl_block_options_for_editor()
	);
}
add_action('enqueue_block_editor_assets', 'bl_block_options_localize_editor', 11);
