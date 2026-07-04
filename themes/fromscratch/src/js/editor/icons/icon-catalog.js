/**
 * Icon catalog for the reusable icon picker.
 *
 * Icon names map to files in assets/icons/<name>.svg and to the SCSS catalog
 * in src/scss/_icons.scss — keep both in sync when adding icons.
 *
 * Only a subset is listed for now; more can be added per category later.
 */
export const iconCategories = [
  {
    slug: 'arrows',
    label: 'Pfeile',
    icons: [
      'arrow-left',
      'arrow-right',
      'chevron-left',
      'chevron-right',
      'chevron-up',
      'chevron-down'
    ]
  },
  {
    slug: 'actions',
    label: 'Aktionen',
    icons: ['add', 'edit', 'delete', 'download', 'copy', 'checkmark']
  },
  {
    slug: 'communication',
    label: 'Kommunikation',
    icons: ['chat', 'mail', 'megaphone']
  },
  {
    slug: 'media',
    label: 'Medien',
    icons: ['camera', 'image', 'article', 'carousel']
  },
  {
    slug: 'general',
    label: 'Allgemein',
    icons: [
      'bolt',
      'bookmark',
      'calendar-month',
      'heart',
      'home',
      'info',
      'location',
      'link'
    ]
  }
];

/**
 * Icons that also ship a filled variant (`<name>-fill.svg`).
 *
 * Only these get the "Gefüllt" option in the picker; every other icon stays
 * outline-only. Mirror this list in src/scss/_icons.scss ($fs-icon-fill).
 */
export const fillIcons = [
  'edit',
  'delete',
  'copy',
  'chat',
  'mail',
  'megaphone',
  'camera',
  'image',
  'article',
  'carousel',
  'bolt',
  'bookmark',
  'calendar-month',
  'heart',
  'home',
  'info',
  'location'
];

/** Whether an icon has a filled variant. */
export const hasFill = (name) => fillIcons.indexOf(name) !== -1;

/** Flat list of all catalog icon names. */
export const allIconNames = iconCategories.reduce(
  (names, category) => names.concat(category.icons),
  []
);
