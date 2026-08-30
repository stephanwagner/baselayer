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
 * Legacy preset slugs (German) ↔ current English slugs.
 *
 * @return array<string, string>
 */
function bl_block_options_preset_slug_aliases(): array
{
	return [
		'inhaltsbreite' => 'container-wide',
		'container-wide' => 'inhaltsbreite',
		'abstand' => 'margin',
		'margin' => 'abstand',
		'innenabstand' => 'inner-padding',
		'inner-padding' => 'innenabstand',
		'weite-limitieren' => 'limit-width',
		'limit-width' => 'weite-limitieren',
	];
}

/**
 * Legacy control ids inside preset defaults.
 *
 * @return array<string, string>
 */
function bl_block_options_control_id_aliases(): array
{
	return [
		'c_inhaltsbreite' => 'c_container-wide',
		'c_container-wide' => 'c_inhaltsbreite',
		'c_abstand' => 'c_margin',
		'c_margin' => 'c_abstand',
		'c_innenabstand' => 'c_inner-padding',
		'c_inner-padding' => 'c_innenabstand',
	];
}

/**
 * Resolve a preset slug against the store, falling back to a renamed alias.
 *
 * @param array<string, mixed> $presets
 */
function bl_block_options_resolve_preset_slug(string $slug, array $presets): string
{
	if ($slug !== '' && isset($presets[$slug])) {
		return $slug;
	}
	$aliases = bl_block_options_preset_slug_aliases();
	$alt = $aliases[$slug] ?? '';
	if ($alt !== '' && isset($presets[$alt])) {
		return $alt;
	}
	return $slug;
}

/**
 * Look up per-control default overrides, including renamed control ids.
 *
 * @param array<string, array<string, mixed>> $defaults
 * @return array<string, mixed>|null
 */
function bl_block_options_preset_defaults_for_control(array $defaults, string $control_id): ?array
{
	if ($control_id === '') {
		return null;
	}
	if (isset($defaults[$control_id]) && is_array($defaults[$control_id])) {
		return $defaults[$control_id];
	}
	$aliases = bl_block_options_control_id_aliases();
	$alt = $aliases[$control_id] ?? '';
	if ($alt !== '' && isset($defaults[$alt]) && is_array($defaults[$alt])) {
		return $defaults[$alt];
	}
	return null;
}

/**
 * Apply assignment default overrides onto a thin control item.
 *
 * @param array<string, mixed> $item
 * @param array<string, mixed> $overrides
 * @return array<string, mixed>
 */
function bl_block_options_apply_control_defaults(array $item, array $overrides): array
{
	$type = sanitize_key((string) ($item['type'] ?? ''));
	if ($type === '') {
		return $item;
	}

	if (function_exists('bl_block_options_is_custom_type') && bl_block_options_is_custom_type($type)) {
		$merged = array_merge($item, $overrides);
		$params = bl_block_options_sanitize_custom_params($type, $merged);
		$out = array_merge(
			[
				'id' => (string) ($item['id'] ?? ''),
				'kind' => 'control',
				'type' => $type,
			],
			$params
		);
		if (array_key_exists('description', $merged)) {
			$out['description'] = sanitize_textarea_field((string) $merged['description']);
		}
		return $out;
	}

	$merged = array_merge($item, $overrides);
	$clean = bl_block_options_sanitize_control_item($merged);
	return $clean !== null ? $clean : $item;
}

/**
 * Expand one thin control into an editor option array.
 *
 * @param array<string, mixed> $item
 * @return array<string, mixed>|null
 */
function bl_block_options_expand_control_for_editor(array $item): ?array
{
	$type = sanitize_key((string) ($item['type'] ?? ''));
	if (function_exists('bl_block_options_is_custom_type') && bl_block_options_is_custom_type($type)) {
		return bl_block_options_build_custom_control($item);
	}

	$control = $item;
	unset($control['kind'], $control['id']);
	return $control;
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
			$slug = bl_block_options_resolve_preset_slug($slug, $presets);
			if ($slug === '' || !isset($presets[$slug]['items']) || !is_array($presets[$slug]['items'])) {
				continue;
			}
			$defaults = isset($item['defaults']) && is_array($item['defaults']) ? $item['defaults'] : [];
			foreach ($presets[$slug]['items'] as $preset_item) {
				if (!is_array($preset_item) || (($preset_item['kind'] ?? '') !== 'control')) {
					continue;
				}
				$control_id = sanitize_key((string) ($preset_item['id'] ?? ''));
				$merged = $preset_item;
				$override = bl_block_options_preset_defaults_for_control($defaults, $control_id);
				if ($override !== null) {
					$merged = bl_block_options_apply_control_defaults($preset_item, $override);
				}
				$expanded = bl_block_options_expand_control_for_editor($merged);
				if (is_array($expanded)) {
					$out[] = $expanded;
				}
			}
			continue;
		}
		if ($kind !== 'control') {
			continue;
		}
		$expanded = bl_block_options_expand_control_for_editor($item);
		if (is_array($expanded)) {
			$out[] = $expanded;
		}
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
