<?php

defined('ABSPATH') || exit;

/**
 * Block inserter settings (code-only).
 *
 * hardDisallowed — blocks that cannot be enabled via Theme settings → Blocks.
 */
return [
	'hardDisallowed' => [
		'core/accordion',
		'core/accordion-item',
		'core/accordion-heading',
		'core/accordion-panel',
		'core/icon',
	],
];
