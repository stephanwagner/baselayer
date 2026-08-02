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


return [
	'label' => __('Limit width', 'baselayer-blocks'),
	'params' => [
		'label' => [
			'type' => 'text',
			'label' => __('Label', 'baselayer-blocks'),
			'default' => __('Limit width', 'baselayer-blocks'),
		],
		'defaultSize' => [
			'type' => 'size',
			'label' => __('Default size', 'baselayer-blocks'),
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
			'label' => __('Default align', 'baselayer-blocks'),
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
