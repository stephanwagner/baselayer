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
				'heading' => __('Blog', 'fromscratch'),
				'empty' => __('No posts found.', 'fromscratch'),
			],
		],

		'admin' => [
			'page_title_toggle' => false,
		],
	],
];
