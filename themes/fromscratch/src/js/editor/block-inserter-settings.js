const { Button } = wp.components;
const { useSelect, useDispatch } = wp.data;
const { createElement: el, useEffect, render, createRoot } = wp.element;

function getBlockInserterConfig() {
  return window.fromscratchBlockSettings || {};
}

function getHiddenBlocks() {
  const hidden = getBlockInserterConfig().hidden;
  return Array.isArray(hidden) ? hidden : [];
}

function getFavoriteBlocks() {
  const favorites = getBlockInserterConfig().favorites;
  return Array.isArray(favorites) ? favorites : [];
}

function getPreferencesScope() {
  return getBlockInserterConfig().preferencesScope || 'fromscratch';
}

function getPreferencesKey() {
  return getBlockInserterConfig().preferencesKey || 'showHiddenBlocks';
}

function getI18n() {
  return getBlockInserterConfig().i18n || {};
}

const hiddenBlockSnapshots = new Map();
let showHiddenInserterBlocks = false;
let toggleRoot = null;
let toggleHost = null;
let toggleMountPoint = null;

function cloneBlockType(blockType) {
  return {
    ...blockType,
    attributes: blockType.attributes ? { ...blockType.attributes } : blockType.attributes,
    supports: blockType.supports ? { ...blockType.supports } : blockType.supports,
    keywords: Array.isArray(blockType.keywords) ? [...blockType.keywords] : blockType.keywords,
  };
}

function cacheHiddenBlockSnapshots(hiddenBlocks) {
  hiddenBlocks.forEach((name) => {
    if (hiddenBlockSnapshots.has(name)) {
      return;
    }

    const blockType = wp.blocks.getBlockType(name);
    if (blockType) {
      hiddenBlockSnapshots.set(name, cloneBlockType(blockType));
    }
  });
}

function applyHiddenInserterState(show) {
  showHiddenInserterBlocks = Boolean(show);

  getHiddenBlocks().forEach((name) => {
    let source = hiddenBlockSnapshots.get(name) || wp.blocks.getBlockType(name);
    if (!source) {
      return;
    }

    if (!hiddenBlockSnapshots.has(name)) {
      hiddenBlockSnapshots.set(name, cloneBlockType(source));
      source = hiddenBlockSnapshots.get(name);
    }

    wp.blocks.unregisterBlockType(name);
    wp.blocks.registerBlockType(name, {
      ...source,
      supports: {
        ...source.supports,
        inserter: showHiddenInserterBlocks,
      },
    });
  });
}

function isInserterOpenedFromStore(select) {
  const editorStore = select('core/editor');
  if (editorStore && typeof editorStore.isInserterOpened === 'function') {
    return editorStore.isInserterOpened();
  }

  const editPostStore = select('core/edit-post');
  if (editPostStore && typeof editPostStore.isInserterOpened === 'function') {
    return editPostStore.isInserterOpened();
  }

  return false;
}

function findInserterMountPoint() {
  const search = document.querySelector('.block-editor-inserter__search');
  if (search && search.parentElement) {
    return search.parentElement;
  }

  const selectors = [
    '.editor-inserter-sidebar__content',
    '.editor-inserter-sidebar',
    '.block-editor-inserter__menu',
    '.block-editor-inserter__main-area',
    '.block-editor-tabbed-sidebar',
    '.interface-interface-skeleton__secondary-sidebar',
    '.block-editor-inserter__popover .components-popover__content',
  ];

  for (let i = 0; i < selectors.length; i += 1) {
    const node = document.querySelector(selectors[i]);
    if (node) {
      return node;
    }
  }

  return null;
}

function destroyToggleUi() {
  if (toggleRoot && typeof toggleRoot.unmount === 'function') {
    toggleRoot.unmount();
  }

  toggleRoot = null;

  if (toggleHost) {
    render(null, toggleHost);
    toggleHost.remove();
    toggleHost = null;
  }

  toggleMountPoint = null;
}

function ensureToggleHost(mountPoint) {
  if (toggleHost && toggleMountPoint === mountPoint) {
    return toggleHost;
  }

  destroyToggleUi();

  toggleMountPoint = mountPoint;
  toggleHost = document.createElement('div');
  toggleHost.className = 'fs-inserter-toggle-host';
  mountPoint.insertBefore(toggleHost, mountPoint.firstChild);

  return toggleHost;
}

