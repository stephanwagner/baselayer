<?php

// Import block filters
include __DIR__ . '/block-filters.php';

// Import blocks
$configBlocks = include __DIR__ . '/blocks.php';

// Register ACF blocks
function fs_acf_init_core()
{
	global $configBlocks;
	if (!empty($configBlocks) && function_exists('acf_register_block') && function_exists('acf_add_local_field_group')) {
		foreach ($configBlocks as $acfBlock) {
			acf_register_block([
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
			]);
		}
	}
}
add_action('acf/init', 'fs_acf_init_core');

// Render callback for ACF blocks
function fs_acf_block_render_callback($block)
{
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

// Add ACF Options Page
function fs_acf_add_options_page()
{
	if (function_exists('acf_add_options_page')) {
		$args = array(
			'page_title' => 'Theme-Config',
			'capability' => 'edit_posts',
			'menu_slug' => 'theme-settings',
			'redirect' => false,
			'icon_url' => 'dashicons-admin-settings',
			'update_button' => 'Speichern'
		);
		acf_add_options_page($args);
	}
}
add_action('acf/init', 'fs_acf_add_options_page');

// Remove core blocks
add_filter('allowed_block_types_all', function ($allowed_blocks, $editor_context) {

    $blocked = [
        'core/accordion',
        'core/accordion-item',
        'core/accordion-heading',
        'core/accordion-panel',
    ];

    // If WP already passed all registered blocks as true
    if ($allowed_blocks === true) {
        $allowed_blocks = WP_Block_Type_Registry::get_instance()->get_all_registered();
        $allowed_blocks = array_keys($allowed_blocks);
    }

    return array_values(array_diff($allowed_blocks, $blocked));
}, 10, 2);