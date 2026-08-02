<?php

defined('ABSPATH') || exit;

const BL_BLOCK_OPTIONS_PAGE = 'bl-block-options';

/**
 * Register Blocks → Block Options.
 */
function bl_block_options_register_admin_menu(): void
{
	if (!current_user_can('manage_options')) {
		return;
	}

	$parent = (defined('BL_BLOCK_POST_TYPE') && post_type_exists(BL_BLOCK_POST_TYPE))
		? 'bl-blocks'
		: '';

	$title = __('Block Options', 'baselayer');

	if ($parent !== '') {
		add_submenu_page(
			$parent,
			$title,
			$title,
			'manage_options',
			BL_BLOCK_OPTIONS_PAGE,
			'bl_block_options_render_admin_page'
		);
		return;
	}

	add_menu_page(
		$title,
		$title,
		'manage_options',
		BL_BLOCK_OPTIONS_PAGE,
		'bl_block_options_render_admin_page',
		'dashicons-admin-generic',
		82
	);
}
add_action('admin_menu', 'bl_block_options_register_admin_menu', 25);

/**
 * @param string|null $file
 * @return string|null
 */
function bl_block_options_parent_file($file)
{
	if (isset($_GET['page']) && $_GET['page'] === BL_BLOCK_OPTIONS_PAGE) {
		return 'bl-blocks';
	}
	return $file;
}
add_filter('parent_file', 'bl_block_options_parent_file');

/**
 * @param string $submenu_file
 * @return string
 */
function bl_block_options_submenu_file($submenu_file)
{
	if (isset($_GET['page']) && $_GET['page'] === BL_BLOCK_OPTIONS_PAGE) {
		return BL_BLOCK_OPTIONS_PAGE;
	}
	return $submenu_file;
}
add_filter('submenu_file', 'bl_block_options_submenu_file');

function bl_block_options_has_baselayer_blocks(): bool
{
	return defined('BL_BLOCK_POST_TYPE') && post_type_exists(BL_BLOCK_POST_TYPE);
}

function bl_block_options_has_acf_blocks(): bool
{
	if (function_exists('acf_get_block_types')) {
		$types = acf_get_block_types();
		if (is_array($types) && $types !== []) {
			return true;
		}
	}
	if (class_exists('WP_Block_Type_Registry')) {
		foreach (WP_Block_Type_Registry::get_instance()->get_all_registered() as $block) {
			if ($block instanceof WP_Block_Type && is_string($block->name) && str_starts_with($block->name, 'acf/')) {
				return true;
			}
		}
	}
	return false;
}

