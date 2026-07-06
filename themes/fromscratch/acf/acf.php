<?php

// Import block filters
include __DIR__ . '/block-filters.php';

require_once get_template_directory() . '/inc/block-options-content-margin.php';

// Import blocks
$configBlocks = include __DIR__ . '/blocks.php';

// Register ACF blocks
function fs_acf_init_core()
{
	global $configBlocks;
	if (!empty($configBlocks) && function_exists('acf_register_block') && function_exists('acf_add_local_field_group')) {
		foreach ($configBlocks as $acfBlock) {
			$registration = [
				'name' => $acfBlock['name'],
				'title' => $acfBlock['title'],
				'description' => $acfBlock['description'] ?? '',
				'render_callback' => 'fs_acf_block_render_callback',
				'category' => 'design',
				'icon' => $acfBlock['icon'],
				'keywords' => $acfBlock['keywords'],
				'supports' => [
					'align' => !empty($acfBlock['supports']['align']) ? $acfBlock['supports']['align'] : false,
					'multiple' => isset($acfBlock['supports']['multiple']) ? $acfBlock['supports']['multiple'] : true,
				],
				'parent' => !empty($acfBlock['parent']) ? $acfBlock['parent'] : null,
				'api_version' => 3,
				'acf_block_version' => 3,
			];

			$example = fs_acf_block_inserter_example($acfBlock);
			if ($example !== null) {
				$registration['example'] = $example;
			}

			acf_register_block($registration);
		}
	}
}
add_action('acf/init', 'fs_acf_init_core');

/**
 * Block option config for ACF blocks (mirrors config/block-options.js).
 *
 * @return array<string, array<int, array<string, mixed>>>
 */
function fs_block_options_config(): array
{
	static $config = null;

	if ($config === null) {
		$path = get_template_directory() . '/config/block-options.php';
		$loaded = is_readable($path) ? include $path : [];
		$config = is_array($loaded) ? $loaded : [];
	}

	return $config;
}

/**
 * CSS classes from custom block options stored in block attributes.
 *
 * @param array<string, mixed> $block
 * @return array<int, string>
 */
function fs_block_option_classes(array $block): array
{
	$block_name = isset($block['name']) && is_string($block['name']) ? $block['name'] : '';
	if ($block_name === '') {
		return [];
	}

	$options = fs_block_options_config()[$block_name] ?? [];
	if ($options === []) {
		return [];
	}

	$classes = [];

	foreach ($options as $option) {
		if (!is_array($option)) {
			continue;
		}

		$type = isset($option['type']) && is_string($option['type']) ? $option['type'] : '';

		if ($type === 'content-margin') {
			$classes = array_merge($classes, fs_content_margin_classes_from_attributes($option, $block));
			continue;
		}

		$attribute_name = isset($option['attributeName']) && is_string($option['attributeName'])
			? $option['attributeName']
			: '';

		if ($attribute_name === '') {
			continue;
		}

		$value = $block[$attribute_name] ?? ($option['default'] ?? null);

		if ($type === 'boolean') {
			if ($value) {
				$class_name = isset($option['className']) && is_string($option['className'])
					? $option['className']
					: '';
				if ($class_name !== '') {
					$classes[] = $class_name;
				}
			}
			continue;
		}

		if ($type === 'select' && is_string($value) && $value !== '') {
			$classes[] = $value;
		}
	}

	return $classes;
}

/**
 * Merge block option classes into the block className before template render.
 *
 * @param array<string, mixed> $block
 * @return array<string, mixed>
 */
function fs_acf_block_apply_option_classes(array $block): array
{
	$option_classes = fs_block_option_classes($block);
	if ($option_classes === []) {
		return $block;
	}

	$existing = isset($block['className']) && is_string($block['className'])
		? trim($block['className'])
		: '';

	$block['className'] = trim($existing . ' ' . implode(' ', $option_classes));

	return $block;
}

/**
 * Inserter preview example for an ACF block (WordPress `example` property).
 *
 * Uses acf/blocks/{name}/preview.php (field values), or a static preview image via
 * `preview` in blocks.php or acf/blocks/{name}/preview.{jpg,jpeg,png,webp}.
 *
 * preview.php — field values; repeaters as nested row arrays:
 *   return [ 'id' => 'my-section' ];
 *   return [ 'items' => [ ['number' => 120, 'label' => '…'], … ] ];
 *
 * @param array<string, mixed> $acfBlock
 * @return array<string, mixed>|null
 */
