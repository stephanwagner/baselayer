<?php

defined('ABSPATH') || exit;

const BL_BLOCK_OPTIONS_STORE = 'bl_block_options';
const BL_BLOCK_OPTIONS_STORE_VERSION = 1;

/**
 * @return array{
 *   version: int,
 *   blocks: array<string, array{items: list<array<string, mixed>>}>,
 *   presets: array<string, array{label: string, items: list<array<string, mixed>>}>
 * }
 */
function bl_block_options_empty_store(): array
{
	return [
		'version' => BL_BLOCK_OPTIONS_STORE_VERSION,
		'blocks' => [],
		'presets' => [],
	];
}

/**
 * @return array{
 *   version: int,
 *   blocks: array<string, array{items: list<array<string, mixed>>}>,
 *   presets: array<string, array{label: string, items: list<array<string, mixed>>}>
 * }
 */
function bl_block_options_get_store(): array
{
	$raw = get_option(BL_BLOCK_OPTIONS_STORE, null);
	if (!is_array($raw)) {
		return bl_block_options_empty_store();
	}

	return bl_block_options_sanitize_store($raw);
}

/**
 * @param array<string, mixed> $store
 */
function bl_block_options_save_store(array $store): bool
{
	return update_option(BL_BLOCK_OPTIONS_STORE, bl_block_options_sanitize_store($store), false);
}

/**
 * @param array<string, mixed> $raw
 * @return array{
 *   version: int,
 *   blocks: array<string, array{items: list<array<string, mixed>>}>,
 *   presets: array<string, array{label: string, items: list<array<string, mixed>>}>
 * }
 */
function bl_block_options_sanitize_store(array $raw): array
{
	$out = bl_block_options_empty_store();
	$out['version'] = isset($raw['version']) ? (int) $raw['version'] : BL_BLOCK_OPTIONS_STORE_VERSION;

	if (isset($raw['blocks']) && is_array($raw['blocks'])) {
		foreach ($raw['blocks'] as $block_name => $entry) {
			$block_name = sanitize_text_field((string) $block_name);
			if ($block_name === '' || !is_array($entry)) {
				continue;
			}
			$items = isset($entry['items']) && is_array($entry['items']) ? $entry['items'] : [];
			$out['blocks'][$block_name] = [
				'items' => bl_block_options_sanitize_items($items),
			];
		}
	}

	if (isset($raw['presets']) && is_array($raw['presets'])) {
		foreach ($raw['presets'] as $slug => $preset) {
			if (!is_array($preset)) {
				continue;
			}
			$slug = sanitize_title((string) $slug);
			if ($slug === '') {
				continue;
			}
			$items = isset($preset['items']) && is_array($preset['items']) ? $preset['items'] : [];
			$out['presets'][$slug] = [
				'label' => sanitize_text_field((string) ($preset['label'] ?? $slug)),
				'items' => bl_block_options_sanitize_items($items),
			];
		}
	}

	return $out;
}

/**
 * @param list<mixed> $items
 * @return list<array<string, mixed>>
 */
function bl_block_options_sanitize_items(array $items): array
{
	$out = [];
	foreach ($items as $item) {
		if (!is_array($item)) {
			continue;
		}
		$kind = sanitize_key((string) ($item['kind'] ?? ''));
		if ($kind === 'preset') {
			$clean = bl_block_options_sanitize_preset_ref($item);
			if ($clean !== null) {
				$out[] = $clean;
			}
			continue;
		}
		if ($kind !== 'control') {
			continue;
		}
		$clean = bl_block_options_sanitize_control_item($item);
		if ($clean !== null) {
			$out[] = $clean;
		}
	}

	return $out;
}

/**
 * @param array<string, mixed> $item
 * @return array{id: string, kind: string, slug: string, defaults?: array<string, array<string, mixed>>}|null
 */
function bl_block_options_sanitize_preset_ref(array $item): ?array
{
	$slug = sanitize_title((string) ($item['slug'] ?? ''));
	$id = sanitize_key((string) ($item['id'] ?? ''));
	if ($slug === '') {
		return null;
	}
	if ($id === '') {
		$id = 'p_' . substr(md5($slug . uniqid('', true)), 0, 12);
	}

	$out = [
		'id' => $id,
		'kind' => 'preset',
		'slug' => $slug,
	];

	if (isset($item['defaults']) && is_array($item['defaults'])) {
		$defaults = bl_block_options_sanitize_preset_defaults($item['defaults']);
		if ($defaults !== []) {
			$out['defaults'] = $defaults;
		}
	}

	return $out;
}

/**
 * @param array<string, mixed> $raw
 * @return array<string, array<string, mixed>>
 */
