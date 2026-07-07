function getBlockInserterConfig() {
  return window.fromscratchBlockSettings || {};
}

function isVariationAllowed(blockName, slug, settings, defaultAllowed) {
  const blockSettings = settings[blockName] || {};
  if (Object.prototype.hasOwnProperty.call(blockSettings, slug)) {
    return Boolean(blockSettings[slug]);
  }

  return Boolean(defaultAllowed);
}

function applyBlockVariationSettings() {
  const config = getBlockInserterConfig();

  if (!wp.blocks || typeof wp.blocks.getBlockVariations !== 'function') {
    return;
  }

  const blocks = Array.isArray(config.blockVariationBlocks) ? config.blockVariationBlocks : [];
  const settings = config.blockVariationSettings || {};
  const defaultAllowed = config.blockVariationDefaultAllowed || {};
  const blockAllowed = config.blockVariationBlockAllowed || {};
  const hardDisallowed = config.blockVariationHardDisallowed || {};

  blocks.forEach((blockName) => {
    if (!blockAllowed[blockName]) {
      return;
    }

    const blockHardDisallowed = Array.isArray(hardDisallowed[blockName]) ? hardDisallowed[blockName] : [];

    blockHardDisallowed.forEach((slug) => {
      if (slug) {
        wp.blocks.unregisterBlockVariation(blockName, slug);
      }
    });

    const blockDefaultAllowed = defaultAllowed[blockName] !== undefined ? defaultAllowed[blockName] : true;

    wp.blocks.getBlockVariations(blockName).forEach((variation) => {
      const slug = variation.name;
      if (!slug || blockHardDisallowed.includes(slug)) {
        return;
      }

      if (!isVariationAllowed(blockName, slug, settings, blockDefaultAllowed)) {
        wp.blocks.unregisterBlockVariation(blockName, slug);
      }
    });
  });
}

function initBlockVariations() {
  applyBlockVariationSettings();

  const config = getBlockInserterConfig();
  const blocks = Array.isArray(config.blockVariationBlocks) ? config.blockVariationBlocks : [];
  const needsRetry = blocks.some((blockName) => {
    const variations = wp.blocks.getBlockVariations(blockName);
    return !variations || variations.length === 0;
  });

  if (needsRetry) {
    window.setTimeout(applyBlockVariationSettings, 500);
  }
}

if (typeof wp.domReady === 'function') {
  wp.domReady(initBlockVariations);
} else if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initBlockVariations);
} else {
  initBlockVariations();
}