function fs_acf_block_inserter_example(array $acfBlock): ?array
{
	$name = isset($acfBlock['name']) && is_string($acfBlock['name']) ? $acfBlock['name'] : '';

	$preview_data = $name !== '' ? fs_acf_block_preview_data($name) : null;
	if ($preview_data !== null) {
		return fs_acf_block_normalize_example($preview_data, $name);
	}

	$preview_uri = fs_acf_block_preview_image_uri($acfBlock);
	if ($preview_uri === null) {
		return null;
	}

	return [
		'attributes' => [
			'mode' => 'preview',
			'data' => [
				'_preview_image' => $preview_uri,
			],
		],
	];
}

/**
 * Inserter preview field values from acf/blocks/{name}/preview.php.
 *
 * @return array<string, mixed>|null
 */
function fs_acf_block_preview_data(string $block_name): ?array
{
	if ($block_name === '') {
		return null;
	}

	$path = get_theme_file_path("/acf/blocks/{$block_name}/preview.php");
	if (!is_readable($path)) {
		return null;
	}

	$data = include $path;

	return is_array($data) ? $data : null;
}

/**
 * Public URI for a block inserter preview image, if configured or on disk.
 *
 * @param array<string, mixed> $acfBlock
 */
function fs_acf_block_preview_image_uri(array $acfBlock): ?string
{
	$name = isset($acfBlock['name']) && is_string($acfBlock['name']) ? $acfBlock['name'] : '';
	if ($name === '') {
		return null;
	}

	if (!empty($acfBlock['preview']) && is_string($acfBlock['preview'])) {
		$relative = ltrim($acfBlock['preview'], '/');
		$path = get_theme_file_path('/acf/' . $relative);
		if (is_readable($path)) {
			return get_theme_file_uri('/acf/' . $relative);
		}
	}

	foreach (['jpg', 'jpeg', 'png', 'webp'] as $extension) {
		$relative = "blocks/{$name}/preview.{$extension}";
		$path = get_theme_file_path('/acf/' . $relative);
		if (is_readable($path)) {
			return get_theme_file_uri('/acf/' . $relative);
		}
	}

	return null;
}

/**
 * Normalize block example config to WordPress/ACF inserter format.
 *
 * @param array<string, mixed> $example
 * @return array<string, mixed>
 */
function fs_acf_block_normalize_example(array $example, string $block_name): array
{
	if (!isset($example['attributes'])) {
		$data = $block_name !== ''
			? fs_acf_block_example_data_expand($block_name, $example)
			: $example;

		return [
			'attributes' => [
				'mode' => 'preview',
				'data' => $data,
			],
		];
	}

	if (
		$block_name !== ''
		&& isset($example['attributes']['data'])
		&& is_array($example['attributes']['data'])
	) {
		$example['attributes']['data'] = fs_acf_block_example_data_expand(
			$block_name,
			$example['attributes']['data']
		);
	}

	return $example;
}

/**
 * Expand human-friendly example values into ACF block attribute data.
 *
 * @param array<string, mixed> $data
 * @return array<string, mixed>
 */
function fs_acf_block_example_data_expand(string $block_name, array $data): array
{
	$field_map = fs_acf_block_field_map($block_name);
	if ($field_map === []) {
		return $data;
	}

	$expanded = [];

	foreach ($data as $name => $value) {
		if (!is_string($name) || $name === '' || str_starts_with($name, '_')) {
			$expanded[$name] = $value;
			continue;
		}

		$field = $field_map[$name] ?? null;

		if (
			is_array($field)
			&& ($field['type'] ?? '') === 'repeater'
			&& is_array($value)
			&& fs_acf_is_list_array($value)
		) {
			$expanded = array_merge($expanded, fs_acf_expand_repeater_example($name, $field, $value));
			continue;
		}

		$expanded[$name] = $value;

		if (is_array($field) && !empty($field['key']) && is_string($field['key'])) {
			$expanded['_' . $name] = $field['key'];
		}
	}

	return $expanded;
}

/**
 * ACF fields for a block, keyed by field name.
 *
 * @return array<string, array<string, mixed>>
 */
