<?php

/**
 * Design configuration overrides.
 *
 * Colors, typography, gradients and layout tokens.
 * Synced to theme.json and available in the Theme → Design settings.
 *
 * Parent defaults:
 *   fromscratch/config/design.php
 *
 * Only specify the settings you want to override.
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
];
