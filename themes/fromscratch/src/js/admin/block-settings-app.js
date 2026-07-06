const { createElement: el, useState, useEffect, useMemo, Fragment } = wp.element;
const { getBlockType } = wp.blocks;
const { __, sprintf } = wp.i18n;

const BlockIcon = wp.blockEditor?.BlockIcon;

const getConfig = () => window.fromscratchBlockSettingsAdmin || {};

function useBlockIcon(blockName, serverIcon = null) {
  const readIcon = () => {
    if (typeof serverIcon === 'string' && serverIcon.trim().startsWith('<svg')) {
      return serverIcon;
    }

    const clientIcon = getBlockType(blockName)?.icon;
    return clientIcon || serverIcon || null;
  };

  const [icon, setIcon] = useState(readIcon);

  useEffect(() => {
    const sync = () => {
      const next = readIcon();
      setIcon((current) => (current === next ? current : next));
    };

    sync();

    if (!wp.data || typeof wp.data.subscribe !== 'function') {
      return undefined;
    }

    return wp.data.subscribe(sync);
  }, [blockName, serverIcon]);

  return icon;
}

function renderBlockIcon(icon) {
  if (typeof icon === 'string' && icon !== '') {
    if (icon.trim().startsWith('<svg')) {
      return el('span', {
        className: 'fs-block-settings__icon-svg',
        dangerouslySetInnerHTML: { __html: icon },
        'aria-hidden': 'true',
      });
    }

    const slug = icon.startsWith('dashicons-') ? icon : `dashicons-${icon}`;
    return el('span', { className: `dashicons ${slug}`, 'aria-hidden': 'true' });
  }

  if (icon && BlockIcon) {
    return el(BlockIcon, { icon, showColors: false });
  }

  return el('span', { className: 'dashicons dashicons-block-default', 'aria-hidden': 'true' });
}

function BlockTypeIcon({ blockName, serverIcon = null }) {
  const icon = useBlockIcon(blockName, serverIcon);

  return el(
    'span',
    { className: 'fs-block-settings__icon' },
    renderBlockIcon(icon),
  );
}

function getInitialSettings() {
  const config = getConfig();
  const settings = config.settings || {};
  const out = {};

  Object.keys(settings).forEach((name) => {
    const flags = settings[name] || {};
    out[name] = {
      allowed: Boolean(flags.allowed),
      hidden: Boolean(flags.hidden),
      favorite: Boolean(flags.favorite),
    };
  });

  return out;
}

