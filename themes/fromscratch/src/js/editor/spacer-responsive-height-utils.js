/** Size tokens for spacer responsive height (unset has no CSS class). */
export const SPACER_RESPONSIVE_HEIGHT_SIZES = [
  { value: 'unset', label: '—' },
  { value: 'xs', label: 'XS' },
  { value: 's', label: 'S' },
  { value: 'm', label: 'M' },
  { value: 'l', label: 'L' },
  { value: 'xl', label: 'XL' },
];

const CLASS_PREFIX = '-spacer-height-';

/** Every class name this control may add or replace. */
export const ALL_SPACER_RESPONSIVE_HEIGHT_CLASSES = SPACER_RESPONSIVE_HEIGHT_SIZES.filter(
  (size) => size.value !== 'unset'
).map((size) => `${CLASS_PREFIX}${size.value}`);

/** UI value for stored attribute (`''` → unset / —). */
export const displaySpacerResponsiveHeight = (storedValue) =>
  storedValue === '' ? 'unset' : storedValue.replace(CLASS_PREFIX, '');

/** Persisted class name from a picked toggle value. */
export const storedSpacerResponsiveHeight = (pickedSize) => {
  if (pickedSize === 'unset' || pickedSize === '') {
    return '';
  }

  if (pickedSize.indexOf(CLASS_PREFIX) === 0) {
    return pickedSize;
  }

  return `${CLASS_PREFIX}${pickedSize}`;
};

/** Class names implied by the spacer responsive height attribute. */
export const spacerResponsiveHeightClassesFromAttributes = (option, attributes) => {
  const stored = attributes[option.attributeName] ?? '';

  return stored ? [stored] : [];
};

export const spacerResponsiveHeightAttributeKey = (option) => option.attributeName;
