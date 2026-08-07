<?php

defined('ABSPATH') || exit;

if (!function_exists('bl_block_options_control_limit_width')) {
	/**
	 * Linked width size + alignment control.
	 *
	 * @return array<string, mixed>
	 */
	function bl_block_options_control_limit_width(): array
	{
		return [
			'type' => 'limit-width',
			'label' => __('Limit width', 'baselayer-blocks'),
			'defaultSize' => '',
			'defaultAlign' => 'center',
			'attributeNames' => [
				'size' => 'limitWidthSize',
				'align' => 'limitWidthAlign',
			],
		];
	}
}

// Catalog metadata: plain msgids (translated in bl_block_options_customs_catalog after textdomain load).
if (false) {
	__('Limit width', 'baselayer-blocks');
	__('Label', 'baselayer-blocks');
	__('Default size', 'baselayer-blocks');
	__('Default align', 'baselayer-blocks');
}

return [
	'label' => 'Limit width',
	'params' => [
		'label' => [
			'type' => 'text',
			'label' => 'Label',
			'default' => 'Limit width',
		],
		'defaultSize' => [
			'type' => 'size',
			'label' => 'Default size',
			'default' => '',
			'choices' => [
				'' => '—',
				's' => 'S',
				'm' => 'M',
				'l' => 'L',
			],
		],
		'defaultAlign' => [
			'type' => 'align',
			'label' => 'Default align',
			'default' => 'center',
		],
	],
	'build' => static function (array $params): array {
		$built = bl_block_options_control_limit_width();
		if (isset($params['label'])) {
			$built['label'] = $params['label'];
		}
		if (isset($params['defaultSize'])) {
			$built['defaultSize'] = $params['defaultSize'];
		}
		if (isset($params['defaultAlign'])) {
			$built['defaultAlign'] = $params['defaultAlign'];
		}
		return $built;
	},
];
