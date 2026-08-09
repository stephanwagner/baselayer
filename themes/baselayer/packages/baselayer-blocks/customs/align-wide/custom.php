<?php

defined('ABSPATH') || exit;

if (!function_exists('bl_block_options_control_align_wide')) {
	/**
	 * Inhaltsbreite: wide container + optional content-column align.
	 *
	 * @param string $default Container value: '' or 'container-wide'.
	 * @param bool   $show_content_align Whether to show the content-column align toggle.
	 * @return array<string, mixed>
	 */
	function bl_block_options_control_align_wide(string $default = '', bool $show_content_align = false): array
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
			'showContentAlign' => $show_content_align,
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
	__('Show content align', 'baselayer-blocks');
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
		'showContentAlign' => [
			'type' => 'boolean',
			'label' => 'Show content align',
			'default' => false,
		],
	],
	'build' => static function (array $params): array {
		$show_content_align = array_key_exists('showContentAlign', $params)
			? (bool) $params['showContentAlign']
			: false;
		$built = bl_block_options_control_align_wide(
			(string) ($params['default'] ?? ''),
			$show_content_align
		);
		if (isset($params['label'])) {
			$built['label'] = $params['label'];
		}
		if (array_key_exists('default', $params)) {
			$built['default'] = (string) $params['default'] === 'container-wide' ? 'container-wide' : '';
		}
		$built['showContentAlign'] = $show_content_align;
		return $built;
	},
];
