<?php

/**
 * Sample titles and block content for installer demo posts / CPT items (English only).
 *
 * Each item:
 * - title (required)
 * - excerpt (optional)
 * - blocks: ordered list of typed blocks rendered by bl_install_render_sample_blocks()
 *
 * Supported block types today:
 * - paragraph: { type: 'paragraph', content: string }
 *
 * Add more types here later (heading, list, quote, …) and handle them in the renderer.
 *
 * Title / excerpt lengths are intentional (short, normal, long) so archives and cards can be checked.
 *
 * @return list<array{
 *   title: string,
 *   excerpt?: string,
 *   blocks: list<array{type: string, content?: string}>
 * }>
 */
return [
	[
		'title'   => 'Design systems that scale with your product',
		'excerpt' => 'A shared language for UI keeps teams fast without freezing creativity or inventing one-off patterns.',
		'blocks'  => [
			[
				'type'    => 'paragraph',
				'content' => 'A design system is more than a component library. It is the shared grammar your product speaks – tokens, patterns, and documented decisions that keep interfaces coherent as the team grows.',
			],
			[
				'type'    => 'paragraph',
				'content' => 'Start with the boring essentials: color, type, spacing, and focus states. Once those are stable, higher-level patterns (cards, forms, empty states) almost write themselves. The goal is not to freeze creativity, but to spend it where it matters.',
			],
		],
	],
	[
		'title'   => 'Writing better CSS',
		'excerpt' => 'Keep styles simple and reusable.',
		'blocks'  => [
			[
				'type'    => 'paragraph',
				'content' => 'The CSS that ages well is usually the CSS that refuses special cases. Prefer custom properties for theme values, keep selectors shallow, and name utilities by intent rather than appearance.',
			],
			[
				'type'    => 'paragraph',
				'content' => 'When a redesign lands, you want to retune tokens – not chase down a hundred one-off overrides. Composition beats cleverness: small, predictable building blocks rearrange more easily than ornate snowflakes.',
			],
		],
	],
	[
		'title'   => 'How to move from early Figma explorations all the way into production markup',
		'excerpt' => 'Handoff works when spacing scales, type ramps, and interactive states are named the same in design and code, and when a living example page lets engineers compare a real block to the mock instead of guessing from a mood board.',
		'blocks'  => [
			[
				'type'    => 'paragraph',
				'content' => 'Handoff fails when the design file is a mood board and the codebase is a scavenger hunt. Agree early on spacing scales, type ramps, and interactive states – then mirror those names in code.',
			],
			[
				'type'    => 'paragraph',
				'content' => 'Inspect modes and redlines help, but a living example page in the theme is better. If engineers can compare a real block to the mock, fewer pixels get "approximately right."',
			],
		],
	],
	[
		'title'   => 'Readable code notes',
		'excerpt' => '',
		'blocks'  => [
			[
				'type'    => 'paragraph',
				'content' => 'Future you is a stakeholder. Prefer boring names, short functions, and comments that explain why – not what the syntax already says.',
			],
			[
				'type'    => 'paragraph',
				'content' => 'Abstractions should earn their keep. A helper used twice might be premature; a helper used across three features usually is not. Clarity compounds: every clear module makes the next change cheaper.',
			],
		],
	],
	[
		'title'   => 'Why performance budgets matter more than polish on image-heavy sites',
		'excerpt' => 'Set a simple budget and stick to it.',
		'blocks'  => [
			[
				'type'    => 'paragraph',
				'content' => 'Fancy motion will not save a three-megabyte hero image. Set a simple budget – LCP, total image weight, third-party scripts – and treat regressions like bugs.',
			],
			[
				'type'    => 'paragraph',
				'content' => 'Lazy-load below the fold, serve modern formats, and keep the critical path thin. Performance is a design constraint, not an afterthought bolted on before launch.',
			],
		],
	],
	[
		'title'   => 'Writing CSS that survives a redesign',
		'excerpt' => 'Prefer tokens and composition over one-off overrides.',
		'blocks'  => [
			[
				'type'    => 'paragraph',
				'content' => 'Tokens and shallow selectors travel further than clever one-offs. Name utilities by intent, keep theme values in custom properties, and let a redesign retune the system instead of rewriting every page.',
			],
			[
				'type'    => 'paragraph',
				'content' => 'Composition beats cleverness: small, predictable building blocks rearrange more easily than ornate snowflakes when the brand shifts again next year.',
			],
		],
	],
	[
		'title'   => 'Prototyping in the CMS beats another deck',
		'excerpt' => '',
		'blocks'  => [
			[
				'type'    => 'paragraph',
				'content' => 'Slide decks hide awkward content. Building a thin vertical slice in WordPress – real titles, real images, real templates – surfaces navigation gaps and edge cases early.',
			],
			[
				'type'    => 'paragraph',
				'content' => 'Ship a clickable prototype with production components whenever you can. Stakeholders react to something they can click; engineers debug something that already exists.',
			],
		],
	],
	[
		'title'   => 'Menus',
		'excerpt' => 'Label links for humans.',
		'blocks'  => [
			[
				'type'    => 'paragraph',
				'content' => 'Navigation labels are copy, not inventory. Prefer verbs and destinations people recognize over internal department names or CMS page titles that only make sense to editors.',
			],
			[
				'type'    => 'paragraph',
				'content' => 'Keep the primary menu short enough to scan on a phone. Secondary paths belong in footer clusters, not in a second row that fights the brand.',
			],
		],
	],
	[
		'title'   => 'Editorial workflows that keep drafts moving without endless review threads',
		'excerpt' => 'A simple status, one owner, and a checklist for image, excerpt, and SEO fields beats an endless ping-pong of comments when the publish deadline is already tomorrow morning.',
		'blocks'  => [
			[
				'type'    => 'paragraph',
				'content' => 'Most delays are process, not prose. Give each draft an owner, a due date, and a short checklist – featured image, excerpt, links – so review focuses on meaning instead of missing fields.',
			],
			[
				'type'    => 'paragraph',
				'content' => 'Batch feedback in the editor when you can. Scattered Slack notes and unmarked PDF markups are how commas get fixed twice and the hero still ships without alt text.',
			],
		],
	],
	[
		'title'   => 'Accessibility is a baseline, not a phase',
		'excerpt' => 'Keyboard paths, contrast, and labels belong in the first pass – not in a ticket filed the week after launch.',
		'blocks'  => [
			[
				'type'    => 'paragraph',
				'content' => 'If a control cannot be reached from the keyboard, it is unfinished. Treat focus order, visible focus, and descriptive labels as part of the design – the same way you treat type and color.',
			],
			[
				'type'    => 'paragraph',
				'content' => 'Automated checks catch some gaps; a short pass with a screen reader and a keyboard catches more. Fixing accessibility late is more expensive than designing for it early.',
			],
		],
	],
];
