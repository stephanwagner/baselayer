<?php

defined('ABSPATH') || exit;

const BL_BLOCK_CREATOR_OPTION = 'bl_block_creator_block_options';

/**
 * Whether the Block Creator admin UI feature is enabled.
 */
function bl_block_creator_enabled(): bool
{
	return function_exists('bl_theme_feature_enabled') && bl_theme_feature_enabled('block_creator');
}

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
 * UI overlay stored by Block Creator (same shape as the config file).
 *
 * @return array<string, mixed>
 */
function bl_block_creator_load_ui_config(): array
{
	if (!bl_block_creator_enabled()) {
		return [];
	}

	$stored = get_option(BL_BLOCK_CREATOR_OPTION, []);
	return is_array($stored) ? $stored : [];
}

/**
 * Merge file config with optional UI overlay.
 *
 * @param array<string, mixed> $file
 * @param array<string, mixed> $ui
 * @return array<string, mixed>
 */
function bl_block_options_merge_configs(array $file, array $ui): array
{
	if ($ui === []) {
		return $file;
	}

	$presets = isset($file['presets']) && is_array($file['presets']) ? $file['presets'] : [];
	$ui_presets = isset($ui['presets']) && is_array($ui['presets']) ? $ui['presets'] : [];
	if ($ui_presets !== [] && function_exists('bl_config_merge_deep')) {
		$presets = bl_config_merge_deep($presets, $ui_presets);
	} elseif ($ui_presets !== []) {
		$presets = array_merge($presets, $ui_presets);
	}

	$file_assignments = isset($file['assignments']) && is_array($file['assignments']) ? $file['assignments'] : [];
	$ui_assignments = isset($ui['assignments']) && is_array($ui['assignments']) ? $ui['assignments'] : [];
	$assignments = array_merge($file_assignments, $ui_assignments);

	$blocks = isset($file['blocks']) && is_array($file['blocks']) ? $file['blocks'] : [];
	$ui_blocks = isset($ui['blocks']) && is_array($ui['blocks']) ? $ui['blocks'] : [];
	if ($ui_blocks !== [] && function_exists('bl_config_merge_deep')) {
		$blocks = bl_config_merge_deep($blocks, $ui_blocks);
	} elseif ($ui_blocks !== []) {
		$blocks = array_merge($blocks, $ui_blocks);
	}

	return [
		'presets' => $presets,
		'assignments' => $assignments,
		'blocks' => $blocks,
	];
}

/**
 * Full block-options config after file + UI merge and filters.
 *
 * @return array<string, mixed>
 */
function bl_block_options_get_config(): array
{
	$config = bl_block_options_merge_configs(
		bl_block_options_load_file_config(),
		bl_block_creator_load_ui_config()
	);

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

	// Creator custom blocks: ordered option_presets on each block def.
	if (
		function_exists('bl_block_creator_enabled')
		&& bl_block_creator_enabled()
		&& function_exists('bl_block_creator_get_blocks')
	) {
		foreach (bl_block_creator_get_blocks() as $creator_block) {
			if (!is_array($creator_block)) {
				continue;
			}
			$slug = sanitize_key((string) ($creator_block['slug'] ?? ''));
			$preset_slugs = isset($creator_block['option_presets']) && is_array($creator_block['option_presets'])
				? $creator_block['option_presets']
				: [];
			if ($slug === '' || $preset_slugs === []) {
				continue;
			}
			$block_name = 'baselayer/' . $slug;
			$controls = bl_block_options_controls_for_presets($preset_slugs, $presets);
			if ($controls === []) {
				continue;
			}
			if (!isset($map[$block_name])) {
				$map[$block_name] = [];
			}
			foreach ($controls as $control) {
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
 * Preset library for admin pickers: slug => label.
 *
 * @return array<string, string>
 */
function bl_block_options_preset_choices(): array
{
	$config = bl_block_options_get_config();
	$presets = isset($config['presets']) && is_array($config['presets']) ? $config['presets'] : [];
	$choices = [];
	foreach ($presets as $slug => $preset) {
		$slug = sanitize_key((string) $slug);
		if ($slug === '' || !is_array($preset)) {
			continue;
		}
		$label = sanitize_text_field((string) ($preset['label'] ?? $slug));
		$choices[$slug] = $label !== '' ? $label : $slug;
	}
	return $choices;
}

/**
 * Expand ordered preset slugs into a flat controls list.
 *
 * @param list<string>             $preset_slugs
 * @param array<string, mixed>|null $presets Optional presets map; defaults to config.
 * @return list<array<string, mixed>>
 */
function bl_block_options_controls_for_presets(array $preset_slugs, ?array $presets = null): array
{
	if ($presets === null) {
		$config = bl_block_options_get_config();
		$presets = isset($config['presets']) && is_array($config['presets']) ? $config['presets'] : [];
	}

	$controls = [];
	$seen = [];
	foreach ($preset_slugs as $preset_slug) {
		$preset_slug = sanitize_key((string) $preset_slug);
		if ($preset_slug === '' || isset($seen[$preset_slug]) || !isset($presets[$preset_slug]) || !is_array($presets[$preset_slug])) {
			continue;
		}
		$seen[$preset_slug] = true;
		$preset_controls = $presets[$preset_slug]['controls'] ?? [];
		if (!is_array($preset_controls)) {
			continue;
		}
		foreach ($preset_controls as $control) {
			if (is_array($control)) {
				$controls[] = $control;
			}
		}
	}

	return $controls;
}
