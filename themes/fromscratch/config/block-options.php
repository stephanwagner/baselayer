<?php

/**
 * Block option definitions for server-side class output (ACF blocks).
 * Keep in sync with config/block-options.js when adding ACF block options.
 *
 * @return array<string, array<int, array<string, mixed>>>
 */
return [
	'acf/icon' => [
		[
			'type'          => 'button-group',
			'attributeName' => 'iconAlign',
			'default'       => '',
		],
	],
	'acf/slider' => [
		[
			'type'            => 'content-margin',
			'defaultSize'     => 'm',
			'attributeNames'  => [
				'top'    => 'contentMarginTop',
				'bottom' => 'contentMarginBottom',
				'linked' => 'contentMarginLinked',
			],
		],
	],
];
