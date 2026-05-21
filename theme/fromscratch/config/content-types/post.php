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
		'admin' => [
			'page_title_toggle' => false,
		],
	],
];
