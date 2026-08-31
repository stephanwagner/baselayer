import { ALIGN_WIDE_CONTAINER_CLASS } from '../container-wide/utils';

/** Class applied when “Align content to content column” is on. */
export const CONTENT_TO_CONTAINER_CLASS = '-content-to-container';

/** Padding size tokens (UI / stored attribute → CSS class). */
export const INNER_PADDING_SIZES = [
  { value: 'unset', label: '—', className: '' },
  { value: 'auto', label: 'A', className: '-container-padding-auto' },
  { value: 'none', label: '0', className: '-container-padding-none' },
  { value: 'xs', label: 'XS', className: '-container-padding-xs' },
  { value: 's', label: 'S', className: '-container-padding-s' },
  { value: 'm', label: 'M', className: '-container-padding-m' },
  { value: 'l', label: 'L', className: '-container-padding-l' },
  { value: 'xl', label: 'XL', className: '-container-padding-xl' },
];

const CLASS_BY_TOKEN = Object.fromEntries(
  INNER_PADDING_SIZES.filter((s) => s.className).map((s) => [s.value, s.className])
);
const TOKEN_BY_CLASS = Object.fromEntries(
  INNER_PADDING_SIZES.filter((s) => s.className).map((s) => [s.className, s.value])
);
const TOKEN_VALUES = new Set(INNER_PADDING_SIZES.map((s) => s.value).filter((v) => v !== 'unset'));
// Legacy / seed “unset” class → empty attribute.
TOKEN_BY_CLASS['-container-padding-unset'] = 'unset';

/** Every class this control may add or replace. */
export const ALL_INNER_PADDING_CLASSES = [
  ...INNER_PADDING_SIZES.map((s) => s.className).filter(Boolean),
  '-container-padding-unset',
  CONTENT_TO_CONTAINER_CLASS,
];

/** CSS class for a stored token or a legacy class-valued attribute. */
export const paddingClassFromStored = (stored) => {
  if (!stored || stored === 'unset' || stored === '-container-padding-unset') {
    return '';
  }
  if (CLASS_BY_TOKEN[stored]) {
    return CLASS_BY_TOKEN[stored];
  }
  if (TOKEN_BY_CLASS[stored]) {
    return stored;
  }
  return '';
};

/** UI value for a stored token or a legacy class. */
export const displayInnerPadding = (stored) => {
  if (!stored) {
    return 'unset';
  }
  if (TOKEN_BY_CLASS[stored]) {
    return TOKEN_BY_CLASS[stored];
  }
  if (TOKEN_VALUES.has(stored)) {
    return stored;
  }
  return 'unset';
};

/** Persist the UI token (`m`, `auto`, …); unset → empty. */
export const storedInnerPadding = (uiValue) => (uiValue === 'unset' ? '' : uiValue || '');

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
  const className = paddingClassFromStored(value);
  if (className) {
    classes.push(className);
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
