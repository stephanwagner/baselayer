<?php

defined('ABSPATH') || exit;

if (!function_exists('bl_block_options_control_container_margin')) {
	/**
	 * Linked top/bottom container margin control.
	 *
	 * @param string $default Combined default size token, e.g. `m` or ''.
	 * @return array<string, mixed>
	 */
	function bl_block_options_control_container_margin(string $default = ''): array
	{
		$default_size = preg_match('/^(none|xs|s|m|l|xl)$/', $default) ? $default : '';

		return [
			'type' => 'container-margin',
			'label' => __('Spacing', 'baselayer-blocks'),
			'defaultSize' => $default_size,
			'attributeNames' => [
				'top' => 'containerMarginTop',
				'bottom' => 'containerMarginBottom',
				'linked' => 'containerMarginLinked',
			],
		];
	}
}


return [
	'label' => __('Container margin', 'baselayer-blocks'),
	'params' => [
		'label' => [
			'type' => 'text',
			'label' => __('Label', 'baselayer-blocks'),
			'default' => __('Spacing', 'baselayer-blocks'),
		],
		'defaultSize' => [
			'type' => 'size',
			'label' => __('Default size', 'baselayer-blocks'),
			'default' => '',
		],
	],
	'build' => static function (array $params): array {
		$built = bl_block_options_control_container_margin((string) ($params['defaultSize'] ?? ''));
		if (isset($params['label'])) {
			$built['label'] = $params['label'];
		}
		if (isset($params['defaultSize'])) {
			$built['defaultSize'] = $params['defaultSize'];
		}
		return $built;
	},
];
