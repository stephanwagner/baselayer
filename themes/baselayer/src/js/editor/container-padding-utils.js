import {
  CONTAINER_MARGIN_SIZES,
  displayMarginSize,
  resetMarginSize,
  storedMarginSize,
} from './container-margin-utils';

export const containerPaddingSizesForOption = (option) => {
  const allowUnset = option.allowUnset === true;

  return allowUnset
    ? CONTAINER_MARGIN_SIZES
    : CONTAINER_MARGIN_SIZES.filter((size) => size.value !== 'unset');
};

const CONTAINER_PADDING_CLASS_TOKENS = ['none', 'xs', 's', 'm', 'l', 'xl'];

export const ALL_CONTAINER_PADDING_CLASSES = CONTAINER_PADDING_CLASS_TOKENS.flatMap((value) => [
  `-container-padding-${value}`,
  `-container-padding-top-${value}`,
  `-container-padding-bottom-${value}`,
]);

export const containerPaddingAttributeName = (option) => option.attributeName || 'containerPadding';

export const containerPaddingClassesFromAttributes = (option, attributes) => {
  const attributeName = containerPaddingAttributeName(option);
  const size = attributes[attributeName] ?? '';

  return size ? [`-container-padding-${size}`] : [];
};

export const displayPaddingSize = displayMarginSize;
export const storedPaddingSize = storedMarginSize;
export const resetPaddingSize = resetMarginSize;

export const containerPaddingAttributeKeys = (option) => [containerPaddingAttributeName(option)];
