function getContentMarginOptions(defaultValue = '') {
  return {
    type: 'select',
    label: 'Abstände',
    default: defaultValue,
    attributeName: 'contentMargin',
    options: [
      { label: 'Ohne', value: '' },
      { label: 'Sehr Klein', value: '-content-margin-xs' },
      { label: 'Klein', value: '-content-margin-s' },
      { label: 'Mittel', value: '-content-margin-m' },
      { label: 'Groß', value: '-content-margin-l' },
      { label: 'Sehr groß', value: '-content-margin-xl' }
    ]
  };
}

function getLimitWidthOptions() {
  return {
    type: 'select',
    label: 'Weite limitieren',
    default: '',
    attributeName: 'limitWidth',
    options: [
      { label: 'Ohne', value: '' },
      { label: 'Eng', value: '-narrow' },
      { label: 'Eng (links orientiert)', value: '-narrow-left' },
      { label: 'Sehr Eng', value: '-very-narrow' },
      { label: 'Sehr Eng (links orientiert)', value: '-very-narrow-left' }
    ]
  };
}

export const blockOptions = [
  // Columns
  {
    name: 'core/columns',
    options: [
      getContentMarginOptions('-content-margin-m'),
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
        label: 'Spalten auf Mobilgeräten umkehren',
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
        label: 'Inhalt zentrieren',
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
      getLimitWidthOptions()
    ]
  },

  // Paragraph
  {
    name: 'core/paragraph',
    options: [
      getLimitWidthOptions(),
      {
        type: 'select',
        label: 'Text Wrap',
        default: '',
        attributeName: 'textWrap',
        options: [
          { label: 'Standard', value: '' },
          { label: 'Balanced', value: 'text-wrap-balance' },
          { label: 'Pretty', value: 'text-wrap-pretty' }
        ]
      }
    ]
  },

  // Image
  {
    name: 'core/image',
    options: [getContentMarginOptions()]
  },

  // Group
  {
    name: 'core/group',
    options: [
      getContentMarginOptions('-content-margin-m'),
      getLimitWidthOptions()
    ]
  },

  // Separator
  {
    name: 'core/separator',
    options: [getContentMarginOptions('-content-margin-m')]
  }
];