function InserterToggleControl() {
  const preferencesScope = getPreferencesScope();
  const preferencesKey = getPreferencesKey();
  const i18n = getI18n();

  const showHidden = useSelect(
    (select) => select('core/preferences').get(preferencesScope, preferencesKey) ?? false,
    [preferencesScope, preferencesKey]
  );

  const { set } = useDispatch('core/preferences');

  useEffect(() => {
    applyHiddenInserterState(Boolean(showHidden));
  }, [showHidden]);

  return el(
    'div',
    { className: 'fs-inserter-toggle' },
    el(
      Button,
      {
        variant: showHidden ? 'primary' : 'secondary',
        size: 'compact',
        onClick: () => {
          const next = !showHidden;
          set(preferencesScope, preferencesKey, next);
          applyHiddenInserterState(next);
        },
        className: 'fs-inserter-toggle__button',
      },
      showHidden ? i18n.hideHiddenBlocks || 'Show fewer blocks' : i18n.showHiddenBlocks || 'Show all blocks'
    )
  );
}

function renderToggleUi() {
  if (!toggleHost) {
    return;
  }

  const tree = el(InserterToggleControl);

  if (typeof createRoot === 'function') {
    if (!toggleRoot) {
      toggleRoot = createRoot(toggleHost);
    }
    toggleRoot.render(tree);
    return;
  }

  render(tree, toggleHost);
}

function syncToggleUi() {
  const hiddenBlocks = getHiddenBlocks();

  if (!hiddenBlocks.length) {
    destroyToggleUi();
    return;
  }

  const isOpen = isInserterOpenedFromStore(wp.data.select);
  if (!isOpen) {
    destroyToggleUi();
    return;
  }

  const mountPoint = findInserterMountPoint();
  if (!mountPoint) {
    destroyToggleUi();
    return;
  }

  ensureToggleHost(mountPoint);
  renderToggleUi();
}

function applyFavoriteCategories() {
  const favoritesCategory = getBlockInserterConfig().favoritesCategory || 'fromscratch-favorites';

  getFavoriteBlocks().forEach((name) => {
    const blockType = wp.blocks.getBlockType(name);
    if (!blockType || blockType.category === favoritesCategory) {
      return;
    }

    wp.blocks.unregisterBlockType(name);
    wp.blocks.registerBlockType(name, {
      ...blockType,
      category: favoritesCategory,
    });
  });
}

wp.hooks.addFilter('blocks.registerBlockType', 'fromscratch/block-favorites', (settings, name) => {
  if (!getFavoriteBlocks().includes(name)) {
    return settings;
  }

  return {
    ...settings,
    category: getBlockInserterConfig().favoritesCategory || 'fromscratch-favorites',
  };
});

wp.hooks.addFilter('blocks.registerBlockType', 'fromscratch/block-hidden-default', (settings, name) => {
  if (!getHiddenBlocks().includes(name) || showHiddenInserterBlocks) {
    return settings;
  }

  return {
    ...settings,
    supports: {
      ...settings.supports,
      inserter: false,
    },
  };
});

function initBlockInserterSettings() {
  applyFavoriteCategories();

  const hiddenBlocks = getHiddenBlocks();

  if (hiddenBlocks.length) {
    cacheHiddenBlockSnapshots(hiddenBlocks);

    // Blocks can register slightly after domReady — retry once if needed.
    if (hiddenBlockSnapshots.size < hiddenBlocks.length) {
      window.setTimeout(() => {
        cacheHiddenBlockSnapshots(hiddenBlocks);
        const preferencesScope = getPreferencesScope();
        const preferencesKey = getPreferencesKey();
        const show = wp.data.select('core/preferences').get(preferencesScope, preferencesKey);
        applyHiddenInserterState(Boolean(show));
      }, 500);
    }

    const preferencesScope = getPreferencesScope();
    const preferencesKey = getPreferencesKey();
    const initialShow = wp.data.select('core/preferences').get(preferencesScope, preferencesKey);
    applyHiddenInserterState(Boolean(initialShow));

    const PluginDocumentSettingPanel = wp.editor && wp.editor.PluginDocumentSettingPanel;
    const { registerPlugin } = wp.plugins;

    if (PluginDocumentSettingPanel && registerPlugin) {
      registerPlugin('fromscratch/hidden-blocks-panel', {
        render: function HiddenBlocksPanel() {
          return el(
            PluginDocumentSettingPanel,
            {
              name: 'fromscratch-hidden-blocks',
              title: getI18n().hiddenBlocksPanel || 'Hidden blocks',
              className: 'fromscratch-hidden-blocks-panel',
            },
            el(InserterToggleControl)
          );
        },
      });
    }

    let frame = 0;
    const scheduleSync = () => {
      if (frame) {
        cancelAnimationFrame(frame);
      }
      frame = requestAnimationFrame(() => {
        frame = 0;
        syncToggleUi();
      });
    };

    wp.data.subscribe(scheduleSync);

    const observer = new MutationObserver(scheduleSync);
    observer.observe(document.body, { childList: true, subtree: true });

    scheduleSync();
  }
}

if (typeof wp.domReady === 'function') {
  wp.domReady(initBlockInserterSettings);
} else if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initBlockInserterSettings);
} else {
  initBlockInserterSettings();
}
