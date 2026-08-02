<?php

defined('ABSPATH') || exit;

/**
 * Size tokens used by spacing customs.
 *
 * @return list<string>
 */
function bl_block_options_size_tokens(): array
{
	return ['', 'none', 'xs', 's', 'm', 'l', 'xl'];
}

/**
 * Sanitize a size token.
 */
function bl_block_options_sanitize_size_token($value): string
{
	$value = is_string($value) ? $value : '';
	return in_array($value, bl_block_options_size_tokens(), true) ? $value : '';
}

/**
 * Preset list for admin pickers.
 *
 * @return list<array{slug: string, label: string, items: list<array<string, mixed>>}>
 */
function bl_block_options_presets_catalog(): array
{
	if (!function_exists('bl_block_options_get_store')) {
		return [];
	}
	$store = bl_block_options_get_store();
	$list = [];
	foreach ($store['presets'] as $slug => $preset) {
		$list[] = [
			'slug' => (string) $slug,
			'label' => (string) ($preset['label'] ?? $slug),
			'items' => isset($preset['items']) && is_array($preset['items']) ? $preset['items'] : [],
		];
	}
	usort($list, static fn(array $a, array $b): int => strcasecmp($a['label'], $b['label']));
	return $list;
}

/**
 * Text wrap button group.
 *
 * @return array<string, mixed>
 */
function bl_block_options_control_text_wrap(): array
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
 * Expand block to the wide container width.
 *
 * @return array<string, mixed>
 */
function bl_block_options_control_align_wide_container(): array
{
	return [
		'type' => 'button-group',
		'label' => 'Inhaltsbreite',
		'description' => 'Verwendet den breiten Inhaltscontainer. Nicht zu verwechseln mit der WordPress-Ausrichtung „Erweiterte Breite“.',
		'default' => '',
		'attributeName' => 'alignWideContainer',
		'options' => [
			['label' => 'Standard', 'value' => ''],
			['label' => 'Erweitert', 'value' => 'container-wide'],
		],
	];
}

/**
 * Hide block on the frontend (forced in editor JS — not listed in store).
 *
 * @return array<string, mixed>
 */
function bl_block_options_control_hide_block(): array
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
