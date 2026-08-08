(() => {
  // themes/baselayer/packages/baselayer-blocks/src/js/admin/import-export-shared.js
  function openConfirmModal(opts) {
    document.querySelectorAll(".bl-blocks-confirm-modal").forEach((node) => node.remove());
    const title = opts.title || "Confirm";
    const hideCancel = !!opts.hideCancel;
    const backdrop = document.createElement("div");
    backdrop.className = "bl-blocks-confirm-modal";
    backdrop.setAttribute("role", "dialog");
    backdrop.setAttribute("aria-modal", "true");
    backdrop.setAttribute("aria-label", title);
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
    const dialog = document.createElement("div");
    dialog.className = "bl-blocks-confirm-modal__dialog";
    const header = document.createElement("div");
    header.className = "bl-blocks-confirm-modal__header";
    const heading = document.createElement("h2");
    heading.className = "bl-blocks-confirm-modal__title";
    heading.textContent = title;
    header.appendChild(heading);
    const body = document.createElement("div");
    body.className = "bl-blocks-confirm-modal__body";
    const p = document.createElement("p");
    p.textContent = opts.message || "";
    body.appendChild(p);
    const footer = document.createElement("div");
    footer.className = "bl-blocks-confirm-modal__footer";
    if (!hideCancel) {
      const cancelBtn = document.createElement("button");
      cancelBtn.type = "button";
      cancelBtn.className = "button";
      cancelBtn.textContent = opts.cancelLabel || "Cancel";
      cancelBtn.addEventListener("click", close);
      footer.appendChild(cancelBtn);
    }
    const confirmBtn = document.createElement("button");
    confirmBtn.type = "button";
    confirmBtn.className = "button button-primary";
    confirmBtn.textContent = opts.confirmLabel || (hideCancel ? "OK" : "Confirm");
    confirmBtn.addEventListener("click", () => {
      opts.onConfirm?.();
      close();
    });
    footer.appendChild(confirmBtn);
    dialog.append(header, body, footer);
    backdrop.appendChild(dialog);
    document.body.appendChild(backdrop);
    confirmBtn.focus();
  }

  // themes/baselayer/packages/baselayer-blocks/src/js/settings-import.js
  function t(key, fallback) {
    const dict = window.blBlocksSettings && window.blBlocksSettings.i18n || {};
    return dict[key] || fallback;
  }
  document.addEventListener("DOMContentLoaded", () => {
    const input = document.getElementById("bl_blocks_import_file");
    const form = input?.closest("form");
    if (!input || !form) {
      return;
    }
    const nameEl = input.parentElement?.querySelector(".bl-blocks-settings__file-name");
    input.addEventListener("change", () => {
      if (!nameEl) {
        return;
      }
      const empty = nameEl.getAttribute("data-empty") || "";
      nameEl.textContent = input.files && input.files[0] && input.files[0].name || empty;
    });
    let confirmed = false;
    form.addEventListener("submit", (evt) => {
      if (confirmed) {
        confirmed = false;
        return;
      }
      if (!input.files || !input.files[0]) {
        return;
      }
      evt.preventDefault();
      openConfirmModal({
        title: t("importOverwriteTitle", "Import definitions?"),
        message: t(
          "importOverwriteMessage",
          "Importing will create or update matching definitions by type and slug, and may merge block options into the live store. This cannot be undone."
        ),
        confirmLabel: t("importOverwriteConfirm", "Import and overwrite"),
        cancelLabel: t("cancel", "Cancel"),
        onConfirm: () => {
          confirmed = true;
          const submitBtn = form.querySelector('[name="bl_blocks_import"]');
          if (submitBtn && typeof form.requestSubmit === "function") {
            form.requestSubmit(submitBtn);
            return;
          }
          let hidden = form.querySelector('input[type="hidden"][name="bl_blocks_import"]');
          if (!hidden) {
            hidden = document.createElement("input");
            hidden.type = "hidden";
            hidden.name = "bl_blocks_import";
            hidden.value = "1";
            form.appendChild(hidden);
          }
          form.submit();
        }
      });
    });
  });
})();
//# sourceMappingURL=blocks-settings.js.map
