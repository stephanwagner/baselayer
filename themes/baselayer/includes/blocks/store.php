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
			$slug = sanitize_title((string) ($item['slug'] ?? ''));
			$id = sanitize_key((string) ($item['id'] ?? ''));
			if ($slug === '') {
				continue;
			}
			if ($id === '') {
				$id = 'p_' . substr(md5($slug . uniqid('', true)), 0, 12);
			}
			$out[] = [
				'id' => $id,
				'kind' => 'preset',
				'slug' => $slug,
			];
			continue;
		}
		if ($kind !== 'control') {
			continue;
		}
		$type = sanitize_key((string) ($item['type'] ?? ''));
		$allowed = [
			'boolean',
			'select',
			'button-group',
			'icon',
			'container-margin',
			'container-padding',
			'limit-width',
			'spacer-responsive-height',
		];
		if (!in_array($type, $allowed, true)) {
			continue;
		}
		$id = sanitize_key((string) ($item['id'] ?? ''));
		if ($id === '') {
			$id = 'c_' . substr(md5($type . uniqid('', true)), 0, 12);
		}
		$clean = bl_block_options_sanitize_deep($item);
		if (!is_array($clean)) {
			continue;
		}
		$clean['id'] = $id;
		$clean['kind'] = 'control';
		$clean['type'] = $type;
		$out[] = $clean;
	}

	return $out;
}

/**
 * @param mixed $value
 * @return mixed
 */
function bl_block_options_sanitize_deep($value)
{
	if (is_array($value)) {
		$out = [];
		foreach ($value as $key => $child) {
			if (is_string($key) && !preg_match('/^[a-zA-Z_][a-zA-Z0-9_]*$/', $key)) {
				continue;
			}
			$out[$key] = bl_block_options_sanitize_deep($child);
		}
		return $out;
	}
	if (is_bool($value) || is_int($value) || is_float($value)) {
		return $value;
	}
	if (is_string($value)) {
		return sanitize_text_field($value);
	}
	return null;
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
