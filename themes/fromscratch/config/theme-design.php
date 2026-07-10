<?php

/**
 * Design tokens merged into theme config (fs_config()). Synced to theme.json via inc/theme-setup.php.
 */
return [
	// Colors
	'colors' => [
		// Primary colors
		['slug' => 'primary', 'color' => '#4080ff', 'name' => 'Primary color'],
		['slug' => 'secondary', 'color' => '#00aaff', 'name' => 'Secondary color'],

		// Grayscale
		['slug' => 'white', 'color' => '#fff', 'name' => 'White'],
		['slug' => 'black', 'color' => '#000', 'name' => 'Black'],
		['slug' => 'off-black', 'color' => '#222', 'name' => 'Lighter black'],
		['slug' => 'gray-600', 'color' => '#666', 'name' => 'Gray 600'],
		['slug' => 'gray-500', 'color' => '#999', 'name' => 'Gray 500'],
		['slug' => 'gray-400', 'color' => '#ccc', 'name' => 'Gray 400'],
		['slug' => 'gray-300', 'color' => '#ddd', 'name' => 'Gray 300'],
		['slug' => 'gray-200', 'color' => '#eee', 'name' => 'Gray 200'],
		['slug' => 'gray-100', 'color' => '#f6f6f6', 'name' => 'Gray 100'],
	],

	// Color picker (theme.json settings.color — hides WordPress “Standard” presets when false)
	'color_options' => [
		'default_palette'   => false,
		'default_gradients' => false,
		'default_duotone'   => false,
		'custom'            => true,
	],

	// Typography (theme.json settings.typography — hides WordPress default size presets when false)
	'typography_options' => [
		'default_font_sizes' => false,
		'drop_cap'           => false,
		'fit_text'           => false,
	],

	// Gradients
	'gradients' => [
		[
			'slug' => 'primary',
			'name' => 'Primary gradient',
			'gradient' => 'linear-gradient(to right, #4080ff, #00aaff)',
		],
	],

	// Font sizes
	'font_sizes' => [
		['name' => 'Small', 'shortName' => 'S', 'size' => '14px', 'slug' => 's'],
		['name' => 'Normal', 'shortName' => 'M', 'size' => '16px', 'slug' => 'm'],
		['name' => 'Large', 'shortName' => 'L', 'size' => '18px', 'slug' => 'l'],
		['name' => 'Extra large', 'shortName' => 'XL', 'size' => '22px', 'slug' => 'xl'],
	],

	// Block editor layout
	'layout' => [
		'editor_content_width' => 960,
		'wide_bleed'           => 64,
		'editor_padding_x'     => 24,
	],
];
