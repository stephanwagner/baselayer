<?php

return [
	'post' => [
		'labels' => [
			'name' => 'Blog',
			'singular_name' => 'Blog post',
			'menu_name' => 'Blog',
		],

		'taxonomies' => [
			'blog_category' => [
				'label' => 'Categories',
				'singular_label' => 'Category',
				'url' => 'blog-category',
			],
		],
		'wp_categories' => false,

		'archive' => [
			'enabled' => true,
			'slug' => 'my-blogs',
			'design' => 'list',
			'category_filter' => true,
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
