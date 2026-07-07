/** Width size tokens mapped to existing `-narrow*` utility classes. */
export const LIMIT_WIDTH_SIZES = [
  { value: 'unset', label: '—' },
  { value: 's', label: 'S' },
  { value: 'm', label: 'M' },
  { value: 'l', label: 'L' },
];

export const LIMIT_WIDTH_ALIGNS = [
  { value: 'left', label: 'Links', icon: 'align-left' },
  { value: 'center', label: 'Zentriert', icon: 'align-center' },
  { value: 'right', label: 'Rechts', icon: 'align-right' },
];

const WIDTH_CLASS_BY_SIZE = {
  s: '-extra-narrow',
  m: '-very-narrow',
  l: '-narrow',
};

/** Every class name this control may add or replace. */
export const ALL_LIMIT_WIDTH_CLASSES = [
  ...Object.values(WIDTH_CLASS_BY_SIZE),
  ...Object.values(WIDTH_CLASS_BY_SIZE).flatMap((base) => [`${base}-left`, `${base}-right`]),
];

const LEGACY_LIMIT_WIDTH_BY_CLASS = {
  '-narrow': { size: 'l', align: 'center' },
  '-very-narrow': { size: 'm', align: 'center' },
  '-extra-narrow': { size: 's', align: 'center' },
  '-narrow-left': { size: 'l', align: 'left' },
  '-very-narrow-left': { size: 'm', align: 'left' },
  '-extra-narrow-left': { size: 's', align: 'left' },
};

const CLASS_BY_SIZE_AND_ALIGN = LIMIT_WIDTH_SIZES.reduce((map, { value: size }) => {
  if (size === 'unset') {
    return map;
  }

  LIMIT_WIDTH_ALIGNS.forEach(({ value: align }) => {
    const base = WIDTH_CLASS_BY_SIZE[size];
    map[`${size}:${align}`] =
      align === 'center' ? base : align === 'left' ? `${base}-left` : `${base}-right`;
  });

  return map;
}, {});

/** Parse a limit-width utility class into `{ size, align }`. */
export const parseLimitWidthClass = (className) => {
  if (!className || typeof className !== 'string') {
    return null;
  }

  if (LEGACY_LIMIT_WIDTH_BY_CLASS[className]) {
    return LEGACY_LIMIT_WIDTH_BY_CLASS[className];
  }

  for (const [size, base] of Object.entries(WIDTH_CLASS_BY_SIZE)) {
    if (className === base) {
      return { size, align: 'center' };
    }

    if (className === `${base}-left`) {
      return { size, align: 'left' };
    }

    if (className === `${base}-right`) {
      return { size, align: 'right' };
    }
  }

  return null;
};

/** Extract limit-width state from a block `className` string. */
export const parseLimitWidthStateFromClassName = (className) => {
  const classes = (className || '').split(/\s+/).filter(Boolean);

  for (const name of classes) {
    const parsed = parseLimitWidthClass(name);
    if (parsed) {
      return parsed;
    }
  }

  return { size: '', align: 'center' };
};

/** UI value for the stored size attribute. */
export const displayLimitWidthSize = (storedSize) => (storedSize === '' ? 'unset' : storedSize);

/** Stored attribute value for a picked UI size. */
export const storedLimitWidthSize = (pickedSize) => (pickedSize === 'unset' ? '' : pickedSize);

/** Class names implied by current limit-width attributes. */
export const limitWidthClassesFromAttributes = (option, attributes) => {
  const { size, align } = option.attributeNames;
  const storedSize = attributes[size] ?? '';
  const storedAlign = attributes[align] ?? option.defaultAlign ?? 'center';

  if (!storedSize) {
    return [];
  }

  const className = CLASS_BY_SIZE_AND_ALIGN[`${storedSize}:${storedAlign}`];
  return className ? [className] : [];
};

export const limitWidthAttributeKeys = (option) => {
  const { size, align } = option.attributeNames;
  return [size, align];
};

/** Migrate legacy `limitWidth` attribute / className into split attributes. */
export const migrateLegacyLimitWidthAttributes = (attributes, option) => {
  const { size, align } = option.attributeNames;

  if (attributes[size]) {
    return null;
  }

  const legacyValue = attributes.limitWidth;
  if (legacyValue && LEGACY_LIMIT_WIDTH_BY_CLASS[legacyValue]) {
    const migrated = LEGACY_LIMIT_WIDTH_BY_CLASS[legacyValue];
    return {
      [size]: migrated.size,
      [align]: migrated.align,
      limitWidth: '',
    };
  }

  const fromClassName = parseLimitWidthStateFromClassName(attributes.className);
  if (fromClassName.size) {
    return {
      [size]: fromClassName.size,
      [align]: fromClassName.align,
      limitWidth: '',
    };
  }

  return null;
};
