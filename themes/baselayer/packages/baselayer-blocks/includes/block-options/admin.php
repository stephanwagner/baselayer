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
 * Title + icon markup for a registered block.
 *
 * @return array{title: string, icon: string|null}
 */
function bl_block_options_block_meta(string $name): array
{
	$title = $name;
	$icon = null;

	if (class_exists('WP_Block_Type_Registry')) {
		$type = WP_Block_Type_Registry::get_instance()->get_registered($name);
		if ($type instanceof WP_Block_Type) {
			if (is_string($type->title) && $type->title !== '') {
				$title = $type->title;
			}
			$icon = $type->icon;
		}
	}

	if (function_exists('bl_block_settings_admin_resolve_icon')) {
		$resolved = bl_block_settings_admin_resolve_icon($name, $icon);
		$icon = is_string($resolved) && $resolved !== '' ? $resolved : null;
	} elseif (!is_string($icon) || $icon === '') {
		$icon = null;
	}

	return [
		'title' => $title,
		'icon' => $icon,
	];
}

/**
 * Store block assignments for admin lists.
 *
 * @return list<array{name: string, title: string, icon: string|null, items: list<array<string, mixed>>}>
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
		if (function_exists('bl_block_settings_is_block_allowed') && !bl_block_settings_is_block_allowed($name)) {
			continue;
		}
		$meta = bl_block_options_block_meta($name);
		$list[] = [
			'name' => $name,
			'title' => $meta['title'],
			'icon' => $meta['icon'],
			'items' => isset($entry['items']) && is_array($entry['items']) ? $entry['items'] : [],
		];
	}
	usort($list, static fn(array $a, array $b): int => strcasecmp($a['name'], $b['name']));
	return $list;
}

/**
 * Registered blocks that can be added to Block Options (not already assigned).
 *
 * @return list<array{name: string, title: string, icon: string|null}>
 */
function bl_block_options_available_blocks_catalog(): array
{
	if (!class_exists('WP_Block_Type_Registry') || !function_exists('bl_block_options_get_store')) {
		return [];
	}

	$assigned = array_fill_keys(array_map('strval', array_keys(bl_block_options_get_store()['blocks'] ?? [])), true);
	$list = [];

	foreach (WP_Block_Type_Registry::get_instance()->get_all_registered() as $name => $type) {
		$name = (string) $name;
		if ($name === '' || isset($assigned[$name])) {
			continue;
		}
		if (function_exists('bl_block_settings_is_manageable_block') && !bl_block_settings_is_manageable_block($name)) {
			continue;
		}
		if (function_exists('bl_block_settings_is_hard_disallowed') && bl_block_settings_is_hard_disallowed($name)) {
			continue;
		}
		if (function_exists('bl_block_settings_is_block_allowed') && !bl_block_settings_is_block_allowed($name)) {
			continue;
		}
		$meta = bl_block_options_block_meta($name);
		$list[] = [
			'name' => $name,
			'title' => $meta['title'],
			'icon' => $meta['icon'],
		];
	}

	usort($list, static fn(array $a, array $b): int => strcasecmp($a['title'], $b['title']));
	return $list;
}

/**
 * Ensure a block is allowed in Theme → Blocks settings.
 */