function BlockCard({ block, flags, onChange }) {
  const config = getConfig();
  const i18n = config.i18n || {};
  const allowed = Boolean(flags.allowed);
  const mode = flags.hidden ? 'hidden' : (flags.favorite ? 'favorite' : '');

  const setMode = (nextMode) => {
    if (!allowed) {
      return;
    }

    onChange({
      allowed: true,
      hidden: nextMode === 'hidden',
      favorite: nextMode === 'favorite',
    });
  };

  const toggleAllowed = () => {
    if (allowed) {
      onChange({ allowed: false, hidden: false, favorite: false });
      return;
    }

    onChange({ allowed: true, hidden: false, favorite: false });
  };

  return el(
    'article',
    {
      className: `fs-block-card${allowed ? ' is-allowed' : ' is-disallowed'}`,
    },
    el(
      'div',
      { className: 'fs-block-card__top' },
      el(
        'div',
        { className: 'fs-block-card__identity' },
        el(
          'div',
          { className: 'fs-block-card__meta' },
          el('h4', { className: 'fs-block-card__title' }, block.title),
          el('code', { className: 'fs-block-card__slug' }, block.name),
        ),
      ),
      el(
        'button',
        {
          type: 'button',
          className: 'fs-block-card__allowed',
          title: i18n.allowedInInserter || '',
          'aria-pressed': allowed ? 'true' : 'false',
          onClick: toggleAllowed,
        },
        el(
          'span',
          { className: 'fs-block-card__allowed-btn', 'aria-hidden': 'true' },
          el(BlockTypeIcon, { blockName: block.name, serverIcon: block.icon }),
          el('span', { className: 'fs-block-card__allowed-slash', 'aria-hidden': 'true' }),
        ),
        el('span', { className: 'screen-reader-text' }, i18n.allowedInInserter || ''),
      ),
    ),
    el(
      'div',
      {
        className: `fs-block-card__modes${allowed ? '' : ' is-disabled'}`,
        role: 'group',
        'aria-label': i18n.inserterVisibility || '',
      },
      el(
        'button',
        {
          type: 'button',
          className: `fs-block-card__mode${mode === 'hidden' ? ' is-active' : ''}`,
          'aria-pressed': mode === 'hidden' ? 'true' : 'false',
          disabled: !allowed,
          onClick: () => setMode(mode === 'hidden' ? '' : 'hidden'),
        },
        el('span', { className: 'dashicons dashicons-hidden', 'aria-hidden': 'true' }),
        el('span', null, i18n.hidden || __('Hidden', 'fromscratch')),
      ),
      el(
        'button',
        {
          type: 'button',
          className: `fs-block-card__mode${mode === 'favorite' ? ' is-active' : ''}`,
          'aria-pressed': mode === 'favorite' ? 'true' : 'false',
          disabled: !allowed,
          onClick: () => setMode(mode === 'favorite' ? '' : 'favorite'),
        },
        el('span', { className: 'dashicons dashicons-star-filled', 'aria-hidden': 'true' }),
        el('span', null, i18n.favorites || __('Favorites', 'fromscratch')),
      ),
    ),
  );
}

function SystemBlockCard({ block }) {
  const config = getConfig();
  const i18n = config.i18n || {};

  return el(
    'article',
    { className: 'fs-block-card fs-block-card--system' },
    el(
      'div',
      { className: 'fs-block-card__top' },
      el(
        'div',
        { className: 'fs-block-card__identity' },
        el(BlockTypeIcon, { blockName: block.name, serverIcon: block.icon }),
        el(
          'div',
          { className: 'fs-block-card__meta' },
          el('h4', { className: 'fs-block-card__title' }, block.title),
          el('code', { className: 'fs-block-card__slug' }, block.name),
          el('p', { className: 'fs-block-card__system-note' }, i18n.hiddenBySystem || ''),
        ),
      ),
    ),
  );
}

function matchesSearch(block, search) {
  const needle = search.trim().toLowerCase();
  if (needle === '') {
    return true;
  }

  return `${block.title} ${block.name}`.toLowerCase().includes(needle);
}

function matchesFilters(blockName, settings, filters) {
  const flags = settings[blockName] || { allowed: true, hidden: false, favorite: false };

  if (filters.allowed === 'active' && !flags.allowed) {
    return false;
  }

  if (filters.allowed === 'inactive' && flags.allowed) {
    return false;
  }

  if (filters.hidden === 'hidden' && !(flags.allowed && flags.hidden)) {
    return false;
  }

  if (filters.hidden === 'not-hidden' && flags.hidden) {
    return false;
  }

  if (filters.favorite === 'favorite' && !(flags.allowed && !flags.hidden && flags.favorite)) {
    return false;
  }

  if (filters.favorite === 'not-favorite' && flags.favorite) {
    return false;
  }

  return true;
}

function renderDashicon(icon) {
  return el('span', { className: `dashicons ${icon}`, 'aria-hidden': 'true' });
}

function FilterGroup({ label, value, options, onChange }) {
  return el(
    'div',
    {
      className: 'fs-block-settings__filter',
      role: 'group',
      'aria-label': label,
    },
    options.map((option) => el(
      'button',
      {
        key: option.value,
        type: 'button',
        className: `fs-block-settings__filter-btn${value === option.value ? ' is-active' : ''}`,
        'aria-pressed': value === option.value ? 'true' : 'false',
        title: option.label,
        onClick: () => onChange(option.value),
      },
      renderDashicon(option.icon),
      el('span', { className: 'screen-reader-text' }, option.label),
    )),
  );
}