function bl_block_options_sanitize_preset_defaults(array $raw): array
{
	$out = [];
	foreach ($raw as $control_id => $params) {
		$control_id = sanitize_key((string) $control_id);
		if ($control_id === '' || !is_array($params)) {
			continue;
		}

		// Type unknown here — keep only safe scalar knobs; expand re-validates per control type.
		$clean = [];
		foreach ($params as $key => $value) {
			$key = (string) $key;
			if ($key === '' || !preg_match('/^[a-zA-Z_][a-zA-Z0-9_]*$/', $key)) {
				continue;
			}
			if (is_bool($value)) {
				$clean[$key] = $value;
			} elseif (is_int($value) || is_float($value)) {
				$clean[$key] = $value;
			} elseif (is_string($value)) {
				$clean[$key] = $key === 'description'
					? sanitize_textarea_field($value)
					: sanitize_text_field($value);
			}
		}
		if ($clean !== []) {
			$out[$control_id] = $clean;
		}
	}
	return $out;
}

/**
 * @param array<string, mixed> $item
 * @return array<string, mixed>|null
 */
function bl_block_options_sanitize_control_item(array $item): ?array
{
	$type = sanitize_key((string) ($item['type'] ?? ''));
	$id = sanitize_key((string) ($item['id'] ?? ''));
	if ($id === '') {
		$id = 'c_' . substr(md5($type . uniqid('', true)), 0, 12);
	}

	if (function_exists('bl_block_options_is_custom_type') && bl_block_options_is_custom_type($type)) {
		$params = bl_block_options_sanitize_custom_params($type, $item);
		$out = array_merge(
			[
				'id' => $id,
				'kind' => 'control',
				'type' => $type,
			],
			$params
		);
		if (array_key_exists('description', $item)) {
			$out['description'] = sanitize_textarea_field((string) $item['description']);
		}
		return $out;
	}

	$generics = ['boolean', 'select', 'button-group', 'icon'];
	if (!in_array($type, $generics, true)) {
		return null;
	}

	$out = [
		'id' => $id,
		'kind' => 'control',
		'type' => $type,
		'label' => sanitize_text_field((string) ($item['label'] ?? '')),
		// Preserve camelCase (e.g. containerPadding); sanitize_key would lowercase.
		'attributeName' => preg_replace('/[^a-zA-Z0-9_]/', '', (string) ($item['attributeName'] ?? '')) ?? '',
	];
	if (array_key_exists('description', $item)) {
		$out['description'] = sanitize_textarea_field((string) $item['description']);
	}

	if ($type === 'boolean') {
		$out['toggleLabel'] = sanitize_text_field((string) ($item['toggleLabel'] ?? ''));
		$out['className'] = sanitize_html_class((string) ($item['className'] ?? ''));
		if ($out['className'] === '' && isset($item['className']) && is_string($item['className']) && $item['className'] !== '') {
			// Allow leading hyphen class tokens used by BaseLayer.
			$out['className'] = preg_replace('/[^a-zA-Z0-9_\-]/', '', $item['className']) ?? '';
		}
		$out['default'] = !empty($item['default']);
		if (!empty($item['noSeparator'])) {
			$out['noSeparator'] = true;
		}
		return $out;
	}

	if ($type === 'icon') {
		$out['default'] = sanitize_text_field((string) ($item['default'] ?? ''));
		if (isset($item['classPrefix'])) {
			$out['classPrefix'] = sanitize_text_field((string) $item['classPrefix']);
		}
		return $out;
	}

	// select / button-group
	$out['default'] = sanitize_text_field((string) ($item['default'] ?? ''));
	if (!empty($item['noSeparator'])) {
		$out['noSeparator'] = true;
	}
	if (!empty($item['iconLabel'])) {
		$out['iconLabel'] = true;
	}
	$options = [];
	if (isset($item['options']) && is_array($item['options'])) {
		foreach ($item['options'] as $opt) {
			if (!is_array($opt)) {
				continue;
			}
			$row = [
				'label' => sanitize_text_field((string) ($opt['label'] ?? '')),
				'value' => sanitize_text_field((string) ($opt['value'] ?? '')),
			];
			if (isset($opt['title']) && is_string($opt['title']) && $opt['title'] !== '') {
				$row['title'] = sanitize_text_field($opt['title']);
			}
			if (isset($opt['icon'])) {
				$row['icon'] = sanitize_text_field((string) $opt['icon']);
			}
			if (isset($opt['iconPosition'])) {
				$row['iconPosition'] = sanitize_key((string) $opt['iconPosition']);
			}
			$options[] = $row;
		}
	}
	$out['options'] = $options;
	return $out;
}

/**
 * @return list<array<string, mixed>>
 */
function bl_block_options_get_block_items(string $block_name): array
{
	$block_name = sanitize_text_field($block_name);
	if ($block_name === '') {
		return [];
	}
	$store = bl_block_options_get_store();
	if (!isset($store['blocks'][$block_name]['items']) || !is_array($store['blocks'][$block_name]['items'])) {
		return [];
	}
	return $store['blocks'][$block_name]['items'];
}

/**
 * @param list<array<string, mixed>> $items
 */
function bl_block_options_set_block_items(string $block_name, array $items): void
{
	$block_name = sanitize_text_field($block_name);
	if ($block_name === '') {
		return;
	}
	$store = bl_block_options_get_store();
	$clean = bl_block_options_sanitize_items($items);
	if ($clean === []) {
		unset($store['blocks'][$block_name]);
	} else {
		$store['blocks'][$block_name] = ['items' => $clean];
	}
	bl_block_options_save_store($store);
}
