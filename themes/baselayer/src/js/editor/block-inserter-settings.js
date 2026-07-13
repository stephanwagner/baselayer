const { Button } = wp.components;
const { useSelect, useDispatch } = wp.data;
const { createElement: el, useEffect, render, createRoot } = wp.element;

function getBlockInserterConfig() {
  return window.baselayerBlockSettings || {};
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
  return getBlockInserterConfig().preferencesScope || 'baselayer';
}

function getPreferencesKey() {
  return getBlockInserterConfig().preferencesKey || 'showHiddenBlocks';
}

function getI18n() {
  return getBlockInserterConfig().i18n || {};
}

function initEditorPreferenceDefaults() {
  const preferences = wp.data?.dispatch?.('core/preferences');
  if (!preferences || typeof preferences.setDefaults !== 'function') {
    return;
  }

  preferences.setDefaults('core', {
    mostUsedBlocks: true,
  });
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

const TOGGLE_MOUNT_CLASS = 'bl-inserter-has-toggle';

function findInserterSearchRoot() {
  const inserterRoot = document.querySelector(
    '.editor-inserter-sidebar, .block-editor-inserter__menu'
  );

  if (!inserterRoot || !isBlocksInserterTabActive(inserterRoot)) {
    return null;
  }

  const selectors = [
    '.block-editor-inserter__search',
    '.editor-inserter-sidebar .block-editor-inserter__search',
  ];

  for (let i = 0; i < selectors.length; i += 1) {
    const node = inserterRoot.querySelector(selectors[i]);
    if (node) {
      return node;
    }
  }

  return null;
}

function isBlocksInserterTabActive(inserterRoot) {
  const selectedTab = inserterRoot.querySelector('[role="tab"][aria-selected="true"]');
  if (!selectedTab) {
    return true;
  }

  const tabId = selectedTab.getAttribute('id') || '';
  const tabLabel = (selectedTab.textContent || '').trim().toLowerCase();

  return tabId.includes('blocks')
    || tabLabel === 'blocks'
    || tabLabel === 'blöcke';
}

function findInserterSearchControl(searchRoot) {
  if (!searchRoot) {
    return null;
  }

  for (let i = 0; i < searchRoot.children.length; i += 1) {
    const child = searchRoot.children[i];
    if (child.classList.contains('bl-inserter-toggle-host')) {
      continue;
    }

    if (child.querySelector('input[type="search"], input[type="text"]')) {
      return child;
    }
  }

  return (
    searchRoot.querySelector('.components-base-control.components-input-control')
    || searchRoot.querySelector('.components-search-control')
    || searchRoot.querySelector('.components-base-control')
  );
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

  if (toggleMountPoint) {
    toggleMountPoint.classList.remove(TOGGLE_MOUNT_CLASS);
    toggleMountPoint.classList.remove('bl-inserter-search-row');
    toggleMountPoint = null;
  }
}

function ensureToggleHost(searchRoot) {
  const searchControl = findInserterSearchControl(searchRoot);
  if (!searchControl) {
    return null;
  }

  searchRoot.classList.add(TOGGLE_MOUNT_CLASS);

  if (toggleHost && toggleMountPoint === searchRoot && toggleHost.parentElement === searchRoot) {
    if (searchControl.nextElementSibling !== toggleHost) {
      searchControl.insertAdjacentElement('afterend', toggleHost);
    }
    return toggleHost;
  }

  destroyToggleUi();

  toggleMountPoint = searchRoot;
  toggleHost = document.createElement('div');
  toggleHost.className = 'bl-inserter-toggle-host';
  searchControl.insertAdjacentElement('afterend', toggleHost);

  return toggleHost;
}

function InserterToggleControl() {
  const preferencesScope = getPreferencesScope();
  const preferencesKey = getPreferencesKey();
  const i18n = getI18n();
  const label = i18n.showAllBlocks || 'All blocks';

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
    { className: 'bl-inserter-toggle' },
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
        className: 'bl-inserter-toggle__button',
        'aria-pressed': showHidden,
      },
      el('span', {
        className: 'bl-icon -icon-' + (showHidden ? 'checkbox-checked' : 'checkbox'),
        'aria-hidden': 'true',
      }),
      el('span', { className: 'bl-inserter-toggle__label' }, label),
    ),
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

  const searchRoot = findInserterSearchRoot();
  if (!searchRoot) {
    destroyToggleUi();
    return;
  }

  const host = ensureToggleHost(searchRoot);
  if (!host) {
    destroyToggleUi();
    return;
  }

  renderToggleUi();
}

function applyFavoriteCategories() {
  const favoritesCategory = getBlockInserterConfig().favoritesCategory || 'baselayer-favorites';

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

wp.hooks.addFilter('blocks.registerBlockType', 'baselayer/block-favorites', (settings, name) => {
  if (!getFavoriteBlocks().includes(name)) {
    return settings;
  }

  return {
    ...settings,
    category: getBlockInserterConfig().favoritesCategory || 'baselayer-favorites',
  };
});

wp.hooks.addFilter('blocks.registerBlockType', 'baselayer/block-hidden-default', (settings, name) => {
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
  initEditorPreferenceDefaults();
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
