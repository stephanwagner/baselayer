import {
  CONTENT_MARGIN_SIZES,
  displayMarginSize,
  resetMarginSize,
  storedMarginSize,
} from './content-margin-utils';

export const contentPaddingSizesForOption = (option) => {
  const allowUnset = option.allowUnset === true;

  return allowUnset
    ? CONTENT_MARGIN_SIZES
    : CONTENT_MARGIN_SIZES.filter((size) => size.value !== 'unset');
};

const CONTENT_PADDING_CLASS_TOKENS = ['none', 'xs', 's', 'm', 'l', 'xl'];

export const ALL_CONTENT_PADDING_CLASSES = CONTENT_PADDING_CLASS_TOKENS.flatMap((value) => [
  `-content-padding-${value}`,
  `-content-padding-top-${value}`,
  `-content-padding-bottom-${value}`,
]);

export const parseCombinedPaddingClass = (className) => {
  if (!className || typeof className !== 'string') {
    return '';
  }

  const match = className.match(/^-content-padding-(none|xs|s|m|l|xl)$/);
  return match ? match[1] : '';
};

export const parsePaddingSizeFromClassName = (className) => {
  const classes = (className || '').split(/\s+/).filter(Boolean);

  for (const name of classes) {
    const combined = parseCombinedPaddingClass(name);
    if (combined) {
      return combined;
    }
  }

  for (const name of classes) {
    const match = name.match(/^-content-padding-(?:top|bottom)-(none|xs|s|m|l|xl)$/);
    if (match) {
      return match[1];
    }
  }

  return '';
};

export const contentPaddingAttributeName = (option) => option.attributeName || 'contentPadding';

export const contentPaddingClassesFromAttributes = (option, attributes) => {
  const attributeName = contentPaddingAttributeName(option);
  const size = attributes[attributeName] ?? '';

  return size ? [`-content-padding-${size}`] : [];
};

export const displayPaddingSize = displayMarginSize;
export const storedPaddingSize = storedMarginSize;
export const resetPaddingSize = resetMarginSize;

/**
 * Migrate legacy top/bottom padding attrs or className into the uniform attribute.
 * Only returns updates when the value actually changes — never re-applies the default.
 */
export const migrateLegacyContentPaddingAttributes = (attributes, option) => {
  const attributeName = contentPaddingAttributeName(option);
  const current = attributes[attributeName];

  if (current !== undefined && current !== null) {
    return null;
  }

  const legacyTop =
    typeof attributes.contentPaddingTop === 'string' ? attributes.contentPaddingTop : '';
  const legacyBottom =
    typeof attributes.contentPaddingBottom === 'string' ? attributes.contentPaddingBottom : '';
  const fromClass = parsePaddingSizeFromClassName(attributes.className);

  if (legacyTop || legacyBottom) {
    return { [attributeName]: legacyTop || legacyBottom };
  }

  if (fromClass) {
    return { [attributeName]: fromClass };
  }

  // Attribute defaults (registerBlockType) cover new blocks; do not force-write here.
  return null;
};

export const contentPaddingAttributeKeys = (option) => [contentPaddingAttributeName(option)];
