import { ALIGN_WIDE_CONTAINER_CLASS } from '../container-wide/utils';

/** Class applied when “Align content to content column” is on. */
export const CONTENT_TO_CONTAINER_CLASS = '-content-to-container';

/** Padding size tokens (UI value → stored class / empty for unset). */
export const INNER_PADDING_SIZES = [
  { value: 'unset', label: '—', stored: '' },
  { value: 'auto', label: 'A', stored: '-container-padding-auto' },
  { value: 'none', label: '0', stored: '-container-padding-none' },
  { value: 'xs', label: 'XS', stored: '-container-padding-xs' },
  { value: 's', label: 'S', stored: '-container-padding-s' },
  { value: 'm', label: 'M', stored: '-container-padding-m' },
  { value: 'l', label: 'L', stored: '-container-padding-l' },
  { value: 'xl', label: 'XL', stored: '-container-padding-xl' },
];

const STORED_BY_UI = Object.fromEntries(INNER_PADDING_SIZES.map((s) => [s.value, s.stored]));
const UI_BY_STORED = Object.fromEntries(
  INNER_PADDING_SIZES.filter((s) => s.stored !== '').map((s) => [s.stored, s.value])
);
// Legacy / seed “unset” class → empty attribute.
UI_BY_STORED['-container-padding-unset'] = 'unset';

/** Every class this control may add or replace. */
export const ALL_INNER_PADDING_CLASSES = [
  ...INNER_PADDING_SIZES.map((s) => s.stored).filter(Boolean),
  '-container-padding-unset',
  CONTENT_TO_CONTAINER_CLASS,
];

export const displayInnerPadding = (stored) => {
  if (!stored) {
    return 'unset';
  }
  return UI_BY_STORED[stored] || 'unset';
};

export const storedInnerPadding = (uiValue) => STORED_BY_UI[uiValue] ?? '';

/**
 * Content-column align only makes sense when the block is wider than content.
 * Gates on Baselayer Inhaltsbreite (container-wide) or WP align wide/full.
 *
 * @param {object} attributes
 */
export const innerPaddingAllowsContentAlign = (attributes) => {
  const containerValue = attributes.alignWideContainer ?? '';
  const align = attributes.align ?? '';
  return (
    containerValue === ALIGN_WIDE_CONTAINER_CLASS ||
    align === 'wide' ||
    align === 'full'
  );
};

/**
 * @param {object} option
 * @param {object} attributes
 * @param {{ isRootBlock?: boolean }} [ctx]
 */
export const innerPaddingClassesFromAttributes = (option, attributes, ctx = {}) => {
  const isRootBlock = ctx.isRootBlock !== false;
  const names = option.attributeNames || {};
  const padding = names.padding || 'containerPadding';
  const contentAlign = names.contentAlign || 'alignContentToContainer';
  const classes = [];

  const value = attributes[padding] ?? option.default ?? '';
  if (value && value !== '-container-padding-unset') {
    classes.push(value);
  }

  if (
    option.showContentAlign &&
    isRootBlock &&
    innerPaddingAllowsContentAlign(attributes) &&
    attributes[contentAlign]
  ) {
    classes.push(CONTENT_TO_CONTAINER_CLASS);
  }

  return classes;
};

export const innerPaddingAttributeKeys = (option) => {
  const names = option.attributeNames || {};
  return [
    names.padding || 'containerPadding',
    names.contentAlign || 'alignContentToContainer',
    // Width gates for content-align class sync (owned by container-wide / core).
    'alignWideContainer',
    'align',
  ];
};
