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

  // themes/baselayer/packages/baselayer-forms/src/js/admin/panels.js
  var { el, t, flattenFields, iconEl } = window.BlFormBuilder || {};
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
  var { el: el2, t: t2, readConfig } = window.BlFormBuilder || {};
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
    const title = hasSettings ? t2("importOverwriteTitleWithSettings", "Import form?") : t2("importOverwriteTitle", "Import fields?");
    const backdrop = el2("div", {
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
    const dialog = el2("div", { className: "bl-forms-builder__modal-dialog" });
    const header = el2("div", { className: "bl-forms-builder__modal-header" }, [
      el2("h2", {
        className: "bl-forms-builder__modal-title",
        text: title
      })
    ]);
    const body = el2("div", { className: "bl-forms-builder__modal-body" }, [
      el2("p", {
        text: hasSettings ? t2(
          "importOverwriteMessageWithSettings",
          "Importing will overwrite all existing fields on this form and apply any messages, subjects, and other texts included in the file. This cannot be undone until you save or discard."
        ) : t2(
          "importOverwriteMessage",
          "Importing will overwrite all existing fields on this form. Settings (emails, messages) are not changed because this file does not include them. This cannot be undone until you save or discard."
        )
      })
    ]);
    const footer = el2("div", { className: "bl-forms-builder__modal-footer" }, [
      el2("button", {
        type: "button",
        className: "button",
        text: t2("cancel", "Cancel"),
        onClick: close
      }),
      el2("button", {
        type: "button",
        className: "button button-primary",
        text: hasSettings ? t2("importOverwriteConfirmWithSettings", "Overwrite form") : t2("importOverwriteConfirm", "Overwrite fields"),
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
        window.alert(t2("importReadError", "Could not read the selected file."));
      };
      reader.onload = () => {
        let parsed;
        try {
          parsed = JSON.parse(String(reader.result || ""));
        } catch (e) {
          window.alert(t2("importInvalid", "This file is not a valid form export."));
          return;
        }
        if (!isValidImportPayload(parsed)) {
          window.alert(t2("importInvalid", "This file is not a valid form export."));
          return;
        }
        const fields = extractFieldsFromImport(parsed);
        if (!fields) {
          window.alert(t2("importInvalid", "This file is not a valid form export."));
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
  var { el: el3, t: t3, uid, slugifyName } = window.BlFormBuilder || {};
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
      field.content = partial.content || t3("termsDefaultLabel", "I agree to the [Privacy Policy](page:privacy).");
      field.default_value = "";
      if (!label) {
        field.label = t3("termsDefaultFieldLabel", "Privacy Policy");
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
        show_title: partial.show_title !== false,
        css_class: typeof partial.css_class === "string" ? partial.css_class : "",
        children: Array.isArray(partial.children) ? partial.children : []
      };
    }
    return field;
  }
  function consentField() {
    return makeField({
      type: "terms",
      required: true,
      label: t3("termsDefaultFieldLabel", "Privacy Policy")
    });
  }
  function getStarterTemplates() {
    return [
      {
        id: "contact",
        label: t3("templateContact", "Contact Form"),
        settings: () => ({
          submit_label: t3("templateSubmitContact", "Send message"),
          user_email_field: "email"
        }),
        fields: () => [
          makeField({
            type: "text",
            label: t3("templateFieldName", "Name"),
            name: "name",
            required: true,
            width: "50",
            placeholder: t3("templatePlaceholderName", "Jane Doe"),
            show_in_list: true
          }),
          makeField({
            type: "email",
            label: t3("templateFieldEmail", "Email"),
            name: "email",
            required: true,
            width: "50",
            placeholder: "name@example.com",
            show_in_list: true
          }),
          makeField({
            type: "text",
            label: t3("templateFieldSubject", "Subject"),
            name: "subject",
            placeholder: t3("templatePlaceholderSubject", "How can we help?")
          }),
          makeField({
            type: "textarea",
            label: t3("templateFieldMessage", "Message"),
            name: "message",
            required: true,
            rows: 5,
            placeholder: t3("templatePlaceholderMessage", "Tell us a bit more\u2026")
          }),
          consentField()
        ]
      },
      {
        id: "newsletter",
        label: t3("templateNewsletter", "Newsletter Signup"),
        settings: () => ({
          submit_label: t3("templateSubmitSubscribe", "Subscribe"),
          user_email_field: "email"
        }),
        fields: () => [
          makeField({
            type: "section",
            label: t3("templateNewsletterSection", "Sign up to our Newsletter"),
            design: "card",
            children: [
              makeField({
                type: "text",
                label: t3("templateFieldName", "Name"),
                name: "name",
                required: true,
                placeholder: t3("templatePlaceholderName", "Jane Doe"),
                show_in_list: true
              }),
              makeField({
                type: "email",
                label: t3("templateFieldEmail", "Email"),
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
        label: t3("templateJob", "Job Application"),
        settings: () => ({
          submit_label: t3("templateSubmitApplication", "Submit Application"),
          user_email_field: "email"
        }),
        fields: () => [
          makeField({
            type: "text",
            label: t3("templateFieldFullName", "Full name"),
            name: "full_name",
            required: true,
            placeholder: t3("templatePlaceholderName", "Jane Doe"),
            show_in_list: true
          }),
          makeField({
            type: "email",
            label: t3("templateFieldEmail", "Email"),
            name: "email",
            required: true,
            placeholder: "name@example.com",
            show_in_list: true
          }),
          makeField({
            type: "file",
            label: t3("templateFieldCv", "CV / R\xE9sum\xE9"),
            name: "cv",
            required: true,
            extensions: "pdf, doc, docx"
          }),
          makeField({
            type: "textarea",
            label: t3("templateFieldMessage", "Message"),
            name: "message",
            rows: 4,
            placeholder: t3("templatePlaceholderCover", "A short note about your application\u2026")
          }),
          consentField()
        ]
      }
    ];
  }
  function openSimpleModal(title, message, options = {}) {
    document.querySelectorAll(".bl-forms-builder__modal").forEach((node) => node.remove());
    const backdrop = el3("div", {
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
      el3("button", {
        type: "button",
        className: "button",
        text: options.onConfirm ? t3("cancel", "Cancel") : t3("close", "Close"),
        onClick: close
      })
    ];
    if (options.onConfirm) {
      footerChildren.push(
        el3("button", {
          type: "button",
          className: "button button-primary",
          text: options.confirmLabel || t3("apply", "Apply"),
          onClick: () => {
            options.onConfirm();
            close();
          }
        })
      );
    }
    const dialog = el3("div", { className: "bl-forms-builder__modal-dialog" });
    dialog.append(
      el3("div", { className: "bl-forms-builder__modal-header" }, [
        el3("h2", { className: "bl-forms-builder__modal-title", text: title })
      ]),
      el3("div", { className: "bl-forms-builder__modal-body" }, [el3("p", { text: message })]),
      el3("div", { className: "bl-forms-builder__modal-footer" }, footerChildren)
    );
    backdrop.appendChild(dialog);
    document.body.appendChild(backdrop);
  }
  function templateButton(label, onClick) {
    return el3("button", {
      type: "button",
      className: "button bl-button-small bl-forms-templates__btn",
      text: label,
      onClick
    });
  }
  function openTemplatesBrowser(canvas, panels) {
    document.querySelectorAll(".bl-forms-builder__modal").forEach((node) => node.remove());
    const title = t3("templates", "Templates");
    const backdrop = el3("div", {
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
    const list = el3("div", { className: "bl-forms-templates__list" });
    getStarterTemplates().forEach((tpl) => {
      list.appendChild(
        templateButton(tpl.label, () => {
          close();
          openSimpleModal(
            t3("templateApplyTitle", "Apply template?"),
            t3(
              "templateApplyMessage",
              "Applying this template will overwrite all existing fields on this form. Other settings stay as they are, except the submit button label when the template defines one."
            ),
            {
              confirmLabel: t3("templateApplyConfirm", "Apply template"),
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
    const body = el3("div", { className: "bl-forms-builder__modal-body bl-forms-templates__modal-body" }, [
      el3("p", {
        className: "description",
        text: t3(
          "templatesBrowseHelp",
          "Choose a template to create this form with predefined fields."
        )
      }),
      list
    ]);
    const dialog = el3("div", {
      className: "bl-forms-builder__modal-dialog bl-forms-templates__modal-dialog"
    });
    dialog.append(
      el3("div", { className: "bl-forms-builder__modal-header" }, [
        el3("h2", { className: "bl-forms-builder__modal-title", text: title })
      ]),
      body,
      el3("div", { className: "bl-forms-builder__modal-footer" }, [
        el3("button", {
          type: "button",
          className: "button",
          text: t3("cancel", "Cancel"),
          onClick: close
        })
      ])
    );
    backdrop.appendChild(dialog);
    document.body.appendChild(backdrop);
  }
  function bindTemplates(canvas, panels) {
    const browseBtn = document.querySelector("[data-bl-forms-browse-templates]");
    if (!browseBtn || typeof canvas.replaceFields !== "function") {
      return;
    }
    browseBtn.addEventListener("click", (evt) => {
      evt.preventDefault();
      openTemplatesBrowser(canvas, panels);
    });
  }

  // themes/baselayer/packages/baselayer-forms/src/js/admin/field-extras.js
  function fb() {
    return window.BlFormBuilder || {};
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
    const { el: el5, t: t5 } = fb();
    const input = el5("input", {
      type: "checkbox",
      dataset: { blShowInList: "1" },
      checked: !!field.show_in_list
    });
    input.addEventListener("change", () => {
      if (input.checked && countOtherListOverviewFields(field.id) >= 3) {
        input.checked = false;
        window.alert(
          t5("showInListMax", "You can show at most 3 fields in the entries list.")
        );
        return;
      }
      field.show_in_list = !!input.checked;
      document.dispatchEvent(new CustomEvent("bl-forms-builder-changed"));
    });
    return el5("div", { className: "bl-forms-builder__switch-setting" }, [
      el5("label", { className: "bl-forms-builder__switch" }, [
        input,
        el5("span", { className: "bl-forms-builder__switch-ui", "aria-hidden": "true" }),
        el5("span", {
          className: "bl-forms-builder__switch-label",
          text: t5("showInList", "Show in overview")
        })
      ])
    ]);
  }
  var formsFieldCardExtras = {
    onInitField(field) {
      if ((field.type === "text" || field.type === "email") && field.show_in_list === void 0) {
        field.show_in_list = defaultShowInListForNewField(field.type, field.id);
      }
    },
    onNormalizeType(field, nextType) {
      if (!["text", "email", "phone"].includes(nextType)) {
        delete field.show_in_list;
      } else if ((nextType === "text" || nextType === "email") && field.show_in_list === void 0) {
        field.show_in_list = defaultShowInListForNewField(nextType, field.id);
      }
    },
    extraSwitches(field) {
      if (field.type === "text" || field.type === "email" || field.type === "phone") {
        return [createListOverviewControl(field)];
      }
      return [];
    },
    onSerialize(data, { type, q }) {
      if (type === "text" || type === "email" || type === "phone") {
        data.show_in_list = Boolean(q("[data-bl-show-in-list]")?.checked);
      }
    }
  };
  function registerFormsFieldExtras() {
    const FormBuilder = window.BlFormBuilder;
    if (!FormBuilder || typeof FormBuilder.configure !== "function") {
      return;
    }
    FormBuilder.configure({ fieldCard: formsFieldCardExtras });
  }

  // themes/baselayer/packages/baselayer-forms/src/js/admin/app.js
  var {
    el: el4,
    t: t4,
    writeConfig,
    PALETTE_SECTIONS,
    defaultField,
    uniqueFieldName,
    iconEl: iconEl2,
    createFieldCard,
    serializeRow,
    equalizeColumnRun
  } = window.BlFormBuilder || {};
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
    const FormBuilder = window.BlFormBuilder;
    if (!Builder || typeof Builder.mount !== "function") {
      root.textContent = "Canvas builder failed to load.";
      return;
    }
    if (!FormBuilder || typeof FormBuilder.createFieldCard !== "function") {
      root.textContent = "Form builder failed to load.";
      return;
    }
    registerFormsFieldExtras();
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
    const fieldsPanel = el4("div", {
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
      heading: t4("canvasHeading", "Form"),
      emptyText: t4("empty", "Drag a field here, or click a template to add it."),
      handleSelector: ".bl-forms-builder__handle",
      draggableSelector: ".bl-forms-builder__field, .bl-forms-builder__template",
      templateClass: "bl-forms-builder__template",
      itemAttr: "data-bl-forms-field",
      icons: window.blFormsAdmin && window.blFormsAdmin.icons || {},
      t: t4,
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
    const tabBar = el4("nav", { className: "bl-forms-builder__tabs", role: "tablist" });
    const tabs = [
      { id: "fields", label: t4("tabFields", "Fields"), panel: fieldsPanel },
      { id: "notifications", label: t4("tabNotifications", "Notifications"), panel: panels.notifications },
      { id: "settings", label: t4("tabSettings", "Settings"), panel: panels.settings },
      { id: "validation", label: t4("tabValidation", "Validation"), panel: panels.validation }
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
      tab.button = el4("button", {
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
      const label = fullscreen ? t4("fullscreenExit", "Exit fullscreen") : t4("fullscreenEnter", "Fullscreen");
      fullscreenBtn.title = label;
      fullscreenBtn.setAttribute("aria-label", label);
      fullscreenBtn.setAttribute("aria-pressed", fullscreen ? "true" : "false");
      fullscreenBtn.replaceChildren();
      const icon = iconEl2(fullscreen ? "fullscreenExit" : "fullscreen");
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
    const fullscreenBtn = el4("button", {
      type: "button",
      className: "bl-forms-builder__icon-btn bl-forms-builder__fullscreen-btn",
      title: t4("fullscreenEnter", "Fullscreen"),
      "aria-label": t4("fullscreenEnter", "Fullscreen"),
      "aria-pressed": "false",
      onClick: () => setFullscreen(!fullscreen)
    });
    const enterIcon = iconEl2("fullscreen");
    if (enterIcon.innerHTML) {
      fullscreenBtn.appendChild(enterIcon);
    } else {
      fullscreenBtn.textContent = "\u26F6";
    }
    tabBar.appendChild(fullscreenBtn);
    const panelsWrap = el4("div", { className: "bl-forms-builder__panels" }, [
      fieldsPanel,
      panels.notifications,
      panels.settings,
      panels.validation
    ]);
    root.append(
      el4("div", { className: "bl-forms-builder__scroll" }, [
        el4("div", { className: "bl-forms-builder__scroll-inner" }, [tabBar, panelsWrap])
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
