/**
 * Linked top/bottom content margin control.
 *
 * @param {string} defaultClass Combined default class, e.g. `m` or ''.
 */
function getContentMarginControl(defaultClass = '') {
  const match = (defaultClass || '').match(/^(none|xs|s|m|l|xl)$/);
  const defaultSize = match ? match[1] : '';

  return {
    type: 'content-margin',
    label: 'Abstände',
    defaultSize,
    allowUnset: defaultSize === '',
    attributeNames: {
      top: 'contentMarginTop',
      bottom: 'contentMarginBottom',
      linked: 'contentMarginLinked',
    },
  };
}

/**
 * Text wrap button group.
 */
function getTextWrapOptions() {
  return {
    type: 'button-group',
    label: 'Text Wrap',
    default: '',
    attributeName: 'textWrap',
    options: [
      { label: 'Standard', value: '' },
      { label: 'Balanced', value: 'text-wrap-balance' },
      { label: 'Pretty', value: 'text-wrap-pretty' },
    ],
  };
}

/**
 * Responsive spacer height (scales down on smaller breakpoints).
 */
function getSpacerResponsiveHeightControl() {
  return {
    type: 'spacer-responsive-height',
    label: 'Responsive Höhe',
    description: 'Reduziert den Abstand auf kleineren Bildschirmen automatisch.',
    default: '',
    attributeName: 'spacerResponsiveHeight',
  };
}

/**
 * Linked width size + alignment control for limited content width.
 */
function getLimitWidthControl() {
  return {
    type: 'limit-width',
    label: 'Weite limitieren',
    defaultSize: '',
    defaultAlign: 'center',
    attributeNames: {
      size: 'limitWidthSize',
      align: 'limitWidthAlign',
    },
  };
}

/**
 * Apply block options.
 *
 * Boolean: `label` = optional row label; `toggleLabel` = text on the switch.
 * All types: optional `description` = help text below the control.
 * All types: optional `noSeparator` = skip border-top when this option follows another block option.
 */
