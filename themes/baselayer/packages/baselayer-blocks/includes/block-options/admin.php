<?php

defined('ABSPATH') || exit;

const BL_BLOCK_OPTIONS_PAGE = 'bl-block-options';

/**
 * Admin menu icon for Block Options (same glyph as Baselayer Blocks menu).
 *
 * Used when Block Options is a top-level menu (ACF / Blocks CPT off).
 * When Blocks is on, Block Options is a submenu and inherits the parent icon.
 */
function bl_block_options_menu_icon(): string
{
	if (function_exists('bl_blocks_menu_icon')) {
		return bl_blocks_menu_icon();
	}

	$svg = '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor"><path d="M633.77-486.08 486.85-633q-5.62-5.61-7.93-11.9-2.3-6.28-2.3-13.46 0-7.18 2.3-13.41 2.31-6.23 7.93-11.84l146.92-146.93q5.61-5.61 11.9-7.92 6.28-2.31 13.46-2.31 7.18 0 13.41 2.31t11.84 7.92l146.93 146.93q5.61 5.61 7.92 11.89 2.31 6.28 2.31 13.46 0 7.18-2.31 13.41-2.31 6.24-7.92 11.85L684.38-486.08q-5.61 5.62-11.89 7.92-6.29 2.31-13.46 2.31-7.18 0-13.42-2.31-6.23-2.3-11.84-7.92Zm-481.46-77.77v-207.69q0-15.36 10.39-25.76 10.4-10.39 25.76-10.39h207.69q15.37 0 25.76 10.39 10.4 10.4 10.4 25.76v207.69q0 15.37-10.4 25.76-10.39 10.4-25.76 10.4H188.46q-15.36 0-25.76-10.4-10.39-10.39-10.39-25.76Zm375.38 375.39v-207.69q0-15.37 10.4-25.76 10.39-10.4 25.76-10.4h207.69q15.36 0 25.76 10.4 10.39 10.39 10.39 25.76v207.69q0 15.36-10.39 25.76-10.4 10.39-25.76 10.39H563.85q-15.37 0-25.76-10.39-10.4-10.4-10.4-25.76Zm-375.38 0v-207.69q0-15.37 10.39-25.76 10.4-10.4 25.76-10.4h207.69q15.37 0 25.76 10.4 10.4 10.39 10.4 25.76v207.69q0 15.36-10.4 25.76-10.39 10.39-25.76 10.39H188.46q-15.36 0-25.76-10.39-10.39-10.4-10.39-25.76Zm60-399.23h160v-160h-160v160Zm447.77 43.38 113-113-113-113-113 113 113 113Zm-72.39 332h160v-160h-160v160Zm-375.38 0h160v-160h-160v160Zm160-375.38Zm174.77-69.62Zm-174.77 285Zm215.38 0Z"/></svg>';

	if (function_exists('bl_blocks_svg_menu_icon')) {
		return bl_blocks_svg_menu_icon($svg);
	}

	if (function_exists('bl_cpt_svg_to_data_uri')) {
		return bl_cpt_svg_to_data_uri($svg);
	}

	$fill = '#f3f1f1';
	$encoded = preg_replace('/\sfill="[^"]*"/i', ' fill="' . $fill . '"', $svg);
	if (is_string($encoded) && stripos($encoded, ' fill=') === false) {
		$encoded = preg_replace('/<svg\b/i', '<svg fill="' . $fill . '"', $encoded, 1);
	}

	return is_string($encoded) && $encoded !== ''
		? 'data:image/svg+xml;base64,' . base64_encode($encoded)
		: 'dashicons-admin-generic';
}

/**
 * Fallback top-level menu when the Blocks package menu is unavailable.
 * Normal order is registered in bl_blocks_register_admin_menu() (after Blocks).
 */
