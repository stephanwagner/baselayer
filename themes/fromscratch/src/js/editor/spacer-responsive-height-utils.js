/** Size tokens for spacer responsive height (unset has no CSS class). */
export const SPACER_RESPONSIVE_HEIGHT_SIZES = [
  { value: 'unset', label: '—' },
  { value: 'xs', label: 'XS' },
  { value: 's', label: 'S' },
  { value: 'm', label: 'M' },
  { value: 'l', label: 'L' },
  { value: 'xl', label: 'XL' },
];

/** Desktop and smallest breakpoint heights (px). Keep in sync with `_variables.scss` content margins. */
export const SPACER_RESPONSIVE_HEIGHT_PREVIEWS = {
  xs: { base: 24, min: 24 },
  s: { base: 32, min: 24 },
  m: { base: 48, min: 24 },
  l: { base: 64, min: 32 },
  xl: { base: 96, min: 32 },
};

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

/** Help text preview for the selected responsive size, e.g. `M: 48px → 24px`. */
export const spacerResponsiveHeightPreviewText = (displayValue) => {
  if (!displayValue || displayValue === 'unset') {
    return '';
  }

  const preview = SPACER_RESPONSIVE_HEIGHT_PREVIEWS[displayValue];

  if (!preview) {
    return '';
  }

  return `${displayValue.toUpperCase()}: ${preview.base}px → ${preview.min}px`;
};
