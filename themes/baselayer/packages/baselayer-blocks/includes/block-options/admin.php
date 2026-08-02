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

/**
 * Store block assignments for admin lists.
 *
 * @return list<array{name: string, items: list<array<string, mixed>>}>
 */
function bl_block_options_blocks_catalog(): array
{
	if (!function_exists('bl_block_options_get_store')) {
		return [];
	}
	$store = bl_block_options_get_store();
	$list = [];
	foreach ($store['blocks'] as $name => $entry) {
		$name = (string) $name;
		if ($name === '' || $name === '*') {
			continue;
		}
		$list[] = [
			'name' => $name,
			'items' => isset($entry['items']) && is_array($entry['items']) ? $entry['items'] : [],
		];
	}
	usort($list, static fn(array $a, array $b): int => strcasecmp($a['name'], $b['name']));
	return $list;
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

	$handle = 'bl-block-options-admin';
	$deps = [];
	if (function_exists('bl_blocks_enqueue_script')) {
		bl_blocks_enqueue_script($handle, 'block-options-admin', $deps, true);
	} else {
		$asset = function_exists('bl_block_options_resolve_asset')
			? bl_block_options_resolve_asset('block-options-admin', 'js')
			: null;
		if ($asset !== null) {
			wp_enqueue_script($handle, $asset['uri'], $deps, $asset['ver'], true);
		} elseif (function_exists('bl_enqueue_theme_script')) {
			bl_enqueue_theme_script($handle, 'block-options-admin', $deps, true);
		}
	}

	wp_localize_script($handle, 'blBlockOptionsAdmin', [
		'hasBaselayer' => bl_block_options_has_baselayer_blocks(),
		'hasAcf' => bl_block_options_has_acf_blocks(),
		'customs' => function_exists('bl_block_options_customs_catalog')
			? bl_block_options_customs_catalog()
			: [],
		'presets' => function_exists('bl_block_options_presets_catalog')
			? bl_block_options_presets_catalog()
			: [],
		'blocks' => bl_block_options_blocks_catalog(),
		'ajaxUrl' => admin_url('admin-ajax.php'),
		'nonce' => wp_create_nonce('bl_block_options_admin'),
		'i18n' => [
			'title' => __('Block Options', 'baselayer'),
			'intro' => __('Manage sidebar options for blocks. Create reusable presets, then assign them to blocks.', 'baselayer'),
			'tabBaselayer' => __('BaseLayer blocks', 'baselayer'),
			'tabAcf' => __('ACF blocks', 'baselayer'),
			'tabSystem' => __('System blocks', 'baselayer'),
			'tabPresets' => __('Presets', 'baselayer'),
			'emptyBaselayer' => __('No BaseLayer blocks with options yet. Import theme defaults, or assign presets from a block.', 'baselayer'),
			'emptyAcf' => __('No ACF blocks with options yet. Import theme defaults, or assign presets from a block.', 'baselayer'),
			'emptySystem' => __('No system blocks with options yet. Import theme defaults above.', 'baselayer'),
			'emptyPresets' => __('No presets yet. Add one, or import theme defaults above.', 'baselayer'),
			'addPreset' => __('Add preset', 'baselayer'),
			'savePresets' => __('Save presets', 'baselayer'),
			'saveBlocks' => __('Save block', 'baselayer'),
			'presetLabel' => __('Label', 'baselayer'),
			'presetSlug' => __('Slug', 'baselayer'),
			'deletePreset' => __('Delete', 'baselayer'),
			'remove' => __('Remove', 'baselayer'),
			'backToList' => __('← All blocks', 'baselayer'),
			'backToPresets' => __('← All presets', 'baselayer'),
			'addOption' => __('Add option', 'baselayer'),
			'addToggle' => __('Toggle', 'baselayer'),
			'addPresetRef' => __('Preset', 'baselayer'),
			'optionType' => __('Type', 'baselayer'),
			'optionLabel' => __('Label', 'baselayer'),
			'optionDescription' => __('Description', 'baselayer'),
			'defaultOn' => __('On by default', 'baselayer'),
			'defaultValue' => __('Default', 'baselayer'),
			'optionGroupDefault' => __('Default', 'baselayer'),
			'optionGroupCustom' => __('Custom', 'baselayer'),
			'choosePreset' => __('Preset', 'baselayer'),
			'presetDefaultsHelp' => __('Optional default overrides for this block:', 'baselayer'),
			'saved' => __('Saved.', 'baselayer'),
			'saveFailed' => __('Could not save.', 'baselayer'),
			'items' => __('items', 'baselayer'),
			'summaryPresets' => __('presets', 'baselayer'),
			'summaryControls' => __('controls', 'baselayer'),
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
	.bl-block-options-admin .bl-bo-preset-list{list-style:none;margin:0;padding:0}
	.bl-block-options-admin .bl-bo-preset-list li{
		display:flex;align-items:center;justify-content:space-between;gap:12px;
		padding:12px 0;border-bottom:1px solid #f0f0f1
	}
	.bl-block-options-admin .bl-bo-preset-list button.linkish{
		appearance:none;border:0;background:none;color:#2271b1;font-weight:600;cursor:pointer;padding:0;font-size:14px;text-align:left
	}
	.bl-block-options-admin .bl-bo-preset-list .meta{color:#646970;font-size:12px;font-weight:400}
	.bl-block-options-admin .bl-bo-toolbar{display:flex;gap:8px;flex-wrap:wrap;margin:0 0 16px}
	.bl-block-options-admin .bl-bo-edit-card{
		border:1px solid #dcdcde;border-radius:8px;padding:14px 16px;margin:0 0 12px;background:#fcfcfc
	}
	.bl-block-options-admin .bl-bo-edit-card label{display:block;font-weight:600;margin:0 0 4px;font-size:12px}
	.bl-block-options-admin .bl-bo-edit-card .row{margin:0 0 10px}
	.bl-block-options-admin .bl-bo-edit-card select,
	.bl-block-options-admin .bl-bo-edit-card input[type=text]{width:100%;max-width:360px}
	.bl-block-options-admin .bl-bo-edit-card .bl-bo-card-badge{
		display:inline-block;font-size:11px;font-weight:600;padding:2px 8px;border-radius:999px;
		background:#f0f6fc;color:#135e96;margin:0 0 10px
	}
	.bl-block-options-admin .bl-bo-edit-card .bl-bo-card-badge.is-preset{background:#f6f7f7;color:#1d2327}
	';
	wp_register_style('bl-block-options-admin', false, [], null);
	wp_enqueue_style('bl-block-options-admin');
	wp_add_inline_style('bl-block-options-admin', $css);
}
add_action('admin_enqueue_scripts', 'bl_block_options_enqueue_admin_assets');

/**
 * AJAX: replace store presets (blocks assignments unchanged).
 */
function bl_block_options_ajax_save_presets(): void
{
	if (!current_user_can('manage_options')) {
		wp_send_json_error(['message' => 'Forbidden'], 403);
	}
	check_ajax_referer('bl_block_options_admin', 'nonce');

	$raw = isset($_POST['presets']) ? wp_unslash((string) $_POST['presets']) : '';
	$decoded = json_decode($raw, true);
	if (!is_array($decoded)) {
		wp_send_json_error(['message' => __('Invalid presets payload.', 'baselayer')]);
	}

	$store = bl_block_options_get_store();
	$presets = [];
	foreach ($decoded as $row) {
		if (!is_array($row)) {
			continue;
		}
		$slug = sanitize_title((string) ($row['slug'] ?? ''));
		if ($slug === '') {
			continue;
		}
		$items = isset($row['items']) && is_array($row['items']) ? $row['items'] : [];
		$presets[$slug] = [
			'label' => sanitize_text_field((string) ($row['label'] ?? $slug)),
			'items' => bl_block_options_sanitize_items($items),
		];
	}
	$store['presets'] = $presets;
	bl_block_options_save_store($store);

	wp_send_json_success([
		'presets' => bl_block_options_presets_catalog(),
		'blocks' => bl_block_options_blocks_catalog(),
	]);
}
add_action('wp_ajax_bl_block_options_save_presets', 'bl_block_options_ajax_save_presets');

/**
 * AJAX: update one block’s items (or full blocks map when `blocks` is posted).
 */
function bl_block_options_ajax_save_blocks(): void
{
	if (!current_user_can('manage_options')) {
		wp_send_json_error(['message' => 'Forbidden'], 403);
	}
	check_ajax_referer('bl_block_options_admin', 'nonce');

	$store = bl_block_options_get_store();

	if (isset($_POST['blocks'])) {
		$raw = wp_unslash((string) $_POST['blocks']);
		$decoded = json_decode($raw, true);
		if (!is_array($decoded)) {
			wp_send_json_error(['message' => __('Invalid blocks payload.', 'baselayer')]);
		}
		$blocks = [];
		foreach ($decoded as $row) {
			if (!is_array($row)) {
				continue;
			}
			$name = sanitize_text_field((string) ($row['name'] ?? ''));
			if ($name === '' || $name === '*') {
				continue;
			}
			$items = isset($row['items']) && is_array($row['items']) ? $row['items'] : [];
			$clean = bl_block_options_sanitize_items($items);
			if ($clean === []) {
				continue;
			}
			$blocks[$name] = ['items' => $clean];
		}
		$store['blocks'] = $blocks;
	} else {
		$name = sanitize_text_field((string) ($_POST['block'] ?? ''));
		if ($name === '' || $name === '*') {
			wp_send_json_error(['message' => __('Invalid block name.', 'baselayer')]);
		}
		$raw = isset($_POST['items']) ? wp_unslash((string) $_POST['items']) : '';
		$items = json_decode($raw, true);
		if (!is_array($items)) {
			wp_send_json_error(['message' => __('Invalid items payload.', 'baselayer')]);
		}
		$clean = bl_block_options_sanitize_items($items);
		if ($clean === []) {
			unset($store['blocks'][$name]);
		} else {
			$store['blocks'][$name] = ['items' => $clean];
		}
	}

	bl_block_options_save_store($store);

	wp_send_json_success([
		'blocks' => bl_block_options_blocks_catalog(),
		'presets' => bl_block_options_presets_catalog(),
	]);
}
add_action('wp_ajax_bl_block_options_save_blocks', 'bl_block_options_ajax_save_blocks');

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

	$is_package_seed = $import_path !== '' && str_contains($import_path, '/seed/block-options-import.json');

	echo '<div class="bl-bo-import" style="margin:0 0 20px;padding:16px 20px;background:#fff;border:1px solid #dcdcde;border-radius:6px;max-width:960px">';
	echo '<h2 style="margin:0 0 8px;font-size:14px">' . esc_html__('Defaults', 'baselayer-blocks') . '</h2>';
	if ($import_path !== '') {
		$help = $is_package_seed
			? __('Import presets and block assignments from the package seed. This replaces the current store.', 'baselayer-blocks')
			: __('Import presets and block assignments from the theme catalog. This replaces the current store.', 'baselayer-blocks');
		echo '<p class="description" style="margin:0 0 12px">' . esc_html($help) . '</p>';
		echo '<form method="post">';
		wp_nonce_field('bl_block_options_import_theme', 'bl_block_options_import_theme_nonce');
		submit_button(__('Import defaults', 'baselayer-blocks'), 'secondary', 'bl_block_options_import_theme', false);
		echo '</form>';
	} else {
		echo '<p class="description" style="margin:0">' . esc_html__('No catalog found.', 'baselayer-blocks') . '</p>';
	}
	echo '</div>';

	echo '<div id="bl-block-options-app"><p class="description">' . esc_html__('Loading…', 'baselayer') . '</p></div>';
	echo '</div>';
}
