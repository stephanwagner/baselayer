const GROUP_BLOCK = 'core/group';
const DEFAULT_LAYOUT = { type: 'default' };

/**
 * Default Group variation should not start as constrained.
 * Do not migrate layout in a BlockEdit useEffect — WordPress can re-apply
 * constrained and that causes a setState loop (React #185).
 */
wp.domReady(() => {
  if (!wp.blocks?.registerBlockVariation) {
    return;
  }

  wp.blocks.registerBlockVariation(GROUP_BLOCK, {
    name: 'group',
    title: wp.i18n.__('Group'),
    description: wp.i18n.__('Gather blocks in a container.'),
    attributes: { layout: DEFAULT_LAYOUT },
    isDefault: true,
    scope: ['block', 'inserter', 'transform'],
  });
});
