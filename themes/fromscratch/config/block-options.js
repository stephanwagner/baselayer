/**
 * Linked top/bottom content margin control.
 *
 * @param {string} defaultClass Combined default class, e.g. `-content-margin-m` or ''.
 */
function getContentMarginControl(defaultClass = '') {
  const match = (defaultClass || '').match(/^-content-margin-(none|xs|s|m|l|xl)$/);
  const defaultSize = match ? match[1] : '';

  return {
    type: 'content-margin',
    label: 'Abstände',
    defaultSize,
    attributeNames: {
      top: 'contentMarginTop',
      bottom: 'contentMarginBottom',
      linked: 'contentMarginLinked',
    },
  };
}

/**
 * Get text wrap options
 * @returns
 */
function getTextWrapOptions() {
  return {
    type: 'select',
    label: 'Text Wrap',
    default: '',
    attributeName: 'textWrap',
    options: [
      { label: 'Standard', value: '' },
      { label: 'Balanced', value: 'text-wrap-balance' },
      { label: 'Pretty', value: 'text-wrap-pretty' }
    ]
  };
}

/**
 * Get limit width options
 * @returns
 */
function getLimitWidthOptions() {
  return {
    type: 'select',
    label: 'Weite limitieren',
    default: '',
    attributeName: 'limitWidth',
    options: [
      { label: 'Ohne', value: '' },
      { label: 'Eng', value: '-narrow' },
      { label: 'Sehr Eng', value: '-very-narrow' },
      { label: 'Extra Eng', value: '-extra-narrow' },
      { label: 'Eng (links orientiert)', value: '-narrow-left' },
      { label: 'Sehr Eng (links orientiert)', value: '-very-narrow-left' },
      { label: 'Extra Eng (links orientiert)', value: '-extra-narrow-left' }
    ]
  };
}

/**
 * Apply block options
 */
export const blockOptions = [
  // Columns
  {
    name: 'core/columns',
    options: [
      getContentMarginControl('-content-margin-m'),
      {
        type: 'select',
        label: 'Spaltenabstand',
        default: '-column-gap-m',
        attributeName: 'columnGap',
        options: [
          { label: 'Sehr klein', value: '-column-gap-xs' },
          { label: 'Klein', value: '-column-gap-s' },
          { label: 'Normal', value: '-column-gap-m' },
          { label: 'Groß', value: '-column-gap-l' },
          { label: 'Sehr groß', value: '-column-gap-xl' }
        ]
      },
      {
        type: 'select',
        label: 'Design',
        default: '',
        attributeName: 'design',
        options: [
          { label: 'Standard', value: '' },
          { label: 'Bild links, Text rechts', value: '-image-left-text-right' },
          { label: 'Bild rechts, Text links', value: '-image-right-text-left' }
        ]
      },
      {
        type: 'boolean',
        label: 'Spalten wenn gestapelt umkehren',
        default: false,
        attributeName: 'columnReverseOrderOnMobile',
        className: '-reverse-order-on-mobile'
      }
    ]
  },

  // Column
  {
    name: 'core/column',
    options: [
      {
        type: 'boolean',
        label: 'Inhalt vertikal zentrieren',
        default: false,
        attributeName: 'columnCenterContent',
        className: '-center-content'
      }
    ]
  },

  // Heading
  {
    name: 'core/heading',
    options: [
      {
        type: 'select',
        label: 'Anzeigen als',
        default: '',
        attributeName: 'headingShowAs',
        options: [
          { label: 'Standard', value: '' },
          { label: 'H1', value: 'h1' },
          { label: 'H2', value: 'h2' },
          { label: 'H3', value: 'h3' },
          { label: 'H4', value: 'h4' },
          { label: 'H5', value: 'h5' },
          { label: 'H6', value: 'h6' }
        ]
      },
      getLimitWidthOptions(),
      getTextWrapOptions()
    ]
  },

  // Paragraph
  {
    name: 'core/paragraph',
    options: [
      getLimitWidthOptions(),
      getTextWrapOptions()
    ]
  },

  // Image
  {
    name: 'core/image',
    options: [
      getContentMarginControl(),
      {
        type: 'boolean',
        label: 'Ohne Bildtext',
        default: false,
        attributeName: 'noImageLabel',
        className: '-no-image-caption'
      },
      {
        type: 'boolean',
        label: 'Bild bei Klick vergrößern',
        default: false,
        attributeName: 'hasLightbox',
        className: '-has-lightbox'
      }
    ]
  },

  // Gallery
  {
    name: 'core/gallery',
    options: [
      getContentMarginControl(),
      {
        type: 'boolean',
        label: 'Ohne Bildtexte',
        default: false,
        attributeName: 'noImageLabels',
        className: '-no-image-captions'
      },
      {
        type: 'boolean',
        label: 'Bilder bei Klick vergrößern',
        default: true,
        attributeName: 'hasLightbox',
        className: '-has-lightbox'
      }
    ]
  },

  // Group
  {
    name: 'core/group',
    options: [
      getContentMarginControl('-content-margin-m'),
      getLimitWidthOptions()
    ]
  },

  // Separator
  {
    name: 'core/separator',
    options: [
      getContentMarginControl('-content-margin-m')
    ]
  },

  // Cover
  {
    name: 'core/cover',
    options: [
      getContentMarginControl('-content-margin-m')
    ]
  },

  // Button
  {
    name: 'core/button',
    options: [
      {
        type: 'icon',
        label: 'Icon',
        default: '',
        attributeName: 'buttonIcon'
      },
      {
        type: 'button-group',
        label: 'Icon Position',
        default: '',
        attributeName: 'buttonIconPosition',
        options: [
          { label: 'Links', value: '' },
          { label: 'Rechts', value: '-icon-right' }
        ]
      }
    ]
  },

  // ACF: Slider
  {
    name: 'acf/slider',
    options: [
      getContentMarginControl('-content-margin-m')
    ]
  }
];
