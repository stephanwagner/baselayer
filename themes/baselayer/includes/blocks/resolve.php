<?php

defined('ABSPATH') || exit;

/**
 * Load file-based block-options config (parent + child merge).
 *
 * @return array<string, mixed>
 */
function bl_block_options_load_file_config(): array
{
	$config = function_exists('bl_load_theme_config_file')
		? bl_load_theme_config_file('config/block-options.php')
		: [];

	return is_array($config) ? $config : [];
}

/**
 * Full block-options config from file config and filters.
 *
 * @return array<string, mixed>
 */
function bl_block_options_get_config(): array
{
	$config = bl_block_options_load_file_config();

	/**
	 * Filter the resolved block-options config (presets, assignments, blocks).
	 *
	 * @param array<string, mixed> $config
	 */
	$filtered = apply_filters('bl_block_options_config', $config);

	return is_array($filtered) ? $filtered : $config;
}

/**
 * Resolve assignment `blocks` target to a list of block names.
 *
 * @param string|list<string> $blocks
 * @param list<string>        $exclude
 * @param list<string>        $known_blocks Block names already collected (for `all`).
 * @return list<string>
 */
function bl_block_options_resolve_assignment_blocks($blocks, array $exclude, array $known_blocks): array
{
	if ($blocks === 'all' || $blocks === '*') {
		$targets = $known_blocks;
	} elseif (is_string($blocks) && $blocks !== '') {
		$targets = [$blocks];
	} elseif (is_array($blocks)) {
		$targets = array_values(array_filter(array_map('strval', $blocks)));
	} else {
		$targets = [];
	}

	if ($exclude === []) {
		return $targets;
	}

	$exclude_map = array_fill_keys($exclude, true);

	return array_values(array_filter(
		$targets,
		static fn(string $name): bool => !isset($exclude_map[$name])
	));
}

/**
 * Expand presets + assignments (+ per-block extras) into editor list payload.
 *
 * @return list<array{name: string, options: list<array<string, mixed>>}>
 */
function bl_block_options_for_editor(): array
{
	$config = bl_block_options_get_config();
	$presets = isset($config['presets']) && is_array($config['presets']) ? $config['presets'] : [];
	$assignments = isset($config['assignments']) && is_array($config['assignments']) ? $config['assignments'] : [];
	$block_extras = isset($config['blocks']) && is_array($config['blocks']) ? $config['blocks'] : [];

	/** @var array<string, list<array<string, mixed>>> $map */
	$map = [];

	foreach ($block_extras as $block_name => $_extra) {
		$block_name = (string) $block_name;
		if ($block_name !== '' && !isset($map[$block_name])) {
			$map[$block_name] = [];
		}
	}

	foreach ($assignments as $assignment) {
		if (!is_array($assignment)) {
			continue;
		}

		$target = (string) ($assignment['target'] ?? 'block_option');
		if ($target !== '' && $target !== 'block_option') {
			continue;
		}

		$preset_slug = (string) ($assignment['preset'] ?? '');
		if ($preset_slug === '' || !isset($presets[$preset_slug]) || !is_array($presets[$preset_slug])) {
			continue;
		}

		$controls = $presets[$preset_slug]['controls'] ?? [];
		if (!is_array($controls) || $controls === []) {
			continue;
		}

		$exclude = [];
		if (isset($assignment['exclude']) && is_array($assignment['exclude'])) {
			$exclude = array_values(array_filter(array_map('strval', $assignment['exclude'])));
		}

		// First pass: collect explicit block names so `all` can expand later if needed.
		$blocks_spec = $assignment['blocks'] ?? [];
		if (is_array($blocks_spec)) {
			foreach ($blocks_spec as $name) {
				$name = (string) $name;
				if ($name !== '' && !isset($map[$name])) {
					$map[$name] = [];
				}
			}
		}
	}

	// Second pass: apply controls (now `all` can see known blocks from first pass + extras).
	$known = array_keys($map);
	foreach ($assignments as $assignment) {
		if (!is_array($assignment)) {
			continue;
		}

		$target = (string) ($assignment['target'] ?? 'block_option');
		if ($target !== '' && $target !== 'block_option') {
			continue;
		}

		$preset_slug = (string) ($assignment['preset'] ?? '');
		if ($preset_slug === '' || !isset($presets[$preset_slug]) || !is_array($presets[$preset_slug])) {
			continue;
		}

		$controls = $presets[$preset_slug]['controls'] ?? [];
		if (!is_array($controls) || $controls === []) {
			continue;
		}

		$exclude = [];
		if (isset($assignment['exclude']) && is_array($assignment['exclude'])) {
			$exclude = array_values(array_filter(array_map('strval', $assignment['exclude'])));
		}

		$block_names = bl_block_options_resolve_assignment_blocks(
			$assignment['blocks'] ?? [],
			$exclude,
			$known
		);

		foreach ($block_names as $block_name) {
			if (!isset($map[$block_name])) {
				$map[$block_name] = [];
			}
			foreach ($controls as $control) {
				if (is_array($control)) {
					$map[$block_name][] = $control;
				}
			}
		}
	}

	foreach ($block_extras as $block_name => $extra) {
		$block_name = (string) $block_name;
		if ($block_name === '' || !is_array($extra)) {
			continue;
		}
		$extra_controls = $extra['controls'] ?? [];
		if (!is_array($extra_controls)) {
			continue;
		}
		if (!isset($map[$block_name])) {
			$map[$block_name] = [];
		}
		foreach ($extra_controls as $control) {
			if (is_array($control)) {
				$map[$block_name][] = $control;
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
