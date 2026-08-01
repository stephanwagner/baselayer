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

  // themes/baselayer/packages/baselayer-blocks/src/js/admin/field-form.js
  function el2(tag, props = {}, children = []) {
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
  function i18n2(key, fallback) {
    const dict = window.blBlocksFieldUi && window.blBlocksFieldUi.i18n || window.blBlocksEditor && window.blBlocksEditor.i18n || window.blBlocksPage && window.blBlocksPage.i18n || {};
    return dict[key] || fallback || key;
  }
  function isLayout(type) {
    return type === "column" || type === "section" || type === "group";
  }
  function isStatic(type) {
    return type === "divider" || type === "spacer" || type === "heading" || type === "text_block" || type === "html" || type === "honeypot" || type === "captcha";
  }
  function collectLeafValue(field, control, type) {
    const name = field.name;
    if (!name) return null;
    if (type === "page" && control && typeof control.getPageValue === "function") {
      return control.getPageValue();
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
    const row = el2("div", {
      className: "bl-blocks-fields__row",
      dataset: { fieldName: name }
    });
    const id = "bl-blocks-ui-" + name.replace(/[^a-z0-9_-]/gi, "_") + "-" + Math.random().toString(36).slice(2, 7);
    if (!field.hide_label && type !== "toggle" && type !== "terms") {
      const label = el2("label", { className: "bl-blocks-fields__label", text: field.label || name });
      label.setAttribute("for", id);
      if (field.required) {
        label.appendChild(document.createTextNode(" "));
        label.appendChild(el2("span", { className: "required", text: "*" }));
      }
      row.appendChild(label);
    }
    let control = null;
    const options = Array.isArray(field.options) ? field.options : [];
    if (type === "textarea") {
      control = el2("textarea", {
        className: "widefat",
        id,
        rows: field.rows || 4,
        value: current == null ? "" : String(current)
      });
      if (field.placeholder) control.placeholder = field.placeholder;
    } else if (type === "select") {
      const multiple = !!field.multiple;
      control = el2("select", { className: "widefat", id });
      if (multiple) control.multiple = true;
      if (!multiple) {
        control.appendChild(el2("option", { value: "", text: "\u2014" }));
      }
      const selected = multiple ? (Array.isArray(current) ? current : []).map(String) : [String(current == null ? "" : current)];
      options.forEach((opt) => {
        const ov = String(opt.value ?? "");
        const option = el2("option", { value: ov, text: opt.label || ov });
        if (selected.includes(ov)) option.selected = true;
        control.appendChild(option);
      });
    } else if (type === "radio" || type === "button_group") {
      control = el2("div", { className: "bl-blocks-fields__choices" });
      options.forEach((opt, i) => {
        const ov = String(opt.value ?? "");
        const oid = id + "-" + i;
        const input = el2("input", {
          type: "radio",
          name: id,
          id: oid,
          value: ov,
          checked: String(current) === ov
        });
        control.appendChild(
          el2("label", { className: "bl-blocks-fields__choice" }, [
            input,
            document.createTextNode(" " + (opt.label || ov))
          ])
        );
      });
    } else if (type === "checkboxes") {
      control = el2("div", { className: "bl-blocks-fields__choices" });
      const list = Array.isArray(current) ? current.map(String) : [];
      options.forEach((opt, i) => {
        const ov = String(opt.value ?? "");
        const oid = id + "-" + i;
        const input = el2("input", {
          type: "checkbox",
          id: oid,
          value: ov,
          checked: list.includes(ov)
        });
        control.appendChild(
          el2("label", { className: "bl-blocks-fields__choice" }, [
            input,
            document.createTextNode(" " + (opt.label || ov))
          ])
        );
      });
    } else if (type === "toggle" || type === "terms") {
      const input = el2("input", {
        type: "checkbox",
        id,
        checked: !!current && current !== "0" && current !== ""
      });
      control = el2("label", { className: "bl-blocks-fields__toggle" }, [
        input,
        document.createTextNode(" " + (field.label || name))
      ]);
    } else if (type === "hidden") {
      control = el2("input", {
        type: "hidden",
        id,
        value: current == null ? "" : String(current)
      });
    } else if (type === "page") {
      control = createPagePickerControl(field, current);
      if (control) control.id = id;
    } else {
      let inputType = "text";
      if (type === "email" || type === "url" || type === "number" || type === "date" || type === "time") {
        inputType = type;
      } else if (type === "phone") {
        inputType = "tel";
      } else if (type === "datetime") {
        inputType = "datetime-local";
      }
      control = el2("input", {
        className: "widefat",
        type: inputType,
        id,
        value: current == null ? "" : String(current)
      });
      if (field.placeholder) control.placeholder = field.placeholder;
    }
    if (control) {
      row.appendChild(control);
      controls.push({ field, control, type });
    }
    if (field.description) {
      row.appendChild(el2("p", { className: "description", text: field.description }));
    }
    return row;
  }
  function createFieldForm(fields, values = {}) {
    const root = el2("div", { className: "bl-blocks-fields", dataset: { blBlocksFields: "" } });
    const entries = [];
    const walk = (list, parent, valueMap) => {
      (list || []).forEach((field) => {
        if (!field || field.active === false) return;
        const type = field.type || "text";
        if (isLayout(type)) {
          const design = ["standard", "outline", "card"].includes(field.design) ? field.design : "standard";
          const layoutClass = [
            "bl-blocks-fields__layout",
            "bl-blocks-fields__layout--" + type,
            "bl-blocks-fields__layout--" + design
          ];
          if (field.css_class) {
            layoutClass.push(String(field.css_class).trim());
          }
          const wrap = el2("div", { className: layoutClass.filter(Boolean).join(" ") });
          const showTitle = type !== "section" || field.show_title !== false && field.show_title !== 0 && field.show_title !== "0";
          if (type === "section" && showTitle && field.label) {
            wrap.appendChild(el2("h3", { className: "bl-blocks-fields__section-title", text: field.label }));
          }
          parent.appendChild(wrap);
          walk(field.children || [], wrap, valueMap);
          return;
        }
        if (type === "heading") {
          if (field.label) {
            parent.appendChild(el2("h4", { className: "bl-blocks-fields__heading", text: field.label }));
          }
          return;
        }
        if (type === "text_block" || type === "html") {
          const content = field.default_value || field.content || field.label || "";
          if (content) {
            parent.appendChild(el2("div", { className: "bl-blocks-fields__static", html: content }));
          }
          return;
        }
        if (isStatic(type)) return;
        if (type === "repeater") {
          parent.appendChild(createRepeaterControl(field, valueMap, entries));
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
  function createRepeaterControl(field, valueMap, entries) {
    const name = field.name || "";
    const children = Array.isArray(field.children) ? field.children : [];
    const minRows = Math.max(0, parseInt(field.min_rows, 10) || 0);
    const maxRows = Math.max(0, parseInt(field.max_rows, 10) || 0);
    const buttonLabel = field.button_label || i18n2("addRow", "Add row");
    const design = ["standard", "outline", "card"].includes(field.design) ? field.design : "standard";
    const showTitle = field.show_title !== false && field.show_title !== 0 && field.show_title !== "0";
    let rows = Array.isArray(valueMap[name]) ? valueMap[name].slice() : [];
    while (rows.length < minRows) {
      rows.push({});
    }
    const classNames = ["bl-blocks-fields__repeater", "bl-blocks-fields__repeater--" + design];
    if (field.css_class) {
      classNames.push(String(field.css_class).trim());
    }
    const wrap = el2("div", {
      className: classNames.filter(Boolean).join(" "),
      dataset: { fieldName: name }
    });
    if (showTitle && !field.hide_label && field.label) {
      wrap.appendChild(el2("div", { className: "bl-blocks-fields__label", text: field.label }));
    }
    if (field.description) {
      wrap.appendChild(el2("p", { className: "description", text: field.description }));
    }
    const rowsEl = el2("div", { className: "bl-blocks-fields__repeater-rows" });
    const rowForms = [];
    const syncRowTitles = () => {
      Array.from(rowsEl.children).forEach((rowEl, i) => {
        const title = rowEl.querySelector(".bl-blocks-fields__repeater-row-title");
        if (title) {
          const template = i18n2("rowLabel", "Row %d");
          title.textContent = template.replace("%d", String(i + 1));
        }
      });
    };
    const canAdd = () => maxRows === 0 || rowForms.length < maxRows;
    const canRemove = () => rowForms.length > minRows;
    const addBtn = el2("button", {
      type: "button",
      className: "button bl-blocks-fields__repeater-add",
      text: buttonLabel
    });
    const refreshAddBtn = () => {
      addBtn.disabled = !canAdd();
    };
    const mountRow = (rowValues) => {
      const rowEl = el2("div", { className: "bl-blocks-fields__repeater-row" });
      const header = el2("div", { className: "bl-blocks-fields__repeater-row-header" }, [
        el2("span", { className: "bl-blocks-fields__repeater-row-title", text: "" })
      ]);
      const removeBtn = el2("button", {
        type: "button",
        className: "button-link-delete bl-blocks-fields__repeater-remove",
        text: i18n2("removeRow", "Remove row")
      });
      header.appendChild(removeBtn);
      rowEl.appendChild(header);
      const form = createFieldForm(children, rowValues || {});
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
    const title = opts.title || i18n2("edit", "Edit");
    const form = createFieldForm(opts.fields || [], opts.values || {});
    const overlay = el2("div", { className: "bl-blocks-modal-overlay", role: "presentation" });
    const dialog = el2("div", {
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
    const header = el2("div", { className: "bl-blocks-modal__header" }, [
      el2("h2", { className: "bl-blocks-modal__title", text: title }),
      el2("button", {
        type: "button",
        className: "bl-blocks-modal__close",
        text: "\xD7",
        "aria-label": i18n2("close", "Close"),
        onClick: close
      })
    ]);
    const body = el2("div", { className: "bl-blocks-modal__body" }, [form.root]);
    const footer = el2("div", { className: "bl-blocks-modal__footer" }, [
      el2("button", {
        type: "button",
        className: "button",
        text: i18n2("cancel", "Cancel"),
        onClick: close
      }),
      el2("button", {
        type: "button",
        className: "button button-primary",
        text: i18n2("save", "Save"),
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
    bindPagePickers
  };
  if (typeof document !== "undefined") {
    document.addEventListener("DOMContentLoaded", () => {
      bindPagePickers(document);
    });
  }

  // themes/baselayer/packages/baselayer-blocks/src/js/editor.js
  (function(wp) {
    if (!wp || !wp.element || !wp.components || !wp.blocks) {
      return;
    }
    const { createElement: el3, Fragment, RawHTML, useState, useEffect, useRef } = wp.element;
    const { Button, PanelBody, ToolbarGroup, ToolbarButton, Placeholder, Spinner } = wp.components;
    const { InspectorControls, BlockControls, useBlockProps } = wp.blockEditor || {};
    const { registerBlockType } = wp.blocks;
    const { registerPlugin } = wp.plugins || {};
    const { PluginDocumentSettingPanel } = wp.editPost || wp.editor || {};
    const { useSelect, useDispatch } = wp.data || {};
    const apiFetch = wp.apiFetch;
    const debounce = wp.compose && wp.compose.debounce || null;
    const blockConfig = window.blBlocksEditor || {};
    const pageConfig = window.blBlocksPage || {};
    const blockI18n = blockConfig.i18n || {};
    const pageI18n = pageConfig.i18n || {};
    const renderPath = blockConfig.renderPath || "baselayer-blocks/v1/render";
    function blockIcon(icon) {
      if (typeof icon === "string" && icon.toLowerCase().includes("<svg")) {
        return {
          src: el3(
            "span",
            { style: { display: "flex" } },
            el3(RawHTML, null, icon)
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
      return el3("div", { className: "bl-blocks-block-preview-loading" }, el3(Spinner, null));
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
        return el3(PreviewLoading, null);
      }
      if (response.status === "error") {
        const template = blockI18n.previewError || "Error loading preview: %s";
        const message = template.replace("%s", response.error || "");
        return el3(Placeholder, { className: "bl-blocks-block-preview-error", label: message });
      }
      if (!response.content) {
        return el3(Placeholder, {
          className: "bl-blocks-block-preview-empty",
          label: blockI18n.previewEmpty || "Block rendered as empty."
        });
      }
      return el3(RawHTML, null, response.content);
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
          const open = () => openBlockModal(def.fields || [], values, (next) => {
            setAttributes({ values: normalizeValues(next) });
          }, def.title);
          const blockProps = useBlockProps ? useBlockProps({ className: "bl-blocks-block-editor" }) : { className: "bl-blocks-block-editor" };
          const preview = apiFetch ? el3(BlockServerPreview, { name: def.name, values }) : el3(
            "div",
            { className: "bl-blocks-block-editor__fallback" },
            el3("strong", null, def.title || def.slug),
            el3("p", null, blockI18n.preview || "Edit fields to configure this block.")
          );
          return el3(
            Fragment,
            null,
            BlockControls ? el3(
              BlockControls,
              { group: "block" },
              el3(
                ToolbarGroup,
                null,
                el3(ToolbarButton, {
                  icon: "edit",
                  label: blockI18n.edit || "Edit fields",
                  onClick: open
                })
              )
            ) : null,
            InspectorControls ? el3(
              InspectorControls,
              null,
              el3(
                PanelBody,
                { title: blockI18n.panelTitle || "Block fields", initialOpen: true },
                el3(
                  Button,
                  { variant: "secondary", onClick: open },
                  blockI18n.edit || "Edit fields"
                )
              )
            ) : null,
            el3("div", blockProps, preview)
          );
        },
        save: function save() {
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
            return el3(
              PluginDocumentSettingPanel,
              {
                name: "bl-blocks-page-" + def.id,
                title: def.title || pageI18n.panelTitle || "Page Settings",
                className: "bl-blocks-page-panel"
              },
              def.description ? el3("p", { className: "description" }, def.description) : null,
              el3(
                Button,
                { variant: "secondary", onClick: open },
                pageI18n.openFields || pageI18n.edit || "Edit fields"
              )
            );
          }
        });
      });
    }
  })(window.wp);
})();
//# sourceMappingURL=blocks-editor.js.map
