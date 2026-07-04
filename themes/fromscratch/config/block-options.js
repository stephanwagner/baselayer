/**
 * Get content margin options
 * @param {*} defaultValue
 * @returns
 */
function getContentMarginOptions(defaultValue = '') {
  return {
    type: 'select',
    label: 'Abstand oben und unten',
    default: defaultValue,
    attributeName: 'contentMargin',
    options: [
      { label: 'Standard', value: '' },
      { label: 'Ohne', value: '-content-margin-none' },
      { label: 'Sehr Klein', value: '-content-margin-xs' },
      { label: 'Klein', value: '-content-margin-s' },
      { label: 'Mittel', value: '-content-margin-m' },
      { label: 'Groß', value: '-content-margin-l' },
      { label: 'Sehr groß', value: '-content-margin-xl' }
    ]
  };
}

/**
 * Get content margin adjust options
 * @param {*} defaultValue
 * @returns
 */
function getContentMarginAdjustOptions(defaultValue = '') {
  return {
    type: 'select',
    label: 'Abstand anpassen',
    default: defaultValue,
    attributeName: 'contentMarginAdjust',
    options: [
      { label: 'Standard', value: '' },
      { label: 'Abstand oben: Ohne', value: '-content-margin-top-none' },
      { label: 'Abstand oben: Sehr Klein', value: '-content-margin-top-xs' },
      { label: 'Abstand oben: Klein', value: '-content-margin-top-s' },
      { label: 'Abstand oben: Mittel', value: '-content-margin-top-m' },
      { label: 'Abstand oben: Groß', value: '-content-margin-top-l' },
      { label: 'Abstand oben: Sehr groß', value: '-content-margin-top-xl' },
      { label: 'Abstand unten: Ohne', value: '-content-margin-bottom-none' },
      {
        label: 'Abstand unten: Sehr Klein',
        value: '-content-margin-bottom-xs'
      },
      { label: 'Abstand unten: Klein', value: '-content-margin-bottom-s' },
      { label: 'Abstand unten: Mittel', value: '-content-margin-bottom-m' },
      { label: 'Abstand unten: Groß', value: '-content-margin-bottom-l' },
      { label: 'Abstand unten: Sehr groß', value: '-content-margin-bottom-xl' }
    ]
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
      getContentMarginOptions('-content-margin-m'),
      getContentMarginAdjustOptions(),
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
      getContentMarginOptions(),
      getContentMarginAdjustOptions(),
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
      getContentMarginOptions(),
      getContentMarginAdjustOptions(),
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
      getContentMarginOptions('-content-margin-m'),
      getContentMarginAdjustOptions(),
      getLimitWidthOptions()
    ]
  },

  // Separator
  {
    name: 'core/separator',
    options: [
      getContentMarginOptions('-content-margin-m'),
      getContentMarginAdjustOptions()
    ]
  },

  // Cover
  {
    name: 'core/cover',
    options: [
      getContentMarginOptions('-content-margin-m'),
      getContentMarginAdjustOptions()
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
      getContentMarginOptions('-content-margin-m'),
      getContentMarginAdjustOptions()
    ]
  }
];
