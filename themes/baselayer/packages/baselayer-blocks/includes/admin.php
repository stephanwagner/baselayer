<?php

defined('ABSPATH') || exit;

/**
 * Placeholder admin until Blocks CPT + canvas builder consumer.
 */
function bl_blocks_register_admin_menu(): void
{
	if (!bl_blocks_user_can_manage()) {
		return;
	}

	add_menu_page(
		__('Blocks', 'baselayer-blocks'),
		__('Blocks', 'baselayer-blocks'),
		'manage_options',
		'bl-blocks',
		'bl_blocks_render_placeholder_page',
		'dashicons-block-default',
		81
	);
}
add_action('admin_menu', 'bl_blocks_register_admin_menu');

/**
 * Temporary landing page while the shared builder and CPT land.
 */
function bl_blocks_render_placeholder_page(): void
{
	if (!bl_blocks_user_can_manage()) {
		wp_die(esc_html__('You do not have permission to manage blocks.', 'baselayer-blocks'), 403);
	}
	?>
	<div class="wrap bl-blocks-admin">
		<h1><?= esc_html__('Blocks', 'baselayer-blocks') ?></h1>
		<div class="notice notice-info inline" style="margin-top: 16px; padding: 12px 16px;">
			<p style="margin: 0;">
				<?= esc_html__('The Blocks editor is coming next. It will use the shared canvas builder (same foundation as Forms).', 'baselayer-blocks') ?>
			</p>
		</div>
	</div>
	<?php
}
