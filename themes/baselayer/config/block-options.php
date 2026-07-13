<?php

defined('ABSPATH') || exit;

/**
 * Block options: presets + assignments (+ optional per-block extras).
 *
 * Hand-editable source of truth. The Block Creator UI can overlay the same shape
 * when Developer → Features → Block Creator is enabled.
 *
 * @return array{
 *   presets?: array<string, array{label?: string, controls: list<array<string, mixed>>}>,
 *   assignments?: list<array{preset: string, blocks: string|list<string>, exclude?: list<string>, target?: string}>,
 *   blocks?: array<string, array{controls?: list<array<string, mixed>>}>
 * }
 */
return [
	'presets' => [
		'content-margin' => [
			'label' => 'Abstand',
			'controls' => [
				bl_block_options_control_content_margin(''),
			],
		],
		'content-margin-m' => [
			'label' => 'Abstand (M)',
			'controls' => [
				bl_block_options_control_content_margin('m'),
			],
		],
		'content-padding-m' => [
			'label' => 'Innenabstand (M)',
			'controls' => [
				bl_block_options_control_content_padding('m'),
			],
		],
		'content-padding-l' => [
			'label' => 'Innenabstand (L)',
			'controls' => [
				bl_block_options_control_content_padding('l'),
			],
		],
		'content-padding-xl' => [
			'label' => 'Innenabstand (XL)',
			'controls' => [
				bl_block_options_control_content_padding('xl'),
			],
		],
		'limit-width' => [
			'label' => 'Weite limitieren',
			'controls' => [
				bl_block_options_control_limit_width(),
			],
		],
		'align-wide-container' => [
			'label' => 'Inhaltsbreite',
			'controls' => [
				bl_block_options_control_align_wide_container(),
			],
		],
		'text-wrap' => [
			'label' => 'Text Wrap',
			'controls' => [
				bl_block_options_control_text_wrap(),
			],
		],
		'spacer-responsive-height' => [
			'label' => 'Responsive Höhe',
			'controls' => [
				bl_block_options_control_spacer_responsive_height(),
			],
		],
		'columns-layout' => [
			'label' => 'Spalten-Layout',
			'controls' => [
				[
					'type' => 'button-group',
					'label' => 'Spaltenabstand',
					'default' => '-column-gap-m',
					'attributeName' => 'columnGap',
					'options' => [
						['label' => '0', 'value' => '-column-gap-none'],
						['label' => 'XS', 'value' => '-column-gap-xs'],
						['label' => 'S', 'value' => '-column-gap-s'],
						['label' => 'M', 'value' => '-column-gap-m'],
						['label' => 'L', 'value' => '-column-gap-l'],
						['label' => 'XL', 'value' => '-column-gap-xl'],
					],
				],
				[
					'type' => 'button-group',
					'label' => 'Umbruch',
					'description' => 'Legt fest, ab welcher Bildschirmbreite die Spalten gestapelt werden.',
					'default' => '',
					'attributeName' => 'columnsStackBreakpoint',
					'options' => [
						['label' => '—', 'value' => ''],
						['label' => 'Nie', 'value' => '-columns-stack-never'],
						['label' => 'Früh', 'value' => '-columns-stack-early'],
						['label' => 'Mittel', 'value' => '-columns-stack-medium'],
						['label' => 'Spät', 'value' => '-columns-stack-late'],
					],
				],
				[
					'type' => 'boolean',
					'label' => 'Media-Text Layout',
					'toggleLabel' => 'Text harmonisch ausrichten',
					'description' => 'Richtet die Textspalte mittig zum Bild oder Video aus.',
					'default' => false,
					'attributeName' => 'harmonizeImageText',
					'className' => '-media-text-layout',
				],
				[
					'type' => 'boolean',
					'label' => 'Mobile anordnung',
					'toggleLabel' => 'Spalten wenn gestapelt umkehren',
					'default' => false,
					'attributeName' => 'columnReverseOrderOnMobile',
					'className' => '-reverse-order-on-mobile',
				],
			],
		],
		'column-center' => [
			'label' => 'Spalte zentrieren',
			'controls' => [
				[
					'type' => 'boolean',
					'toggleLabel' => 'Inhalt vertikal zentrieren',
					'default' => false,
					'attributeName' => 'columnCenterContent',
					'className' => '-center-content',
				],
			],
		],
		'heading-show-as' => [
			'label' => 'Überschrift anzeigen als',
			'controls' => [
				[
					'type' => 'button-group',
					'label' => 'Anzeigen als',
					'default' => '',
					'attributeName' => 'headingShowAs',
					'options' => [
						['label' => '—', 'value' => ''],
						['label' => 'H1', 'value' => 'h1'],
						['label' => 'H2', 'value' => 'h2'],
						['label' => 'H3', 'value' => 'h3'],
						['label' => 'H4', 'value' => 'h4'],
						['label' => 'H5', 'value' => 'h5'],
						['label' => 'H6', 'value' => 'h6'],
					],
				],
			],
		],
		'image-extras' => [
			'label' => 'Bild-Optionen',
			'controls' => [
				[
					'type' => 'button-group',
					'label' => 'Bildausschnitt',
					'description' => 'Legt fest, welcher Teil des Bildes sichtbar bleibt, wenn es nicht vollständig angezeigt werden kann.',
					'default' => '',
					'attributeName' => 'imageObjectPosition',
					'options' => [
						['icon' => 'select-all', 'label' => 'Mitte', 'value' => ''],
						['icon' => 'move-selection-left', 'label' => 'Links', 'value' => '-object-position-left'],
						['icon' => 'move-selection-right', 'label' => 'Rechts', 'value' => '-object-position-right'],
						['icon' => 'move-selection-up', 'label' => 'Oben', 'value' => '-object-position-top'],
						['icon' => 'move-selection-down', 'label' => 'Unten', 'value' => '-object-position-bottom'],
					],
				],
				[
					'type' => 'boolean',
					'toggleLabel' => 'Ohne Untertitel',
					'default' => false,
					'attributeName' => 'noImageLabel',
					'className' => '-no-image-caption',
				],
				[
					'type' => 'boolean',
					'toggleLabel' => 'Bild bei Klick vergrößern',
					'noSeparator' => true,
					'default' => false,
					'attributeName' => 'hasLightbox',
					'className' => '-has-lightbox',
				],
			],
		],
		'video-caption' => [
			'label' => 'Video-Untertitel',
			'controls' => [
				[
					'type' => 'boolean',
					'toggleLabel' => 'Ohne Untertitel',
					'noSeparator' => true,
					'default' => false,
					'attributeName' => 'noImageLabel',
					'className' => '-no-image-caption',
				],
			],
		],
		'gallery-extras' => [
			'label' => 'Galerie-Optionen',
			'controls' => [
				[
					'type' => 'boolean',
					'toggleLabel' => 'Ohne Untertitel',
					'default' => false,
					'attributeName' => 'noImageLabels',
					'className' => '-no-image-captions',
				],
				[
					'type' => 'boolean',
					'toggleLabel' => 'Bilder bei Klick vergrößern',
					'noSeparator' => true,
					'default' => true,
					'attributeName' => 'hasLightbox',
					'className' => '-has-lightbox',
				],
			],
		],
		'button-extras' => [
			'label' => 'Button-Optionen',
			'controls' => [
				[
					'type' => 'boolean',
					'label' => 'Darstellung',
					'toggleLabel' => 'Als Link anzeigen',
					'description' => '',
					'default' => false,
					'attributeName' => 'buttonIsLink',
					'className' => '-is-link',
				],
				[
					'type' => 'button-group',
					'label' => 'Variante',
					'description' => '',
					'default' => '',
					'attributeName' => 'buttonVariant',
					'options' => [
						['label' => 'Primär', 'value' => ''],
						['label' => 'Sekundär', 'value' => '-secondary'],
						['label' => 'Weiss', 'value' => '-white'],
					],
				],
				[
					'type' => 'button-group',
					'label' => 'Größe',
					'default' => '',
					'attributeName' => 'buttonSize',
					'options' => [
						['label' => 'S', 'value' => '-small'],
						['label' => 'M', 'value' => ''],
						['label' => 'L', 'value' => '-large'],
						['label' => 'XL', 'value' => '-extra-large'],
					],
				],
				[
					'type' => 'icon',
					'label' => 'Icon',
					'default' => '',
					'attributeName' => 'buttonIcon',
				],
				[
					'type' => 'button-group',
					'label' => 'Icon Position',
					'noSeparator' => true,
					'default' => '',
					'attributeName' => 'buttonIconPosition',
					'iconLabel' => true,
					'options' => [
						['icon' => 'horizontal-align-left', 'label' => 'Links', 'value' => ''],
						[
							'icon' => 'horizontal-align-right',
							'label' => 'Rechts',
							'value' => '-icon-right',
							'iconPosition' => 'after',
						],
					],
				],
			],
		],
		'icon-align' => [
			'label' => 'Icon-Ausrichtung',
			'controls' => [
				[
					'type' => 'button-group',
					'label' => 'Ausrichtung',
					'default' => '',
					'attributeName' => 'iconAlign',
					'options' => [
						['icon' => 'image-left', 'label' => 'Links', 'value' => '-icon-align-left'],
						['icon' => 'image-center', 'label' => 'Zentriert', 'value' => ''],
						['icon' => 'image-right', 'label' => 'Rechts', 'value' => '-icon-align-right'],
					],
				],
			],
		],
		'icon-text-position' => [
			'label' => 'Icon mit Text – Position',
			'controls' => [
				[
					'type' => 'button-group',
					'label' => 'Position',
					'default' => '',
					'attributeName' => 'iconTextPosition',
					'options' => [
						['icon' => 'image-left-text', 'label' => 'Links neben Text', 'value' => ''],
						['icon' => 'image-right-text', 'label' => 'Rechts neben Text', 'value' => '-icon-text-align-right'],
						['icon' => 'image-left', 'label' => 'Links', 'value' => '-icon-align-left'],
						['icon' => 'image-center', 'label' => 'Zentriert', 'value' => '-icon-align-center'],
						['icon' => 'image-right', 'label' => 'Rechts', 'value' => '-icon-align-right'],
					],
				],
			],
		],
	],

	'assignments' => [
		// Columns
		['preset' => 'content-margin-m', 'blocks' => ['core/columns'], 'target' => 'block_option'],
		['preset' => 'limit-width', 'blocks' => ['core/columns'], 'target' => 'block_option'],
		['preset' => 'columns-layout', 'blocks' => ['core/columns'], 'target' => 'block_option'],

		// Column
		['preset' => 'align-wide-container', 'blocks' => ['core/column'], 'target' => 'block_option'],
		['preset' => 'column-center', 'blocks' => ['core/column'], 'target' => 'block_option'],

		// Heading
		['preset' => 'heading-show-as', 'blocks' => ['core/heading'], 'target' => 'block_option'],
		['preset' => 'content-margin', 'blocks' => ['core/heading'], 'target' => 'block_option'],
		['preset' => 'limit-width', 'blocks' => ['core/heading'], 'target' => 'block_option'],
		['preset' => 'text-wrap', 'blocks' => ['core/heading'], 'target' => 'block_option'],

		// Paragraph
		['preset' => 'content-margin', 'blocks' => ['core/paragraph'], 'target' => 'block_option'],
		['preset' => 'limit-width', 'blocks' => ['core/paragraph'], 'target' => 'block_option'],
		['preset' => 'text-wrap', 'blocks' => ['core/paragraph'], 'target' => 'block_option'],

		// Image
		['preset' => 'align-wide-container', 'blocks' => ['core/image'], 'target' => 'block_option'],
		['preset' => 'content-margin', 'blocks' => ['core/image'], 'target' => 'block_option'],
		['preset' => 'image-extras', 'blocks' => ['core/image'], 'target' => 'block_option'],

		// Video
		['preset' => 'content-margin', 'blocks' => ['core/video'], 'target' => 'block_option'],
		['preset' => 'video-caption', 'blocks' => ['core/video'], 'target' => 'block_option'],

		// Gallery
		['preset' => 'content-margin-m', 'blocks' => ['core/gallery'], 'target' => 'block_option'],
		['preset' => 'gallery-extras', 'blocks' => ['core/gallery'], 'target' => 'block_option'],

		// Group
		['preset' => 'align-wide-container', 'blocks' => ['core/group'], 'target' => 'block_option'],
		['preset' => 'content-margin-m', 'blocks' => ['core/group'], 'target' => 'block_option'],
		['preset' => 'content-padding-m', 'blocks' => ['core/group'], 'target' => 'block_option'],
		['preset' => 'limit-width', 'blocks' => ['core/group'], 'target' => 'block_option'],

		// Quote
		['preset' => 'content-margin', 'blocks' => ['core/quote'], 'target' => 'block_option'],

		// Pullquote
		['preset' => 'align-wide-container', 'blocks' => ['core/pullquote'], 'target' => 'block_option'],
		['preset' => 'content-margin-m', 'blocks' => ['core/pullquote'], 'target' => 'block_option'],
		['preset' => 'content-padding-l', 'blocks' => ['core/pullquote'], 'target' => 'block_option'],

		// Separator
		['preset' => 'content-margin-m', 'blocks' => ['core/separator'], 'target' => 'block_option'],

		// Spacer
		['preset' => 'spacer-responsive-height', 'blocks' => ['core/spacer'], 'target' => 'block_option'],

		// Cover
		['preset' => 'align-wide-container', 'blocks' => ['core/cover'], 'target' => 'block_option'],
		['preset' => 'content-margin-m', 'blocks' => ['core/cover'], 'target' => 'block_option'],
		['preset' => 'content-padding-xl', 'blocks' => ['core/cover'], 'target' => 'block_option'],

		// Buttons / Button
		['preset' => 'content-margin', 'blocks' => ['core/buttons'], 'target' => 'block_option'],
		['preset' => 'button-extras', 'blocks' => ['core/button'], 'target' => 'block_option'],

		// ACF
		['preset' => 'icon-align', 'blocks' => ['acf/icon'], 'target' => 'block_option'],
		['preset' => 'content-margin', 'blocks' => ['acf/icon'], 'target' => 'block_option'],
		['preset' => 'icon-text-position', 'blocks' => ['acf/icon-text'], 'target' => 'block_option'],
		['preset' => 'content-margin', 'blocks' => ['acf/icon-text'], 'target' => 'block_option'],
		['preset' => 'align-wide-container', 'blocks' => ['acf/slider', 'acf/map', 'acf/article-list', 'acf/number-ticker'], 'target' => 'block_option'],
		['preset' => 'content-margin-m', 'blocks' => ['acf/slider', 'acf/map', 'acf/article-list', 'acf/number-ticker'], 'target' => 'block_option'],
	],
];
