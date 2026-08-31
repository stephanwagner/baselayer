<?php

defined('ABSPATH') || exit;

if (!function_exists('bl_block_options_normalize_inner_padding_token')) {
	/**
	 * Map a stored default (token or legacy class) to a short size token.
	 */
	function bl_block_options_normalize_inner_padding_token(string $value): string
	{
		$map = [
			'' => '',
			'unset' => '',
			'-container-padding-unset' => '',
			'auto' => 'auto',
			'-container-padding-auto' => 'auto',
			'none' => 'none',
			'-container-padding-none' => 'none',
			'xs' => 'xs',
			'-container-padding-xs' => 'xs',
			's' => 's',
			'-container-padding-s' => 's',
			'm' => 'm',
			'-container-padding-m' => 'm',
			'l' => 'l',
			'-container-padding-l' => 'l',
			'xl' => 'xl',
			'-container-padding-xl' => 'xl',
		];

		return $map[$value] ?? '';
	}
}

if (!function_exists('bl_block_options_control_inner_padding')) {
	/**
	 * Innenabstand: size tokens + optional content-column align.
	 *
	 * @param string $default Padding token (`auto`, `m`, …) or legacy class, or '' for unset.
	 * @param bool   $show_content_align Whether to show the content-column align toggle.
	 * @return array<string, mixed>
	 */
	function bl_block_options_control_inner_padding(string $default = '', bool $show_content_align = false): array
	{
		$default = bl_block_options_normalize_inner_padding_token($default);

		return [
			'type' => 'inner-padding',
			'label' => __('Inner padding', 'baselayer-blocks'),
			'default' => $default,
			'showContentAlign' => $show_content_align,
			'attributeNames' => [
				'padding' => 'containerPadding',
				'contentAlign' => 'alignContentToContainer',
			],
		];
	}
}

// Catalog metadata: plain msgids (translated in bl_block_options_customs_catalog after textdomain load).
if (false) {
	__('Inner padding', 'baselayer-blocks');
	__('Innenabstand', 'baselayer-blocks');
	__('Label', 'baselayer-blocks');
	__('Default', 'baselayer-blocks');
	__('Not set', 'baselayer-blocks');
	__('Auto', 'baselayer-blocks');
	__('No padding', 'baselayer-blocks');
	__('Show content align', 'baselayer-blocks');
}

return [
	'label' => 'Inner padding',
	'params' => [
		'label' => [
			'type' => 'text',
			'label' => 'Label',
			'default' => 'Inner padding',
		],
		'default' => [
			'type' => 'size',
			'label' => 'Default',
			'default' => 'auto',
			'choices' => [
				'' => '—',
				'auto' => 'A',
				'none' => '0',
				'xs' => 'XS',
				's' => 'S',
				'm' => 'M',
				'l' => 'L',
				'xl' => 'XL',
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
		$built = bl_block_options_control_inner_padding(
			(string) ($params['default'] ?? ''),
			$show_content_align
		);
		if (isset($params['label'])) {
			$built['label'] = $params['label'];
		}
		if (array_key_exists('default', $params)) {
			$built['default'] = (string) ($built['default'] ?? '');
		}
		$built['showContentAlign'] = $show_content_align;
		return $built;
	},
];
