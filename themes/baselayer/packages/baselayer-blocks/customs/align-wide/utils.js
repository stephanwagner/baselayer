/** Class applied when Inhaltsbreite → Erweitert. */
export const ALIGN_WIDE_CONTAINER_CLASS = 'container-wide';

/** Pads wide container content back to the content column. */
export const ALIGN_WIDE_CONTENT_CLASS = '-container-wide-content';

/** Every class name this control may add or replace. */
export const ALL_ALIGN_WIDE_CLASSES = [ALIGN_WIDE_CONTAINER_CLASS, ALIGN_WIDE_CONTENT_CLASS];

/** Class names implied by current align-wide attributes. */
export const alignWideClassesFromAttributes = (option, attributes) => {
  const { container, content } = option.attributeNames;
  const containerValue = attributes[container] ?? option.default ?? '';
  const classes = [];

  if (containerValue === ALIGN_WIDE_CONTAINER_CLASS) {
    classes.push(ALIGN_WIDE_CONTAINER_CLASS);
    if (option.showContentAlign !== false && attributes[content]) {
      classes.push(ALIGN_WIDE_CONTENT_CLASS);
    }
  }

  return classes;
};

export const alignWideAttributeKeys = (option) => {
  const { container, content } = option.attributeNames;
  return [container, content];
};
