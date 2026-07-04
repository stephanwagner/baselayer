/**
 * Icon catalog for the reusable icon picker.
 *
 * Each icon is an object:
 *   {
 *     filename: 'heart',            // assets/icons/<filename>.svg (base/outline)
 *     name: 'Herz',                 // human label shown in the picker
 *     alternatives: ['fill'],       // extra variants: assets/icons/<filename>-<alt>.svg
 *     keywords: ['favorit', 'like'] // extra search terms (name is always searched)
 *   }
 *
 * `alternatives` replaces the old separate fill list, so a filled icon just
 * declares `alternatives: ['fill']`. New variant types (e.g. 'sharp') can be
 * added the same way later.
 *
 * The generated class names use the filename (`-icon-heart`, `-icon-heart-fill`)
 * and must stay in sync with the SCSS catalog in src/scss/_icons.scss.
 *
 * Only a subset is listed for now; more can be added per category later.
 */
export const iconCategories = [
  {
    slug: 'arrows',
    label: 'Pfeile',
    icons: [
      {
        filename: 'arrow-left',
        name: 'Pfeil links',
        alternatives: [],
        keywords: ['zurück', 'back', 'previous', 'links', 'left']
      },
      {
        filename: 'arrow-right',
        name: 'Pfeil rechts',
        alternatives: [],
        keywords: ['weiter', 'next', 'forward', 'rechts', 'right']
      },
      {
        filename: 'chevron-left',
        name: 'Chevron links',
        alternatives: [],
        keywords: ['zurück', 'back', 'previous', 'pfeil', 'links']
      },
      {
        filename: 'chevron-right',
        name: 'Chevron rechts',
        alternatives: [],
        keywords: ['weiter', 'next', 'forward', 'pfeil', 'rechts']
      },
      {
        filename: 'chevron-up',
        name: 'Chevron oben',
        alternatives: [],
        keywords: ['nach oben', 'up', 'pfeil', 'oben']
      },
      {
        filename: 'chevron-down',
        name: 'Chevron unten',
        alternatives: [],
        keywords: ['nach unten', 'down', 'pfeil', 'unten', 'dropdown']
      }
    ]
  },
  {
    slug: 'actions',
    label: 'Aktionen',
    icons: [
      {
        filename: 'add',
        name: 'Hinzufügen',
        alternatives: [],
        keywords: ['plus', 'neu', 'new', 'erstellen', 'add']
      },
      {
        filename: 'edit',
        name: 'Bearbeiten',
        alternatives: ['fill'],
        keywords: ['stift', 'pen', 'pencil', 'ändern', 'edit']
      },
      {
        filename: 'delete',
        name: 'Löschen',
        alternatives: ['fill'],
        keywords: ['mülleimer', 'trash', 'entfernen', 'remove', 'papierkorb']
      },
      {
        filename: 'download',
        name: 'Herunterladen',
        alternatives: [],
        keywords: ['download', 'speichern', 'save', 'pfeil']
      },
      {
        filename: 'copy',
        name: 'Kopieren',
        alternatives: ['fill'],
        keywords: ['duplizieren', 'duplicate', 'clipboard', 'copy']
      },
      {
        filename: 'checkmark',
        name: 'Häkchen',
        alternatives: [],
        keywords: ['check', 'ok', 'erledigt', 'done', 'bestätigen', 'haken']
      }
    ]
  },
  {
    slug: 'communication',
    label: 'Kommunikation',
    icons: [
      {
        filename: 'chat',
        name: 'Chat',
        alternatives: ['fill'],
        keywords: ['nachricht', 'message', 'sprechblase', 'kommentar', 'bubble']
      },
      {
        filename: 'mail',
        name: 'E-Mail',
        alternatives: ['fill'],
        keywords: ['email', 'brief', 'envelope', 'kontakt', 'nachricht']
      },
      {
        filename: 'megaphone',
        name: 'Megafon',
        alternatives: ['fill'],
        keywords: ['ankündigung', 'announcement', 'marketing', 'werbung', 'laut']
      }
    ]
  },
  {
    slug: 'media',
    label: 'Medien',
    icons: [
      {
        filename: 'camera',
        name: 'Kamera',
        alternatives: ['fill'],
        keywords: ['foto', 'photo', 'bild', 'picture']
      },
      {
        filename: 'image',
        name: 'Bild',
        alternatives: ['fill'],
        keywords: ['foto', 'photo', 'picture', 'grafik']
      },
      {
        filename: 'article',
        name: 'Artikel',
        alternatives: ['fill'],
        keywords: ['dokument', 'text', 'seite', 'page', 'beitrag']
      },
      {
        filename: 'carousel',
        name: 'Karussell',
        alternatives: ['fill'],
        keywords: ['slider', 'galerie', 'gallery', 'slideshow']
      }
    ]
  },
  {
    slug: 'general',
    label: 'Allgemein',
    icons: [
      {
        filename: 'bolt',
        name: 'Blitz',
        alternatives: ['fill'],
        keywords: ['energie', 'power', 'schnell', 'fast', 'flash', 'strom']
      },
      {
        filename: 'bookmark',
        name: 'Lesezeichen',
        alternatives: ['fill'],
        keywords: ['merken', 'save', 'favorit', 'bookmark']
      },
      {
        filename: 'calendar-month',
        name: 'Kalender',
        alternatives: ['fill'],
        keywords: ['datum', 'date', 'termin', 'monat', 'month', 'calendar']
      },
      {
        filename: 'heart',
        name: 'Herz',
        alternatives: ['fill'],
        keywords: ['favorit', 'like', 'love', 'liebe', 'gefällt']
      },
      {
        filename: 'home',
        name: 'Startseite',
        alternatives: ['fill'],
        keywords: ['haus', 'house', 'home', 'start', 'zuhause']
      },
      {
        filename: 'info',
        name: 'Info',
        alternatives: ['fill'],
        keywords: ['information', 'hilfe', 'help', 'details']
      },
      {
        filename: 'location',
        name: 'Standort',
        alternatives: ['fill'],
        keywords: ['ort', 'pin', 'map', 'karte', 'adresse', 'position']
      },
      {
        filename: 'link',
        name: 'Link',
        alternatives: [],
        keywords: ['verknüpfung', 'url', 'kette', 'chain', 'verlinken']
      }
    ]
  }
];

