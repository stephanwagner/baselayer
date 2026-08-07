/**
 * Developer → Tools — Install Google Font modal (explicit Add, preview consent).
 */
(function () {
  const root = document.getElementById('bl-google-font');
  if (!root) {
    return;
  }

  const ajaxUrl = root.getAttribute('data-ajax-url') || '';
  const nonce = root.getAttribute('data-nonce') || '';
  const maxSelected = Math.max(1, parseInt(root.getAttribute('data-max-selected') || '3', 10) || 3);
  let i18n = {};
  try {
    i18n = JSON.parse(root.getAttribute('data-i18n') || '{}') || {};
  } catch (e) {
    i18n = {};
  }

  const modal = document.getElementById('bl-google-font-modal');
  const openBtn = root.querySelector('[data-bl-google-font-open]');
  const searchInput = root.querySelector('[data-bl-google-font-search]');
  const resultsEl = root.querySelector('[data-bl-google-font-results]');
  const selectedLabel = root.querySelector('[data-bl-google-font-selected-label]');
  const selectedList = root.querySelector('[data-bl-google-font-selected-list]');
  const maxWarning = root.querySelector('[data-bl-google-font-max-warning]');
  const previewEmpty = root.querySelector('[data-bl-google-font-preview-empty]');
  const previewPane = root.querySelector('[data-bl-google-font-preview]');
  const previewName = root.querySelector('[data-bl-google-font-preview-name]');
  const previewFrame = root.querySelector('[data-bl-google-font-preview-frame]');
  const consentEl = root.querySelector('[data-bl-google-font-consent]');
  const consentAcceptBtn = root.querySelector('[data-bl-google-font-consent-accept]');
  const addBtn = root.querySelector('[data-bl-google-font-add]');
  const successEl = root.querySelector('[data-bl-google-font-success]');
  const successTitle = root.querySelector('[data-bl-google-font-success-title]');
  const successMeta = root.querySelector('[data-bl-google-font-success-meta]');
  const successHint = root.querySelector('[data-bl-google-font-success-hint]');
  const linkNote = root.querySelector('[data-bl-google-font-link-note]');
  const linkNoteTitle = root.querySelector('[data-bl-google-font-link-note-title]');
  const linkNoteHint = root.querySelector('[data-bl-google-font-link-note-hint]');
  const linkNoteSnippet = root.querySelector('[data-bl-google-font-link-note-snippet]');
  const linkNoteCopyBtn = root.querySelector('[data-bl-google-font-link-note-copy]');
  const linkNoteDismissBtn = root.querySelector('[data-bl-google-font-link-note-dismiss]');
  const installBtn = root.querySelector('[data-bl-google-font-install]');
  const spinnerEl = root.querySelector('[data-bl-google-font-spinner]');

  const CONSENT_STORAGE_KEY = 'bl_google_font_preview_consent';

  const readPreviewConsent = () => {
    try {
      return window.localStorage.getItem(CONSENT_STORAGE_KEY) === '1';
    } catch (e) {
      return false;
    }
  };

  const writePreviewConsent = () => {
    try {
      window.localStorage.setItem(CONSENT_STORAGE_KEY, '1');
    } catch (e) {
      // Ignore storage failures (private mode, quota, etc.).
    }
  };

  /** @type {string[]} */
  let selected = [];
  /** Currently highlighted family in the results list (not yet added). */
  let focusedFamily = '';
  let previewConsented = readPreviewConsent();
  /** Keep the post-install success pane visible until the user picks another font. */
  let showingInstallSuccess = false;
  let searchLoading = false;
  let installLoading = false;
  let searchTimer = null;
  let searchSeq = 0;
  /** @type {Array<{family: string, category?: string}>} */
  let lastItems = [];

  const syncLoading = () => {
    const loading = searchLoading || installLoading;
    if (resultsEl) {
      resultsEl.classList.toggle('is-loading', loading);
      resultsEl.setAttribute('aria-busy', loading ? 'true' : 'false');
    }
    if (spinnerEl) {
      spinnerEl.hidden = !loading;
      spinnerEl.setAttribute('aria-hidden', loading ? 'false' : 'true');
      const label = installLoading
        ? i18n.installing || 'Installing…'
        : i18n.searching || 'Searching…';
      if (loading) {
        spinnerEl.setAttribute('aria-label', label);
      } else {
        spinnerEl.removeAttribute('aria-label');
      }
    }
  };

  const setSearchLoading = (loading) => {
    searchLoading = !!loading;
    syncLoading();
  };

  const setInstallLoading = (loading) => {
    installLoading = !!loading;
    syncLoading();
  };

  const tpl = (template, ...values) => {
    let out = String(template || '');
    values.forEach((value) => {
      out = out.replace('%d', String(value));
      out = out.replace('%s', String(value));
    });
    return out;
  };

  const escapeHtml = (value) =>
    String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

  const googleCssUrl = (families) => {
    const list = Array.isArray(families) ? families.filter(Boolean) : [];
    if (!list.length) {
      return '';
    }
    return (
      'https://fonts.googleapis.com/css2?' +
      list.map((family) => 'family=' + encodeURIComponent(family)).join('&') +
      '&display=swap'
    );
  };

  const post = (action, fields = {}) => {
    const body = new URLSearchParams();
    body.set('action', action);
    body.set('nonce', nonce);
    Object.keys(fields).forEach((key) => {
      body.set(key, fields[key]);
    });
    return fetch(ajaxUrl, {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      },
      body: body.toString(),
    }).then(async (response) => {
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data || data.success === false) {
        const message =
          (data && data.data && data.data.message) || i18n.searchError || 'Error';
        throw new Error(message);
      }
      return data.data || {};
    });
  };

  const clearPreviewFrame = () => {
    if (!previewFrame) {
      return;
    }
    previewFrame.hidden = true;
    previewFrame.removeAttribute('srcdoc');
    previewFrame.src = 'about:blank';
  };

  /**
   * Iframe isolates the sample from WP admin font CSS so Google Fonts can apply.
   * Google CSS is only loaded inside this iframe — never in the admin document head.
   */
  const renderPreviewFrame = (family) => {
    if (!previewFrame) {
      return;
    }
    if (!family || !previewConsented) {
      clearPreviewFrame();
      return;
    }

    const cssHref = googleCssUrl([family]);
    const sample = escapeHtml(i18n.previewSample || '');
    const fontFamilyCss = JSON.stringify(family);
    previewFrame.hidden = false;
    previewFrame.srcdoc =
      '<!DOCTYPE html><html><head><meta charset="utf-8">' +
      '<link rel="stylesheet" href="' +
      escapeHtml(cssHref) +
      '">' +
      '<style>' +
      'html,body{margin:0;padding:0;height:100%;background:transparent;}' +
      'body{box-sizing:border-box;padding:4px 0;font-family:' +
      fontFamilyCss +
      ',sans-serif;font-size:clamp(22px,4.2vw,36px);line-height:1.4;color:#1d2327;word-wrap:break-word;}' +
      '</style></head><body>' +
      sample +
      '</body></html>';
  };

  const syncAddButton = () => {
    if (!addBtn) {
      return;
    }
    if (!focusedFamily) {
      addBtn.disabled = true;
      addBtn.textContent = i18n.add || 'Add';
      return;
    }
    if (selected.includes(focusedFamily)) {
      addBtn.disabled = true;
      addBtn.textContent = i18n.alreadySelected || 'Already selected';
      return;
    }
    if (selected.length >= maxSelected) {
      addBtn.disabled = true;
      addBtn.textContent = i18n.add || 'Add';
      return;
    }
    addBtn.disabled = false;
    addBtn.textContent = i18n.add || 'Add';
  };

  const syncInstallButton = () => {
    if (!installBtn) {
      return;
    }
    installBtn.disabled = selected.length === 0;
    installBtn.textContent = i18n.install || 'Install';
  };

  const hideInstallSuccess = () => {
    showingInstallSuccess = false;
    if (successEl) {
      successEl.hidden = true;
    }
  };

  const updatePreviewPane = () => {
    if (showingInstallSuccess) {
      clearPreviewFrame();
      if (previewPane) {
        previewPane.hidden = true;
      }
      if (previewEmpty) {
        previewEmpty.hidden = true;
      }
      if (consentEl) {
        consentEl.hidden = true;
      }
      if (successEl) {
        successEl.hidden = false;
      }
      syncAddButton();
      return;
    }

    if (successEl) {
      successEl.hidden = true;
    }

    if (!focusedFamily) {
      clearPreviewFrame();
      if (previewPane) {
        previewPane.hidden = true;
      }
      if (previewEmpty) {
        previewEmpty.hidden = false;
      }
      if (consentEl) {
        consentEl.hidden = true;
      }
      syncAddButton();
      return;
    }

    if (previewEmpty) {
      previewEmpty.hidden = true;
    }
    if (previewPane) {
      previewPane.hidden = false;
    }
    if (previewName) {
      previewName.textContent = focusedFamily;
    }

    // Consent only when a focused family would load a Google preview.
    if (previewConsented) {
      if (consentEl) {
        consentEl.hidden = true;
      }
      renderPreviewFrame(focusedFamily);
    } else {
      clearPreviewFrame();
      if (consentEl) {
        consentEl.hidden = false;
      }
    }

    syncAddButton();
  };

  const renderSelected = () => {
    if (selectedLabel) {
      selectedLabel.textContent =
        selected.length === 0
          ? i18n.selectedEmpty || 'No fonts selected yet.'
          : i18n.selected || 'Selected';
    }
    if (maxWarning) {
      maxWarning.hidden = selected.length < maxSelected;
    }
    if (selectedList) {
      selectedList.innerHTML = '';
      selected.forEach((family) => {
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'bl-google-font-modal__chip';
        chip.setAttribute('role', 'listitem');
        chip.title = i18n.remove || 'Remove';
        const name = document.createElement('span');
        name.className = 'bl-google-font-modal__chip-name';
        name.textContent = family;
        const remove = document.createElement('span');
        remove.className = 'bl-google-font-modal__chip-remove';
        remove.setAttribute('aria-hidden', 'true');
        remove.innerHTML =
          '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12" width="10" height="10" fill="none" focusable="false">' +
          '<path d="M3 3l6 6M9 3L3 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>' +
          '</svg>';
        chip.appendChild(name);
        chip.appendChild(remove);
        chip.addEventListener('click', () => {
          removeFamily(family);
        });
        selectedList.appendChild(chip);
      });
    }
    syncInstallButton();
    syncAddButton();
    syncResultState();
  };

  const syncResultState = () => {
    if (!resultsEl) {
      return;
    }
    resultsEl.querySelectorAll('.bl-google-font-modal__result').forEach((btn) => {
      const family = btn.getAttribute('data-family') || '';
      btn.classList.toggle('is-focused', family === focusedFamily);
      btn.classList.toggle('is-added', selected.includes(family));
      btn.setAttribute('aria-selected', family === focusedFamily ? 'true' : 'false');
    });
  };

  const focusFamily = (family) => {
    focusedFamily = family || '';
    hideInstallSuccess();
    syncResultState();
    updatePreviewPane();
  };

  const addFocusedFamily = () => {
    if (!focusedFamily) {
      return;
    }
    if (selected.includes(focusedFamily)) {
      return;
    }
    if (selected.length >= maxSelected) {
      if (maxWarning) {
        maxWarning.hidden = false;
      }
      return;
    }
    selected.push(focusedFamily);
    hideInstallSuccess();
    renderSelected();
    updatePreviewPane();
  };

  const removeFamily = (family) => {
    const index = selected.indexOf(family);
    if (index < 0) {
      return;
    }
    selected.splice(index, 1);
    renderSelected();
    updatePreviewPane();
  };

  const renderResults = (items) => {
    lastItems = items;
    if (!resultsEl) {
      return;
    }
    resultsEl.innerHTML = '';
    if (!items.length) {
      const empty = document.createElement('p');
      empty.className = 'description bl-google-font-modal__empty';
      empty.textContent = i18n.noResults || '';
      resultsEl.appendChild(empty);
      return;
    }

    items.forEach((item) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'bl-google-font-modal__result';
      btn.setAttribute('role', 'option');
      btn.setAttribute('data-family', item.family);
      if (item.family === focusedFamily) {
        btn.classList.add('is-focused');
      }
      if (selected.includes(item.family)) {
        btn.classList.add('is-added');
      }
      btn.setAttribute('aria-selected', item.family === focusedFamily ? 'true' : 'false');
      const label = document.createElement('span');
      label.className = 'bl-google-font-modal__result-name';
      label.textContent = item.family;
      btn.appendChild(label);
      if (item.category) {
        const meta = document.createElement('span');
        meta.className = 'bl-google-font-modal__result-meta';
        meta.textContent = item.category;
        btn.appendChild(meta);
      }
      btn.addEventListener('click', () => {
        focusFamily(item.family);
      });
      resultsEl.appendChild(btn);
    });
  };

  const runSearch = (query) => {
    const seq = ++searchSeq;
    setSearchLoading(true);
    post('bl_google_font_search', { q: query })
      .then((data) => {
        if (seq !== searchSeq) {
          return;
        }
        renderResults(Array.isArray(data.items) ? data.items : []);
        setSearchLoading(false);
      })
      .catch((error) => {
        if (seq !== searchSeq || !resultsEl) {
          return;
        }
        resultsEl.innerHTML = '';
        const err = document.createElement('p');
        err.className = 'description';
        err.textContent = error.message || i18n.searchError || '';
        resultsEl.appendChild(err);
        setSearchLoading(false);
      });
  };

  const openModal = () => {
    if (!modal) {
      return;
    }
    hideInstallSuccess();
    renderSelected();
    updatePreviewPane();
    modal.hidden = false;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('bl-google-font-modal-open');
    if (searchInput) {
      searchInput.focus();
      if (!lastItems.length) {
        runSearch(searchInput.value || '');
      } else {
        renderResults(lastItems);
      }
    }
  };

  const closeModal = () => {
    if (!modal) {
      return;
    }
    window.clearTimeout(searchTimer);
    searchSeq += 1;
    setSearchLoading(false);
    setInstallLoading(false);
    modal.classList.remove('is-open');
    modal.hidden = true;
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('bl-google-font-modal-open');
    clearPreviewFrame();
    if (openBtn) {
      openBtn.focus();
    }
  };

  openBtn?.addEventListener('click', openModal);
  root.querySelectorAll('[data-bl-google-font-close]').forEach((el) => {
    el.addEventListener('click', closeModal);
  });

  searchInput?.addEventListener('input', () => {
    window.clearTimeout(searchTimer);
    searchTimer = window.setTimeout(() => {
      runSearch(searchInput.value || '');
    }, 220);
  });

  consentAcceptBtn?.addEventListener('click', () => {
    previewConsented = true;
    writePreviewConsent();
    updatePreviewPane();
    renderSelected();
  });

  addBtn?.addEventListener('click', () => {
    addFocusedFamily();
  });

  const showLinkNote = (data) => {
    if (!linkNote) {
      return;
    }
    const title =
      data.title ||
      (data.count > 1
        ? tpl(i18n.installSuccessMany || '%d fonts installed.', data.count)
        : i18n.installSuccess || 'Font installed.');
    if (linkNoteTitle) {
      linkNoteTitle.textContent = title;
    }
    if (linkNoteHint) {
      linkNoteHint.textContent = data.import_hint || '';
    }
    if (linkNoteSnippet) {
      linkNoteSnippet.textContent = data.use || '';
    }
    linkNote.hidden = false;
    // Keep the page notice in view when installing from the modal.
    if (typeof linkNote.scrollIntoView === 'function') {
      linkNote.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  };

  const hideLinkNote = () => {
    if (!linkNote) {
      return;
    }
    linkNote.hidden = true;
    if (linkNoteTitle) {
      linkNoteTitle.textContent = '';
    }
    if (linkNoteHint) {
      linkNoteHint.textContent = '';
    }
    if (linkNoteSnippet) {
      linkNoteSnippet.textContent = '';
    }
  };

  const copySnippet = async (snippetEl, button) => {
    const text = snippetEl?.textContent || '';
    if (!text || !button) {
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      button.textContent = i18n.copied || 'Copied';
      window.setTimeout(() => {
        button.textContent = i18n.copy || 'Copy';
      }, 1500);
    } catch (e) {
      // Ignore clipboard failures.
    }
  };

  installBtn?.addEventListener('click', () => {
    if (!selected.length || installBtn.disabled || installLoading) {
      return;
    }
    installBtn.disabled = true;
    setInstallLoading(true);
    post('bl_google_font_install', { families: JSON.stringify(selected) })
      .then((data) => {
        if (successTitle) {
          successTitle.textContent =
            data.title ||
            (data.count > 1
              ? tpl(i18n.installSuccessMany || '%d fonts installed.', data.count)
              : i18n.installSuccess || 'Font installed.');
        }
        if (successMeta) {
          const names = Array.isArray(data.families) ? data.families.join(', ') : selected.join(', ');
          successMeta.textContent = names;
        }
        if (successHint) {
          successHint.textContent =
            data.import_hint ||
            i18n.installSuccessHint ||
            'They were added to src/scss/_fonts.scss. Rebuild your theme CSS to apply them.';
        }
        showLinkNote(data);
        selected = [];
        focusedFamily = '';
        showingInstallSuccess = true;
        setInstallLoading(false);
        renderSelected();
        updatePreviewPane();
        installBtn.textContent = i18n.install || 'Install';
        installBtn.disabled = true;
      })
      .catch((error) => {
        window.alert(error.message || i18n.installError || '');
        setInstallLoading(false);
        installBtn.disabled = false;
        installBtn.textContent = i18n.install || 'Install';
      });
  });

  linkNoteCopyBtn?.addEventListener('click', () => {
    copySnippet(linkNoteSnippet, linkNoteCopyBtn);
  });

  linkNoteDismissBtn?.addEventListener('click', () => {
    linkNoteDismissBtn.disabled = true;
    post('bl_google_font_dismiss_link_note')
      .then(() => {
        hideLinkNote();
      })
      .catch(() => {
        // Still hide locally if the request fails after a refresh it may return.
        hideLinkNote();
      })
      .finally(() => {
        linkNoteDismissBtn.disabled = false;
      });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal && modal.classList.contains('is-open')) {
      event.preventDefault();
      closeModal();
    }
  });
})();