function bl_block_options_ensure_theme_block_allowed(string $block_name): bool
{
	$block_name = sanitize_text_field($block_name);
	if ($block_name === '' || !defined('BL_BLOCK_SETTINGS_OPTION')) {
		return false;
	}
	if (function_exists('bl_block_settings_is_hard_disallowed') && bl_block_settings_is_hard_disallowed($block_name)) {
		return false;
	}
	if (function_exists('bl_block_settings_is_manageable_block') && !bl_block_settings_is_manageable_block($block_name)) {
		return false;
	}

	$stored = get_option(BL_BLOCK_SETTINGS_OPTION, []);
	if (!is_array($stored)) {
		$stored = [];
	}
	$flags = isset($stored[$block_name]) && is_array($stored[$block_name]) ? $stored[$block_name] : [];
	$stored[$block_name] = [
		'allowed' => 1,
		'hidden' => !empty($flags['hidden']) ? 1 : 0,
		'favorite' => !empty($flags['favorite']) ? 1 : 0,
	];

	$sanitized = function_exists('bl_sanitize_block_settings')
		? bl_sanitize_block_settings($stored)
		: $stored;
	update_option(BL_BLOCK_SETTINGS_OPTION, $sanitized, false);

	return !function_exists('bl_block_settings_is_block_allowed')
		|| bl_block_settings_is_block_allowed($block_name);
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

	$builder_handle = function_exists('bl_blocks_enqueue_canvas_builder_kit')
		? bl_blocks_enqueue_canvas_builder_kit()
		: '';
	$form_builder_deps = $builder_handle ? [$builder_handle] : [];
	$form_builder_handle = function_exists('bl_blocks_enqueue_form_builder_kit')
		? bl_blocks_enqueue_form_builder_kit($form_builder_deps)
		: '';

	// Core block icons only exist after the client block library registers them.
	if (function_exists('bl_enqueue_admin_block_type_registry')) {
		bl_enqueue_admin_block_type_registry('baselayer/block-options');
	}

	$style_deps = ['wp-block-editor'];
	if ($form_builder_handle) {
		$style_deps[] = $form_builder_handle;
	} elseif ($builder_handle) {
		$style_deps[] = $builder_handle;
	}
	if (function_exists('bl_blocks_enqueue_style')) {
		bl_blocks_enqueue_style('bl-blocks-admin', 'blocks-admin', $style_deps);
	}

	$handle = 'bl-block-options-admin';
	$deps = [
		'wp-blocks',
		'wp-block-library',
		'wp-block-editor',
		'wp-components',
		'wp-element',
		'wp-data',
		'wp-dom-ready',
	];
	if ($form_builder_handle) {
		$deps[] = $form_builder_handle;
	} elseif ($builder_handle) {
		$deps[] = $builder_handle;
	}
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

	$icons = function_exists('bl_blocks_builder_icon_svgs')
		? bl_blocks_builder_icon_svgs()
		: [];
	$has_icon_picker = function_exists('bl_icons_localize_payload')
		&& function_exists('bl_enqueue_theme_icons_style');
	if (function_exists('bl_enqueue_theme_icons_style')) {
		if (function_exists('bl_load_icons_textdomain')) {
			bl_load_icons_textdomain();
		}
		bl_enqueue_theme_icons_style(['bl-blocks-admin']);
	}
	if ($has_icon_picker) {
		wp_localize_script($handle, 'baselayerIcons', bl_icons_localize_payload());
	}

	$i18n = [
		'title' => __('Block Options', 'baselayer'),
		'tabBlocks' => __('Blocks', 'baselayer'),
		'tabAll' => __('All', 'baselayer'),
		'tabBaselayer' => __('BaseLayer', 'baselayer'),
		'tabAcf' => __('ACF', 'baselayer'),
		'tabCore' => __('Core', 'baselayer'),
		'tabOther' => __('Other', 'baselayer'),
		'tabPresets' => __('Presets', 'baselayer'),
		'emptyAll' => __('No blocks with options yet. Add a block below, or import defaults under Blocks → Import / Export.', 'baselayer'),
		'emptyBaselayer' => __('No BaseLayer blocks with options yet. Add a block below, or import defaults under Blocks → Import / Export.', 'baselayer'),
		'emptyAcf' => __('No ACF blocks with options yet. Add a block below, or import defaults under Blocks → Import / Export.', 'baselayer'),
		'emptySystem' => __('No Core blocks with options yet. Add a block below, or import defaults under Blocks → Import / Export.', 'baselayer'),
		'emptyPresets' => __('No presets yet. Add one, or import defaults under Blocks → Import / Export.', 'baselayer'),
		'addPreset' => __('Add preset', 'baselayer'),
		'addBlock' => __('Add block', 'baselayer'),
		'chooseBlock' => __('Select a block…', 'baselayer'),
		'addingBlock' => __('Adding…', 'baselayer'),
		'addBlockFailed' => __('Could not add block.', 'baselayer'),
		'noBlocksToAdd' => __('No more blocks available in this filter.', 'baselayer'),
		'untitledPreset' => __('Untitled', 'baselayer'),
		'saveBlocks' => __('Save block', 'baselayer'),
		'presetLabel' => __('Label', 'baselayer'),
		'presetSlug' => __('Slug', 'baselayer'),
		'deletePreset' => __('Delete', 'baselayer'),
		'deletePresetTitle' => __('Delete preset?', 'baselayer'),
		/* translators: %s: preset label or slug */
		'deletePresetConfirm' => __('Delete “%s”? This cannot be undone.', 'baselayer'),
		'cancel' => __('Cancel', 'baselayer'),
		'close' => __('Close', 'baselayer'),
		'remove' => __('Remove', 'baselayer'),
		'backToList' => __('All blocks', 'baselayer'),
		'backToPresets' => __('All presets', 'baselayer'),
		'saving' => __('Saving…', 'baselayer'),
		'addOption' => __('Add option', 'baselayer'),
		'addPresetRef' => __('Preset', 'baselayer'),
		'optionType' => __('Type', 'baselayer'),
		'optionLabel' => __('Label', 'baselayer'),
		'optionDescription' => __('Description', 'baselayer'),
		'optionTypeToggle' => __('Toggle', 'baselayer'),
		'optionTypeSelect' => __('Select', 'baselayer'),
		'optionTypeButtonGroup' => __('Button group', 'baselayer'),
		'optionTypeIcon' => __('Icon', 'baselayer'),
		'optionTypePreset' => __('Preset', 'baselayer'),
		'optionGroupDefault' => __('Default', 'baselayer'),
		'optionGroupCustom' => __('Custom', 'baselayer'),
		'attributeName' => __('Attribute name', 'baselayer'),
		'toggleLabel' => __('Toggle label', 'baselayer'),
		'classWhenOn' => __('CSS class when on', 'baselayer'),
		'defaultOn' => __('On by default', 'baselayer'),
		'defaultValue' => __('Default', 'baselayer'),
		'choices' => __('Choices', 'baselayer'),
		'addChoice' => __('Add choice', 'baselayer'),
		'choiceLabel' => __('Label', 'baselayer'),
		'choiceValue' => __('Value / class', 'baselayer'),
		'chooseIcon' => __('Choose icon', 'baselayer'),
		'clearIcon' => __('Clear icon', 'baselayer'),
		'icon' => __('Icon', 'baselayer'),
		'delete' => __('Delete', 'baselayer'),
		'dragField' => __('Drag to reorder', 'baselayer'),
		'expandField' => __('Expand field', 'baselayer'),
		'collapseField' => __('Collapse field', 'baselayer'),
		'choosePreset' => __('Preset', 'baselayer'),
		'presetDefaultsHelp' => __('Optional default overrides for this block:', 'baselayer'),
		'presetItemsEmpty' => __('No options yet. Add a control.', 'baselayer'),
		'blockOptionsEmpty' => __('No options yet. Add a control or attach a preset.', 'baselayer'),
		'noPresetsYet' => __('No presets yet — create some under Block Options → Presets', 'baselayer'),
		'saved' => __('Saved.', 'baselayer'),
		'saveFailed' => __('Could not save.', 'baselayer'),
		'items' => __('items', 'baselayer'),
		'summaryPresetOne' => __('preset', 'baselayer'),
		'summaryPresetMany' => __('presets', 'baselayer'),
		'summaryControlOne' => __('control', 'baselayer'),
		'summaryControlMany' => __('controls', 'baselayer'),
	];

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
		'availableBlocks' => bl_block_options_available_blocks_catalog(),
		'ajaxUrl' => admin_url('admin-ajax.php'),
		'nonce' => wp_create_nonce('bl_block_options_admin'),
		'hasIconPicker' => $has_icon_picker,
		'i18n' => $i18n,
	]);

	// Shared options panel reads BlFormBuilder.t / iconEl via blFormsAdmin.
	wp_add_inline_script(
		$handle,
		'window.blFormsAdmin = window.blFormsAdmin || ' . wp_json_encode([
			'icons' => $icons,
			'i18n'  => $i18n,
		]) . ';',
		'before'
	);

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
			$blocks[$name] = ['items' => bl_block_options_sanitize_items($items)];
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
		$store['blocks'][$name] = ['items' => bl_block_options_sanitize_items($items)];
	}

	bl_block_options_save_store($store);

	wp_send_json_success([
		'blocks' => bl_block_options_blocks_catalog(),
		'availableBlocks' => bl_block_options_available_blocks_catalog(),
		'presets' => bl_block_options_presets_catalog(),
	]);
}
add_action('wp_ajax_bl_block_options_save_blocks', 'bl_block_options_ajax_save_blocks');

