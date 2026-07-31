<?php

defined('ABSPATH') || exit;

/**
 * Empty definition defaults stored in the definition column.
 *
 * @return array{icon: string, category: string, fields: list<mixed>, supports: array<string, bool>, options: list<mixed>}
 */
function bl_blocks_default_definition(): array
{
	return [
		'icon' => 'block-default',
		'category' => 'baselayer',
		'fields' => [],
		'supports' => [
			'anchor' => true,
			'className' => true,
		],
		'options' => [],
	];
}

/**
 * Sanitize definition JSON for storage.
 *
 * @param mixed $raw
 * @return array{icon: string, category: string, fields: list<mixed>, supports: array<string, bool>, options: list<mixed>}
 */
function bl_blocks_sanitize_definition($raw): array
{
	$out = bl_blocks_default_definition();
	if (!is_array($raw)) {
		return $out;
	}

	if (isset($raw['icon']) && is_string($raw['icon'])) {
		$icon = sanitize_key($raw['icon']);
		if ($icon !== '') {
			$out['icon'] = $icon;
		}
	}

	if (isset($raw['category']) && is_string($raw['category'])) {
		$category = sanitize_key($raw['category']);
		if ($category !== '') {
			$out['category'] = $category;
		}
	}

	if (isset($raw['supports']) && is_array($raw['supports'])) {
		$out['supports'] = [
			'anchor' => !empty($raw['supports']['anchor']),
			'className' => !empty($raw['supports']['className']),
		];
	}

	// Fields / options stay empty this slice — accept only arrays, ignore contents.
	if (isset($raw['fields']) && is_array($raw['fields'])) {
		$out['fields'] = [];
	}
	if (isset($raw['options']) && is_array($raw['options'])) {
		$out['options'] = [];
	}

	return $out;
}
