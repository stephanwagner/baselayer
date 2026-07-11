<?php

/**
 * ACF block catalog overrides / additions.
 *
 * Parent defaults:
 *   fromscratch/acf/blocks.php
 *
 * Merged by block `name` (child wins on shared keys; list values like keywords
 * replace wholesale). New names are registered as additional blocks.
 *
 * Render markup:
 *   acf/blocks/{name}/{name}.php  — resolved via get_theme_file_path() (child first)
 * Styles / scripts:
 *   acf/blocks/_blocks.scss, blocks.js, _blocks-editor.scss (imported from src/)
 * Inserter preview:
 *   acf/blocks/{name}/preview.php or preview.jpg|png|webp
 *
 * `my-block` below is a starter example — remove or rename it for real projects.
 */

return [

	/*
	[
		'name' => 'my-block',
		'title' => 'My Block',
		'description' => 'Short help text for the block inserter.',
		'icon' => 'block-default', // dashicon slug or inline SVG markup
		'keywords' => ['Example', 'Custom'],
		// 'supports' => [
		// 	'align' => ['wide', 'full'],
		// ],
		// 'parent' => ['acf/parent-block'],
	],
	*/
];
