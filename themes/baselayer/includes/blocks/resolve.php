<?php

defined('ABSPATH') || exit;

/**
 * Registered Gutenberg block names (for `*` expansion).
 *
 * @return list<string>
 */
function bl_block_options_registered_block_names(): array
{
	if (!class_exists('WP_Block_Type_Registry')) {
		return [];
	}

	$names = [];
	foreach (WP_Block_Type_Registry::get_instance()->get_all_registered() as $block) {
		if ($block instanceof WP_Block_Type && is_string($block->name) && $block->name !== '') {
			$names[] = $block->name;
		}
	}

	return $names;
}

/**
 * Expand store items (controls + preset refs) into editor option arrays.
 *
 * @param list<array<string, mixed>> $items
 * @param array<string, array{label?: string, items?: list<array<string, mixed>>}> $presets
 * @return list<array<string, mixed>>
 */
function bl_block_options_expand_items_for_editor(array $items, array $presets): array
{
	$out = [];
	foreach ($items as $item) {
		if (!is_array($item)) {
			continue;
		}
		$kind = (string) ($item['kind'] ?? '');
		if ($kind === 'preset') {
			$slug = sanitize_title((string) ($item['slug'] ?? ''));
			if ($slug === '' || !isset($presets[$slug]['items']) || !is_array($presets[$slug]['items'])) {
				continue;
			}
			foreach (bl_block_options_expand_items_for_editor($presets[$slug]['items'], []) as $control) {
				$out[] = $control;
			}
			continue;
		}
		if ($kind !== 'control') {
			continue;
		}
		$control = $item;
		unset($control['kind'], $control['id']);
		$out[] = $control;
	}
	return $out;
}

/**
 * Editor list payload from bl_block_options store only.
 *
 * Block key `*` is merged onto every registered block (and every explicit store block).
 *
 * @return list<array{name: string, options: list<array<string, mixed>>}>
 */
function bl_block_options_for_editor(): array
{
	if (!function_exists('bl_block_options_get_store')) {
		return [];
	}

	$store = bl_block_options_get_store();
	$presets = isset($store['presets']) && is_array($store['presets']) ? $store['presets'] : [];
	$blocks = isset($store['blocks']) && is_array($store['blocks']) ? $store['blocks'] : [];

	$star_items = [];
	if (isset($blocks['*']['items']) && is_array($blocks['*']['items'])) {
		$star_items = $blocks['*']['items'];
	}
	$star_controls = bl_block_options_expand_items_for_editor($star_items, $presets);

	/** @var array<string, list<array<string, mixed>>> $map */
	$map = [];

	foreach ($blocks as $block_name => $entry) {
		$block_name = (string) $block_name;
		if ($block_name === '' || $block_name === '*') {
			continue;
		}
		$items = isset($entry['items']) && is_array($entry['items']) ? $entry['items'] : [];
		$controls = bl_block_options_expand_items_for_editor($items, $presets);
		if ($controls === [] && $star_controls === []) {
			continue;
		}
		$map[$block_name] = array_merge($star_controls, $controls);
	}

	if ($star_controls !== []) {
		foreach (bl_block_options_registered_block_names() as $name) {
			if (!isset($map[$name])) {
				$map[$name] = $star_controls;
			}
		}
	}

	$list = [];
	foreach ($map as $name => $options) {
		if ($options === []) {
			continue;
		}
		$list[] = [
			'name' => $name,
			'options' => $options,
		];
	}

	return $list;
}

/**
 * One-time cleanup of removed Block Creator options and feature flag.
 */
function bl_block_options_cleanup_legacy_creator(): void
{
	if (get_option('bl_block_creator_cleaned')) {
		return;
	}

	delete_option('bl_block_creator_block_options');
	delete_option('bl_block_creator_blocks');

	$features = get_option('baselayer_features', []);
	if (is_array($features) && array_key_exists('enable_block_creator', $features)) {
		unset($features['enable_block_creator']);
		update_option('baselayer_features', $features, false);
	}

	update_option('bl_block_creator_cleaned', 1, false);
}
add_action('admin_init', 'bl_block_options_cleanup_legacy_creator', 1);
