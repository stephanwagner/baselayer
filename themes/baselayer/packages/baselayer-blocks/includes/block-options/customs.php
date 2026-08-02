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
	$registry = bl_block_options_customs_registry();
	return isset($registry[$type]);
}

/**
 * Admin / builder catalog (no factories).
 *
 * @return array<string, array{label: string, params: array<string, array<string, mixed>>, defaults: array<string, mixed>}>
 */
function bl_block_options_customs_catalog(): array
{
	$out = [];
	foreach (bl_block_options_customs_registry() as $type => $def) {
		$defaults = [];
		foreach ($def['params'] as $key => $param) {
			$defaults[$key] = $param['default'] ?? null;
		}
		$out[$type] = [
			'label' => $def['label'],
			'params' => $def['params'],
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
			$out[$key] = bl_block_options_sanitize_size_token($value);
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
	$registry = bl_block_options_customs_registry();
	if ($type === '' || !isset($registry[$type])) {
		return null;
	}

	$params = bl_block_options_sanitize_custom_params($type, $item);
	$built = ($registry[$type]['build'])($params);

	return is_array($built) ? $built : null;
}
