<?php

/**
 * Design configuration.
 *
 * Colors, typography, gradients and layout tokens.
 * Synced to theme.json and available in the Theme → Design settings.
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
		['slug' => 'gray-900', 'color' => '#23292e', 'name' => 'Gray 900'],
		['slug' => 'gray-800', 'color' => '#3c434a', 'name' => 'Gray 800'],
		['slug' => 'gray-700', 'color' => '#58616b', 'name' => 'Gray 700'],
		['slug' => 'gray-600', 'color' => '#6f7882', 'name' => 'Gray 600'],
		['slug' => 'gray-500', 'color' => '#8b959e', 'name' => 'Gray 500'],
		['slug' => 'gray-400', 'color' => '#afb8c1', 'name' => 'Gray 400'],
		['slug' => 'gray-300', 'color' => '#d0d7de', 'name' => 'Gray 300'],
		['slug' => 'gray-200', 'color' => '#eaeef2', 'name' => 'Gray 200'],
		['slug' => 'gray-100', 'color' => '#f6f8fa', 'name' => 'Gray 100'],
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
		'editor_content_width'   => 960,
		'editor_content_padding' => 24,
		'alignwide_bleed'        => 32,
	],
];
