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

		if ($type === 'select' || $type === 'button-group') {
			if (is_string($value) && $value !== '') {
				$classes[] = $value;
			}
			continue;
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

	if (
		function_exists('acf_setup_meta')
		&& !empty($block['data'])
		&& is_array($block['data'])
		&& !empty($block['id'])
		&& is_string($block['id'])
	) {
		acf_setup_meta($block['data'], $block['id'], true);
	}

	$slug = str_replace('acf/', '', $block['name']);
	if (file_exists(get_theme_file_path("/acf/blocks/{$slug}/{$slug}.php"))) {
		include(get_theme_file_path("/acf/blocks/{$slug}/{$slug}.php"));
	}

	if (function_exists('acf_reset_meta') && !empty($block['id']) && is_string($block['id'])) {
		acf_reset_meta($block['id']);
	}
}

/**
 * Block attribute data from an ACF block render context.
 *
 * @param array<string, mixed> $block
 * @return array<string, mixed>
 */
function fs_acf_block_data(array $block): array
{
	if (!empty($block['data']) && is_array($block['data'])) {
		return $block['data'];
	}

	if (
		!empty($block['attributes'])
		&& is_array($block['attributes'])
		&& !empty($block['attributes']['data'])
		&& is_array($block['attributes']['data'])
	) {
		return $block['attributes']['data'];
	}

	return [];
}

/**
 * Read a raw field value from block data (editor + front end).
 *
 * @param array<string, mixed> $block
 * @return mixed|null
 */
function fs_acf_block_raw_field_value(array $block, string $field_name)
{
	if ($field_name === '') {
		return null;
	}

	$data = fs_acf_block_data($block);
	if ($data === []) {
		return null;
	}

	$underscore = str_replace('-', '_', $field_name);
	$ref_keys = ['_' . $field_name];
	if ($underscore !== $field_name) {
		$ref_keys[] = '_' . $underscore;
	}

	foreach ($ref_keys as $ref_key) {
		if (!array_key_exists($ref_key, $data)) {
			continue;
		}

		$field_key = $data[$ref_key];
		if (!is_string($field_key) || $field_key === '' || !array_key_exists($field_key, $data)) {
			continue;
		}

		$raw = $data[$field_key];
		if ($raw !== null && $raw !== false && $raw !== '') {
			return $raw;
		}
	}

	foreach ([$field_name, $underscore] as $name) {
		if (!array_key_exists($name, $data)) {
			continue;
		}

		$raw = $data[$name];
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

	$raw = fs_acf_block_raw_field_value($block, $field_name);
	if ($raw !== null && $raw !== false && $raw !== '') {
		return $raw;
	}

	$value = get_field($field_name);
	if ($value !== null && $value !== false && $value !== '') {
		return $value;
	}

	return null;
}

/**
 * Icon slug from a block's `iconSlug` attribute.
 *
 * @param array<string, mixed> $block
 */
function fs_acf_block_icon_slug(array $block): string
{
	if (empty($block['iconSlug'])) {
		return '';
	}

	return fs_sanitize_icon_slug($block['iconSlug']);
}

/**
 * Render a theme icon span for an ACF block.
 *
 * @param array<string, mixed> $block
 * @param array<string, scalar|null> $attrs
 */
function fs_acf_block_icon_markup(array $block, array $attrs = []): string
{
	$slug = fs_acf_block_icon_slug($block);
	if ($slug === '') {
		return '';
	}

	$classes = ['fs-icon', '-icon-' . $slug];
	if (!empty($attrs['class']) && is_string($attrs['class'])) {
		$classes[] = $attrs['class'];
	}

	unset($attrs['class']);

	$attr_parts = ['class="' . esc_attr(implode(' ', $classes)) . '"', 'aria-hidden="true"'];

	foreach ($attrs as $key => $value) {
		if (!is_string($key) || $key === '' || $value === null || $value === false) {
			continue;
		}

		$attr_parts[] = esc_attr($key) . '="' . esc_attr((string) $value) . '"';
	}

	return '<span ' . implode(' ', $attr_parts) . '></span>';
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
 * ACF options page (Theme-Config).
 */
function fs_acf_add_options_page(): void
{
	if (!function_exists('acf_add_options_page')) {
		return;
	}

	acf_add_options_page([
		'page_title'    => __('Website', 'fromscratch'),
		'capability'    => 'edit_posts',
		'menu_slug'     => 'theme-settings',
		'redirect'      => false,
		'icon_url'      => function_exists('fs_cpt_menu_icon')
			? fs_cpt_menu_icon('<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M668.23-202.69q-17-5-29.81-11.85-12.81-6.85-25.34-18.69l-31.85 10.69q-6.23 2-11.85.08-5.61-1.93-9.23-7.54l-14.76-24.62q-4-5.61-2.58-12.23 1.42-6.61 6.42-11.23l24.92-21.31q-4.69-16.23-4.69-33.3 0-17.08 4.69-33.7l-24.92-21.69q-5-4.61-6.61-11.04-1.62-6.42 2.38-12.03l15.15-25q3.62-5.62 9.23-7.54 5.62-1.92 11.85.08l31.85 10.69q12.15-11.46 25.53-18.5 13.39-7.04 29.62-12.04l5.92-32.08q1.62-6.61 5.93-10.92 4.3-4.31 11.53-4.31h29.54q7.23 0 11.54 4.31 4.31 4.31 5.92 10.92l5.93 32.08q16.23 4.61 29.42 11.84 13.19 7.24 25.73 18.7l31.85-10.69q6.23-2 11.84-.08 5.62 1.92 9.23 7.54l15.16 25q4 5.61 2.38 12.03-1.61 6.43-6.61 11.04l-24.93 21.69q5.08 17 4.89 33.89-.19 16.88-5.27 33.11l24.92 21.31q4.23 3.85 6.42 10.46 2.2 6.62-2.19 13L852.61-230q-3.61 5.61-9.23 7.54-5.61 1.92-11.84-.08l-31.85-10.69q-12.54 11.46-25.35 18.5-12.8 7.04-29.8 12.04l-5.93 32.07q-1.61 6.62-5.92 10.93-4.31 4.3-11.54 4.3h-29.54q-7.23 0-11.53-4.3-4.31-4.31-5.93-10.93l-5.92-32.07ZM765-274.46q24.46-24.46 24.46-58.62 0-34.15-24.46-58.61-24.46-24.47-58.62-24.47-34.15 0-58.61 24.47-24.46 24.46-24.46 58.61 0 34.16 24.46 58.62T706.38-250q34.16 0 58.62-24.46ZM212.31-180Q182-180 161-201q-21-21-21-51.31v-535.38Q140-818 161-839q21-21 51.31-21h535.38Q778-860 799-839q21 21 21 51.31v171.77q0 12.77-8.62 20.88-8.61 8.12-21.38 8.12t-21.38-8.62q-8.62-8.61-8.62-21.38v-170.77q0-5.39-3.46-8.85t-8.85-3.46H212.31q-5.39 0-8.85 3.46t-3.46 8.85v360h142.38q13.54 0 21.77 5.11 8.23 5.12 13.23 14.5 11 18.77 25.47 31.54 14.46 12.77 31.38 19.77 5.23 2.62 8.65 7.08 3.43 4.46 3.2 10.31-.54 31.07 5.73 60.46 6.27 29.38 20.34 56.84 7.39 14.23.16 28.16Q465.08-180 449.85-180H212.31Z"/></svg>')
			: 'dashicons-admin-settings',
		'update_button' => 'Speichern',
	]);
}
add_action('acf/init', 'fs_acf_add_options_page');

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