function bl_block_options_register_admin_menu_fallback(): void
{
	if (!current_user_can('manage_options')) {
		return;
	}

	// Already attached under Blocks → …
	if (defined('BL_BLOCK_POST_TYPE') && post_type_exists(BL_BLOCK_POST_TYPE) && function_exists('bl_blocks_user_can_manage') && bl_blocks_user_can_manage()) {
		return;
	}

	$title = __('Block Options', 'baselayer-blocks');
	add_menu_page(
		$title,
		$title,
		'manage_options',
		BL_BLOCK_OPTIONS_PAGE,
		'bl_block_options_render_admin_page',
		bl_block_options_menu_icon(),
		82
	);
}
add_action('admin_menu', 'bl_block_options_register_admin_menu_fallback', 25);

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

	// ACF blocks are not client-registered on this admin page — always prefer the
	// theme catalog SVG so list icons do not fall back to a generic dashicon.
	if (str_starts_with($name, 'acf/') && function_exists('bl_block_settings_admin_icon_map')) {
		$map = bl_block_settings_admin_icon_map();
		if (isset($map[$name]) && is_string($map[$name]) && $map[$name] !== '') {
			$icon = $map[$name];
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
		$is_child = function_exists('bl_block_settings_is_internal_child_block')
			&& bl_block_settings_is_internal_child_block($name);
		if (function_exists('bl_block_settings_is_hard_disallowed') && bl_block_settings_is_hard_disallowed($name)) {
			continue;
		}
		if (!$is_child && function_exists('bl_block_settings_is_block_allowed') && !bl_block_settings_is_block_allowed($name)) {
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
		$is_child = function_exists('bl_block_settings_is_internal_child_block')
			&& bl_block_settings_is_internal_child_block($name);
		if (!$is_child && function_exists('bl_block_settings_is_manageable_block') && !bl_block_settings_is_manageable_block($name)) {
			continue;
		}
		if (function_exists('bl_block_settings_is_hard_disallowed') && bl_block_settings_is_hard_disallowed($name)) {
			continue;
		}
		if (!$is_child && function_exists('bl_block_settings_is_block_allowed') && !bl_block_settings_is_block_allowed($name)) {
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

	// Load package strings when Blocks CPT package is off (e.g. ACF-only installs).
	if (function_exists('bl_blocks_load_textdomain')) {
		bl_blocks_load_textdomain();
	} else {
		$mofile = bl_block_options_package_root() . 'languages/baselayer-blocks-' . determine_locale() . '.mo';
		if (is_readable($mofile)) {
			load_textdomain('baselayer-blocks', $mofile);
		}
	}

	$builder_handle = function_exists('bl_blocks_enqueue_canvas_builder_kit')
		? bl_blocks_enqueue_canvas_builder_kit()
		: '';
	if ($builder_handle === '' && function_exists('bl_canvas_builder_enqueue_kit')) {
		$builder_handle = bl_canvas_builder_enqueue_kit(bl_block_options_vendor_kit_args('canvas-builder'));
	}

	$form_builder_deps = $builder_handle ? [$builder_handle] : [];
	$form_builder_handle = function_exists('bl_blocks_enqueue_form_builder_kit')
		? bl_blocks_enqueue_form_builder_kit($form_builder_deps)
		: '';
	if ($form_builder_handle === '' && function_exists('bl_form_builder_enqueue_kit')) {
		$form_builder_handle = bl_form_builder_enqueue_kit(
			bl_block_options_vendor_kit_args('form-builder') + ['deps' => $form_builder_deps]
		);
	}

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
	} else {
		bl_block_options_enqueue_package_asset('bl-blocks-admin', 'blocks-admin', 'css', $style_deps);
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
		bl_block_options_enqueue_package_asset($handle, 'block-options-admin', 'js', $deps, true);
	}

	// ACF-only installs skip the full Blocks package; still need builder SVGs for
	// field-type / drag-handle chrome in the shared options panel.
	if (!function_exists('bl_blocks_builder_icon_svgs')) {
		$builder_icons = dirname(__DIR__) . '/builder-icons.php';
		if (is_readable($builder_icons)) {
			require_once $builder_icons;
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
		'title' => __('Block Options', 'baselayer-blocks'),
		'tabBlocks' => __('Blocks', 'baselayer-blocks'),
		'tabAll' => __('All', 'baselayer-blocks'),
		'tabBaselayer' => __('BaseLayer', 'baselayer-blocks'),
		'tabAcf' => __('ACF', 'baselayer-blocks'),
		'tabCore' => __('Core', 'baselayer-blocks'),
		'tabOther' => __('Other', 'baselayer-blocks'),
		'tabPresets' => __('Presets', 'baselayer-blocks'),
		'emptyAll' => __('No blocks with options yet. Add a block below.', 'baselayer-blocks'),
		'emptyBaselayer' => __('No BaseLayer blocks with options yet. Add a block below.', 'baselayer-blocks'),
		'emptyAcf' => __('No ACF blocks with options yet. Add a block below.', 'baselayer-blocks'),
		'emptySystem' => __('No Core blocks with options yet. Add a block below.', 'baselayer-blocks'),
		'emptyPresets' => __('No presets yet. Add one.', 'baselayer-blocks'),
		'addPreset' => __('Add preset', 'baselayer-blocks'),
		'savePreset' => __('Save preset', 'baselayer-blocks'),
		'presetSlugRequired' => __('Add a slug before saving.', 'baselayer-blocks'),
		'addBlock' => __('Add block', 'baselayer-blocks'),
		'chooseBlock' => __('Select a block…', 'baselayer-blocks'),
		'searchBlocks' => __('Search blocks…', 'baselayer-blocks'),
		'noSearchResults' => __('No blocks match your search.', 'baselayer-blocks'),
		'addingBlock' => __('Adding…', 'baselayer-blocks'),
		'addBlockFailed' => __('Could not add block.', 'baselayer-blocks'),
		'noBlocksToAdd' => __('No more blocks available in this filter.', 'baselayer-blocks'),
		'untitledPreset' => __('Untitled', 'baselayer-blocks'),
		'saveBlocks' => __('Save block', 'baselayer-blocks'),
		'presetLabel' => __('Label', 'baselayer-blocks'),
		'presetSlug' => __('Slug', 'baselayer-blocks'),
		'deletePreset' => __('Delete', 'baselayer-blocks'),
		'deletePresetTitle' => __('Delete preset?', 'baselayer-blocks'),
		/* translators: %s: preset label or slug */
		'deletePresetConfirm' => __('Delete “%s”? This cannot be undone.', 'baselayer-blocks'),
		'deleteBlockTitle' => __('Remove block options?', 'baselayer-blocks'),
		/* translators: %s: block title */
		'deleteBlockConfirm' => __('Remove options for “%s”? This cannot be undone.', 'baselayer-blocks'),
		'cancel' => __('Cancel', 'baselayer-blocks'),
		'close' => __('Close', 'baselayer-blocks'),
		'remove' => __('Remove', 'baselayer-blocks'),
		'backToList' => __('All blocks', 'baselayer-blocks'),
		'backToPresets' => __('All presets', 'baselayer-blocks'),
		'saving' => __('Saving…', 'baselayer-blocks'),
		'addOption' => __('Add option', 'baselayer-blocks'),
		'addPresetRef' => __('Preset', 'baselayer-blocks'),
		'optionType' => __('Type', 'baselayer-blocks'),
		'optionLabel' => __('Label', 'baselayer-blocks'),
		'optionDescription' => __('Description', 'baselayer-blocks'),
		'optionTypeToggle' => __('Toggle', 'baselayer-blocks'),
		'optionTypeSelect' => __('Select', 'baselayer-blocks'),
		'optionTypeButtonGroup' => __('Button group', 'baselayer-blocks'),
		'optionTypeIcon' => __('Icon', 'baselayer-blocks'),
		'optionTypePreset' => __('Preset', 'baselayer-blocks'),
		'optionGroupDefault' => __('Default', 'baselayer-blocks'),
		'optionGroupCustom' => __('Custom', 'baselayer-blocks'),
		'attributeName' => __('Attribute name', 'baselayer-blocks'),
		'toggleLabel' => __('Toggle label', 'baselayer-blocks'),
		'classWhenOn' => __('CSS class when on', 'baselayer-blocks'),
		'defaultOn' => __('On by default', 'baselayer-blocks'),
		'defaultValue' => __('Default', 'baselayer-blocks'),
		'choices' => __('Choices', 'baselayer-blocks'),
		'addChoice' => __('Add choice', 'baselayer-blocks'),
		'choiceLabel' => __('Label', 'baselayer-blocks'),
		'choiceValue' => __('Value / class', 'baselayer-blocks'),
		'chooseIcon' => __('Choose icon', 'baselayer-blocks'),
		'clearIcon' => __('Clear icon', 'baselayer-blocks'),
		'icon' => __('Icon', 'baselayer-blocks'),
		'delete' => __('Delete', 'baselayer-blocks'),
		'dragField' => __('Drag to reorder', 'baselayer-blocks'),
		'expandField' => __('Expand field', 'baselayer-blocks'),
		'collapseField' => __('Collapse field', 'baselayer-blocks'),
		'choosePreset' => __('Preset', 'baselayer-blocks'),
		'presetDefaultsHelp' => __('Optional default overrides for this block:', 'baselayer-blocks'),
		'presetItemsEmpty' => __('No options yet. Add a control.', 'baselayer-blocks'),
		'blockOptionsEmpty' => __('No options yet. Add a control or attach a preset.', 'baselayer-blocks'),
		'noPresetsYet' => __('No presets yet — create some under Block Options → Presets', 'baselayer-blocks'),
		'saved' => __('Saved.', 'baselayer-blocks'),
		'saveFailed' => __('Could not save.', 'baselayer-blocks'),
		'items' => __('items', 'baselayer-blocks'),
		'summaryPresetOne' => __('preset', 'baselayer-blocks'),
		'summaryPresetMany' => __('presets', 'baselayer-blocks'),
		'summaryControlOne' => __('control', 'baselayer-blocks'),
		'summaryControlMany' => __('controls', 'baselayer-blocks'),
	];

	$admin_config = [
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
	];

	// JSON_HEX_TAG keeps inline SVGs from breaking the admin <script> tag.
	wp_add_inline_script(
		$handle,
		'window.blBlockOptionsAdmin = ' . wp_json_encode($admin_config, JSON_HEX_TAG | JSON_UNESCAPED_SLASHES) . ';',
		'before'
	);

	// Shared options panel reads BlFormBuilder.t / iconEl via blFormsAdmin.
	wp_add_inline_script(
		$handle,
		'window.blFormsAdmin = window.blFormsAdmin || ' . wp_json_encode([
			'icons' => $icons,
			'i18n'  => $i18n,
		], JSON_HEX_TAG | JSON_UNESCAPED_SLASHES) . ';',
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
		wp_send_json_error(['message' => __('Invalid presets payload.', 'baselayer-blocks')]);
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
			wp_send_json_error(['message' => __('Invalid blocks payload.', 'baselayer-blocks')]);
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
			wp_send_json_error(['message' => __('Invalid block name.', 'baselayer-blocks')]);
		}
		$raw = isset($_POST['items']) ? wp_unslash((string) $_POST['items']) : '';
		$items = json_decode($raw, true);
		if (!is_array($items)) {
			wp_send_json_error(['message' => __('Invalid items payload.', 'baselayer-blocks')]);
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
		wp_send_json_error(['message' => __('Invalid block name.', 'baselayer-blocks')]);
	}
	if (!class_exists('WP_Block_Type_Registry') || !WP_Block_Type_Registry::get_instance()->is_registered($name)) {
		wp_send_json_error(['message' => __('Block is not registered.', 'baselayer-blocks')]);
	}
	if (function_exists('bl_block_settings_is_hard_disallowed') && bl_block_settings_is_hard_disallowed($name)) {
		wp_send_json_error(['message' => __('This block cannot be enabled.', 'baselayer-blocks')]);
	}
	if (function_exists('bl_block_settings_is_manageable_block') && !bl_block_settings_is_manageable_block($name)) {
		wp_send_json_error(['message' => __('This block cannot be managed.', 'baselayer-blocks')]);
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
	echo '<h1>' . esc_html__('Block Options', 'baselayer-blocks') . '</h1>';
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
