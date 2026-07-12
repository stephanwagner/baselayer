<?php

defined('ABSPATH') || exit;

/**
 * Localize resolved block options for the block editor.
 */
function fs_block_options_localize_editor(): void
{
	if (!wp_script_is('fromscratch-editor', 'enqueued') && !wp_script_is('fromscratch-editor', 'registered')) {
		return;
	}

	wp_localize_script(
		'fromscratch-editor',
		'fromscratchBlockOptions',
		fs_block_options_for_editor()
	);
}
add_action('enqueue_block_editor_assets', 'fs_block_options_localize_editor', 11);
