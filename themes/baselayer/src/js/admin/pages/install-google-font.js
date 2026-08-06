/**
 * Developer → Tools — Install Google Font modal.
 */
(function () {
  const root = document.getElementById('bl-google-font');
  if (!root) {
    return;
  }

  const ajaxUrl = root.getAttribute('data-ajax-url') || '';
  const nonce = root.getAttribute('data-nonce') || '';
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
  const previewEmpty = root.querySelector('[data-bl-google-font-preview-empty]');
  const previewPane = root.querySelector('[data-bl-google-font-preview]');
  const previewName = root.querySelector('[data-bl-google-font-preview-name]');
  const previewSample = root.querySelector('[data-bl-google-font-preview-sample]');
  const successEl = root.querySelector('[data-bl-google-font-success]');
  const successTitle = root.querySelector('[data-bl-google-font-success-title]');
  const successMeta = root.querySelector('[data-bl-google-font-success-meta]');
  const successHint = root.querySelector('[data-bl-google-font-success-hint]');
  const successSnippet = root.querySelector('[data-bl-google-font-success-snippet]');
  const installBtn = root.querySelector('[data-bl-google-font-install]');
  const copyBtn = root.querySelector('[data-bl-google-font-copy]');
  const previewLink = document.createElement('link');
  previewLink.rel = 'stylesheet';
  previewLink.setAttribute('data-bl-google-font-preview-link', '1');

  let selectedFamily = '';
  let searchTimer = null;
  let searchSeq = 0;

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

  const clearPreviewLink = () => {
    if (previewLink.parentNode) {
      previewLink.parentNode.removeChild(previewLink);
    }
    previewLink.removeAttribute('href');
  };

  const setPreviewFamily = (family) => {
    selectedFamily = family || '';
    if (successEl) {
      successEl.hidden = true;
    }
    if (!family) {
      clearPreviewLink();
      if (previewPane) {
        previewPane.hidden = true;
      }
      if (previewEmpty) {
        previewEmpty.hidden = false;
      }
      if (installBtn) {
        installBtn.disabled = true;
        installBtn.textContent = i18n.install || 'Install';
      }
      return;
    }

    if (previewEmpty) {
      previewEmpty.hidden = true;
    }
    if (previewPane) {
      previewPane.hidden = false;
    }
    if (previewName) {
      previewName.textContent = family;
    }
    if (previewSample) {
      previewSample.textContent = i18n.previewSample || '';
      previewSample.style.fontFamily = `"${family}", sans-serif`;
    }

    const href =
      'https://fonts.googleapis.com/css2?family=' +
      encodeURIComponent(family) +
      ':ital,wght@0,100..900;1,100..900&display=swap';
    clearPreviewLink();
    previewLink.href = href;
    document.head.appendChild(previewLink);

    if (installBtn) {
      installBtn.disabled = false;
      installBtn.textContent = i18n.install || 'Install';
    }
  };

  const renderResults = (items) => {
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
      btn.setAttribute('aria-selected', item.family === selectedFamily ? 'true' : 'false');
      if (item.family === selectedFamily) {
        btn.classList.add('is-selected');
      }
      btn.textContent = item.family;
      if (item.category) {
        const meta = document.createElement('span');
        meta.className = 'bl-google-font-modal__result-meta';
        meta.textContent = item.category;
        btn.appendChild(meta);
      }
      btn.addEventListener('click', () => {
        resultsEl.querySelectorAll('.bl-google-font-modal__result').forEach((el) => {
          el.classList.remove('is-selected');
          el.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('is-selected');
        btn.setAttribute('aria-selected', 'true');
        setPreviewFamily(item.family);
      });
      resultsEl.appendChild(btn);
    });
  };

  const runSearch = (query) => {
    const seq = ++searchSeq;
    if (resultsEl) {
      resultsEl.innerHTML = '<p class="description">' + (i18n.searching || '') + '</p>';
    }
    post('bl_google_font_search', { q: query })
      .then((data) => {
        if (seq !== searchSeq) {
          return;
        }
        renderResults(Array.isArray(data.items) ? data.items : []);
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
      });
  };

  const openModal = () => {
    if (!modal) {
      return;
    }
    if (successEl) {
      successEl.hidden = true;
    }
    setPreviewFamily(selectedFamily);
    modal.hidden = false;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('bl-google-font-modal-open');
    if (searchInput) {
      searchInput.focus();
      if (!resultsEl || resultsEl.childElementCount === 0) {
        runSearch(searchInput.value || '');
      }
    }
  };

  const closeModal = () => {
    if (!modal) {
      return;
    }
    modal.classList.remove('is-open');
    modal.hidden = true;
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('bl-google-font-modal-open');
    clearPreviewLink();
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

  installBtn?.addEventListener('click', () => {
    if (!selectedFamily || installBtn.disabled) {
      return;
    }
    installBtn.disabled = true;
    installBtn.textContent = i18n.installing || 'Installing…';
    post('bl_google_font_install', { family: selectedFamily })
      .then((data) => {
        if (previewPane) {
          previewPane.hidden = true;
        }
        if (previewEmpty) {
          previewEmpty.hidden = true;
        }
        if (successEl) {
          successEl.hidden = false;
        }
        if (successTitle) {
          successTitle.textContent = i18n.installSuccess || 'Font installed.';
        }
        if (successMeta) {
          const bits = [data.family, data.scss, data.files ? data.files + ' files' : '', data.target]
            .filter(Boolean)
            .join(' · ');
          successMeta.textContent = bits;
        }
        if (successHint) {
          successHint.textContent = data.import_hint || '';
        }
        if (successSnippet) {
          successSnippet.textContent = data.use || '';
        }
        installBtn.textContent = i18n.install || 'Install';
        installBtn.disabled = false;
      })
      .catch((error) => {
        window.alert(error.message || i18n.installError || '');
        installBtn.disabled = false;
        installBtn.textContent = i18n.install || 'Install';
      });
  });

  copyBtn?.addEventListener('click', async () => {
    const text = successSnippet?.textContent || '';
    if (!text) {
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      copyBtn.textContent = i18n.copied || 'Copied';
      window.setTimeout(() => {
        copyBtn.textContent = i18n.copy || 'Copy';
      }, 1500);
    } catch (e) {
      // Ignore clipboard failures.
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal && modal.classList.contains('is-open')) {
      event.preventDefault();
      closeModal();
    }
  });
})();
