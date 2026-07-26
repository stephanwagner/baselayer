<?php

/**
 * Default Event type instance (seed for new installs / “Add event type”).
 *
 * @return array<string, mixed>
 */
return [
	'enabled' => true,
	'public' => true,
	'hierarchical' => false,
	'type' => 'event',
	'statuses' => [
		'sold_out' => [
			'label' => 'Sold Out',
			'color' => 'warning',
		],
	],
	'meta' => [
		'enabled' => true,
		'title' => 'Event metadata',
		'groups' => [
			'location' => [
				'title' => 'Location',
				'fields' => [
					'venue' => [
						'type' => 'text',
						'label' => 'Venue name',
					],
					'address' => [
						'type' => 'textarea',
						'label' => 'Address',
					],
				],
			],
			'organizer' => [
				'title' => 'Organizer',
				'fields' => [
					'name' => [
						'type' => 'text',
						'label' => 'Name',
					],
					'email' => [
						'type' => 'email',
						'label' => 'Email',
					],
					'website' => [
						'type' => 'url',
						'label' => 'Website',
					],
				],
			],
			'contact' => [
				'title' => 'Contact',
				'fields' => [
					'name' => [
						'type' => 'text',
						'label' => 'Name',
					],
					'email' => [
						'type' => 'email',
						'label' => 'Email',
					],
					'phone' => [
						'type' => 'text',
						'label' => 'Phone',
					],
				],
			],
		],
	],
	'labels' => [
		'name' => 'Events',
		'singular_name' => 'Event',
		'menu_name' => 'Events',
	],
	'supports' => [
		'title',
		'editor',
		'thumbnail',
		'excerpt',
		'revisions',
		'author',
	],
	'taxonomies' => [],
	'wp_categories' => true,
	'wp_tags' => false,
	'archive' => [
		'enabled' => true,
		'slug' => 'events',
		'design' => 'list',
		'category_filter' => true,
		'texts' => [
			'heading' => 'Events',
			'empty' => 'No events found.',
		],
	],
	'admin' => [
		'menu_icon' => 'calendar-month',
		'menu_position' => 5,
		'page_title_toggle' => false,
	],
];
