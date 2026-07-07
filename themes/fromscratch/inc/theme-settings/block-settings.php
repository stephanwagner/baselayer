<?php

defined('ABSPATH') || exit;

/**
 * Theme settings → Blocks tab: save handler, assets, and React mount point.
 */

add_action('admin_init', function () {
	if (!current_user_can('manage_options') || !fs_theme_settings_is_settings_page_post()) {
		return;
	}
	if (empty($_POST['fromscratch_save_block_settings']) || empty($_POST['_wpnonce']) || !wp_verify_nonce($_POST['_wpnonce'], 'fromscratch_save_block_settings')) {
		return;
	}
	if (function_exists('fs_admin_can_access') && !fs_admin_can_access('theme_settings_blocks')) {
		return;
	}

	$posted = function_exists('fs_block_settings_parse_posted_settings')
		? fs_block_settings_parse_posted_settings()
		: [];

	$complete = [];
	foreach (array_keys(fs_block_settings_get_all()) as $block_name) {
		$complete[$block_name] = $posted[$block_name] ?? [];
	}

	$sanitized = function_exists('fs_sanitize_block_settings')
		? fs_sanitize_block_settings($complete)
		: [];

	foreach (fs_block_settings_get_all() as $block_name => $flags) {
		if (!empty($flags['hardDisallowed'])) {
			$sanitized[$block_name] = [
				'allowed'  => 0,
				'hidden'   => 0,
				'favorite' => 0,
			];
		}
	}

	update_option(FS_BLOCK_SETTINGS_OPTION, $sanitized);

	if (function_exists('fs_block_variation_settings_parse_posted_settings') && function_exists('fs_sanitize_block_variation_settings')) {
		$variation_posted = fs_block_variation_settings_parse_posted_settings();
		$variation_sanitized = fs_sanitize_block_variation_settings($variation_posted);
		update_option(FS_BLOCK_VARIATION_SETTINGS_OPTION, $variation_sanitized);
	}

	set_transient('fromscratch_blocks_saved', '1', 30);
	wp_safe_redirect(fs_theme_settings_url_with_tab('blocks'));
	exit;
}, 1);

add_action('admin_enqueue_scripts', function ($hook_suffix) {
	if ($hook_suffix !== 'settings_page_fs-theme-settings') {
		return;
	}

	if (!function_exists('fs_theme_settings_current_tab') || fs_theme_settings_current_tab() !== 'blocks') {
		return;
	}

	if (!current_user_can('manage_options') || (function_exists('fs_admin_can_access') && !fs_admin_can_access('theme_settings_blocks'))) {
		return;
	}

	wp_enqueue_script('wp-blocks');
	wp_enqueue_script('wp-block-library');
	wp_enqueue_script('wp-block-editor');
	wp_enqueue_style('wp-block-editor');

	if (function_exists('get_block_editor_server_block_settings')) {
		wp_add_inline_script(
			'wp-blocks',
			'wp.blocks.unstable__bootstrapServerSideBlockDefinitions(' . wp_json_encode(get_block_editor_server_block_settings(), JSON_HEX_TAG | JSON_UNESCAPED_SLASHES) . ');'
		);

		if (class_exists('WP_Block_Editor_Context') && function_exists('get_block_categories')) {
			$block_editor_context = new WP_Block_Editor_Context(['name' => 'fromscratch/block-settings']);
			wp_add_inline_script(
				'wp-blocks',
				sprintf(
					'wp.blocks.setCategories( %s );',
					wp_json_encode(get_block_categories($block_editor_context), JSON_HEX_TAG | JSON_UNESCAPED_SLASHES)
				),
				'after'
			);
		}
	}

	wp_add_inline_script(
		'wp-block-library',
		'wp.domReady( function() {
			if ( wp.blockLibrary && typeof wp.blockLibrary.registerCoreBlocks === "function" ) {
				wp.blockLibrary.registerCoreBlocks();
			}
		} );',
		'after'
	);

	$min = function_exists('fs_is_debug') && fs_is_debug() ? '' : '.min';
	$file = '/assets/js/block-settings' . $min . '.js';

	wp_enqueue_script(
		'fromscratch-block-settings',
		get_template_directory_uri() . $file,
		[
			'wp-block-library',
			'wp-block-editor',
			'wp-blocks',
			'wp-data',
			'wp-dom-ready',
			'wp-element',
			'wp-components',
			'wp-i18n',
		],
		function_exists('fs_asset_hash') ? fs_asset_hash($file) : '1.0',
		true
	);

	if (function_exists('fs_block_settings_admin_config')) {
		wp_localize_script(
			'fromscratch-block-settings',
			'fromscratchBlockSettingsAdmin',
			fs_block_settings_admin_config()
		);
	}
}, 11);

function fs_render_theme_settings_blocks_tab(): void
{
	?>
	<form method="post" action="<?= esc_url(fs_theme_settings_url_with_tab('blocks')) ?>" class="fs-page-settings-form" id="fs-block-settings-form">
		<?php wp_nonce_field('fromscratch_save_block_settings'); ?>
		<input type="hidden" name="fromscratch_save_block_settings" value="1">
		<input type="hidden" name="fromscratch_block_settings_json" id="fs-block-settings-json" value="">
		<input type="hidden" name="fromscratch_block_variations_json" id="fs-block-variations-json" value="">
		<div id="fs-block-settings-app"></div>
	</form>
	<?php
}
