<?php

/**
 * Block option definitions for server-side class output (ACF blocks).
 * Keep in sync with config/block-options.js when adding ACF block options.
 *
 * @return array<string, array<int, array{type: string, attributeName: string, className?: string, default?: string|bool}>>
 */
return [
	'acf/slider' => [
		['type' => 'select', 'attributeName' => 'contentMargin', 'default' => '-content-margin-m'],
		['type' => 'select', 'attributeName' => 'contentMarginAdjust', 'default' => ''],
	],
];
