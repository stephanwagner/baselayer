const DEFAULT_LAYOUT = { type: 'default' };

/**
 * Default Group/Cover should not start as constrained.
 * Do not migrate layout in a BlockEdit useEffect — WordPress can re-apply
 * constrained and that causes a setState loop (React #185).
 */
wp.domReady(() => {
  if (!wp.blocks?.registerBlockVariation) {
    return;
  }

  wp.blocks.registerBlockVariation('core/group', {
    name: 'group',
    title: wp.i18n.__('Group'),
    description: wp.i18n.__('Gather blocks in a container.'),
    attributes: { layout: DEFAULT_LAYOUT },
    isDefault: true,
    scope: ['block', 'inserter', 'transform'],
  });

  wp.blocks.registerBlockVariation('core/cover', {
    name: 'cover',
    title: wp.i18n.__('Cover'),
    description: wp.i18n.__('Add an image or video with a text overlay.'),
    attributes: { layout: DEFAULT_LAYOUT },
    isDefault: true,
    scope: ['block', 'inserter', 'transform'],
  });
});
