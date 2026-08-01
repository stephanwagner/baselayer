(() => {
  // themes/baselayer/packages/baselayer-forms/src/js/admin/dom.js
  var PALETTE_SECTIONS = [
    {
      id: "popular",
      headingKey: "paletteSectionPopular",
      headingFallback: "Popular",
      types: ["text", "textarea", "email", "phone", "terms"]
    },
    {
      id: "input",
      headingKey: "paletteSectionInput",
      headingFallback: "Input",
      types: ["text", "textarea", "email", "phone", "url", "number", "terms"]
    },
    {
      id: "choice",
      headingKey: "paletteSectionChoice",
      headingFallback: "Choice",
      types: ["checkboxes", "radio", "select", "toggle", "button_group"]
    },
    {
      id: "datetime",
      headingKey: "paletteSectionDatetime",
      headingFallback: "Date & time",
      types: ["date", "time", "datetime"]
    },
    {
      id: "files",
      headingKey: "paletteSectionFiles",
      headingFallback: "Uploads",
      types: ["file", "image"]
    },
    {
      id: "content",
      headingKey: "paletteSectionContent",
      headingFallback: "Content",
      types: ["heading", "text_block", "html"]
    },
    {
      id: "layout",
      headingKey: "paletteSectionLayout",
      headingFallback: "Layout",
      types: ["section", "column", "divider", "spacer"]
    },
    {
      id: "advanced",
      headingKey: "paletteSectionAdvanced",
      headingFallback: "Advanced",
      types: ["hidden", "captcha"]
    }
  ];
  function uid() {
    return "f" + Math.random().toString(36).slice(2, 10);
  }
  function el(tag, props = {}, children = []) {
    const node = document.createElement(tag);
    Object.entries(props).forEach(([key, value]) => {
      if (value == null || value === false) return;
      if (key === "className") node.className = value;
      else if (key === "text") node.textContent = value;
      else if (key === "html") appendSafeHelpHtml(node, value);
      else if (key === "dataset") Object.assign(node.dataset, value);
      else if (key.startsWith("on") && typeof value === "function") {
        node.addEventListener(key.slice(2).toLowerCase(), value);
      } else if (key === "checked") node.checked = Boolean(value);
      else node.setAttribute(key, value === true ? "" : String(value));
    });
    (Array.isArray(children) ? children : [children]).forEach((child) => {
      if (child == null || child === false) return;
      node.appendChild(typeof child === "string" ? document.createTextNode(child) : child);
    });
    return node;
  }
  function appendSafeHelpHtml(node, html) {
    const template = document.createElement("template");
    template.innerHTML = String(html || "");
    const appendFrom = (parent, target) => {
      parent.childNodes.forEach((child) => {
        if (child.nodeType === Node.TEXT_NODE) {
          target.appendChild(document.createTextNode(child.textContent || ""));
          return;
        }
        if (child.nodeType !== Node.ELEMENT_NODE) {
          return;
        }
        const tag = child.tagName.toLowerCase();
        if (tag === "b" || tag === "i") {
          const elNode = document.createElement(tag);
          appendFrom(child, elNode);
          target.appendChild(elNode);
          return;
        }
        if (tag === "span") {
          const span = document.createElement("span");
          span.style.whiteSpace = "nowrap";
          appendFrom(child, span);
          target.appendChild(span);
          return;
        }
        appendFrom(child, target);
      });
    };
    appendFrom(template.content, node);
  }
  function t(key, fallback = "") {
    const dict = window.blFormsAdmin && window.blFormsAdmin.i18n || {};
    return dict[key] || fallback || key;
  }
  function iconMarkup(key) {
    const icons = window.blFormsAdmin && window.blFormsAdmin.icons || {};
    return icons[key] || "";
  }
  function iconEl(key, className = "bl-forms-builder__icon") {
    const wrap = el("span", {
      className,
      "aria-hidden": "true"
    });
    const markup = iconMarkup(key);
    if (markup) {
      wrap.innerHTML = markup;
    }
    return wrap;
  }
  function typeLabel(type) {
    const dict = window.blFormsAdmin && window.blFormsAdmin.i18n || {};
    return dict.types && dict.types[type] || type;
  }
  function fieldIsActive(field) {
    return !field || field.active !== false;
  }
  function slugifyName(text) {
    const slug = String(text || "").trim().toLowerCase().replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").replace(/_+/g, "_");
    return slug || "field";
  }
  function slugifyOption(text) {
    const slug = String(text || "").trim().toLowerCase().replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").replace(/-+/g, "-");
    return slug || "option";
  }
  function collectFieldNames(exceptId = "") {
    return Array.from(document.querySelectorAll("[data-bl-forms-field]")).filter((row) => !exceptId || row.dataset.fieldId !== exceptId).map((row) => {
      const input = row.querySelector("[data-bl-name]");
      const value = (input?.value || row.dataset.fieldName || "").trim();
      return value;
    }).filter(Boolean);
  }
  function uniqueFieldName(base, exceptId = "") {
    const root = slugifyName(base);
    const used = new Set(collectFieldNames(exceptId).map((n) => n.toLowerCase()));
    if (!used.has(root)) {
      return root;
    }
    let i = 2;
    while (used.has(`${root}_${i}`)) {
      i += 1;
    }
    return `${root}_${i}`;
  }
  function cloneFieldData(data) {
    const copy = JSON.parse(JSON.stringify(data || {}));
    const reserved = new Set(collectFieldNames().map((n) => n.toLowerCase()));
    const mintName = (base) => {
      const root = slugifyName(base);
      if (!reserved.has(root)) {
        reserved.add(root);
        return root;
      }
      let i = 2;
      while (reserved.has(`${root}_${i}`)) {
        i += 1;
      }
      const next = `${root}_${i}`;
      reserved.add(next);
      return next;
    };
    const walk = (node) => {
      if (!node || typeof node !== "object") {
        return;
      }
      node.id = uid();
      if (node.name != null && String(node.name).trim() !== "") {
        node.name = mintName(node.name);
      }
      if (Array.isArray(node.children)) {
        node.children.forEach(walk);
      }
    };
    walk(copy);
    return copy;
  }
  function defaultField(type = "text") {
    const id = uid();
    if (type === "divider") {
      return { id, type, margin: "m", margin_custom: "", css_class: "" };
    }
    if (type === "spacer") {
      return {
        id,
        type,
        height: "m",
        height_custom: "",
        css_class: ""
      };
    }
    if (type === "captcha") {
      return {
        id,
        type,
        width: "100",
        width_custom: "",
        css_class: ""
      };
    }
    if (type === "heading") {
      return {
        id,
        type,
        content: typeLabel(type),
        level: "h2",
        width: "100",
        width_custom: "",
        css_class: ""
      };
    }
    if (type === "text_block" || type === "html") {
      return {
        id,
        type,
        content: "",
        width: "100",
        width_custom: "",
        css_class: ""
      };
    }
    if (type === "honeypot") {
      return {
        id,
        type,
        name: slugifyName(typeLabel(type)),
        name_manual: false,
        label: typeLabel(type),
        hide_label: false,
        width: "100",
        width_custom: "",
        css_class: ""
      };
    }
    if (type === "hidden") {
      return {
        id,
        type,
        name: slugifyName(typeLabel(type)),
        name_manual: false,
        label: typeLabel(type),
        hide_label: false,
        default_value: "",
        width: "100",
        width_custom: "",
        css_class: ""
      };
    }
    if (type === "column") {
      return {
        id,
        type,
        width: "100",
        width_custom: "",
        children: []
      };
    }
    if (type === "section") {
      return {
        id,
        type,
        label: typeLabel(type),
        width: "100",
        width_custom: "",
        design: "standard",
        children: []
      };
    }
    const base = {
      id,
      type,
      label: typeLabel(type),
      name: slugifyName(typeLabel(type)),
      name_manual: false,
      hide_label: false,
      active: true,
      required: type === "terms",
      placeholder: "",
      description: "",
      width: "100",
      width_custom: "",
      css_class: ""
    };
    if (["radio", "checkboxes", "select", "button_group"].includes(type)) {
      base.options = [
        { label: t("optionOne", "Option 1"), value: "option-1" },
        { label: t("optionTwo", "Option 2"), value: "option-2" }
      ];
    }
    if (["radio", "checkboxes"].includes(type)) {
      base.layout = "vertical";
    }
    if (["select", "button_group", "file", "image"].includes(type)) {
      base.multiple = false;
    }
    if (type === "file" || type === "image") {
      base.preview = true;
      base.upload_style = "modern";
      base.extensions = type === "image" ? "jpg, jpeg, png, webp, gif, heic, avif" : "";
    }
    if (type === "terms") {
      base.label = t("termsDefaultFieldLabel", "Privacy Policy");
      base.name = slugifyName(base.label);
      base.hide_label = true;
      base.content = t("termsDefaultLabel", "I agree to the [Privacy Policy](page:privacy).");
      base.default_value = "";
    }
    if (type === "toggle") {
      base.label = typeLabel(type);
      base.default_value = "";
    }
    if (type === "textarea") {
      base.rows = 5;
    }
    return base;
  }
  function readConfig() {
    const input = document.getElementById("bl-forms-config-json");
    if (!input) return { fields: [], settings: {} };
    try {
      return JSON.parse(input.value || "{}") || { fields: [], settings: {} };
    } catch (e) {
      return { fields: [], settings: {} };
    }
  }
  function writeConfig(partial) {
    const input = document.getElementById("bl-forms-config-json");
    if (!input) return;
    const current = readConfig();
    input.value = JSON.stringify({
      fields: partial.fields !== void 0 ? partial.fields : current.fields || [],
      settings: partial.settings !== void 0 ? partial.settings : current.settings || {}
    });
  }
  function flattenFields(fields = []) {
    const out = [];
    const walk = (list) => {
      (list || []).forEach((field) => {
        if (!field) return;
        if (field.type === "column" || field.type === "section" || field.type === "group") {
          walk(field.children || []);
          return;
        }
        out.push(field);
      });
    };
    walk(fields);
    return out;
  }

  // themes/baselayer/packages/baselayer-forms/src/js/admin/layout.js
  var NESTED_BLOCKED = ["column", "section", "hidden", "honeypot", "captcha"];
  var columnFieldByEl = /* @__PURE__ */ new WeakMap();
  var sectionFieldByEl = /* @__PURE__ */ new WeakMap();
  function createNestedSortable(list, options) {
    const Builder = window.BlCanvasBuilder;
    if (!Builder || typeof Builder.createSortable !== "function") {
      console.error("BlCanvasBuilder.createSortable is required for nested field lists");
      return null;
    }
    return Builder.createSortable(list, options);
  }
  function prepareNestedField(typeOrData) {
    const data = typeof typeOrData === "string" ? defaultField(typeOrData) : { ...typeOrData };
    if (NESTED_BLOCKED.includes(data.type)) {
      return null;
    }
    if (data.name != null && data.name_manual === false) {
      data.name = uniqueFieldName(data.label || data.name || data.type || "field", data.id || "");
    } else if (data.name) {
      data.name = uniqueFieldName(data.name, data.id || "");
    }
    return data;
  }
  function bindFieldListSortable(list, onChange) {
    const Builder = window.BlCanvasBuilder;
    const onStart = Builder?.dragStart || (() => {
    });
    const onEnd = Builder?.dragEnd || (() => {
    });
    createNestedSortable(list, {
      group: {
        name: "bl-forms-fields",
        put(to, from, dragEl) {
          const type = dragEl.dataset.fieldType || "";
          return !NESTED_BLOCKED.includes(type);
        }
      },
      handle: ".bl-forms-builder__handle",
      animation: 150,
      draggable: ".bl-forms-builder__field, .bl-forms-builder__template",
      onStart,
      onEnd,
      onAdd(evt) {
        const item = evt.item;
        const type = item.dataset.fieldType || "text";
        if (item.classList.contains("bl-forms-builder__template")) {
          const prepared = prepareNestedField(type);
          if (!prepared) {
            item.remove();
            return;
          }
          item.replaceWith(createFieldCard(prepared, true));
        } else if (NESTED_BLOCKED.includes(type)) {
          if (evt.from && evt.from !== list) {
            evt.from.insertBefore(item, evt.from.children[evt.oldIndex] || null);
          } else {
            item.remove();
          }
          return;
        }
        onChange();
      },
      onUpdate: onChange,
      onSort: onChange
    });
  }
  function widthBadgeText(width, widthCustom = "") {
    if (width === "auto") {
      return t("widthAuto", "Auto");
    }
    if (width === "custom") {
      return (widthCustom || "").trim();
    }
    return `${width}%`;
  }
  function equalWidthForCount(count) {
    if (count <= 1) {
      return "100";
    }
    if (count === 2) {
      return "50";
    }
    if (count === 3) {
      return "33";
    }
    return "25";
  }
  function applyColumnWidthToCard(el2, width, widthCustom = "") {
    el2.dataset.fieldWidth = width;
    if (width === "custom") {
      el2.dataset.fieldWidthCustom = widthCustom || "";
    } else {
      delete el2.dataset.fieldWidthCustom;
    }
    const field = columnFieldByEl.get(el2);
    if (field) {
      field.width = width;
      field.width_custom = width === "custom" ? widthCustom || "" : "";
    }
    const badge = el2.querySelector(":scope > .bl-forms-builder__field-header .bl-forms-builder__width-badge");
    if (badge) {
      const text = widthBadgeText(width, widthCustom);
      badge.textContent = text;
      badge.hidden = text === "";
    }
  }
  function equalizeColumnRun(list, columnEl) {
    const all = Array.from(list.children).filter((el2) => el2.matches?.("[data-bl-forms-field]"));
    const pos = all.indexOf(columnEl);
    if (pos < 0) {
      return;
    }
    let start = pos;
    let end = pos;
    while (start > 0 && all[start - 1].dataset.fieldType === "column") {
      start -= 1;
    }
    while (end < all.length - 1 && all[end + 1].dataset.fieldType === "column") {
      end += 1;
    }
    const run = all.slice(start, end + 1);
    const width = equalWidthForCount(run.length);
    run.forEach((el2) => applyColumnWidthToCard(el2, width));
  }
  function createContainerActions(onDelete, onDuplicate) {
    const duplicateBtn = el("button", {
      type: "button",
      className: "bl-forms-builder__icon-btn",
      title: t("duplicate", "Duplicate"),
      "aria-label": t("duplicate", "Duplicate"),
      onClick: onDuplicate
    });
    const duplicateIcon = iconEl("duplicate");
    if (duplicateIcon.innerHTML) {
      duplicateBtn.appendChild(duplicateIcon);
    } else {
      duplicateBtn.textContent = "\u29C9";
    }
    const deleteBtn = el("button", {
      type: "button",
      className: "bl-forms-builder__icon-btn bl-forms-builder__icon-btn--danger",
      title: t("delete", "Delete"),
      "aria-label": t("delete", "Delete"),
      onClick: onDelete
    });
    const trashIcon = iconEl("trash");
    if (trashIcon.innerHTML) {
      deleteBtn.appendChild(trashIcon);
    } else {
      deleteBtn.textContent = "\xD7";
    }
    const handle = el("span", {
      className: "bl-forms-builder__handle",
      title: t("dragField", "Drag to reorder"),
      "aria-hidden": "true"
    });
    const dragIcon = iconEl("drag");
    if (dragIcon.innerHTML) {
      handle.appendChild(dragIcon);
    } else {
      handle.textContent = "\u22EE\u22EE";
    }
    return el("div", { className: "bl-forms-builder__field-actions" }, [duplicateBtn, deleteBtn, handle]);
  }
  function createColumnCard(initial = {}) {
    let field = {
      width: "100",
      width_custom: "",
      children: [],
      ...initial,
      id: initial.id || uid(),
      type: "column"
    };
    const row = el("div", {
      className: "bl-forms-builder__field bl-forms-builder__column-card",
      dataset: {
        blFormsField: "1",
        fieldId: field.id,
        fieldType: "column",
        fieldWidth: field.width || "100",
        ...field.width === "custom" && field.width_custom ? { fieldWidthCustom: field.width_custom } : {}
      }
    });
    columnFieldByEl.set(row, field);
    const preview = el("span", {
      className: "bl-forms-builder__preview",
      text: window.blFormsAdmin?.i18n?.types?.column || t("columnType", "Columns")
    });
    const widthBadge = el("span", { className: "bl-forms-builder__width-badge" });
    const typeChip = el("span", { className: "bl-forms-builder__field-type bl-forms-builder__field-type--column" }, [
      iconEl("column", "bl-forms-builder__field-type-icon"),
      el("span", {
        className: "bl-forms-builder__field-type-label",
        text: window.blFormsAdmin?.i18n?.types?.column || t("columnType", "Columns")
      })
    ]);
    const fieldsList = el("div", {
      className: "bl-forms-builder__column-fields",
      dataset: { blColumnFields: "1" }
    });
    const emptyHint = el("p", {
      className: "description bl-forms-builder__column-empty",
      text: t("columnEmpty", "Drop fields here")
    });
    const syncEmpty = () => {
      emptyHint.hidden = fieldsList.querySelector("[data-bl-forms-field]") != null;
    };
    const updatePreview = () => {
      const width = field.width || "100";
      const widthCustom = field.width_custom || "";
      row.dataset.fieldWidth = width;
      if (width === "custom") {
        row.dataset.fieldWidthCustom = widthCustom || "";
      } else {
        delete row.dataset.fieldWidthCustom;
      }
      const text = widthBadgeText(width, widthCustom);
      widthBadge.textContent = text;
      widthBadge.hidden = text === "";
    };
    const notify = () => document.dispatchEvent(new CustomEvent("bl-forms-builder-changed"));
    const openWidthModal = () => {
      openFieldWidthModal(field, () => {
        updatePreview();
        notify();
      });
    };
    (field.children || []).forEach((child) => {
      fieldsList.appendChild(createFieldCard(child, false));
    });
    bindFieldListSortable(fieldsList, () => {
      syncEmpty();
      notify();
    });
    const fieldsWrap = el("div", { className: "bl-forms-builder__column-fields-wrap" }, [
      fieldsList,
      emptyHint
    ]);
    syncEmpty();
    widthBadge.classList.add("is-interactive");
    widthBadge.title = t("columnWidthTitle", "Column width");
    widthBadge.addEventListener("click", openWidthModal);
    const header = el("div", { className: "bl-forms-builder__field-header" }, [
      preview,
      el("div", { className: "bl-forms-builder__field-meta" }, [widthBadge, typeChip]),
      createContainerActions(
        () => {
          row.remove();
          notify();
        },
        () => duplicateFieldCard(row)
      )
    ]);
    row.append(header, fieldsWrap);
    updatePreview();
    return row;
  }
  function createSectionCard(initial = {}) {
    let field = {
      label: "",
      children: [],
      width: "100",
      width_custom: "",
      design: "standard",
      ...initial,
      id: initial.id || uid(),
      type: "section"
    };
    if (!["standard", "outline", "card"].includes(field.design)) {
      field.design = "standard";
    }
    const row = el("div", {
      className: "bl-forms-builder__field bl-forms-builder__section-card",
      dataset: {
        blFormsField: "1",
        fieldId: field.id,
        fieldType: "section",
        fieldWidth: field.width || "100",
        fieldDesign: field.design || "standard",
        ...field.width === "custom" && field.width_custom ? { fieldWidthCustom: field.width_custom } : {}
      }
    });
    sectionFieldByEl.set(row, field);
    const labelInput = el("input", {
      type: "text",
      className: "bl-forms-builder__section-label-input",
      value: field.label || "",
      placeholder: t("sectionLabelPlaceholder", "No title"),
      "aria-label": t("sectionLabel", "Section title")
    });
    labelInput.addEventListener("input", () => {
      field.label = labelInput.value;
      document.dispatchEvent(new CustomEvent("bl-forms-builder-changed"));
    });
    const widthBadge = el("span", { className: "bl-forms-builder__width-badge" });
    const designBtn = el("button", {
      type: "button",
      className: "bl-forms-builder__design-btn",
      title: t("sectionDesignTitle", "Section design"),
      "aria-label": t("sectionDesignTitle", "Section design")
    });
    designBtn.appendChild(iconEl("design", "bl-forms-builder__design-btn-icon"));
    const typeChip = el("span", { className: "bl-forms-builder__field-type bl-forms-builder__field-type--section" }, [
      iconEl("section", "bl-forms-builder__field-type-icon"),
      el("span", {
        className: "bl-forms-builder__field-type-label",
        text: window.blFormsAdmin?.i18n?.types?.section || t("sectionType", "Section")
      })
    ]);
    const fieldsList = el("div", {
      className: "bl-forms-builder__section-fields",
      dataset: { blSectionFields: "1" }
    });
    const emptyHint = el("p", {
      className: "description bl-forms-builder__section-empty",
      text: t("sectionEmpty", "Drop fields here")
    });
    const syncEmpty = () => {
      emptyHint.hidden = fieldsList.querySelector("[data-bl-forms-field]") != null;
    };
    const updatePreview = () => {
      const width = field.width || "100";
      const widthCustom = field.width_custom || "";
      const design = field.design || "standard";
      row.dataset.fieldWidth = width;
      row.dataset.fieldDesign = design;
      if (width === "custom") {
        row.dataset.fieldWidthCustom = widthCustom || "";
      } else {
        delete row.dataset.fieldWidthCustom;
      }
      const text = widthBadgeText(width, widthCustom);
      widthBadge.textContent = text;
      widthBadge.hidden = text === "";
    };
    const notify = () => document.dispatchEvent(new CustomEvent("bl-forms-builder-changed"));
    const openWidthModal = () => {
      openFieldWidthModal(field, () => {
        updatePreview();
        notify();
      });
    };
    const openDesignModal = () => {
      openSectionDesignModal(field, () => {
        updatePreview();
        notify();
      });
    };
    (field.children || []).forEach((child) => {
      fieldsList.appendChild(createFieldCard(child, false));
    });
    bindFieldListSortable(fieldsList, () => {
      syncEmpty();
      notify();
    });
    const fieldsWrap = el("div", { className: "bl-forms-builder__section-fields-wrap" }, [
      fieldsList,
      emptyHint
    ]);
    syncEmpty();
    widthBadge.classList.add("is-interactive");
    widthBadge.title = t("sectionWidthTitle", "Section width");
    widthBadge.addEventListener("click", openWidthModal);
    designBtn.addEventListener("click", openDesignModal);
    const header = el("div", { className: "bl-forms-builder__field-header" }, [
      labelInput,
      el("div", { className: "bl-forms-builder__field-meta" }, [widthBadge, designBtn, typeChip]),
      createContainerActions(
        () => {
          row.remove();
          notify();
        },
        () => duplicateFieldCard(row)
      )
    ]);
    row.append(header, fieldsWrap);
    updatePreview();
    return row;
  }
  function serializeLayoutRow(row) {
    const type = row.dataset.fieldType || "";
    const id = row.dataset.fieldId || uid();
    if (type === "column") {
      const fields = row.querySelector("[data-bl-column-fields]");
      const width = row.dataset.fieldWidth || "100";
      const widthCustom = row.dataset.fieldWidthCustom || "";
      return {
        id,
        type: "column",
        width,
        width_custom: width === "custom" ? widthCustom : "",
        children: Array.from(fields?.children || []).filter((el2) => el2.matches("[data-bl-forms-field]") && !NESTED_BLOCKED.includes(el2.dataset.fieldType)).map((child) => serializeRow(child))
      };
    }
    if (type === "section") {
      const fields = row.querySelector("[data-bl-section-fields]");
      const live = sectionFieldByEl.get(row);
      const labelInput = row.querySelector(".bl-forms-builder__section-label-input");
      const label = labelInput?.value ?? live?.label ?? "";
      const width = row.dataset.fieldWidth || live?.width || "100";
      const widthCustom = row.dataset.fieldWidthCustom || live?.width_custom || "";
      const design = row.dataset.fieldDesign || live?.design || "standard";
      return {
        id,
        type: "section",
        label,
        width,
        width_custom: width === "custom" ? widthCustom : "",
        design,
        children: Array.from(fields?.children || []).filter((el2) => el2.matches("[data-bl-forms-field]") && !NESTED_BLOCKED.includes(el2.dataset.fieldType)).map((child) => serializeRow(child))
      };
    }
    return null;
  }

  // themes/baselayer/packages/baselayer-forms/src/js/admin/conditional-logic.js
  var LOGIC_SOURCE_EXCLUDE = [
    "column",
    "section",
    "divider",
    "spacer",
    "heading",
    "text_block",
    "html",
    "captcha",
    "honeypot"
  ];
  var OPS_TOGGLE = ["checked", "not_checked"];
  var OPS_CHOICE = ["==", "!=", "==empty", "!=empty"];
  var OPS_MULTI = ["contains", "not_contains", "==empty", "!=empty"];
  var OPS_TEXT = ["==", "!=", "contains", "not_contains", "==empty", "!=empty"];
  var OPS_NUMBER = ["==", "!=", ">", "<", ">=", "<=", "==empty", "!=empty"];
  var OPS_TEMPORAL = ["==", "!=", ">", "<", "==empty", "!=empty"];
  var OPS_FILE = ["==empty", "!=empty"];
  var ALL_OPERATORS = [
    ...OPS_TOGGLE,
    ...OPS_CHOICE,
    ...OPS_MULTI,
    ...OPS_TEXT,
    ...OPS_NUMBER,
    ...OPS_TEMPORAL
  ];
  function operatorsForType(type) {
    switch (type) {
      case "toggle":
      case "terms":
        return [...OPS_TOGGLE];
      case "radio":
      case "select":
      case "button_group":
        return [...OPS_CHOICE];
      case "checkboxes":
        return [...OPS_MULTI];
      case "number":
        return [...OPS_NUMBER];
      case "date":
      case "time":
      case "datetime":
        return [...OPS_TEMPORAL];
      case "file":
      case "image":
        return [...OPS_FILE];
      case "text":
      case "textarea":
      case "email":
      case "url":
      case "phone":
      case "hidden":
        return [...OPS_TEXT];
      default:
        return [...OPS_TEXT];
    }
  }
  function operatorNeedsValue(operator) {
    return !["checked", "not_checked", "==empty", "!=empty"].includes(operator);
  }
  function operatorLabel(operator) {
    const map = {
      checked: t("logicOpChecked", "Checked"),
      not_checked: t("logicOpNotChecked", "Not checked"),
      "==": t("logicOpEquals", "Is equal to"),
      "!=": t("logicOpNotEquals", "Is not equal to"),
      contains: t("logicOpContains", "Contains"),
      not_contains: t("logicOpNotContains", "Does not contain"),
      "==empty": t("logicOpEmpty", "Has no value"),
      "!=empty": t("logicOpNotEmpty", "Has any value"),
      ">": t("logicOpGreater", "Greater than"),
      "<": t("logicOpLess", "Less than"),
      ">=": t("logicOpGreaterOrEqual", "Greater than or equal to"),
      "<=": t("logicOpLessOrEqual", "Less than or equal to")
    };
    return map[operator] || operator;
  }
  function normalizeConditionalLogic(raw) {
    const empty = { enabled: false, groups: [] };
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
      return empty;
    }
    const groupsIn = Array.isArray(raw.groups) ? raw.groups : [];
    const groups = [];
    groupsIn.forEach((group) => {
      if (!Array.isArray(group)) {
        return;
      }
      const rules = [];
      group.forEach((rule) => {
        if (!rule || typeof rule !== "object") {
          return;
        }
        const fieldId = String(rule.field || "").trim();
        const operator = String(rule.operator || "").trim();
        if (!fieldId || !ALL_OPERATORS.includes(operator)) {
          return;
        }
        rules.push({
          field: fieldId,
          operator,
          value: operatorNeedsValue(operator) ? String(rule.value ?? "") : ""
        });
      });
      if (rules.length) {
        groups.push(rules);
      }
    });
    return {
      enabled: !!raw.enabled && groups.length > 0,
      groups
    };
  }
  function readConditionalLogicFromDom(body) {
    if (!body) {
      return null;
    }
    const input = body.querySelector("[data-bl-conditional-logic]");
    if (!input) {
      return null;
    }
    try {
      const parsed = JSON.parse(input.value || "{}");
      const logic = normalizeConditionalLogic(parsed);
      return logic.enabled || logic.groups.length ? logic : { enabled: false, groups: [] };
    } catch (e) {
      return { enabled: false, groups: [] };
    }
  }
  function collectLogicSourceFields(exceptId = "", options = {}) {
    const includeSelf = !!options.includeSelf;
    const out = [];
    const seen = /* @__PURE__ */ new Set();
    const push = (entry) => {
      if (!entry?.id || seen.has(entry.id)) {
        return;
      }
      const isSelf = !!entry.isSelf;
      if (isSelf && !includeSelf) {
        return;
      }
      if (!isSelf && LOGIC_SOURCE_EXCLUDE.includes(entry.type)) {
        return;
      }
      seen.add(entry.id);
      out.push(entry);
    };
    document.querySelectorAll(".bl-forms-builder__field[data-bl-forms-field]").forEach((row) => {
      const id = row.dataset.fieldId || "";
      const type = row.dataset.fieldType || "";
      if (!id) {
        return;
      }
      const labelInput = row.querySelector("[data-bl-label]");
      const sectionLabel = row.querySelector(".bl-forms-builder__section-label-input");
      const preview = row.querySelector(":scope > .bl-forms-builder__field-header .bl-forms-builder__preview");
      const label = (labelInput?.value || "").trim() || (sectionLabel?.value || "").trim() || (preview?.textContent || "").trim() || typeLabel(type);
      const fieldOptions = Array.from(row.querySelectorAll("[data-bl-option]")).map((opt) => ({
        label: opt.querySelector("[data-bl-opt-label]")?.value || "",
        value: opt.querySelector("[data-bl-opt-value]")?.value || ""
      }));
      push({ id, type, label, options: fieldOptions, isSelf: id === exceptId });
    });
    flattenFields(readConfig().fields || []).forEach((field) => {
      if (!field?.id || seen.has(field.id)) {
        return;
      }
      const type = field.type || "text";
      push({
        id: field.id,
        type,
        label: (field.label || "").trim() || typeLabel(type),
        options: Array.isArray(field.options) ? field.options : [],
        isSelf: field.id === exceptId
      });
    });
    return out;
  }
  function selectableSources(sources) {
    return (sources || []).filter((s) => !s.isSelf);
  }
  function emptyRule(sources) {
    const first = selectableSources(sources)[0];
    const ops = first ? operatorsForType(first.type) : ["=="];
    return {
      field: first?.id || "",
      operator: ops[0] || "==",
      value: ""
    };
  }
  function createConditionalLogicEditor(field, getSources = () => collectLogicSourceFields(field.id, { includeSelf: true }), onChange = null) {
    if (!field.conditional_logic || typeof field.conditional_logic !== "object") {
      field.conditional_logic = { enabled: false, groups: [] };
    } else {
      field.conditional_logic = normalizeConditionalLogic(field.conditional_logic);
    }
    const wrap = el("div", { className: "bl-forms-builder__logic" });
    const hidden = el("input", {
      type: "hidden",
      dataset: { blConditionalLogic: "1" }
    });
    const syncHidden = (notify = true) => {
      hidden.value = JSON.stringify(normalizeConditionalLogic(field.conditional_logic));
      if (typeof onChange === "function") {
        onChange();
      }
      if (notify) {
        document.dispatchEvent(new CustomEvent("bl-forms-builder-changed"));
      }
    };
    const getGroup = (groupIndex) => field.conditional_logic.groups[groupIndex];
    const getRule = (groupIndex, ruleIndex) => getGroup(groupIndex)?.[ruleIndex];
    const groupsMount = el("div", { className: "bl-forms-builder__logic-groups" });
    const renderValueControl = (groupIndex, ruleIndex, source) => {
      const rule = getRule(groupIndex, ruleIndex);
      if (!rule) {
        return el("span", { className: "bl-forms-builder__logic-value-empty", "aria-hidden": "true" });
      }
      if (!operatorNeedsValue(rule.operator)) {
        return el("span", { className: "bl-forms-builder__logic-value-empty", "aria-hidden": "true" });
      }
      const options = Array.isArray(source?.options) ? source.options.filter((o) => (o.value || "").trim() !== "") : [];
      if (options.length && ["radio", "select", "button_group", "checkboxes"].includes(source?.type)) {
        const select = el("select", {
          className: "bl-forms-builder__logic-value",
          "aria-label": t("logicValue", "Value")
        });
        select.appendChild(el("option", { value: "", text: t("logicSelectValue", "\u2014 Select \u2014") }));
        options.forEach((opt) => {
          select.appendChild(
            el("option", {
              value: opt.value,
              text: opt.label || opt.value
            })
          );
        });
        select.value = rule.value || "";
        if (rule.value && select.value !== rule.value) {
          select.appendChild(el("option", { value: rule.value, text: rule.value }));
          select.value = rule.value;
        }
        select.addEventListener("change", () => {
          const live = getRule(groupIndex, ruleIndex);
          if (!live) {
            return;
          }
          live.value = select.value;
          syncHidden();
        });
        return select;
      }
      const input = el("input", {
        type: source?.type === "number" ? "number" : "text",
        className: "widefat bl-forms-builder__logic-value",
        value: rule.value || "",
        "aria-label": t("logicValue", "Value")
      });
      input.addEventListener("input", () => {
        const live = getRule(groupIndex, ruleIndex);
        if (!live) {
          return;
        }
        live.value = input.value;
        syncHidden();
      });
      return input;
    };
    const renderRuleRow = (groupIndex, ruleIndex, sources) => {
      const rule = getRule(groupIndex, ruleIndex);
      if (!rule) {
        return el("div", { className: "bl-forms-builder__logic-rule" });
      }
      const selectable = selectableSources(sources);
      let source = selectable.find((s) => s.id === rule.field) || null;
      if (!rule.field && selectable[0]) {
        rule.field = selectable[0].id;
        source = selectable[0];
      }
      const ops = source ? operatorsForType(source.type) : ["==", "!=", "==empty", "!=empty"];
      if (source && !ops.includes(rule.operator)) {
        rule.operator = ops[0];
        if (!operatorNeedsValue(rule.operator)) {
          rule.value = "";
        }
      } else if (!ops.includes(rule.operator) && rule.operator) {
        ops.unshift(rule.operator);
      }
      const fieldSelect = el("select", {
        className: "bl-forms-builder__logic-field",
        "aria-label": t("logicField", "Field")
      });
      if (!selectable.length && !rule.field) {
        fieldSelect.appendChild(
          el("option", { value: "", text: t("logicNoFields", "No fields available") })
        );
        fieldSelect.disabled = true;
      } else {
        sources.forEach((s) => {
          const opt = el("option", {
            value: s.id,
            text: s.isSelf ? `${s.label} (${typeLabel(s.type)}) \u2014 ${t("logicThisField", "This field")}` : `${s.label} (${typeLabel(s.type)})`
          });
          if (s.isSelf) {
            opt.disabled = true;
          }
          fieldSelect.appendChild(opt);
        });
        if (rule.field && !sources.some((s) => s.id === rule.field)) {
          fieldSelect.appendChild(
            el("option", {
              value: rule.field,
              text: t("logicMissingField", "Missing field")
            })
          );
        }
        fieldSelect.value = rule.field || selectable[0]?.id || "";
      }
      const opSelect = el("select", {
        className: "bl-forms-builder__logic-operator",
        "aria-label": t("logicOperator", "Operator")
      });
      ops.forEach((op) => {
        opSelect.appendChild(el("option", { value: op, text: operatorLabel(op) }));
      });
      opSelect.value = rule.operator;
      const valueSlot = el("div", { className: "bl-forms-builder__logic-value-slot" });
      const refreshValue = () => {
        const live = getRule(groupIndex, ruleIndex);
        const liveSource = selectable.find((s) => s.id === live?.field) || null;
        valueSlot.replaceChildren(renderValueControl(groupIndex, ruleIndex, liveSource));
      };
      refreshValue();
      fieldSelect.addEventListener("change", () => {
        const live = getRule(groupIndex, ruleIndex);
        if (!live) {
          return;
        }
        live.field = fieldSelect.value;
        source = selectable.find((s) => s.id === live.field) || null;
        const nextOps = source ? operatorsForType(source.type) : ["=="];
        live.operator = nextOps.includes(live.operator) ? live.operator : nextOps[0];
        if (!operatorNeedsValue(live.operator)) {
          live.value = "";
        }
        renderGroups();
        syncHidden();
      });
      opSelect.addEventListener("change", () => {
        const live = getRule(groupIndex, ruleIndex);
        if (!live) {
          return;
        }
        live.operator = opSelect.value;
        if (!operatorNeedsValue(live.operator)) {
          live.value = "";
        }
        refreshValue();
        syncHidden();
      });
      const deleteBtn = el("button", {
        type: "button",
        className: "bl-forms-builder__icon-btn bl-forms-builder__icon-btn--danger",
        title: t("delete", "Delete"),
        "aria-label": t("delete", "Delete"),
        onClick: () => {
          const group = getGroup(groupIndex);
          if (!group) {
            return;
          }
          group.splice(ruleIndex, 1);
          if (!group.length) {
            field.conditional_logic.groups.splice(groupIndex, 1);
          }
          renderGroups();
          syncHidden();
        }
      });
      deleteBtn.textContent = "\xD7";
      return el("div", { className: "bl-forms-builder__logic-rule" }, [
        fieldSelect,
        opSelect,
        valueSlot,
        deleteBtn
      ]);
    };
    const renderGroup = (groupIndex, sources) => {
      const group = getGroup(groupIndex);
      if (!group) {
        return el("div", { className: "bl-forms-builder__logic-group" });
      }
      const box = el("div", { className: "bl-forms-builder__logic-group" });
      const label = groupIndex === 0 ? t("logicShowIf", "Show this field if") : t("logicOrIf", "or if");
      box.appendChild(el("p", { className: "bl-forms-builder__logic-group-label", text: label }));
      const rulesWrap = el("div", { className: "bl-forms-builder__logic-rules" });
      group.forEach((_, ruleIndex) => {
        if (ruleIndex > 0) {
          rulesWrap.appendChild(
            el("p", { className: "bl-forms-builder__logic-and", text: t("logicAnd", "and") })
          );
        }
        rulesWrap.appendChild(renderRuleRow(groupIndex, ruleIndex, sources));
      });
      box.appendChild(rulesWrap);
      box.appendChild(
        el("button", {
          type: "button",
          className: "button bl-button-small",
          text: t("logicAddRule", "Add rule"),
          onClick: () => {
            const liveGroup = getGroup(groupIndex);
            if (!liveGroup) {
              return;
            }
            liveGroup.push(emptyRule(getSources()));
            renderGroups();
            syncHidden();
          }
        })
      );
      return box;
    };
    const renderGroups = () => {
      const sources = getSources();
      groupsMount.replaceChildren();
      if (!field.conditional_logic.enabled) {
        return;
      }
      if (!field.conditional_logic.groups.length) {
        field.conditional_logic.groups.push([emptyRule(sources)]);
      }
      field.conditional_logic.groups.forEach((_, index) => {
        if (index > 0) {
          groupsMount.appendChild(
            el("p", { className: "bl-forms-builder__logic-or", text: t("logicOr", "or") })
          );
        }
        groupsMount.appendChild(renderGroup(index, sources));
      });
      groupsMount.appendChild(
        el("button", {
          type: "button",
          className: "button bl-button-small bl-forms-builder__logic-add-group",
          text: t("logicAddGroup", "Add rule group"),
          onClick: () => {
            field.conditional_logic.groups.push([emptyRule(getSources())]);
            renderGroups();
            syncHidden();
          }
        })
      );
    };
    const enableSwitch = (() => {
      const input = el("input", {
        type: "checkbox",
        checked: !!field.conditional_logic.enabled
      });
      input.addEventListener("change", () => {
        field.conditional_logic.enabled = input.checked;
        if (input.checked && !field.conditional_logic.groups.length) {
          field.conditional_logic.groups = [[emptyRule(getSources())]];
        }
        renderGroups();
        syncHidden();
      });
      return el("div", { className: "bl-forms-builder__switch-setting" }, [
        el("label", { className: "bl-forms-builder__switch" }, [
          input,
          el("span", { className: "bl-forms-builder__switch-ui", "aria-hidden": "true" }),
          el("span", {
            className: "bl-forms-builder__switch-label",
            text: t("logicEnable", "Conditional logic")
          })
        ])
      ]);
    })();
    wrap.append(
      enableSwitch,
      el("p", {
        className: "description bl-forms-builder__logic-help",
        text: t(
          "logicHelp",
          "Show this field only when the conditions below are met."
        )
      }),
      groupsMount,
      hidden
    );
    renderGroups();
    syncHidden(false);
    wrap.refreshLogicSources = () => {
      if (!wrap.isConnected) {
        return;
      }
      renderGroups();
      syncHidden(false);
    };
    return wrap;
  }

  // themes/baselayer/packages/baselayer-forms/src/js/admin/field-card.js
  var WIDTH_PRESETS = [
    { value: "100", label: "100%" },
    { value: "75", label: "75%" },
    { value: "66", label: "66%" },
    { value: "50", label: "50%" },
    { value: "33", label: "33%" },
    { value: "25", label: "25%" },
    { value: "auto", labelKey: "widthAuto" },
    { value: "custom", labelKey: "widthCustom", icon: "edit" }
  ];
  var SPACER_HEIGHT_PRESETS = [
    { value: "xs", label: "XS" },
    { value: "s", label: "S" },
    { value: "m", label: "M" },
    { value: "l", label: "L" },
    { value: "xl", label: "XL" },
    { value: "custom", labelKey: "widthCustom", icon: "edit" }
  ];
  var SPACER_HEIGHT_VALUES = SPACER_HEIGHT_PRESETS.map((preset) => preset.value);
  var DIVIDER_MARGIN_PRESETS = [
    { value: "xs", label: "XS" },
    { value: "s", label: "S" },
    { value: "m", label: "M" },
    { value: "l", label: "L" },
    { value: "xl", label: "XL" },
    { value: "custom", labelKey: "widthCustom", icon: "edit" }
  ];
  var DIVIDER_MARGIN_VALUES = DIVIDER_MARGIN_PRESETS.map((preset) => preset.value);
  var CSS_LENGTH_RE = /^(-?\d+(?:\.\d+)?)(px|rem|em|%|vh|vw|vmin|vmax|ch|ex)$/i;
  function normalizeSpacerHeight(field) {
    const raw = String(field.height ?? "m").trim();
    const key = raw.toLowerCase();
    if (SPACER_HEIGHT_VALUES.includes(key)) {
      field.height = key;
      if (key !== "custom") {
        field.height_custom = "";
      } else if (field.height_custom == null) {
        field.height_custom = "";
      }
      return;
    }
    if (CSS_LENGTH_RE.test(raw)) {
      field.height_custom = raw;
      field.height = "custom";
      return;
    }
    field.height = "m";
    field.height_custom = "";
  }
  function normalizeDividerMargin(field) {
    const raw = String(field.margin ?? "m").trim();
    const key = raw.toLowerCase();
    if (DIVIDER_MARGIN_VALUES.includes(key)) {
      field.margin = key;
      if (key !== "custom") {
        field.margin_custom = "";
      } else if (field.margin_custom == null) {
        field.margin_custom = "";
      }
      return;
    }
    if (CSS_LENGTH_RE.test(raw)) {
      field.margin_custom = raw;
      field.margin = "custom";
      return;
    }
    field.margin = "m";
    field.margin_custom = "";
  }
  var OPTION_TYPES = ["radio", "checkboxes", "select", "button_group"];
  var MULTIPLE_TYPES = ["select", "button_group", "file", "image"];
  function createCaptchaSettings(field, onChange) {
    unsetCaptchaFieldKeys(field);
    const configured = !!(window.blFormsAdmin && window.blFormsAdmin.captchaConfigured);
    const settingsUrl = window.blFormsAdmin && window.blFormsAdmin.captchaSettingsUrl || window.blFormsAdmin && window.blFormsAdmin.settingsUrl || "";
    const root = el("div", { className: "bl-forms-builder__captcha" });
    const settingsLink = settingsUrl ? el("a", {
      href: settingsUrl,
      className: "bl-forms-builder__notice-link",
      text: t("captchaOpenSettings", "Open settings")
    }) : null;
    root.append(
      el("p", {
        className: "description",
        text: t("captchaHelp", "Uses the CAPTCHA keys from Forms \u2192 Settings.")
      })
    );
    if (!configured) {
      root.append(
        el(
          "div",
          {
            className: "bl-forms-builder__notice bl-forms-builder__notice--warning",
            role: "status"
          },
          [
            el("span", {
              text: t(
                "captchaNotConfigured",
                "CAPTCHA keys are not configured yet. Add them under Forms \u2192 Settings."
              )
            }),
            settingsLink
          ]
        )
      );
    } else if (settingsLink) {
      root.append(settingsLink);
    }
    void onChange;
    return root;
  }
  function unsetCaptchaFieldKeys(field) {
    delete field.captcha_provider;
    delete field.captcha_site_key;
    delete field.captcha_secret_key;
  }
  var TYPE_CONVERT_GROUPS = [
    ["text", "textarea", "email", "phone", "url", "number"],
    ["date", "time", "datetime"],
    ["radio", "checkboxes", "select", "button_group"],
    ["toggle", "terms"],
    ["file", "image"],
    ["heading", "text_block", "html"]
  ];
  function convertibleTypes(type) {
    const group = TYPE_CONVERT_GROUPS.find((list) => list.includes(type));
    return group ? [...group] : [];
  }
  function canConvertType(from, to) {
    if (!from || !to || from === to) {
      return from === to;
    }
    const group = TYPE_CONVERT_GROUPS.find((list) => list.includes(from));
    return Boolean(group && group.includes(to));
  }
  function hydrateFieldFromCard(row, field) {
    const data = serializeRow(row);
    if (!data || data.type === "column" || data.type === "section") {
      return;
    }
    const keepId = field.id;
    const keepType = field.type;
    Object.keys(field).forEach((key) => {
      if (key === "id" || key === "type") {
        return;
      }
      if (!(key in data)) {
        delete field[key];
      }
    });
    Object.assign(field, data, { id: keepId, type: keepType });
  }
  function convertFieldType(field, nextType) {
    if (!canConvertType(field.type, nextType) || field.type === nextType) {
      return;
    }
    field.type = nextType;
    if (OPTION_TYPES.includes(nextType)) {
      if (!Array.isArray(field.options) || field.options.length === 0) {
        field.options = [
          { label: t("optionOne", "Option 1"), value: "option-1" },
          { label: t("optionTwo", "Option 2"), value: "option-2" }
        ];
      }
    } else {
      delete field.options;
    }
    if (nextType === "radio" || nextType === "checkboxes") {
      if (field.layout !== "horizontal") {
        field.layout = "vertical";
      }
    } else {
      delete field.layout;
    }
    if (nextType === "checkboxes") {
      if (field.min_selections != null && field.min_selections !== "") {
        const min = parseInt(field.min_selections, 10);
        field.min_selections = Number.isFinite(min) && min >= 1 ? Math.min(50, min) : "";
      }
      if (field.max_selections != null && field.max_selections !== "") {
        const max = parseInt(field.max_selections, 10);
        field.max_selections = Number.isFinite(max) && max >= 1 ? Math.min(50, max) : "";
      }
    } else {
      delete field.min_selections;
      delete field.max_selections;
    }
    if (MULTIPLE_TYPES.includes(nextType)) {
      field.multiple = Boolean(field.multiple);
    } else {
      delete field.multiple;
    }
    if (nextType === "file" || nextType === "image") {
      if (field.preview === void 0) {
        field.preview = true;
      }
      if (field.upload_style === void 0) {
        field.upload_style = "modern";
      }
      if (nextType === "image" && !String(field.extensions || "").trim()) {
        field.extensions = "jpg, jpeg, png, webp, gif, heic, avif";
      }
      if (field.extensions === void 0) {
        field.extensions = "";
      }
    } else {
      delete field.extensions;
      delete field.preview;
      delete field.max_files;
      delete field.max_size_mb;
      delete field.upload_style;
      delete field.button_text;
    }
    if (nextType === "terms") {
      if (field.content == null || String(field.content).trim() === "") {
        field.content = t("termsDefaultLabel", "I agree to the [Privacy Policy](page:privacy).");
      }
      if (!String(field.label || "").trim()) {
        field.label = t("termsDefaultFieldLabel", "Privacy Policy");
      }
      field.hide_label = true;
      field.required = true;
    }
    if (["heading", "text_block", "html"].includes(nextType) && field.content == null) {
      field.content = "";
    }
    if (nextType === "heading") {
      const level = String(field.level || "h2").toLowerCase();
      field.level = ["h1", "h2", "h3", "h4", "h5", "h6"].includes(level) ? level : "h2";
    } else {
      delete field.level;
    }
    if (NO_DEFAULT.includes(nextType)) {
      delete field.default_value;
    }
    if (NO_PLACEHOLDER.includes(nextType)) {
      field.placeholder = "";
    }
    if (!AUTOCOMPLETE_TYPES.includes(nextType)) {
      delete field.autocomplete;
    }
    if (!AFFIX_TYPES.includes(nextType)) {
      delete field.prefix;
      delete field.suffix;
    }
    if (!["text", "textarea"].includes(nextType)) {
      delete field.min_length;
      delete field.max_length;
      delete field.show_char_count;
      delete field.char_count_text;
    }
    if (!["text", "email", "phone"].includes(nextType)) {
      delete field.show_in_list;
    } else if ((nextType === "text" || nextType === "email") && field.show_in_list === void 0) {
      field.show_in_list = defaultShowInListForNewField(nextType, field.id);
    }
    if (nextType === "textarea") {
      const rows = parseInt(field.rows, 10);
      field.rows = Number.isFinite(rows) && rows >= 2 ? Math.min(50, rows) : 5;
    } else {
      delete field.rows;
    }
    if (nextType === "number") {
      delete field.min_mode;
      delete field.max_mode;
      delete field.min_offset;
      delete field.max_offset;
      delete field.default_mode;
      delete field.default_offset;
    } else if (!["date", "time", "datetime"].includes(nextType)) {
      delete field.min;
      delete field.max;
      delete field.min_mode;
      delete field.max_mode;
      delete field.min_offset;
      delete field.max_offset;
      delete field.default_mode;
      delete field.default_offset;
      delete field.relation;
      delete field.relation_field;
    } else {
      if (!field.default_mode && field.default_value != null && String(field.default_value).trim() !== "") {
        field.default_mode = "fixed";
      }
      delete field.relation;
      delete field.relation_field;
    }
  }
  function createTypeSelect(field, row, onConvert) {
    const types = convertibleTypes(field.type);
    if (types.length < 2) {
      return null;
    }
    const select = el("select", {
      className: "widefat",
      dataset: { blType: "1" }
    });
    types.forEach((type) => {
      const opt = el("option", {
        value: type,
        text: typeLabel(type)
      });
      if (type === field.type) {
        opt.selected = true;
      }
      select.appendChild(opt);
    });
    select.addEventListener("change", () => {
      const next = select.value;
      if (!canConvertType(field.type, next)) {
        select.value = field.type;
        return;
      }
      hydrateFieldFromCard(row, field);
      convertFieldType(field, next);
      onConvert(next);
    });
    return el("p", { className: "bl-forms-builder__type-select" }, [
      el("label", { text: t("type", "Type") }),
      select
    ]);
  }
  var DESCRIPTION_TYPES = [
    "text",
    "email",
    "url",
    "number",
    "phone",
    "textarea",
    "date",
    "time",
    "datetime",
    "file",
    "image",
    "toggle"
  ];
  var NO_PLACEHOLDER = [
    "terms",
    "radio",
    "checkboxes",
    "button_group",
    "toggle",
    "file",
    "image",
    "hidden",
    "honeypot",
    "captcha",
    "divider",
    "spacer",
    "heading",
    "text_block",
    "html",
    "column",
    "section",
    "date",
    "time",
    "datetime"
  ];
  var NO_REQUIRED = [
    "hidden",
    "honeypot",
    "captcha",
    "divider",
    "spacer",
    "heading",
    "text_block",
    "html",
    "column",
    "section"
  ];
  var NO_READONLY = [
    ...NO_REQUIRED,
    "radio",
    "checkboxes",
    "button_group",
    "toggle",
    "terms",
    "file",
    "image"
  ];
  var NO_DISABLED = [...NO_REQUIRED];
  var AUTOCOMPLETE_TYPES = [
    "text",
    "email",
    "url",
    "number",
    "phone",
    "textarea",
    "select"
  ];
  var AFFIX_TYPES = [
    "text",
    "email",
    "phone",
    "url",
    "number",
    "date",
    "time",
    "datetime"
  ];
  var NO_DEFAULT = [
    "file",
    "image",
    "honeypot",
    "captcha",
    "divider",
    "spacer",
    "heading",
    "text_block",
    "html"
  ];
  var CHECKED_DEFAULT_TYPES = ["terms", "toggle"];
  var NAMED_TYPES = [
    "text",
    "textarea",
    "email",
    "phone",
    "url",
    "number",
    "checkboxes",
    "radio",
    "select",
    "toggle",
    "button_group",
    "date",
    "time",
    "datetime",
    "file",
    "image",
    "terms",
    "hidden",
    "honeypot"
  ];
  var HIDE_LABEL_TYPES = NAMED_TYPES.filter((type) => type !== "hidden" && type !== "honeypot");
  function createOptionsEditor(options) {
    const wrap = el("div", { className: "bl-forms-builder__options" });
    const list = el("div", { className: "bl-forms-builder__options-list" });
    list.appendChild(
      el("div", { className: "bl-forms-builder__option bl-forms-builder__option--head" }, [
        el("span", {
          className: "bl-forms-builder__option-heading",
          text: t("optionLabel", "Label")
        }),
        el("span", {
          className: "bl-forms-builder__option-heading",
          text: t("optionSlug", "Slug")
        }),
        el("span", {
          className: "bl-forms-builder__option-heading-spacer",
          "aria-hidden": "true"
        })
      ])
    );
    const addOption = (opt = { label: "", value: "" }) => {
      const labelText = opt.label || "";
      const valueText = opt.value || "";
      const autoSlug = labelText ? slugifyOption(labelText) : "";
      let slugManual = valueText !== "" && valueText !== autoSlug;
      const labelInput = el("input", {
        type: "text",
        className: "widefat",
        dataset: { blOptLabel: "1" },
        value: labelText,
        placeholder: t("optionLabel", "Label"),
        "aria-label": t("optionLabel", "Label")
      });
      const slugInput = el("input", {
        type: "text",
        className: "widefat",
        dataset: { blOptValue: "1" },
        value: valueText || autoSlug,
        placeholder: t("optionSlug", "Slug"),
        "aria-label": t("optionSlug", "Slug")
      });
      const syncSlugFromLabel = () => {
        if (slugManual) {
          return;
        }
        slugInput.value = slugifyOption(labelInput.value);
      };
      labelInput.addEventListener("input", () => {
        syncSlugFromLabel();
        document.dispatchEvent(new CustomEvent("bl-forms-builder-changed"));
      });
      slugInput.addEventListener("input", () => {
        slugManual = true;
        document.dispatchEvent(new CustomEvent("bl-forms-builder-changed"));
      });
      slugInput.addEventListener("blur", () => {
        const next = slugifyOption(slugInput.value || labelInput.value);
        slugInput.value = next;
        document.dispatchEvent(new CustomEvent("bl-forms-builder-changed"));
      });
      const deleteBtn = el("button", {
        type: "button",
        className: "bl-forms-builder__icon-btn bl-forms-builder__icon-btn--danger",
        title: t("delete", "Delete"),
        "aria-label": t("delete", "Delete"),
        onClick: () => {
          row.remove();
          document.dispatchEvent(new CustomEvent("bl-forms-builder-changed"));
        }
      });
      const trashIcon = iconEl("trash");
      if (trashIcon.innerHTML) {
        deleteBtn.appendChild(trashIcon);
      } else {
        deleteBtn.textContent = "\xD7";
      }
      const row = el("div", { className: "bl-forms-builder__option", dataset: { blOption: "1" } }, [
        labelInput,
        slugInput,
        deleteBtn
      ]);
      list.appendChild(row);
    };
    (options || []).forEach((opt) => addOption(opt));
    wrap.appendChild(list);
    wrap.appendChild(
      el("button", {
        type: "button",
        className: "button bl-button-small",
        text: t("addOption", "Add option"),
        onClick: () => addOption()
      })
    );
    return wrap;
  }
  function createSegmentedControl(options, active, datasetKey, onSelect) {
    const group = el("div", {
      className: "bl-forms-builder__segmented",
      role: "group"
    });
    if (datasetKey) {
      group.dataset[datasetKey] = "1";
    }
    const sync = (value) => {
      group.querySelectorAll("button").forEach((btn) => {
        const on = btn.dataset.value === value;
        btn.classList.toggle("is-active", on);
        btn.setAttribute("aria-pressed", on ? "true" : "false");
      });
    };
    options.forEach((opt) => {
      const label = opt.label || "";
      const btn = el("button", {
        type: "button",
        className: "bl-forms-builder__segmented-btn" + (opt.icon ? " bl-forms-builder__segmented-btn--icon" : ""),
        dataset: { value: opt.value, ...opt.dataset || {} },
        title: opt.title || label,
        "aria-label": label,
        onClick: () => {
          sync(opt.value);
          onSelect(opt.value);
        }
      });
      if (opt.icon) {
        const icon = iconEl(opt.icon);
        if (icon.innerHTML) {
          btn.appendChild(icon);
        } else {
          btn.textContent = "\u270E";
        }
      } else {
        btn.textContent = label;
      }
      group.appendChild(btn);
    });
    sync(active);
    return group;
  }
  function createWidthControl(field, onChange = () => {
  }, { showLabel = true } = {}) {
    const wrap = el("div", { className: "bl-forms-builder__width" });
    const customInput = el("input", {
      type: "text",
      className: "widefat bl-forms-builder__width-custom",
      dataset: { blWidthCustom: "1" },
      placeholder: t("widthCustomPlaceholder", "e.g. 40% or 280px"),
      value: field.width_custom || ""
    });
    customInput.hidden = (field.width || "100") !== "custom";
    const group = createSegmentedControl(
      WIDTH_PRESETS.map((preset) => ({
        value: preset.value,
        label: preset.label || t(preset.labelKey, "Custom"),
        icon: preset.icon || "",
        dataset: { blWidth: preset.value }
      })),
      field.width || "100",
      "blWidthGroup",
      (value) => {
        field.width = value;
        customInput.hidden = value !== "custom";
        onChange();
        document.dispatchEvent(new CustomEvent("bl-forms-builder-changed"));
      }
    );
    group.querySelectorAll("button").forEach((btn) => {
      if (btn.dataset.value) {
        btn.dataset.blWidth = btn.dataset.value;
      }
    });
    customInput.addEventListener("input", () => {
      field.width_custom = customInput.value;
      field.width = "custom";
      group.querySelectorAll("button").forEach((btn) => {
        const on = btn.dataset.blWidth === "custom";
        btn.classList.toggle("is-active", on);
        btn.setAttribute("aria-pressed", on ? "true" : "false");
      });
      customInput.hidden = false;
      onChange();
    });
    if (showLabel) {
      wrap.appendChild(el("label", { text: t("width", "Width") }));
    }
    wrap.append(group, customInput);
    return wrap;
  }
  function createHeightControl(field, onChange = () => {
  }, { showLabel = true } = {}) {
    normalizeSpacerHeight(field);
    const wrap = el("div", { className: "bl-forms-builder__height" });
    const customInput = el("input", {
      type: "text",
      className: "widefat bl-forms-builder__height-custom",
      dataset: { blHeightCustom: "1" },
      placeholder: t("spacerHeightCustomPlaceholder", "e.g. 24px or 2rem"),
      value: field.height_custom || ""
    });
    customInput.hidden = (field.height || "m") !== "custom";
    const group = createSegmentedControl(
      SPACER_HEIGHT_PRESETS.map((preset) => ({
        value: preset.value,
        label: preset.label || t(preset.labelKey, "Custom"),
        icon: preset.icon || "",
        dataset: { blHeight: preset.value }
      })),
      field.height || "m",
      "blHeightGroup",
      (value) => {
        field.height = value;
        if (value !== "custom") {
          field.height_custom = "";
        }
        customInput.hidden = value !== "custom";
        onChange();
        document.dispatchEvent(new CustomEvent("bl-forms-builder-changed"));
      }
    );
    group.querySelectorAll("button").forEach((btn) => {
      if (btn.dataset.value) {
        btn.dataset.blHeight = btn.dataset.value;
      }
    });
    customInput.addEventListener("input", () => {
      field.height_custom = customInput.value;
      field.height = "custom";
      group.querySelectorAll("button").forEach((btn) => {
        const on = btn.dataset.blHeight === "custom";
        btn.classList.toggle("is-active", on);
        btn.setAttribute("aria-pressed", on ? "true" : "false");
      });
      customInput.hidden = false;
      onChange();
      document.dispatchEvent(new CustomEvent("bl-forms-builder-changed"));
    });
    if (showLabel) {
      wrap.appendChild(el("label", { text: t("spacerHeight", "Height") }));
    }
    wrap.append(group, customInput);
    return wrap;
  }
  function createMarginControl(field, onChange = () => {
  }, { showLabel = true } = {}) {
    normalizeDividerMargin(field);
    const wrap = el("div", { className: "bl-forms-builder__margin" });
    const customInput = el("input", {
      type: "text",
      className: "widefat bl-forms-builder__margin-custom",
      dataset: { blMarginCustom: "1" },
      placeholder: t("dividerMarginCustomPlaceholder", "e.g. 24px or 2rem"),
      value: field.margin_custom || ""
    });
    customInput.hidden = (field.margin || "m") !== "custom";
    const group = createSegmentedControl(
      DIVIDER_MARGIN_PRESETS.map((preset) => ({
        value: preset.value,
        label: preset.label || t(preset.labelKey, "Custom"),
        icon: preset.icon || "",
        dataset: { blMargin: preset.value }
      })),
      field.margin || "m",
      "blMarginGroup",
      (value) => {
        field.margin = value;
        if (value !== "custom") {
          field.margin_custom = "";
        }
        customInput.hidden = value !== "custom";
        onChange();
        document.dispatchEvent(new CustomEvent("bl-forms-builder-changed"));
      }
    );
    group.querySelectorAll("button").forEach((btn) => {
      if (btn.dataset.value) {
        btn.dataset.blMargin = btn.dataset.value;
      }
    });
    customInput.addEventListener("input", () => {
      field.margin_custom = customInput.value;
      field.margin = "custom";
      group.querySelectorAll("button").forEach((btn) => {
        const on = btn.dataset.blMargin === "custom";
        btn.classList.toggle("is-active", on);
        btn.setAttribute("aria-pressed", on ? "true" : "false");
      });
      customInput.hidden = false;
      onChange();
      document.dispatchEvent(new CustomEvent("bl-forms-builder-changed"));
    });
    if (showLabel) {
      wrap.appendChild(el("label", { text: t("dividerMargin", "Margin") }));
    }
    wrap.append(group, customInput);
    return wrap;
  }
  function openFieldWidthModal(field, onApply) {
    document.querySelectorAll(".bl-forms-builder__modal").forEach((node) => node.remove());
    const draft = {
      width: field.width || "100",
      width_custom: field.width_custom || ""
    };
    const title = field.type === "column" ? t("columnWidthTitle", "Column width") : field.type === "section" ? t("sectionWidthTitle", "Section width") : t("width", "Width");
    const backdrop = el("div", {
      className: "bl-forms-builder__modal",
      role: "dialog",
      "aria-modal": "true",
      "aria-label": title
    });
    const close = () => {
      document.removeEventListener("keydown", onKey);
      backdrop.remove();
    };
    const apply = () => {
      field.width = draft.width;
      field.width_custom = draft.width === "custom" ? draft.width_custom : "";
      onApply(field);
      close();
    };
    const onKey = (evt) => {
      if (evt.key === "Escape") {
        close();
      }
    };
    document.addEventListener("keydown", onKey);
    backdrop.addEventListener("click", (evt) => {
      if (evt.target === backdrop) {
        close();
      }
    });
    const dialog = el("div", { className: "bl-forms-builder__modal-dialog" });
    const header = el("div", { className: "bl-forms-builder__modal-header" }, [
      el("h2", {
        className: "bl-forms-builder__modal-title",
        text: title
      })
    ]);
    const body = el("div", { className: "bl-forms-builder__modal-body" });
    body.appendChild(createWidthControl(draft, () => {
    }, { showLabel: false }));
    const footer = el("div", { className: "bl-forms-builder__modal-footer" }, [
      el("button", {
        type: "button",
        className: "button",
        text: t("cancel", "Cancel"),
        onClick: close
      }),
      el("button", {
        type: "button",
        className: "button button-primary",
        text: t("apply", "Apply"),
        onClick: apply
      })
    ]);
    dialog.append(header, body, footer);
    backdrop.appendChild(dialog);
    document.body.appendChild(backdrop);
  }
  function openSectionDesignModal(field, onApply) {
    document.querySelectorAll(".bl-forms-builder__modal").forEach((node) => node.remove());
    const designs = [
      { value: "standard", label: t("sectionDesignStandard", "Standard") },
      { value: "outline", label: t("sectionDesignOutline", "Outline") },
      { value: "card", label: t("sectionDesignCard", "Card") }
    ];
    const allowed = designs.map((item) => item.value);
    let draft = allowed.includes(field.design) ? field.design : "standard";
    const title = t("sectionDesignTitle", "Section design");
    const backdrop = el("div", {
      className: "bl-forms-builder__modal",
      role: "dialog",
      "aria-modal": "true",
      "aria-label": title
    });
    const close = () => {
      document.removeEventListener("keydown", onKey);
      backdrop.remove();
    };
    const apply = () => {
      field.design = draft;
      onApply(field);
      close();
    };
    const onKey = (evt) => {
      if (evt.key === "Escape") {
        close();
      }
    };
    document.addEventListener("keydown", onKey);
    backdrop.addEventListener("click", (evt) => {
      if (evt.target === backdrop) {
        close();
      }
    });
    const dialog = el("div", { className: "bl-forms-builder__modal-dialog" });
    const header = el("div", { className: "bl-forms-builder__modal-header" }, [
      el("h2", {
        className: "bl-forms-builder__modal-title",
        text: title
      })
    ]);
    const body = el("div", { className: "bl-forms-builder__modal-body" });
    body.appendChild(
      createSegmentedControl(designs, draft, "blDesignGroup", (value) => {
        draft = value;
      })
    );
    const footer = el("div", { className: "bl-forms-builder__modal-footer" }, [
      el("button", {
        type: "button",
        className: "button",
        text: t("cancel", "Cancel"),
        onClick: close
      }),
      el("button", {
        type: "button",
        className: "button button-primary",
        text: t("apply", "Apply"),
        onClick: apply
      })
    ]);
    dialog.append(header, body, footer);
    backdrop.appendChild(dialog);
    document.body.appendChild(backdrop);
  }
  function syncWidthControlUi(scope, field) {
    const group = scope?.querySelector("[data-bl-width-group]");
    if (!group) {
      return;
    }
    const width = field.width || "100";
    group.querySelectorAll("[data-bl-width]").forEach((btn) => {
      const on = btn.dataset.blWidth === width;
      btn.classList.toggle("is-active", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    });
    const custom = scope.querySelector("[data-bl-width-custom]");
    if (custom) {
      custom.hidden = width !== "custom";
      if (width === "custom") {
        custom.value = field.width_custom || "";
      }
    }
  }
  function createLayoutControl(field) {
    const wrap = el("div", { className: "bl-forms-builder__layout" });
    const active = field.layout === "horizontal" ? "horizontal" : "vertical";
    const group = createSegmentedControl(
      [
        { value: "vertical", label: t("layoutVertical", "Vertical") },
        { value: "horizontal", label: t("layoutHorizontal", "Horizontal") }
      ],
      active,
      "blLayoutGroup",
      (value) => {
        field.layout = value;
        document.dispatchEvent(new CustomEvent("bl-forms-builder-changed"));
      }
    );
    group.querySelectorAll("button").forEach((btn) => {
      btn.dataset.blLayout = btn.dataset.value;
    });
    wrap.append(el("label", { text: t("layout", "Layout") }), group);
    return wrap;
  }
  var HEADING_LEVELS = ["h1", "h2", "h3", "h4", "h5", "h6"];
  function normalizeHeadingLevel(field) {
    const level = String(field.level || "h2").toLowerCase();
    field.level = HEADING_LEVELS.includes(level) ? level : "h2";
  }
  function createHeadingLevelControl(field, onChange = () => {
  }) {
    normalizeHeadingLevel(field);
    const wrap = el("div", { className: "bl-forms-builder__heading-level" });
    const group = createSegmentedControl(
      HEADING_LEVELS.map((level) => ({
        value: level,
        label: level.toUpperCase(),
        dataset: { blHeadingLevel: level }
      })),
      field.level || "h2",
      "blHeadingLevelGroup",
      (value) => {
        field.level = value;
        onChange();
        document.dispatchEvent(new CustomEvent("bl-forms-builder-changed"));
      }
    );
    group.querySelectorAll("button").forEach((btn) => {
      if (btn.dataset.value) {
        btn.dataset.blHeadingLevel = btn.dataset.value;
      }
    });
    wrap.append(el("label", { text: t("headingLevel", "Level") }), group);
    return wrap;
  }
  function createAutocompleteControl(field) {
    const select = el("select", {
      className: "widefat",
      dataset: { blAutocomplete: "1" }
    });
    const active = field.autocomplete === "off" ? "off" : "auto";
    [
      { value: "auto", label: t("autocompleteAutomatic", "Automatic") },
      { value: "off", label: t("autocompleteOff", "Off") }
    ].forEach((opt) => {
      const option = el("option", { value: opt.value, text: opt.label });
      if (opt.value === active) {
        option.selected = true;
      }
      select.appendChild(option);
    });
    select.addEventListener("change", () => {
      field.autocomplete = select.value === "off" ? "off" : "auto";
      document.dispatchEvent(new CustomEvent("bl-forms-builder-changed"));
    });
    return el("p", { className: "bl-forms-builder__autocomplete bl-forms-builder__type-select" }, [
      el("label", { text: t("autocomplete", "Autocomplete") }),
      select
    ]);
  }
  function createNumberBoundsControl(field) {
    const minInput = el("input", {
      type: "number",
      className: "widefat",
      dataset: { blMin: "1" },
      value: field.min != null && field.min !== "" ? String(field.min) : "",
      step: "any"
    });
    const maxInput = el("input", {
      type: "number",
      className: "widefat",
      dataset: { blMax: "1" },
      value: field.max != null && field.max !== "" ? String(field.max) : "",
      step: "any"
    });
    const sync = () => {
      field.min = minInput.value.trim();
      field.max = maxInput.value.trim();
      document.dispatchEvent(new CustomEvent("bl-forms-builder-changed"));
    };
    minInput.addEventListener("change", sync);
    maxInput.addEventListener("change", sync);
    minInput.addEventListener("blur", sync);
    maxInput.addEventListener("blur", sync);
    return el("div", { className: "bl-forms-builder__number-bounds" }, [
      el("p", {}, [el("label", { text: t("minValue", "Minimum") }), minInput]),
      el("p", {}, [el("label", { text: t("maxValue", "Maximum") }), maxInput])
    ]);
  }
  function createSelectionBoundsControl(field) {
    const parseLimit = (raw) => {
      const next = parseInt(raw, 10);
      return Number.isFinite(next) && next >= 1 ? Math.min(50, next) : "";
    };
    const minInput = el("input", {
      type: "number",
      className: "widefat",
      min: "1",
      max: "50",
      step: "1",
      dataset: { blMinSelections: "1" },
      value: field.min_selections != null && field.min_selections !== "" ? String(parseLimit(field.min_selections) || "") : ""
    });
    const maxInput = el("input", {
      type: "number",
      className: "widefat",
      min: "1",
      max: "50",
      step: "1",
      dataset: { blMaxSelections: "1" },
      value: field.max_selections != null && field.max_selections !== "" ? String(parseLimit(field.max_selections) || "") : ""
    });
    const sync = () => {
      let min = parseLimit(minInput.value);
      let max = parseLimit(maxInput.value);
      if (min !== "" && max !== "" && min > max) {
        [min, max] = [max, min];
      }
      field.min_selections = min === "" ? "" : min;
      field.max_selections = max === "" ? "" : max;
      minInput.value = min === "" ? "" : String(min);
      maxInput.value = max === "" ? "" : String(max);
      document.dispatchEvent(new CustomEvent("bl-forms-builder-changed"));
    };
    minInput.addEventListener("change", sync);
    maxInput.addEventListener("change", sync);
    minInput.addEventListener("blur", sync);
    maxInput.addEventListener("blur", sync);
    return el("div", { className: "bl-forms-builder__selection-bounds" }, [
      el("div", { className: "bl-forms-builder__number-bounds" }, [
        el("p", {}, [el("label", { text: t("minSelections", "Minimum selections") }), minInput]),
        el("p", {}, [el("label", { text: t("maxSelections", "Maximum selections") }), maxInput])
      ]),
      el("p", {
        className: "description",
        text: t(
          "selectionBoundsHelp",
          "Leave empty for no limit. When the maximum is reached, further options cannot be selected."
        )
      })
    ]);
  }
  function createPrefixSuffixControl(field) {
    const prefixInput = el("input", {
      type: "text",
      className: "widefat",
      dataset: { blPrefix: "1" },
      value: field.prefix != null ? String(field.prefix) : ""
    });
    const suffixInput = el("input", {
      type: "text",
      className: "widefat",
      dataset: { blSuffix: "1" },
      value: field.suffix != null ? String(field.suffix) : ""
    });
    const sync = () => {
      field.prefix = prefixInput.value;
      field.suffix = suffixInput.value;
      document.dispatchEvent(new CustomEvent("bl-forms-builder-changed"));
    };
    prefixInput.addEventListener("input", sync);
    suffixInput.addEventListener("input", sync);
    prefixInput.addEventListener("change", sync);
    suffixInput.addEventListener("change", sync);
    return el("div", { className: "bl-forms-builder__affix-bounds" }, [
      el("p", {}, [el("label", { text: t("prefix", "Prefix") }), prefixInput]),
      el("p", {}, [el("label", { text: t("suffix", "Suffix") }), suffixInput])
    ]);
  }
  function createLengthLimitsControl(field) {
    const minInput = el("input", {
      type: "number",
      className: "widefat",
      min: "1",
      step: "1",
      dataset: { blMinLength: "1" },
      value: field.min_length != null && field.min_length !== "" ? String(field.min_length) : ""
    });
    const maxInput = el("input", {
      type: "number",
      className: "widefat",
      min: "1",
      step: "1",
      dataset: { blMaxLength: "1" },
      value: field.max_length != null && field.max_length !== "" ? String(field.max_length) : ""
    });
    const syncShow = (checked) => {
      field.show_char_count = !!checked;
      document.dispatchEvent(new CustomEvent("bl-forms-builder-changed"));
    };
    const showSwitch = createSwitchSetting(
      "blShowCharCount",
      t("showCharCount", "Show character count"),
      !!field.show_char_count,
      syncShow
    );
    const showWrap = el("div", { className: "bl-forms-builder__char-count-toggle" }, [showSwitch]);
    const showInput = showSwitch.querySelector('input[type="checkbox"]');
    const syncVisibility = () => {
      const max = parseInt(maxInput.value, 10);
      const hasMax = Number.isFinite(max) && max > 0;
      showWrap.hidden = !hasMax;
      if (!hasMax) {
        field.show_char_count = false;
        if (showInput) {
          showInput.checked = false;
        }
      }
    };
    const syncMin = () => {
      field.min_length = minInput.value.trim();
      document.dispatchEvent(new CustomEvent("bl-forms-builder-changed"));
    };
    const syncMax = () => {
      field.max_length = maxInput.value.trim();
      syncVisibility();
      document.dispatchEvent(new CustomEvent("bl-forms-builder-changed"));
    };
    minInput.addEventListener("change", syncMin);
    minInput.addEventListener("blur", syncMin);
    minInput.addEventListener("input", syncMin);
    maxInput.addEventListener("change", syncMax);
    maxInput.addEventListener("blur", syncMax);
    maxInput.addEventListener("input", syncMax);
    syncVisibility();
    return el("div", { className: "bl-forms-builder__length-limits" }, [
      el("p", {}, [el("label", { text: t("minLength", "Minimum length") }), minInput]),
      el("div", { className: "bl-forms-builder__length-max" }, [
        el("p", {}, [el("label", { text: t("maxLength", "Maximum length") }), maxInput]),
        showWrap
      ])
    ]);
  }
  function countOtherListOverviewFields(exceptId) {
    let n = 0;
    document.querySelectorAll(".bl-forms-builder__field[data-bl-forms-field]").forEach((row) => {
      if (exceptId && row.dataset.fieldId === exceptId) {
        return;
      }
      const input = row.querySelector("[data-bl-show-in-list]");
      if (input && input.checked) {
        n += 1;
      }
    });
    return n;
  }
  function hasShowInListForType(type, exceptId = "") {
    let found = false;
    document.querySelectorAll(".bl-forms-builder__field[data-bl-forms-field]").forEach((row) => {
      if (found) {
        return;
      }
      if (exceptId && row.dataset.fieldId === exceptId) {
        return;
      }
      if ((row.dataset.fieldType || "") !== type) {
        return;
      }
      const input = row.querySelector("[data-bl-show-in-list]");
      if (input && input.checked) {
        found = true;
      }
    });
    return found;
  }
  function defaultShowInListForNewField(type, exceptId = "") {
    if (type !== "text" && type !== "email") {
      return false;
    }
    if (countOtherListOverviewFields(exceptId) >= 3) {
      return false;
    }
    return !hasShowInListForType(type, exceptId);
  }
  function createListOverviewControl(field) {
    const input = el("input", {
      type: "checkbox",
      dataset: { blShowInList: "1" },
      checked: !!field.show_in_list
    });
    input.addEventListener("change", () => {
      if (input.checked && countOtherListOverviewFields(field.id) >= 3) {
        input.checked = false;
        window.alert(
          t("showInListMax", "You can show at most 3 fields in the entries list.")
        );
        return;
      }
      field.show_in_list = !!input.checked;
      document.dispatchEvent(new CustomEvent("bl-forms-builder-changed"));
    });
    return el("div", { className: "bl-forms-builder__switch-setting" }, [
      el("label", { className: "bl-forms-builder__switch" }, [
        input,
        el("span", { className: "bl-forms-builder__switch-ui", "aria-hidden": "true" }),
        el("span", {
          className: "bl-forms-builder__switch-label",
          text: t("showInList", "Show in overview")
        })
      ])
    ]);
  }
  function createTextareaRowsControl(field) {
    const rows = parseInt(field.rows, 10);
    const value = Number.isFinite(rows) && rows >= 2 ? String(Math.min(50, rows)) : "5";
    const input = el("input", {
      type: "number",
      className: "widefat",
      min: "2",
      max: "50",
      step: "1",
      dataset: { blRows: "1" },
      value
    });
    const sync = () => {
      const next = parseInt(input.value, 10);
      field.rows = Number.isFinite(next) && next >= 2 ? Math.min(50, next) : 5;
      input.value = String(field.rows);
      document.dispatchEvent(new CustomEvent("bl-forms-builder-changed"));
    };
    input.addEventListener("change", sync);
    input.addEventListener("blur", sync);
    return el("p", {}, [el("label", { text: t("textareaRows", "Rows") }), input]);
  }
  function createExtensionsControl(field) {
    const placeholder = field.type === "image" ? "jpg, jpeg, png, webp, gif, heic, avif" : "pdf, docx, xlsx, zip";
    const input = el("input", {
      type: "text",
      className: "widefat",
      dataset: { blExtensions: "1" },
      value: field.extensions != null ? String(field.extensions) : field.type === "image" ? "jpg, jpeg, png, webp, gif, heic, avif" : "",
      placeholder
    });
    const sync = () => {
      field.extensions = input.value.trim();
      document.dispatchEvent(new CustomEvent("bl-forms-builder-changed"));
    };
    input.addEventListener("input", sync);
    input.addEventListener("change", sync);
    input.addEventListener("blur", sync);
    return el("div", { className: "bl-forms-builder__extensions" }, [
      el("p", {}, [el("label", { text: t("allowedExtensions", "Allowed extensions") }), input]),
      el("p", {
        className: "description",
        text: t(
          "allowedExtensionsHelp",
          "Comma-separated list without dots, e.g. pdf, docx, xlsx. Leave empty to allow all WordPress-permitted types."
        )
      })
    ]);
  }
  function createMaxFilesControl(field) {
    const raw = parseInt(field.max_files, 10);
    const value = Number.isFinite(raw) && raw >= 1 ? String(Math.min(50, raw)) : "10";
    const input = el("input", {
      type: "number",
      className: "widefat",
      min: "1",
      max: "50",
      step: "1",
      dataset: { blMaxFiles: "1" },
      value
    });
    const sync = () => {
      const next = parseInt(input.value, 10);
      field.max_files = Number.isFinite(next) && next >= 1 ? Math.min(50, next) : 10;
      input.value = String(field.max_files);
      document.dispatchEvent(new CustomEvent("bl-forms-builder-changed"));
    };
    input.addEventListener("change", sync);
    input.addEventListener("blur", sync);
    return el("div", { className: "bl-forms-builder__max-files" }, [
      el("p", {}, [el("label", { text: t("maxFiles", "Maximum files") }), input]),
      el("p", {
        className: "description",
        text: t("maxFilesHelp", "Maximum number of files visitors can upload.")
      })
    ]);
  }
  function createMaxSizeControl(field) {
    const globalMb = window.blFormsAdmin && window.blFormsAdmin.uploadMaxSizeMb || "";
    const wpMaxLabel = window.blFormsAdmin && window.blFormsAdmin.wpMaxUploadSize || "";
    const placeholder = globalMb !== "" ? String(globalMb) : "";
    const help = globalMb !== "" || wpMaxLabel !== "" ? t("fieldMaxSizeHelp", "Leave empty to use the global default (%s).").replace(
      "%s",
      globalMb !== "" ? `${globalMb} ${t("uploadMaxSizeUnit", "MB")}` : wpMaxLabel
    ) : t("fieldMaxSizeHelpEmpty", "Leave empty to use the global default.");
    const input = el("input", {
      type: "number",
      className: "small-text",
      min: "0.1",
      step: "0.1",
      dataset: { blMaxSizeMb: "1" },
      value: field.max_size_mb != null && field.max_size_mb !== "" ? String(field.max_size_mb) : "",
      placeholder
    });
    const sync = () => {
      field.max_size_mb = input.value.trim();
      document.dispatchEvent(new CustomEvent("bl-forms-builder-changed"));
    };
    input.addEventListener("input", sync);
    input.addEventListener("change", sync);
    return el("div", { className: "bl-forms-builder__max-size" }, [
      el("p", {}, [
        el("label", { text: t("fieldMaxSize", "Maximum file size") }),
        el("span", { className: "bl-forms-builder__security-inline" }, [
          input,
          el("span", { text: t("uploadMaxSizeUnit", "MB") })
        ])
      ]),
      el("p", { className: "description", text: help })
    ]);
  }
  function createUploadButtonControl(field) {
    const fallbacks = window.blFormsAdmin && window.blFormsAdmin.messageFallbacks || {};
    const placeholder = fallbacks.upload_button || t("uploadButtonDefault", "Choose file");
    const input = el("input", {
      type: "text",
      className: "widefat",
      value: field.button_text || "",
      placeholder,
      dataset: { blUploadButton: "1" }
    });
    input.addEventListener("input", () => {
      field.button_text = input.value;
      document.dispatchEvent(new CustomEvent("bl-forms-builder-changed"));
    });
    return el("p", {}, [
      el("label", { text: t("uploadButtonText", "Button label") }),
      input
    ]);
  }
  function createUploadAppearanceControls(field) {
    if (field.upload_style !== "classic" && field.upload_style !== "modern") {
      field.upload_style = "modern";
    }
    if (field.preview === void 0) {
      field.preview = true;
    }
    const styleSelect = el("select", {
      className: "widefat",
      dataset: { blUploadStyle: "1" },
      "aria-label": t("uploadStyle", "Style")
    });
    [
      { id: "modern", label: t("uploadStyleModern", "Modern") },
      { id: "classic", label: t("uploadStyleClassic", "Classic") }
    ].forEach((opt) => {
      const option = el("option", { value: opt.id, text: opt.label });
      if (field.upload_style === opt.id) {
        option.selected = true;
      }
      styleSelect.appendChild(option);
    });
    const previewWrap = el("div", { className: "bl-forms-builder__upload-preview-setting" });
    const syncPreviewVisibility = () => {
      previewWrap.hidden = field.upload_style !== "modern";
    };
    const previewSwitch = createSwitchSetting(
      "blPreview",
      t("showUploadPreview", "Show file preview"),
      field.preview !== false,
      (checked) => {
        field.preview = checked;
        document.dispatchEvent(new CustomEvent("bl-forms-builder-changed"));
      }
    );
    previewWrap.appendChild(previewSwitch);
    styleSelect.addEventListener("change", () => {
      field.upload_style = styleSelect.value === "classic" ? "classic" : "modern";
      if (field.upload_style === "modern" && field.preview === void 0) {
        field.preview = true;
      }
      syncPreviewVisibility();
      document.dispatchEvent(new CustomEvent("bl-forms-builder-changed"));
    });
    syncPreviewVisibility();
    return el("div", { className: "bl-forms-builder__upload-appearance" }, [
      el("p", { className: "bl-forms-builder__type-select" }, [
        el("label", { text: t("uploadStyle", "Style") }),
        styleSelect
      ]),
      previewWrap
    ]);
  }
  function temporalInputType(type) {
    if (type === "time") {
      return "time";
    }
    if (type === "datetime") {
      return "datetime-local";
    }
    return "date";
  }
  function temporalBoundModes(type, { emptyLabel } = {}) {
    const none = {
      id: "",
      label: emptyLabel || t("boundNone", "No limit")
    };
    if (type === "time") {
      return [
        none,
        { id: "fixed", label: t("boundFixedTime", "Fixed time") },
        { id: "today", label: t("boundNow", "Now") },
        { id: "hour", label: t("boundCurrentHour", "Current hour") },
        { id: "offset", label: t("boundNowOffset", "Minutes relative to now") }
      ];
    }
    if (type === "datetime") {
      return [
        none,
        { id: "fixed", label: t("boundFixedDatetime", "Fixed date & time") },
        { id: "today", label: t("boundNow", "Now") },
        { id: "offset", label: t("boundTodayOffset", "Days relative to today") }
      ];
    }
    return [
      none,
      { id: "fixed", label: t("boundFixedDate", "Fixed date") },
      { id: "today", label: t("boundToday", "Today") },
      { id: "offset", label: t("boundTodayOffset", "Days relative to today") }
    ];
  }
  function createTemporalModeControl(field, which, options = {}) {
    const type = field.type;
    const modeKey = `${which}_mode`;
    const offsetKey = `${which}_offset`;
    const valueKey = which === "default" ? "default_value" : which;
    const datasetMode = which === "min" ? "blMinMode" : which === "max" ? "blMaxMode" : "blDefaultMode";
    const datasetValue = which === "min" ? "blMin" : which === "max" ? "blMax" : "blDefault";
    const datasetOffset = which === "min" ? "blMinOffset" : which === "max" ? "blMaxOffset" : "blDefaultOffset";
    if (which === "default" && !field[modeKey] && field[valueKey] != null && String(field[valueKey]).trim() !== "") {
      field[modeKey] = "fixed";
    }
    if (field[modeKey] == null) {
      field[modeKey] = "";
    }
    if (field[offsetKey] == null || field[offsetKey] === "") {
      field[offsetKey] = 0;
    }
    const modeSelect = el("select", {
      className: "widefat",
      dataset: { [datasetMode]: "1" }
    });
    temporalBoundModes(type, { emptyLabel: options.emptyLabel }).forEach((mode) => {
      const option = el("option", { value: mode.id, text: mode.label });
      if ((field[modeKey] || "") === mode.id) {
        option.selected = true;
      }
      modeSelect.appendChild(option);
    });
    const fixedInput = el("input", {
      type: temporalInputType(type),
      className: "widefat bl-forms-builder__temporal-fixed",
      dataset: { [datasetValue]: "1" },
      value: field[valueKey] != null && field[valueKey] !== "" ? String(field[valueKey]) : ""
    });
    const offsetInput = el("input", {
      type: "number",
      className: "small-text bl-forms-builder__temporal-offset",
      dataset: { [datasetOffset]: "1" },
      step: "1",
      value: String(field[offsetKey] ?? 0)
    });
    const extras = el("div", { className: "bl-forms-builder__temporal-extras" });
    const emit = () => {
      if (typeof options.onChange === "function") {
        options.onChange();
      }
      document.dispatchEvent(new CustomEvent("bl-forms-builder-changed"));
    };
    const syncExtras = () => {
      const mode = field[modeKey] || "";
      extras.replaceChildren();
      if (mode === "fixed") {
        extras.appendChild(fixedInput);
      } else if (mode === "offset") {
        const unit = type === "time" ? t("boundMinutes", "minutes") : t("boundDays", "days");
        const prefix = type === "time" ? t("boundNowPlus", "Now \xB1") : t("boundTodayPlus", "Today \xB1");
        extras.appendChild(
          el("div", { className: "bl-forms-builder__temporal-offset-row" }, [
            el("span", { text: prefix }),
            offsetInput,
            el("span", { text: unit })
          ])
        );
      }
    };
    modeSelect.addEventListener("change", () => {
      field[modeKey] = modeSelect.value || "";
      if (!field[modeKey]) {
        field[valueKey] = "";
      }
      syncExtras();
      emit();
    });
    fixedInput.addEventListener("change", () => {
      field[valueKey] = fixedInput.value;
      emit();
    });
    fixedInput.addEventListener("input", () => {
      field[valueKey] = fixedInput.value;
    });
    offsetInput.addEventListener("input", () => {
      const n = parseInt(offsetInput.value, 10);
      field[offsetKey] = Number.isFinite(n) ? n : 0;
      emit();
    });
    syncExtras();
    const nodes = [modeSelect, extras];
    if (options.label) {
      nodes.unshift(el("label", { text: options.label }));
    }
    return el("p", { className: "bl-forms-builder__temporal-side" }, nodes);
  }
  function createTemporalBoundsControl(field) {
    return el("div", { className: "bl-forms-builder__temporal-bounds" }, [
      createTemporalModeControl(field, "min", { label: t("minValue", "Minimum") }),
      createTemporalModeControl(field, "max", { label: t("maxValue", "Maximum") })
    ]);
  }
  function siblingTemporalFields(field) {
    const config = readConfig();
    return flattenFields(config.fields || []).filter(
      (item) => item && item.type === field.type && item.id !== field.id && String(item.name || "").trim() !== ""
    );
  }
  function createTemporalRelationControl(field) {
    const siblings = siblingTemporalFields(field);
    if (siblings.length === 0) {
      return null;
    }
    let relation = String(field.relation || "none");
    if (!["none", "before", "after"].includes(relation)) {
      relation = "none";
    }
    field.relation = relation;
    const wrap = el("div", { className: "bl-forms-builder__date-relation" });
    const modeSelect = el("select", {
      className: "widefat",
      dataset: { blRelation: "1" },
      "aria-label": t("dateRelation", "Relation")
    });
    [
      { value: "none", label: t("dateRelationNone", "No relation") },
      { value: "before", label: t("dateRelationBefore", "Must be before") },
      { value: "after", label: t("dateRelationAfter", "Must be after") }
    ].forEach((item) => {
      const option = el("option", { value: item.value, text: item.label });
      if (item.value === relation) {
        option.selected = true;
      }
      modeSelect.appendChild(option);
    });
    const fieldSelect = el("select", {
      className: "widefat",
      dataset: { blRelationField: "1" },
      "aria-label": t("dateRelationSelect", "Select field")
    });
    fieldSelect.appendChild(
      el("option", { value: "", text: t("dateRelationSelect", "Select field") })
    );
    const currentRelated = String(field.relation_field || "");
    siblings.forEach((item) => {
      const value = String(item.name || "");
      const label = String(item.label || item.name || value).trim() || value;
      const option = el("option", { value, text: label });
      if (value === currentRelated) {
        option.selected = true;
      }
      fieldSelect.appendChild(option);
    });
    if (currentRelated && !siblings.some((item) => String(item.name || "") === currentRelated)) {
      field.relation_field = "";
      fieldSelect.value = "";
    }
    const fieldWrap = el("div", { className: "bl-forms-builder__date-relation-field" }, [fieldSelect]);
    const syncUi = () => {
      fieldWrap.hidden = (field.relation || "none") === "none";
    };
    const notify = () => document.dispatchEvent(new CustomEvent("bl-forms-builder-changed"));
    modeSelect.addEventListener("change", () => {
      field.relation = modeSelect.value || "none";
      if (field.relation === "none") {
        field.relation_field = "";
        fieldSelect.value = "";
      }
      syncUi();
      notify();
    });
    fieldSelect.addEventListener("change", () => {
      field.relation_field = fieldSelect.value || "";
      notify();
    });
    wrap.append(
      el("p", {}, [el("label", { text: t("dateRelation", "Relation") }), modeSelect]),
      fieldWrap
    );
    syncUi();
    return wrap;
  }
  function createCssClassControl(field) {
    const input = el("input", {
      type: "text",
      className: "widefat",
      dataset: { blCssClass: "1" },
      value: field.css_class || "",
      placeholder: t("cssClassPlaceholder", "e.g. my-field")
    });
    input.addEventListener("input", () => {
      field.css_class = input.value;
    });
    const wrap = el("div", { className: "bl-forms-builder__css-class" });
    wrap.appendChild(el("p", {}, [el("label", { text: t("cssClass", "CSS class") }), input]));
    wrap.appendChild(
      el("p", {
        className: "description",
        text: t("cssClassHelp", "Optional class names added to this field\u2019s wrapper.")
      })
    );
    return wrap;
  }
  function widthBadgeLabel(field) {
    const width = field.width || "100";
    if (width === "100") {
      return "";
    }
    if (width === "auto") {
      return t("widthAuto", "Auto");
    }
    if (width === "custom") {
      return (field.width_custom || "").trim();
    }
    return `${width}%`;
  }
  function settingHeading(text) {
    return el("p", { className: "bl-forms-builder__setting-heading", text });
  }
  function createCheckboxSetting(key, label, checked, onChange) {
    const input = el("input", {
      type: "checkbox",
      dataset: { [key]: "1" },
      checked: !!checked
    });
    input.addEventListener("change", () => onChange(input.checked));
    return el("p", { className: "bl-forms-builder__check-setting" }, [
      el("label", {}, [input, " " + label])
    ]);
  }
  function createSwitchSetting(key, label, checked, onChange) {
    const input = el("input", {
      type: "checkbox",
      dataset: { [key]: "1" },
      checked: !!checked
    });
    input.addEventListener("change", () => onChange(input.checked));
    return el("div", { className: "bl-forms-builder__switch-setting" }, [
      el("label", { className: "bl-forms-builder__switch" }, [
        input,
        el("span", { className: "bl-forms-builder__switch-ui", "aria-hidden": "true" }),
        el("span", { className: "bl-forms-builder__switch-label", text: label })
      ])
    ]);
  }
  function isDefaultChecked(value) {
    return value === true || value === 1 || value === "1" || value === "true" || value === "yes";
  }
  function defaultInputType(type) {
    switch (type) {
      case "number":
        return "number";
      case "email":
        return "email";
      case "url":
        return "url";
      case "phone":
        return "tel";
      case "date":
        return "date";
      case "time":
        return "time";
      case "datetime":
        return "datetime-local";
      default:
        return "text";
    }
  }
  function isValidDefaultValue(type, value) {
    const v = String(value || "").trim();
    if (v === "") {
      return true;
    }
    if (type === "number") {
      return v !== "" && !Number.isNaN(Number(v)) && /^-?\d+(\.\d+)?$/.test(v);
    }
    if (type === "email") {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    }
    if (type === "url") {
      try {
        const parsed = new URL(v, window.location.origin);
        return parsed.protocol === "http:" || parsed.protocol === "https:";
      } catch (err) {
        return false;
      }
    }
    if (type === "phone") {
      if (!/^\+?[\d\s.\-()]{6,}$/.test(v)) {
        return false;
      }
      const digits = v.replace(/\D+/g, "");
      return digits.length >= 6 && digits.length <= 20;
    }
    if (type === "date") {
      return /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v));
    }
    if (type === "time") {
      return /^\d{2}:\d{2}(:\d{2})?$/.test(v);
    }
    if (type === "datetime") {
      return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(v);
    }
    return true;
  }
  function normalizeDefaultValue(type, value) {
    const v = String(value || "").trim();
    if (v === "" || isValidDefaultValue(type, v)) {
      return v;
    }
    return "";
  }
  function createDefaultValueControl(field, updatePreview) {
    if (NO_DEFAULT.includes(field.type) || field.type === "hidden") {
      return null;
    }
    if (CHECKED_DEFAULT_TYPES.includes(field.type)) {
      return [
        createCheckboxSetting(
          "blDefault",
          t("defaultChecked", "Checked by default"),
          isDefaultChecked(field.default_value),
          (checked) => {
            field.default_value = checked ? "1" : "";
            document.dispatchEvent(new CustomEvent("bl-forms-builder-changed"));
          }
        )
      ];
    }
    if (["date", "time", "datetime"].includes(field.type)) {
      return [
        createTemporalModeControl(field, "default", {
          label: t("defaultValue", "Default value"),
          emptyLabel: t("defaultNone", "None"),
          onChange: updatePreview
        })
      ];
    }
    field.default_value = normalizeDefaultValue(field.type, field.default_value || "");
    const def = field.type === "textarea" ? el("textarea", {
      className: "widefat",
      rows: "2",
      dataset: { blDefault: "1" }
    }) : el("input", {
      type: defaultInputType(field.type),
      className: "widefat",
      dataset: { blDefault: "1" },
      value: field.default_value || ""
    });
    if (field.type === "textarea") {
      def.value = field.default_value || "";
    }
    if (field.type === "number") {
      def.setAttribute("step", "any");
      def.setAttribute("inputmode", "decimal");
    }
    const commit = () => {
      const next = normalizeDefaultValue(field.type, def.value);
      if (next !== def.value) {
        def.value = next;
      }
      field.default_value = next;
      updatePreview();
      document.dispatchEvent(new CustomEvent("bl-forms-builder-changed"));
    };
    def.addEventListener("input", () => {
      if (["text", "textarea", "phone"].includes(field.type) || OPTION_TYPES.includes(field.type)) {
        field.default_value = def.value;
        updatePreview();
        return;
      }
      field.default_value = def.value;
      updatePreview();
    });
    def.addEventListener("change", commit);
    def.addEventListener("blur", commit);
    const nodes = [el("p", {}, [el("label", { text: t("defaultValue", "Default value") }), def])];
    if (OPTION_TYPES.includes(field.type)) {
      nodes.push(
        el("p", {
          className: "description",
          text: t(
            "defaultValueOptionsHelp",
            "Use option slugs from the list above. For multiple values, separate with commas (e.g. option-1, option-2)."
          )
        })
      );
    }
    return nodes;
  }
  function appearancePayload(scope, width, widthCustom) {
    return {
      width,
      width_custom: width === "custom" ? widthCustom : "",
      css_class: scope.querySelector("[data-bl-css-class]")?.value || ""
    };
  }
  function withConditionalLogic(body, data) {
    const row = body?.closest?.("[data-bl-forms-field]") || body;
    const live = row && row._blFieldRef ? row._blFieldRef.conditional_logic : null;
    if (live && typeof live === "object") {
      const normalized = normalizeConditionalLogic(live);
      if (normalized.enabled || normalized.groups.length) {
        data.conditional_logic = normalized;
        return data;
      }
    }
    const logic = readConditionalLogicFromDom(body);
    if (logic) {
      const normalized = normalizeConditionalLogic(logic);
      if (normalized.enabled || normalized.groups.length) {
        data.conditional_logic = normalized;
      }
    }
    return data;
  }
  function createFieldEditorTabs(activeId = "general") {
    const tabBar = el("nav", {
      className: "bl-forms-builder__field-tabs",
      role: "tablist"
    });
    const panelsWrap = el("div", { className: "bl-forms-builder__field-panels" });
    const tabDefs = [
      { id: "general", label: t("fieldTabGeneral", "General") },
      { id: "advanced", label: t("fieldTabAdvanced", "Advanced") },
      { id: "appearance", label: t("fieldTabAppearance", "Appearance") },
      { id: "logic", label: t("fieldTabLogic", "Logic") }
    ];
    const initialId = tabDefs.some((tab) => tab.id === activeId) ? activeId : "general";
    const tabs = tabDefs.map((tab) => {
      const active = tab.id === initialId;
      const panel = el("div", {
        className: "bl-forms-builder__field-panel" + (active ? " is-active" : ""),
        dataset: { blFieldPanel: tab.id },
        role: "tabpanel"
      });
      if (!active) {
        panel.hidden = true;
      }
      panelsWrap.appendChild(panel);
      const button = el("button", {
        type: "button",
        className: "bl-forms-builder__field-tab" + (active ? " is-active" : ""),
        role: "tab",
        text: tab.label,
        dataset: { blFieldTab: tab.id },
        onClick: () => activate(tab.id)
      });
      button.setAttribute("aria-selected", active ? "true" : "false");
      tabBar.appendChild(button);
      return { ...tab, button, panel };
    });
    const activate = (id) => {
      tabs.forEach((tab) => {
        if (tab.button.hidden) {
          tab.panel.hidden = true;
          tab.panel.classList.remove("is-active");
          tab.button.classList.remove("is-active");
          tab.button.setAttribute("aria-selected", "false");
          return;
        }
        const active = tab.id === id;
        tab.button.classList.toggle("is-active", active);
        tab.button.setAttribute("aria-selected", active ? "true" : "false");
        tab.panel.hidden = !active;
        tab.panel.classList.toggle("is-active", active);
      });
      if (id === "logic") {
        tabs[3].panel.querySelectorAll(".bl-forms-builder__logic").forEach((node) => {
          if (typeof node.refreshLogicSources === "function") {
            node.refreshLogicSources();
          }
        });
      }
    };
    const wrap = el("div", { className: "bl-forms-builder__field-editor" }, [tabBar, panelsWrap]);
    return {
      wrap,
      general: tabs[0].panel,
      advanced: tabs[1].panel,
      appearance: tabs[2].panel,
      logic: tabs[3].panel,
      /**
       * Hide tabs whose panels have no sections, and activate a visible tab if needed.
       */
      syncVisibility(preferredId = initialId) {
        tabs.forEach((tab) => {
          const empty = tab.panel.childElementCount === 0;
          tab.button.hidden = empty;
          if (empty) {
            tab.panel.hidden = true;
            tab.panel.classList.remove("is-active");
            tab.button.classList.remove("is-active");
            tab.button.setAttribute("aria-selected", "false");
          }
        });
        const visible = tabs.filter((tab) => !tab.button.hidden);
        tabBar.hidden = visible.length <= 1;
        if (visible.length === 0) {
          return;
        }
        const preferred = visible.find((tab) => tab.id === preferredId) || visible[0];
        activate(preferred.id);
      }
    };
  }
  function createSectionAppender(panel) {
    let count = 0;
    return {
      get count() {
        return count;
      },
      add(...nodes) {
        const list = nodes.flat().filter(Boolean);
        if (!list.length) {
          return;
        }
        panel.appendChild(el("div", { className: "bl-forms-builder__field-section" }, list));
        count += 1;
      }
    };
  }
  function serializeRow(row) {
    const layoutData = serializeLayoutRow(row);
    if (layoutData) {
      return layoutData;
    }
    const type = row.dataset.fieldType || "text";
    const id = row.dataset.fieldId || uid();
    const body = row.querySelector(":scope > .bl-forms-builder__field-body") || row;
    const q = (sel) => body.querySelector(sel);
    const widthBtn = q("[data-bl-width].is-active");
    const width = widthBtn?.dataset.blWidth || row.dataset.fieldWidth || "100";
    const widthCustom = q("[data-bl-width-custom]")?.value || "";
    const nameManual = row.dataset.nameManual === "1";
    const hideLabel = Boolean(q("[data-bl-hide-label]")?.checked);
    const activeInput = q("[data-bl-active]");
    const active = activeInput ? Boolean(activeInput.checked) : true;
    if (type === "divider") {
      const marginBtn = q("[data-bl-margin].is-active");
      const margin = marginBtn?.dataset.blMargin || row.dataset.fieldMargin || "m";
      const marginCustom = q("[data-bl-margin-custom]")?.value || "";
      return withConditionalLogic(body, {
        id,
        type,
        active,
        margin,
        margin_custom: margin === "custom" ? marginCustom : "",
        css_class: q("[data-bl-css-class]")?.value || ""
      });
    }
    if (type === "captcha") {
      return withConditionalLogic(body, {
        id,
        type,
        active,
        ...appearancePayload(body, width, widthCustom)
      });
    }
    if (type === "spacer") {
      const heightBtn = q("[data-bl-height].is-active");
      const height = heightBtn?.dataset.blHeight || row.dataset.fieldHeight || "m";
      const heightCustom = q("[data-bl-height-custom]")?.value || "";
      return withConditionalLogic(body, {
        id,
        type,
        active,
        height,
        height_custom: height === "custom" ? heightCustom : "",
        css_class: q("[data-bl-css-class]")?.value || ""
      });
    }
    if (type === "heading") {
      const levelBtn = q("[data-bl-heading-level].is-active");
      const level = levelBtn?.dataset.blHeadingLevel || "h2";
      return withConditionalLogic(body, {
        id,
        type,
        active,
        content: q("[data-bl-content]")?.value || "",
        level: HEADING_LEVELS.includes(level) ? level : "h2",
        ...appearancePayload(body, width, widthCustom)
      });
    }
    if (type === "text_block" || type === "html") {
      return withConditionalLogic(body, {
        id,
        type,
        active,
        content: q("[data-bl-content]")?.value || "",
        ...appearancePayload(body, width, widthCustom)
      });
    }
    if (type === "honeypot") {
      return withConditionalLogic(body, {
        id,
        type,
        active,
        label: q("[data-bl-label]")?.value || "",
        name: q("[data-bl-name]")?.value || id,
        name_manual: nameManual,
        hide_label: hideLabel,
        ...appearancePayload(body, width, widthCustom)
      });
    }
    if (type === "hidden") {
      return withConditionalLogic(body, {
        id,
        type,
        active,
        label: q("[data-bl-label]")?.value || "",
        name: q("[data-bl-name]")?.value || id,
        name_manual: nameManual,
        hide_label: hideLabel,
        default_value: q("[data-bl-default]")?.value || "",
        ...appearancePayload(body, "100", "")
      });
    }
    const data = {
      id,
      type,
      active,
      label: q("[data-bl-label]")?.value || "",
      name: q("[data-bl-name]")?.value || id,
      name_manual: nameManual,
      hide_label: hideLabel,
      required: Boolean(q("[data-bl-required]")?.checked),
      readonly: Boolean(q("[data-bl-readonly]")?.checked),
      disabled: Boolean(q("[data-bl-disabled]")?.checked),
      placeholder: q("[data-bl-placeholder]")?.value || "",
      ...appearancePayload(body, width, widthCustom)
    };
    if (DESCRIPTION_TYPES.includes(type)) {
      data.description = q("[data-bl-description]")?.value || "";
    }
    if (type === "terms") {
      data.content = q("[data-bl-content]")?.value || "";
    }
    if (OPTION_TYPES.includes(type)) {
      data.options = Array.from(body.querySelectorAll("[data-bl-option]")).map((opt) => ({
        label: opt.querySelector("[data-bl-opt-label]")?.value || "",
        value: opt.querySelector("[data-bl-opt-value]")?.value || ""
      }));
    }
    if (type === "radio" || type === "checkboxes") {
      const layoutBtn = q("[data-bl-layout].is-active");
      data.layout = layoutBtn?.dataset.blLayout === "horizontal" ? "horizontal" : "vertical";
    }
    if (type === "checkboxes") {
      const parseLimit = (raw) => {
        const next = parseInt(raw, 10);
        return Number.isFinite(next) && next >= 1 ? Math.min(50, next) : "";
      };
      let min = parseLimit(q("[data-bl-min-selections]")?.value?.trim());
      let max = parseLimit(q("[data-bl-max-selections]")?.value?.trim());
      if (min !== "" && max !== "" && min > max) {
        [min, max] = [max, min];
      }
      data.min_selections = min;
      data.max_selections = max;
    }
    if (MULTIPLE_TYPES.includes(type)) {
      data.multiple = Boolean(q("[data-bl-multiple]")?.checked);
    }
    if (type === "file" || type === "image") {
      data.extensions = q("[data-bl-extensions]")?.value?.trim() || "";
      data.upload_style = q("[data-bl-upload-style]")?.value === "classic" ? "classic" : "modern";
      data.preview = data.upload_style === "modern" ? Boolean(q("[data-bl-preview]")?.checked) : false;
      data.button_text = q("[data-bl-upload-button]")?.value?.trim() || "";
      data.max_size_mb = q("[data-bl-max-size-mb]")?.value?.trim() || "";
      if (data.multiple) {
        const rawMax = q("[data-bl-max-files]")?.value?.trim();
        const parsed = parseInt(rawMax, 10);
        data.max_files = Number.isFinite(parsed) && parsed >= 1 ? Math.min(50, parsed) : 10;
      }
    }
    if (AUTOCOMPLETE_TYPES.includes(type)) {
      const ac = q("[data-bl-autocomplete]");
      data.autocomplete = ac?.value === "off" ? "off" : "auto";
    }
    if (AFFIX_TYPES.includes(type)) {
      data.prefix = q("[data-bl-prefix]")?.value ?? "";
      data.suffix = q("[data-bl-suffix]")?.value ?? "";
    }
    if (type === "number") {
      data.min = q("[data-bl-min]")?.value?.trim() || "";
      data.max = q("[data-bl-max]")?.value?.trim() || "";
    }
    if (type === "text" || type === "textarea") {
      data.min_length = q("[data-bl-min-length]")?.value?.trim() || "";
      data.max_length = q("[data-bl-max-length]")?.value?.trim() || "";
      data.show_char_count = Boolean(q("[data-bl-show-char-count]")?.checked);
    }
    if (type === "text" || type === "email" || type === "phone") {
      data.show_in_list = Boolean(q("[data-bl-show-in-list]")?.checked);
    }
    if (type === "textarea") {
      const rawRows = parseInt(q("[data-bl-rows]")?.value, 10);
      data.rows = Number.isFinite(rawRows) && rawRows >= 2 ? Math.min(50, rawRows) : 5;
    }
    if (type === "date" || type === "time" || type === "datetime") {
      data.placeholder = "";
      const readSide = (which) => {
        const modeSel = which === "min" ? "[data-bl-min-mode]" : which === "max" ? "[data-bl-max-mode]" : "[data-bl-default-mode]";
        const valueSel = which === "min" ? "[data-bl-min]" : which === "max" ? "[data-bl-max]" : "[data-bl-default]";
        const offsetSel = which === "min" ? "[data-bl-min-offset]" : which === "max" ? "[data-bl-max-offset]" : "[data-bl-default-offset]";
        const valueKey = which === "default" ? "default_value" : which;
        const mode = q(modeSel)?.value || "";
        if (!mode) {
          if (which === "default") {
            data.default_value = "";
          }
          return;
        }
        data[`${which}_mode`] = mode;
        if (mode === "fixed") {
          data[valueKey] = q(valueSel)?.value?.trim() || "";
        }
        if (mode === "offset") {
          const raw = q(offsetSel)?.value;
          const n = parseInt(raw, 10);
          data[`${which}_offset`] = Number.isFinite(n) ? n : 0;
        }
      };
      readSide("min");
      readSide("max");
      readSide("default");
      const relation = q("[data-bl-relation]")?.value || "none";
      if (relation === "before" || relation === "after") {
        data.relation = relation;
        data.relation_field = q("[data-bl-relation-field]")?.value || "";
        if (!data.relation_field) {
          data.relation = "none";
          data.relation_field = "";
        }
      } else {
        data.relation = "none";
        data.relation_field = "";
      }
    }
    if (NO_READONLY.includes(type)) {
      delete data.readonly;
    }
    if (NO_DISABLED.includes(type)) {
      delete data.disabled;
    }
    if (NO_REQUIRED.includes(type)) {
      delete data.required;
    }
    if (!NO_DEFAULT.includes(type) && type !== "date" && type !== "time" && type !== "datetime") {
      const defEl = q("[data-bl-default]");
      if (defEl) {
        data.default_value = defEl.type === "checkbox" ? defEl.checked ? "1" : "" : defEl.value || "";
      }
    }
    return withConditionalLogic(body, data);
  }
  function duplicateFieldCard(row) {
    if (!row) {
      return;
    }
    const data = serializeRow(row);
    if (!data) {
      return;
    }
    const clone = cloneFieldData(data);
    const copy = createFieldCard(clone, false);
    row.after(copy);
    if ((copy.dataset.fieldType || "") === "column") {
      const list = row.parentElement;
      if (list) {
        equalizeColumnRun(list, copy);
      }
    }
    document.dispatchEvent(new CustomEvent("bl-forms-builder-changed"));
  }
  function createFieldCard(initial, open = false) {
    if ((initial?.type || "") === "column") {
      return createColumnCard(initial, open);
    }
    if ((initial?.type || "") === "section") {
      return createSectionCard(initial, open);
    }
    let field = {
      width: "100",
      width_custom: "",
      hide_label: false,
      active: true,
      ...initial,
      id: initial.id || uid(),
      name_manual: initial.name_manual != null ? !!initial.name_manual : true
    };
    if (field.active === void 0) {
      field.active = true;
    }
    if (field.type === "terms" && field.content == null && field.label) {
      field = { ...field, content: field.label, label: "" };
    }
    if (field.type === "spacer") {
      normalizeSpacerHeight(field);
    }
    if (field.type === "divider") {
      normalizeDividerMargin(field);
    }
    if (field.type === "heading") {
      normalizeHeadingLevel(field);
    }
    if (NAMED_TYPES.includes(field.type) && !field.name) {
      field.name = uniqueFieldName(field.label || field.type, field.id);
    }
    if ((field.type === "text" || field.type === "email") && field.show_in_list === void 0) {
      field.show_in_list = defaultShowInListForNewField(field.type, field.id);
    }
    const row = el("div", {
      className: "bl-forms-builder__field" + (open ? " is-open" : ""),
      dataset: {
        blFormsField: "1",
        fieldId: field.id,
        fieldType: field.type,
        fieldWidth: field.width || "100",
        fieldHeight: field.type === "spacer" ? field.height || "m" : "",
        fieldMargin: field.type === "divider" ? field.margin || "m" : "",
        fieldName: field.name || "",
        nameManual: field.name_manual ? "1" : "0"
      }
    });
    row._blFieldRef = field;
    const preview = el("span", { className: "bl-forms-builder__preview" });
    const widthBadge = el("span", { className: "bl-forms-builder__width-badge" });
    const activateBtn = el("button", {
      type: "button",
      className: "bl-forms-builder__icon-btn bl-forms-builder__activate-btn",
      title: t("fieldActivateTitle", "Show on the frontend"),
      "aria-label": t("fieldActivateTitle", "Show on the frontend"),
      hidden: fieldIsActive(field),
      onClick: (evt) => {
        evt.preventDefault();
        evt.stopPropagation();
        field.active = true;
        const activeInput = body.querySelector("[data-bl-active]");
        if (activeInput) {
          activeInput.checked = true;
        }
        updatePreview();
        document.dispatchEvent(new CustomEvent("bl-forms-builder-changed"));
      }
    });
    activateBtn.appendChild(iconEl("inactive", "bl-forms-builder__activate-btn-icon"));
    const typeChip = el("span", { className: "bl-forms-builder__field-type" });
    const body = el("div", { className: "bl-forms-builder__field-body" });
    const updatePreview = () => {
      let title = (field.label || field.placeholder || "").trim();
      if (field.type === "captcha") {
        title = typeLabel("captcha");
      } else if (field.type === "spacer") {
        const height = field.height || "m";
        title = height === "custom" ? (field.height_custom || t("widthCustom", "Custom")).trim() : height.toUpperCase();
      } else if (field.type === "divider") {
        const margin = field.margin || "m";
        if (margin === "custom") {
          title = (field.margin_custom || t("widthCustom", "Custom")).trim();
        } else {
          const preset = DIVIDER_MARGIN_PRESETS.find((item) => item.value === margin);
          title = preset?.label || margin.toUpperCase();
        }
      } else if (field.type === "heading" || field.type === "text_block" || field.type === "html") {
        title = (field.content || "").trim();
      }
      preview.textContent = title;
      preview.hidden = title === "";
      const widthText = field.type === "hidden" || field.type === "divider" || field.type === "spacer" ? "" : widthBadgeLabel(field);
      widthBadge.textContent = widthText;
      widthBadge.hidden = widthText === "";
      widthBadge.classList.toggle("is-interactive", widthText !== "");
      if (widthText !== "") {
        widthBadge.title = t("width", "Width");
      } else {
        widthBadge.removeAttribute("title");
      }
      const active = fieldIsActive(field);
      row.classList.toggle("is-inactive", !active);
      activateBtn.hidden = active;
      const typeChildren = [
        iconEl(field.type, "bl-forms-builder__field-type-icon"),
        el("span", { className: "bl-forms-builder__field-type-label", text: typeLabel(field.type) })
      ];
      if (field.required && !NO_REQUIRED.includes(field.type)) {
        typeChildren.push(
          el("span", {
            className: "bl-forms-builder__field-required-dot",
            title: t("required", "Required"),
            "aria-label": t("required", "Required")
          })
        );
      }
      const logic = field.conditional_logic;
      if (logic && logic.enabled && Array.isArray(logic.groups) && logic.groups.length > 0) {
        typeChildren.push(
          el("span", {
            className: "bl-forms-builder__field-logic-dot",
            title: t("logicEnable", "Conditional logic"),
            "aria-label": t("logicEnable", "Conditional logic")
          })
        );
      }
      typeChip.replaceChildren(...typeChildren);
      row.dataset.fieldType = field.type;
      row.dataset.fieldWidth = field.width || "100";
      row.dataset.fieldHeight = field.type === "spacer" ? field.height || "m" : "";
      row.dataset.fieldMargin = field.type === "divider" ? field.margin || "m" : "";
      row.dataset.fieldName = field.name || "";
      row.dataset.nameManual = field.name_manual ? "1" : "0";
    };
    const setOpen = (nextOpen) => {
      if (nextOpen) {
        document.querySelectorAll(".bl-forms-builder__field.is-open").forEach((other) => {
          if (other === row) {
            return;
          }
          other.classList.remove("is-open");
          const otherToggle = other.querySelector(".bl-forms-builder__field-toggle");
          if (otherToggle) {
            otherToggle.setAttribute("aria-expanded", "false");
            otherToggle.setAttribute("aria-label", t("expandField", "Expand field"));
          }
        });
      }
      row.classList.toggle("is-open", nextOpen);
      toggle.setAttribute("aria-expanded", nextOpen ? "true" : "false");
      toggle.setAttribute(
        "aria-label",
        nextOpen ? t("collapseField", "Collapse field") : t("expandField", "Expand field")
      );
      if (nextOpen) {
        body.querySelectorAll(".bl-forms-builder__logic").forEach((node) => {
          if (typeof node.refreshLogicSources === "function") {
            node.refreshLogicSources();
          }
        });
      }
    };
    const toggle = el("button", {
      type: "button",
      className: "bl-forms-builder__icon-btn bl-forms-builder__field-toggle",
      "aria-expanded": open ? "true" : "false",
      "aria-label": open ? t("collapseField", "Collapse field") : t("expandField", "Expand field"),
      onClick: () => setOpen(!row.classList.contains("is-open"))
    });
    const caretIcon = iconEl("caret", "bl-forms-builder__field-toggle-icon");
    if (caretIcon.innerHTML) {
      toggle.appendChild(caretIcon);
    } else {
      toggle.textContent = "\u25BE";
    }
    const deleteBtn = el("button", {
      type: "button",
      className: "bl-forms-builder__icon-btn bl-forms-builder__icon-btn--danger",
      title: t("delete", "Delete"),
      "aria-label": t("delete", "Delete"),
      onClick: () => {
        row.remove();
        document.dispatchEvent(new CustomEvent("bl-forms-builder-changed"));
      }
    });
    const trashIcon = iconEl("trash");
    if (trashIcon.innerHTML) {
      deleteBtn.appendChild(trashIcon);
    } else {
      deleteBtn.textContent = "\xD7";
    }
    const duplicateBtn = el("button", {
      type: "button",
      className: "bl-forms-builder__icon-btn",
      title: t("duplicate", "Duplicate"),
      "aria-label": t("duplicate", "Duplicate"),
      onClick: () => duplicateFieldCard(row)
    });
    const duplicateIcon = iconEl("duplicate");
    if (duplicateIcon.innerHTML) {
      duplicateBtn.appendChild(duplicateIcon);
    } else {
      duplicateBtn.textContent = "\u29C9";
    }
    const syncNameFromLabel = (nameInput) => {
      if (field.name_manual || !nameInput) {
        return;
      }
      const next = uniqueFieldName(field.label || field.type, field.id);
      field.name = next;
      nameInput.value = next;
      row.dataset.fieldName = next;
    };
    const renderBody = (activeTab = "general") => {
      body.replaceChildren();
      const tabs = createFieldEditorTabs(activeTab);
      const { general, advanced, appearance, logic } = tabs;
      const generalSections = createSectionAppender(general);
      const advancedSections = createSectionAppender(advanced);
      const appearanceSections = createSectionAppender(appearance);
      const logicSections = createSectionAppender(logic);
      generalSections.add(
        (() => {
          const switches = [
            createSwitchSetting("blActive", t("fieldActive", "Active"), fieldIsActive(field), (checked) => {
              field.active = checked;
              updatePreview();
              document.dispatchEvent(new CustomEvent("bl-forms-builder-changed"));
            })
          ];
          if (field.type === "text" || field.type === "email" || field.type === "phone") {
            switches.push(createListOverviewControl(field));
          }
          return el("div", { className: "bl-forms-builder__field-status" }, switches);
        })()
      );
      const onTypeConvert = () => {
        updatePreview();
        const stayOn = ["heading", "text_block", "html"].includes(field.type) ? "general" : "advanced";
        renderBody(stayOn);
        document.dispatchEvent(new CustomEvent("bl-forms-builder-changed"));
      };
      const typeSelect = createTypeSelect(field, row, onTypeConvert);
      const contentTypes = ["heading", "text_block", "html"];
      if (typeSelect && contentTypes.includes(field.type)) {
        generalSections.add(typeSelect);
      } else if (typeSelect) {
        advancedSections.add(typeSelect);
      }
      if (field.type === "heading") {
        appearanceSections.add(createHeadingLevelControl(field, updatePreview));
      }
      if (field.type === "spacer") {
        appearanceSections.add(createHeightControl(field, updatePreview));
      }
      if (field.type === "divider") {
        appearanceSections.add(createMarginControl(field, updatePreview));
      }
      if (field.type !== "hidden" && field.type !== "divider" && field.type !== "spacer") {
        appearanceSections.add(createWidthControl(field, updatePreview));
      }
      if (field.type === "file" || field.type === "image") {
        appearanceSections.add(createUploadAppearanceControls(field));
      }
      if (field.type === "radio" || field.type === "checkboxes") {
        appearanceSections.add(createLayoutControl(field));
      }
      appearanceSections.add(createCssClassControl(field));
      logicSections.add(createConditionalLogicEditor(field, void 0, updatePreview));
      if (field.type === "divider" || field.type === "spacer") {
      } else if (field.type === "captcha") {
        generalSections.add(
          createCaptchaSettings(field, () => {
            updatePreview();
          })
        );
      } else if (["heading", "text_block", "html"].includes(field.type)) {
        const ta = el("textarea", {
          className: "widefat",
          rows: field.type === "html" ? "6" : "3",
          dataset: { blContent: "1" }
        });
        ta.value = field.content || "";
        ta.addEventListener("input", () => {
          field.content = ta.value;
          updatePreview();
        });
        const contentLabel = field.type === "html" ? t("htmlContent", "HTML") : t("content", "Content");
        generalSections.add(el("p", {}, [el("label", { text: contentLabel }), ta]));
      } else {
        const labelInput = el("input", {
          type: "text",
          className: "widefat",
          dataset: { blLabel: "1" }
        });
        labelInput.value = field.label || "";
        let nameInput = null;
        if (NAMED_TYPES.includes(field.type)) {
          nameInput = el("input", {
            type: "text",
            className: "widefat",
            dataset: { blName: "1" },
            value: field.name || uniqueFieldName(field.label || field.type, field.id)
          });
          nameInput.addEventListener("input", () => {
            field.name_manual = true;
            field.name = nameInput.value;
            row.dataset.nameManual = "1";
            row.dataset.fieldName = field.name;
          });
          nameInput.addEventListener("blur", () => {
            const next = uniqueFieldName(nameInput.value || field.label || field.type, field.id);
            field.name = next;
            nameInput.value = next;
            row.dataset.fieldName = next;
            document.dispatchEvent(new CustomEvent("bl-forms-builder-changed"));
          });
        }
        labelInput.addEventListener("input", () => {
          field.label = labelInput.value;
          syncNameFromLabel(nameInput);
          updatePreview();
        });
        const labelControls = el("div", { className: "bl-forms-builder__label-controls" }, [labelInput]);
        if (HIDE_LABEL_TYPES.includes(field.type)) {
          labelControls.appendChild(
            el("div", { className: "bl-forms-builder__hide-label" }, [
              createSwitchSetting("blHideLabel", t("hideLabel", "Hide"), !!field.hide_label, (checked) => {
                field.hide_label = checked;
                document.dispatchEvent(new CustomEvent("bl-forms-builder-changed"));
              })
            ])
          );
        }
        generalSections.add(
          el("div", { className: "bl-forms-builder__label-row" }, [
            el("label", { text: t("label", "Label") }),
            labelControls
          ])
        );
        if (nameInput) {
          advancedSections.add(
            el("p", {}, [el("label", { text: t("name", "Field name") }), nameInput]),
            el("p", {
              className: "description",
              text: t(
                "nameHelp",
                "Internal field key used in submissions, emails, and entry data."
              )
            })
          );
        }
        if (AFFIX_TYPES.includes(field.type)) {
          advancedSections.add(createPrefixSuffixControl(field));
        }
        if (field.type === "textarea") {
          advancedSections.add(createTextareaRowsControl(field));
        }
        if (field.type === "text" || field.type === "textarea") {
          advancedSections.add(createLengthLimitsControl(field));
        }
        if (field.type === "file" || field.type === "image") {
          advancedSections.add(createExtensionsControl(field));
          advancedSections.add(createMaxSizeControl(field));
          advancedSections.add(createUploadButtonControl(field));
          if (field.multiple) {
            advancedSections.add(createMaxFilesControl(field));
          }
        }
        if (field.type === "number") {
          advancedSections.add(createNumberBoundsControl(field));
        }
        if (field.type === "checkboxes") {
          advancedSections.add(createSelectionBoundsControl(field));
        }
        if (["date", "time", "datetime"].includes(field.type)) {
          advancedSections.add(createTemporalBoundsControl(field));
          const relationControl = createTemporalRelationControl(field);
          if (relationControl) {
            advancedSections.add(relationControl);
          }
        }
        if (AUTOCOMPLETE_TYPES.includes(field.type)) {
          advancedSections.add(createAutocompleteControl(field));
        }
        if (field.type === "terms") {
          const consentText = el("textarea", {
            className: "widefat",
            rows: "3",
            dataset: { blContent: "1" }
          });
          consentText.value = field.content || "";
          consentText.addEventListener("input", () => {
            field.content = consentText.value;
            updatePreview();
          });
          generalSections.add(
            el("p", {}, [el("label", { text: t("checkboxText", "Checkbox text") }), consentText]),
            el("p", {
              className: "description",
              html: t(
                "checkboxTextHelp",
                'Markdown is supported, e.g. <b>**Bold**</b>, <i>*Italic*</i>, and <span style="white-space: nowrap">[Link](...)</span>. For the target you can use a URL (/agb), a WordPress page (page:123), or a standard page such as page:privacy.'
              )
            })
          );
        }
        if (field.type === "hidden") {
          const def = el("input", {
            type: "text",
            className: "widefat",
            dataset: { blDefault: "1" },
            value: field.default_value || ""
          });
          def.addEventListener("input", () => {
            field.default_value = def.value;
            document.dispatchEvent(new CustomEvent("bl-forms-builder-changed"));
          });
          generalSections.add(
            el("p", {}, [el("label", { text: t("defaultValue", "Default value") }), def])
          );
        }
        if (field.type === "honeypot") {
          generalSections.add(
            el("p", {
              className: "description",
              text: t(
                "honeypotHelp",
                "Hidden from visitors. If filled, the submission is treated as spam."
              )
            })
          );
        }
        if (!NO_PLACEHOLDER.includes(field.type)) {
          const ph = el("input", {
            type: "text",
            className: "widefat",
            dataset: { blPlaceholder: "1" }
          });
          ph.value = field.placeholder || "";
          ph.addEventListener("input", () => {
            field.placeholder = ph.value;
            updatePreview();
          });
          generalSections.add(
            el("p", {}, [el("label", { text: t("placeholder", "Placeholder") }), ph])
          );
        }
        if (DESCRIPTION_TYPES.includes(field.type)) {
          const desc = el("textarea", {
            className: "widefat",
            rows: "2",
            dataset: { blDescription: "1" }
          });
          desc.value = field.description || "";
          desc.addEventListener("input", () => {
            field.description = desc.value;
          });
          generalSections.add(
            el("p", {}, [el("label", { text: t("description", "Description") }), desc])
          );
        }
        if (OPTION_TYPES.includes(field.type)) {
          generalSections.add(
            settingHeading(t("choices", "Choices")),
            createOptionsEditor(field.options || [])
          );
        }
        if (field.type !== "hidden") {
          const defaults = createDefaultValueControl(field, updatePreview);
          if (defaults) {
            if (CHECKED_DEFAULT_TYPES.includes(field.type)) {
              generalSections.add(settingHeading(t("defaultValue", "Default value")), ...defaults);
            } else {
              generalSections.add(...defaults);
            }
          }
        }
        const optionToggles = [];
        if (!NO_REQUIRED.includes(field.type)) {
          optionToggles.push(
            createSwitchSetting("blRequired", t("required", "Required"), !!field.required, (checked) => {
              field.required = checked;
              updatePreview();
              document.dispatchEvent(new CustomEvent("bl-forms-builder-changed"));
            })
          );
        }
        if (MULTIPLE_TYPES.includes(field.type)) {
          let multipleLabel = t("allowMultiple", "Allow multiple");
          if (field.type === "button_group") {
            multipleLabel = t("buttonGroupMultiple", "Allow multiple selection");
          } else if (field.type === "select") {
            multipleLabel = t("selectMultiple", "Allow multiple selection");
          } else if (field.type === "file" || field.type === "image") {
            multipleLabel = t("allowMultipleFiles", "Allow multiple files");
          }
          optionToggles.push(
            createSwitchSetting("blMultiple", multipleLabel, !!field.multiple, (checked) => {
              field.multiple = checked;
              if (field.type === "file" || field.type === "image") {
                if (checked && (field.max_files == null || field.max_files === "")) {
                  field.max_files = 10;
                }
                renderBody("general");
              }
              document.dispatchEvent(new CustomEvent("bl-forms-builder-changed"));
            })
          );
        }
        if (!NO_READONLY.includes(field.type)) {
          optionToggles.push(
            createSwitchSetting("blReadonly", t("readOnly", "Read only"), !!field.readonly, (checked) => {
              field.readonly = checked;
              document.dispatchEvent(new CustomEvent("bl-forms-builder-changed"));
            })
          );
        }
        if (!NO_DISABLED.includes(field.type)) {
          optionToggles.push(
            createSwitchSetting("blDisabled", t("disabled", "Disabled"), !!field.disabled, (checked) => {
              field.disabled = checked;
              document.dispatchEvent(new CustomEvent("bl-forms-builder-changed"));
            })
          );
        }
        if (optionToggles.length) {
          generalSections.add(
            settingHeading(t("options", "Options")),
            el("div", { className: "bl-forms-builder__options-toggles" }, optionToggles)
          );
        }
      }
      tabs.syncVisibility(activeTab);
      body.appendChild(tabs.wrap);
    };
    const handle = el("span", {
      className: "bl-forms-builder__handle",
      title: t("dragField", "Drag to reorder"),
      "aria-hidden": "true"
    });
    const dragIcon = iconEl("drag");
    if (dragIcon.innerHTML) {
      handle.appendChild(dragIcon);
    } else {
      handle.textContent = "\u22EE\u22EE";
    }
    const headerMeta = el("div", { className: "bl-forms-builder__field-meta" }, [
      widthBadge,
      typeChip
    ]);
    widthBadge.addEventListener("click", (evt) => {
      if (widthBadge.hidden || field.type === "hidden" || field.type === "divider" || field.type === "spacer") {
        return;
      }
      evt.preventDefault();
      evt.stopPropagation();
      openFieldWidthModal(field, () => {
        updatePreview();
        syncWidthControlUi(body, field);
        document.dispatchEvent(new CustomEvent("bl-forms-builder-changed"));
      });
    });
    const header = el("div", { className: "bl-forms-builder__field-header" }, [
      toggle,
      preview,
      headerMeta,
      el("div", { className: "bl-forms-builder__field-actions" }, [activateBtn, duplicateBtn, deleteBtn, handle])
    ]);
    updatePreview();
    renderBody();
    row.appendChild(header);
    row.appendChild(body);
    if (open) {
      setOpen(true);
    }
    return row;
  }

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

  // themes/baselayer/packages/baselayer-forms/src/js/admin/panels.js
  function fieldRow(label, control, help = "") {
    const children = [
      el("label", {}, [el("strong", { text: label })]),
      control
    ];
    if (help) {
      children.push(el("span", { className: "description", text: help }));
    }
    return el("p", { className: "bl-forms-builder__setting" }, children);
  }
  function errorSection(title, children) {
    return el("div", { className: "bl-forms-builder__field-errors" }, [
      el("h3", {
        className: "bl-forms-builder__section-title",
        text: title
      }),
      el("div", { className: "bl-forms-builder__field-errors-box" }, children)
    ]);
  }
  function emailFieldsFromList(fields) {
    return flattenFields(fields || []).filter(
      (field) => field && field.type === "email" && field.name && field.active !== false
    );
  }
  function emailFieldLabel(field) {
    const label = (field.label || "").trim();
    const name = field.name || "";
    if (label && label !== name) {
      return `${label} (${name})`;
    }
    return label || name;
  }
  function randomHoneypotName() {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let out = "hp_";
    for (let i = 0; i < 10; i += 1) {
      out += chars[Math.floor(Math.random() * chars.length)];
    }
    return out;
  }
  function plainSwitch(label, { checked = false, disabled = false, onChange = null } = {}) {
    const input = el("input", {
      type: "checkbox",
      checked: !!checked,
      disabled: !!disabled
    });
    if (onChange && !disabled) {
      input.addEventListener("change", () => onChange(input.checked));
    }
    const root = el(
      "div",
      {
        className: "bl-forms-builder__switch-setting" + (disabled ? " is-disabled" : "")
      },
      [
        el("label", { className: "bl-forms-builder__switch" }, [
          input,
          el("span", { className: "bl-forms-builder__switch-ui", "aria-hidden": "true" }),
          el("span", { className: "bl-forms-builder__switch-label", text: label })
        ])
      ]
    );
    return { root, input };
  }
  function createPanels(settings, builderRoot, onChange) {
    const state = { ...settings || {} };
    let emailFields = [];
    if (!state.honeypot_name || state.honeypot_name === "bl_forms_hp") {
      state.honeypot_name = randomHoneypotName();
    }
    if (!state.after_submit || !["message", "redirect"].includes(state.after_submit)) {
      state.after_submit = "message";
    }
    state.redirect_page_id = Number(state.redirect_page_id) || 0;
    delete state.min_fill_time_enabled;
    delete state.min_fill_time;
    delete state.rate_limit_enabled;
    delete state.rate_limit_max;
    delete state.rate_limit_window;
    delete state.upload_max_size_mb;
    const emit = () => onChange({ ...state });
    const textControls = {};
    const bindText = (input, key) => {
      textControls[key] = input;
      input.value = state[key] || "";
      input.addEventListener("input", () => {
        state[key] = input.value;
        emit();
      });
      return input;
    };
    const adminEmail = builderRoot.dataset.adminEmail || "";
    const fbAdminSubject = builderRoot.dataset.fallbackAdminSubject || "";
    const fbSubmit = builderRoot.dataset.fallbackSubmit || "";
    const fbSubmitClass = builderRoot.dataset.fallbackSubmitClass || "";
    const fbSuccess = builderRoot.dataset.fallbackSuccess || "";
    const fbError = builderRoot.dataset.fallbackError || "";
    const fbValidation = builderRoot.dataset.fallbackValidation || "";
    const fbRequired = builderRoot.dataset.fallbackRequired || "";
    const notifications = el("div", {
      className: "bl-forms-builder__panel",
      dataset: { blFormsPanel: "notifications" },
      hidden: true
    });
    const recipientRows = (value) => Math.max(2, String(value || "").split(/\r?\n/).length);
    const recipient = bindText(
      el("textarea", {
        className: "widefat",
        rows: String(recipientRows(state.recipient)),
        placeholder: adminEmail
      }),
      "recipient"
    );
    const syncRecipientRows = () => {
      recipient.rows = recipientRows(recipient.value);
    };
    recipient.addEventListener("input", syncRecipientRows);
    recipient.addEventListener("change", syncRecipientRows);
    const adminSubject = bindText(
      el("input", {
        type: "text",
        className: "widefat",
        placeholder: fbAdminSubject
      }),
      "admin_email_subject"
    );
    const userOptions = el("div", { className: "bl-forms-builder__notify-user-options" });
    const sendToWrap = el("div", { className: "bl-forms-builder__setting bl-forms-builder__send-to" });
    const sendToControl = el("div", { className: "bl-forms-builder__send-to-control" });
    sendToWrap.append(
      el("label", {}, [el("strong", { text: t("emailField", "Email field") })]),
      sendToControl
    );
    const fbUserSubject = builderRoot.dataset.fallbackUserSubject || "";
    const fbUserTitle = builderRoot.dataset.fallbackUserTitle || "";
    const fbUserIntro = builderRoot.dataset.fallbackUserIntro || "";
    const fbUserFooter = builderRoot.dataset.fallbackUserFooter || "";
    const userSubject = bindText(
      el("input", {
        type: "text",
        className: "widefat",
        placeholder: fbUserSubject
      }),
      "user_email_subject"
    );
    const userTitle = bindText(
      el("input", {
        type: "text",
        className: "widefat",
        placeholder: fbUserTitle
      }),
      "user_email_title"
    );
    const userIntro = bindText(
      el("textarea", {
        className: "widefat",
        rows: "3",
        placeholder: fbUserIntro
      }),
      "user_email_intro"
    );
    const userFooter = bindText(
      el("textarea", {
        className: "widefat",
        rows: "3",
        placeholder: fbUserFooter
      }),
      "user_email_footer"
    );
    const userSubjectRow = fieldRow(t("subject", "Email subject"), userSubject);
    const userTitleRow = fieldRow(
      t("emailTitle", "Email title"),
      userTitle,
      t("emailTitleHelp", "Shown as the heading inside the confirmation email.")
    );
    const userIntroRow = fieldRow(
      t("introText", "Intro text"),
      userIntro,
      t(
        "introTextHelp",
        "This text appears above the submitted form data in the email. Placeholders like {field-id} can be used."
      )
    );
    const userFooterRow = fieldRow(
      t("footerText", "Footer text"),
      userFooter,
      t(
        "footerTextHelp",
        "The placeholders {form_title} and {site_name} are supported."
      )
    );
    userOptions.append(sendToWrap, userSubjectRow, userTitleRow, userIntroRow, userFooterRow);
    const ensureSelectedEmailField = () => {
      const names = emailFields.map((field) => field.name);
      if (names.length === 0) {
        state.user_email_field = "";
        return;
      }
      if (!names.includes(state.user_email_field)) {
        state.user_email_field = names[0];
      }
    };
    const renderSendTo = () => {
      sendToControl.replaceChildren();
      ensureSelectedEmailField();
      if (emailFields.length === 0) {
        sendToControl.appendChild(
          el("div", {
            className: "bl-forms-builder__notice bl-forms-builder__notice--warning",
            role: "status",
            text: t("notifyUserHelp", "Requires an Email field on the form.")
          })
        );
        return;
      }
      if (emailFields.length === 1) {
        const only = emailFields[0];
        state.user_email_field = only.name;
        sendToControl.appendChild(
          el("span", {
            className: "bl-forms-builder__send-to-value",
            text: emailFieldLabel(only)
          })
        );
        return;
      }
      const select = el("select", { className: "widefat" });
      emailFields.forEach((field) => {
        const opt = document.createElement("option");
        opt.value = field.name;
        opt.textContent = emailFieldLabel(field);
        if (field.name === state.user_email_field) {
          opt.selected = true;
        }
        select.appendChild(opt);
      });
      select.addEventListener("change", () => {
        state.user_email_field = select.value;
        emit();
      });
      sendToControl.appendChild(select);
    };
    const notifySwitch = plainSwitch(t("notifyUser", "Enable"), {
      checked: !!state.notify_user,
      onChange: (checked) => {
        state.notify_user = checked;
        syncNotifyOptions();
        emit();
      }
    });
    const notify = notifySwitch.input;
    const syncNotifyOptions = () => {
      userOptions.hidden = !notify.checked;
      if (notify.checked) {
        renderSendTo();
      }
    };
    notifications.append(
      fieldRow(
        t("recipient", "Recipient"),
        recipient,
        t(
          "recipientHelp",
          "One email per line. Leave empty to use the site administrator email."
        )
      ),
      fieldRow(
        t("subject", "Email subject"),
        adminSubject,
        t("subjectHelp", "The placeholders {form_title} and {site_name} are replaced by the form title and site name.")
      ),
      el("hr", { className: "bl-forms-builder__separator" }),
      el("div", { className: "bl-forms-builder__section" }, [
        el("h3", {
          className: "bl-forms-builder__section-title",
          text: t("confirmationEmail", "Confirmation email")
        }),
        notifySwitch.root,
        userOptions
      ])
    );
    syncNotifyOptions();
    const settingsPanel = el("div", {
      className: "bl-forms-builder__panel",
      dataset: { blFormsPanel: "settings" },
      hidden: true
    });
    const submitLabel = bindText(
      el("input", { type: "text", className: "widefat", placeholder: fbSubmit }),
      "submit_label"
    );
    const submitButtonClass = bindText(
      el("input", {
        type: "text",
        className: "widefat",
        placeholder: fbSubmitClass
      }),
      "submit_button_class"
    );
    const success = bindText(
      el("textarea", { className: "widefat", rows: "2", placeholder: fbSuccess }),
      "success_message"
    );
    const error = bindText(
      el("textarea", { className: "widefat", rows: "2", placeholder: fbError }),
      "error_message"
    );
    const validation = bindText(
      el("textarea", { className: "widefat", rows: "2", placeholder: fbValidation }),
      "validation_message"
    );
    const requiredMsg = bindText(
      el("input", { type: "text", className: "widefat", placeholder: fbRequired }),
      "required_message"
    );
    const msgFallbacks = window.blFormsAdmin && window.blFormsAdmin.messageFallbacks || {};
    const charCountText = bindText(
      el("input", {
        type: "text",
        className: "widefat",
        placeholder: msgFallbacks.char_count || t("charCountTextDefault", "{remaining} characters remaining")
      }),
      "char_count_text"
    );
    const charCountEmptyText = bindText(
      el("input", {
        type: "text",
        className: "widefat",
        placeholder: msgFallbacks.char_count_empty || t("charCountEmptyDefault", "No characters remaining")
      }),
      "char_count_empty_text"
    );
    const bindErrorMsg = (key, fallbackKey) => bindText(
      el("input", {
        type: "text",
        className: "widefat",
        placeholder: msgFallbacks[fallbackKey] || ""
      }),
      key
    );
    const minlengthMsg = bindErrorMsg("minlength_message", "minlength");
    const maxlengthMsg = bindErrorMsg("maxlength_message", "maxlength");
    const numberMsg = bindErrorMsg("number_message", "number");
    const minMsg = bindErrorMsg("min_message", "min");
    const maxMsg = bindErrorMsg("max_message", "max");
    const emailMsg = bindErrorMsg("email_message", "email");
    const urlMsg = bindErrorMsg("url_message", "url");
    const phoneMsg = bindErrorMsg("phone_message", "phone");
    const dateMsg = bindErrorMsg("date_message", "date");
    const dateMinMsg = bindErrorMsg("date_min_message", "date_min");
    const dateMaxMsg = bindErrorMsg("date_max_message", "date_max");
    const dateBeforeMsg = bindErrorMsg("date_before_message", "date_before");
    const dateAfterMsg = bindErrorMsg("date_after_message", "date_after");
    const timeMsg = bindErrorMsg("time_message", "time");
    const timeMinMsg = bindErrorMsg("time_min_message", "time_min");
    const timeMaxMsg = bindErrorMsg("time_max_message", "time_max");
    const datetimeMsg = bindErrorMsg("datetime_message", "datetime");
    const datetimeMinMsg = bindErrorMsg("datetime_min_message", "datetime_min");
    const datetimeMaxMsg = bindErrorMsg("datetime_max_message", "datetime_max");
    const fileMsg = bindErrorMsg("file_message", "file");
    const fileTypeMsg = bindErrorMsg("file_type_message", "file_type");
    const fileSizeMsg = bindErrorMsg("file_size_message", "file_size");
    const fileMaxMsg = bindErrorMsg("file_max_message", "file_max");
    const optionMsg = bindErrorMsg("option_message", "option");
    const selectionMinMsg = bindErrorMsg("selection_min_message", "selection_min");
    const selectionMaxMsg = bindErrorMsg("selection_max_message", "selection_max");
    const rangeHelp = () => el("span", {
      className: "description bl-forms-builder__field-errors-help",
      text: t("minMaxMessageHelp", "The placeholder {limit} is replaced by the limit.")
    });
    const successRow = fieldRow(t("successMessage", "Success message"), success);
    const successPanel = el("div", {
      className: "bl-forms-builder__after-submit-message",
      hidden: state.after_submit === "redirect"
    }, [successRow]);
    const allowSaveUploads = !!(window.blFormsAdmin && window.blFormsAdmin.allowSaveUploads);
    const settingsUrl = window.blFormsAdmin && window.blFormsAdmin.uploadsSettingsUrl || window.blFormsAdmin && window.blFormsAdmin.settingsUrl || "";
    if (state.save_uploads === void 0) {
      state.save_uploads = true;
    }
    if (!allowSaveUploads) {
      state.save_uploads = false;
    }
    const saveUploadsSwitch = plainSwitch(t("saveUploads", "Save uploaded files"), {
      checked: !!state.save_uploads && allowSaveUploads,
      disabled: !allowSaveUploads,
      onChange: (checked) => {
        if (!allowSaveUploads) {
          return;
        }
        state.save_uploads = checked;
        emit();
      }
    });
    const saveUploadsNote = allowSaveUploads ? el("span", {
      className: "description",
      text: t(
        "saveUploadsHelp",
        "Uploaded files are stored securely outside the Media Library using unguessable filenames."
      )
    }) : el("div", { className: "bl-forms-builder__notice bl-forms-builder__notice--warning", role: "status" }, [
      el("span", {
        text: t(
          "saveUploadsDisabled",
          "Saving uploaded files is disabled in Forms \u2192 Settings."
        )
      }),
      settingsUrl ? el("a", {
        href: settingsUrl,
        text: t("saveUploadsOpenSettings", "Open settings"),
        className: "bl-forms-builder__notice-link"
      }) : null
    ].filter(Boolean));
    const fileSettingsBlock = el("div", {
      className: "bl-forms-builder__field-errors" + (allowSaveUploads ? "" : " bl-forms-builder__field-errors--disabled")
    }, [
      el("h3", {
        className: "bl-forms-builder__section-title",
        text: t("fileSettings", "File settings")
      }),
      el("div", { className: "bl-forms-builder__field-errors-box" }, [
        el("div", { className: "bl-forms-builder__setting" }, [
          saveUploadsSwitch.root,
          saveUploadsNote
        ])
      ])
    ]);
    const afterOptions = el("div", { className: "bl-forms-builder__after-submit" });
    const afterSelect = el("select", {
      className: "widefat",
      "aria-label": t("afterSubmit", "After submission")
    });
    [
      { id: "message", label: t("afterSubmitMessage", "Show success message") },
      { id: "redirect", label: t("afterSubmitRedirect", "Go to page") }
    ].forEach((mode) => {
      const option = el("option", { value: mode.id, text: mode.label });
      if (state.after_submit === mode.id) {
        option.selected = true;
      }
      afterSelect.appendChild(option);
    });
    const redirectPanel = el("div", {
      className: "bl-forms-builder__after-submit-redirect",
      hidden: state.after_submit !== "redirect"
    });
    const redirectSummary = el("div", { className: "bl-forms-builder__page-picker-summary" });
    const redirectPickBtn = el("button", {
      type: "button",
      className: "button bl-button-small",
      text: t("choosePage", "Choose page")
    });
    const redirectClearBtn = el("button", {
      type: "button",
      className: "button-link",
      text: t("clearPage", "Clear"),
      hidden: !state.redirect_page_id
    });
    const redirectActions = el("div", { className: "bl-forms-builder__page-picker-actions" }, [
      redirectPickBtn,
      redirectClearBtn
    ]);
    const redirectRow = el("div", { className: "bl-forms-builder__page-picker-row" }, [
      redirectSummary,
      redirectActions
    ]);
    const syncAfterSubmitUi = () => {
      const isRedirect = state.after_submit === "redirect";
      redirectPanel.hidden = !isRedirect;
      successPanel.hidden = isRedirect;
      afterSelect.value = state.after_submit === "redirect" ? "redirect" : "message";
      redirectSummary.replaceChildren();
      if (state.redirect_page_id) {
        const title = state.redirect_page_title || t("selectedPage", "Selected page") + " #" + state.redirect_page_id;
        redirectSummary.appendChild(
          el("span", {
            className: "bl-forms-builder__page-picker-value",
            text: title
          })
        );
        if (state.redirect_page_url) {
          redirectSummary.appendChild(
            el("span", {
              className: "description bl-forms-builder__page-picker-url",
              text: state.redirect_page_url,
              title: state.redirect_page_url
            })
          );
        }
      } else {
        redirectSummary.appendChild(
          el("span", {
            className: "description",
            text: t("choosePageHelp", "Select the page visitors should land on.")
          })
        );
      }
      redirectClearBtn.hidden = !state.redirect_page_id;
      redirectPickBtn.textContent = state.redirect_page_id ? t("changePage", "Change page") : t("choosePage", "Choose page");
    };
    afterSelect.addEventListener("change", () => {
      state.after_submit = afterSelect.value === "redirect" ? "redirect" : "message";
      syncAfterSubmitUi();
      emit();
    });
    redirectPickBtn.addEventListener("click", async () => {
      const cfg = window.blFormsAdmin || {};
      const page = await openPagePicker({
        selectedId: state.redirect_page_id || 0,
        title: t("pagePickerTitle", "Select a page"),
        searchPlaceholder: t("pagePickerSearch", "Search pages\u2026"),
        empty: t("pagePickerEmpty", "No pages found."),
        loading: t("pagePickerLoading", "Loading\u2026"),
        cancelLabel: t("cancel", "Cancel"),
        selectLabel: t("selectPage", "Select"),
        restUrl: cfg.pagesRestUrl || "",
        restNonce: cfg.restNonce || ""
      });
      if (!page) {
        return;
      }
      state.redirect_page_id = page.id;
      state.redirect_page_title = page.title;
      state.redirect_page_url = page.url;
      syncAfterSubmitUi();
      emit();
    });
    redirectClearBtn.addEventListener("click", () => {
      state.redirect_page_id = 0;
      state.redirect_page_title = "";
      state.redirect_page_url = "";
      syncAfterSubmitUi();
      emit();
    });
    redirectPanel.append(redirectRow);
    afterOptions.append(
      fieldRow(t("afterSubmit", "After submission"), afterSelect),
      redirectPanel
    );
    const boot = window.blFormsAdmin || {};
    if (state.redirect_page_id && boot.redirectPage && Number(boot.redirectPage.id) === state.redirect_page_id) {
      state.redirect_page_title = boot.redirectPage.title || "";
      state.redirect_page_url = boot.redirectPage.url || "";
    }
    syncAfterSubmitUi();
    settingsPanel.append(
      fieldRow(t("submitLabel", "Submit button label"), submitLabel),
      fieldRow(
        t("submitButtonClass", "Submit button classes"),
        submitButtonClass,
        t(
          "submitButtonClassHelp",
          "Extra CSS classes for the submit button (space-separated), e.g. button -primary."
        )
      ),
      afterOptions,
      successPanel,
      fieldRow(t("errorMessage", "Error message"), error),
      fieldRow(t("validationMessage", "Validation message"), validation),
      fileSettingsBlock
    );
    const validationPanel = el("div", {
      className: "bl-forms-builder__panel",
      dataset: { blFormsPanel: "validation" },
      hidden: true
    });
    const messagesSettingsUrl = window.blFormsAdmin && window.blFormsAdmin.messagesSettingsUrl || window.blFormsAdmin && window.blFormsAdmin.settingsUrl || "";
    const validationIntro = el("div", { className: "bl-forms-builder__panel-intro" }, [
      el("p", {
        className: "description",
        text: t(
          "validationPanelHelp",
          "These settings apply to this form only."
        )
      })
    ]);
    if (messagesSettingsUrl) {
      validationIntro.appendChild(
        el("p", { className: "description" }, [
          el("span", {
            text: t("validationPanelHelpGlobal", "You can also set them globally in") + " "
          }),
          el("a", {
            href: messagesSettingsUrl,
            text: t("validationPanelHelpLink", "Forms \u2192 Settings")
          }),
          el("span", { text: "." })
        ])
      );
    }
    validationPanel.append(
      validationIntro,
      errorSection(t("requiredError", "Required"), [requiredMsg]),
      errorSection(t("charCountSection", "Character count"), [
        fieldRow(
          t("charCountText", "Character count text"),
          charCountText,
          t("charCountTextHelp", "The placeholders {remaining}, {count}, and {max} are replaced by the remaining count, current count, and maximum.")
        ),
        fieldRow(t("charCountEmptyText", "When limit is reached"), charCountEmptyText)
      ]),
      errorSection(t("textError", "Text"), [
        fieldRow(t("minLengthError", "Min length"), minlengthMsg),
        fieldRow(t("maxLengthError", "Max length"), maxlengthMsg),
        rangeHelp()
      ]),
      errorSection(t("numberError", "Number"), [
        fieldRow(t("invalidError", "Invalid"), numberMsg),
        fieldRow(t("minError", "Minimum"), minMsg),
        fieldRow(t("maxError", "Maximum"), maxMsg),
        rangeHelp()
      ]),
      errorSection(t("emailError", "Email"), [emailMsg]),
      errorSection(t("urlError", "URL"), [urlMsg]),
      errorSection(t("phoneError", "Phone"), [phoneMsg]),
      errorSection(t("dateError", "Date"), [
        fieldRow(t("invalidError", "Invalid"), dateMsg),
        fieldRow(t("minError", "Minimum"), dateMinMsg),
        fieldRow(t("maxError", "Maximum"), dateMaxMsg),
        rangeHelp(),
        fieldRow(t("dateBeforeError", "Before related field"), dateBeforeMsg),
        fieldRow(t("dateAfterError", "After related field"), dateAfterMsg),
        el("span", {
          className: "description bl-forms-builder__field-errors-help",
          text: t(
            "dateRelationMessageHelp",
            "The placeholder {field} is replaced by the related field label."
          )
        })
      ]),
      errorSection(t("timeError", "Time"), [
        fieldRow(t("invalidError", "Invalid"), timeMsg),
        fieldRow(t("minError", "Minimum"), timeMinMsg),
        fieldRow(t("maxError", "Maximum"), timeMaxMsg),
        rangeHelp()
      ]),
      errorSection(t("datetimeError", "Date & time"), [
        fieldRow(t("invalidError", "Invalid"), datetimeMsg),
        fieldRow(t("minError", "Minimum"), datetimeMinMsg),
        fieldRow(t("maxError", "Maximum"), datetimeMaxMsg),
        rangeHelp()
      ]),
      errorSection(t("fileError", "File"), [
        fieldRow(t("invalidError", "Invalid"), fileMsg),
        fieldRow(
          t("fileTypeError", "Wrong file type"),
          fileTypeMsg,
          t("fileTypeErrorHelp", "The placeholder {types} is replaced by the allowed file types.")
        ),
        fieldRow(
          t("fileSizeError", "File too large"),
          fileSizeMsg,
          t("fileSizeErrorHelp", "The placeholder {size} is replaced by the maximum size.")
        ),
        fieldRow(
          t("fileMaxError", "Too many files"),
          fileMaxMsg,
          t("fileMaxErrorHelp", "The placeholder {max} is replaced by the maximum number of files.")
        )
      ]),
      errorSection(t("optionError", "Choice"), [
        fieldRow(t("invalidError", "Invalid"), optionMsg),
        fieldRow(
          t("selectionMinError", "Minimum selections"),
          selectionMinMsg,
          t(
            "selectionMinErrorHelp",
            "The placeholder {min} is replaced by the minimum number of options."
          )
        ),
        fieldRow(
          t("selectionMaxError", "Maximum selections"),
          selectionMaxMsg,
          t(
            "selectionMaxErrorHelp",
            "The placeholder {max} is replaced by the maximum number of options."
          )
        )
      ])
    );
    return {
      notifications,
      settings: settingsPanel,
      validation: validationPanel,
      getSettings: () => {
        const next = { ...state };
        delete next.redirect_page_title;
        delete next.redirect_page_url;
        delete next.min_fill_time_enabled;
        delete next.min_fill_time;
        delete next.rate_limit_enabled;
        delete next.rate_limit_max;
        delete next.rate_limit_window;
        delete next.upload_max_size_mb;
        if (!(window.blFormsAdmin && window.blFormsAdmin.allowSaveUploads)) {
          next.save_uploads = false;
        }
        return next;
      },
      applySettings(partial = {}) {
        const incoming = partial && typeof partial === "object" ? partial : {};
        Object.assign(state, incoming);
        delete state.min_fill_time_enabled;
        delete state.min_fill_time;
        delete state.rate_limit_enabled;
        delete state.rate_limit_max;
        delete state.rate_limit_window;
        delete state.upload_max_size_mb;
        if (!state.after_submit || !["message", "redirect"].includes(state.after_submit)) {
          state.after_submit = "message";
        }
        state.redirect_page_id = Number(state.redirect_page_id) || 0;
        if (!allowSaveUploads) {
          state.save_uploads = false;
        }
        Object.entries(textControls).forEach(([key, input]) => {
          if (Object.prototype.hasOwnProperty.call(incoming, key)) {
            input.value = state[key] || "";
          }
        });
        syncRecipientRows();
        if (Object.prototype.hasOwnProperty.call(incoming, "notify_user")) {
          notify.checked = !!state.notify_user;
          syncNotifyOptions();
        } else if (Object.prototype.hasOwnProperty.call(incoming, "user_email_field")) {
          if (notify.checked) {
            renderSendTo();
          } else {
            ensureSelectedEmailField();
          }
        }
        if (Object.prototype.hasOwnProperty.call(incoming, "save_uploads") && allowSaveUploads) {
          saveUploadsSwitch.input.checked = !!state.save_uploads;
        }
        if (Object.prototype.hasOwnProperty.call(incoming, "after_submit") || Object.prototype.hasOwnProperty.call(incoming, "redirect_page_id")) {
          syncAfterSubmitUi();
        }
        emit();
      },
      syncFields(fields) {
        emailFields = emailFieldsFromList(fields);
        if (notify.checked) {
          const before = state.user_email_field || "";
          renderSendTo();
          if ((state.user_email_field || "") !== before) {
            emit();
          }
        } else {
          ensureSelectedEmailField();
        }
      }
    };
  }

  // themes/baselayer/packages/baselayer-forms/src/js/admin/import-export.js
  var FORMAT = "baselayer-form";
  var FORMAT_LEGACY = "baselayer-form-fields";
  var VERSION = 2;
  var SETTINGS_EXPORT_SKIP = /* @__PURE__ */ new Set([
    "honeypot_name",
    "redirect_page_title",
    "redirect_page_url",
    "min_fill_time_enabled",
    "min_fill_time",
    "rate_limit_enabled",
    "rate_limit_max",
    "rate_limit_window",
    "upload_max_size_mb"
  ]);
  function pickExportSettings(settings) {
    const out = {};
    Object.entries(settings || {}).forEach(([key, value]) => {
      if (SETTINGS_EXPORT_SKIP.has(key)) {
        return;
      }
      if (typeof value === "string") {
        if (value.trim() !== "") {
          out[key] = value;
        }
        return;
      }
      if (typeof value === "boolean") {
        out[key] = value;
        return;
      }
      if (typeof value === "number" && value !== 0) {
        out[key] = value;
      }
    });
    return out;
  }
  function extractFieldsFromImport(data) {
    if (Array.isArray(data)) {
      return data;
    }
    if (!data || typeof data !== "object") {
      return null;
    }
    if (Array.isArray(data.fields)) {
      return data.fields;
    }
    return null;
  }
  function extractSettingsFromImport(data) {
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      return {};
    }
    if (!data.settings || typeof data.settings !== "object" || Array.isArray(data.settings)) {
      return {};
    }
    return pickExportSettings(data.settings);
  }
  function downloadFormExport(fields, settings = {}) {
    const exportedSettings = pickExportSettings(settings);
    const payload = {
      format: FORMAT,
      version: VERSION,
      exported_at: (/* @__PURE__ */ new Date()).toISOString(),
      fields: fields || []
    };
    if (Object.keys(exportedSettings).length > 0) {
      payload.settings = exportedSettings;
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const titleInput = document.getElementById("title");
    const raw = titleInput && titleInput.value.trim() || document.querySelector("#title-prompt-text")?.textContent?.trim() || "form";
    const slug = raw.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "form";
    a.href = url;
    a.download = `${slug}-form.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }
  function openImportConfirmModal(fields, settings, onConfirm) {
    document.querySelectorAll(".bl-forms-builder__modal").forEach((node) => node.remove());
    const hasSettings = Object.keys(settings || {}).length > 0;
    const title = hasSettings ? t("importOverwriteTitleWithSettings", "Import form?") : t("importOverwriteTitle", "Import fields?");
    const backdrop = el("div", {
      className: "bl-forms-builder__modal",
      role: "dialog",
      "aria-modal": "true",
      "aria-label": title
    });
    const close = () => {
      document.removeEventListener("keydown", onKey);
      backdrop.remove();
    };
    const apply = () => {
      onConfirm(fields, settings || {});
      close();
    };
    const onKey = (evt) => {
      if (evt.key === "Escape") {
        close();
      }
    };
    document.addEventListener("keydown", onKey);
    backdrop.addEventListener("click", (evt) => {
      if (evt.target === backdrop) {
        close();
      }
    });
    const dialog = el("div", { className: "bl-forms-builder__modal-dialog" });
    const header = el("div", { className: "bl-forms-builder__modal-header" }, [
      el("h2", {
        className: "bl-forms-builder__modal-title",
        text: title
      })
    ]);
    const body = el("div", { className: "bl-forms-builder__modal-body" }, [
      el("p", {
        text: hasSettings ? t(
          "importOverwriteMessageWithSettings",
          "Importing will overwrite all existing fields on this form and apply any messages, subjects, and other texts included in the file. This cannot be undone until you save or discard."
        ) : t(
          "importOverwriteMessage",
          "Importing will overwrite all existing fields on this form. Settings (emails, messages) are not changed because this file does not include them. This cannot be undone until you save or discard."
        )
      })
    ]);
    const footer = el("div", { className: "bl-forms-builder__modal-footer" }, [
      el("button", {
        type: "button",
        className: "button",
        text: t("cancel", "Cancel"),
        onClick: close
      }),
      el("button", {
        type: "button",
        className: "button button-primary",
        text: hasSettings ? t("importOverwriteConfirmWithSettings", "Overwrite form") : t("importOverwriteConfirm", "Overwrite fields"),
        onClick: apply
      })
    ]);
    dialog.append(header, body, footer);
    backdrop.appendChild(dialog);
    document.body.appendChild(backdrop);
  }
  function isValidImportPayload(data) {
    if (Array.isArray(data)) {
      return true;
    }
    if (!data || typeof data !== "object") {
      return false;
    }
    if (data.format && data.format !== FORMAT && data.format !== FORMAT_LEGACY) {
      return false;
    }
    return Array.isArray(data.fields);
  }
  function bindImportExport(canvas, panels = null) {
    const exportBtn = document.querySelector("[data-bl-forms-export]");
    const importBtn = document.querySelector("[data-bl-forms-import]");
    if (!exportBtn && !importBtn) {
      return;
    }
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "application/json,.json";
    fileInput.hidden = true;
    document.body.appendChild(fileInput);
    exportBtn?.addEventListener("click", () => {
      const fields = typeof canvas.getFields === "function" ? canvas.getFields() : readConfig().fields || [];
      const settings = typeof panels?.getSettings === "function" ? panels.getSettings() : readConfig().settings || {};
      downloadFormExport(fields, settings);
    });
    importBtn?.addEventListener("click", () => {
      fileInput.value = "";
      fileInput.click();
    });
    fileInput.addEventListener("change", () => {
      const file = fileInput.files?.[0];
      if (!file) {
        return;
      }
      const reader = new FileReader();
      reader.onerror = () => {
        window.alert(t("importReadError", "Could not read the selected file."));
      };
      reader.onload = () => {
        let parsed;
        try {
          parsed = JSON.parse(String(reader.result || ""));
        } catch (e) {
          window.alert(t("importInvalid", "This file is not a valid form export."));
          return;
        }
        if (!isValidImportPayload(parsed)) {
          window.alert(t("importInvalid", "This file is not a valid form export."));
          return;
        }
        const fields = extractFieldsFromImport(parsed);
        if (!fields) {
          window.alert(t("importInvalid", "This file is not a valid form export."));
          return;
        }
        const settings = extractSettingsFromImport(parsed);
        openImportConfirmModal(fields, settings, (nextFields, nextSettings) => {
          canvas.replaceFields(nextFields);
          if (nextSettings && Object.keys(nextSettings).length > 0 && typeof panels?.applySettings === "function") {
            panels.applySettings(nextSettings);
          }
        });
      };
      reader.readAsText(file);
    });
  }

  // themes/baselayer/packages/baselayer-forms/src/js/admin/templates.js
  function makeField(partial) {
    const type = partial.type || "text";
    const label = partial.label != null ? String(partial.label) : "";
    const id = uid();
    const field = {
      id,
      type,
      label,
      name: slugifyName(partial.name || label || type),
      name_manual: true,
      hide_label: !!partial.hide_label,
      active: true,
      required: !!partial.required,
      placeholder: partial.placeholder || "",
      description: partial.description || "",
      width: partial.width || "100",
      width_custom: "",
      css_class: ""
    };
    if (partial.show_in_list !== void 0) {
      field.show_in_list = !!partial.show_in_list;
    }
    if (type === "textarea") {
      field.rows = partial.rows || 5;
    }
    if (type === "terms") {
      field.hide_label = partial.hide_label !== false;
      field.content = partial.content || t("termsDefaultLabel", "I agree to the [Privacy Policy](page:privacy).");
      field.default_value = "";
      if (!label) {
        field.label = t("termsDefaultFieldLabel", "Privacy Policy");
        field.name = slugifyName(field.label);
      }
    }
    if (type === "file" || type === "image") {
      field.multiple = false;
      field.preview = true;
      field.upload_style = "modern";
      field.extensions = partial.extensions != null ? String(partial.extensions) : type === "image" ? "jpg, jpeg, png, webp, gif, heic, avif" : "pdf, doc, docx";
      if (partial.button_text != null) {
        field.button_text = String(partial.button_text);
      }
    }
    if (type === "section") {
      return {
        id,
        type: "section",
        label,
        width: partial.width || "100",
        width_custom: "",
        design: partial.design || "card",
        children: Array.isArray(partial.children) ? partial.children : []
      };
    }
    return field;
  }
  function consentField() {
    return makeField({
      type: "terms",
      required: true,
      label: t("termsDefaultFieldLabel", "Privacy Policy")
    });
  }
  function getStarterTemplates() {
    return [
      {
        id: "contact",
        label: t("templateContact", "Contact Form"),
        settings: () => ({
          submit_label: t("templateSubmitContact", "Send message"),
          user_email_field: "email"
        }),
        fields: () => [
          makeField({
            type: "text",
            label: t("templateFieldName", "Name"),
            name: "name",
            required: true,
            width: "50",
            placeholder: t("templatePlaceholderName", "Jane Doe"),
            show_in_list: true
          }),
          makeField({
            type: "email",
            label: t("templateFieldEmail", "Email"),
            name: "email",
            required: true,
            width: "50",
            placeholder: "name@example.com",
            show_in_list: true
          }),
          makeField({
            type: "text",
            label: t("templateFieldSubject", "Subject"),
            name: "subject",
            placeholder: t("templatePlaceholderSubject", "How can we help?")
          }),
          makeField({
            type: "textarea",
            label: t("templateFieldMessage", "Message"),
            name: "message",
            required: true,
            rows: 5,
            placeholder: t("templatePlaceholderMessage", "Tell us a bit more\u2026")
          }),
          consentField()
        ]
      },
      {
        id: "newsletter",
        label: t("templateNewsletter", "Newsletter Signup"),
        settings: () => ({
          submit_label: t("templateSubmitSubscribe", "Subscribe"),
          user_email_field: "email"
        }),
        fields: () => [
          makeField({
            type: "section",
            label: t("templateNewsletterSection", "Sign up to our Newsletter"),
            design: "card",
            children: [
              makeField({
                type: "text",
                label: t("templateFieldName", "Name"),
                name: "name",
                required: true,
                placeholder: t("templatePlaceholderName", "Jane Doe"),
                show_in_list: true
              }),
              makeField({
                type: "email",
                label: t("templateFieldEmail", "Email"),
                name: "email",
                required: true,
                placeholder: "name@example.com",
                show_in_list: true
              }),
              consentField()
            ]
          })
        ]
      },
      {
        id: "job",
        label: t("templateJob", "Job Application"),
        settings: () => ({
          submit_label: t("templateSubmitApplication", "Submit Application"),
          user_email_field: "email"
        }),
        fields: () => [
          makeField({
            type: "text",
            label: t("templateFieldFullName", "Full name"),
            name: "full_name",
            required: true,
            placeholder: t("templatePlaceholderName", "Jane Doe"),
            show_in_list: true
          }),
          makeField({
            type: "email",
            label: t("templateFieldEmail", "Email"),
            name: "email",
            required: true,
            placeholder: "name@example.com",
            show_in_list: true
          }),
          makeField({
            type: "file",
            label: t("templateFieldCv", "CV / R\xE9sum\xE9"),
            name: "cv",
            required: true,
            extensions: "pdf, doc, docx"
          }),
          makeField({
            type: "textarea",
            label: t("templateFieldMessage", "Message"),
            name: "message",
            rows: 4,
            placeholder: t("templatePlaceholderCover", "A short note about your application\u2026")
          }),
          consentField()
        ]
      }
    ];
  }
  function openSimpleModal(title, message, options = {}) {
    document.querySelectorAll(".bl-forms-builder__modal").forEach((node) => node.remove());
    const backdrop = el("div", {
      className: "bl-forms-builder__modal",
      role: "dialog",
      "aria-modal": "true",
      "aria-label": title
    });
    const close = () => {
      document.removeEventListener("keydown", onKey);
      backdrop.remove();
    };
    const onKey = (evt) => {
      if (evt.key === "Escape") {
        close();
      }
    };
    document.addEventListener("keydown", onKey);
    backdrop.addEventListener("click", (evt) => {
      if (evt.target === backdrop) {
        close();
      }
    });
    const footerChildren = [
      el("button", {
        type: "button",
        className: "button",
        text: options.onConfirm ? t("cancel", "Cancel") : t("templatePremiumClose", "Got it"),
        onClick: close
      })
    ];
    if (options.onConfirm) {
      footerChildren.push(
        el("button", {
          type: "button",
          className: "button button-primary",
          text: options.confirmLabel || t("apply", "Apply"),
          onClick: () => {
            options.onConfirm();
            close();
          }
        })
      );
    }
    const dialog = el("div", { className: "bl-forms-builder__modal-dialog" });
    dialog.append(
      el("div", { className: "bl-forms-builder__modal-header" }, [
        el("h2", { className: "bl-forms-builder__modal-title", text: title })
      ]),
      el("div", { className: "bl-forms-builder__modal-body" }, [el("p", { text: message })]),
      el("div", { className: "bl-forms-builder__modal-footer" }, footerChildren)
    );
    backdrop.appendChild(dialog);
    document.body.appendChild(backdrop);
  }
  function templateButton(label, onClick) {
    const caret = iconEl("caret", "bl-forms-templates__caret");
    if (!caret.innerHTML) {
      caret.textContent = "\u2039";
    }
    return el(
      "button",
      {
        type: "button",
        className: "button bl-button-small bl-forms-templates__btn",
        onClick
      },
      [caret, el("span", { className: "bl-forms-templates__btn-label", text: label })]
    );
  }
  function bindTemplates(canvas, panels) {
    const root = document.querySelector("[data-bl-forms-templates]");
    if (!root || typeof canvas.replaceFields !== "function") {
      return;
    }
    root.replaceChildren();
    const list = el("div", { className: "bl-forms-templates__list" });
    getStarterTemplates().forEach((tpl) => {
      list.appendChild(
        templateButton(tpl.label, () => {
          openSimpleModal(
            t("templateApplyTitle", "Apply template?"),
            t(
              "templateApplyMessage",
              "Applying this template will overwrite all existing fields on this form. Other settings stay as they are, except the submit button label when the template defines one."
            ),
            {
              confirmLabel: t("templateApplyConfirm", "Apply template"),
              onConfirm: () => {
                canvas.replaceFields(tpl.fields());
                if (typeof tpl.settings === "function" && typeof panels?.applySettings === "function") {
                  panels.applySettings(tpl.settings());
                }
              }
            }
          );
        })
      );
    });
    const premium = el(
      "button",
      {
        type: "button",
        className: "button bl-button-small bl-forms-templates__premium",
        onClick: () => {
          openSimpleModal(
            t("templatePremiumTitle", "Premium templates"),
            t(
              "templatePremiumMessage",
              "A library of premium form templates is in development. Licensed Pro users will be able to browse and import polished templates from the cloud \u2013 including advanced layouts and optional styling packs."
            )
          );
        }
      },
      [el("span", { text: t("templatePremium", "More templates\u2026") })]
    );
    root.append(list, premium);
  }

  // themes/baselayer/packages/baselayer-forms/src/js/admin/app.js
  function expandLegacyGroups(fields) {
    const out = [];
    (fields || []).forEach((field) => {
      if ((field?.type || "") === "group") {
        (field.children || []).forEach((child) => {
          if ((child?.type || "") === "column") {
            out.push(child);
          }
        });
        return;
      }
      out.push(field);
    });
    return out;
  }
  function mountApp(root, initial) {
    const Builder = window.BlCanvasBuilder;
    if (!Builder || typeof Builder.mount !== "function") {
      root.textContent = "Canvas builder failed to load.";
      return;
    }
    root.replaceChildren();
    root.classList.add("bl-forms-builder--tabs");
    let settingsState = { ...initial.settings || {} };
    let builderApi = null;
    const syncAll = () => {
      const fields = builderApi ? builderApi.getFields() : [];
      panels.syncFields(fields);
      writeConfig({
        fields,
        settings: panels.getSettings()
      });
      builderApi?.canvas?.syncEmpty?.();
    };
    const panels = createPanels(settingsState, root, (next) => {
      settingsState = next;
      syncAll();
    });
    const fieldsPanel = el("div", {
      className: "bl-forms-builder__panel is-active",
      dataset: { blFormsPanel: "fields" }
    });
    const prepareField = (typeOrData) => {
      const data = typeof typeOrData === "string" ? defaultField(typeOrData) : { ...typeOrData };
      if (data.name != null && data.name_manual === false) {
        data.name = uniqueFieldName(data.label || data.name || data.type || "field", data.id || "");
      } else if (data.name) {
        data.name = uniqueFieldName(data.name, data.id || "");
      }
      return data;
    };
    builderApi = Builder.mount(fieldsPanel, {
      replaceRoot: false,
      // Keep a single .bl-forms-builder on the outer shell; ns only prefixes children.
      addRootClass: false,
      ns: "bl-forms-builder",
      groupName: "bl-forms-fields",
      items: initial.fields || [],
      sections: PALETTE_SECTIONS,
      heading: t("canvasHeading", "Form"),
      emptyText: t("empty", "Drag a field here, or click a template to add it."),
      handleSelector: ".bl-forms-builder__handle",
      draggableSelector: ".bl-forms-builder__field, .bl-forms-builder__template",
      templateClass: "bl-forms-builder__template",
      itemAttr: "data-bl-forms-field",
      icons: window.blFormsAdmin && window.blFormsAdmin.icons || {},
      t,
      typeLabel: (type) => {
        const dict = window.blFormsAdmin && window.blFormsAdmin.i18n || {};
        return dict.types && dict.types[type] || type;
      },
      normalizeItems: expandLegacyGroups,
      prepareItem: prepareField,
      createItem: (data, open) => createFieldCard(data, open),
      serializeItem: serializeRow,
      onItemMounted: (card, list) => {
        if ((card.dataset.fieldType || "") === "column") {
          equalizeColumnRun(list, card);
        }
      },
      onChange: () => {
        syncAll();
      }
    });
    const canvas = {
      root: builderApi.canvas.root,
      addField: (...args) => builderApi.addField(...args),
      replaceFields: (...args) => builderApi.setFields(...args),
      getFields: () => builderApi.getFields(),
      syncEmpty: () => builderApi.canvas.syncEmpty()
    };
    const tabBar = el("nav", { className: "bl-forms-builder__tabs", role: "tablist" });
    const tabs = [
      { id: "fields", label: t("tabFields", "Fields"), panel: fieldsPanel },
      { id: "notifications", label: t("tabNotifications", "Notifications"), panel: panels.notifications },
      { id: "settings", label: t("tabSettings", "Settings"), panel: panels.settings },
      { id: "validation", label: t("tabValidation", "Validation"), panel: panels.validation }
    ];
    const activate = (id) => {
      tabs.forEach((tab) => {
        const active = tab.id === id;
        tab.button.classList.toggle("is-active", active);
        tab.button.setAttribute("aria-selected", active ? "true" : "false");
        tab.panel.hidden = !active;
        tab.panel.classList.toggle("is-active", active);
      });
    };
    tabs.forEach((tab, index) => {
      tab.button = el("button", {
        type: "button",
        className: "bl-forms-builder__tab" + (index === 0 ? " is-active" : ""),
        role: "tab",
        text: tab.label,
        dataset: { blFormsTab: tab.id },
        onClick: () => activate(tab.id)
      });
      tab.button.setAttribute("aria-selected", index === 0 ? "true" : "false");
      tabBar.appendChild(tab.button);
    });
    let fullscreen = false;
    const setFullscreen = (next) => {
      fullscreen = !!next;
      root.classList.toggle("is-fullscreen", fullscreen);
      document.body.classList.toggle("bl-forms-builder-fullscreen", fullscreen);
      const label = fullscreen ? t("fullscreenExit", "Exit fullscreen") : t("fullscreenEnter", "Fullscreen");
      fullscreenBtn.title = label;
      fullscreenBtn.setAttribute("aria-label", label);
      fullscreenBtn.setAttribute("aria-pressed", fullscreen ? "true" : "false");
      fullscreenBtn.replaceChildren();
      const icon = iconEl(fullscreen ? "fullscreenExit" : "fullscreen");
      if (icon.innerHTML) {
        fullscreenBtn.appendChild(icon);
      } else {
        fullscreenBtn.textContent = fullscreen ? "\u2715" : "\u26F6";
      }
      if (fullscreen) {
        document.addEventListener("keydown", onFullscreenKey);
      } else {
        document.removeEventListener("keydown", onFullscreenKey);
      }
    };
    const onFullscreenKey = (evt) => {
      if (evt.key === "Escape" && fullscreen) {
        evt.preventDefault();
        setFullscreen(false);
      }
    };
    const fullscreenBtn = el("button", {
      type: "button",
      className: "bl-forms-builder__icon-btn bl-forms-builder__fullscreen-btn",
      title: t("fullscreenEnter", "Fullscreen"),
      "aria-label": t("fullscreenEnter", "Fullscreen"),
      "aria-pressed": "false",
      onClick: () => setFullscreen(!fullscreen)
    });
    const enterIcon = iconEl("fullscreen");
    if (enterIcon.innerHTML) {
      fullscreenBtn.appendChild(enterIcon);
    } else {
      fullscreenBtn.textContent = "\u26F6";
    }
    tabBar.appendChild(fullscreenBtn);
    const panelsWrap = el("div", { className: "bl-forms-builder__panels" }, [
      fieldsPanel,
      panels.notifications,
      panels.settings,
      panels.validation
    ]);
    root.append(
      el("div", { className: "bl-forms-builder__scroll" }, [
        el("div", { className: "bl-forms-builder__scroll-inner" }, [tabBar, panelsWrap])
      ])
    );
    const form = root.closest("form");
    if (form) {
      form.addEventListener("submit", syncAll);
    }
    root.addEventListener("input", syncAll);
    root.addEventListener("change", syncAll);
    document.addEventListener("bl-forms-builder-changed", syncAll);
    bindImportExport(canvas, panels);
    bindTemplates(canvas, panels);
    syncAll();
  }

  // themes/baselayer/packages/baselayer-forms/src/js/admin.js
  document.addEventListener("DOMContentLoaded", () => {
    const root = document.querySelector("[data-bl-forms-builder]");
    const input = document.getElementById("bl-forms-config-json");
    if (!root || !input) return;
    let initial = { fields: [], settings: {} };
    try {
      initial = JSON.parse(input.value || "{}") || initial;
    } catch (e) {
    }
    mountApp(root, initial);
  });
})();
//# sourceMappingURL=forms-admin.js.map
