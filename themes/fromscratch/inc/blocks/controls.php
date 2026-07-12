<?php

defined('ABSPATH') || exit;

/**
 * Linked top/bottom content margin control.
 *
 * @param string $default Combined default size token, e.g. `m` or ''.
 * @return array<string, mixed>
 */
function fs_block_options_control_content_margin(string $default = ''): array
{
	$default_size = preg_match('/^(none|xs|s|m|l|xl)$/', $default) ? $default : '';

	return [
		'type' => 'content-margin',
		'label' => 'Abstände',
		'defaultSize' => $default_size,
		'allowUnset' => $default_size === '',
		'attributeNames' => [
			'top' => 'contentMarginTop',
			'bottom' => 'contentMarginBottom',
			'linked' => 'contentMarginLinked',
		],
	];
}

/**
 * Uniform content padding control.
 *
 * @return array<string, mixed>
 */
function fs_block_options_control_content_padding(string $default = 'm'): array
{
	return [
		'type' => 'content-padding',
		'label' => 'Innenabstand',
		'defaultSize' => $default,
		'allowUnset' => false,
		'attributeName' => 'contentPadding',
	];
}

/**
 * Text wrap button group.
 *
 * @return array<string, mixed>
 */
function fs_block_options_control_text_wrap(): array
{
	return [
		'type' => 'button-group',
		'label' => 'Text Wrap',
		'default' => '',
		'attributeName' => 'textWrap',
		'options' => [
			['label' => 'Standard', 'value' => ''],
			['label' => 'Balanced', 'value' => 'text-wrap-balance'],
			['label' => 'Pretty', 'value' => 'text-wrap-pretty'],
		],
	];
}

/**
 * Responsive spacer height control.
 *
 * @return array<string, mixed>
 */
function fs_block_options_control_spacer_responsive_height(): array
{
	return [
		'type' => 'spacer-responsive-height',
		'label' => 'Responsive Höhe',
		'description' => 'Reduziert den Abstand auf kleineren Bildschirmen automatisch.',
		'default' => '',
		'attributeName' => 'spacerResponsiveHeight',
	];
}

/**
 * Linked width size + alignment control.
 *
 * @return array<string, mixed>
 */
function fs_block_options_control_limit_width(): array
{
	return [
		'type' => 'limit-width',
		'label' => 'Weite limitieren',
		'defaultSize' => '',
		'defaultAlign' => 'center',
		'attributeNames' => [
			'size' => 'limitWidthSize',
			'align' => 'limitWidthAlign',
		],
	];
}

/**
 * Expand block to the wide container width.
 *
 * @return array<string, mixed>
 */
function fs_block_options_control_align_wide_container(): array
{
	return [
		'type' => 'button-group',
		'label' => 'Inhaltsbreite',
		'default' => '',
		'attributeName' => 'alignWideContainer',
		'options' => [
			['label' => 'Standard', 'value' => ''],
			['label' => 'Erweitert', 'value' => 'container-wide'],
		],
	];
}

/**
 * Hide block on the frontend (injected globally in the editor; not used in config).
 *
 * @return array<string, mixed>
 */
function fs_block_options_control_hide_block(): array
{
	return [
		'type' => 'boolean',
		'label' => 'Sichtbarkeit',
		'toggleLabel' => 'Ausblenden',
		'default' => false,
		'attributeName' => 'hideBlock',
		'className' => '-block-is-hidden',
	];
}
