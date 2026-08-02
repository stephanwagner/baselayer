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
			'label' => 'Abstände',
			'defaultSize' => $default_size,
			'allowUnset' => $default_size === '',
			'attributeNames' => [
				'top' => 'containerMarginTop',
				'bottom' => 'containerMarginBottom',
				'linked' => 'containerMarginLinked',
			],
		];
	}
}


return [
	'label' => 'Container margin',
	'params' => [
		'label' => [
			'type' => 'text',
			'label' => 'Label',
			'default' => 'Abstände',
		],
		'defaultSize' => [
			'type' => 'size',
			'label' => 'Default size',
			'default' => '',
		],
		'allowUnset' => [
			'type' => 'boolean',
			'label' => 'Allow unset',
			'default' => true,
		],
	],
	'build' => static function (array $params): array {
		$built = bl_block_options_control_container_margin((string) ($params['defaultSize'] ?? ''));
		if (isset($params['label'])) {
			$built['label'] = $params['label'];
		}
		if (array_key_exists('allowUnset', $params)) {
			$built['allowUnset'] = (bool) $params['allowUnset'];
		}
		if (isset($params['defaultSize'])) {
			$built['defaultSize'] = $params['defaultSize'];
		}
		return $built;
	},
];
