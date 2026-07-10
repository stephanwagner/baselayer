wp.hooks.addFilter('blocks.registerBlockType', 'fromscratch/pullquote-default-background', (settings, name) => {
  if (name !== 'core/pullquote') {
    return settings;
  }

  settings.attributes = {
    ...settings.attributes,
    backgroundColor: {
      ...(settings.attributes?.backgroundColor || {}),
      type: 'string',
      default: 'gray-200',
    },
  };

  return settings;
});

wp.domReady(() => {
  // Image
  wp.blocks.unregisterBlockStyle('core/image', 'rounded');

  // Separator
  wp.blocks.unregisterBlockStyle('core/separator', 'default');
  wp.blocks.unregisterBlockStyle('core/separator', 'wide');
  wp.blocks.unregisterBlockStyle('core/separator', 'dots');

  // Rich text: remove unused formats from the block toolbar dropdown (Paragraph, Heading, etc.)
  const richText = wp.richText?.default || wp.richText || {};
  const { unregisterFormatType, unregisterFormatTypeInBlock } = richText;
  const richTextBlocks = ['core/paragraph', 'core/heading', 'core/list-item', 'core/button'];
  const disabledRichTextFormats = [
    'core/image', // Inline image
    'core/keyboard', // Keyboard input (DE: Tastatureingabe)
  ];

  disabledRichTextFormats.forEach((formatName) => {
    if (typeof unregisterFormatTypeInBlock === 'function') {
      richTextBlocks.forEach((blockName) => {
        unregisterFormatTypeInBlock(blockName, formatName);
      });
    } else if (typeof unregisterFormatType === 'function') {
      unregisterFormatType(formatName);
    }
  });
});

import './slider';
