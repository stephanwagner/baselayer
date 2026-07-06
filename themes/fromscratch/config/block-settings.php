<?php

defined('ABSPATH') || exit;

/**
 * Block inserter settings (code-only).
 *
 * hardDisallowed — blocks that cannot be enabled via Settings → Theme → Blocks.
 *
 * default — fallback flags for blocks without a per-block entry in `blocks`.
 * blocks  — per-block defaults (used when nothing is saved in the database yet,
 *           and for newly registered blocks). Keys are block names, e.g.
 *           `core/paragraph`, `acf/slider`.
 *
 * Each block entry supports: allowed, hidden, favorite (all booleans).
 * `hidden` and `favorite` only apply when `allowed` is true.
 */
return [
	'hardDisallowed' => [
		'core/accordion',
		'core/accordion-item',
		'core/accordion-heading',
		'core/accordion-panel',
		'core/icon',
	],

	'default' => [
		'allowed'  => true,
		'hidden'   => false,
		'favorite' => false,
	],

	'blocks' => [
		// 'core/verse' => [
		// 	'allowed' => false,
		// ],
		// 'acf/slider' => [
		// 	'favorite' => true,
		// ],
	],
];
