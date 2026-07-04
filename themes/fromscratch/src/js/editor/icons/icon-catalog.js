/**
 * Icon catalog for the reusable icon picker (structure only).
 *
 * Each icon is an object:
 *   {
 *     filename: 'heart',            // assets/icons/<filename>.svg (base/outline)
 *     alternatives: ['fill'],       // extra variants: assets/icons/<filename>-<alt>.svg
 *     keywords: ['favorit', 'like'] // static, multilingual search synonyms
 *   }
 *
 * Human-readable names (per icon) and category labels are translatable and are
 * NOT stored here — they come from PHP via `window.fromscratchIcons`
 * (text domain: fromscratch-icons, see inc/editor-icons.php). Keeping them in
 * PHP routes them through the theme's gettext pipeline without bloating the
 * main .mo.
 *
 * The generated class names use the filename (`-icon-heart`, `-icon-heart-fill`)
 * and must stay in sync with the SCSS catalog in src/scss/_icons.scss.
 *
 * Only a subset is listed for now; more can be added per category later.
 */
export const iconCategories = [
  {
    slug: 'arrows',
    icons: [
      {
        filename: 'arrow-left',
        alternatives: [],
        keywords: ['zurück', 'back', 'previous', 'links', 'left']
      },
      {
        filename: 'arrow-right',
        alternatives: [],
        keywords: ['weiter', 'next', 'forward', 'rechts', 'right']
      },
      {
        filename: 'chevron-left',
        alternatives: [],
        keywords: ['zurück', 'back', 'previous', 'pfeil', 'links']
      },
      {
        filename: 'chevron-right',
        alternatives: [],
        keywords: ['weiter', 'next', 'forward', 'pfeil', 'rechts']
      },
      {
        filename: 'chevron-up',
        alternatives: [],
        keywords: ['nach oben', 'up', 'pfeil', 'oben']
      },
      {
        filename: 'chevron-down',
        alternatives: [],
        keywords: ['nach unten', 'down', 'pfeil', 'unten', 'dropdown']
      }
    ]
  },
  {
    slug: 'actions',
    icons: [
      {
        filename: 'add',
        alternatives: [],
        keywords: ['plus', 'neu', 'new', 'erstellen', 'add']
      },
      {
        filename: 'edit',
        alternatives: ['fill'],
        keywords: ['stift', 'pen', 'pencil', 'ändern', 'edit']
      },
      {
        filename: 'delete',
        alternatives: ['fill'],
        keywords: ['mülleimer', 'trash', 'entfernen', 'remove', 'papierkorb']
      },
      {
        filename: 'download',
        alternatives: [],
        keywords: ['download', 'speichern', 'save', 'pfeil']
      },
      {
        filename: 'copy',
        alternatives: ['fill'],
        keywords: ['duplizieren', 'duplicate', 'clipboard', 'copy']
      },
      {
        filename: 'checkmark',
        alternatives: [],
        keywords: ['check', 'ok', 'erledigt', 'done', 'bestätigen', 'haken']
      }
    ]
  },
  {
    slug: 'communication',
    icons: [
      {
        filename: 'chat',
        alternatives: ['fill'],
        keywords: ['nachricht', 'message', 'sprechblase', 'kommentar', 'bubble']
      },
      {
        filename: 'mail',
        alternatives: ['fill'],
        keywords: ['email', 'brief', 'envelope', 'kontakt', 'nachricht']
      },
      {
        filename: 'megaphone',
        alternatives: ['fill'],
        keywords: ['ankündigung', 'announcement', 'marketing', 'werbung', 'laut']
      }
    ]
  },
  {
    slug: 'media',
    icons: [
      {
        filename: 'camera',
        alternatives: ['fill'],
        keywords: ['foto', 'photo', 'bild', 'picture']
      },
      {
        filename: 'image',
        alternatives: ['fill'],
        keywords: ['foto', 'photo', 'picture', 'grafik']
      },
      {
        filename: 'article',
        alternatives: ['fill'],
        keywords: ['dokument', 'text', 'seite', 'page', 'beitrag']
      },
      {
        filename: 'carousel',
        alternatives: ['fill'],
        keywords: ['slider', 'galerie', 'gallery', 'slideshow']
      }
    ]
  },
  {
    slug: 'general',
    icons: [
      {
        filename: 'bolt',
        alternatives: ['fill'],
        keywords: ['energie', 'power', 'schnell', 'fast', 'flash', 'strom']
      },
      {
        filename: 'bookmark',
        alternatives: ['fill'],
        keywords: ['merken', 'save', 'favorit', 'bookmark']
      },
      {
        filename: 'calendar-month',
        alternatives: ['fill'],
        keywords: ['datum', 'date', 'termin', 'monat', 'month', 'calendar']
      },
      {
        filename: 'heart',
        alternatives: ['fill'],
        keywords: ['favorit', 'like', 'love', 'liebe', 'gefällt']
      },
      {
        filename: 'home',
        alternatives: ['fill'],
        keywords: ['haus', 'house', 'home', 'start', 'zuhause']
      },
      {
        filename: 'info',
        alternatives: ['fill'],
        keywords: ['information', 'hilfe', 'help', 'details']
      },
      {
        filename: 'location',
        alternatives: ['fill'],
        keywords: ['ort', 'pin', 'map', 'karte', 'adresse', 'position']
      },
      {
        filename: 'link',
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

/**
 * Match an icon against a lowercased search query.
 *
 * Searches the file name, the (localized) display name passed in, and the
 * static keywords.
 */
export const iconMatchesQuery = (icon, query, displayName = '') => {
  if (!query) {
    return true;
  }

  const haystack = [icon.filename, displayName]
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
