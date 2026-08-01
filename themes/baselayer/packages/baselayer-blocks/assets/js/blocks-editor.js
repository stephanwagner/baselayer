(() => {
  // themes/baselayer/src/js/admin/utils/page-picker.js
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
              const on2 = selectedMap.has(Number(node.dataset.pageId) || 0);
              node.classList.toggle("is-selected", on2);
              node.setAttribute("aria-selected", on2 ? "true" : "false");
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

  // themes/baselayer/packages/baselayer-blocks/src/js/admin/page-field.js
  function el(tag, props = {}, children = []) {
    const node = document.createElement(tag);
    Object.entries(props).forEach(([key, value]) => {
      if (value == null || value === false) return;
      if (key === "className") node.className = value;
      else if (key === "text") node.textContent = value;
      else if (key === "dataset") Object.assign(node.dataset, value);
      else if (key.startsWith("on") && typeof value === "function") {
        node.addEventListener(key.slice(2).toLowerCase(), value);
      } else if (key === "checked") node.checked = Boolean(value);
      else if (key === "value") node.value = value === true ? "" : String(value);
      else node.setAttribute(key, value === true ? "" : String(value));
    });
    (Array.isArray(children) ? children : [children]).forEach((child) => {
      if (child == null || child === false) return;
      node.appendChild(typeof child === "string" ? document.createTextNode(child) : child);
    });
    return node;
  }
  function i18n(key, fallback) {
    const dict = window.blBlocksFieldUi && window.blBlocksFieldUi.i18n || window.blBlocksEditor && window.blBlocksEditor.i18n || window.blBlocksPage && window.blBlocksPage.i18n || window.blBlocksAdmin && window.blBlocksAdmin.i18n || {};
    return dict[key] || fallback || key;
  }
  function pickerConfig() {
    const sources = [
      window.blBlocksFieldUi,
      window.blBlocksEditor,
      window.blBlocksPage,
      window.blBlocksAdmin
    ];
    let restUrl = "";
    let restNonce = "";
    sources.forEach((src) => {
      if (!src) return;
      if (!restUrl && src.pagesRestUrl) restUrl = src.pagesRestUrl;
      if (!restNonce && src.restNonce) restNonce = src.restNonce;
    });
    return { restUrl, restNonce };
  }
  function normalizePageIds(current, multiple) {
    if (multiple) {
      const list = Array.isArray(current) ? current : current != null && current !== "" ? [current] : [];
      return list.map((id) => Number(id) || 0).filter((id) => id > 0);
    }
    const one = Number(Array.isArray(current) ? current[0] : current) || 0;
    return one > 0 ? [one] : [];
  }
  function createPagePickerControl(field, current) {
    const multiple = !!field.multiple;
    let selected = normalizePageIds(current, multiple).map((id) => ({
      id,
      title: "",
      url: ""
    }));
    const summary = el("div", { className: "bl-blocks-fields__page-picker-summary" });
    const pickBtn = el("button", {
      type: "button",
      className: "button bl-button-small",
      text: i18n("choosePage", "Choose page")
    });
    const clearBtn = el("button", {
      type: "button",
      className: "button-link",
      text: i18n("clearPage", "Clear")
    });
    const actions = el("div", { className: "bl-blocks-fields__page-picker-actions" }, [
      pickBtn,
      clearBtn
    ]);
    const control = el("div", {
      className: "bl-blocks-fields__page-picker",
      dataset: { blBlocksPagePicker: "1" }
    });
    control.append(
      el("div", { className: "bl-blocks-fields__page-picker-row" }, [summary, actions])
    );
    const syncUi = () => {
      summary.replaceChildren();
      if (selected.length === 0) {
        summary.appendChild(
          el("span", {
            className: "description",
            text: multiple ? i18n("choosePagesHelp", "Select one or more pages.") : i18n("choosePageHelp", "Select a page.")
          })
        );
      } else if (multiple) {
        selected.forEach((page) => {
          summary.appendChild(
            el("span", {
              className: "bl-blocks-fields__page-picker-value",
              text: page.title || i18n("selectedPage", "Selected page") + " #" + page.id
            })
          );
        });
      } else {
        const page = selected[0];
        summary.appendChild(
          el("span", {
            className: "bl-blocks-fields__page-picker-value",
            text: page.title || i18n("selectedPage", "Selected page") + " #" + page.id
          })
        );
        if (page.url) {
          summary.appendChild(
            el("span", {
              className: "description bl-blocks-fields__page-picker-url",
              text: page.url,
              title: page.url
            })
          );
        }
      }
      clearBtn.hidden = selected.length === 0;
      pickBtn.textContent = selected.length > 0 ? multiple ? i18n("changePages", "Change pages") : i18n("changePage", "Change page") : multiple ? i18n("choosePages", "Choose pages") : i18n("choosePage", "Choose page");
    };
    const hydrateTitles = async () => {
      const missing = selected.filter((p) => !p.title);
      if (missing.length === 0) return;
      const { restUrl, restNonce } = pickerConfig();
      if (!restUrl) return;
      try {
        const include = missing.map((p) => p.id).join(",");
        const url = String(restUrl).replace(/\/?$/, "/") + "?include=" + encodeURIComponent(include) + "&per_page=" + missing.length + "&_fields=id,title,link";
        const res = await fetch(url, {
          headers: restNonce ? { "X-WP-Nonce": restNonce } : {}
        });
        if (!res.ok) return;
        const rows = await res.json();
        if (!Array.isArray(rows)) return;
        const byId = new Map(
          rows.map((row) => [
            Number(row.id) || 0,
            {
              id: Number(row.id) || 0,
              title: row.title && row.title.rendered || "",
              url: row.link || ""
            }
          ])
        );
        selected = selected.map((page) => {
          const hit = byId.get(page.id);
          return hit ? { ...page, ...hit } : page;
        });
        syncUi();
      } catch (err) {
      }
    };
    pickBtn.addEventListener("click", async () => {
      let open;
      try {
        open = openPagePicker;
      } catch (err) {
        console.error("Page picker failed to load.", err);
        return;
      }
      if (typeof open !== "function") {
        console.error("Page picker is unavailable.");
        return;
      }
      const { restUrl, restNonce } = pickerConfig();
      const result = await open({
        multi: multiple,
        selectedId: !multiple && selected[0] ? selected[0].id : 0,
        selectedIds: multiple ? selected.map((p) => p.id) : [],
        title: multiple ? i18n("pagePickerTitleMulti", "Select pages") : i18n("pagePickerTitle", "Select a page"),
        searchPlaceholder: i18n("pagePickerSearch", "Search pages\u2026"),
        empty: i18n("pagePickerEmpty", "No pages found."),
        loading: i18n("pagePickerLoading", "Loading\u2026"),
        cancelLabel: i18n("cancel", "Cancel"),
        selectLabel: i18n("selectPage", "Select"),
        restUrl,
        restNonce
      });
      if (!result) return;
      if (multiple) {
        selected = (Array.isArray(result) ? result : [result]).map((page) => ({
          id: Number(page.id) || 0,
          title: page.title || "",
          url: page.url || ""
        })).filter((p) => p.id > 0);
      } else {
        selected = [
          {
            id: Number(result.id) || 0,
            title: result.title || "",
            url: result.url || ""
          }
        ].filter((p) => p.id > 0);
      }
      syncUi();
    });
    clearBtn.addEventListener("click", () => {
      selected = [];
      syncUi();
    });
    control.getPageValue = () => {
      const ids = selected.map((p) => p.id).filter((id) => id > 0);
      if (multiple) return ids;
      return ids[0] || "";
    };
    syncUi();
    hydrateTitles();
    return control;
  }
  function bindPagePickers(root = document) {
    root.querySelectorAll("[data-bl-blocks-page-picker]").forEach((wrap) => {
      if (wrap.dataset.blPagePickerBound === "1") return;
      wrap.dataset.blPagePickerBound = "1";
      const multiple = wrap.dataset.multiple === "1";
      const inputName = wrap.dataset.inputName || "";
      const summary = wrap.querySelector("[data-bl-page-summary]");
      const pickBtn = wrap.querySelector("[data-bl-page-choose]");
      const clearBtn = wrap.querySelector("[data-bl-page-clear]");
      const inputsHost = wrap.querySelector("[data-bl-page-inputs]");
      if (!summary || !pickBtn || !clearBtn || !inputsHost || !inputName) return;
      let selected = Array.from(inputsHost.querySelectorAll('input[type="hidden"]')).map((input) => ({
        id: Number(input.value) || 0,
        title: input.dataset.title || "",
        url: input.dataset.url || ""
      })).filter((p) => p.id > 0);
      const writeInputs = () => {
        inputsHost.replaceChildren();
        if (selected.length === 0) {
          if (multiple) {
            inputsHost.appendChild(
              el("input", { type: "hidden", name: inputName + "[]", value: "" })
            );
          } else {
            inputsHost.appendChild(el("input", { type: "hidden", name: inputName, value: "" }));
          }
          return;
        }
        selected.forEach((page) => {
          const name = multiple ? inputName + "[]" : inputName;
          const input = el("input", {
            type: "hidden",
            name,
            value: String(page.id)
          });
          if (page.title) input.dataset.title = page.title;
          if (page.url) input.dataset.url = page.url;
          inputsHost.appendChild(input);
        });
      };
      const syncUi = () => {
        summary.replaceChildren();
        if (selected.length === 0) {
          summary.appendChild(
            el("span", {
              className: "description",
              text: multiple ? i18n("choosePagesHelp", "Select one or more pages.") : i18n("choosePageHelp", "Select a page.")
            })
          );
        } else {
          selected.forEach((page) => {
            summary.appendChild(
              el("span", {
                className: "bl-blocks-fields__page-picker-value",
                text: page.title || i18n("selectedPage", "Selected page") + " #" + page.id
              })
            );
          });
        }
        clearBtn.hidden = selected.length === 0;
        pickBtn.textContent = selected.length > 0 ? multiple ? i18n("changePages", "Change pages") : i18n("changePage", "Change page") : multiple ? i18n("choosePages", "Choose pages") : i18n("choosePage", "Choose page");
        writeInputs();
      };
      pickBtn.addEventListener("click", async () => {
        if (typeof openPagePicker !== "function") {
          console.error("Page picker is unavailable.");
          return;
        }
        const { restUrl, restNonce } = pickerConfig();
        const result = await openPagePicker({
          multi: multiple,
          selectedId: !multiple && selected[0] ? selected[0].id : 0,
          selectedIds: multiple ? selected.map((p) => p.id) : [],
          title: multiple ? i18n("pagePickerTitleMulti", "Select pages") : i18n("pagePickerTitle", "Select a page"),
          searchPlaceholder: i18n("pagePickerSearch", "Search pages\u2026"),
          empty: i18n("pagePickerEmpty", "No pages found."),
          loading: i18n("pagePickerLoading", "Loading\u2026"),
          cancelLabel: i18n("cancel", "Cancel"),
          selectLabel: i18n("selectPage", "Select"),
          restUrl,
          restNonce
        });
        if (!result) return;
        if (multiple) {
          selected = (Array.isArray(result) ? result : [result]).map((page) => ({
            id: Number(page.id) || 0,
            title: page.title || "",
            url: page.url || ""
          })).filter((p) => p.id > 0);
        } else {
          selected = [
            {
              id: Number(result.id) || 0,
              title: result.title || "",
              url: result.url || ""
            }
          ].filter((p) => p.id > 0);
        }
        syncUi();
      });
      clearBtn.addEventListener("click", () => {
        selected = [];
        syncUi();
      });
      syncUi();
    });
  }

  // themes/baselayer/packages/baselayer-blocks/src/js/admin/link-field.js
  var LINK_TYPES = ["page", "url", "email", "phone"];
  function el2(tag, props = {}, children = []) {
    const node = document.createElement(tag);
    Object.entries(props).forEach(([key, value]) => {
      if (value == null || value === false) return;
      if (key === "className") node.className = value;
      else if (key === "text") node.textContent = value;
      else if (key === "dataset") Object.assign(node.dataset, value);
      else if (key.startsWith("on") && typeof value === "function") {
        node.addEventListener(key.slice(2).toLowerCase(), value);
      } else if (key === "checked") node.checked = Boolean(value);
      else if (key === "value") node.value = value === true ? "" : String(value);
      else node.setAttribute(key, value === true ? "" : String(value));
    });
    (Array.isArray(children) ? children : [children]).forEach((child) => {
      if (child == null || child === false) return;
      node.appendChild(typeof child === "string" ? document.createTextNode(child) : child);
    });
    return node;
  }
  function i18n2(key, fallback) {
    const dict = window.blBlocksFieldUi && window.blBlocksFieldUi.i18n || window.blBlocksEditor && window.blBlocksEditor.i18n || window.blBlocksPage && window.blBlocksPage.i18n || window.blBlocksAdmin && window.blBlocksAdmin.i18n || {};
    return dict[key] || fallback || key;
  }
  function pickerConfig2() {
    const sources = [
      window.blBlocksFieldUi,
      window.blBlocksEditor,
      window.blBlocksPage,
      window.blBlocksAdmin
    ];
    let restUrl = "";
    let restNonce = "";
    sources.forEach((src) => {
      if (!src) return;
      if (!restUrl && src.pagesRestUrl) restUrl = src.pagesRestUrl;
      if (!restNonce && src.restNonce) restNonce = src.restNonce;
    });
    return { restUrl, restNonce };
  }
  function allowedLinkTypes(field) {
    const raw = Array.isArray(field.link_types) ? field.link_types : LINK_TYPES;
    const list = raw.map(String).filter((t) => LINK_TYPES.includes(t));
    return list.length ? list : [...LINK_TYPES];
  }
  function normalizeLinkValue(current, allowed) {
    const empty = {
      type: allowed[0] || "url",
      url: "",
      title: "",
      page_id: 0,
      target: ""
    };
    if (!current || typeof current !== "object" || Array.isArray(current)) {
      return empty;
    }
    let type = String(current.type || "");
    if (!allowed.includes(type)) {
      type = allowed[0] || "url";
    }
    return {
      type,
      url: current.url != null ? String(current.url) : "",
      title: current.title != null ? String(current.title) : "",
      page_id: Number(current.page_id) || 0,
      target: current.target === "_blank" ? "_blank" : ""
    };
  }
  function displayDestination(state) {
    if (state.type === "email") {
      return String(state.url || "").replace(/^mailto:/i, "");
    }
    if (state.type === "phone") {
      return String(state.url || "").replace(/^tel:/i, "");
    }
    return String(state.url || "");
  }
  function normalizeLinkHref(raw) {
    const v = String(raw || "").trim();
    if (!v) return "";
    if (/^([/#?]|\/\/|[a-z][a-z0-9+.\-]*:)/i.test(v)) {
      return v;
    }
    return "https://" + v;
  }
  function destinationFieldLabel(type) {
    if (type === "page") return i18n2("linkDestPage", "Page");
    if (type === "email") return i18n2("linkDestEmail", "Email address");
    if (type === "phone") return i18n2("linkDestPhone", "Phone number");
    return i18n2("linkDestUrl", "URL");
  }
  function createLinkControl(field, current) {
    const allowed = allowedLinkTypes(field);
    const allowTarget = field.allow_target !== false;
    let state = normalizeLinkValue(current, allowed);
    let pageMeta = state.type === "page" && state.page_id > 0 ? { id: state.page_id, title: state.title || "", url: state.url || "" } : null;
    const root = el2("div", {
      className: "bl-blocks-fields__link",
      dataset: { blBlocksLinkField: "1" }
    });
    const typeRow = el2("div", { className: "bl-blocks-fields__link-types" });
    const destLabel = el2("label", { text: destinationFieldLabel(state.type) });
    const destWrap = el2("div", { className: "bl-blocks-fields__link-destination" });
    const destRow = el2("div", { className: "bl-blocks-fields__link-dest" }, [destLabel, destWrap]);
    const titleInput = el2("input", {
      type: "text",
      className: "widefat",
      value: state.title
    });
    const titleRow = el2("p", { className: "bl-blocks-fields__link-title" }, [
      el2("label", { text: i18n2("linkText", "Link text") }),
      titleInput
    ]);
    const targetInput = el2("input", { type: "checkbox" });
    const targetRow = el2("label", { className: "bl-blocks-fields__toggle bl-blocks-fields__link-target" }, [
      targetInput,
      document.createTextNode(" " + i18n2("linkOpenNewTab", "Open in new tab"))
    ]);
    const syncTargetVisibility = () => {
      const show = allowTarget && (state.type === "page" || state.type === "url");
      targetRow.hidden = !show;
      if (!show) {
        targetInput.checked = false;
        state.target = "";
      }
    };
    const renderDestination = () => {
      destLabel.textContent = destinationFieldLabel(state.type);
      destWrap.replaceChildren();
      if (state.type === "page") {
        const summary = el2("div", { className: "bl-blocks-fields__page-picker-summary" });
        const pickBtn = el2("button", {
          type: "button",
          className: "button bl-button-small",
          text: pageMeta ? i18n2("changePage", "Change page") : i18n2("choosePage", "Choose page")
        });
        const clearBtn = el2("button", {
          type: "button",
          className: "button-link",
          text: i18n2("clearPage", "Clear"),
          hidden: !pageMeta
        });
        if (pageMeta) {
          summary.appendChild(
            el2("span", {
              className: "bl-blocks-fields__page-picker-value",
              text: pageMeta.title || i18n2("selectedPage", "Selected page") + " #" + pageMeta.id
            })
          );
          if (pageMeta.url) {
            summary.appendChild(
              el2("span", {
                className: "description bl-blocks-fields__page-picker-url",
                text: pageMeta.url,
                title: pageMeta.url
              })
            );
          }
        } else {
          summary.appendChild(
            el2("span", {
              className: "description",
              text: i18n2("choosePageHelp", "Select a page.")
            })
          );
        }
        pickBtn.addEventListener("click", async () => {
          if (typeof openPagePicker !== "function") {
            console.error("Page picker is unavailable.");
            return;
          }
          const { restUrl, restNonce } = pickerConfig2();
          const page = await openPagePicker({
            selectedId: pageMeta ? pageMeta.id : 0,
            title: i18n2("pagePickerTitle", "Select a page"),
            searchPlaceholder: i18n2("pagePickerSearch", "Search pages\u2026"),
            empty: i18n2("pagePickerEmpty", "No pages found."),
            loading: i18n2("pagePickerLoading", "Loading\u2026"),
            cancelLabel: i18n2("cancel", "Cancel"),
            selectLabel: i18n2("selectPage", "Select"),
            restUrl,
            restNonce
          });
          if (!page) return;
          pageMeta = {
            id: Number(page.id) || 0,
            title: page.title || "",
            url: page.url || ""
          };
          state.page_id = pageMeta.id;
          state.url = pageMeta.url;
          if (!String(titleInput.value || "").trim() && pageMeta.title) {
            titleInput.value = pageMeta.title;
            state.title = pageMeta.title;
          }
          renderDestination();
        });
        clearBtn.addEventListener("click", () => {
          pageMeta = null;
          state.page_id = 0;
          state.url = "";
          renderDestination();
        });
        destWrap.appendChild(
          el2("div", { className: "bl-blocks-fields__page-picker-row" }, [
            summary,
            el2("div", { className: "bl-blocks-fields__page-picker-actions" }, [pickBtn, clearBtn])
          ])
        );
        return;
      }
      let inputType = "text";
      let value = displayDestination(state);
      if (state.type === "email") {
        inputType = "email";
      } else if (state.type === "phone") {
        inputType = "tel";
      } else if (state.type === "url") {
        value = normalizeLinkHref(value);
        state.url = value;
      }
      const input = el2("input", {
        type: inputType,
        className: "widefat",
        value
      });
      input.addEventListener("input", () => {
        state.url = input.value;
      });
      if (state.type === "url") {
        input.addEventListener("blur", () => {
          const next = normalizeLinkHref(input.value);
          if (next !== input.value) {
            input.value = next;
          }
          state.url = next;
        });
      }
      destWrap.appendChild(input);
    };
    if (allowed.length > 1) {
      const labels = {
        page: i18n2("linkTypePage", "Page"),
        url: i18n2("linkTypeUrl", "URL"),
        email: i18n2("linkTypeEmail", "Email"),
        phone: i18n2("linkTypePhone", "Phone")
      };
      allowed.forEach((type) => {
        const btn = el2("button", {
          type: "button",
          className: "button bl-button-small bl-blocks-fields__link-type" + (state.type === type ? " is-active" : ""),
          text: labels[type] || type,
          dataset: { linkType: type }
        });
        btn.addEventListener("click", () => {
          if (state.type === type) return;
          state.type = type;
          state.url = "";
          state.page_id = 0;
          state.target = "";
          pageMeta = null;
          targetInput.checked = false;
          typeRow.querySelectorAll("[data-link-type]").forEach((node) => {
            node.classList.toggle("is-active", node.dataset.linkType === type);
          });
          syncTargetVisibility();
          renderDestination();
        });
        typeRow.appendChild(btn);
      });
      root.appendChild(
        el2("div", { className: "bl-blocks-fields__link-type-block" }, [
          el2("label", { text: i18n2("linkTypeLabel", "Type") }),
          typeRow
        ])
      );
    }
    titleInput.addEventListener("input", () => {
      state.title = titleInput.value;
    });
    targetInput.checked = state.target === "_blank";
    targetInput.addEventListener("change", () => {
      state.target = targetInput.checked ? "_blank" : "";
    });
    root.append(destRow, titleRow, targetRow);
    syncTargetVisibility();
    renderDestination();
    if (state.type === "page" && state.page_id > 0 && (!pageMeta || !pageMeta.title)) {
      const { restUrl, restNonce } = pickerConfig2();
      if (restUrl) {
        fetch(String(restUrl).replace(/\/?$/, "/") + state.page_id + "?_fields=id,title,link", {
          headers: restNonce ? { "X-WP-Nonce": restNonce } : {}
        }).then((res) => res.ok ? res.json() : null).then((row) => {
          if (!row || Number(row.id) !== state.page_id) return;
          pageMeta = {
            id: state.page_id,
            title: row.title && row.title.rendered || "",
            url: row.link || ""
          };
          state.url = pageMeta.url;
          if (!String(titleInput.value || "").trim() && pageMeta.title) {
            titleInput.value = pageMeta.title;
            state.title = pageMeta.title;
          }
          renderDestination();
        }).catch(() => {
        });
      }
    }
    root.getLinkValue = () => {
      const destInput = destWrap.querySelector('input:not([type="hidden"])');
      const title = String(titleInput.value || "").trim();
      const out = {
        type: state.type,
        url: "",
        title
      };
      if (state.type === "page") {
        out.page_id = state.page_id > 0 ? state.page_id : 0;
        out.url = pageMeta && pageMeta.url || state.url || "";
      } else if (state.type === "email") {
        const email = String(destInput ? destInput.value : state.url || "").replace(/^mailto:/i, "").trim();
        out.url = email ? "mailto:" + email : "";
      } else if (state.type === "phone") {
        const phone = String(destInput ? destInput.value : state.url || "").replace(/^tel:/i, "").trim();
        out.url = phone ? "tel:" + phone : "";
      } else {
        const href = normalizeLinkHref(destInput ? destInput.value : state.url || "");
        out.url = href;
        if (destInput && destInput.value !== href) {
          destInput.value = href;
        }
        state.url = href;
      }
      if (allowTarget && (state.type === "page" || state.type === "url") && targetInput.checked) {
        out.target = "_blank";
      }
      return out;
    };
    return root;
  }
  function bindLinkFields(root = document) {
    root.querySelectorAll("[data-bl-blocks-link-field]").forEach((wrap) => {
      if (wrap.dataset.blLinkBound === "1") return;
      if (wrap.querySelector("[data-bl-link-interactive]")) return;
      wrap.dataset.blLinkBound = "1";
      const inputName = wrap.dataset.inputName || "";
      if (!inputName) return;
      let allowed = String(wrap.dataset.linkTypes || "").split(",").map((s) => s.trim()).filter((t) => LINK_TYPES.includes(t));
      if (!allowed.length) allowed = [...LINK_TYPES];
      const allowTarget = wrap.dataset.allowTarget === "1";
      const readHidden = () => {
        const get = (key) => {
          const input = wrap.querySelector(`[data-bl-link-key="${key}"]`);
          return input ? input.value : "";
        };
        return normalizeLinkValue(
          {
            type: get("type"),
            url: get("url"),
            title: get("title"),
            page_id: get("page_id"),
            target: get("target")
          },
          allowed
        );
      };
      const field = { link_types: allowed, allow_target: allowTarget };
      const control = createLinkControl(field, readHidden());
      control.dataset.blLinkInteractive = "1";
      const host = wrap.querySelector("[data-bl-link-ui]");
      const inputsHost = wrap.querySelector("[data-bl-link-inputs]");
      if (host) {
        host.replaceChildren(control);
      } else {
        wrap.appendChild(control);
      }
      const writeInputs = () => {
        if (!inputsHost) return;
        const value = control.getLinkValue();
        inputsHost.replaceChildren();
        const keys = ["type", "url", "title", "page_id"];
        keys.forEach((key) => {
          const val = value[key] != null ? String(value[key]) : "";
          const input = el2("input", {
            type: "hidden",
            name: `${inputName}[${key}]`,
            value: val,
            dataset: { blLinkKey: key }
          });
          inputsHost.appendChild(input);
        });
        if (value.target === "_blank") {
          inputsHost.appendChild(
            el2("input", {
              type: "hidden",
              name: `${inputName}[target]`,
              value: "_blank",
              dataset: { blLinkKey: "target" }
            })
          );
        }
      };
      const form = wrap.closest("form");
      if (form) {
        form.addEventListener("submit", writeInputs);
      }
      wrap.addEventListener("change", writeInputs);
      wrap.addEventListener("click", () => setTimeout(writeInputs, 0));
      writeInputs();
    });
  }

  // node_modules/sortablejs/modular/sortable.esm.js
  function _defineProperty(e, r, t) {
    return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
      value: t,
      enumerable: true,
      configurable: true,
      writable: true
    }) : e[r] = t, e;
  }
  function _extends() {
    return _extends = Object.assign ? Object.assign.bind() : function(n) {
      for (var e = 1; e < arguments.length; e++) {
        var t = arguments[e];
        for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
      }
      return n;
    }, _extends.apply(null, arguments);
  }
  function ownKeys(e, r) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r && (o = o.filter(function(r2) {
        return Object.getOwnPropertyDescriptor(e, r2).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread2(e) {
    for (var r = 1; r < arguments.length; r++) {
      var t = null != arguments[r] ? arguments[r] : {};
      r % 2 ? ownKeys(Object(t), true).forEach(function(r2) {
        _defineProperty(e, r2, t[r2]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function(r2) {
        Object.defineProperty(e, r2, Object.getOwnPropertyDescriptor(t, r2));
      });
    }
    return e;
  }
  function _objectWithoutProperties(e, t) {
    if (null == e) return {};
    var o, r, i = _objectWithoutPropertiesLoose(e, t);
    if (Object.getOwnPropertySymbols) {
      var n = Object.getOwnPropertySymbols(e);
      for (r = 0; r < n.length; r++) o = n[r], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]);
    }
    return i;
  }
  function _objectWithoutPropertiesLoose(r, e) {
    if (null == r) return {};
    var t = {};
    for (var n in r) if ({}.hasOwnProperty.call(r, n)) {
      if (-1 !== e.indexOf(n)) continue;
      t[n] = r[n];
    }
    return t;
  }
  function _toPrimitive(t, r) {
    if ("object" != typeof t || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t, r || "default");
      if ("object" != typeof i) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r ? String : Number)(t);
  }
  function _toPropertyKey(t) {
    var i = _toPrimitive(t, "string");
    return "symbol" == typeof i ? i : i + "";
  }
  function _typeof(o) {
    "@babel/helpers - typeof";
    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
      return typeof o2;
    } : function(o2) {
      return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
    }, _typeof(o);
  }
  var version = "1.15.7";
  function userAgent(pattern) {
    if (typeof window !== "undefined" && window.navigator) {
      return !!/* @__PURE__ */ navigator.userAgent.match(pattern);
    }
  }
  var IE11OrLess = userAgent(/(?:Trident.*rv[ :]?11\.|msie|iemobile|Windows Phone)/i);
  var Edge = userAgent(/Edge/i);
  var FireFox = userAgent(/firefox/i);
  var Safari = userAgent(/safari/i) && !userAgent(/chrome/i) && !userAgent(/android/i);
  var IOS = userAgent(/iP(ad|od|hone)/i);
  var ChromeForAndroid = userAgent(/chrome/i) && userAgent(/android/i);
  var captureMode = {
    capture: false,
    passive: false
  };
  function on(el5, event, fn) {
    el5.addEventListener(event, fn, !IE11OrLess && captureMode);
  }
  function off(el5, event, fn) {
    el5.removeEventListener(event, fn, !IE11OrLess && captureMode);
  }
  function matches(el5, selector) {
    if (!selector) return;
    selector[0] === ">" && (selector = selector.substring(1));
    if (el5) {
      try {
        if (el5.matches) {
          return el5.matches(selector);
        } else if (el5.msMatchesSelector) {
          return el5.msMatchesSelector(selector);
        } else if (el5.webkitMatchesSelector) {
          return el5.webkitMatchesSelector(selector);
        }
      } catch (_) {
        return false;
      }
    }
    return false;
  }
  function getParentOrHost(el5) {
    return el5.host && el5 !== document && el5.host.nodeType && el5.host !== el5 ? el5.host : el5.parentNode;
  }
  function closest(el5, selector, ctx, includeCTX) {
    if (el5) {
      ctx = ctx || document;
      do {
        if (selector != null && (selector[0] === ">" ? el5.parentNode === ctx && matches(el5, selector) : matches(el5, selector)) || includeCTX && el5 === ctx) {
          return el5;
        }
        if (el5 === ctx) break;
      } while (el5 = getParentOrHost(el5));
    }
    return null;
  }
  var R_SPACE = /\s+/g;
  function toggleClass(el5, name, state) {
    if (el5 && name) {
      if (el5.classList) {
        el5.classList[state ? "add" : "remove"](name);
      } else {
        var className = (" " + el5.className + " ").replace(R_SPACE, " ").replace(" " + name + " ", " ");
        el5.className = (className + (state ? " " + name : "")).replace(R_SPACE, " ");
      }
    }
  }
  function css(el5, prop, val) {
    var style = el5 && el5.style;
    if (style) {
      if (val === void 0) {
        if (document.defaultView && document.defaultView.getComputedStyle) {
          val = document.defaultView.getComputedStyle(el5, "");
        } else if (el5.currentStyle) {
          val = el5.currentStyle;
        }
        return prop === void 0 ? val : val[prop];
      } else {
        if (!(prop in style) && prop.indexOf("webkit") === -1) {
          prop = "-webkit-" + prop;
        }
        style[prop] = val + (typeof val === "string" ? "" : "px");
      }
    }
  }
  function matrix(el5, selfOnly) {
    var appliedTransforms = "";
    if (typeof el5 === "string") {
      appliedTransforms = el5;
    } else {
      do {
        var transform = css(el5, "transform");
        if (transform && transform !== "none") {
          appliedTransforms = transform + " " + appliedTransforms;
        }
      } while (!selfOnly && (el5 = el5.parentNode));
    }
    var matrixFn = window.DOMMatrix || window.WebKitCSSMatrix || window.CSSMatrix || window.MSCSSMatrix;
    return matrixFn && new matrixFn(appliedTransforms);
  }
  function find(ctx, tagName, iterator) {
    if (ctx) {
      var list = ctx.getElementsByTagName(tagName), i = 0, n = list.length;
      if (iterator) {
        for (; i < n; i++) {
          iterator(list[i], i);
        }
      }
      return list;
    }
    return [];
  }
  function getWindowScrollingElement() {
    var scrollingElement = document.scrollingElement;
    if (scrollingElement) {
      return scrollingElement;
    } else {
      return document.documentElement;
    }
  }
  function getRect(el5, relativeToContainingBlock, relativeToNonStaticParent, undoScale, container) {
    if (!el5.getBoundingClientRect && el5 !== window) return;
    var elRect, top, left, bottom, right, height, width;
    if (el5 !== window && el5.parentNode && el5 !== getWindowScrollingElement()) {
      elRect = el5.getBoundingClientRect();
      top = elRect.top;
      left = elRect.left;
      bottom = elRect.bottom;
      right = elRect.right;
      height = elRect.height;
      width = elRect.width;
    } else {
      top = 0;
      left = 0;
      bottom = window.innerHeight;
      right = window.innerWidth;
      height = window.innerHeight;
      width = window.innerWidth;
    }
    if ((relativeToContainingBlock || relativeToNonStaticParent) && el5 !== window) {
      container = container || el5.parentNode;
      if (!IE11OrLess) {
        do {
          if (container && container.getBoundingClientRect && (css(container, "transform") !== "none" || relativeToNonStaticParent && css(container, "position") !== "static")) {
            var containerRect = container.getBoundingClientRect();
            top -= containerRect.top + parseInt(css(container, "border-top-width"));
            left -= containerRect.left + parseInt(css(container, "border-left-width"));
            bottom = top + elRect.height;
            right = left + elRect.width;
            break;
          }
        } while (container = container.parentNode);
      }
    }
    if (undoScale && el5 !== window) {
      var elMatrix = matrix(container || el5), scaleX = elMatrix && elMatrix.a, scaleY = elMatrix && elMatrix.d;
      if (elMatrix) {
        top /= scaleY;
        left /= scaleX;
        width /= scaleX;
        height /= scaleY;
        bottom = top + height;
        right = left + width;
      }
    }
    return {
      top,
      left,
      bottom,
      right,
      width,
      height
    };
  }
  function isScrolledPast(el5, elSide, parentSide) {
    var parent = getParentAutoScrollElement(el5, true), elSideVal = getRect(el5)[elSide];
    while (parent) {
      var parentSideVal = getRect(parent)[parentSide], visible = void 0;
      if (parentSide === "top" || parentSide === "left") {
        visible = elSideVal >= parentSideVal;
      } else {
        visible = elSideVal <= parentSideVal;
      }
      if (!visible) return parent;
      if (parent === getWindowScrollingElement()) break;
      parent = getParentAutoScrollElement(parent, false);
    }
    return false;
  }
  function getChild(el5, childNum, options, includeDragEl) {
    var currentChild = 0, i = 0, children = el5.children;
    while (i < children.length) {
      if (children[i].style.display !== "none" && children[i] !== Sortable.ghost && (includeDragEl || children[i] !== Sortable.dragged) && closest(children[i], options.draggable, el5, false)) {
        if (currentChild === childNum) {
          return children[i];
        }
        currentChild++;
      }
      i++;
    }
    return null;
  }
  function lastChild(el5, selector) {
    var last = el5.lastElementChild;
    while (last && (last === Sortable.ghost || css(last, "display") === "none" || selector && !matches(last, selector))) {
      last = last.previousElementSibling;
    }
    return last || null;
  }
  function index(el5, selector) {
    var index2 = 0;
    if (!el5 || !el5.parentNode) {
      return -1;
    }
    while (el5 = el5.previousElementSibling) {
      if (el5.nodeName.toUpperCase() !== "TEMPLATE" && el5 !== Sortable.clone && (!selector || matches(el5, selector))) {
        index2++;
      }
    }
    return index2;
  }
  function getRelativeScrollOffset(el5) {
    var offsetLeft = 0, offsetTop = 0, winScroller = getWindowScrollingElement();
    if (el5) {
      do {
        var elMatrix = matrix(el5), scaleX = elMatrix.a, scaleY = elMatrix.d;
        offsetLeft += el5.scrollLeft * scaleX;
        offsetTop += el5.scrollTop * scaleY;
      } while (el5 !== winScroller && (el5 = el5.parentNode));
    }
    return [offsetLeft, offsetTop];
  }
  function indexOfObject(arr, obj) {
    for (var i in arr) {
      if (!arr.hasOwnProperty(i)) continue;
      for (var key in obj) {
        if (obj.hasOwnProperty(key) && obj[key] === arr[i][key]) return Number(i);
      }
    }
    return -1;
  }
  function getParentAutoScrollElement(el5, includeSelf) {
    if (!el5 || !el5.getBoundingClientRect) return getWindowScrollingElement();
    var elem = el5;
    var gotSelf = false;
    do {
      if (elem.clientWidth < elem.scrollWidth || elem.clientHeight < elem.scrollHeight) {
        var elemCSS = css(elem);
        if (elem.clientWidth < elem.scrollWidth && (elemCSS.overflowX == "auto" || elemCSS.overflowX == "scroll") || elem.clientHeight < elem.scrollHeight && (elemCSS.overflowY == "auto" || elemCSS.overflowY == "scroll")) {
          if (!elem.getBoundingClientRect || elem === document.body) return getWindowScrollingElement();
          if (gotSelf || includeSelf) return elem;
          gotSelf = true;
        }
      }
    } while (elem = elem.parentNode);
    return getWindowScrollingElement();
  }
  function extend(dst, src) {
    if (dst && src) {
      for (var key in src) {
        if (src.hasOwnProperty(key)) {
          dst[key] = src[key];
        }
      }
    }
    return dst;
  }
  function isRectEqual(rect1, rect2) {
    return Math.round(rect1.top) === Math.round(rect2.top) && Math.round(rect1.left) === Math.round(rect2.left) && Math.round(rect1.height) === Math.round(rect2.height) && Math.round(rect1.width) === Math.round(rect2.width);
  }
  var _throttleTimeout;
  function throttle(callback, ms) {
    return function() {
      if (!_throttleTimeout) {
        var args = arguments, _this = this;
        if (args.length === 1) {
          callback.call(_this, args[0]);
        } else {
          callback.apply(_this, args);
        }
        _throttleTimeout = setTimeout(function() {
          _throttleTimeout = void 0;
        }, ms);
      }
    };
  }
  function cancelThrottle() {
    clearTimeout(_throttleTimeout);
    _throttleTimeout = void 0;
  }
  function scrollBy(el5, x, y) {
    el5.scrollLeft += x;
    el5.scrollTop += y;
  }
  function clone(el5) {
    var Polymer = window.Polymer;
    var $ = window.jQuery || window.Zepto;
    if (Polymer && Polymer.dom) {
      return Polymer.dom(el5).cloneNode(true);
    } else if ($) {
      return $(el5).clone(true)[0];
    } else {
      return el5.cloneNode(true);
    }
  }
  function getChildContainingRectFromElement(container, options, ghostEl2) {
    var rect = {};
    Array.from(container.children).forEach(function(child) {
      var _rect$left, _rect$top, _rect$right, _rect$bottom;
      if (!closest(child, options.draggable, container, false) || child.animated || child === ghostEl2) return;
      var childRect = getRect(child);
      rect.left = Math.min((_rect$left = rect.left) !== null && _rect$left !== void 0 ? _rect$left : Infinity, childRect.left);
      rect.top = Math.min((_rect$top = rect.top) !== null && _rect$top !== void 0 ? _rect$top : Infinity, childRect.top);
      rect.right = Math.max((_rect$right = rect.right) !== null && _rect$right !== void 0 ? _rect$right : -Infinity, childRect.right);
      rect.bottom = Math.max((_rect$bottom = rect.bottom) !== null && _rect$bottom !== void 0 ? _rect$bottom : -Infinity, childRect.bottom);
    });
    rect.width = rect.right - rect.left;
    rect.height = rect.bottom - rect.top;
    rect.x = rect.left;
    rect.y = rect.top;
    return rect;
  }
  var expando = "Sortable" + (/* @__PURE__ */ new Date()).getTime();
  function AnimationStateManager() {
    var animationStates = [], animationCallbackId;
    return {
      captureAnimationState: function captureAnimationState() {
        animationStates = [];
        if (!this.options.animation) return;
        var children = [].slice.call(this.el.children);
        children.forEach(function(child) {
          if (css(child, "display") === "none" || child === Sortable.ghost) return;
          animationStates.push({
            target: child,
            rect: getRect(child)
          });
          var fromRect = _objectSpread2({}, animationStates[animationStates.length - 1].rect);
          if (child.thisAnimationDuration) {
            var childMatrix = matrix(child, true);
            if (childMatrix) {
              fromRect.top -= childMatrix.f;
              fromRect.left -= childMatrix.e;
            }
          }
          child.fromRect = fromRect;
        });
      },
      addAnimationState: function addAnimationState(state) {
        animationStates.push(state);
      },
      removeAnimationState: function removeAnimationState(target) {
        animationStates.splice(indexOfObject(animationStates, {
          target
        }), 1);
      },
      animateAll: function animateAll(callback) {
        var _this = this;
        if (!this.options.animation) {
          clearTimeout(animationCallbackId);
          if (typeof callback === "function") callback();
          return;
        }
        var animating = false, animationTime = 0;
        animationStates.forEach(function(state) {
          var time = 0, target = state.target, fromRect = target.fromRect, toRect = getRect(target), prevFromRect = target.prevFromRect, prevToRect = target.prevToRect, animatingRect = state.rect, targetMatrix = matrix(target, true);
          if (targetMatrix) {
            toRect.top -= targetMatrix.f;
            toRect.left -= targetMatrix.e;
          }
          target.toRect = toRect;
          if (target.thisAnimationDuration) {
            if (isRectEqual(prevFromRect, toRect) && !isRectEqual(fromRect, toRect) && // Make sure animatingRect is on line between toRect & fromRect
            (animatingRect.top - toRect.top) / (animatingRect.left - toRect.left) === (fromRect.top - toRect.top) / (fromRect.left - toRect.left)) {
              time = calculateRealTime(animatingRect, prevFromRect, prevToRect, _this.options);
            }
          }
          if (!isRectEqual(toRect, fromRect)) {
            target.prevFromRect = fromRect;
            target.prevToRect = toRect;
            if (!time) {
              time = _this.options.animation;
            }
            _this.animate(target, animatingRect, toRect, time);
          }
          if (time) {
            animating = true;
            animationTime = Math.max(animationTime, time);
            clearTimeout(target.animationResetTimer);
            target.animationResetTimer = setTimeout(function() {
              target.animationTime = 0;
              target.prevFromRect = null;
              target.fromRect = null;
              target.prevToRect = null;
              target.thisAnimationDuration = null;
            }, time);
            target.thisAnimationDuration = time;
          }
        });
        clearTimeout(animationCallbackId);
        if (!animating) {
          if (typeof callback === "function") callback();
        } else {
          animationCallbackId = setTimeout(function() {
            if (typeof callback === "function") callback();
          }, animationTime);
        }
        animationStates = [];
      },
      animate: function animate(target, currentRect, toRect, duration) {
        if (duration) {
          css(target, "transition", "");
          css(target, "transform", "");
          var elMatrix = matrix(this.el), scaleX = elMatrix && elMatrix.a, scaleY = elMatrix && elMatrix.d, translateX = (currentRect.left - toRect.left) / (scaleX || 1), translateY = (currentRect.top - toRect.top) / (scaleY || 1);
          target.animatingX = !!translateX;
          target.animatingY = !!translateY;
          css(target, "transform", "translate3d(" + translateX + "px," + translateY + "px,0)");
          this.forRepaintDummy = repaint(target);
          css(target, "transition", "transform " + duration + "ms" + (this.options.easing ? " " + this.options.easing : ""));
          css(target, "transform", "translate3d(0,0,0)");
          typeof target.animated === "number" && clearTimeout(target.animated);
          target.animated = setTimeout(function() {
            css(target, "transition", "");
            css(target, "transform", "");
            target.animated = false;
            target.animatingX = false;
            target.animatingY = false;
          }, duration);
        }
      }
    };
  }
  function repaint(target) {
    return target.offsetWidth;
  }
  function calculateRealTime(animatingRect, fromRect, toRect, options) {
    return Math.sqrt(Math.pow(fromRect.top - animatingRect.top, 2) + Math.pow(fromRect.left - animatingRect.left, 2)) / Math.sqrt(Math.pow(fromRect.top - toRect.top, 2) + Math.pow(fromRect.left - toRect.left, 2)) * options.animation;
  }
  var plugins = [];
  var defaults = {
    initializeByDefault: true
  };
  var PluginManager = {
    mount: function mount(plugin) {
      for (var option2 in defaults) {
        if (defaults.hasOwnProperty(option2) && !(option2 in plugin)) {
          plugin[option2] = defaults[option2];
        }
      }
      plugins.forEach(function(p) {
        if (p.pluginName === plugin.pluginName) {
          throw "Sortable: Cannot mount plugin ".concat(plugin.pluginName, " more than once");
        }
      });
      plugins.push(plugin);
    },
    pluginEvent: function pluginEvent(eventName, sortable, evt) {
      var _this = this;
      this.eventCanceled = false;
      evt.cancel = function() {
        _this.eventCanceled = true;
      };
      var eventNameGlobal = eventName + "Global";
      plugins.forEach(function(plugin) {
        if (!sortable[plugin.pluginName]) return;
        if (sortable[plugin.pluginName][eventNameGlobal]) {
          sortable[plugin.pluginName][eventNameGlobal](_objectSpread2({
            sortable
          }, evt));
        }
        if (sortable.options[plugin.pluginName] && sortable[plugin.pluginName][eventName]) {
          sortable[plugin.pluginName][eventName](_objectSpread2({
            sortable
          }, evt));
        }
      });
    },
    initializePlugins: function initializePlugins(sortable, el5, defaults2, options) {
      plugins.forEach(function(plugin) {
        var pluginName = plugin.pluginName;
        if (!sortable.options[pluginName] && !plugin.initializeByDefault) return;
        var initialized = new plugin(sortable, el5, sortable.options);
        initialized.sortable = sortable;
        initialized.options = sortable.options;
        sortable[pluginName] = initialized;
        _extends(defaults2, initialized.defaults);
      });
      for (var option2 in sortable.options) {
        if (!sortable.options.hasOwnProperty(option2)) continue;
        var modified = this.modifyOption(sortable, option2, sortable.options[option2]);
        if (typeof modified !== "undefined") {
          sortable.options[option2] = modified;
        }
      }
    },
    getEventProperties: function getEventProperties(name, sortable) {
      var eventProperties = {};
      plugins.forEach(function(plugin) {
        if (typeof plugin.eventProperties !== "function") return;
        _extends(eventProperties, plugin.eventProperties.call(sortable[plugin.pluginName], name));
      });
      return eventProperties;
    },
    modifyOption: function modifyOption(sortable, name, value) {
      var modifiedValue;
      plugins.forEach(function(plugin) {
        if (!sortable[plugin.pluginName]) return;
        if (plugin.optionListeners && typeof plugin.optionListeners[name] === "function") {
          modifiedValue = plugin.optionListeners[name].call(sortable[plugin.pluginName], value);
        }
      });
      return modifiedValue;
    }
  };
  function dispatchEvent(_ref) {
    var sortable = _ref.sortable, rootEl2 = _ref.rootEl, name = _ref.name, targetEl = _ref.targetEl, cloneEl2 = _ref.cloneEl, toEl = _ref.toEl, fromEl = _ref.fromEl, oldIndex2 = _ref.oldIndex, newIndex2 = _ref.newIndex, oldDraggableIndex2 = _ref.oldDraggableIndex, newDraggableIndex2 = _ref.newDraggableIndex, originalEvent = _ref.originalEvent, putSortable2 = _ref.putSortable, extraEventProperties = _ref.extraEventProperties;
    sortable = sortable || rootEl2 && rootEl2[expando];
    if (!sortable) return;
    var evt, options = sortable.options, onName = "on" + name.charAt(0).toUpperCase() + name.substr(1);
    if (window.CustomEvent && !IE11OrLess && !Edge) {
      evt = new CustomEvent(name, {
        bubbles: true,
        cancelable: true
      });
    } else {
      evt = document.createEvent("Event");
      evt.initEvent(name, true, true);
    }
    evt.to = toEl || rootEl2;
    evt.from = fromEl || rootEl2;
    evt.item = targetEl || rootEl2;
    evt.clone = cloneEl2;
    evt.oldIndex = oldIndex2;
    evt.newIndex = newIndex2;
    evt.oldDraggableIndex = oldDraggableIndex2;
    evt.newDraggableIndex = newDraggableIndex2;
    evt.originalEvent = originalEvent;
    evt.pullMode = putSortable2 ? putSortable2.lastPutMode : void 0;
    var allEventProperties = _objectSpread2(_objectSpread2({}, extraEventProperties), PluginManager.getEventProperties(name, sortable));
    for (var option2 in allEventProperties) {
      evt[option2] = allEventProperties[option2];
    }
    if (rootEl2) {
      rootEl2.dispatchEvent(evt);
    }
    if (options[onName]) {
      options[onName].call(sortable, evt);
    }
  }
  var _excluded = ["evt"];
  var pluginEvent2 = function pluginEvent3(eventName, sortable) {
    var _ref = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {}, originalEvent = _ref.evt, data = _objectWithoutProperties(_ref, _excluded);
    PluginManager.pluginEvent.bind(Sortable)(eventName, sortable, _objectSpread2({
      dragEl,
      parentEl,
      ghostEl,
      rootEl,
      nextEl,
      lastDownEl,
      cloneEl,
      cloneHidden,
      dragStarted: moved,
      putSortable,
      activeSortable: Sortable.active,
      originalEvent,
      oldIndex,
      oldDraggableIndex,
      newIndex,
      newDraggableIndex,
      hideGhostForTarget: _hideGhostForTarget,
      unhideGhostForTarget: _unhideGhostForTarget,
      cloneNowHidden: function cloneNowHidden() {
        cloneHidden = true;
      },
      cloneNowShown: function cloneNowShown() {
        cloneHidden = false;
      },
      dispatchSortableEvent: function dispatchSortableEvent(name) {
        _dispatchEvent({
          sortable,
          name,
          originalEvent
        });
      }
    }, data));
  };
  function _dispatchEvent(info) {
    dispatchEvent(_objectSpread2({
      putSortable,
      cloneEl,
      targetEl: dragEl,
      rootEl,
      oldIndex,
      oldDraggableIndex,
      newIndex,
      newDraggableIndex
    }, info));
  }
  var dragEl;
  var parentEl;
  var ghostEl;
  var rootEl;
  var nextEl;
  var lastDownEl;
  var cloneEl;
  var cloneHidden;
  var oldIndex;
  var newIndex;
  var oldDraggableIndex;
  var newDraggableIndex;
  var activeGroup;
  var putSortable;
  var awaitingDragStarted = false;
  var ignoreNextClick = false;
  var sortables = [];
  var tapEvt;
  var touchEvt;
  var lastDx;
  var lastDy;
  var tapDistanceLeft;
  var tapDistanceTop;
  var moved;
  var lastTarget;
  var lastDirection;
  var pastFirstInvertThresh = false;
  var isCircumstantialInvert = false;
  var targetMoveDistance;
  var ghostRelativeParent;
  var ghostRelativeParentInitialScroll = [];
  var _silent = false;
  var savedInputChecked = [];
  var documentExists = typeof document !== "undefined";
  var PositionGhostAbsolutely = IOS;
  var CSSFloatProperty = Edge || IE11OrLess ? "cssFloat" : "float";
  var supportDraggable = documentExists && !ChromeForAndroid && !IOS && "draggable" in document.createElement("div");
  var supportCssPointerEvents = (function() {
    if (!documentExists) return;
    if (IE11OrLess) {
      return false;
    }
    var el5 = document.createElement("x");
    el5.style.cssText = "pointer-events:auto";
    return el5.style.pointerEvents === "auto";
  })();
  var _detectDirection = function _detectDirection2(el5, options) {
    var elCSS = css(el5), elWidth = parseInt(elCSS.width) - parseInt(elCSS.paddingLeft) - parseInt(elCSS.paddingRight) - parseInt(elCSS.borderLeftWidth) - parseInt(elCSS.borderRightWidth), child1 = getChild(el5, 0, options), child2 = getChild(el5, 1, options), firstChildCSS = child1 && css(child1), secondChildCSS = child2 && css(child2), firstChildWidth = firstChildCSS && parseInt(firstChildCSS.marginLeft) + parseInt(firstChildCSS.marginRight) + getRect(child1).width, secondChildWidth = secondChildCSS && parseInt(secondChildCSS.marginLeft) + parseInt(secondChildCSS.marginRight) + getRect(child2).width;
    if (elCSS.display === "flex") {
      return elCSS.flexDirection === "column" || elCSS.flexDirection === "column-reverse" ? "vertical" : "horizontal";
    }
    if (elCSS.display === "grid") {
      return elCSS.gridTemplateColumns.split(" ").length <= 1 ? "vertical" : "horizontal";
    }
    if (child1 && firstChildCSS["float"] && firstChildCSS["float"] !== "none") {
      var touchingSideChild2 = firstChildCSS["float"] === "left" ? "left" : "right";
      return child2 && (secondChildCSS.clear === "both" || secondChildCSS.clear === touchingSideChild2) ? "vertical" : "horizontal";
    }
    return child1 && (firstChildCSS.display === "block" || firstChildCSS.display === "flex" || firstChildCSS.display === "table" || firstChildCSS.display === "grid" || firstChildWidth >= elWidth && elCSS[CSSFloatProperty] === "none" || child2 && elCSS[CSSFloatProperty] === "none" && firstChildWidth + secondChildWidth > elWidth) ? "vertical" : "horizontal";
  };
  var _dragElInRowColumn = function _dragElInRowColumn2(dragRect, targetRect, vertical) {
    var dragElS1Opp = vertical ? dragRect.left : dragRect.top, dragElS2Opp = vertical ? dragRect.right : dragRect.bottom, dragElOppLength = vertical ? dragRect.width : dragRect.height, targetS1Opp = vertical ? targetRect.left : targetRect.top, targetS2Opp = vertical ? targetRect.right : targetRect.bottom, targetOppLength = vertical ? targetRect.width : targetRect.height;
    return dragElS1Opp === targetS1Opp || dragElS2Opp === targetS2Opp || dragElS1Opp + dragElOppLength / 2 === targetS1Opp + targetOppLength / 2;
  };
  var _detectNearestEmptySortable = function _detectNearestEmptySortable2(x, y) {
    var ret;
    sortables.some(function(sortable) {
      var threshold = sortable[expando].options.emptyInsertThreshold;
      if (!threshold || lastChild(sortable)) return;
      var rect = getRect(sortable), insideHorizontally = x >= rect.left - threshold && x <= rect.right + threshold, insideVertically = y >= rect.top - threshold && y <= rect.bottom + threshold;
      if (insideHorizontally && insideVertically) {
        return ret = sortable;
      }
    });
    return ret;
  };
  var _prepareGroup = function _prepareGroup2(options) {
    function toFn(value, pull) {
      return function(to, from, dragEl2, evt) {
        var sameGroup = to.options.group.name && from.options.group.name && to.options.group.name === from.options.group.name;
        if (value == null && (pull || sameGroup)) {
          return true;
        } else if (value == null || value === false) {
          return false;
        } else if (pull && value === "clone") {
          return value;
        } else if (typeof value === "function") {
          return toFn(value(to, from, dragEl2, evt), pull)(to, from, dragEl2, evt);
        } else {
          var otherGroup = (pull ? to : from).options.group.name;
          return value === true || typeof value === "string" && value === otherGroup || value.join && value.indexOf(otherGroup) > -1;
        }
      };
    }
    var group = {};
    var originalGroup = options.group;
    if (!originalGroup || _typeof(originalGroup) != "object") {
      originalGroup = {
        name: originalGroup
      };
    }
    group.name = originalGroup.name;
    group.checkPull = toFn(originalGroup.pull, true);
    group.checkPut = toFn(originalGroup.put);
    group.revertClone = originalGroup.revertClone;
    options.group = group;
  };
  var _hideGhostForTarget = function _hideGhostForTarget2() {
    if (!supportCssPointerEvents && ghostEl) {
      css(ghostEl, "display", "none");
    }
  };
  var _unhideGhostForTarget = function _unhideGhostForTarget2() {
    if (!supportCssPointerEvents && ghostEl) {
      css(ghostEl, "display", "");
    }
  };
  if (documentExists && !ChromeForAndroid) {
    document.addEventListener("click", function(evt) {
      if (ignoreNextClick) {
        evt.preventDefault();
        evt.stopPropagation && evt.stopPropagation();
        evt.stopImmediatePropagation && evt.stopImmediatePropagation();
        ignoreNextClick = false;
        return false;
      }
    }, true);
  }
  var nearestEmptyInsertDetectEvent = function nearestEmptyInsertDetectEvent2(evt) {
    if (dragEl) {
      evt = evt.touches ? evt.touches[0] : evt;
      var nearest = _detectNearestEmptySortable(evt.clientX, evt.clientY);
      if (nearest) {
        var event = {};
        for (var i in evt) {
          if (evt.hasOwnProperty(i)) {
            event[i] = evt[i];
          }
        }
        event.target = event.rootEl = nearest;
        event.preventDefault = void 0;
        event.stopPropagation = void 0;
        nearest[expando]._onDragOver(event);
      }
    }
  };
  var _checkOutsideTargetEl = function _checkOutsideTargetEl2(evt) {
    if (dragEl) {
      dragEl.parentNode[expando]._isOutsideThisEl(evt.target);
    }
  };
  function Sortable(el5, options) {
    if (!(el5 && el5.nodeType && el5.nodeType === 1)) {
      throw "Sortable: `el` must be an HTMLElement, not ".concat({}.toString.call(el5));
    }
    this.el = el5;
    this.options = options = _extends({}, options);
    el5[expando] = this;
    var defaults2 = {
      group: null,
      sort: true,
      disabled: false,
      store: null,
      handle: null,
      draggable: /^[uo]l$/i.test(el5.nodeName) ? ">li" : ">*",
      swapThreshold: 1,
      // percentage; 0 <= x <= 1
      invertSwap: false,
      // invert always
      invertedSwapThreshold: null,
      // will be set to same as swapThreshold if default
      removeCloneOnHide: true,
      direction: function direction() {
        return _detectDirection(el5, this.options);
      },
      ghostClass: "sortable-ghost",
      chosenClass: "sortable-chosen",
      dragClass: "sortable-drag",
      ignore: "a, img",
      filter: null,
      preventOnFilter: true,
      animation: 0,
      easing: null,
      setData: function setData(dataTransfer, dragEl2) {
        dataTransfer.setData("Text", dragEl2.textContent);
      },
      dropBubble: false,
      dragoverBubble: false,
      dataIdAttr: "data-id",
      delay: 0,
      delayOnTouchOnly: false,
      touchStartThreshold: (Number.parseInt ? Number : window).parseInt(window.devicePixelRatio, 10) || 1,
      forceFallback: false,
      fallbackClass: "sortable-fallback",
      fallbackOnBody: false,
      fallbackTolerance: 0,
      fallbackOffset: {
        x: 0,
        y: 0
      },
      // Disabled on Safari: #1571; Enabled on Safari IOS: #2244
      supportPointer: Sortable.supportPointer !== false && "PointerEvent" in window && (!Safari || IOS),
      emptyInsertThreshold: 5
    };
    PluginManager.initializePlugins(this, el5, defaults2);
    for (var name in defaults2) {
      !(name in options) && (options[name] = defaults2[name]);
    }
    _prepareGroup(options);
    for (var fn in this) {
      if (fn.charAt(0) === "_" && typeof this[fn] === "function") {
        this[fn] = this[fn].bind(this);
      }
    }
    this.nativeDraggable = options.forceFallback ? false : supportDraggable;
    if (this.nativeDraggable) {
      this.options.touchStartThreshold = 1;
    }
    if (options.supportPointer) {
      on(el5, "pointerdown", this._onTapStart);
    } else {
      on(el5, "mousedown", this._onTapStart);
      on(el5, "touchstart", this._onTapStart);
    }
    if (this.nativeDraggable) {
      on(el5, "dragover", this);
      on(el5, "dragenter", this);
    }
    sortables.push(this.el);
    options.store && options.store.get && this.sort(options.store.get(this) || []);
    _extends(this, AnimationStateManager());
  }
  Sortable.prototype = /** @lends Sortable.prototype */
  {
    constructor: Sortable,
    _isOutsideThisEl: function _isOutsideThisEl(target) {
      if (!this.el.contains(target) && target !== this.el) {
        lastTarget = null;
      }
    },
    _getDirection: function _getDirection(evt, target) {
      return typeof this.options.direction === "function" ? this.options.direction.call(this, evt, target, dragEl) : this.options.direction;
    },
    _onTapStart: function _onTapStart(evt) {
      if (!evt.cancelable) return;
      var _this = this, el5 = this.el, options = this.options, preventOnFilter = options.preventOnFilter, type = evt.type, touch = evt.touches && evt.touches[0] || evt.pointerType && evt.pointerType === "touch" && evt, target = (touch || evt).target, originalTarget = evt.target.shadowRoot && (evt.path && evt.path[0] || evt.composedPath && evt.composedPath()[0]) || target, filter = options.filter;
      _saveInputCheckedState(el5);
      if (dragEl) {
        return;
      }
      if (/mousedown|pointerdown/.test(type) && evt.button !== 0 || options.disabled) {
        return;
      }
      if (originalTarget.isContentEditable) {
        return;
      }
      if (!this.nativeDraggable && Safari && target && target.tagName.toUpperCase() === "SELECT") {
        return;
      }
      target = closest(target, options.draggable, el5, false);
      if (target && target.animated) {
        return;
      }
      if (lastDownEl === target) {
        return;
      }
      oldIndex = index(target);
      oldDraggableIndex = index(target, options.draggable);
      if (typeof filter === "function") {
        if (filter.call(this, evt, target, this)) {
          _dispatchEvent({
            sortable: _this,
            rootEl: originalTarget,
            name: "filter",
            targetEl: target,
            toEl: el5,
            fromEl: el5
          });
          pluginEvent2("filter", _this, {
            evt
          });
          preventOnFilter && evt.preventDefault();
          return;
        }
      } else if (filter) {
        filter = filter.split(",").some(function(criteria) {
          criteria = closest(originalTarget, criteria.trim(), el5, false);
          if (criteria) {
            _dispatchEvent({
              sortable: _this,
              rootEl: criteria,
              name: "filter",
              targetEl: target,
              fromEl: el5,
              toEl: el5
            });
            pluginEvent2("filter", _this, {
              evt
            });
            return true;
          }
        });
        if (filter) {
          preventOnFilter && evt.preventDefault();
          return;
        }
      }
      if (options.handle && !closest(originalTarget, options.handle, el5, false)) {
        return;
      }
      this._prepareDragStart(evt, touch, target);
    },
    _prepareDragStart: function _prepareDragStart(evt, touch, target) {
      var _this = this, el5 = _this.el, options = _this.options, ownerDocument = el5.ownerDocument, dragStartFn;
      if (target && !dragEl && target.parentNode === el5) {
        var dragRect = getRect(target);
        rootEl = el5;
        dragEl = target;
        parentEl = dragEl.parentNode;
        nextEl = dragEl.nextSibling;
        lastDownEl = target;
        activeGroup = options.group;
        Sortable.dragged = dragEl;
        tapEvt = {
          target: dragEl,
          clientX: (touch || evt).clientX,
          clientY: (touch || evt).clientY
        };
        tapDistanceLeft = tapEvt.clientX - dragRect.left;
        tapDistanceTop = tapEvt.clientY - dragRect.top;
        this._lastX = (touch || evt).clientX;
        this._lastY = (touch || evt).clientY;
        dragEl.style["will-change"] = "all";
        dragStartFn = function dragStartFn2() {
          pluginEvent2("delayEnded", _this, {
            evt
          });
          if (Sortable.eventCanceled) {
            _this._onDrop();
            return;
          }
          _this._disableDelayedDragEvents();
          if (!FireFox && _this.nativeDraggable) {
            dragEl.draggable = true;
          }
          _this._triggerDragStart(evt, touch);
          _dispatchEvent({
            sortable: _this,
            name: "choose",
            originalEvent: evt
          });
          toggleClass(dragEl, options.chosenClass, true);
        };
        options.ignore.split(",").forEach(function(criteria) {
          find(dragEl, criteria.trim(), _disableDraggable);
        });
        on(ownerDocument, "dragover", nearestEmptyInsertDetectEvent);
        on(ownerDocument, "mousemove", nearestEmptyInsertDetectEvent);
        on(ownerDocument, "touchmove", nearestEmptyInsertDetectEvent);
        if (options.supportPointer) {
          on(ownerDocument, "pointerup", _this._onDrop);
          !this.nativeDraggable && on(ownerDocument, "pointercancel", _this._onDrop);
        } else {
          on(ownerDocument, "mouseup", _this._onDrop);
          on(ownerDocument, "touchend", _this._onDrop);
          on(ownerDocument, "touchcancel", _this._onDrop);
        }
        if (FireFox && this.nativeDraggable) {
          this.options.touchStartThreshold = 4;
          dragEl.draggable = true;
        }
        pluginEvent2("delayStart", this, {
          evt
        });
        if (options.delay && (!options.delayOnTouchOnly || touch) && (!this.nativeDraggable || !(Edge || IE11OrLess))) {
          if (Sortable.eventCanceled) {
            this._onDrop();
            return;
          }
          if (options.supportPointer) {
            on(ownerDocument, "pointerup", _this._disableDelayedDrag);
            on(ownerDocument, "pointercancel", _this._disableDelayedDrag);
          } else {
            on(ownerDocument, "mouseup", _this._disableDelayedDrag);
            on(ownerDocument, "touchend", _this._disableDelayedDrag);
            on(ownerDocument, "touchcancel", _this._disableDelayedDrag);
          }
          on(ownerDocument, "mousemove", _this._delayedDragTouchMoveHandler);
          on(ownerDocument, "touchmove", _this._delayedDragTouchMoveHandler);
          options.supportPointer && on(ownerDocument, "pointermove", _this._delayedDragTouchMoveHandler);
          _this._dragStartTimer = setTimeout(dragStartFn, options.delay);
        } else {
          dragStartFn();
        }
      }
    },
    _delayedDragTouchMoveHandler: function _delayedDragTouchMoveHandler(e) {
      var touch = e.touches ? e.touches[0] : e;
      if (Math.max(Math.abs(touch.clientX - this._lastX), Math.abs(touch.clientY - this._lastY)) >= Math.floor(this.options.touchStartThreshold / (this.nativeDraggable && window.devicePixelRatio || 1))) {
        this._disableDelayedDrag();
      }
    },
    _disableDelayedDrag: function _disableDelayedDrag() {
      dragEl && _disableDraggable(dragEl);
      clearTimeout(this._dragStartTimer);
      this._disableDelayedDragEvents();
    },
    _disableDelayedDragEvents: function _disableDelayedDragEvents() {
      var ownerDocument = this.el.ownerDocument;
      off(ownerDocument, "mouseup", this._disableDelayedDrag);
      off(ownerDocument, "touchend", this._disableDelayedDrag);
      off(ownerDocument, "touchcancel", this._disableDelayedDrag);
      off(ownerDocument, "pointerup", this._disableDelayedDrag);
      off(ownerDocument, "pointercancel", this._disableDelayedDrag);
      off(ownerDocument, "mousemove", this._delayedDragTouchMoveHandler);
      off(ownerDocument, "touchmove", this._delayedDragTouchMoveHandler);
      off(ownerDocument, "pointermove", this._delayedDragTouchMoveHandler);
    },
    _triggerDragStart: function _triggerDragStart(evt, touch) {
      touch = touch || evt.pointerType == "touch" && evt;
      if (!this.nativeDraggable || touch) {
        if (this.options.supportPointer) {
          on(document, "pointermove", this._onTouchMove);
        } else if (touch) {
          on(document, "touchmove", this._onTouchMove);
        } else {
          on(document, "mousemove", this._onTouchMove);
        }
      } else {
        on(dragEl, "dragend", this);
        on(rootEl, "dragstart", this._onDragStart);
      }
      try {
        if (document.selection) {
          _nextTick(function() {
            document.selection.empty();
          });
        } else {
          window.getSelection().removeAllRanges();
        }
      } catch (err) {
      }
    },
    _dragStarted: function _dragStarted(fallback, evt) {
      awaitingDragStarted = false;
      if (rootEl && dragEl) {
        pluginEvent2("dragStarted", this, {
          evt
        });
        if (this.nativeDraggable) {
          on(document, "dragover", _checkOutsideTargetEl);
        }
        var options = this.options;
        !fallback && toggleClass(dragEl, options.dragClass, false);
        toggleClass(dragEl, options.ghostClass, true);
        Sortable.active = this;
        fallback && this._appendGhost();
        _dispatchEvent({
          sortable: this,
          name: "start",
          originalEvent: evt
        });
      } else {
        this._nulling();
      }
    },
    _emulateDragOver: function _emulateDragOver() {
      if (touchEvt) {
        this._lastX = touchEvt.clientX;
        this._lastY = touchEvt.clientY;
        _hideGhostForTarget();
        var target = document.elementFromPoint(touchEvt.clientX, touchEvt.clientY);
        var parent = target;
        while (target && target.shadowRoot) {
          target = target.shadowRoot.elementFromPoint(touchEvt.clientX, touchEvt.clientY);
          if (target === parent) break;
          parent = target;
        }
        dragEl.parentNode[expando]._isOutsideThisEl(target);
        if (parent) {
          do {
            if (parent[expando]) {
              var inserted = void 0;
              inserted = parent[expando]._onDragOver({
                clientX: touchEvt.clientX,
                clientY: touchEvt.clientY,
                target,
                rootEl: parent
              });
              if (inserted && !this.options.dragoverBubble) {
                break;
              }
            }
            target = parent;
          } while (parent = getParentOrHost(parent));
        }
        _unhideGhostForTarget();
      }
    },
    _onTouchMove: function _onTouchMove(evt) {
      if (tapEvt) {
        var options = this.options, fallbackTolerance = options.fallbackTolerance, fallbackOffset = options.fallbackOffset, touch = evt.touches ? evt.touches[0] : evt, ghostMatrix = ghostEl && matrix(ghostEl, true), scaleX = ghostEl && ghostMatrix && ghostMatrix.a, scaleY = ghostEl && ghostMatrix && ghostMatrix.d, relativeScrollOffset = PositionGhostAbsolutely && ghostRelativeParent && getRelativeScrollOffset(ghostRelativeParent), dx = (touch.clientX - tapEvt.clientX + fallbackOffset.x) / (scaleX || 1) + (relativeScrollOffset ? relativeScrollOffset[0] - ghostRelativeParentInitialScroll[0] : 0) / (scaleX || 1), dy = (touch.clientY - tapEvt.clientY + fallbackOffset.y) / (scaleY || 1) + (relativeScrollOffset ? relativeScrollOffset[1] - ghostRelativeParentInitialScroll[1] : 0) / (scaleY || 1);
        if (!Sortable.active && !awaitingDragStarted) {
          if (fallbackTolerance && Math.max(Math.abs(touch.clientX - this._lastX), Math.abs(touch.clientY - this._lastY)) < fallbackTolerance) {
            return;
          }
          this._onDragStart(evt, true);
        }
        if (ghostEl) {
          if (ghostMatrix) {
            ghostMatrix.e += dx - (lastDx || 0);
            ghostMatrix.f += dy - (lastDy || 0);
          } else {
            ghostMatrix = {
              a: 1,
              b: 0,
              c: 0,
              d: 1,
              e: dx,
              f: dy
            };
          }
          var cssMatrix = "matrix(".concat(ghostMatrix.a, ",").concat(ghostMatrix.b, ",").concat(ghostMatrix.c, ",").concat(ghostMatrix.d, ",").concat(ghostMatrix.e, ",").concat(ghostMatrix.f, ")");
          css(ghostEl, "webkitTransform", cssMatrix);
          css(ghostEl, "mozTransform", cssMatrix);
          css(ghostEl, "msTransform", cssMatrix);
          css(ghostEl, "transform", cssMatrix);
          lastDx = dx;
          lastDy = dy;
          touchEvt = touch;
        }
        evt.cancelable && evt.preventDefault();
      }
    },
    _appendGhost: function _appendGhost() {
      if (!ghostEl) {
        var container = this.options.fallbackOnBody ? document.body : rootEl, rect = getRect(dragEl, true, PositionGhostAbsolutely, true, container), options = this.options;
        if (PositionGhostAbsolutely) {
          ghostRelativeParent = container;
          while (css(ghostRelativeParent, "position") === "static" && css(ghostRelativeParent, "transform") === "none" && ghostRelativeParent !== document) {
            ghostRelativeParent = ghostRelativeParent.parentNode;
          }
          if (ghostRelativeParent !== document.body && ghostRelativeParent !== document.documentElement) {
            if (ghostRelativeParent === document) ghostRelativeParent = getWindowScrollingElement();
            rect.top += ghostRelativeParent.scrollTop;
            rect.left += ghostRelativeParent.scrollLeft;
          } else {
            ghostRelativeParent = getWindowScrollingElement();
          }
          ghostRelativeParentInitialScroll = getRelativeScrollOffset(ghostRelativeParent);
        }
        ghostEl = dragEl.cloneNode(true);
        toggleClass(ghostEl, options.ghostClass, false);
        toggleClass(ghostEl, options.fallbackClass, true);
        toggleClass(ghostEl, options.dragClass, true);
        css(ghostEl, "transition", "");
        css(ghostEl, "transform", "");
        css(ghostEl, "box-sizing", "border-box");
        css(ghostEl, "margin", 0);
        css(ghostEl, "top", rect.top);
        css(ghostEl, "left", rect.left);
        css(ghostEl, "width", rect.width);
        css(ghostEl, "height", rect.height);
        css(ghostEl, "opacity", "0.8");
        css(ghostEl, "position", PositionGhostAbsolutely ? "absolute" : "fixed");
        css(ghostEl, "zIndex", "100000");
        css(ghostEl, "pointerEvents", "none");
        Sortable.ghost = ghostEl;
        container.appendChild(ghostEl);
        css(ghostEl, "transform-origin", tapDistanceLeft / parseInt(ghostEl.style.width) * 100 + "% " + tapDistanceTop / parseInt(ghostEl.style.height) * 100 + "%");
      }
    },
    _onDragStart: function _onDragStart(evt, fallback) {
      var _this = this;
      var dataTransfer = evt.dataTransfer;
      var options = _this.options;
      pluginEvent2("dragStart", this, {
        evt
      });
      if (Sortable.eventCanceled) {
        this._onDrop();
        return;
      }
      pluginEvent2("setupClone", this);
      if (!Sortable.eventCanceled) {
        cloneEl = clone(dragEl);
        cloneEl.removeAttribute("id");
        cloneEl.draggable = false;
        cloneEl.style["will-change"] = "";
        this._hideClone();
        toggleClass(cloneEl, this.options.chosenClass, false);
        Sortable.clone = cloneEl;
      }
      _this.cloneId = _nextTick(function() {
        pluginEvent2("clone", _this);
        if (Sortable.eventCanceled) return;
        if (!_this.options.removeCloneOnHide) {
          rootEl.insertBefore(cloneEl, dragEl);
        }
        _this._hideClone();
        _dispatchEvent({
          sortable: _this,
          name: "clone"
        });
      });
      !fallback && toggleClass(dragEl, options.dragClass, true);
      if (fallback) {
        ignoreNextClick = true;
        _this._loopId = setInterval(_this._emulateDragOver, 50);
      } else {
        off(document, "mouseup", _this._onDrop);
        off(document, "touchend", _this._onDrop);
        off(document, "touchcancel", _this._onDrop);
        if (dataTransfer) {
          dataTransfer.effectAllowed = "move";
          options.setData && options.setData.call(_this, dataTransfer, dragEl);
        }
        on(document, "drop", _this);
        css(dragEl, "transform", "translateZ(0)");
      }
      awaitingDragStarted = true;
      _this._dragStartId = _nextTick(_this._dragStarted.bind(_this, fallback, evt));
      on(document, "selectstart", _this);
      moved = true;
      window.getSelection().removeAllRanges();
      if (Safari) {
        css(document.body, "user-select", "none");
      }
    },
    // Returns true - if no further action is needed (either inserted or another condition)
    _onDragOver: function _onDragOver(evt) {
      var el5 = this.el, target = evt.target, dragRect, targetRect, revert, options = this.options, group = options.group, activeSortable = Sortable.active, isOwner = activeGroup === group, canSort = options.sort, fromSortable = putSortable || activeSortable, vertical, _this = this, completedFired = false;
      if (_silent) return;
      function dragOverEvent(name, extra) {
        pluginEvent2(name, _this, _objectSpread2({
          evt,
          isOwner,
          axis: vertical ? "vertical" : "horizontal",
          revert,
          dragRect,
          targetRect,
          canSort,
          fromSortable,
          target,
          completed,
          onMove: function onMove(target2, after2) {
            return _onMove(rootEl, el5, dragEl, dragRect, target2, getRect(target2), evt, after2);
          },
          changed
        }, extra));
      }
      function capture() {
        dragOverEvent("dragOverAnimationCapture");
        _this.captureAnimationState();
        if (_this !== fromSortable) {
          fromSortable.captureAnimationState();
        }
      }
      function completed(insertion) {
        dragOverEvent("dragOverCompleted", {
          insertion
        });
        if (insertion) {
          if (isOwner) {
            activeSortable._hideClone();
          } else {
            activeSortable._showClone(_this);
          }
          if (_this !== fromSortable) {
            toggleClass(dragEl, putSortable ? putSortable.options.ghostClass : activeSortable.options.ghostClass, false);
            toggleClass(dragEl, options.ghostClass, true);
          }
          if (putSortable !== _this && _this !== Sortable.active) {
            putSortable = _this;
          } else if (_this === Sortable.active && putSortable) {
            putSortable = null;
          }
          if (fromSortable === _this) {
            _this._ignoreWhileAnimating = target;
          }
          _this.animateAll(function() {
            dragOverEvent("dragOverAnimationComplete");
            _this._ignoreWhileAnimating = null;
          });
          if (_this !== fromSortable) {
            fromSortable.animateAll();
            fromSortable._ignoreWhileAnimating = null;
          }
        }
        if (target === dragEl && !dragEl.animated || target === el5 && !target.animated) {
          lastTarget = null;
        }
        if (!options.dragoverBubble && !evt.rootEl && target !== document) {
          dragEl.parentNode[expando]._isOutsideThisEl(evt.target);
          !insertion && nearestEmptyInsertDetectEvent(evt);
        }
        !options.dragoverBubble && evt.stopPropagation && evt.stopPropagation();
        return completedFired = true;
      }
      function changed() {
        newIndex = index(dragEl);
        newDraggableIndex = index(dragEl, options.draggable);
        _dispatchEvent({
          sortable: _this,
          name: "change",
          toEl: el5,
          newIndex,
          newDraggableIndex,
          originalEvent: evt
        });
      }
      if (evt.preventDefault !== void 0) {
        evt.cancelable && evt.preventDefault();
      }
      target = closest(target, options.draggable, el5, true);
      dragOverEvent("dragOver");
      if (Sortable.eventCanceled) return completedFired;
      if (dragEl.contains(evt.target) || target.animated && target.animatingX && target.animatingY || _this._ignoreWhileAnimating === target) {
        return completed(false);
      }
      ignoreNextClick = false;
      if (activeSortable && !options.disabled && (isOwner ? canSort || (revert = parentEl !== rootEl) : putSortable === this || (this.lastPutMode = activeGroup.checkPull(this, activeSortable, dragEl, evt)) && group.checkPut(this, activeSortable, dragEl, evt))) {
        vertical = this._getDirection(evt, target) === "vertical";
        dragRect = getRect(dragEl);
        dragOverEvent("dragOverValid");
        if (Sortable.eventCanceled) return completedFired;
        if (revert) {
          parentEl = rootEl;
          capture();
          this._hideClone();
          dragOverEvent("revert");
          if (!Sortable.eventCanceled) {
            if (nextEl) {
              rootEl.insertBefore(dragEl, nextEl);
            } else {
              rootEl.appendChild(dragEl);
            }
          }
          return completed(true);
        }
        var elLastChild = lastChild(el5, options.draggable);
        if (!elLastChild || _ghostIsLast(evt, vertical, this) && !elLastChild.animated) {
          if (elLastChild === dragEl) {
            return completed(false);
          }
          if (elLastChild && el5 === evt.target) {
            target = elLastChild;
          }
          if (target) {
            targetRect = getRect(target);
          }
          if (_onMove(rootEl, el5, dragEl, dragRect, target, targetRect, evt, !!target) !== false) {
            capture();
            if (elLastChild && elLastChild.nextSibling) {
              el5.insertBefore(dragEl, elLastChild.nextSibling);
            } else {
              el5.appendChild(dragEl);
            }
            parentEl = el5;
            changed();
            return completed(true);
          }
        } else if (elLastChild && _ghostIsFirst(evt, vertical, this)) {
          var firstChild = getChild(el5, 0, options, true);
          if (firstChild === dragEl) {
            return completed(false);
          }
          target = firstChild;
          targetRect = getRect(target);
          if (_onMove(rootEl, el5, dragEl, dragRect, target, targetRect, evt, false) !== false) {
            capture();
            el5.insertBefore(dragEl, firstChild);
            parentEl = el5;
            changed();
            return completed(true);
          }
        } else if (target.parentNode === el5) {
          targetRect = getRect(target);
          var direction = 0, targetBeforeFirstSwap, differentLevel = dragEl.parentNode !== el5, differentRowCol = !_dragElInRowColumn(dragEl.animated && dragEl.toRect || dragRect, target.animated && target.toRect || targetRect, vertical), side1 = vertical ? "top" : "left", scrolledPastTop = isScrolledPast(target, "top", "top") || isScrolledPast(dragEl, "top", "top"), scrollBefore = scrolledPastTop ? scrolledPastTop.scrollTop : void 0;
          if (lastTarget !== target) {
            targetBeforeFirstSwap = targetRect[side1];
            pastFirstInvertThresh = false;
            isCircumstantialInvert = !differentRowCol && options.invertSwap || differentLevel;
          }
          direction = _getSwapDirection(evt, target, targetRect, vertical, differentRowCol ? 1 : options.swapThreshold, options.invertedSwapThreshold == null ? options.swapThreshold : options.invertedSwapThreshold, isCircumstantialInvert, lastTarget === target);
          var sibling;
          if (direction !== 0) {
            var dragIndex = index(dragEl);
            do {
              dragIndex -= direction;
              sibling = parentEl.children[dragIndex];
            } while (sibling && (css(sibling, "display") === "none" || sibling === ghostEl));
          }
          if (direction === 0 || sibling === target) {
            return completed(false);
          }
          lastTarget = target;
          lastDirection = direction;
          var nextSibling = target.nextElementSibling, after = false;
          after = direction === 1;
          var moveVector = _onMove(rootEl, el5, dragEl, dragRect, target, targetRect, evt, after);
          if (moveVector !== false) {
            if (moveVector === 1 || moveVector === -1) {
              after = moveVector === 1;
            }
            _silent = true;
            setTimeout(_unsilent, 30);
            capture();
            if (after && !nextSibling) {
              el5.appendChild(dragEl);
            } else {
              target.parentNode.insertBefore(dragEl, after ? nextSibling : target);
            }
            if (scrolledPastTop) {
              scrollBy(scrolledPastTop, 0, scrollBefore - scrolledPastTop.scrollTop);
            }
            parentEl = dragEl.parentNode;
            if (targetBeforeFirstSwap !== void 0 && !isCircumstantialInvert) {
              targetMoveDistance = Math.abs(targetBeforeFirstSwap - getRect(target)[side1]);
            }
            changed();
            return completed(true);
          }
        }
        if (el5.contains(dragEl)) {
          return completed(false);
        }
      }
      return false;
    },
    _ignoreWhileAnimating: null,
    _offMoveEvents: function _offMoveEvents() {
      off(document, "mousemove", this._onTouchMove);
      off(document, "touchmove", this._onTouchMove);
      off(document, "pointermove", this._onTouchMove);
      off(document, "dragover", nearestEmptyInsertDetectEvent);
      off(document, "mousemove", nearestEmptyInsertDetectEvent);
      off(document, "touchmove", nearestEmptyInsertDetectEvent);
    },
    _offUpEvents: function _offUpEvents() {
      var ownerDocument = this.el.ownerDocument;
      off(ownerDocument, "mouseup", this._onDrop);
      off(ownerDocument, "touchend", this._onDrop);
      off(ownerDocument, "pointerup", this._onDrop);
      off(ownerDocument, "pointercancel", this._onDrop);
      off(ownerDocument, "touchcancel", this._onDrop);
      off(document, "selectstart", this);
    },
    _onDrop: function _onDrop(evt) {
      var el5 = this.el, options = this.options;
      newIndex = index(dragEl);
      newDraggableIndex = index(dragEl, options.draggable);
      pluginEvent2("drop", this, {
        evt
      });
      parentEl = dragEl && dragEl.parentNode;
      newIndex = index(dragEl);
      newDraggableIndex = index(dragEl, options.draggable);
      if (Sortable.eventCanceled) {
        this._nulling();
        return;
      }
      awaitingDragStarted = false;
      isCircumstantialInvert = false;
      pastFirstInvertThresh = false;
      clearInterval(this._loopId);
      clearTimeout(this._dragStartTimer);
      _cancelNextTick(this.cloneId);
      _cancelNextTick(this._dragStartId);
      if (this.nativeDraggable) {
        off(document, "drop", this);
        off(el5, "dragstart", this._onDragStart);
      }
      this._offMoveEvents();
      this._offUpEvents();
      if (Safari) {
        css(document.body, "user-select", "");
      }
      css(dragEl, "transform", "");
      if (evt) {
        if (moved) {
          evt.cancelable && evt.preventDefault();
          !options.dropBubble && evt.stopPropagation();
        }
        ghostEl && ghostEl.parentNode && ghostEl.parentNode.removeChild(ghostEl);
        if (rootEl === parentEl || putSortable && putSortable.lastPutMode !== "clone") {
          cloneEl && cloneEl.parentNode && cloneEl.parentNode.removeChild(cloneEl);
        }
        if (dragEl) {
          if (this.nativeDraggable) {
            off(dragEl, "dragend", this);
          }
          _disableDraggable(dragEl);
          dragEl.style["will-change"] = "";
          if (moved && !awaitingDragStarted) {
            toggleClass(dragEl, putSortable ? putSortable.options.ghostClass : this.options.ghostClass, false);
          }
          toggleClass(dragEl, this.options.chosenClass, false);
          _dispatchEvent({
            sortable: this,
            name: "unchoose",
            toEl: parentEl,
            newIndex: null,
            newDraggableIndex: null,
            originalEvent: evt
          });
          if (rootEl !== parentEl) {
            if (newIndex >= 0) {
              _dispatchEvent({
                rootEl: parentEl,
                name: "add",
                toEl: parentEl,
                fromEl: rootEl,
                originalEvent: evt
              });
              _dispatchEvent({
                sortable: this,
                name: "remove",
                toEl: parentEl,
                originalEvent: evt
              });
              _dispatchEvent({
                rootEl: parentEl,
                name: "sort",
                toEl: parentEl,
                fromEl: rootEl,
                originalEvent: evt
              });
              _dispatchEvent({
                sortable: this,
                name: "sort",
                toEl: parentEl,
                originalEvent: evt
              });
            }
            putSortable && putSortable.save();
          } else {
            if (newIndex !== oldIndex) {
              if (newIndex >= 0) {
                _dispatchEvent({
                  sortable: this,
                  name: "update",
                  toEl: parentEl,
                  originalEvent: evt
                });
                _dispatchEvent({
                  sortable: this,
                  name: "sort",
                  toEl: parentEl,
                  originalEvent: evt
                });
              }
            }
          }
          if (Sortable.active) {
            if (newIndex == null || newIndex === -1) {
              newIndex = oldIndex;
              newDraggableIndex = oldDraggableIndex;
            }
            _dispatchEvent({
              sortable: this,
              name: "end",
              toEl: parentEl,
              originalEvent: evt
            });
            this.save();
          }
        }
      }
      this._nulling();
    },
    _nulling: function _nulling() {
      pluginEvent2("nulling", this);
      rootEl = dragEl = parentEl = ghostEl = nextEl = cloneEl = lastDownEl = cloneHidden = tapEvt = touchEvt = moved = newIndex = newDraggableIndex = oldIndex = oldDraggableIndex = lastTarget = lastDirection = putSortable = activeGroup = Sortable.dragged = Sortable.ghost = Sortable.clone = Sortable.active = null;
      var el5 = this.el;
      savedInputChecked.forEach(function(checkEl) {
        if (el5.contains(checkEl)) {
          checkEl.checked = true;
        }
      });
      savedInputChecked.length = lastDx = lastDy = 0;
    },
    handleEvent: function handleEvent(evt) {
      switch (evt.type) {
        case "drop":
        case "dragend":
          this._onDrop(evt);
          break;
        case "dragenter":
        case "dragover":
          if (dragEl) {
            this._onDragOver(evt);
            _globalDragOver(evt);
          }
          break;
        case "selectstart":
          evt.preventDefault();
          break;
      }
    },
    /**
     * Serializes the item into an array of string.
     * @returns {String[]}
     */
    toArray: function toArray() {
      var order = [], el5, children = this.el.children, i = 0, n = children.length, options = this.options;
      for (; i < n; i++) {
        el5 = children[i];
        if (closest(el5, options.draggable, this.el, false)) {
          order.push(el5.getAttribute(options.dataIdAttr) || _generateId(el5));
        }
      }
      return order;
    },
    /**
     * Sorts the elements according to the array.
     * @param  {String[]}  order  order of the items
     */
    sort: function sort(order, useAnimation) {
      var items = {}, rootEl2 = this.el;
      this.toArray().forEach(function(id, i) {
        var el5 = rootEl2.children[i];
        if (closest(el5, this.options.draggable, rootEl2, false)) {
          items[id] = el5;
        }
      }, this);
      useAnimation && this.captureAnimationState();
      order.forEach(function(id) {
        if (items[id]) {
          rootEl2.removeChild(items[id]);
          rootEl2.appendChild(items[id]);
        }
      });
      useAnimation && this.animateAll();
    },
    /**
     * Save the current sorting
     */
    save: function save() {
      var store = this.options.store;
      store && store.set && store.set(this);
    },
    /**
     * For each element in the set, get the first element that matches the selector by testing the element itself and traversing up through its ancestors in the DOM tree.
     * @param   {HTMLElement}  el
     * @param   {String}       [selector]  default: `options.draggable`
     * @returns {HTMLElement|null}
     */
    closest: function closest$1(el5, selector) {
      return closest(el5, selector || this.options.draggable, this.el, false);
    },
    /**
     * Set/get option
     * @param   {string} name
     * @param   {*}      [value]
     * @returns {*}
     */
    option: function option(name, value) {
      var options = this.options;
      if (value === void 0) {
        return options[name];
      } else {
        var modifiedValue = PluginManager.modifyOption(this, name, value);
        if (typeof modifiedValue !== "undefined") {
          options[name] = modifiedValue;
        } else {
          options[name] = value;
        }
        if (name === "group") {
          _prepareGroup(options);
        }
      }
    },
    /**
     * Destroy
     */
    destroy: function destroy() {
      pluginEvent2("destroy", this);
      var el5 = this.el;
      el5[expando] = null;
      off(el5, "mousedown", this._onTapStart);
      off(el5, "touchstart", this._onTapStart);
      off(el5, "pointerdown", this._onTapStart);
      if (this.nativeDraggable) {
        off(el5, "dragover", this);
        off(el5, "dragenter", this);
      }
      Array.prototype.forEach.call(el5.querySelectorAll("[draggable]"), function(el6) {
        el6.removeAttribute("draggable");
      });
      this._onDrop();
      this._disableDelayedDragEvents();
      sortables.splice(sortables.indexOf(this.el), 1);
      this.el = el5 = null;
    },
    _hideClone: function _hideClone() {
      if (!cloneHidden) {
        pluginEvent2("hideClone", this);
        if (Sortable.eventCanceled) return;
        css(cloneEl, "display", "none");
        if (this.options.removeCloneOnHide && cloneEl.parentNode) {
          cloneEl.parentNode.removeChild(cloneEl);
        }
        cloneHidden = true;
      }
    },
    _showClone: function _showClone(putSortable2) {
      if (putSortable2.lastPutMode !== "clone") {
        this._hideClone();
        return;
      }
      if (cloneHidden) {
        pluginEvent2("showClone", this);
        if (Sortable.eventCanceled) return;
        if (dragEl.parentNode == rootEl && !this.options.group.revertClone) {
          rootEl.insertBefore(cloneEl, dragEl);
        } else if (nextEl) {
          rootEl.insertBefore(cloneEl, nextEl);
        } else {
          rootEl.appendChild(cloneEl);
        }
        if (this.options.group.revertClone) {
          this.animate(dragEl, cloneEl);
        }
        css(cloneEl, "display", "");
        cloneHidden = false;
      }
    }
  };
  function _globalDragOver(evt) {
    if (evt.dataTransfer) {
      evt.dataTransfer.dropEffect = "move";
    }
    evt.cancelable && evt.preventDefault();
  }
  function _onMove(fromEl, toEl, dragEl2, dragRect, targetEl, targetRect, originalEvent, willInsertAfter) {
    var evt, sortable = fromEl[expando], onMoveFn = sortable.options.onMove, retVal;
    if (window.CustomEvent && !IE11OrLess && !Edge) {
      evt = new CustomEvent("move", {
        bubbles: true,
        cancelable: true
      });
    } else {
      evt = document.createEvent("Event");
      evt.initEvent("move", true, true);
    }
    evt.to = toEl;
    evt.from = fromEl;
    evt.dragged = dragEl2;
    evt.draggedRect = dragRect;
    evt.related = targetEl || toEl;
    evt.relatedRect = targetRect || getRect(toEl);
    evt.willInsertAfter = willInsertAfter;
    evt.originalEvent = originalEvent;
    fromEl.dispatchEvent(evt);
    if (onMoveFn) {
      retVal = onMoveFn.call(sortable, evt, originalEvent);
    }
    return retVal;
  }
  function _disableDraggable(el5) {
    el5.draggable = false;
  }
  function _unsilent() {
    _silent = false;
  }
  function _ghostIsFirst(evt, vertical, sortable) {
    var firstElRect = getRect(getChild(sortable.el, 0, sortable.options, true));
    var childContainingRect = getChildContainingRectFromElement(sortable.el, sortable.options, ghostEl);
    var spacer = 10;
    return vertical ? evt.clientX < childContainingRect.left - spacer || evt.clientY < firstElRect.top && evt.clientX < firstElRect.right : evt.clientY < childContainingRect.top - spacer || evt.clientY < firstElRect.bottom && evt.clientX < firstElRect.left;
  }
  function _ghostIsLast(evt, vertical, sortable) {
    var lastElRect = getRect(lastChild(sortable.el, sortable.options.draggable));
    var childContainingRect = getChildContainingRectFromElement(sortable.el, sortable.options, ghostEl);
    var spacer = 10;
    return vertical ? evt.clientX > childContainingRect.right + spacer || evt.clientY > lastElRect.bottom && evt.clientX > lastElRect.left : evt.clientY > childContainingRect.bottom + spacer || evt.clientX > lastElRect.right && evt.clientY > lastElRect.top;
  }
  function _getSwapDirection(evt, target, targetRect, vertical, swapThreshold, invertedSwapThreshold, invertSwap, isLastTarget) {
    var mouseOnAxis = vertical ? evt.clientY : evt.clientX, targetLength = vertical ? targetRect.height : targetRect.width, targetS1 = vertical ? targetRect.top : targetRect.left, targetS2 = vertical ? targetRect.bottom : targetRect.right, invert = false;
    if (!invertSwap) {
      if (isLastTarget && targetMoveDistance < targetLength * swapThreshold) {
        if (!pastFirstInvertThresh && (lastDirection === 1 ? mouseOnAxis > targetS1 + targetLength * invertedSwapThreshold / 2 : mouseOnAxis < targetS2 - targetLength * invertedSwapThreshold / 2)) {
          pastFirstInvertThresh = true;
        }
        if (!pastFirstInvertThresh) {
          if (lastDirection === 1 ? mouseOnAxis < targetS1 + targetMoveDistance : mouseOnAxis > targetS2 - targetMoveDistance) {
            return -lastDirection;
          }
        } else {
          invert = true;
        }
      } else {
        if (mouseOnAxis > targetS1 + targetLength * (1 - swapThreshold) / 2 && mouseOnAxis < targetS2 - targetLength * (1 - swapThreshold) / 2) {
          return _getInsertDirection(target);
        }
      }
    }
    invert = invert || invertSwap;
    if (invert) {
      if (mouseOnAxis < targetS1 + targetLength * invertedSwapThreshold / 2 || mouseOnAxis > targetS2 - targetLength * invertedSwapThreshold / 2) {
        return mouseOnAxis > targetS1 + targetLength / 2 ? 1 : -1;
      }
    }
    return 0;
  }
  function _getInsertDirection(target) {
    if (index(dragEl) < index(target)) {
      return 1;
    } else {
      return -1;
    }
  }
  function _generateId(el5) {
    var str = el5.tagName + el5.className + el5.src + el5.href + el5.textContent, i = str.length, sum = 0;
    while (i--) {
      sum += str.charCodeAt(i);
    }
    return sum.toString(36);
  }
  function _saveInputCheckedState(root) {
    savedInputChecked.length = 0;
    var inputs = root.getElementsByTagName("input");
    var idx = inputs.length;
    while (idx--) {
      var el5 = inputs[idx];
      el5.checked && savedInputChecked.push(el5);
    }
  }
  function _nextTick(fn) {
    return setTimeout(fn, 0);
  }
  function _cancelNextTick(id) {
    return clearTimeout(id);
  }
  if (documentExists) {
    on(document, "touchmove", function(evt) {
      if ((Sortable.active || awaitingDragStarted) && evt.cancelable) {
        evt.preventDefault();
      }
    });
  }
  Sortable.utils = {
    on,
    off,
    css,
    find,
    is: function is(el5, selector) {
      return !!closest(el5, selector, el5, false);
    },
    extend,
    throttle,
    closest,
    toggleClass,
    clone,
    index,
    nextTick: _nextTick,
    cancelNextTick: _cancelNextTick,
    detectDirection: _detectDirection,
    getChild,
    expando
  };
  Sortable.get = function(element) {
    return element[expando];
  };
  Sortable.mount = function() {
    for (var _len = arguments.length, plugins2 = new Array(_len), _key = 0; _key < _len; _key++) {
      plugins2[_key] = arguments[_key];
    }
    if (plugins2[0].constructor === Array) plugins2 = plugins2[0];
    plugins2.forEach(function(plugin) {
      if (!plugin.prototype || !plugin.prototype.constructor) {
        throw "Sortable: Mounted plugin must be a constructor function, not ".concat({}.toString.call(plugin));
      }
      if (plugin.utils) Sortable.utils = _objectSpread2(_objectSpread2({}, Sortable.utils), plugin.utils);
      PluginManager.mount(plugin);
    });
  };
  Sortable.create = function(el5, options) {
    return new Sortable(el5, options);
  };
  Sortable.version = version;
  var autoScrolls = [];
  var scrollEl;
  var scrollRootEl;
  var scrolling = false;
  var lastAutoScrollX;
  var lastAutoScrollY;
  var touchEvt$1;
  var pointerElemChangedInterval;
  function AutoScrollPlugin() {
    function AutoScroll() {
      this.defaults = {
        scroll: true,
        forceAutoScrollFallback: false,
        scrollSensitivity: 30,
        scrollSpeed: 10,
        bubbleScroll: true
      };
      for (var fn in this) {
        if (fn.charAt(0) === "_" && typeof this[fn] === "function") {
          this[fn] = this[fn].bind(this);
        }
      }
    }
    AutoScroll.prototype = {
      dragStarted: function dragStarted(_ref) {
        var originalEvent = _ref.originalEvent;
        if (this.sortable.nativeDraggable) {
          on(document, "dragover", this._handleAutoScroll);
        } else {
          if (this.options.supportPointer) {
            on(document, "pointermove", this._handleFallbackAutoScroll);
          } else if (originalEvent.touches) {
            on(document, "touchmove", this._handleFallbackAutoScroll);
          } else {
            on(document, "mousemove", this._handleFallbackAutoScroll);
          }
        }
      },
      dragOverCompleted: function dragOverCompleted(_ref2) {
        var originalEvent = _ref2.originalEvent;
        if (!this.options.dragOverBubble && !originalEvent.rootEl) {
          this._handleAutoScroll(originalEvent);
        }
      },
      drop: function drop3() {
        if (this.sortable.nativeDraggable) {
          off(document, "dragover", this._handleAutoScroll);
        } else {
          off(document, "pointermove", this._handleFallbackAutoScroll);
          off(document, "touchmove", this._handleFallbackAutoScroll);
          off(document, "mousemove", this._handleFallbackAutoScroll);
        }
        clearPointerElemChangedInterval();
        clearAutoScrolls();
        cancelThrottle();
      },
      nulling: function nulling() {
        touchEvt$1 = scrollRootEl = scrollEl = scrolling = pointerElemChangedInterval = lastAutoScrollX = lastAutoScrollY = null;
        autoScrolls.length = 0;
      },
      _handleFallbackAutoScroll: function _handleFallbackAutoScroll(evt) {
        this._handleAutoScroll(evt, true);
      },
      _handleAutoScroll: function _handleAutoScroll(evt, fallback) {
        var _this = this;
        var x = (evt.touches ? evt.touches[0] : evt).clientX, y = (evt.touches ? evt.touches[0] : evt).clientY, elem = document.elementFromPoint(x, y);
        touchEvt$1 = evt;
        if (fallback || this.options.forceAutoScrollFallback || Edge || IE11OrLess || Safari) {
          autoScroll(evt, this.options, elem, fallback);
          var ogElemScroller = getParentAutoScrollElement(elem, true);
          if (scrolling && (!pointerElemChangedInterval || x !== lastAutoScrollX || y !== lastAutoScrollY)) {
            pointerElemChangedInterval && clearPointerElemChangedInterval();
            pointerElemChangedInterval = setInterval(function() {
              var newElem = getParentAutoScrollElement(document.elementFromPoint(x, y), true);
              if (newElem !== ogElemScroller) {
                ogElemScroller = newElem;
                clearAutoScrolls();
              }
              autoScroll(evt, _this.options, newElem, fallback);
            }, 10);
            lastAutoScrollX = x;
            lastAutoScrollY = y;
          }
        } else {
          if (!this.options.bubbleScroll || getParentAutoScrollElement(elem, true) === getWindowScrollingElement()) {
            clearAutoScrolls();
            return;
          }
          autoScroll(evt, this.options, getParentAutoScrollElement(elem, false), false);
        }
      }
    };
    return _extends(AutoScroll, {
      pluginName: "scroll",
      initializeByDefault: true
    });
  }
  function clearAutoScrolls() {
    autoScrolls.forEach(function(autoScroll2) {
      clearInterval(autoScroll2.pid);
    });
    autoScrolls = [];
  }
  function clearPointerElemChangedInterval() {
    clearInterval(pointerElemChangedInterval);
  }
  var autoScroll = throttle(function(evt, options, rootEl2, isFallback) {
    if (!options.scroll) return;
    var x = (evt.touches ? evt.touches[0] : evt).clientX, y = (evt.touches ? evt.touches[0] : evt).clientY, sens = options.scrollSensitivity, speed = options.scrollSpeed, winScroller = getWindowScrollingElement();
    var scrollThisInstance = false, scrollCustomFn;
    if (scrollRootEl !== rootEl2) {
      scrollRootEl = rootEl2;
      clearAutoScrolls();
      scrollEl = options.scroll;
      scrollCustomFn = options.scrollFn;
      if (scrollEl === true) {
        scrollEl = getParentAutoScrollElement(rootEl2, true);
      }
    }
    var layersOut = 0;
    var currentParent = scrollEl;
    do {
      var el5 = currentParent, rect = getRect(el5), top = rect.top, bottom = rect.bottom, left = rect.left, right = rect.right, width = rect.width, height = rect.height, canScrollX = void 0, canScrollY = void 0, scrollWidth = el5.scrollWidth, scrollHeight = el5.scrollHeight, elCSS = css(el5), scrollPosX = el5.scrollLeft, scrollPosY = el5.scrollTop;
      if (el5 === winScroller) {
        canScrollX = width < scrollWidth && (elCSS.overflowX === "auto" || elCSS.overflowX === "scroll" || elCSS.overflowX === "visible");
        canScrollY = height < scrollHeight && (elCSS.overflowY === "auto" || elCSS.overflowY === "scroll" || elCSS.overflowY === "visible");
      } else {
        canScrollX = width < scrollWidth && (elCSS.overflowX === "auto" || elCSS.overflowX === "scroll");
        canScrollY = height < scrollHeight && (elCSS.overflowY === "auto" || elCSS.overflowY === "scroll");
      }
      var vx = canScrollX && (Math.abs(right - x) <= sens && scrollPosX + width < scrollWidth) - (Math.abs(left - x) <= sens && !!scrollPosX);
      var vy = canScrollY && (Math.abs(bottom - y) <= sens && scrollPosY + height < scrollHeight) - (Math.abs(top - y) <= sens && !!scrollPosY);
      if (!autoScrolls[layersOut]) {
        for (var i = 0; i <= layersOut; i++) {
          if (!autoScrolls[i]) {
            autoScrolls[i] = {};
          }
        }
      }
      if (autoScrolls[layersOut].vx != vx || autoScrolls[layersOut].vy != vy || autoScrolls[layersOut].el !== el5) {
        autoScrolls[layersOut].el = el5;
        autoScrolls[layersOut].vx = vx;
        autoScrolls[layersOut].vy = vy;
        clearInterval(autoScrolls[layersOut].pid);
        if (vx != 0 || vy != 0) {
          scrollThisInstance = true;
          autoScrolls[layersOut].pid = setInterval(function() {
            if (isFallback && this.layer === 0) {
              Sortable.active._onTouchMove(touchEvt$1);
            }
            var scrollOffsetY = autoScrolls[this.layer].vy ? autoScrolls[this.layer].vy * speed : 0;
            var scrollOffsetX = autoScrolls[this.layer].vx ? autoScrolls[this.layer].vx * speed : 0;
            if (typeof scrollCustomFn === "function") {
              if (scrollCustomFn.call(Sortable.dragged.parentNode[expando], scrollOffsetX, scrollOffsetY, evt, touchEvt$1, autoScrolls[this.layer].el) !== "continue") {
                return;
              }
            }
            scrollBy(autoScrolls[this.layer].el, scrollOffsetX, scrollOffsetY);
          }.bind({
            layer: layersOut
          }), 24);
        }
      }
      layersOut++;
    } while (options.bubbleScroll && currentParent !== winScroller && (currentParent = getParentAutoScrollElement(currentParent, false)));
    scrolling = scrollThisInstance;
  }, 30);
  var drop = function drop2(_ref) {
    var originalEvent = _ref.originalEvent, putSortable2 = _ref.putSortable, dragEl2 = _ref.dragEl, activeSortable = _ref.activeSortable, dispatchSortableEvent = _ref.dispatchSortableEvent, hideGhostForTarget = _ref.hideGhostForTarget, unhideGhostForTarget = _ref.unhideGhostForTarget;
    if (!originalEvent) return;
    var toSortable = putSortable2 || activeSortable;
    hideGhostForTarget();
    var touch = originalEvent.changedTouches && originalEvent.changedTouches.length ? originalEvent.changedTouches[0] : originalEvent;
    var target = document.elementFromPoint(touch.clientX, touch.clientY);
    unhideGhostForTarget();
    if (toSortable && !toSortable.el.contains(target)) {
      dispatchSortableEvent("spill");
      this.onSpill({
        dragEl: dragEl2,
        putSortable: putSortable2
      });
    }
  };
  function Revert() {
  }
  Revert.prototype = {
    startIndex: null,
    dragStart: function dragStart(_ref2) {
      var oldDraggableIndex2 = _ref2.oldDraggableIndex;
      this.startIndex = oldDraggableIndex2;
    },
    onSpill: function onSpill(_ref3) {
      var dragEl2 = _ref3.dragEl, putSortable2 = _ref3.putSortable;
      this.sortable.captureAnimationState();
      if (putSortable2) {
        putSortable2.captureAnimationState();
      }
      var nextSibling = getChild(this.sortable.el, this.startIndex, this.options);
      if (nextSibling) {
        this.sortable.el.insertBefore(dragEl2, nextSibling);
      } else {
        this.sortable.el.appendChild(dragEl2);
      }
      this.sortable.animateAll();
      if (putSortable2) {
        putSortable2.animateAll();
      }
    },
    drop
  };
  _extends(Revert, {
    pluginName: "revertOnSpill"
  });
  function Remove() {
  }
  Remove.prototype = {
    onSpill: function onSpill2(_ref4) {
      var dragEl2 = _ref4.dragEl, putSortable2 = _ref4.putSortable;
      var parentSortable = putSortable2 || this.sortable;
      parentSortable.captureAnimationState();
      dragEl2.parentNode && dragEl2.parentNode.removeChild(dragEl2);
      parentSortable.animateAll();
    },
    drop
  };
  _extends(Remove, {
    pluginName: "removeOnSpill"
  });
  Sortable.mount(new AutoScrollPlugin());
  Sortable.mount(Remove, Revert);
  var sortable_esm_default = Sortable;

  // themes/baselayer/src/js/admin/canvas-builder/sortable.js
  function createSortable(el5, options = {}) {
    return sortable_esm_default.create(el5, options);
  }

  // themes/baselayer/packages/baselayer-blocks/src/js/admin/media-field.js
  function el3(tag, props = {}, children = []) {
    const node = document.createElement(tag);
    Object.entries(props).forEach(([key, value]) => {
      if (value == null || value === false) return;
      if (key === "className") node.className = value;
      else if (key === "text") node.textContent = value;
      else if (key === "html") node.innerHTML = value;
      else if (key === "dataset") Object.assign(node.dataset, value);
      else if (key.startsWith("on") && typeof value === "function") {
        node.addEventListener(key.slice(2).toLowerCase(), value);
      } else if (key === "checked") node.checked = Boolean(value);
      else if (key === "value") node.value = value === true ? "" : String(value);
      else node.setAttribute(key, value === true ? "" : String(value));
    });
    (Array.isArray(children) ? children : [children]).forEach((child) => {
      if (child == null || child === false) return;
      node.appendChild(typeof child === "string" ? document.createTextNode(child) : child);
    });
    return node;
  }
  function i18n3(key, fallback) {
    const dict = window.blBlocksFieldUi && window.blBlocksFieldUi.i18n || window.blBlocksEditor && window.blBlocksEditor.i18n || window.blBlocksPage && window.blBlocksPage.i18n || window.blBlocksAdmin && window.blBlocksAdmin.i18n || {};
    return dict[key] || fallback || key;
  }
  function normalizeAttachmentIds(current, multiple) {
    if (multiple) {
      const list = Array.isArray(current) ? current : current != null && current !== "" ? [current] : [];
      return list.map((id) => Number(id) || 0).filter((id) => id > 0);
    }
    const one = Number(Array.isArray(current) ? current[0] : current) || 0;
    return one > 0 ? [one] : [];
  }
  function attachmentFromJson(json) {
    const sizes = json.sizes || {};
    const url = sizes.thumbnail && sizes.thumbnail.url || sizes.medium && sizes.medium.url || json.url || json.icon || "";
    return {
      id: Number(json.id) || 0,
      url: String(url || ""),
      filename: String(json.filename || json.title || "#" + (json.id || "")),
      mime: String(json.mime || json.mime_type || ""),
      type: String(json.type || ""),
      alt: String(json.alt || json.alt_text || json.title || "")
    };
  }
  function fetchAttachment(id) {
    return new Promise((resolve) => {
      if (!id || typeof wp === "undefined" || !wp.media || !wp.media.attachment) {
        resolve({ id, url: "", filename: "#" + id, mime: "", type: "", alt: "" });
        return;
      }
      const att = wp.media.attachment(id);
      const done = () => {
        try {
          resolve(attachmentFromJson(att.toJSON()));
        } catch (e) {
          resolve({ id, url: "", filename: "#" + id, mime: "", type: "", alt: "" });
        }
      };
      if (att.get("url")) {
        done();
        return;
      }
      att.fetch().done(done).fail(() => {
        resolve({ id, url: "", filename: "#" + id, mime: "", type: "", alt: "" });
      });
    });
  }
  function extensionBadge(filename) {
    const parts = String(filename || "").split(".");
    const ext = parts.length > 1 ? parts.pop().toUpperCase() : "FILE";
    return ext.slice(0, 4);
  }
  function buildMediaCard(item, kind, onRemove) {
    const isImage = item.type === "image" || kind === "image";
    const card = el3("div", {
      className: "bl-blocks-fields__media-card" + (isImage ? " is-image" : " is-file"),
      dataset: { mediaId: String(item.id) }
    });
    if (isImage && item.url) {
      card.appendChild(
        el3("img", {
          className: "bl-blocks-fields__media-thumb",
          src: item.url,
          alt: item.alt || ""
        })
      );
    } else if (isImage) {
      card.appendChild(
        el3("span", {
          className: "bl-blocks-fields__media-badge",
          text: "IMG",
          "aria-hidden": "true"
        })
      );
    } else {
      card.appendChild(
        el3("span", {
          className: "bl-blocks-fields__media-badge",
          text: extensionBadge(item.filename),
          "aria-hidden": "true"
        })
      );
    }
    card.appendChild(
      el3("span", {
        className: "bl-blocks-fields__media-name",
        text: item.filename,
        title: item.filename
      })
    );
    const removeBtn = el3("button", {
      type: "button",
      className: "button-link bl-blocks-fields__media-remove",
      text: "\xD7",
      title: i18n3("removeMedia", "Remove"),
      "aria-label": i18n3("removeMedia", "Remove"),
      dataset: { blMediaRemove: String(item.id) }
    });
    removeBtn.addEventListener("click", (evt) => {
      evt.preventDefault();
      evt.stopPropagation();
      onRemove(item.id);
    });
    card.appendChild(removeBtn);
    return card;
  }
  function bindMediaSortable(preview, api) {
    if (!preview) return null;
    preview.classList.add("is-sortable");
    return createSortable(preview, {
      animation: 150,
      draggable: ".bl-blocks-fields__media-card",
      filter: ".bl-blocks-fields__media-remove",
      preventOnFilter: true,
      ghostClass: "is-dragging-ghost",
      chosenClass: "is-dragging-chosen",
      onEnd: () => {
        const ids = Array.from(preview.querySelectorAll(".bl-blocks-fields__media-card[data-media-id]")).map((node) => Number(node.getAttribute("data-media-id")) || 0).filter((id) => id > 0);
        const byId = new Map(api.getSelected().map((item) => [item.id, item]));
        const next = [];
        ids.forEach((id) => {
          const item = byId.get(id);
          if (item) next.push(item);
        });
        api.setSelected(next);
        if (typeof api.onChange === "function") {
          api.onChange();
        }
      }
    });
  }
  function createMediaPickerControl(field, current) {
    const kind = field.type === "image" ? "image" : "file";
    const multiple = !!field.multiple;
    const maxFiles = Math.max(1, Math.min(50, parseInt(field.max_files, 10) || 10));
    let selected = normalizeAttachmentIds(current, multiple).map((id) => ({
      id,
      url: "",
      filename: "#" + id,
      mime: "",
      type: kind === "image" ? "image" : "",
      alt: ""
    }));
    const preview = el3("div", {
      className: "bl-blocks-fields__media-preview" + (multiple ? " is-sortable" : ""),
      dataset: { blMediaPreview: "" }
    });
    const empty = el3("span", {
      className: "description bl-blocks-fields__media-empty",
      text: kind === "image" ? multiple ? i18n3("chooseImagesHelp", "Select one or more images.") : i18n3("chooseImageHelp", "Select an image.") : multiple ? i18n3("chooseFilesHelp", "Select one or more files.") : i18n3("chooseFileHelp", "Select a file."),
      dataset: { blMediaEmpty: "" }
    });
    const chooseBtn = el3("button", {
      type: "button",
      className: "button bl-button-small",
      text: "",
      dataset: { blMediaChoose: "" }
    });
    const clearBtn = el3("button", {
      type: "button",
      className: "button-link",
      text: i18n3("clearMedia", "Clear"),
      dataset: { blMediaClear: "" }
    });
    const actions = el3("div", { className: "bl-blocks-fields__media-actions" }, [
      chooseBtn,
      clearBtn
    ]);
    const wrap = el3(
      "div",
      {
        className: "bl-blocks-fields__media-picker",
        dataset: {
          blBlocksMediaPicker: "",
          mediaKind: kind,
          multiple: multiple ? "1" : "0"
        }
      },
      [preview, empty, actions]
    );
    let frame = null;
    let sortable = null;
    const syncChrome = () => {
      const has = selected.length > 0;
      empty.hidden = has;
      clearBtn.hidden = !has;
      if (kind === "image") {
        chooseBtn.textContent = has ? multiple ? i18n3("changeImages", "Change images") : i18n3("changeImage", "Change image") : multiple ? i18n3("chooseImages", "Choose images") : i18n3("chooseImage", "Choose image");
      } else {
        chooseBtn.textContent = has ? multiple ? i18n3("changeFiles", "Change files") : i18n3("changeFile", "Change file") : multiple ? i18n3("chooseFiles", "Choose files") : i18n3("chooseFile", "Choose file");
      }
    };
    const renderPreview = () => {
      preview.replaceChildren();
      selected.forEach((item) => {
        preview.appendChild(
          buildMediaCard(item, kind, (id) => {
            selected = selected.filter((s) => s.id !== id);
            renderPreview();
            wrap.dispatchEvent(new Event("change", { bubbles: true }));
          })
        );
      });
      syncChrome();
    };
    if (multiple) {
      sortable = bindMediaSortable(preview, {
        getSelected: () => selected,
        setSelected: (next) => {
          selected = next;
        },
        onChange: () => {
          wrap.dispatchEvent(new Event("change", { bubbles: true }));
        }
      });
    }
    const hydrate = () => {
      const ids = selected.map((s) => s.id);
      if (ids.length === 0) {
        renderPreview();
        return;
      }
      Promise.all(ids.map((id) => fetchAttachment(id))).then((items) => {
        selected = items.filter((item) => item.id > 0);
        renderPreview();
      });
    };
    const openFrame = () => {
      if (typeof wp === "undefined" || !wp.media) {
        return;
      }
      if (frame) {
        frame.open();
        return;
      }
      const opts = {
        title: kind === "image" ? multiple ? i18n3("mediaPickerTitleImages", "Select images") : i18n3("mediaPickerTitleImage", "Select image") : multiple ? i18n3("mediaPickerTitleFiles", "Select files") : i18n3("mediaPickerTitleFile", "Select file"),
        button: {
          text: i18n3("selectMedia", "Select")
        },
        multiple
      };
      if (kind === "image") {
        opts.library = { type: "image" };
      }
      frame = wp.media(opts);
      frame.on("select", () => {
        const selection = frame.state().get("selection");
        if (!selection) return;
        let items = selection.map((model) => attachmentFromJson(model.toJSON()));
        if (multiple) {
          items = items.slice(0, maxFiles);
        } else {
          items = items.slice(0, 1);
        }
        selected = items.filter((item) => item.id > 0);
        renderPreview();
        wrap.dispatchEvent(new Event("change", { bubbles: true }));
      });
      frame.on("open", () => {
        const selection = frame.state().get("selection");
        if (!selection) return;
        selection.reset();
        selected.forEach((item) => {
          const att = wp.media.attachment(item.id);
          selection.add(att);
          att.fetch();
        });
      });
      frame.open();
    };
    chooseBtn.addEventListener("click", (evt) => {
      evt.preventDefault();
      openFrame();
    });
    clearBtn.addEventListener("click", (evt) => {
      evt.preventDefault();
      selected = [];
      renderPreview();
      wrap.dispatchEvent(new Event("change", { bubbles: true }));
    });
    const control = (
      /** @type {any} */
      wrap
    );
    control.getMediaValue = () => {
      const ids = selected.map((s) => s.id).filter((id) => id > 0);
      if (multiple) return ids;
      return ids[0] || 0;
    };
    hydrate();
    return control;
  }
  function bindMediaPickers(root = document) {
    const scope = root && root.querySelectorAll ? root : document;
    scope.querySelectorAll("[data-bl-blocks-media-picker]").forEach((wrap) => {
      if (!(wrap instanceof HTMLElement) || wrap.dataset.blMediaBound === "1") return;
      wrap.dataset.blMediaBound = "1";
      const kind = wrap.dataset.mediaKind === "image" ? "image" : "file";
      const multiple = wrap.dataset.multiple === "1";
      const inputName = wrap.dataset.inputName || "";
      const maxFiles = Math.max(1, Math.min(50, parseInt(wrap.dataset.maxFiles || "10", 10) || 10));
      const preview = wrap.querySelector("[data-bl-media-preview]");
      const empty = wrap.querySelector("[data-bl-media-empty]");
      const chooseBtn = wrap.querySelector("[data-bl-media-choose]");
      const clearBtn = wrap.querySelector("[data-bl-media-clear]");
      const inputsHost = wrap.querySelector("[data-bl-media-inputs]");
      if (!preview || !chooseBtn || !inputsHost || !inputName) return;
      let selected = [];
      inputsHost.querySelectorAll('input[type="hidden"]').forEach((input) => {
        const id = Number(input.value) || 0;
        if (id <= 0) return;
        selected.push({
          id,
          url: input.getAttribute("data-url") || "",
          filename: input.getAttribute("data-filename") || "#" + id,
          mime: input.getAttribute("data-mime") || "",
          type: input.getAttribute("data-type") || (kind === "image" ? "image" : ""),
          alt: input.getAttribute("data-alt") || ""
        });
      });
      let frame = null;
      const syncInputs = () => {
        inputsHost.replaceChildren();
        if (selected.length === 0) {
          if (multiple) {
            inputsHost.appendChild(el3("input", { type: "hidden", name: inputName + "[]", value: "" }));
          } else {
            inputsHost.appendChild(el3("input", { type: "hidden", name: inputName, value: "" }));
          }
          return;
        }
        selected.forEach((item) => {
          const name = multiple ? inputName + "[]" : inputName;
          const input = el3("input", {
            type: "hidden",
            name,
            value: String(item.id)
          });
          input.setAttribute("data-url", item.url || "");
          input.setAttribute("data-filename", item.filename || "");
          input.setAttribute("data-mime", item.mime || "");
          input.setAttribute("data-type", item.type || "");
          input.setAttribute("data-alt", item.alt || "");
          inputsHost.appendChild(input);
        });
      };
      const syncChrome = () => {
        const has = selected.length > 0;
        if (empty) empty.hidden = has;
        if (clearBtn) clearBtn.hidden = !has;
        if (kind === "image") {
          chooseBtn.textContent = has ? multiple ? i18n3("changeImages", "Change images") : i18n3("changeImage", "Change image") : multiple ? i18n3("chooseImages", "Choose images") : i18n3("chooseImage", "Choose image");
        } else {
          chooseBtn.textContent = has ? multiple ? i18n3("changeFiles", "Change files") : i18n3("changeFile", "Change file") : multiple ? i18n3("chooseFiles", "Choose files") : i18n3("chooseFile", "Choose file");
        }
      };
      const renderPreview = () => {
        preview.replaceChildren();
        selected.forEach((item) => {
          preview.appendChild(
            buildMediaCard(item, kind, (id) => {
              selected = selected.filter((s) => s.id !== id);
              renderPreview();
            })
          );
        });
        syncChrome();
        syncInputs();
      };
      if (multiple) {
        preview.classList.add("is-sortable");
        bindMediaSortable(preview, {
          getSelected: () => selected,
          setSelected: (next) => {
            selected = next;
          },
          onChange: () => {
            syncInputs();
          }
        });
      }
      const openFrame = () => {
        if (typeof wp === "undefined" || !wp.media) return;
        if (frame) {
          frame.open();
          return;
        }
        const opts = {
          title: kind === "image" ? multiple ? i18n3("mediaPickerTitleImages", "Select images") : i18n3("mediaPickerTitleImage", "Select image") : multiple ? i18n3("mediaPickerTitleFiles", "Select files") : i18n3("mediaPickerTitleFile", "Select file"),
          button: { text: i18n3("selectMedia", "Select") },
          multiple
        };
        if (kind === "image") {
          opts.library = { type: "image" };
        }
        frame = wp.media(opts);
        frame.on("select", () => {
          const selection = frame.state().get("selection");
          if (!selection) return;
          let items = selection.map((model) => attachmentFromJson(model.toJSON()));
          items = multiple ? items.slice(0, maxFiles) : items.slice(0, 1);
          selected = items.filter((item) => item.id > 0);
          renderPreview();
        });
        frame.on("open", () => {
          const selection = frame.state().get("selection");
          if (!selection) return;
          selection.reset();
          selected.forEach((item) => {
            const att = wp.media.attachment(item.id);
            selection.add(att);
            att.fetch();
          });
        });
        frame.open();
      };
      chooseBtn.addEventListener("click", (evt) => {
        evt.preventDefault();
        openFrame();
      });
      if (clearBtn) {
        clearBtn.addEventListener("click", (evt) => {
          evt.preventDefault();
          selected = [];
          renderPreview();
        });
      }
      const needsHydrate = selected.some((s) => !s.url);
      if (needsHydrate) {
        Promise.all(selected.map((s) => fetchAttachment(s.id))).then((items) => {
          selected = items.filter((item) => item.id > 0);
          renderPreview();
        });
      } else {
        renderPreview();
      }
    });
  }

  // themes/baselayer/packages/baselayer-blocks/src/js/admin/field-form.js
  function el4(tag, props = {}, children = []) {
    const node = document.createElement(tag);
    Object.entries(props).forEach(([key, value]) => {
      if (value == null || value === false) return;
      if (key === "className") node.className = value;
      else if (key === "text") node.textContent = value;
      else if (key === "html") node.innerHTML = value;
      else if (key === "dataset") Object.assign(node.dataset, value);
      else if (key.startsWith("on") && typeof value === "function") {
        node.addEventListener(key.slice(2).toLowerCase(), value);
      } else if (key === "checked") node.checked = Boolean(value);
      else if (key === "value") node.value = value === true ? "" : String(value);
      else node.setAttribute(key, value === true ? "" : String(value));
    });
    (Array.isArray(children) ? children : [children]).forEach((child) => {
      if (child == null || child === false) return;
      node.appendChild(typeof child === "string" ? document.createTextNode(child) : child);
    });
    return node;
  }
  function i18n4(key, fallback) {
    const dict = window.blBlocksFieldUi && window.blBlocksFieldUi.i18n || window.blBlocksEditor && window.blBlocksEditor.i18n || window.blBlocksPage && window.blBlocksPage.i18n || {};
    return dict[key] || fallback || key;
  }
  function isLayout(type) {
    return type === "column" || type === "section" || type === "group";
  }
  function isStatic(type) {
    return type === "divider" || type === "spacer" || type === "heading" || type === "text_block" || type === "html" || type === "honeypot" || type === "captcha";
  }
  function normalizeHttpsUrl(raw) {
    let v = String(raw || "").replace(
      /^[\s\u00A0\u2000-\u200B\uFEFF]+|[\s\u00A0\u2000-\u200B\uFEFF]+$/g,
      ""
    );
    if (!v) return "";
    v = v.replace(/^[a-z][a-z0-9+.\-]*:/i, "").replace(/^\/\//, "");
    v = v.replace(/^[\s\u00A0\u2000-\u200B\uFEFF]+|[\s\u00A0\u2000-\u200B\uFEFF]+$/g, "");
    if (!v || v.startsWith("/") || v.startsWith("#") || v.startsWith("?")) {
      return "";
    }
    if (/\s/.test(v)) {
      return "";
    }
    const host = v.split(/[/?#]/)[0].split(":")[0];
    if (!host || !/[a-z0-9]/i.test(host)) {
      return "";
    }
    return "https://" + v;
  }
  function bindHttpsUrlInput(input) {
    if (!(input instanceof HTMLInputElement) || input.dataset.blHttpsUrlBound === "1") {
      return;
    }
    input.dataset.blHttpsUrlBound = "1";
    input.addEventListener("blur", () => {
      const next = normalizeHttpsUrl(input.value);
      if (next !== "") {
        input.value = next;
      }
    });
  }
  function bindHttpsUrlFields(root = document) {
    root.querySelectorAll("input[data-bl-blocks-https-url]").forEach((input) => {
      bindHttpsUrlInput(input);
    });
  }
  function collectLeafValue(field, control, type) {
    const name = field.name;
    if (!name) return null;
    if (type === "page" && control && typeof control.getPageValue === "function") {
      return control.getPageValue();
    }
    if ((type === "image" || type === "file") && control && typeof control.getMediaValue === "function") {
      return control.getMediaValue();
    }
    if (type === "link" && control && typeof control.getLinkValue === "function") {
      return control.getLinkValue();
    }
    if (type === "select") {
      if (control.multiple) {
        return Array.from(control.selectedOptions).map((o) => o.value);
      }
      return control.value;
    }
    if (type === "checkboxes") {
      return Array.from(control.querySelectorAll('input[type="checkbox"]:checked')).map(
        (input) => input.value
      );
    }
    if (type === "radio" || type === "button_group") {
      const checked = control.querySelector('input[type="radio"]:checked');
      return checked ? checked.value : "";
    }
    if (type === "toggle" || type === "terms") {
      const input = control.tagName === "INPUT" ? control : control.querySelector("input");
      return input && input.checked ? "1" : "";
    }
    if (type === "url" && control && "value" in control) {
      const next = normalizeHttpsUrl(control.value);
      if (next !== "" && next !== control.value) {
        control.value = next;
      }
      return next !== "" ? next : String(control.value || "").trim();
    }
    if (control && "value" in control) {
      return control.value;
    }
    return "";
  }
  function createLeafControl(field, values, controls) {
    const type = field.type || "text";
    const name = field.name || "";
    if (!name) return null;
    const current = values[name] !== void 0 && values[name] !== null ? values[name] : field.default_value != null ? field.default_value : "";
    const row = el4("div", {
      className: "bl-blocks-fields__row",
      dataset: { fieldName: name }
    });
    const id = "bl-blocks-ui-" + name.replace(/[^a-z0-9_-]/gi, "_") + "-" + Math.random().toString(36).slice(2, 7);
    if (!field.hide_label && type !== "toggle" && type !== "terms") {
      const label = el4("label", { className: "bl-blocks-fields__label", text: field.label || name });
      label.setAttribute("for", id);
      if (field.required) {
        label.appendChild(document.createTextNode(" "));
        label.appendChild(el4("span", { className: "required", text: "*" }));
      }
      row.appendChild(label);
    }
    let control = null;
    const options = Array.isArray(field.options) ? field.options : [];
    if (type === "textarea") {
      control = el4("textarea", {
        className: "widefat",
        id,
        rows: field.rows || 4,
        value: current == null ? "" : String(current)
      });
      if (field.placeholder) control.placeholder = field.placeholder;
    } else if (type === "select") {
      const multiple = !!field.multiple;
      control = el4("select", { className: "widefat", id });
      if (multiple) control.multiple = true;
      if (!multiple) {
        control.appendChild(el4("option", { value: "", text: "\u2014" }));
      }
      const selected = multiple ? (Array.isArray(current) ? current : []).map(String) : [String(current == null ? "" : current)];
      options.forEach((opt) => {
        const ov = String(opt.value ?? "");
        const option2 = el4("option", { value: ov, text: opt.label || ov });
        if (selected.includes(ov)) option2.selected = true;
        control.appendChild(option2);
      });
    } else if (type === "radio" || type === "button_group") {
      control = el4("div", { className: "bl-blocks-fields__choices" });
      options.forEach((opt, i) => {
        const ov = String(opt.value ?? "");
        const oid = id + "-" + i;
        const input = el4("input", {
          type: "radio",
          name: id,
          id: oid,
          value: ov,
          checked: String(current) === ov
        });
        control.appendChild(
          el4("label", { className: "bl-blocks-fields__choice" }, [
            input,
            document.createTextNode(" " + (opt.label || ov))
          ])
        );
      });
    } else if (type === "checkboxes") {
      control = el4("div", { className: "bl-blocks-fields__choices" });
      const list = Array.isArray(current) ? current.map(String) : [];
      options.forEach((opt, i) => {
        const ov = String(opt.value ?? "");
        const oid = id + "-" + i;
        const input = el4("input", {
          type: "checkbox",
          id: oid,
          value: ov,
          checked: list.includes(ov)
        });
        control.appendChild(
          el4("label", { className: "bl-blocks-fields__choice" }, [
            input,
            document.createTextNode(" " + (opt.label || ov))
          ])
        );
      });
    } else if (type === "toggle" || type === "terms") {
      const input = el4("input", {
        type: "checkbox",
        id,
        checked: !!current && current !== "0" && current !== ""
      });
      control = el4("label", { className: "bl-blocks-fields__toggle" }, [
        input,
        document.createTextNode(" " + (field.label || name))
      ]);
    } else if (type === "hidden") {
      control = el4("input", {
        type: "hidden",
        id,
        value: current == null ? "" : String(current)
      });
    } else if (type === "page") {
      control = createPagePickerControl(field, current);
      if (control) control.id = id;
    } else if (type === "image" || type === "file") {
      control = createMediaPickerControl(field, current);
      if (control) control.id = id;
    } else if (type === "link") {
      control = createLinkControl(field, current);
      if (control) control.id = id;
    } else {
      let inputType = "text";
      if (type === "email" || type === "number" || type === "date" || type === "time") {
        inputType = type;
      } else if (type === "phone") {
        inputType = "tel";
      } else if (type === "datetime") {
        inputType = "datetime-local";
      }
      control = el4("input", {
        className: "widefat",
        type: inputType,
        id,
        value: current == null ? "" : String(current)
      });
      if (field.placeholder) control.placeholder = field.placeholder;
      if (type === "url") {
        if (!control.placeholder) control.placeholder = "https://";
        bindHttpsUrlInput(control);
      }
    }
    if (control) {
      row.appendChild(control);
      controls.push({ field, control, type });
    }
    if (field.description) {
      row.appendChild(el4("p", { className: "description", text: field.description }));
    }
    return row;
  }
  function createFieldForm(fields, values = {}, options = {}) {
    const compact = options && options.layout === "compact";
    const rootAttrs = {
      className: "bl-blocks-fields" + (compact ? " bl-blocks-fields--compact" : ""),
      dataset: { blBlocksFields: "" }
    };
    if (compact) {
      rootAttrs.dataset.layout = "compact";
    }
    const root = el4("div", rootAttrs);
    const entries = [];
    const walk = (list, parent, valueMap) => {
      (list || []).forEach((field) => {
        if (!field || field.active === false) return;
        const type = field.type || "text";
        if (isLayout(type)) {
          const design = compact ? "standard" : ["standard", "outline", "card"].includes(field.design) ? field.design : "standard";
          const layoutClass = [
            "bl-blocks-fields__layout",
            "bl-blocks-fields__layout--" + type,
            "bl-blocks-fields__layout--" + design
          ];
          if (field.css_class) {
            layoutClass.push(String(field.css_class).trim());
          }
          const wrap = el4("div", { className: layoutClass.filter(Boolean).join(" ") });
          const showTitle = type !== "section" || field.show_title !== false && field.show_title !== 0 && field.show_title !== "0";
          if (type === "section" && showTitle && field.label) {
            wrap.appendChild(el4("h3", { className: "bl-blocks-fields__section-title", text: field.label }));
          }
          parent.appendChild(wrap);
          walk(field.children || [], wrap, valueMap);
          return;
        }
        if (type === "heading") {
          if (field.label) {
            parent.appendChild(el4("h4", { className: "bl-blocks-fields__heading", text: field.label }));
          }
          return;
        }
        if (type === "text_block" || type === "html") {
          const content = field.default_value || field.content || field.label || "";
          if (content) {
            parent.appendChild(el4("div", { className: "bl-blocks-fields__static", html: content }));
          }
          return;
        }
        if (isStatic(type)) return;
        if (type === "repeater") {
          parent.appendChild(createRepeaterControl(field, valueMap, entries, options));
          return;
        }
        const leafControls = [];
        const row = createLeafControl(field, valueMap, leafControls);
        if (row) {
          parent.appendChild(row);
          leafControls.forEach((c) => entries.push({ kind: "leaf", ...c }));
        }
      });
    };
    walk(fields, root, values || {});
    const getValues = () => {
      const out = {};
      entries.forEach((entry) => {
        if (entry.kind === "repeater" && typeof entry.getRows === "function") {
          if (entry.field.name) {
            out[entry.field.name] = entry.getRows();
          }
          return;
        }
        if (entry.kind === "leaf") {
          const val = collectLeafValue(entry.field, entry.control, entry.type);
          if (entry.field.name) {
            out[entry.field.name] = val;
          }
        }
      });
      return out;
    };
    return { root, getValues };
  }
  function createRepeaterControl(field, valueMap, entries, options = {}) {
    const compact = options && options.layout === "compact";
    const name = field.name || "";
    const children = Array.isArray(field.children) ? field.children : [];
    const minRows = Math.max(0, parseInt(field.min_rows, 10) || 0);
    const maxRows = Math.max(0, parseInt(field.max_rows, 10) || 0);
    const buttonLabel = field.button_label || i18n4("addRow", "Add row");
    const design = compact ? "standard" : ["standard", "outline", "card"].includes(field.design) ? field.design : "standard";
    const showTitle = field.show_title !== false && field.show_title !== 0 && field.show_title !== "0";
    let rows = Array.isArray(valueMap[name]) ? valueMap[name].slice() : [];
    while (rows.length < minRows) {
      rows.push({});
    }
    const classNames = ["bl-blocks-fields__repeater", "bl-blocks-fields__repeater--" + design];
    if (field.css_class) {
      classNames.push(String(field.css_class).trim());
    }
    const wrap = el4("div", {
      className: classNames.filter(Boolean).join(" "),
      dataset: { fieldName: name }
    });
    if (showTitle && !field.hide_label && field.label) {
      wrap.appendChild(el4("div", { className: "bl-blocks-fields__label", text: field.label }));
    }
    if (field.description) {
      wrap.appendChild(el4("p", { className: "description", text: field.description }));
    }
    const rowsEl = el4("div", { className: "bl-blocks-fields__repeater-rows" });
    const rowForms = [];
    const syncRowTitles = () => {
      Array.from(rowsEl.children).forEach((rowEl, i) => {
        const title = rowEl.querySelector(".bl-blocks-fields__repeater-row-title");
        if (title) {
          const template = i18n4("rowLabel", "Row %d");
          title.textContent = template.replace("%d", String(i + 1));
        }
      });
    };
    const canAdd = () => maxRows === 0 || rowForms.length < maxRows;
    const canRemove = () => rowForms.length > minRows;
    const addBtn = el4("button", {
      type: "button",
      className: "button bl-blocks-fields__repeater-add",
      text: buttonLabel
    });
    const refreshAddBtn = () => {
      addBtn.disabled = !canAdd();
    };
    const mountRow = (rowValues) => {
      const rowEl = el4("div", { className: "bl-blocks-fields__repeater-row" });
      const header = el4("div", { className: "bl-blocks-fields__repeater-row-header" }, [
        el4("span", { className: "bl-blocks-fields__repeater-row-title", text: "" })
      ]);
      const removeBtn = el4("button", {
        type: "button",
        className: "button-link-delete bl-blocks-fields__repeater-remove",
        text: i18n4("removeRow", "Remove row")
      });
      header.appendChild(removeBtn);
      rowEl.appendChild(header);
      const form = createFieldForm(children, rowValues || {}, options);
      rowEl.appendChild(form.root);
      rowsEl.appendChild(rowEl);
      const entry = { getValues: form.getValues, rowEl, removeBtn };
      rowForms.push(entry);
      removeBtn.addEventListener("click", () => {
        if (!canRemove()) return;
        const idx = rowForms.indexOf(entry);
        if (idx >= 0) rowForms.splice(idx, 1);
        rowEl.remove();
        syncRowTitles();
        refreshAddBtn();
        rowForms.forEach((r) => {
          r.removeBtn.disabled = !canRemove();
        });
      });
      removeBtn.disabled = !canRemove();
      syncRowTitles();
      refreshAddBtn();
    };
    rows.forEach((rowValues) => mountRow(rowValues));
    if (rows.length === 0 && minRows === 0) {
    }
    addBtn.addEventListener("click", () => {
      if (!canAdd()) return;
      mountRow({});
      rowForms.forEach((r) => {
        r.removeBtn.disabled = !canRemove();
      });
    });
    wrap.appendChild(rowsEl);
    wrap.appendChild(addBtn);
    refreshAddBtn();
    entries.push({
      kind: "repeater",
      field,
      getRows: () => rowForms.map((r) => r.getValues())
    });
    return wrap;
  }
  function openFieldsModal(opts) {
    const title = opts.title || i18n4("edit", "Edit");
    const form = createFieldForm(opts.fields || [], opts.values || {});
    const overlay = el4("div", { className: "bl-blocks-modal-overlay", role: "presentation" });
    const dialog = el4("div", {
      className: "bl-blocks-modal",
      role: "dialog",
      "aria-modal": "true",
      "aria-label": title
    });
    const close = () => {
      document.removeEventListener("keydown", onKey);
      overlay.remove();
    };
    const onKey = (evt) => {
      if (evt.key === "Escape") {
        evt.preventDefault();
        close();
      }
    };
    const header = el4("div", { className: "bl-blocks-modal__header" }, [
      el4("h2", { className: "bl-blocks-modal__title", text: title }),
      el4("button", {
        type: "button",
        className: "bl-blocks-modal__close",
        text: "\xD7",
        "aria-label": i18n4("close", "Close"),
        onClick: close
      })
    ]);
    const body = el4("div", { className: "bl-blocks-modal__body" }, [form.root]);
    const footer = el4("div", { className: "bl-blocks-modal__footer" }, [
      el4("button", {
        type: "button",
        className: "button",
        text: i18n4("cancel", "Cancel"),
        onClick: close
      }),
      el4("button", {
        type: "button",
        className: "button button-primary",
        text: i18n4("save", "Save"),
        onClick: () => {
          if (typeof opts.onSave === "function") {
            opts.onSave(form.getValues());
          }
          close();
        }
      })
    ]);
    dialog.append(header, body, footer);
    overlay.appendChild(dialog);
    overlay.addEventListener("click", (evt) => {
      if (evt.target === overlay) close();
    });
    document.body.appendChild(overlay);
    document.addEventListener("keydown", onKey);
    const first = dialog.querySelector("input, textarea, select, button");
    if (first && typeof first.focus === "function") {
      setTimeout(() => first.focus(), 0);
    }
    return { close, getValues: form.getValues };
  }
  window.blBlocksFieldUiApi = {
    createFieldForm,
    openFieldsModal,
    bindPagePickers,
    bindLinkFields,
    bindMediaPickers,
    bindHttpsUrlFields
  };
  if (typeof document !== "undefined") {
    document.addEventListener("DOMContentLoaded", () => {
      bindPagePickers(document);
      bindLinkFields(document);
      bindMediaPickers(document);
      bindHttpsUrlFields(document);
    });
  }

  // themes/baselayer/packages/baselayer-blocks/src/js/editor.js
  (function(wp2) {
    if (!wp2 || !wp2.element || !wp2.components || !wp2.blocks) {
      return;
    }
    const { createElement: el5, Fragment, RawHTML, useState, useEffect, useRef } = wp2.element;
    const { Button, PanelBody, ToolbarGroup, ToolbarButton, Placeholder, Spinner } = wp2.components;
    const { InspectorControls, BlockControls, useBlockProps } = wp2.blockEditor || {};
    const { registerBlockType } = wp2.blocks;
    const { registerPlugin } = wp2.plugins || {};
    const { PluginDocumentSettingPanel } = wp2.editPost || wp2.editor || {};
    const { useSelect, useDispatch } = wp2.data || {};
    const apiFetch = wp2.apiFetch;
    const debounce = wp2.compose && wp2.compose.debounce || null;
    const blockConfig = window.blBlocksEditor || {};
    const pageConfig = window.blBlocksPage || {};
    const blockI18n = blockConfig.i18n || {};
    const pageI18n = pageConfig.i18n || {};
    const renderPath = blockConfig.renderPath || "baselayer-blocks/v1/render";
    function blockIcon(icon) {
      if (typeof icon === "string" && icon.toLowerCase().includes("<svg")) {
        return {
          src: el5(
            "span",
            { style: { display: "flex" } },
            el5(RawHTML, null, icon)
          )
        };
      }
      return icon || "block-default";
    }
    function openBlockModal(fields, values, onSave, title) {
      openFieldsModal({
        title: title || blockI18n.edit || "Edit fields",
        fields,
        values: values || {},
        onSave
      });
    }
    function normalizeValues(raw) {
      return raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {};
    }
    function PreviewLoading() {
      return el5("div", { className: "bl-blocks-block-preview-loading" }, el5(Spinner, null));
    }
    function SidebarFields({ fields, values, onChange, onOpenModal, mountId }) {
      const hostRef = useRef(null);
      const onChangeRef = useRef(onChange);
      const valuesRef = useRef(values);
      onChangeRef.current = onChange;
      valuesRef.current = values;
      useEffect(() => {
        const host = hostRef.current;
        if (!host) {
          return void 0;
        }
        const form = createFieldForm(fields || [], valuesRef.current || {}, { layout: "compact" });
        host.replaceChildren(form.root);
        const sync = () => {
          if (typeof onChangeRef.current === "function") {
            onChangeRef.current(normalizeValues(form.getValues()));
          }
        };
        const onRepeaterClick = (evt) => {
          const target = evt.target;
          if (target && typeof target.closest === "function" && target.closest(".bl-blocks-fields__repeater-add, .bl-blocks-fields__repeater-remove")) {
            window.setTimeout(sync, 0);
          }
        };
        form.root.addEventListener("input", sync);
        form.root.addEventListener("change", sync);
        form.root.addEventListener("click", onRepeaterClick);
        return () => {
          form.root.removeEventListener("input", sync);
          form.root.removeEventListener("change", sync);
          form.root.removeEventListener("click", onRepeaterClick);
          host.replaceChildren();
        };
      }, [fields, mountId]);
      return el5(
        "div",
        { className: "bl-blocks-sidebar-fields" },
        typeof onOpenModal === "function" ? el5(
          Button,
          {
            variant: "secondary",
            className: "bl-blocks-edit-fields-button",
            onClick: onOpenModal
          },
          blockI18n.openFieldEditor || "Open field editor"
        ) : null,
        el5("div", { className: "bl-blocks-sidebar-fields__host", ref: hostRef })
      );
    }
    function BlockServerPreview({ name, values }) {
      const [response, setResponse] = useState({ status: "idle" });
      const shouldDebounceRef = useRef(false);
      const valuesKey = JSON.stringify(values || {});
      useEffect(() => {
        if (!apiFetch || !name) {
          return void 0;
        }
        const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
        let cancelled = false;
        const run = () => {
          setResponse({ status: "loading" });
          apiFetch({
            path: renderPath,
            method: "POST",
            data: { name, values: values || {} },
            signal: controller ? controller.signal : void 0
          }).then((res) => {
            if (cancelled) return;
            setResponse({
              status: "success",
              content: res && typeof res.rendered === "string" ? res.rendered : ""
            });
          }).catch((error) => {
            if (cancelled || error && error.name === "AbortError") {
              return;
            }
            setResponse({
              status: "error",
              error: error && error.message || String(error)
            });
          }).finally(() => {
            shouldDebounceRef.current = true;
          });
        };
        let cancelDebounce = () => {
        };
        if (debounce && shouldDebounceRef.current) {
          const debounced = debounce(run, 500);
          debounced();
          cancelDebounce = () => debounced.cancel();
        } else if (shouldDebounceRef.current) {
          const t = window.setTimeout(run, 500);
          cancelDebounce = () => window.clearTimeout(t);
        } else {
          run();
        }
        return () => {
          cancelled = true;
          if (controller) {
            controller.abort();
          }
          cancelDebounce();
        };
      }, [name, valuesKey]);
      if (response.status === "loading" || response.status === "idle") {
        return el5(PreviewLoading, null);
      }
      if (response.status === "error") {
        const template = blockI18n.previewError || "Error loading preview: %s";
        const message = template.replace("%s", response.error || "");
        return el5(Placeholder, { className: "bl-blocks-block-preview-error", label: message });
      }
      if (!response.content) {
        return el5(Placeholder, {
          className: "bl-blocks-block-preview-empty",
          label: blockI18n.previewEmpty || "Block rendered as empty."
        });
      }
      return el5(RawHTML, null, response.content);
    }
    (blockConfig.blocks || []).forEach((def) => {
      if (!def || !def.name) return;
      registerBlockType(def.name, {
        apiVersion: 3,
        title: def.title || def.slug,
        description: def.description || "",
        category: def.category || "widgets",
        icon: blockIcon(def.icon),
        keywords: def.keywords || [],
        attributes: {
          values: {
            type: "object",
            default: {}
          }
        },
        supports: {
          html: false,
          className: true,
          anchor: true
        },
        edit: function Edit(props) {
          const { attributes, setAttributes } = props;
          const values = normalizeValues(attributes.values);
          const [sidebarMountId, setSidebarMountId] = useState(0);
          const sidebarEditing = !!def.sidebarEditing;
          const applyValues = (next) => {
            setAttributes({ values: normalizeValues(next) });
          };
          const open = () => openBlockModal(
            def.fields || [],
            values,
            (next) => {
              applyValues(next);
              if (sidebarEditing) {
                setSidebarMountId((id) => id + 1);
              }
            },
            def.title
          );
          const blockProps = useBlockProps ? useBlockProps({ className: "bl-blocks-block-editor" }) : { className: "bl-blocks-block-editor" };
          const preview = apiFetch ? el5(BlockServerPreview, { name: def.name, values }) : el5(
            "div",
            { className: "bl-blocks-block-editor__fallback" },
            el5("strong", null, def.title || def.slug),
            el5("p", null, blockI18n.preview || "Edit fields to configure this block.")
          );
          const inspectorBody = sidebarEditing ? el5(SidebarFields, {
            fields: def.fields || [],
            values,
            mountId: sidebarMountId,
            onChange: applyValues,
            onOpenModal: open
          }) : el5(
            Button,
            {
              variant: "secondary",
              className: "bl-blocks-edit-fields-button",
              onClick: open
            },
            blockI18n.edit || "Edit fields"
          );
          return el5(
            Fragment,
            null,
            BlockControls ? el5(
              BlockControls,
              { group: "block" },
              el5(
                ToolbarGroup,
                null,
                el5(ToolbarButton, {
                  icon: "edit",
                  label: blockI18n.edit || "Edit fields",
                  onClick: open
                })
              )
            ) : null,
            InspectorControls ? el5(
              InspectorControls,
              null,
              el5(
                PanelBody,
                { title: blockI18n.panelTitle || "Block fields", initialOpen: true },
                inspectorBody
              )
            ) : null,
            el5("div", blockProps, preview)
          );
        },
        save: function save2() {
          return null;
        }
      });
    });
    if (registerPlugin && PluginDocumentSettingPanel && Array.isArray(pageConfig.definitions)) {
      pageConfig.definitions.forEach((def) => {
        registerPlugin("bl-blocks-page-" + def.id, {
          render: function PageSettingsPanel() {
            const meta = useSelect ? useSelect((select) => {
              const editor = select("core/editor");
              return editor && editor.getEditedPostAttribute ? editor.getEditedPostAttribute("meta") || {} : {};
            }, []) : {};
            const { editPost } = useDispatch ? useDispatch("core/editor") : { editPost: null };
            const values = meta && meta[def.metaKey] || def.values || {};
            const open = () => {
              openFieldsModal({
                title: def.title || pageI18n.panelTitle || "Page Settings",
                fields: def.fields || [],
                values,
                onSave: (next) => {
                  if (!editPost) return;
                  editPost({
                    meta: {
                      ...meta,
                      [def.metaKey]: next
                    }
                  });
                }
              });
            };
            return el5(
              PluginDocumentSettingPanel,
              {
                name: "bl-blocks-page-" + def.id,
                title: def.title || pageI18n.panelTitle || "Page Settings",
                className: "bl-blocks-page-settings-panel"
              },
              def.description ? el5("p", { className: "description" }, def.description) : null,
              el5(
                Button,
                {
                  variant: "secondary",
                  className: "bl-blocks-edit-fields-button",
                  onClick: open
                },
                pageI18n.edit || blockI18n.edit || "Edit fields"
              )
            );
          }
        });
      });
    }
  })(window.wp);
})();
/*! Bundled license information:

sortablejs/modular/sortable.esm.js:
  (**!
   * Sortable 1.15.7
   * @author	RubaXa   <trash@rubaxa.org>
   * @author	owenm    <owen23355@gmail.com>
   * @license MIT
   *)
*/
//# sourceMappingURL=blocks-editor.js.map