function fs_acf_block_field_map(string $block_name): array
{
	static $cache = [];

	if (isset($cache[$block_name])) {
		return $cache[$block_name];
	}

	$cache[$block_name] = [];

	if ($block_name === '' || !function_exists('acf_get_field_groups') || !function_exists('acf_get_fields')) {
		return $cache[$block_name];
	}

	$groups = acf_get_field_groups(['block' => 'acf/' . $block_name]);
	if (!is_array($groups)) {
		return $cache[$block_name];
	}

	foreach ($groups as $group) {
		if (!is_array($group)) {
			continue;
		}

		$group_key = isset($group['key']) && is_string($group['key']) ? $group['key'] : '';
		if ($group_key === '') {
			continue;
		}

		$fields = acf_get_fields($group_key);
		if (!is_array($fields)) {
			continue;
		}

		foreach ($fields as $field) {
			if (!is_array($field)) {
				continue;
			}

			$name = isset($field['name']) && is_string($field['name']) ? $field['name'] : '';
			if ($name !== '') {
				$cache[$block_name][$name] = $field;
			}
		}
	}

	return $cache[$block_name];
}

/**
 * @param array<int, mixed> $array
 */
function fs_acf_is_list_array(array $array): bool
{
	return $array === [] || array_keys($array) === range(0, count($array) - 1);
}

/**
 * @param array<string, mixed> $field
 * @param array<int, array<string, mixed>> $rows
 * @return array<string, mixed>
 */
function fs_acf_expand_repeater_example(string $name, array $field, array $rows): array
{
	$out = [
		$name => count($rows),
	];

	if (!empty($field['key']) && is_string($field['key'])) {
		$out['_' . $name] = $field['key'];
	}

	$sub_map = [];
	$sub_fields = $field['sub_fields'] ?? [];

	if (is_array($sub_fields)) {
		foreach ($sub_fields as $sub_field) {
			if (!is_array($sub_field)) {
				continue;
			}

			$sub_name = isset($sub_field['name']) && is_string($sub_field['name']) ? $sub_field['name'] : '';
			if ($sub_name !== '') {
				$sub_map[$sub_name] = $sub_field;
			}
		}
	}

	foreach ($rows as $index => $row) {
		if (!is_array($row)) {
			continue;
		}

		foreach ($row as $sub_name => $sub_value) {
			if (!is_string($sub_name) || $sub_name === '') {
				continue;
			}

			$key = $name . '_' . $index . '_' . $sub_name;
			$out[$key] = $sub_value;

			$sub_field = $sub_map[$sub_name] ?? null;
			if (is_array($sub_field) && !empty($sub_field['key']) && is_string($sub_field['key'])) {
				$out['_' . $key] = $sub_field['key'];
			}
		}
	}

	return $out;
}

// Render callback for ACF blocks
function fs_acf_block_render_callback($block)
{
	if (!empty($block['data']['_preview_image']) && is_string($block['data']['_preview_image'])) {
		printf(
			'<img src="%s" alt="" class="acf-block-inserter-preview" style="width:100%%;height:auto;display:block;" />',
			esc_url($block['data']['_preview_image'])
		);
		return;
	}

	$block = fs_acf_block_apply_option_classes($block);

	$slug = str_replace('acf/', '', $block['name']);
	if (file_exists(get_theme_file_path("/acf/blocks/{$slug}/{$slug}.php"))) {
		include(get_theme_file_path("/acf/blocks/{$slug}/{$slug}.php"));
	}
}

/**
 * Read an ACF block field on the front end (get_field + block JSON data).
 *
 * @param array<string, mixed> $block ACF block array from the render callback.
 * @return mixed|null Field value, or null when unset.
 */