function bl_block_options_enqueue_admin_assets(): void
{
	if (!current_user_can('manage_options')) {
		return;
	}
	$page = isset($_GET['page']) ? sanitize_key((string) $_GET['page']) : '';
	if ($page !== BL_BLOCK_OPTIONS_PAGE) {
		return;
	}

	if (function_exists('bl_enqueue_theme_script')) {
		bl_enqueue_theme_script('bl-block-options-admin', 'block-options-admin', [], true);
	}

	wp_localize_script('bl-block-options-admin', 'blBlockOptionsAdmin', [
		'hasBaselayer' => bl_block_options_has_baselayer_blocks(),
		'hasAcf' => bl_block_options_has_acf_blocks(),
		'i18n' => [
			'title' => __('Block Options', 'baselayer'),
			'intro' => __('Manage sidebar options for blocks. Create options per block, or reusable presets.', 'baselayer'),
			'tabBaselayer' => __('BaseLayer blocks', 'baselayer'),
			'tabAcf' => __('ACF blocks', 'baselayer'),
			'tabSystem' => __('System blocks', 'baselayer'),
			'tabPresets' => __('Presets', 'baselayer'),
			'emptyBaselayer' => __('BaseLayer blocks with options will show up here.', 'baselayer'),
			'emptyAcf' => __('ACF blocks with options will show up here.', 'baselayer'),
			'emptySystem' => __('System blocks with options will show up here.', 'baselayer'),
			'emptyPresets' => __('Reusable option presets will show up here.', 'baselayer'),
		],
	]);

	$css = '
	.bl-block-options-admin{max-width:960px}
	.bl-block-options-admin .bl-bo-intro{color:#50575e;margin:0 0 20px;font-size:14px;line-height:1.5;max-width:40rem}
	.bl-block-options-admin .bl-forms-builder__tabs{
		display:flex;align-items:center;gap:0;
		border-bottom:1px solid #dcdcde;background:#fff;
		padding:0 8px 0 4px;border-radius:6px 6px 0 0;margin:0 0 0
	}
	.bl-block-options-admin .bl-forms-builder__tab{
		appearance:none;border:0;border-bottom:3px solid transparent;background:transparent;
		padding:12px 16px;margin-bottom:-1px;font-size:13px;font-weight:600;color:#646970;cursor:pointer
	}
	.bl-block-options-admin .bl-forms-builder__tab:hover{color:#1d2327}
	.bl-block-options-admin .bl-forms-builder__tab.is-active{color:#1d2327;border-bottom-color:#2271b1}
	.bl-block-options-admin .bl-bo-panel{
		background:#fff;border:1px solid #dcdcde;border-top:0;border-radius:0 0 6px 6px;
		padding:28px 24px;min-height:180px
	}
	.bl-block-options-admin .bl-bo-empty{margin:0;color:#646970;font-size:14px;line-height:1.5}
	';
	wp_register_style('bl-block-options-admin', false, [], null);
	wp_enqueue_style('bl-block-options-admin');
	wp_add_inline_style('bl-block-options-admin', $css);
}
add_action('admin_enqueue_scripts', 'bl_block_options_enqueue_admin_assets');

function bl_block_options_render_admin_page(): void
{
	if (!current_user_can('manage_options')) {
		return;
	}

	$notice_key = 'bl_block_options_import_notice_' . get_current_user_id();
	$notice = get_transient($notice_key);
	if (is_array($notice)) {
		delete_transient($notice_key);
		$type = ($notice['type'] ?? '') === 'error' ? 'error' : 'success';
		$message = isset($notice['message']) ? (string) $notice['message'] : '';
		if ($message !== '') {
			printf(
				'<div class="notice notice-%1$s is-dismissible"><p>%2$s</p></div>',
				esc_attr($type),
				esc_html($message)
			);
		}
	}

	$import_path = function_exists('bl_block_options_theme_import_path')
		? bl_block_options_theme_import_path()
		: '';

	echo '<div class="wrap bl-block-options-admin">';
	echo '<h1>' . esc_html__('Block Options', 'baselayer') . '</h1>';

	echo '<div class="bl-bo-import" style="margin:0 0 20px;padding:16px 20px;background:#fff;border:1px solid #dcdcde;border-radius:6px;max-width:960px">';
	echo '<h2 style="margin:0 0 8px;font-size:14px">' . esc_html__('Theme defaults', 'baselayer') . '</h2>';
	if ($import_path !== '') {
		echo '<p class="description" style="margin:0 0 12px">' . esc_html__('Import presets and block assignments from config/block-options-import.json. This replaces the current store.', 'baselayer') . '</p>';
		echo '<form method="post">';
		wp_nonce_field('bl_block_options_import_theme', 'bl_block_options_import_theme_nonce');
		submit_button(__('Import theme defaults', 'baselayer'), 'secondary', 'bl_block_options_import_theme', false);
		echo '</form>';
	} else {
		echo '<p class="description" style="margin:0">' . esc_html__('No catalog found. Add config/block-options-import.json to the theme.', 'baselayer') . '</p>';
	}
	echo '</div>';

	echo '<div id="bl-block-options-app"><p class="description">' . esc_html__('Loading…', 'baselayer') . '</p></div>';
	echo '</div>';
}
