<?php

defined('ABSPATH') || exit;

/**
 * Absolute path to the package customs directory.
 */
function bl_block_options_customs_dir(): string
{
	return trailingslashit(dirname(__DIR__, 2)) . 'customs/';
}

/**
 * Auto-discover customs/<name>/custom.php and build the registry.
 *
 * Each custom.php returns:
 *   label: string
 *   params: array<string, array{type: string, label?: string, default?: mixed}>
 *   build: callable(array $params): array  — full editor control
 *
 * Type defaults to the folder name.
 *
 * @return array<string, array{
 *   label: string,
 *   params: array<string, array{type: string, label: string, default: mixed}>,
 *   build: callable
 * }>
 */
function bl_block_options_customs_registry(): array
{
	static $registry = null;
	if ($registry !== null) {
		return $registry;
	}

	$registry = [];
	$dir = bl_block_options_customs_dir();
	if (!is_dir($dir)) {
		return $registry;
	}

	$entries = scandir($dir);
	if (!is_array($entries)) {
		return $registry;
	}

	foreach ($entries as $entry) {
		if ($entry === '.' || $entry === '..' || $entry[0] === '.') {
			continue;
		}
		$folder = $dir . $entry;
		if (!is_dir($folder)) {
			continue;
		}
		$file = $folder . '/custom.php';
		if (!is_readable($file)) {
			continue;
		}

		$raw = include $file;
		if (!is_array($raw)) {
			continue;
		}

		$type = sanitize_key((string) ($raw['type'] ?? $entry));
		if ($type === '' || !is_callable($raw['build'] ?? null)) {
			continue;
		}

		$params = [];
		if (isset($raw['params']) && is_array($raw['params'])) {
			foreach ($raw['params'] as $key => $param) {
				$key = (string) $key;
				if ($key === '' || !preg_match('/^[a-zA-Z_][a-zA-Z0-9_]*$/', $key) || !is_array($param)) {
					continue;
				}
				$params[$key] = [
					'type' => sanitize_key((string) ($param['type'] ?? 'text')),
					'label' => sanitize_text_field((string) ($param['label'] ?? $key)),
					'default' => $param['default'] ?? null,
				];
				if (isset($param['choices']) && is_array($param['choices'])) {
					$choices = [];
					foreach ($param['choices'] as $choice_value => $choice_label) {
						$choices[(string) $choice_value] = sanitize_text_field((string) $choice_label);
					}
					$params[$key]['choices'] = $choices;
				}
			}
		}

		$registry[$type] = [
			'label' => sanitize_text_field((string) ($raw['label'] ?? $type)),
			'params' => $params,
			'build' => $raw['build'],
		];
	}

	return $registry;
}

/**
 * Whether a control type is a registered custom.
 */
function bl_block_options_is_custom_type(string $type): bool
{
	$type = sanitize_key($type);
	$registry = bl_block_options_customs_registry();
	if ($type !== '' && isset($registry[$type])) {
		return true;
	}
	if (function_exists('bl_block_options_resolve_control_type')) {
		$resolved = bl_block_options_resolve_control_type($type);
		return $resolved !== '' && isset($registry[$resolved]);
	}
	return false;
}

/**
 * Admin / builder catalog (no factories).
 *
 * Translates labels here (after textdomain load). Registry may be built at
 * bootstrap before translations exist, so do not reuse those strings as-is.
 *
 * @return array<string, array{label: string, params: array<string, array<string, mixed>>, defaults: array<string, mixed>}>
 */
function bl_block_options_customs_catalog(): array
{
	$domain = 'baselayer-blocks';
	$out = [];
	$legacy_types = function_exists('bl_block_options_control_type_aliases')
		? bl_block_options_control_type_aliases()
		: [];

	foreach (bl_block_options_customs_registry() as $type => $def) {
		if (isset($legacy_types[$type])) {
			continue;
		}
		$defaults = [];
		$params = [];
		foreach ($def['params'] as $key => $param) {
			if (!is_array($param)) {
				continue;
			}
			$row = $param;
			if (!empty($row['label']) && is_string($row['label'])) {
				$row['label'] = __($row['label'], $domain);
			}
			if (isset($row['choices']) && is_array($row['choices'])) {
				$choices = [];
				foreach ($row['choices'] as $choice_value => $choice_label) {
					$choices[$choice_value] = is_string($choice_label)
						? __($choice_label, $domain)
						: $choice_label;
				}
				$row['choices'] = $choices;
			}
			$default = $row['default'] ?? null;
			if (
				($row['type'] ?? '') === 'text'
				&& is_string($default)
				&& $default !== ''
			) {
				$default = __($default, $domain);
			}
			$defaults[$key] = $default;
			$params[$key] = $row;
		}
		$out[$type] = [
			'label' => __((string) $def['label'], $domain),
			'params' => $params,
			'defaults' => $defaults,
		];
	}
	return $out;
}

/**
 * Sanitize params for a custom type (thin record fields only).
 *
 * @param array<string, mixed> $raw
 * @return array<string, mixed>
 */
function bl_block_options_sanitize_custom_params(string $type, array $raw): array
{
	if (function_exists('bl_block_options_resolve_control_type')) {
		$type = bl_block_options_resolve_control_type($type);
	}
	$registry = bl_block_options_customs_registry();
	if (!isset($registry[$type])) {
		return [];
	}

	$out = [];
	foreach ($registry[$type]['params'] as $key => $param) {
		if (!array_key_exists($key, $raw)) {
			continue;
		}
		$ptype = (string) ($param['type'] ?? 'text');
		$value = $raw[$key];
		if ($ptype === 'boolean') {
			$out[$key] = (bool) $value;
			continue;
		}
		if ($ptype === 'size') {
			$v = is_string($value) ? $value : '';
			if (isset($param['choices']) && is_array($param['choices'])) {
				$out[$key] = array_key_exists($v, $param['choices']) ? $v : '';
			} else {
				$out[$key] = bl_block_options_sanitize_size_token($v);
			}
			continue;
		}
		if ($ptype === 'align') {
			$align = sanitize_key((string) $value);
			$out[$key] = in_array($align, ['left', 'center', 'right'], true) ? $align : 'center';
			continue;
		}
		$out[$key] = sanitize_text_field((string) $value);
	}

	return $out;
}

/**
 * Build full editor control from a thin custom store item.
 *
 * @param array<string, mixed> $item
 * @return array<string, mixed>|null
 */
function bl_block_options_build_custom_control(array $item): ?array
{
	$type = sanitize_key((string) ($item['type'] ?? ''));
	if (function_exists('bl_block_options_resolve_control_type')) {
		$type = bl_block_options_resolve_control_type($type);
	}
	$registry = bl_block_options_customs_registry();
	if ($type === '' || !isset($registry[$type])) {
		return null;
	}

	$params = bl_block_options_sanitize_custom_params($type, $item);
	$built = ($registry[$type]['build'])($params);
	if (!is_array($built)) {
		return null;
	}
	if (array_key_exists('description', $item)) {
		$built['description'] = sanitize_textarea_field((string) $item['description']);
	}
	return $built;
}