function filterGroups(groups, search, settings, filters) {
  return groups
    .map((group) => ({
      ...group,
      blocks: group.blocks.filter((block) => matchesSearch(block, search) && matchesFilters(block.name, settings, filters)),
    }))
    .filter((group) => group.blocks.length > 0);
}

function filterSystemBlocks(blocks, search) {
  return blocks.filter((block) => matchesSearch(block, search));
}

const DEFAULT_FILTERS = {
  allowed: 'all',
  hidden: 'all',
  favorite: 'all',
};

function BlockSettingsApp() {
  const config = getConfig();
  const i18n = config.i18n || {};
  const [settings, setSettings] = useState(getInitialSettings);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [systemOpen, setSystemOpen] = useState(false);

  const allowedFilterOptions = useMemo(() => ([
    { value: 'all', label: i18n.filterAll || __('All', 'fromscratch'), icon: 'dashicons-filter' },
    { value: 'active', label: i18n.filterActive || __('Active', 'fromscratch'), icon: 'dashicons-yes-alt' },
    { value: 'inactive', label: i18n.filterInactive || __('Inactive', 'fromscratch'), icon: 'dashicons-no-alt' },
  ]), [i18n]);

  const hiddenFilterOptions = useMemo(() => ([
    { value: 'all', label: i18n.filterAll || __('All', 'fromscratch'), icon: 'dashicons-filter' },
    { value: 'hidden', label: i18n.hidden || __('Hidden', 'fromscratch'), icon: 'dashicons-hidden' },
    { value: 'not-hidden', label: i18n.filterNotHidden || __('Not hidden', 'fromscratch'), icon: 'dashicons-visibility' },
  ]), [i18n]);

  const favoriteFilterOptions = useMemo(() => ([
    { value: 'all', label: i18n.filterAll || __('All', 'fromscratch'), icon: 'dashicons-filter' },
    { value: 'favorite', label: i18n.favorites || __('Favorites', 'fromscratch'), icon: 'dashicons-star-filled' },
    { value: 'not-favorite', label: i18n.filterNotFavorite || __('Not favorite', 'fromscratch'), icon: 'dashicons-star-empty' },
  ]), [i18n]);

  const configurableGroups = useMemo(
    () => filterGroups(config.configurableGroups || [], search, settings, filters),
    [config.configurableGroups, search, settings, filters],
  );

  const systemBlocks = useMemo(
    () => filterSystemBlocks(config.systemBlocks || [], search),
    [config.systemBlocks, search],
  );

  const hasVisibleBlocks = configurableGroups.some((group) => group.blocks.length > 0);

  const updateBlock = (name, nextFlags) => {
    setSettings((current) => ({
      ...current,
      [name]: nextFlags,
    }));
  };

  useEffect(() => {
    const form = document.getElementById('fs-block-settings-form');
    const jsonField = document.getElementById('fs-block-settings-json');
    if (!(form instanceof HTMLFormElement) || !(jsonField instanceof HTMLInputElement)) {
      return undefined;
    }

    const onSubmit = () => {
      jsonField.value = JSON.stringify(settings);
    };

    form.addEventListener('submit', onSubmit);
    return () => form.removeEventListener('submit', onSubmit);
  }, [settings]);

  return el(
    Fragment,
    null,
    el('h2', { className: 'title' }, __('Blocks', 'fromscratch')),
    el('p', { className: 'description fs-block-settings__intro' }, i18n.intro || ''),
    el(
      'div',
      { className: 'fs-block-settings__toolbar' },
      el(
        'div',
        { className: 'fs-block-settings__filters-row' },
        el('span', { className: 'fs-block-settings__filters-label' }, i18n.filtersLabel || __('Filters:', 'fromscratch')),
        el(
          'div',
          { className: 'fs-block-settings__filters' },
          el(FilterGroup, {
            label: i18n.filterAllowed || __('Allowed in inserter', 'fromscratch'),
            value: filters.allowed,
            options: allowedFilterOptions,
            onChange: (value) => setFilters((current) => ({ ...current, allowed: value })),
          }),
          el(FilterGroup, {
            label: i18n.filterHidden || __('Inserter visibility', 'fromscratch'),
            value: filters.hidden,
            options: hiddenFilterOptions,
            onChange: (value) => setFilters((current) => ({ ...current, hidden: value })),
          }),
          el(FilterGroup, {
            label: i18n.filterFavorite || __('Favorites', 'fromscratch'),
            value: filters.favorite,
            options: favoriteFilterOptions,
            onChange: (value) => setFilters((current) => ({ ...current, favorite: value })),
          }),
        ),
      ),
      el(
        'p',
        { className: 'fs-block-settings__search-wrap' },
        el('label', { className: 'screen-reader-text', htmlFor: 'fs-block-settings-search' }, i18n.searchPlaceholder || ''),
        el('input', {
          type: 'search',
          id: 'fs-block-settings-search',
          className: 'regular-text',
          placeholder: i18n.searchPlaceholder || '',
          value: search,
          onInput: (event) => setSearch(event.target.value),
        }),
      ),
    ),
    !hasVisibleBlocks && el('p', { className: 'fs-block-settings__empty' }, i18n.noResults || __('No blocks match the current search or filters.', 'fromscratch')),
    configurableGroups.map((group) => el(
      'section',
      { key: group.category, className: 'fs-block-settings__group' },
      el('h3', { className: 'fs-block-settings__category' }, group.label),
      el(
        'div',
        { className: 'fs-block-settings__grid' },
        group.blocks.map((block) => {
          const flags = settings[block.name] || { allowed: true, hidden: false, favorite: false };
          return el(BlockCard, {
            key: block.name,
            block,
            flags,
            onChange: (nextFlags) => updateBlock(block.name, nextFlags),
          });
        }),
      ),
    )),
    systemBlocks.length > 0 && el(
      'div',
      { className: 'fs-block-settings__system' },
      el(
        'button',
        {
          type: 'button',
          className: `button button-secondary fs-block-settings__system-toggle${systemOpen ? ' is-open' : ''}`,
          'aria-expanded': systemOpen ? 'true' : 'false',
          'aria-controls': 'fs-block-settings-system-panel',
          onClick: () => setSystemOpen((open) => !open),
        },
        sprintf(
          i18n.systemBlocksToggle || _n('%d block hidden by system', '%d blocks hidden by system', systemBlocks.length, 'fromscratch'),
          systemBlocks.length,
        ),
      ),
      systemOpen && el(
        'div',
        { id: 'fs-block-settings-system-panel', className: 'fs-block-settings__system-panel' },
        el('p', { className: 'description' }, i18n.systemBlocksDescription || ''),
        el(
          'div',
          { className: 'fs-block-settings__system-grid' },
          systemBlocks.map((block) => el(SystemBlockCard, { key: block.name, block })),
        ),
      ),
    ),
    el(
      'div',
      { className: 'fs-submit-row' },
      el('button', { type: 'submit', className: 'button button-primary' }, i18n.save || __('Save Changes', 'fromscratch')),
    ),
  );
}

function mountBlockSettingsApp() {
  const rootEl = document.getElementById('fs-block-settings-app');
  if (!rootEl) {
    return;
  }

  if (wp.element.createRoot) {
    wp.element.createRoot(rootEl).render(el(BlockSettingsApp));
    return;
  }

  if (typeof wp.element.render === 'function') {
    wp.element.render(el(BlockSettingsApp), rootEl);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountBlockSettingsApp);
} else {
  mountBlockSettingsApp();
}
