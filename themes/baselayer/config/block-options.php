<?php

defined('ABSPATH') || exit;

/**
 * Theme seed source for block options (human-editable reference).
 *
 * Runtime truth: `bl_block_options` DB store, seeded from package
 * `seed/block-options-import.json` (or theme `config/block-options/import.json` override).
 *
 * Customs live in the baselayer-blocks package under `customs/<name>/`.
 *
 * Presets = only reusable layout packs (5).
 * Block-specific controls live under `blocks[name].controls` (inline).
 * Size variants use assignment `defaults`, not extra presets.
 * Sichtbarkeit is forced in editor JS — not listed here.
 *
 * @return array{
 *   presets: array<string, array{label?: string, controls: list<array<string, mixed>>}>,
 *   assignments?: list<array{preset: string, blocks: string|list<string>, defaults?: array<string, mixed>, target?: string}>,
 *   blocks?: array<string, array{controls?: list<array<string, mixed>>}>
 * }
 */
return [
	'presets' => [
		'abstand' => [
			'label' => 'Abstand',
			'controls' => [
				bl_block_options_control_container_margin(''),
			],
		],
		'innenabstand' => [
			'label' => 'Innenabstand',
			'controls' => [
				[
					'type' => 'button-group',
					'label' => 'Innenabstand',
					'attributeName' => 'containerPadding',
					'default' => '-container-padding-m',
					'options' => [
						['label' => '—', 'value' => ''],
						['label' => '0', 'value' => '-container-padding-none'],
						['label' => 'XS', 'value' => '-container-padding-xs'],
						['label' => 'S', 'value' => '-container-padding-s'],
						['label' => 'M', 'value' => '-container-padding-m'],
						['label' => 'L', 'value' => '-container-padding-l'],
						['label' => 'XL', 'value' => '-container-padding-xl'],
					],
				],
			],
		],
		'inhaltsbreite' => [
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
		'weite-limitieren' => [
			'label' => 'Weite limitieren',
			'controls' => [
				bl_block_options_control_limit_width(),
			],
		],
	],

	'assignments' => [
		// Columns
		[
			'preset' => 'abstand',
			'blocks' => ['core/columns'],
			'defaults' => ['defaultSize' => 'm', 'allowUnset' => false],
		],
		['preset' => 'weite-limitieren', 'blocks' => ['core/columns']],

		// Column
		['preset' => 'inhaltsbreite', 'blocks' => ['core/column']],

		// Heading
		['preset' => 'abstand', 'blocks' => ['core/heading']],
		['preset' => 'weite-limitieren', 'blocks' => ['core/heading']],
		['preset' => 'text-wrap', 'blocks' => ['core/heading']],

		// Paragraph
		['preset' => 'abstand', 'blocks' => ['core/paragraph']],
		['preset' => 'weite-limitieren', 'blocks' => ['core/paragraph']],
		['preset' => 'text-wrap', 'blocks' => ['core/paragraph']],

		// Image
		['preset' => 'inhaltsbreite', 'blocks' => ['core/image']],
		['preset' => 'abstand', 'blocks' => ['core/image']],

		// Video
		['preset' => 'abstand', 'blocks' => ['core/video']],

		// Gallery
		[
			'preset' => 'abstand',
			'blocks' => ['core/gallery'],
			'defaults' => ['defaultSize' => 'm', 'allowUnset' => false],
		],

		// Group
		['preset' => 'inhaltsbreite', 'blocks' => ['core/group']],
		[
			'preset' => 'abstand',
			'blocks' => ['core/group'],
			'defaults' => ['defaultSize' => 'm', 'allowUnset' => false],
		],
		[
			'preset' => 'innenabstand',
			'blocks' => ['core/group'],
			'defaults' => ['default' => '-container-padding-m'],
		],
		['preset' => 'weite-limitieren', 'blocks' => ['core/group']],

		// Quote
		['preset' => 'abstand', 'blocks' => ['core/quote']],

		// Pullquote
		['preset' => 'inhaltsbreite', 'blocks' => ['core/pullquote']],
		[
			'preset' => 'abstand',
			'blocks' => ['core/pullquote'],
			'defaults' => ['defaultSize' => 'm', 'allowUnset' => false],
		],
		[
			'preset' => 'innenabstand',
			'blocks' => ['core/pullquote'],
			'defaults' => ['default' => '-container-padding-l'],
		],

		// Separator
		[
			'preset' => 'abstand',
			'blocks' => ['core/separator'],
			'defaults' => ['defaultSize' => 'm', 'allowUnset' => false],
		],

		// Cover
		['preset' => 'inhaltsbreite', 'blocks' => ['core/cover']],
		[
			'preset' => 'abstand',
			'blocks' => ['core/cover'],
			'defaults' => ['defaultSize' => 'm', 'allowUnset' => false],
		],
		[
			'preset' => 'innenabstand',
			'blocks' => ['core/cover'],
			'defaults' => ['default' => '-container-padding-xl'],
		],

		// Buttons
		['preset' => 'abstand', 'blocks' => ['core/buttons']],

		// ACF
		['preset' => 'abstand', 'blocks' => ['acf/icon']],
		['preset' => 'abstand', 'blocks' => ['acf/icon-text']],
		['preset' => 'inhaltsbreite', 'blocks' => ['acf/slider', 'acf/map', 'acf/article-list', 'acf/number-ticker']],
		[
			'preset' => 'abstand',
			'blocks' => ['acf/slider', 'acf/map', 'acf/article-list', 'acf/number-ticker'],
			'defaults' => ['defaultSize' => 'm', 'allowUnset' => false],
		],
		[
			'preset' => 'innenabstand',
			'blocks' => ['acf/slider'],
			'defaults' => ['default' => '-container-padding-m'],
		],

		// BaseLayer / Forms
		[
			'preset' => 'abstand',
			'blocks' => ['baselayer/accordion'],
			'defaults' => ['defaultSize' => 'm', 'allowUnset' => false],
		],
		[
			'preset' => 'abstand',
			'blocks' => ['baselayer/form'],
			'defaults' => ['defaultSize' => 'm', 'allowUnset' => false],
		],
	],

	'blocks' => [
		'core/columns' => [
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
		'core/column' => [
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
		'core/heading' => [
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
		'core/image' => [
			'controls' => [
				[
					'type' => 'boolean',
					'toggleLabel' => 'Untertitel anzeigen',
					'default' => false,
					'attributeName' => 'showImageLabel',
					'className' => '-show-image-caption',
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
		'core/video' => [
			'controls' => [
				[
					'type' => 'boolean',
					'toggleLabel' => 'Untertitel anzeigen',
					'noSeparator' => true,
					'default' => false,
					'attributeName' => 'showImageLabel',
					'className' => '-show-image-caption',
				],
			],
		],
		'core/gallery' => [
			'controls' => [
				[
					'type' => 'boolean',
					'toggleLabel' => 'Untertitel anzeigen',
					'default' => true,
					'attributeName' => 'showImageLabels',
					'className' => '-show-image-captions',
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
		'core/spacer' => [
			'controls' => [
				[
					'type' => 'button-group',
					'label' => 'Responsive Höhe',
					'description' => 'Reduziert den Abstand auf kleineren Bildschirmen automatisch.',
					'attributeName' => 'spacerResponsiveHeight',
					'default' => '',
					'options' => [
						['label' => '—', 'value' => ''],
						['label' => 'XS', 'value' => '-spacer-height-xs'],
						['label' => 'S', 'value' => '-spacer-height-s'],
						['label' => 'M', 'value' => '-spacer-height-m'],
						['label' => 'L', 'value' => '-spacer-height-l'],
						['label' => 'XL', 'value' => '-spacer-height-xl'],
					],
				],
			],
		],
		'core/button' => [
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
		'acf/icon' => [
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
		'acf/icon-text' => [
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
];
