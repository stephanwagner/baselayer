/** Size tokens for the content margin toggle (unset has no CSS class). */
export const CONTENT_MARGIN_SIZES = [
  { value: 'unset', label: '—' },
  { value: 'none', label: '0' },
  { value: 'xs', label: 'XS' },
  { value: 's', label: 'S' },
  { value: 'm', label: 'M' },
  { value: 'l', label: 'L' },
  { value: 'xl', label: 'XL' },
];

/** Toggle options for a content-margin control (`—` only when unset is allowed). */
export const contentMarginSizesForOption = (option) => {
  const allowUnset = option.allowUnset === true;

  return allowUnset
    ? CONTENT_MARGIN_SIZES
    : CONTENT_MARGIN_SIZES.filter((size) => size.value !== 'unset');
};

const CONTENT_MARGIN_CLASS_TOKENS = ['none', 'xs', 's', 'm', 'l', 'xl'];

/** Every class name this control may add or replace. */
export const ALL_CONTENT_MARGIN_CLASSES = CONTENT_MARGIN_CLASS_TOKENS.flatMap((value) => [
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

const classForSize = (prefix, size) => (size ? `${prefix}${size}` : '');

/** Build CSS classes from the three margin attributes. */
export const contentMarginClassesFromAttributes = (option, attributes) => {
  const { top, bottom, linked } = option.attributeNames;
  const isLinked = attributes[linked] !== false;
  const topSize = attributes[top] ?? '';
  const bottomSize = attributes[bottom] ?? '';

  if (isLinked) {
    return topSize ? [classForSize('-content-margin-', topSize)] : [];
  }

  const classes = [];

  if (topSize) {
    classes.push(classForSize('-content-margin-top-', topSize));
  }

  if (bottomSize) {
    classes.push(classForSize('-content-margin-bottom-', bottomSize));
  }

  return classes;
};

/** UI value for a stored attribute (`''` → unset / — when allowed). */
export const displayMarginSize = (storedSize, allowUnset = false) => {
  if (storedSize === '') {
    return allowUnset ? 'unset' : '';
  }

  return storedSize;
};

/** Persisted attribute value from a picked toggle value. */
export const storedMarginSize = (pickedSize) => (pickedSize === 'unset' ? '' : pickedSize);

/** Value applied by Reset: block default, or unset when no default is configured. */
export const resetMarginSize = (defaultSize) => defaultSize || '';

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
