(() => {
  // themes/baselayer/packages/baselayer-editorial/src/js/admin/page-picker.js
  function openPagePicker(options = {}) {
    const opts = {
      multi: false,
      selectedId: 0,
      selectedIds: [],
      title: "Select a page",
      searchPlaceholder: "Search pages\u2026",
      empty: "No pages found.",
      loading: "Loading\u2026",
      cancelLabel: "Cancel",
      selectLabel: "Select",
      restUrl: "",
      restNonce: "",
      ...options
    };
    const api = window.wpApiSettings || {};
    const restUrl = opts.restUrl || (api.root ? String(api.root).replace(/\/?$/, "/") + "wp/v2/pages" : "");
    const restNonce = opts.restNonce || api.nonce || "";
    return new Promise((resolve) => {
      let settled = false;
      const selectedMap = /* @__PURE__ */ new Map();
      if (opts.multi) {
        const ids = Array.isArray(opts.selectedIds) ? opts.selectedIds : [];
        ids.forEach((id) => {
          const n = Number(id) || 0;
          if (n > 0) {
            selectedMap.set(n, { id: n, title: "", url: "" });
          }
        });
      } else {
        const id = Number(opts.selectedId) || 0;
        if (id > 0) {
          selectedMap.set(id, { id, title: "", url: "" });
        }
      }
      let debounceTimer = 0;
      let abort = null;
      const finish = (value) => {
        if (settled) return;
        settled = true;
        cleanup();
        resolve(value);
      };
      const onKey = (evt) => {
        if (evt.key === "Escape") {
          finish(null);
        }
      };
      const cleanup = () => {
        document.removeEventListener("keydown", onKey);
        document.body.classList.remove("bl-page-picker-open");
        if (abort) {
          abort.abort();
          abort = null;
        }
        if (debounceTimer) {
          window.clearTimeout(debounceTimer);
        }
        backdrop.remove();
      };
      const backdrop = document.createElement("div");
      backdrop.className = "bl-page-picker";
      backdrop.setAttribute("role", "dialog");
      backdrop.setAttribute("aria-modal", "true");
      backdrop.setAttribute("aria-label", opts.title);
      const dialog = document.createElement("div");
      dialog.className = "bl-page-picker__dialog";
      const header = document.createElement("div");
      header.className = "bl-page-picker__header";
      const titleEl = document.createElement("h2");
      titleEl.className = "bl-page-picker__title";
      titleEl.textContent = opts.title;
      header.appendChild(titleEl);
      const searchWrap = document.createElement("div");
      searchWrap.className = "bl-page-picker__search-wrap";
      const search = document.createElement("input");
      search.type = "search";
      search.className = "bl-page-picker__search";
      search.placeholder = opts.searchPlaceholder;
      search.setAttribute("autocomplete", "off");
      searchWrap.appendChild(search);
      const list = document.createElement("div");
      list.className = "bl-page-picker__list";
      list.setAttribute("role", "listbox");
      if (opts.multi) {
        list.setAttribute("aria-multiselectable", "true");
      }
      const status = document.createElement("p");
      status.className = "bl-page-picker__status description";
      status.hidden = true;
      const body = document.createElement("div");
      body.className = "bl-page-picker__body";
      body.append(searchWrap, status, list);
      const footer = document.createElement("div");
      footer.className = "bl-page-picker__footer";
      const cancelBtn = document.createElement("button");
      cancelBtn.type = "button";
      cancelBtn.className = "button bl-button-small";
      cancelBtn.textContent = opts.cancelLabel;
      cancelBtn.addEventListener("click", () => finish(null));
      const selectBtn = document.createElement("button");
      selectBtn.type = "button";
      selectBtn.className = "button button-primary bl-button-small";
      selectBtn.textContent = opts.selectLabel;
      const syncSelectEnabled = () => {
        selectBtn.disabled = selectedMap.size === 0;
      };
      syncSelectEnabled();
      selectBtn.addEventListener("click", () => {
        if (selectedMap.size === 0) return;
        if (opts.multi) {
          finish(Array.from(selectedMap.values()));
          return;
        }
        finish({ ...selectedMap.values().next().value });
      });
      footer.append(cancelBtn, selectBtn);
      dialog.append(header, body, footer);
      backdrop.appendChild(dialog);
      backdrop.addEventListener("click", (evt) => {
        if (evt.target === backdrop) {
          finish(null);
        }
      });
      document.addEventListener("keydown", onKey);
      const setStatus = (text) => {
        status.textContent = text || "";
        status.hidden = !text;
      };
      const renderRows = (pages) => {
        list.replaceChildren();
        if (!pages.length) {
          setStatus(opts.empty);
          return;
        }
        setStatus("");
        pages.forEach((page) => {
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "bl-page-picker__item";
          btn.setAttribute("role", "option");
          const id = Number(page.id) || 0;
          const active = selectedMap.has(id);
          btn.classList.toggle("is-selected", active);
          btn.setAttribute("aria-selected", active ? "true" : "false");
          btn.dataset.pageId = String(id);
          const title = document.createElement("span");
          title.className = "bl-page-picker__item-title";
          title.textContent = page.title || `#${id}`;
          const meta = document.createElement("span");
          meta.className = "bl-page-picker__item-meta";
          meta.textContent = page.url || "";
          btn.append(title, meta);
          btn.addEventListener("click", () => {
            const item = {
              id,
              title: page.title || "",
              url: page.url || ""
            };
            if (opts.multi) {
              if (selectedMap.has(id)) {
                selectedMap.delete(id);
              } else {
                selectedMap.set(id, item);
              }
            } else {
              selectedMap.clear();
              selectedMap.set(id, item);
            }
            list.querySelectorAll(".bl-page-picker__item").forEach((node) => {
              const on = selectedMap.has(Number(node.dataset.pageId) || 0);
              node.classList.toggle("is-selected", on);
              node.setAttribute("aria-selected", on ? "true" : "false");
            });
            syncSelectEnabled();
          });
          list.appendChild(btn);
        });
      };
      const fetchPages = async (query = "") => {
        if (!restUrl) {
          setStatus(opts.empty);
          return;
        }
        if (abort) {
          abort.abort();
        }
        abort = new AbortController();
        setStatus(opts.loading);
        list.replaceChildren();
        const url = new URL(restUrl, window.location.origin);
        url.searchParams.set("status", "publish");
        url.searchParams.set("per_page", "20");
        url.searchParams.set("orderby", "title");
        url.searchParams.set("order", "asc");
        url.searchParams.set("_fields", "id,title,link");
        if (query) {
          url.searchParams.set("search", query);
        }
        try {
          const res = await fetch(url.toString(), {
            credentials: "same-origin",
            signal: abort.signal,
            headers: restNonce ? {
              "X-WP-Nonce": restNonce
            } : {}
          });
          if (!res.ok) {
            setStatus(opts.empty);
            return;
          }
          const data = await res.json();
          const pages = (Array.isArray(data) ? data : []).map((row) => ({
            id: Number(row.id) || 0,
            title: row.title && typeof row.title.rendered === "string" ? row.title.rendered.replace(/<[^>]+>/g, "") : String(row.title || ""),
            url: typeof row.link === "string" ? row.link : ""
          }));
          pages.forEach((page) => {
            if (selectedMap.has(page.id)) {
              selectedMap.set(page.id, page);
            }
          });
          renderRows(pages);
        } catch (err) {
          if (err && err.name === "AbortError") {
            return;
          }
          setStatus(opts.empty);
        }
      };
      search.addEventListener("input", () => {
        window.clearTimeout(debounceTimer);
        debounceTimer = window.setTimeout(() => {
          fetchPages(search.value.trim());
        }, 220);
      });
      document.body.classList.add("bl-page-picker-open");
      document.body.appendChild(backdrop);
      search.focus();
      fetchPages("");
    });
  }
  window.baselayerOpenPagePicker = openPagePicker;
  function renderPageSelectionChips(container, pages, options = {}) {
    if (!container) {
      return;
    }
    const opts = {
      inputName: "",
      emptyLabel: "No pages selected.",
      removeLabel: "Remove",
      onChange: null,
      ...options
    };
    const list = Array.isArray(pages) ? pages.map((page) => ({
      id: Number(page && page.id) || 0,
      title: page && page.title || "",
      url: page && page.url || ""
    })).filter((page) => page.id > 0) : [];
    container.replaceChildren();
    if (!list.length) {
      const empty = document.createElement("li");
      empty.className = "bl-editorial-selected-pages__empty description";
      empty.textContent = opts.emptyLabel || container.dataset.empty || "No pages selected.";
      container.appendChild(empty);
      if (typeof opts.onChange === "function") {
        opts.onChange([]);
      }
      return;
    }
    list.forEach((page) => {
      const li = document.createElement("li");
      li.dataset.id = String(page.id);
      li.className = "bl-editorial-selected-pages__chip";
      if (opts.inputName) {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = opts.inputName;
        input.value = String(page.id);
        li.appendChild(input);
      }
      const title = document.createElement("span");
      title.className = "bl-editorial-selected-pages__title";
      title.textContent = page.title || `#${page.id}`;
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "button-link bl-editorial-remove-page";
      remove.setAttribute("aria-label", opts.removeLabel);
      remove.textContent = "\xD7";
      li.append(title, remove);
      container.appendChild(li);
    });
    if (typeof opts.onChange === "function") {
      opts.onChange(list);
    }
  }
  window.baselayerRenderPageSelectionChips = renderPageSelectionChips;

  // themes/baselayer/packages/baselayer-editorial/src/js/admin.js
  (function() {
    "use strict";
    const cfg = typeof window.blEditorialAdmin !== "undefined" ? window.blEditorialAdmin : {};
    const i18n = cfg.i18n || {};
    function closestRightsRoot(node) {
      return node && node.closest ? node.closest("[data-bl-editorial-rights]") : null;
    }
    function syncPageAccess(root) {
      if (!root) return;
      const selected = root.querySelector('.bl-editorial-page-access[value="selected"]');
      const wrap = root.querySelector(".bl-editorial-page-picker-wrap");
      if (!wrap) return;
      const pagesEnabled = isPagesPostTypeEnabled(root);
      wrap.hidden = !(pagesEnabled && selected && selected.checked);
    }
    function isPagesPostTypeEnabled(root) {
      const pageType = root.querySelector('.bl-editorial-post-type[value="page"]');
      return !!(pageType && pageType.checked);
    }
    function syncPageAccessRow(root) {
      if (!root) return;
      const row = root.querySelector(".bl-editorial-page-access-row");
      if (!row) return;
      const enabled = isPagesPostTypeEnabled(root);
      row.hidden = !enabled;
      row.querySelectorAll("input, button").forEach((el) => {
        if (el instanceof HTMLInputElement || el instanceof HTMLButtonElement) {
          el.disabled = !enabled;
        }
      });
      syncPageAccess(root);
    }
    function renderSelectedList(list, pages, inputName) {
      renderPageSelectionChips(list, pages, {
        inputName,
        emptyLabel: list.dataset.empty || i18n.noPagesSelected || "No pages selected.",
        removeLabel: i18n.remove || "Remove"
      });
    }
    function currentSelectedPages(list) {
      return Array.from(list.querySelectorAll("li[data-id]")).map((li) => ({
        id: Number(li.dataset.id) || 0,
        title: (li.querySelector(".bl-editorial-selected-pages__title") || {}).textContent || "",
        url: ""
      })).filter((p) => p.id > 0);
    }
    function inputNameForList(list) {
      const existing = list.querySelector('input[type="hidden"][name]');
      if (existing) {
        return existing.name;
      }
      const root = closestRightsRoot(list);
      const sample = root && root.querySelector('input[name*="[post_types]"]');
      if (sample && sample.name) {
        return sample.name.replace("[post_types][]", "[allowed_page_ids][]");
      }
      return "bl_editorial_rights[allowed_page_ids][]";
    }
    function setRightsFieldsDisabled(fields, disabled) {
      if (!fields) return;
      fields.querySelectorAll("input, select, textarea").forEach((el) => {
        if (!(el instanceof HTMLInputElement || el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement)) {
          return;
        }
        const name = el.getAttribute("name") || "";
        if (name.indexOf("bl_editorial_rights") !== 0) {
          return;
        }
        el.disabled = !!disabled;
      });
    }
    function syncRestrictionsToggle(toggle) {
      if (!(toggle instanceof HTMLInputElement)) return;
      const fieldsId = toggle.getAttribute("data-bl-editorial-fields");
      const fields = fieldsId ? document.getElementById(fieldsId) : null;
      if (!fields) return;
      fields.hidden = !toggle.checked;
      setRightsFieldsDisabled(fields, !toggle.checked);
      if (toggle.checked) {
        syncPageAccessRow(fields);
      }
      if (toggle.checked && toggle.id === "bl-editorial-enable-rights" && toggle.getAttribute("data-bl-editorial-has-saved") !== "1") {
        const json = document.getElementById("bl-editorial-site-defaults");
        if (!json) return;
        let defaults;
        try {
          defaults = JSON.parse(json.textContent || "{}");
        } catch (e) {
          return;
        }
        applyDefaultsToProfile(defaults, { keepEnableState: true });
      }
    }
    document.addEventListener("change", (evt) => {
      const target = evt.target;
      if (!(target instanceof HTMLElement)) return;
      if (target.classList.contains("bl-editorial-enable-restrictions")) {
        syncRestrictionsToggle(target);
        return;
      }
      if (target.classList.contains("bl-editorial-page-access")) {
        syncPageAccess(closestRightsRoot(target));
        return;
      }
      if (target.classList.contains("bl-editorial-post-type")) {
        syncPageAccessRow(closestRightsRoot(target));
      }
    });
    document.querySelectorAll(".bl-editorial-enable-restrictions").forEach((toggle) => {
      syncRestrictionsToggle(toggle);
    });
    document.addEventListener("click", async (evt) => {
      const target = evt.target;
      if (!(target instanceof HTMLElement)) return;
      if (target.classList.contains("bl-editorial-remove-page")) {
        const li = target.closest("li");
        const list = target.closest(".bl-editorial-selected-pages");
        if (li) li.remove();
        if (list && !list.querySelector("li[data-id]")) {
          renderSelectedList(list, [], inputNameForList(list));
        }
        return;
      }
      if (target.classList.contains("bl-editorial-pick-pages")) {
        const root = closestRightsRoot(target);
        if (!root) return;
        const list = root.querySelector(".bl-editorial-selected-pages");
        if (!list) return;
        const current = currentSelectedPages(list);
        const result = await openPagePicker({
          multi: true,
          selectedIds: current.map((p) => p.id),
          title: i18n.selectPages || "Select pages",
          searchPlaceholder: i18n.searchPages || "Search pages\u2026",
          empty: i18n.noPages || "No pages found.",
          loading: i18n.loading || "Loading\u2026",
          cancelLabel: i18n.cancel || "Cancel",
          selectLabel: i18n.select || "Select",
          restUrl: cfg.pagesRestUrl || "",
          restNonce: cfg.restNonce || ""
        });
        if (!result) return;
        const pages = Array.isArray(result) ? result : [result];
        const merged = pages.map((page) => {
          const prev = current.find((c) => c.id === page.id);
          return {
            id: page.id,
            title: page.title || prev && prev.title || `#${page.id}`,
            url: page.url || ""
          };
        });
        renderSelectedList(list, merged, inputNameForList(list));
        return;
      }
      if (target.classList.contains("bl-editorial-apply-defaults")) {
        const json = document.getElementById("bl-editorial-site-defaults");
        if (!json) return;
        let defaults;
        try {
          defaults = JSON.parse(json.textContent || "{}");
        } catch (e) {
          return;
        }
        applyDefaultsToProfile(defaults);
      }
    });
    function applyDefaultsToProfile(defaults, options = {}) {
      const root = document.getElementById("bl-editorial-rights-fields");
      if (!root) return;
      root.querySelectorAll(".bl-editorial-post-type").forEach((input) => {
        input.checked = Array.isArray(defaults.post_types) && defaults.post_types.includes(input.value);
      });
      const own = root.querySelector("#bl-editorial-user-own");
      if (own) own.checked = !!defaults.own_posts_only;
      const media = root.querySelector("#bl-editorial-user-media");
      if (media) media.checked = !!defaults.media_own_only;
      root.querySelectorAll('input[name="bl_editorial_rights[publish_mode]"]').forEach((input) => {
        input.checked = input.value === (defaults.publish_mode || "direct");
      });
      root.querySelectorAll(".bl-editorial-page-access").forEach((input) => {
        input.checked = input.value === (defaults.page_access || "all");
      });
      const list = root.querySelector(".bl-editorial-selected-pages");
      if (list) {
        const pages = (defaults.allowed_page_ids || []).map((id) => ({
          id: Number(id) || 0,
          title: `#${id}`,
          url: ""
        })).filter((p) => p.id > 0);
        renderSelectedList(list, pages, "bl_editorial_rights[allowed_page_ids][]");
      }
      syncPageAccessRow(root.querySelector("[data-bl-editorial-rights]") || root);
      if (!options.keepEnableState) {
        const enable = document.getElementById("bl-editorial-enable-rights");
        if (enable) {
          enable.checked = true;
          syncRestrictionsToggle(enable);
        }
      } else {
        setRightsFieldsDisabled(root, false);
        syncPageAccessRow(root.querySelector("[data-bl-editorial-rights]") || root);
      }
    }
    document.querySelectorAll("[data-bl-editorial-rights]").forEach((root) => {
      syncPageAccessRow(root);
      const list = root.querySelector(".bl-editorial-selected-pages");
      if (list && !list.querySelector("li[data-id]")) {
        renderSelectedList(list, [], inputNameForList(list));
      }
    });
  })();
})();
//# sourceMappingURL=editorial-admin.js.map
