<?php

/**
 * Blog posts
 * 
 * Built-in WordPress posts (`post`) — not a custom CPT.
 * This file customizes labels, archive, and taxonomies for the default blog post type.
 */

return [
	'post' => [
		'enabled' => true,

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
			// Add more taxonomies here
			// The first one will be used as the default filter
		],
		'wp_categories' => false,
		'wp_tags' => false,

		'archive' => [
			'enabled' => true,
			'slug' => 'blog',
			'design' => 'list', // list | grid
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
