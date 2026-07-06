/** Size tokens that map to existing `-content-margin-*` utility classes. */
export const CONTENT_MARGIN_SIZES = [
  { value: 'none', label: '0' },
  { value: 'xs', label: 'XS' },
  { value: 's', label: 'S' },
  { value: 'm', label: 'M' },
  { value: 'l', label: 'L' },
  { value: 'xl', label: 'XL' },
];

/** Every class name this control may add or replace. */
export const ALL_CONTENT_MARGIN_CLASSES = CONTENT_MARGIN_SIZES.flatMap(({ value }) => [
  `-content-margin-${value}`,
  `-content-margin-top-${value}`,
  `-content-margin-bottom-${value}`,
]);

/** Parse `-content-margin-m` → `m`. Returns '' when not a combined margin class. */
export const parseCombinedMarginClass = (className) => {
  if (!className || typeof className !== 'string') {
    return '';
  }

  const match = className.match(/^-content-margin-(none|xs|s|m|l|xl)$/);
  return match ? match[1] : '';
};

/** Parse a single-sided adjust class. Returns `{ side, size }` or null. */
export const parseSideMarginClass = (className) => {
  if (!className || typeof className !== 'string') {
    return null;
  }

  const match = className.match(/^-content-margin-(top|bottom)-(none|xs|s|m|l|xl)$/);
  if (!match) {
    return null;
  }

  return { side: match[1], size: match[2] };
};

/** Extract margin state from a block `className` string. */
export const parseMarginStateFromClassName = (className) => {
  const classes = (className || '').split(/\s+/).filter(Boolean);
  let top = '';
  let bottom = '';
  let linked = true;

  for (const name of classes) {
    const combined = parseCombinedMarginClass(name);
    if (combined) {
      top = combined;
      bottom = combined;
      linked = true;
      continue;
    }

    const side = parseSideMarginClass(name);
    if (side) {
      linked = false;
      if (side.side === 'top') {
        top = side.size;
      } else {
        bottom = side.size;
      }
    }
  }

  return { top, bottom, linked };
};

const resolveStoredSize = (size, defaultSize) => (size === '' ? defaultSize : size);

const classForSize = (prefix, size) => (size ? `${prefix}${size}` : '');

/** Build CSS classes from the three margin attributes. */
export const contentMarginClassesFromAttributes = (option, attributes) => {
  const { top, bottom, linked } = option.attributeNames;
  const defaultSize = option.defaultSize ?? '';
  const isLinked = attributes[linked] !== false;
  const topSize = attributes[top] ?? '';
  const bottomSize = attributes[bottom] ?? '';

  if (isLinked) {
    const size = resolveStoredSize(topSize, defaultSize);
    return size ? [classForSize('-content-margin-', size)] : [];
  }

  const classes = [];
  const resolvedTop = resolveStoredSize(topSize, defaultSize);
  const resolvedBottom = resolveStoredSize(bottomSize, defaultSize);

  if (resolvedTop) {
    classes.push(classForSize('-content-margin-top-', resolvedTop));
  }

  if (resolvedBottom) {
    classes.push(classForSize('-content-margin-bottom-', resolvedBottom));
  }

  return classes;
};

/** UI / ToggleGroupControl value for a stored attribute + block default. */
export const displayMarginSize = (storedSize, defaultSize) => storedSize || defaultSize || '';

/** Persisted attribute value from a picked size + block default. */
export const storedMarginSize = (pickedSize, defaultSize) =>
  pickedSize === defaultSize ? '' : pickedSize;

/** Parse a default combined class into a size token. */
export const parseDefaultSize = (defaultClass) => parseCombinedMarginClass(defaultClass || '');

/** Migrate legacy `contentMargin` / `contentMarginAdjust` attributes once. */
export const migrateLegacyContentMarginAttributes = (attributes, option) => {
  const { top, bottom, linked } = option.attributeNames;
  const hasNewState =
    attributes[top] !== undefined ||
    attributes[bottom] !== undefined ||
    attributes[linked] !== undefined;

  const updates = {};
  let nextTop = attributes[top] ?? '';
  let nextBottom = attributes[bottom] ?? '';
  let nextLinked = attributes[linked] !== false;

  if (attributes.contentMargin) {
    const size = parseCombinedMarginClass(attributes.contentMargin);
    if (size) {
      nextTop = size;
      nextBottom = size;
      nextLinked = true;
    }
    updates.contentMargin = '';
  }

  if (attributes.contentMarginAdjust) {
    const side = parseSideMarginClass(attributes.contentMarginAdjust);
    if (side) {
      nextLinked = false;
      if (side.side === 'top') {
        nextTop = side.size;
      } else {
        nextBottom = side.size;
      }
    }
    updates.contentMarginAdjust = '';
  }

  if (!hasNewState && !attributes.contentMargin && !attributes.contentMarginAdjust) {
    const fromClass = parseMarginStateFromClassName(attributes.className);
    if (fromClass.top || fromClass.bottom) {
      nextTop = fromClass.top;
      nextBottom = fromClass.bottom;
      nextLinked = fromClass.linked;
    }
  }

  if (
    nextTop !== (attributes[top] ?? '') ||
    nextBottom !== (attributes[bottom] ?? '') ||
    nextLinked !== (attributes[linked] !== false)
  ) {
    updates[top] = nextTop;
    updates[bottom] = nextBottom;
    updates[linked] = nextLinked;
  }

  return Object.keys(updates).length ? updates : null;
};

export const contentMarginAttributeKeys = (option) => {
  const names = option.attributeNames;
  return [names.top, names.bottom, names.linked];
};
