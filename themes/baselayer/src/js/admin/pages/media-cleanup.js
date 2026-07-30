/**
 * Developer → Tools — Media Cleanup (scan orphan uploads + review/delete modal).
 */
(() => {
  const root = document.getElementById('bl-media-cleanup');
  if (!root) {
    return;
  }

  const ajaxUrl = root.getAttribute('data-ajax-url') || '';
  const nonce = root.getAttribute('data-nonce') || '';
  let i18n = {};
  try {
    i18n = JSON.parse(root.getAttribute('data-i18n') || '{}') || {};
  } catch {
    i18n = {};
  }

  const scanBtn = root.querySelector('[data-media-cleanup-scan]');
  const reviewBtn = root.querySelector('[data-media-cleanup-review]');
  const idleEl = root.querySelector('[data-media-cleanup-idle]');
  const resultsEl = root.querySelector('[data-media-cleanup-results]');
  const checkedEl = root.querySelector('[data-media-cleanup-checked]');
  const orphansEl = root.querySelector('[data-media-cleanup-orphans]');
  const modal = root.querySelector('#bl-media-cleanup-modal');
  const confirmModal = root.querySelector('#bl-media-cleanup-confirm');
  const confirmTextEl = root.querySelector('[data-media-cleanup-confirm-text]');
  const confirmDeleteBtn = root.querySelector('[data-media-cleanup-confirm-delete]');
  const listEl = root.querySelector('[data-media-cleanup-list]');
  const introEl = root.querySelector('[data-media-cleanup-modal-intro]');
  const selectedCountEl = root.querySelector('[data-media-cleanup-selected-count]');
  const selectedSizeEl = root.querySelector('[data-media-cleanup-selected-size]');
  const deleteBtn = root.querySelector('[data-media-cleanup-delete]');

  let orphans = [];
  let checkedCount = 0;
  let busy = false;
  let pendingDeletePaths = [];

  const formatNumber = (n) => {
    try {
      return new Intl.NumberFormat(undefined).format(n);
    } catch {
      return String(n);
    }
  };

  const tpl = (template, value) => String(template || '%s').replace('%s', formatNumber(value));

  const fileLabel = (n) => tpl(n === 1 ? i18n.fileOne : i18n.fileMany, n);

  const postForm = async (action, fields = {}) => {
    const body = new FormData();
    body.append('action', action);
    body.append('nonce', nonce);
    Object.entries(fields).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        body.append(key, JSON.stringify(value));
      } else {
        body.append(key, value);
      }
    });
    const response = await fetch(ajaxUrl, {
      method: 'POST',
      credentials: 'same-origin',
      body,
    });
    const json = await response.json();
    if (!json || !json.success) {
      const message = json?.data?.message || i18n.scanError;
      throw new Error(message);
    }
    return json.data || {};
  };

  const setBusy = (next) => {
    busy = next;
    if (scanBtn) {
      scanBtn.disabled = next;
    }
    if (reviewBtn) {
      reviewBtn.disabled = next || orphans.length === 0;
    }
  };

  const showResults = (checked, orphanCount) => {
    checkedCount = checked;
    if (idleEl) {
      idleEl.hidden = true;
    }
    if (resultsEl) {
      resultsEl.hidden = false;
    }
    if (checkedEl) {
      checkedEl.textContent = tpl(checked === 1 ? i18n.checkedOne : i18n.checkedMany, checked);
    }
    if (orphansEl) {
      if (orphanCount === 0) {
        orphansEl.textContent = i18n.orphansNone || '';
        orphansEl.classList.remove('bl-media-cleanup__status-line--warn');
        orphansEl.classList.add('bl-media-cleanup__status-line--ok');
      } else {
        orphansEl.textContent = tpl(
          orphanCount === 1 ? i18n.orphansFoundOne : i18n.orphansFoundMany,
          orphanCount
        );
        orphansEl.classList.add('bl-media-cleanup__status-line--warn');
        orphansEl.classList.remove('bl-media-cleanup__status-line--ok');
      }
    }
    if (reviewBtn) {
      const show = orphanCount > 0;
      reviewBtn.hidden = !show;
      reviewBtn.disabled = !show || busy;
    }
  };

  const updateSelection = () => {
    if (!listEl) {
      return;
    }
    const allBoxes = [...listEl.querySelectorAll('input[type="checkbox"][data-path]')];
    const boxes = allBoxes.filter((box) => box.checked);
    let bytes = 0;
    boxes.forEach((box) => {
      bytes += Number(box.getAttribute('data-size') || 0);
    });
    if (selectedCountEl) {
      selectedCountEl.textContent = fileLabel(boxes.length);
    }
    if (selectedSizeEl) {
      selectedSizeEl.textContent = boxes.length ? formatBytes(bytes) : '';
    }
    if (deleteBtn) {
      deleteBtn.disabled = boxes.length === 0 || busy;
    }
    const toggleBtn = root.querySelector('[data-media-cleanup-select-toggle]');
    if (toggleBtn) {
      const allSelected = allBoxes.length > 0 && boxes.length === allBoxes.length;
      toggleBtn.textContent = allSelected
        ? i18n.selectNone || 'Select none'
        : i18n.selectAll || 'Select all';
      toggleBtn.disabled = allBoxes.length === 0 || busy;
      toggleBtn.setAttribute('data-mode', allSelected ? 'none' : 'all');
    }
  };

  const setAllChecked = (checked) => {
    if (!listEl) {
      return;
    }
    listEl.querySelectorAll('input[type="checkbox"][data-path]').forEach((box) => {
      box.checked = checked;
    });
    updateSelection();
  };

  const formatBytes = (bytes) => {
    if (bytes < 1024) {
      return `${bytes} B`;
    }
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(bytes < 10 * 1024 ? 1 : 0)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(bytes < 10 * 1024 * 1024 ? 1 : 1)} MB`;
  };

  const extLabel = (name) => {
    const parts = String(name || '').split('.');
    if (parts.length < 2) {
      return 'FILE';
    }
    return parts.pop().slice(0, 4).toUpperCase();
  };

  const renderList = () => {
    if (!listEl) {
      return;
    }
    listEl.innerHTML = '';
    orphans.forEach((item) => {
      const row = document.createElement('label');
      row.className = 'bl-media-cleanup-modal__row';
      row.setAttribute('role', 'listitem');

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.setAttribute('data-path', item.path);
      checkbox.setAttribute('data-size', String(item.size || 0));

      const preview = document.createElement('span');
      preview.className = 'bl-media-cleanup-modal__preview';
      preview.setAttribute('aria-hidden', 'true');
      if (item.is_image && item.url) {
        const img = document.createElement('img');
        img.src = item.url;
        img.alt = '';
        img.loading = 'lazy';
        img.decoding = 'async';
        preview.append(img);
      } else {
        preview.classList.add('bl-media-cleanup-modal__preview--file');
        preview.textContent = extLabel(item.name || item.path);
      }

      const body = document.createElement('span');
      body.className = 'bl-media-cleanup-modal__row-body';

      let nameEl;
      if (item.url) {
        nameEl = document.createElement('a');
        nameEl.href = item.url;
        nameEl.target = '_blank';
        nameEl.rel = 'noopener noreferrer';
        nameEl.className = 'bl-media-cleanup-modal__name';
        nameEl.title = i18n.openFile || 'Open file in new tab';
        nameEl.textContent = item.name || item.path;
        nameEl.addEventListener('click', (event) => {
          event.stopPropagation();
        });
      } else {
        nameEl = document.createElement('span');
        nameEl.className = 'bl-media-cleanup-modal__name';
        nameEl.textContent = item.name || item.path;
      }

      const meta = document.createElement('span');
      meta.className = 'bl-media-cleanup-modal__meta';
      meta.textContent = [item.size_label, item.modified_label].filter(Boolean).join(' · ');

      body.append(nameEl, meta);
      row.append(checkbox, preview, body);
      listEl.append(row);
    });

    if (introEl) {
      introEl.textContent = tpl(
        orphans.length === 1 ? i18n.modalIntroOne : i18n.modalIntroMany,
        orphans.length
      );
    }
    updateSelection();
  };

  const openModal = () => {
    if (!modal || orphans.length === 0) {
      return;
    }
    renderList();
    modal.hidden = false;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('bl-media-cleanup-modal-open');
  };

  const closeConfirmModal = () => {
    if (!confirmModal) {
      return;
    }
    confirmModal.classList.remove('is-open');
    confirmModal.hidden = true;
    confirmModal.setAttribute('aria-hidden', 'true');
    pendingDeletePaths = [];
  };

  const openConfirmModal = (paths) => {
    if (!confirmModal || !paths.length) {
      return;
    }
    pendingDeletePaths = paths;
    if (confirmTextEl) {
      confirmTextEl.textContent = tpl(
        paths.length === 1 ? i18n.confirmDeleteCountOne : i18n.confirmDeleteCountMany,
        paths.length
      );
    }
    confirmModal.hidden = false;
    confirmModal.classList.add('is-open');
    confirmModal.setAttribute('aria-hidden', 'false');
  };

  const closeModal = () => {
    closeConfirmModal();
    if (!modal) {
      return;
    }
    modal.classList.remove('is-open');
    modal.hidden = true;
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('bl-media-cleanup-modal-open');
  };

  const runScan = async () => {
    if (busy) {
      return;
    }
    setBusy(true);
    if (idleEl) {
      idleEl.hidden = false;
      idleEl.textContent = i18n.scanning || 'Scanning…';
    }
    if (resultsEl) {
      resultsEl.hidden = true;
    }
    if (reviewBtn) {
      reviewBtn.hidden = true;
      reviewBtn.disabled = true;
    }

    try {
      let token = '';
      let done = false;
      let data = {};
      while (!done) {
        data = await postForm('bl_media_cleanup_scan', { token });
        token = data.token || '';
        done = Boolean(data.done);
        if (!done && idleEl) {
          idleEl.textContent = `${i18n.scanning || 'Scanning…'} ${formatNumber(data.checked || 0)}`;
        }
      }
      orphans = Array.isArray(data.orphans) ? data.orphans : [];
      showResults(Number(data.checked || 0), Number(data.orphan_count || orphans.length));
    } catch (error) {
      if (idleEl) {
        idleEl.hidden = false;
        idleEl.textContent = error?.message || i18n.scanError;
      }
      orphans = [];
      if (reviewBtn) {
        reviewBtn.hidden = true;
      }
    } finally {
      setBusy(false);
    }
  };

  const requestDelete = () => {
    if (busy || !listEl) {
      return;
    }
    const boxes = [...listEl.querySelectorAll('input[type="checkbox"][data-path]:checked')];
    const paths = boxes.map((box) => box.getAttribute('data-path')).filter(Boolean);
    if (!paths.length) {
      return;
    }
    openConfirmModal(paths);
  };

  const runDelete = async () => {
    const paths = pendingDeletePaths.slice();
    if (busy || !paths.length) {
      return;
    }

    closeConfirmModal();
    setBusy(true);
    if (deleteBtn) {
      deleteBtn.textContent = i18n.deleting || 'Deleting…';
      deleteBtn.disabled = true;
    }

    try {
      const data = await postForm('bl_media_cleanup_delete', { paths });
      orphans = Array.isArray(data.remaining) ? data.remaining : [];
      const checked = Number(data.checked || checkedCount);
      showResults(checked, Number(data.orphan_count || orphans.length));
      if (orphans.length === 0) {
        closeModal();
      } else {
        renderList();
      }
    } catch (error) {
      window.alert(error?.message || i18n.deleteError);
    } finally {
      if (deleteBtn) {
        deleteBtn.textContent = deleteBtn.getAttribute('data-label') || 'Delete Selected';
      }
      setBusy(false);
      updateSelection();
    }
  };

  if (deleteBtn && !deleteBtn.getAttribute('data-label')) {
    deleteBtn.setAttribute('data-label', deleteBtn.textContent || 'Delete Selected');
  }

  scanBtn?.addEventListener('click', () => {
    runScan();
  });

  reviewBtn?.addEventListener('click', () => {
    openModal();
  });

  root.querySelectorAll('[data-media-cleanup-close]').forEach((el) => {
    el.addEventListener('click', () => {
      closeModal();
    });
  });

  root.querySelectorAll('[data-media-cleanup-confirm-close]').forEach((el) => {
    el.addEventListener('click', () => {
      closeConfirmModal();
    });
  });

  deleteBtn?.addEventListener('click', () => {
    requestDelete();
  });

  confirmDeleteBtn?.addEventListener('click', () => {
    runDelete();
  });

  root.querySelector('[data-media-cleanup-select-toggle]')?.addEventListener('click', (event) => {
    const mode = event.currentTarget.getAttribute('data-mode') || 'all';
    setAllChecked(mode !== 'none');
  });

  listEl?.addEventListener('change', (event) => {
    if (event.target?.matches?.('input[type="checkbox"][data-path]')) {
      updateSelection();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') {
      return;
    }
    if (confirmModal && !confirmModal.hidden) {
      closeConfirmModal();
      return;
    }
    if (modal && !modal.hidden) {
      closeModal();
    }
  });
})();
