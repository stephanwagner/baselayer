<?php

/**
 * Content margin class output for block options (mirrors content-margin-utils.js).
 */

declare(strict_types=1);

/**
 * @return array<int, string>
 */
function fs_content_margin_size_tokens(): array
{
	return ['none', 'xs', 's', 'm', 'l', 'xl'];
}

function fs_content_margin_parse_combined_class(string $class_name): string
{
	if (preg_match('/^-content-margin-(none|xs|s|m|l|xl)$/', $class_name, $matches) === 1) {
		return $matches[1];
	}

	return '';
}

/**
 * @return array{side: string, size: string}|null
 */
function fs_content_margin_parse_side_class(string $class_name): ?array
{
	if (preg_match('/^-content-margin-(top|bottom)-(none|xs|s|m|l|xl)$/', $class_name, $matches) !== 1) {
		return null;
	}

	return [
		'side' => $matches[1],
		'size' => $matches[2],
	];
}

/**
 * @param array<string, mixed> $option
 * @param array<string, mixed> $block
 * @return array<int, string>
 */
function fs_content_margin_classes_from_attributes(array $option, array $block): array
{
	$names = isset($option['attributeNames']) && is_array($option['attributeNames'])
		? $option['attributeNames']
		: [];
	$top_key = isset($names['top']) && is_string($names['top']) ? $names['top'] : 'contentMarginTop';
	$bottom_key = isset($names['bottom']) && is_string($names['bottom']) ? $names['bottom'] : 'contentMarginBottom';
	$linked_key = isset($names['linked']) && is_string($names['linked']) ? $names['linked'] : 'contentMarginLinked';

	$top_size = isset($block[$top_key]) && is_string($block[$top_key]) ? $block[$top_key] : '';
	$bottom_size = isset($block[$bottom_key]) && is_string($block[$bottom_key]) ? $block[$bottom_key] : '';
	$is_linked = !array_key_exists($linked_key, $block) || $block[$linked_key] !== false;

	// Legacy combined/adjust attributes.
	if ($top_size === '' && $bottom_size === '' && $is_linked) {
		$legacy_combined = isset($block['contentMargin']) && is_string($block['contentMargin'])
			? fs_content_margin_parse_combined_class($block['contentMargin'])
			: '';
		if ($legacy_combined !== '') {
			$top_size = $legacy_combined;
			$bottom_size = $legacy_combined;
		}
	}

	if (!$is_linked && isset($block['contentMarginAdjust']) && is_string($block['contentMarginAdjust']) && $block['contentMarginAdjust'] !== '') {
		$legacy_side = fs_content_margin_parse_side_class($block['contentMarginAdjust']);
		if ($legacy_side !== null) {
			if ($legacy_side['side'] === 'top') {
				$top_size = $legacy_side['size'];
			} else {
				$bottom_size = $legacy_side['size'];
			}
		}
	}

	if ($is_linked) {
		return $top_size !== '' ? ['-content-margin-' . $top_size] : [];
	}

	$classes = [];

	if ($top_size !== '') {
		$classes[] = '-content-margin-top-' . $top_size;
	}

	if ($bottom_size !== '') {
		$classes[] = '-content-margin-bottom-' . $bottom_size;
	}

	return $classes;
}
