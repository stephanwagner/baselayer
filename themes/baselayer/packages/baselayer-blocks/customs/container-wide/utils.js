/** Class applied when Inhaltsbreite → Erweitert. */
export const ALIGN_WIDE_CONTAINER_CLASS = 'container-wide';

/** Pads wide container content back to the content column. */
export const ALIGN_WIDE_CONTENT_CLASS = '-container-wide-content';

/** Every class name this control may add or replace. */
export const ALL_ALIGN_WIDE_CLASSES = [ALIGN_WIDE_CONTAINER_CLASS, ALIGN_WIDE_CONTENT_CLASS];

/** Class names implied by current container-wide attributes. */
export const alignWideClassesFromAttributes = (option, attributes) => {
  const names = option.attributeNames || {};
  const container = names.container || 'alignWideContainer';
  const content = names.content || 'alignWideContent';
  const containerValue = attributes[container] ?? option.default ?? '';
  const classes = [];

  if (containerValue === ALIGN_WIDE_CONTAINER_CLASS) {
    classes.push(ALIGN_WIDE_CONTAINER_CLASS);
    if (option.showContentAlign && attributes[content]) {
      classes.push(ALIGN_WIDE_CONTENT_CLASS);
    }
  }

  return classes;
};

export const alignWideAttributeKeys = (option) => {
  const names = option.attributeNames || {};
  return [
    names.container || 'alignWideContainer',
    names.content || 'alignWideContent',
  ];
};
