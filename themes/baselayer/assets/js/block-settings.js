(() => {
  // themes/baselayer/src/js/admin/block-settings-app.js
  var { createElement: el, useState, useEffect, useMemo, Fragment, createInterpolateElement } = wp.element;
  var { getBlockType } = wp.blocks;
  var { __, sprintf } = wp.i18n;
  var BlockIcon = wp.blockEditor?.BlockIcon;
  var getConfig = () => window.baselayerBlockSettingsAdmin || {};
  function useBlockIcon(blockName, serverIcon = null) {
    const readIcon = () => {
      if (typeof serverIcon === "string" && serverIcon.trim().startsWith("<svg")) {
        return serverIcon;
      }
      const clientIcon = getBlockType(blockName)?.icon;
      return clientIcon || serverIcon || null;
    };
    const [icon, setIcon] = useState(readIcon);
    useEffect(() => {
      const sync = () => {
        const next = readIcon();
        setIcon((current) => current === next ? current : next);
      };
      sync();
      if (!wp.data || typeof wp.data.subscribe !== "function") {
        return void 0;
      }
      return wp.data.subscribe(sync);
    }, [blockName, serverIcon]);
    return icon;
  }
  function renderBlockIcon(icon) {
    if (typeof icon === "string" && icon !== "") {
      if (icon.trim().startsWith("<svg")) {
        return el("span", {
          className: "bl-block-settings__icon-svg",
          dangerouslySetInnerHTML: { __html: icon },
          "aria-hidden": "true"
        });
      }
      const slug = icon.startsWith("dashicons-") ? icon : `dashicons-${icon}`;
      return el("span", { className: `dashicons ${slug}`, "aria-hidden": "true" });
    }
    if (icon && BlockIcon) {
      return el(BlockIcon, { icon, showColors: false });
    }
    return el("span", { className: "dashicons dashicons-block-default", "aria-hidden": "true" });
  }
  function BlockTypeIcon({ blockName, serverIcon = null }) {
    const icon = useBlockIcon(blockName, serverIcon);
    return el("span", { className: "bl-block-settings__icon" }, renderBlockIcon(icon));
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
        favorite: Boolean(flags.favorite)
      };
    });
    return out;
  }
  function getBlockVariationsForBlock(blockName) {
    if (!wp.blocks || typeof wp.blocks.getBlockVariations !== "function") {
      return [];
    }
    const variations = wp.blocks.getBlockVariations(blockName) || [];
    return [...variations].filter((variation) => Boolean(variation.name)).sort((a, b) => {
      const titleA = (a.title || a.name || "").toString();
      const titleB = (b.title || b.name || "").toString();
      return titleA.localeCompare(titleB, void 0, { sensitivity: "base" });
    });
  }
  function getConfiguredVariationBlocks() {
    const config = getConfig();
    return Array.isArray(config.blockVariationBlocks) ? config.blockVariationBlocks : [];
  }
  function isVariationHardDisallowed(blockName, slug) {
    const list = getConfig().blockVariationHardDisallowed?.[blockName] || [];
    return Array.isArray(list) && list.includes(slug);
  }
  function resolveVariationAllowed(blockName, slug, settings, config) {
    if (isVariationHardDisallowed(blockName, slug)) {
      return false;
    }
    const blockSettings = settings[blockName] || {};
    if (Object.prototype.hasOwnProperty.call(blockSettings, slug)) {
      return Boolean(blockSettings[slug]?.allowed);
    }
    const defaults = config.blockVariationDefaults?.[blockName] || {};
    if (Object.prototype.hasOwnProperty.call(defaults, slug)) {
      return Boolean(defaults[slug]?.allowed);
    }
    const defaultAllowed = config.blockVariationDefaultAllowed?.[blockName];
    return defaultAllowed !== void 0 ? Boolean(defaultAllowed) : true;
  }
  function getInitialVariationSettings(variationRegistry) {
    const config = getConfig();
    const saved = config.blockVariationSettings || {};
    const out = {};
    getConfiguredVariationBlocks().forEach((blockName) => {
      out[blockName] = {};
      (variationRegistry[blockName] || []).forEach((variation) => {
        const slug = variation.name;
        out[blockName][slug] = {
          allowed: resolveVariationAllowed(blockName, slug, saved, config)
        };
      });
    });
    return out;
  }
  function VariationCard({ blockName, variation, allowed, parentAllowed, onChange }) {
    const config = getConfig();
    const i18n = config.i18n || {};
    const title = variation.title || variation.name;
    const slug = variation.name;
    const interactive = Boolean(parentAllowed);
    return el(
      "article",
      {
        className: `bl-block-card bl-block-card--variation${allowed && parentAllowed ? " is-allowed" : " is-disallowed"}${parentAllowed ? "" : " is-parent-disabled"}`
      },
      el(
        "div",
        { className: "bl-block-card__top" },
        el(
          "div",
          { className: "bl-block-card__identity" },
          el("span", { className: "bl-block-settings__icon" }, renderBlockIcon(variation.icon)),
          el(
            "div",
            { className: "bl-block-card__meta" },
            el("h4", { className: "bl-block-card__title" }, title),
            el("code", { className: "bl-block-card__slug" }, `${blockName}/${slug}`)
          )
        ),
        el(
          "button",
          {
            type: "button",
            className: "bl-block-card__allowed",
            title: interactive ? i18n.allowedInInserter || "" : i18n.parentBlockDisabled || "",
            "aria-pressed": allowed && parentAllowed ? "true" : "false",
            disabled: !interactive,
            onClick: () => {
              if (!interactive) {
                return;
              }
              onChange({ allowed: !allowed });
            }
          },
          el(
            "span",
            { className: "bl-block-card__allowed-btn", "aria-hidden": "true" },
            el("span", { className: "dashicons dashicons-randomize", "aria-hidden": "true" }),
            el("span", { className: "bl-block-card__allowed-slash", "aria-hidden": "true" })
          ),
          el("span", { className: "screen-reader-text" }, i18n.allowedInInserter || "")
        )
      )
    );
  }
  function BlockCard({ block, flags, onChange }) {
    const config = getConfig();
    const i18n = config.i18n || {};
    const allowed = Boolean(flags.allowed);
    const mode = flags.hidden ? "hidden" : flags.favorite ? "favorite" : "";
    const setMode = (nextMode) => {
      if (!allowed) {
        return;
      }
      onChange({
        allowed: true,
        hidden: nextMode === "hidden",
        favorite: nextMode === "favorite"
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
      "article",
      {
        className: [
          "bl-block-card",
          allowed ? "is-allowed" : "is-disallowed",
          allowed && mode === "hidden" ? "is-mode-hidden" : "",
          allowed && mode === "favorite" ? "is-mode-favorite" : ""
        ].filter(Boolean).join(" ")
      },
      el(
        "div",
        { className: "bl-block-card__top" },
        el(
          "div",
          { className: "bl-block-card__identity" },
          el(
            "div",
            { className: "bl-block-card__meta" },
            el("h4", { className: "bl-block-card__title" }, block.title),
            el("code", { className: "bl-block-card__slug" }, block.name)
          )
        ),
        el(
          "button",
          {
            type: "button",
            className: "bl-block-card__allowed",
            title: i18n.allowedInInserter || "",
            "aria-pressed": allowed ? "true" : "false",
            onClick: toggleAllowed
          },
          el(
            "span",
            { className: "bl-block-card__allowed-btn", "aria-hidden": "true" },
            el(BlockTypeIcon, { blockName: block.name, serverIcon: block.icon }),
            el("span", { className: "bl-block-card__allowed-slash", "aria-hidden": "true" })
          ),
          el("span", { className: "screen-reader-text" }, i18n.allowedInInserter || "")
        )
      ),
      el(
        "div",
        {
          className: `bl-block-card__modes${allowed ? "" : " is-disabled"}`,
          role: "group",
          "aria-label": i18n.inserterVisibility || ""
        },
        el(
          "button",
          {
            type: "button",
            className: `bl-block-card__mode bl-block-card__mode--hidden${mode === "hidden" ? " is-active" : ""}`,
            "aria-pressed": mode === "hidden" ? "true" : "false",
            disabled: !allowed,
            onClick: () => setMode(mode === "hidden" ? "" : "hidden")
          },
          el("span", { className: "dashicons dashicons-hidden", "aria-hidden": "true" }),
          el("span", null, i18n.hidden || __("Hidden", "baselayer"))
        ),
        el(
          "button",
          {
            type: "button",
            className: `bl-block-card__mode bl-block-card__mode--favorite${mode === "favorite" ? " is-active" : ""}`,
            "aria-pressed": mode === "favorite" ? "true" : "false",
            disabled: !allowed,
            onClick: () => setMode(mode === "favorite" ? "" : "favorite")
          },
          el("span", { className: "dashicons dashicons-star-filled", "aria-hidden": "true" }),
          el("span", null, i18n.favorite || __("Favorite", "baselayer"))
        )
      )
    );
  }
  function SystemBlockCard({ block }) {
    const config = getConfig();
    const i18n = config.i18n || {};
    return el(
      "article",
      { className: "bl-block-card bl-block-card--system" },
      el(
        "div",
        { className: "bl-block-card__top" },
        el(
          "div",
          { className: "bl-block-card__identity" },
          el(BlockTypeIcon, { blockName: block.name, serverIcon: block.icon }),
          el(
            "div",
            { className: "bl-block-card__meta" },
            el("h4", { className: "bl-block-card__title" }, block.title),
            el("code", { className: "bl-block-card__slug" }, block.name),
            el("p", { className: "bl-block-card__system-note" }, i18n.hiddenBySystem || "")
          )
        )
      )
    );
  }
  function SystemVariationCard({ blockName, variation }) {
    const config = getConfig();
    const i18n = config.i18n || {};
    const title = variation.title || variation.name;
    const slug = variation.name;
    return el(
      "article",
      { className: "bl-block-card bl-block-card--variation bl-block-card--system" },
      el(
        "div",
        { className: "bl-block-card__top" },
        el(
          "div",
          { className: "bl-block-card__identity" },
          el("span", { className: "bl-block-settings__icon" }, renderBlockIcon(variation.icon)),
          el(
            "div",
            { className: "bl-block-card__meta" },
            el("h4", { className: "bl-block-card__title" }, title),
            el("code", { className: "bl-block-card__slug" }, `${blockName}/${slug}`),
            el("p", { className: "bl-block-card__system-note" }, i18n.hiddenBySystem || "")
          )
        )
      )
    );
  }
  function SystemBlocksHelp({ help, i18n }) {
    if (!help || !help.type) {
      return null;
    }
    if (help.type === "developer") {
      return el(
        "p",
        { className: "description" },
        createInterpolateElement(
          i18n.systemBlocksHelpDeveloper || __("To change this list, edit <filepath/> (<configkey/>) in the theme.", "baselayer"),
          {
            filepath: el("code", null, help.configPath || "config/block-settings.php"),
            configkey: el("code", null, help.configKey || "hardDisallowed")
          }
        )
      );
    }
    if (help.type === "admin") {
      return el(
        "p",
        { className: "description" },
        i18n.systemBlocksHelpAdmin || __("You can ask a developer to unlock these blocks:", "baselayer"),
        help.email ? [" ", el("a", { key: "email", href: `mailto:${help.email}` }, help.email)] : null
      );
    }
    return null;
  }
  function matchesSearch(block, search) {
    const needle = search.trim().toLowerCase();
    if (needle === "") {
      return true;
    }
    return `${block.title} ${block.name}`.toLowerCase().includes(needle);
  }
  function matchesFilters(blockName, settings, filters) {
    const flags = settings[blockName] || { allowed: true, hidden: false, favorite: false };
    if (filters.allowed === "active" && !flags.allowed) {
      return false;
    }
    if (filters.allowed === "inactive" && flags.allowed) {
      return false;
    }
    if (filters.hidden === "hidden" && !(flags.allowed && flags.hidden)) {
      return false;
    }
    if (filters.hidden === "not-hidden" && flags.hidden) {
      return false;
    }
    if (filters.favorite === "favorite" && !(flags.allowed && !flags.hidden && flags.favorite)) {
      return false;
    }
    if (filters.favorite === "not-favorite" && flags.favorite) {
      return false;
    }
    return true;
  }
  function renderDashicon(icon) {
    return el("span", { className: `dashicons ${icon}`, "aria-hidden": "true" });
  }
  function FilterGroup({ label, value, options, onChange }) {
    return el(
      "div",
      {
        className: "bl-block-settings__filter",
        role: "group",
        "aria-label": label
      },
      options.map(
        (option) => el(
          "button",
          {
            key: option.value,
            type: "button",
            className: `bl-block-settings__filter-icon${value === option.value ? " is-active" : ""}`,
            "aria-pressed": value === option.value ? "true" : "false",
            "aria-label": option.label,
            onClick: () => onChange(option.value)
          },
          renderDashicon(option.icon),
          el("span", { className: "bl-block-settings__filter-tip", "aria-hidden": "true" }, option.label)
        )
      )
    );
  }
  function matchesVariationSearch(blockName, variation, search) {
    const needle = search.trim().toLowerCase();
    if (needle === "") {
      return true;
    }
    const haystack = `${variation.title || ""} ${variation.name || ""} ${blockName}`.toLowerCase();
    return haystack.includes(needle);
  }
  function getEffectiveVariationAllowed(blockName, slug, settings, variationSettings) {
    if (isVariationHardDisallowed(blockName, slug)) {
      return false;
    }
    const parentAllowed = Boolean((settings[blockName] || { allowed: true }).allowed);
    const variationAllowed = Boolean((variationSettings[blockName] || {})[slug]?.allowed);
    return parentAllowed && variationAllowed;
  }
  function matchesVariationFilters(blockName, slug, settings, variationSettings, filters) {
    const effectiveAllowed = getEffectiveVariationAllowed(blockName, slug, settings, variationSettings);
    if (filters.allowed === "active" && !effectiveAllowed) {
      return false;
    }
    if (filters.allowed === "inactive" && effectiveAllowed) {
      return false;
    }
    if (filters.hidden !== "all" || filters.favorite !== "all") {
      return false;
    }
    return true;
  }
  function buildCategoryItems(group, variationRegistry) {
    const items = [];
    group.blocks.forEach((block) => {
      items.push({ kind: "block", block });
      if (!getConfiguredVariationBlocks().includes(block.name)) {
        return;
      }
      (variationRegistry[block.name] || []).forEach((variation) => {
        if (isVariationHardDisallowed(block.name, variation.name)) {
          return;
        }
        items.push({
          kind: "variation",
          blockName: block.name,
          variation
        });
      });
    });
    return items;
  }
  function filterCategoryItems(items, search, settings, variationSettings, filters) {
    return items.filter((item) => {
      if (item.kind === "block") {
        return matchesSearch(item.block, search) && matchesFilters(item.block.name, settings, filters);
      }
      return matchesVariationSearch(item.blockName, item.variation, search) && matchesVariationFilters(item.blockName, item.variation.name, settings, variationSettings, filters);
    });
  }
  function filterGroups(groups, search, settings, filters, variationRegistry, variationSettings) {
    return groups.map((group) => ({
      ...group,
      items: filterCategoryItems(buildCategoryItems(group, variationRegistry), search, settings, variationSettings, filters)
    })).filter((group) => group.items.length > 0);
  }
  function filterSystemBlocks(blocks, search) {
    return blocks.filter((block) => matchesSearch(block, search));
  }
  function buildSystemVariations(variationRegistry, search) {
    const items = [];
    const hardDisallowedByBlock = getConfig().blockVariationHardDisallowed || {};
    getConfiguredVariationBlocks().forEach((blockName) => {
      const slugs = Array.isArray(hardDisallowedByBlock[blockName]) ? hardDisallowedByBlock[blockName] : [];
      if (slugs.length === 0) {
        return;
      }
      const variationsBySlug = {};
      (variationRegistry[blockName] || []).forEach((variation) => {
        variationsBySlug[variation.name] = variation;
      });
      slugs.forEach((slug) => {
        const variation = variationsBySlug[slug] || { name: slug, title: slug };
        if (!matchesVariationSearch(blockName, variation, search)) {
          return;
        }
        items.push({ blockName, variation });
      });
    });
    return items.sort((a, b) => {
      const titleA = (a.variation.title || a.variation.name || "").toString();
      const titleB = (b.variation.title || b.variation.name || "").toString();
      return titleA.localeCompare(titleB, void 0, { sensitivity: "base" });
    });
  }
  var DEFAULT_FILTERS = {
    allowed: "all",
    hidden: "all",
    favorite: "all"
  };
  function BlockSettingsApp() {
    const config = getConfig();
    const i18n = config.i18n || {};
    const [settings, setSettings] = useState(getInitialSettings);
    const [variationRegistry, setVariationRegistry] = useState(() => {
      const registry = {};
      getConfiguredVariationBlocks().forEach((blockName) => {
        registry[blockName] = getBlockVariationsForBlock(blockName);
      });
      return registry;
    });
    const [variationSettings, setVariationSettings] = useState(() => getInitialVariationSettings(variationRegistry));
    const [search, setSearch] = useState("");
    const [filters, setFilters] = useState(DEFAULT_FILTERS);
    const [systemOpen, setSystemOpen] = useState(false);
    useEffect(() => {
      const sync = () => {
        const next = {};
        getConfiguredVariationBlocks().forEach((blockName) => {
          next[blockName] = getBlockVariationsForBlock(blockName);
        });
        setVariationRegistry(next);
      };
      sync();
      if (!wp.data || typeof wp.data.subscribe !== "function") {
        return void 0;
      }
      return wp.data.subscribe(sync);
    }, []);
    useEffect(() => {
      setVariationSettings((current) => {
        const next = { ...current };
        let changed = false;
        getConfiguredVariationBlocks().forEach((blockName) => {
          if (!next[blockName]) {
            next[blockName] = {};
          }
          (variationRegistry[blockName] || []).forEach((variation) => {
            const slug = variation.name;
            if (!slug || Object.prototype.hasOwnProperty.call(next[blockName], slug)) {
              return;
            }
            next[blockName][slug] = {
              allowed: resolveVariationAllowed(blockName, slug, config.blockVariationSettings || {}, config)
            };
            changed = true;
          });
        });
        return changed ? next : current;
      });
    }, [variationRegistry, config.blockVariationSettings]);
    const allowedFilterOptions = useMemo(
      () => [
        { value: "all", label: i18n.filterAll || __("All", "baselayer"), icon: "dashicons-filter" },
        { value: "active", label: i18n.filterActive || __("Active", "baselayer"), icon: "dashicons-yes-alt" },
        { value: "inactive", label: i18n.filterInactive || __("Inactive", "baselayer"), icon: "dashicons-no-alt" }
      ],
      [i18n]
    );
    const hiddenFilterOptions = useMemo(
      () => [
        { value: "all", label: i18n.filterAll || __("All", "baselayer"), icon: "dashicons-filter" },
        { value: "hidden", label: i18n.hidden || __("Hidden", "baselayer"), icon: "dashicons-hidden" },
        { value: "not-hidden", label: i18n.filterNotHidden || __("Not hidden", "baselayer"), icon: "dashicons-visibility" }
      ],
      [i18n]
    );
    const favoriteFilterOptions = useMemo(
      () => [
        { value: "all", label: i18n.filterAll || __("All", "baselayer"), icon: "dashicons-filter" },
        { value: "favorite", label: i18n.favorites || __("Favorites", "baselayer"), icon: "dashicons-star-filled" },
        { value: "not-favorite", label: i18n.filterNotFavorite || __("Not favorite", "baselayer"), icon: "dashicons-star-empty" }
      ],
      [i18n]
    );
    const configurableGroups = useMemo(
      () => filterGroups(config.configurableGroups || [], search, settings, filters, variationRegistry, variationSettings),
      [config.configurableGroups, search, settings, filters, variationRegistry, variationSettings]
    );
    const systemBlocks = useMemo(() => filterSystemBlocks(config.systemBlocks || [], search), [config.systemBlocks, search]);
    const systemVariations = useMemo(
      () => buildSystemVariations(variationRegistry, search),
      [variationRegistry, search]
    );
    const systemItemCount = systemBlocks.length + systemVariations.length;
    const hasVisibleBlocks = configurableGroups.some((group) => group.items.length > 0);
    const updateBlock = (name, nextFlags) => {
      setSettings((current) => ({
        ...current,
        [name]: nextFlags
      }));
    };
    useEffect(() => {
      const form = document.getElementById("bl-block-settings-form");
      const jsonField = document.getElementById("bl-block-settings-json");
      const variationJsonField = document.getElementById("bl-block-variations-json");
      if (!(form instanceof HTMLFormElement) || !(jsonField instanceof HTMLInputElement)) {
        return void 0;
      }
      const onSubmit = () => {
        jsonField.value = JSON.stringify(settings);
        if (variationJsonField instanceof HTMLInputElement) {
          variationJsonField.value = JSON.stringify(variationSettings);
        }
      };
      form.addEventListener("submit", onSubmit);
      return () => form.removeEventListener("submit", onSubmit);
    }, [settings, variationSettings]);
    return el(
      Fragment,
      null,
      el("h2", { className: "title" }, i18n.pageTitle || ""),
      el("p", { className: "description bl-block-settings__intro" }, i18n.intro || ""),
      el(
        "div",
        { className: "bl-block-settings__toolbar" },
        el(
          "div",
          { className: "bl-block-settings__toolbar-row" },
          el(
            "p",
            { className: "bl-block-settings__search-wrap" },
            el("label", { className: "screen-reader-text", htmlFor: "bl-block-settings-search" }, i18n.searchPlaceholder || ""),
            el("input", {
              type: "search",
              id: "bl-block-settings-search",
              className: "regular-text",
              placeholder: i18n.searchPlaceholder || "",
              value: search,
              onInput: (event) => setSearch(event.target.value)
            })
          ),
          el(
            "div",
            { className: "bl-block-settings__filters" },
            el(FilterGroup, {
              label: i18n.filterAllowed || __("Allowed in inserter", "baselayer"),
              value: filters.allowed,
              options: allowedFilterOptions,
              onChange: (value) => setFilters((current) => ({ ...current, allowed: value }))
            }),
            el(FilterGroup, {
              label: i18n.filterHidden || __("Inserter visibility", "baselayer"),
              value: filters.hidden,
              options: hiddenFilterOptions,
              onChange: (value) => setFilters((current) => ({ ...current, hidden: value }))
            }),
            el(FilterGroup, {
              label: i18n.filterFavorite || __("Favorites", "baselayer"),
              value: filters.favorite,
              options: favoriteFilterOptions,
              onChange: (value) => setFilters((current) => ({ ...current, favorite: value }))
            })
          )
        )
      ),
      !hasVisibleBlocks && el("p", { className: "bl-block-settings__empty" }, i18n.noResults || __("No blocks match the current search or filters.", "baselayer")),
      configurableGroups.map(
        (group) => el(
          "section",
          { key: group.category, className: "bl-block-settings__group" },
          el("h3", { className: "bl-block-settings__category" }, group.label),
          el(
            "div",
            { className: "bl-block-settings__grid" },
            group.items.map((item) => {
              if (item.kind === "block") {
                const flags2 = settings[item.block.name] || { allowed: true, hidden: false, favorite: false };
                return el(BlockCard, {
                  key: item.block.name,
                  block: item.block,
                  flags: flags2,
                  onChange: (nextFlags) => updateBlock(item.block.name, nextFlags)
                });
              }
              const slug = item.variation.name;
              const parentAllowed = Boolean((settings[item.blockName] || { allowed: true }).allowed);
              const flags = (variationSettings[item.blockName] || {})[slug] || { allowed: false };
              return el(VariationCard, {
                key: `${item.blockName}/${slug}`,
                blockName: item.blockName,
                variation: item.variation,
                allowed: Boolean(flags.allowed),
                parentAllowed,
                onChange: (nextFlags) => setVariationSettings((current) => ({
                  ...current,
                  [item.blockName]: {
                    ...current[item.blockName] || {},
                    [slug]: nextFlags
                  }
                }))
              });
            })
          )
        )
      ),
      systemItemCount > 0 && el(
        "div",
        { className: "bl-block-settings__system" },
        el(
          "button",
          {
            type: "button",
            className: `button button-secondary bl-block-settings__system-toggle${systemOpen ? " is-open" : ""}`,
            style: { marginBottom: 0 },
            "aria-expanded": systemOpen ? "true" : "false",
            "aria-controls": "bl-block-settings-system-panel",
            onClick: () => setSystemOpen((open) => !open)
          },
          sprintf(
            i18n.systemItemsToggle || i18n.systemBlocksToggle || _n("%d hidden by system", "%d hidden by system", systemItemCount, "baselayer"),
            systemItemCount
          )
        ),
        systemOpen && el(
          "div",
          { id: "bl-block-settings-system-panel", className: "bl-block-settings__system-panel" },
          el("p", { className: "description" }, i18n.systemBlocksDescription || ""),
          el(SystemBlocksHelp, { help: config.systemBlocksHelp, i18n }),
          el(
            "div",
            { className: "bl-block-settings__system-grid", style: { marginTop: 16 } },
            systemBlocks.map((block) => el(SystemBlockCard, { key: block.name, block })),
            systemVariations.map(
              ({ blockName, variation }) => el(SystemVariationCard, {
                key: `${blockName}/${variation.name}`,
                blockName,
                variation
              })
            )
          )
        )
      ),
      el(
        "div",
        { className: "bl-submit-row" },
        el("button", { type: "submit", className: "button button-primary" }, i18n.save || __("Save Changes", "baselayer"))
      )
    );
  }
  function mountBlockSettingsApp() {
    const rootEl = document.getElementById("bl-block-settings-app");
    if (!rootEl) {
      return;
    }
    if (wp.element.createRoot) {
      wp.element.createRoot(rootEl).render(el(BlockSettingsApp));
      return;
    }
    if (typeof wp.element.render === "function") {
      wp.element.render(el(BlockSettingsApp), rootEl);
    }
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountBlockSettingsApp);
  } else {
    mountBlockSettingsApp();
  }
})();
//# sourceMappingURL=block-settings.js.map