/** Flat list of every icon across all categories. */
export const allIcons = iconCategories.reduce(
  (icons, category) => icons.concat(category.icons),
  []
);

/** Whether an icon offers the given variant (e.g. 'fill'). */
export const hasVariant = (icon, variant) =>
  !!icon && !!variant && icon.alternatives.indexOf(variant) !== -1;

/**
 * Resolve an icon to the file name for a variant. Falls back to the base
 * (outline) file name when the requested variant does not exist, so every
 * icon stays selectable regardless of the active variant.
 */
export const resolveIconName = (icon, variant) =>
  variant && variant !== 'outline' && hasVariant(icon, variant)
    ? `${icon.filename}-${variant}`
    : icon.filename;

/** Match an icon against a lowercased search query (filename, name, keywords). */
export const iconMatchesQuery = (icon, query) => {
  if (!query) {
    return true;
  }

  const haystack = [icon.filename, icon.name]
    .concat(icon.keywords)
    .join(' ')
    .toLowerCase();

  return haystack.indexOf(query) !== -1;
};

/**
 * Find the icon + variant for a stored value (e.g. `heart-fill`).
 * Returns null when the value does not match any catalog icon.
 */
export const findIconByValue = (value) => {
  if (!value) {
    return null;
  }

  for (const icon of allIcons) {
    if (icon.filename === value) {
      return { icon, variant: 'outline' };
    }

    for (const variant of icon.alternatives) {
      if (value === `${icon.filename}-${variant}`) {
        return { icon, variant };
      }
    }
  }

  return null;
};
