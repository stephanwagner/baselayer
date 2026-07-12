<?php

/**
 * Sample titles and body copy for installer demo posts / CPT items (English only).
 *
 * @return list<array{title: string, content: string, excerpt?: string}>
 */
return [
	[
		'title'   => 'Design systems that scale with your product',
		'excerpt' => 'A shared language for UI keeps teams fast without freezing creativity.',
		'content' => 'A design system is more than a component library. It is the shared grammar your product speaks—tokens, patterns, and documented decisions that keep interfaces coherent as the team grows.

Start with the boring essentials: color, type, spacing, and focus states. Once those are stable, higher-level patterns (cards, forms, empty states) almost write themselves. The goal is not to freeze creativity, but to spend it where it matters.',
	],
	[
		'title'   => 'Writing CSS that survives a redesign',
		'excerpt' => 'Prefer tokens and composition over one-off overrides.',
		'content' => 'The CSS that ages well is usually the CSS that refuses special cases. Prefer custom properties for theme values, keep selectors shallow, and name utilities by intent rather than appearance.

When a redesign lands, you want to retune tokens—not chase down a hundred one-off overrides. Composition beats cleverness: small, predictable building blocks rearrange more easily than ornate snowflakes.',
	],
	[
		'title'   => 'From Figma to production without the guesswork',
		'excerpt' => 'Handoff works when spacing, type, and states are explicit.',
		'content' => 'Handoff fails when the design file is a mood board and the codebase is a scavenger hunt. Agree early on spacing scales, type ramps, and interactive states—then mirror those names in code.

Inspect modes and redlines help, but a living example page in the theme is better. If engineers can compare a real block to the mock, fewer pixels get "approximately right."',
	],
	[
		'title'   => 'Readable code is a product feature',
		'content' => 'Future you is a stakeholder. Prefer boring names, short functions, and comments that explain why—not what the syntax already says.

Abstractions should earn their keep. A helper used twice might be premature; a helper used across three features usually is not. Clarity compounds: every clear module makes the next change cheaper.',
	],
	[
		'title'   => 'Performance budgets for content-heavy sites',
		'content' => 'Fancy motion will not save a three-megabyte hero image. Set a simple budget—LCP, total image weight, third-party scripts—and treat regressions like bugs.

Lazy-load below the fold, serve modern formats, and keep the critical path thin. Performance is a design constraint, not an afterthought bolted on before launch.',
	],
	[
		'title'   => 'Prototyping in the CMS beats another deck',
		'content' => 'Slide decks hide awkward content. Building a thin vertical slice in WordPress—real titles, real images, real templates—surfaces navigation gaps and edge cases early.

Ship a clickable prototype with production components whenever you can. Stakeholders react to something they can click; engineers debug something that already exists.',
	],
];