/**
 * AJAX: add a block to the options store and enable it in theme block settings.
 */
function bl_block_options_ajax_add_block(): void
{
	if (!current_user_can('manage_options')) {
		wp_send_json_error(['message' => 'Forbidden'], 403);
	}
	check_ajax_referer('bl_block_options_admin', 'nonce');

	$name = sanitize_text_field((string) ($_POST['block'] ?? ''));
	if ($name === '' || $name === '*') {
		wp_send_json_error(['message' => __('Invalid block name.', 'baselayer')]);
	}
	if (!class_exists('WP_Block_Type_Registry') || !WP_Block_Type_Registry::get_instance()->is_registered($name)) {
		wp_send_json_error(['message' => __('Block is not registered.', 'baselayer')]);
	}
	if (function_exists('bl_block_settings_is_hard_disallowed') && bl_block_settings_is_hard_disallowed($name)) {
		wp_send_json_error(['message' => __('This block cannot be enabled.', 'baselayer')]);
	}
	if (function_exists('bl_block_settings_is_manageable_block') && !bl_block_settings_is_manageable_block($name)) {
		wp_send_json_error(['message' => __('This block cannot be managed.', 'baselayer')]);
	}

	bl_block_options_ensure_theme_block_allowed($name);

	$store = bl_block_options_get_store();
	if (!isset($store['blocks'][$name]) || !is_array($store['blocks'][$name])) {
		$store['blocks'][$name] = ['items' => []];
		bl_block_options_save_store($store);
	}

	$blocks = bl_block_options_blocks_catalog();
	$added = null;
	foreach ($blocks as $row) {
		if (($row['name'] ?? '') === $name) {
			$added = $row;
			break;
		}
	}

	wp_send_json_success([
		'block' => $added,
		'blocks' => $blocks,
		'availableBlocks' => bl_block_options_available_blocks_catalog(),
	]);
}
add_action('wp_ajax_bl_block_options_add_block', 'bl_block_options_ajax_add_block');

function bl_block_options_render_admin_page(): void
{
	if (!current_user_can('manage_options')) {
		return;
	}

	echo '<div class="wrap bl-block-options-admin">';
	echo '<h1>' . esc_html__('Block Options', 'baselayer') . '</h1>';
	?>
	<div id="bl-block-options-app">
		<div class="bl-forms-builder bl-block-options-shell" aria-busy="true">
			<div class="bl-forms-builder__skeleton" aria-hidden="true">
				<div class="bl-forms-builder__skeleton-tabs">
					<span class="bl-forms-builder__skeleton-tab"></span>
					<span class="bl-forms-builder__skeleton-tab"></span>
				</div>
				<div class="bl-forms-builder__skeleton-body"></div>
			</div>
		</div>
	</div>
	<?php
	echo '</div>';
}