function fs_acf_block_field(array $block, string $field_name)
{
	if ($field_name === '') {
		return null;
	}

	$value = get_field($field_name);
	if ($value !== null && $value !== false && $value !== '') {
		return $value;
	}

	if (empty($block['data']) || !is_array($block['data'])) {
		return null;
	}

	$data = $block['data'];
	$underscore = str_replace('-', '_', $field_name);

	$ref_keys = ['_' . $field_name];
	if ($underscore !== $field_name) {
		$ref_keys[] = '_' . $underscore;
	}

	foreach ($ref_keys as $ref_key) {
		if (!array_key_exists($ref_key, $data) || !is_string($data[$ref_key]) || $data[$ref_key] === '') {
			continue;
		}

		$field_key = $data[$ref_key];
		if (!array_key_exists($field_key, $data)) {
			continue;
		}

		$raw = $data[$field_key];
		if ($raw !== null && $raw !== false && $raw !== '') {
			return $raw;
		}
	}

	if (array_key_exists($field_name, $data)) {
		$raw = $data[$field_name];
		if ($raw !== null && $raw !== false && $raw !== '') {
			return $raw;
		}
	}

	if ($underscore !== $field_name && array_key_exists($underscore, $data)) {
		$raw = $data[$underscore];
		if ($raw !== null && $raw !== false && $raw !== '') {
			return $raw;
		}
	}

	if (function_exists('acf_get_field')) {
		foreach (array_unique([$field_name, $underscore]) as $name) {
			$acf_field = acf_get_field($name);
			if (!is_array($acf_field) || empty($acf_field['key']) || !is_string($acf_field['key'])) {
				continue;
			}

			if (!array_key_exists($acf_field['key'], $data)) {
				continue;
			}

			$raw = $data[$acf_field['key']];
			if ($raw !== null && $raw !== false && $raw !== '') {
				return $raw;
			}
		}
	}

	return null;
}

/**
 * Normalized ACF select/radio value (supports array return format).
 */
function fs_acf_block_field_choice_value($value): string
{
	if (is_array($value)) {
		if (isset($value['value']) && is_scalar($value['value'])) {
			return sanitize_key((string) $value['value']);
		}

		return '';
	}

	if (!is_scalar($value)) {
		return '';
	}

	return sanitize_key((string) $value);
}

// Customize WYSIWYG Toolbar
// https://www.advancedcustomfields.com/resources/customize-the-wysiwyg-toolbars
function fs_acf_toolbars($toolbars)
{
	$toolbars['Bold Italic Underline'] = [];
	$toolbars['Bold Italic Underline'][1] = ['bold', 'italic', 'underline'];
	$toolbars['Only Bold'] = [];
	$toolbars['Only Bold'][1] = ['bold'];
	return $toolbars;
}
add_filter('acf/fields/wysiwyg/toolbars', 'fs_acf_toolbars');

/**
 * ACF admin UI: developers only (menu + direct screen access).
 */
add_filter('acf/settings/show_admin', function ($show) {
	if (!function_exists('fs_is_developer_user')) {
		return $show;
	}

	return fs_is_developer_user((int) get_current_user_id());
});

/**
 * ACF blocks with an inner-blocks toolbar insert action (see acf/blocks.php).
 *
 * @return array<string, array{insertBlock: string, label: string, text: string}>
 */
function fs_acf_inner_blocks_toolbar_config(): array
{
	global $configBlocks;

	$config = [];

	if (empty($configBlocks) || !is_array($configBlocks)) {
		return $config;
	}

	foreach ($configBlocks as $acfBlock) {
		if (empty($acfBlock['innerBlocksToolbar']) || !is_array($acfBlock['innerBlocksToolbar'])) {
			continue;
		}

		$toolbar = $acfBlock['innerBlocksToolbar'];
		$insertBlock = isset($toolbar['insertBlock']) ? (string) $toolbar['insertBlock'] : '';

		if ($insertBlock === '') {
			continue;
		}

		$name = isset($acfBlock['name']) ? (string) $acfBlock['name'] : '';

		if ($name === '') {
			continue;
		}

		$label = isset($toolbar['label']) ? (string) $toolbar['label'] : __('Add', 'fromscratch');
		$text = isset($toolbar['text']) ? (string) $toolbar['text'] : $label;

		$config['acf/' . $name] = [
			'insertBlock' => $insertBlock,
			'label'       => $label,
			'text'        => $text,
		];
	}

	return $config;
}

/**
 * Expose inner-blocks toolbar config to the block editor.
 *
 * @return void
 */
function fs_acf_inner_blocks_toolbar_localize(): void
{
	if (!wp_script_is('fromscratch-editor', 'registered')) {
		return;
	}

	wp_localize_script(
		'fromscratch-editor',
		'fromscratchAcfInnerBlocksToolbar',
		fs_acf_inner_blocks_toolbar_config()
	);
}
add_action('enqueue_block_editor_assets', 'fs_acf_inner_blocks_toolbar_localize', 11);
