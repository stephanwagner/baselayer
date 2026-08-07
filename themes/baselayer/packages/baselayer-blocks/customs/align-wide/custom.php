<?php

defined('ABSPATH') || exit;

if (!function_exists('bl_block_options_control_align_wide')) {
	/**
	 * Inhaltsbreite: wide container + optional content-column align.
	 *
	 * @param string $default Container value: '' or 'container-wide'.
	 * @return array<string, mixed>
	 */
	function bl_block_options_control_align_wide(string $default = ''): array
	{
		$default = $default === 'container-wide' ? 'container-wide' : '';

		return [
			'type' => 'align-wide',
			'label' => __('Inhaltsbreite', 'baselayer-blocks'),
			'description' => __(
				'Verwendet den breiten Inhaltscontainer. Nicht zu verwechseln mit der WordPress-Ausrichtung „Erweiterte Breite“.',
				'baselayer-blocks'
			),
			'default' => $default,
			'attributeNames' => [
				'container' => 'alignWideContainer',
				'content' => 'alignWideContent',
			],
		];
	}
}

// Catalog metadata: plain msgids (translated in bl_block_options_customs_catalog after textdomain load).
if (false) {
	__('Inhaltsbreite', 'baselayer-blocks');
	__('Label', 'baselayer-blocks');
	__('Default', 'baselayer-blocks');
	__('Standard', 'baselayer-blocks');
	__('Erweitert', 'baselayer-blocks');
}

return [
	'label' => 'Inhaltsbreite',
	'params' => [
		'label' => [
			'type' => 'text',
			'label' => 'Label',
			'default' => 'Inhaltsbreite',
		],
		'default' => [
			'type' => 'size',
			'label' => 'Default',
			'default' => '',
			'choices' => [
				'' => 'Standard',
				'container-wide' => 'Erweitert',
			],
		],
	],
	'build' => static function (array $params): array {
		$built = bl_block_options_control_align_wide((string) ($params['default'] ?? ''));
		if (isset($params['label'])) {
			$built['label'] = $params['label'];
		}
		if (array_key_exists('default', $params)) {
			$built['default'] = (string) $params['default'] === 'container-wide' ? 'container-wide' : '';
		}
		return $built;
	},
];
