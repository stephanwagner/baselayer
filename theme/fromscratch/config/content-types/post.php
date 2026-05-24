<?php

return [
	'post' => [
		'taxonomies' => [
			'blog_category' => [
				'label' => 'Kategorien',
				'singular_label' => 'Kategorie',
				'url' => 'blog-category',
			],
		],
		'wp_categories' => false,

		'archive' => [
			'enabled' => true,
			'slug' => 'my-blogs',
			'design' => 'list',
			'texts' => [
				'heading' => 'Blog',
				'empty' => 'No posts found.',
			],
		],

		'admin' => [
			'page_title_toggle' => false,
		],
	],
];
