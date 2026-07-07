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
	// Default block settings
	'default' => [
		'allowed'  => true,
		'hidden'   => false,
		'favorite' => false,
	],

	// Blocks that cannot be enabled via Settings → Theme → Blocks
	'hardDisallowed' => [
		// Prefer theme accordion over core accordion
		'core/accordion',
		'core/accordion-item',
		'core/accordion-heading',
		'core/accordion-panel',

		// Low-level / break-design-system
		'core/icon',
		'core/freeform',
		'core/missing',

		// Widget-style — not page content
		'core/archives',
		'core/calendar',
		'core/categories',
		'core/latest-posts',
		'core/latest-comments',
		'core/rss',
		'core/search',
		'core/tag-cloud',
		'core/social-links',
		'core/loginout',
		'core/page-list',

		// Template / query blocks — site structure, not page body
		'core/post-template',
		'core/query',
		'core/query-pagination',
		'core/query-pagination-next',
		'core/query-pagination-previous',
		'core/query-pagination-numbers',
		'core/query-title',
		'core/query-no-results',
		'core/read-more',
		'core/post-content',
		'core/post-title',
		'core/post-excerpt',
		'core/post-featured-image',
		'core/post-author',
		'core/post-author-biography',
		'core/post-author-name',
		'core/post-date',
		'core/post-terms',
		'core/navigation',
		'core/navigation-link',
		'core/navigation-submenu',
		'core/site-logo',
		'core/site-title',
		'core/site-tagline',
		'core/template-part',

		// Comment-specific blocks
		'core/comments',
		'core/comment-reply-link',
		'core/comment-author-name',
		'core/comment-edit-link',
		'core/comment-date',
		'core/comment-content',
		'core/comments-title',
		'core/post-comments',
		'core/post-comments-link',
		'core/post-comments-count',
		'core/post-comments-form',

		// Term
		'core/term-template',
		'core/terms-query',
		'core/term-count',
		'core/term-description',
		'core/term-name',

		// Post-specific blocks
		'core/post-navigation-link',
		'core/post-time-to-read',

		// Other
		'core/avatar', // Prefer core/image instead
		'core/query-total',
		'core/pattern',
		'core/legacy-widget',
		'core/widget-group',

	],

	'blocks' => [
		// Favorites
		'core/paragraph' => [
			'favorite' => true,
		],
		'core/heading' => [
			'favorite' => true,
		],
		'core/list' => [
			'favorite' => true,
		],
		'core/image' => [
			'favorite' => true,
		],
		'core/buttons' => [
			'favorite' => true,
		],

		// Allowed but hidden
		'core/details' => [
			'hidden'  => true,
		],
		'core/math' => [
			'hidden'  => true,
		],

		// Not allowed
		'core/preformatted' => [
			'allowed'  => false,
		],
		'core/pullquote' => [
			'allowed'  => false,
		],
		'core/verse' => [
			'allowed'  => false,
		],
		'core/breadcrumbs' => [
			'allowed'  => false,
		],

	],
];
