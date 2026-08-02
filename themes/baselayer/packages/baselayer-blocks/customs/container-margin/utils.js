/** Size tokens for the container margin toggle (unset has no CSS class). */
export const CONTAINER_MARGIN_SIZES = [
  { value: 'unset', label: '—' },
  { value: 'none', label: '0' },
  { value: 'xs', label: 'XS' },
  { value: 's', label: 'S' },
  { value: 'm', label: 'M' },
  { value: 'l', label: 'L' },
  { value: 'xl', label: 'XL' },
];

/** Toggle options for a container-margin control (`—` only when unset is allowed). */
export const containerMarginSizesForOption = (option) => {
  const allowUnset = option.allowUnset === true;

  return allowUnset
    ? CONTAINER_MARGIN_SIZES
    : CONTAINER_MARGIN_SIZES.filter((size) => size.value !== 'unset');
};

const CONTAINER_MARGIN_CLASS_TOKENS = ['none', 'xs', 's', 'm', 'l', 'xl'];

/** Every class name this control may add or replace. */
export const ALL_CONTAINER_MARGIN_CLASSES = CONTAINER_MARGIN_CLASS_TOKENS.flatMap((value) => [
  `-container-margin-${value}`,
  `-container-margin-top-${value}`,
  `-container-margin-bottom-${value}`,
]);

/** Parse `-container-margin-m` → `m`. Returns '' when not a combined margin class. */
export const parseCombinedMarginClass = (className) => {
  if (!className || typeof className !== 'string') {
    return '';
  }

  const match = className.match(/^-container-margin-(none|xs|s|m|l|xl)$/);
  return match ? match[1] : '';
};

const classForSize = (prefix, size) => (size ? `${prefix}${size}` : '');

/** Build CSS classes from the three margin attributes. */
export const containerMarginClassesFromAttributes = (option, attributes) => {
  const { top, bottom, linked } = option.attributeNames;
  const isLinked = attributes[linked] !== false;
  const topSize = attributes[top] ?? '';
  const bottomSize = attributes[bottom] ?? '';

  if (isLinked) {
    return topSize ? [classForSize('-container-margin-', topSize)] : [];
  }

  const classes = [];

  if (topSize) {
    classes.push(classForSize('-container-margin-top-', topSize));
  }

  if (bottomSize) {
    classes.push(classForSize('-container-margin-bottom-', bottomSize));
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

export const containerMarginAttributeKeys = (option) => {
  const names = option.attributeNames;
  return [names.top, names.bottom, names.linked];
};