export const blockOptions = [
  // Columns
  {
    name: 'core/columns',
    options: [
      getContentMarginControl('m'),
      getLimitWidthControl(),
      {
        type: 'button-group',
        label: 'Spaltenabstand',
        default: '-column-gap-m',
        attributeName: 'columnGap',
        options: [
          { label: '0', value: '-column-gap-none' },
          { label: 'XS', value: '-column-gap-xs' },
          { label: 'S', value: '-column-gap-s' },
          { label: 'M', value: '-column-gap-m' },
          { label: 'L', value: '-column-gap-l' },
          { label: 'XL', value: '-column-gap-xl' },
        ],
      },
      {
        type: 'boolean',
        label: 'Bild-Text-Layout',
        toggleLabel: 'Text harmonisch ausrichten',
        description: 'Richtet die Textspalte bei kurzen Inhalten mittig zum Bild aus.',
        default: false,
        attributeName: 'harmonizeImageText',
        className: '-image-text-layout',
      },
      {
        type: 'boolean',
        label: 'Mobile anordnung',
        toggleLabel: 'Spalten wenn gestapelt umkehren',
        default: false,
        attributeName: 'columnReverseOrderOnMobile',
        className: '-reverse-order-on-mobile',
      },
    ],
  },

  // Column
  {
    name: 'core/column',
    options: [
      {
        type: 'boolean',
        toggleLabel: 'Inhalt vertikal zentrieren',
        default: false,
        attributeName: 'columnCenterContent',
        className: '-center-content',
      },
    ],
  },

  // Heading
  {
    name: 'core/heading',
    options: [
      {
        type: 'button-group',
        label: 'Anzeigen als',
        default: '',
        attributeName: 'headingShowAs',
        options: [
          { icon: 'block', label: 'Standard', value: '' },
          { label: 'H1', value: 'h1' },
          { label: 'H2', value: 'h2' },
          { label: 'H3', value: 'h3' },
          { label: 'H4', value: 'h4' },
          { label: 'H5', value: 'h5' },
          { label: 'H6', value: 'h6' },
        ],
      },
      getContentMarginControl(),
      getLimitWidthControl(),
      getTextWrapOptions(),
    ],
  },

  // Paragraph
  {
    name: 'core/paragraph',
    options: [getContentMarginControl(), getLimitWidthControl(), getTextWrapOptions()],
  },

  // Image
  {
    name: 'core/image',
    options: [
      getContentMarginControl(),
      {
        type: 'boolean',
        toggleLabel: 'Ohne Bildtext',
        default: false,
        attributeName: 'noImageLabel',
        className: '-no-image-caption',
      },
      {
        type: 'boolean',
        toggleLabel: 'Bild bei Klick vergrößern',
        noSeparator: true,
        default: false,
        attributeName: 'hasLightbox',
        className: '-has-lightbox',
      },
    ],
  },

  // Gallery
  {
    name: 'core/gallery',
    options: [
      getContentMarginControl(),
      {
        type: 'boolean',
        toggleLabel: 'Ohne Bildtexte',
        default: false,
        attributeName: 'noImageLabels',
        className: '-no-image-captions',
      },
      {
        type: 'boolean',
        toggleLabel: 'Bilder bei Klick vergrößern',
        noSeparator: true,
        default: true,
        attributeName: 'hasLightbox',
        className: '-has-lightbox',
      },
    ],
  },

  // Group
  {
    name: 'core/group',
    options: [getContentMarginControl('m'), getLimitWidthControl()],
  },

  // Separator
  {
    name: 'core/separator',
    options: [getContentMarginControl('m')],
  },

  // Spacer
  {
    name: 'core/spacer',
    options: [getSpacerResponsiveHeightControl()],
  },

  // Cover
  {
    name: 'core/cover',
    options: [getContentMarginControl('m')],
  },

  // Buttons
  {
    name: 'core/buttons',
    options: [getContentMarginControl()],
  },

  // Button
  {
    name: 'core/button',
    options: [
      {
        type: 'button-group',
        label: 'Größe',
        default: '',
        attributeName: 'buttonSize',
        options: [
          { label: 'S', value: '-small' },
          { label: 'M', value: '' },
          { label: 'L', value: '-large' },
          { label: 'XL', value: '-extra-large' },
        ],
      },
      {
        type: 'icon',
        label: 'Icon',
        default: '',
        attributeName: 'buttonIcon',
      },
      {
        type: 'button-group',
        label: 'Icon Position',
        noSeparator: true,
        default: '',
        attributeName: 'buttonIconPosition',
        iconLabel: true,
        options: [
          { icon: 'horizontal-align-left', label: 'Links', value: '' },
          { icon: 'horizontal-align-right', label: 'Rechts', value: '-icon-right', iconPosition: 'after' },
        ],
      },
    ],
  },

  // ACF: Icon
  {
    name: 'acf/icon',
    options: [
      {
        type: 'button-group',
        label: 'Ausrichtung',
        default: '',
        attributeName: 'iconAlign',
        options: [
          { icon: 'image-left', label: 'Links', value: '-icon-align-left' },
          { icon: 'image-center', label: 'Zentriert', value: '' },
          { icon: 'image-right', label: 'Rechts', value: '-icon-align-right' },
        ],
      },
    ],
  },

  // ACF: Icon mit Text
  {
    name: 'acf/icon-text',
    options: [
      {
        type: 'button-group',
        label: 'Position',
        default: '',
        attributeName: 'iconTextPosition',
        options: [
          { icon: 'image-left-text', label: 'Links neben Text', value: '' },
          { icon: 'image-right-text', label: 'Rechts neben Text', value: '-icon-text-align-right' },
          { icon: 'image-left', label: 'Links', value: '-icon-align-left' },
          { icon: 'image-center', label: 'Zentriert', value: '-icon-align-center' },
          { icon: 'image-right', label: 'Rechts', value: '-icon-align-right' },
        ],
      },
    ],
  },

  // ACF: Slider
  {
    name: 'acf/slider',
    options: [getContentMarginControl('m')],
  },
];
