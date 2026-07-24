/**
 * Frontend form AJAX submit + spinner + file upload UI + field errors.
 */
function charLength(value) {
  return Array.from(String(value || '')).length;
}

function formatCharCountText(template, remaining, max, count, emptyText) {
  if (remaining <= 0) {
    return String(emptyText || '').trim() || 'No characters remaining';
  }
  const text =
    String(template || '').trim() || '%remaining% characters remaining';
  return text
    .split('%remaining%')
    .join(String(Math.max(0, remaining)))
    .split('%count%')
    .join(String(Math.max(0, count)))
    .split('%max%')
    .join(String(Math.max(0, max)));
}

function initCharCounters(root) {
  root.querySelectorAll('[data-bl-form-char-count]').forEach((counter) => {
    const field = counter.closest('[data-bl-form-field]');
    const control = field?.querySelector('.bl-form__control');
    if (!control) return;

    const max = Number(counter.getAttribute('data-bl-form-char-count-max')) || 0;
    const template = counter.getAttribute('data-bl-form-char-count-template') || '';
    const emptyText = counter.getAttribute('data-bl-form-char-count-empty') || '';
    if (max < 1) return;

    const update = () => {
      const count = charLength(control.value);
      const remaining = Math.max(0, max - count);
      counter.textContent = formatCharCountText(
        template,
        remaining,
        max,
        count,
        emptyText
      );
    };

    control.addEventListener('input', update);
    control.addEventListener('change', update);
    update();
  });
}

function fileTypeStyles() {
  return (window.blForms && window.blForms.fileTypes) || {};
}

function fileExtension(name) {
  const base = String(name || '').split(/[\\/]/).pop() || '';
  const idx = base.lastIndexOf('.');
  return idx > 0 ? base.slice(idx + 1).toLowerCase() : '';
}

function formatFileSize(bytes) {
  const n = Number(bytes) || 0;
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(n < 10 * 1024 ? 1 : 0)} KB`;
  return `${(n / (1024 * 1024)).toFixed(n < 10 * 1024 * 1024 ? 1 : 0)} MB`;
}

function badgeStyleForExt(ext) {
  const styles = fileTypeStyles();
  const style = styles[ext] || styles.default || { bg: '#6B7280', fg: '#FFFFFF' };
  return {
    bg: style.bg || '#6B7280',
    fg: style.fg || '#FFFFFF',
    label: style.label || (ext ? ext.toUpperCase() : 'FILE'),
  };
}

function isImageFile(file, kind) {
  if (kind === 'image') {
    const type = String(file.type || '');
    if (type.startsWith('image/')) return true;
    const ext = fileExtension(file.name);
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'heif', 'avif', 'svg'].includes(ext);
  }
  return String(file.type || '').startsWith('image/');
}

function assignFiles(input, files, maxFiles = 0) {
  const list = Array.from(files || []);
  if (typeof DataTransfer === 'undefined') {
    return false;
  }
  const dt = new DataTransfer();
  const multiple = !!input.multiple;
  const limit = multiple
    ? Math.max(1, Number(maxFiles) || 10)
    : 1;
  list.slice(0, limit).forEach((file) => {
    if (file) dt.items.add(file);
  });
  input.files = dt.files;
  input.dispatchEvent(new Event('change', { bubbles: true }));
  return true;
}

function initFileUploads(root) {
  root.querySelectorAll('[data-bl-form-upload]').forEach((wrap) => {
    const input = wrap.querySelector('[data-bl-form-file-input]');
    const shell = wrap.querySelector('[data-bl-form-upload-shell]');
    const emptyEl = wrap.querySelector('[data-bl-form-upload-empty]');
    const preview = wrap.querySelector('[data-bl-form-upload-preview-list]');
    if (!input || !shell) return;

    const kind = wrap.getAttribute('data-bl-form-upload-kind') || 'file';
    const showPreview = wrap.getAttribute('data-bl-form-upload-preview') === '1';
    const maxFiles = Math.max(1, Number(wrap.getAttribute('data-bl-form-upload-max')) || (input.multiple ? 10 : 1));
    const removeLabel = wrap.getAttribute('data-bl-form-upload-remove') || 'Remove';
    const emptyDefault = emptyEl?.textContent || 'No file chosen';
    const objectUrls = [];

    const revokeUrls = () => {
      while (objectUrls.length) {
        URL.revokeObjectURL(objectUrls.pop());
      }
    };

    const setDisabled = (disabled) => {
      wrap.classList.toggle('is-disabled', disabled);
      shell.setAttribute('aria-disabled', disabled ? 'true' : 'false');
      shell.tabIndex = disabled ? -1 : 0;
    };
    setDisabled(!!input.disabled);

    const openPicker = () => {
      if (input.disabled) return;
      input.click();
    };

    shell.addEventListener('click', (event) => {
      event.preventDefault();
      openPicker();
    });
    shell.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openPicker();
      }
    });

    ['dragenter', 'dragover'].forEach((evt) => {
      shell.addEventListener(evt, (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (!input.disabled) wrap.classList.add('is-dragover');
      });
    });
    ['dragleave', 'drop'].forEach((evt) => {
      shell.addEventListener(evt, (event) => {
        event.preventDefault();
        event.stopPropagation();
        wrap.classList.remove('is-dragover');
      });
    });
    shell.addEventListener('drop', (event) => {
      if (input.disabled) return;
      const files = event.dataTransfer?.files;
      if (!files?.length) return;
      assignFiles(input, files, maxFiles);
    });

    const renderPreview = () => {
      revokeUrls();
      const files = Array.from(input.files || []);
      wrap.classList.toggle('has-files', files.length > 0);

      if (emptyEl) {
        if (!files.length) {
          emptyEl.textContent = emptyDefault;
        } else if (files.length === 1) {
          emptyEl.textContent = files[0].name;
        } else {
          emptyEl.textContent = `${files.length} files selected`;
        }
      }

      if (!showPreview || !preview) return;

      preview.replaceChildren();
      if (!files.length) {
        preview.hidden = true;
        return;
      }
      preview.hidden = false;

      files.forEach((file, index) => {
        const card = document.createElement('div');
        card.className = 'bl-form__upload-card';

        const media = document.createElement('div');
        media.className = 'bl-form__upload-card-media';

        if (isImageFile(file, kind)) {
          const img = document.createElement('img');
          img.className = 'bl-form__upload-card-thumb';
          img.alt = '';
          const url = URL.createObjectURL(file);
          objectUrls.push(url);
          img.src = url;
          img.onerror = () => {
            media.replaceChildren();
            const ext = fileExtension(file.name);
            const style = badgeStyleForExt(ext);
            const badge = document.createElement('span');
            badge.className = 'bl-form__upload-card-badge';
            badge.textContent = style.label;
            badge.style.setProperty('--bl-upload-badge-bg', style.bg);
            badge.style.setProperty('--bl-upload-badge-fg', style.fg);
            media.appendChild(badge);
          };
          media.appendChild(img);
        } else {
          const ext = fileExtension(file.name);
          const style = badgeStyleForExt(ext);
          const badge = document.createElement('span');
          badge.className = 'bl-form__upload-card-badge';
          badge.textContent = style.label;
          badge.style.setProperty('--bl-upload-badge-bg', style.bg);
          badge.style.setProperty('--bl-upload-badge-fg', style.fg);
          media.appendChild(badge);
        }

        const body = document.createElement('div');
        body.className = 'bl-form__upload-card-body';
        const nameEl = document.createElement('span');
        nameEl.className = 'bl-form__upload-card-name';
        nameEl.textContent = file.name || 'File';
        nameEl.title = file.name || '';
        const sizeEl = document.createElement('span');
        sizeEl.className = 'bl-form__upload-card-size';
        sizeEl.textContent = formatFileSize(file.size);
        body.append(nameEl, sizeEl);

        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'bl-form__upload-card-remove';
        removeBtn.setAttribute('aria-label', `${removeLabel}: ${file.name || ''}`);
        removeBtn.textContent = '×';
        removeBtn.addEventListener('click', (event) => {
          event.preventDefault();
          event.stopPropagation();
          const next = Array.from(input.files || []).filter((_, i) => i !== index);
          assignFiles(input, next, maxFiles);
        });

        card.append(media, body, removeBtn);
        preview.appendChild(card);
      });
    };

    input.addEventListener('change', () => {
      const files = Array.from(input.files || []);
      if (files.length > maxFiles) {
        assignFiles(input, files, maxFiles);
        return;
      }
      renderPreview();
    });
    renderPreview();
  });
}

function ensureErrorEl(field) {
  let err = field.querySelector('[data-bl-form-field-error]');
  if (err) {
    return err;
  }
  err = document.createElement('p');
  err.className = 'bl-form__error';
  err.setAttribute('data-bl-form-field-error', '');
  err.hidden = true;
  field.appendChild(err);
  return err;
}

function fieldEntriesFromPayload(fields) {
  if (!fields) {
    return [];
  }
  if (Array.isArray(fields)) {
    return fields.map((name) => [String(name), '']);
  }
  if (typeof fields === 'object') {
    return Object.entries(fields).map(([name, message]) => [String(name), String(message || '')]);
  }
  return [];
}

function formsI18n() {
  return (window.blForms && window.blForms.i18n) || {};
}

function formatTemplate(template, ...values) {
  let out = String(template || '');
  values.forEach((value, index) => {
    out = out.split(`%${index + 1}$s`).join(String(value));
  });
  values.forEach((value) => {
    out = out.replace('%s', String(value));
  });
  return out;
}

function formatProgressSize(bytes) {
  const n = Math.max(0, Number(bytes) || 0);
  if (n < 1024) return `${Math.round(n)} B`;
  if (n < 1024 * 1024) {
    const kb = n / 1024;
    return `${kb < 10 ? kb.toFixed(1) : Math.round(kb)} KB`;
  }
  const mb = n / (1024 * 1024);
  return `${mb < 10 ? mb.toFixed(2) : mb.toFixed(1)} MB`;
}

function collectUploadFiles(form) {
  const files = [];
  form.querySelectorAll('[data-bl-form-file-input]').forEach((input) => {
    const kind =
      input.closest('[data-bl-form-upload]')?.getAttribute('data-bl-form-upload-kind') || 'file';
    Array.from(input.files || []).forEach((file) => {
      files.push({ file, kind });
    });
  });
  return files;
}

function estimateUploadIndex(loaded, files) {
  if (!files.length) return 0;
  let cumulative = 0;
  for (let i = 0; i < files.length; i += 1) {
    cumulative += Math.max(0, files[i].file.size || 0);
    if (loaded < cumulative) {
      return i;
    }
  }
  return files.length - 1;
}

function createProgressController(root) {
  const wrap = root.querySelector('[data-bl-form-progress]');
  const statusEl = root.querySelector('[data-bl-form-progress-status]');
  const detailEl = root.querySelector('[data-bl-form-progress-detail]');
  const barEl = root.querySelector('[data-bl-form-progress-bar]');
  if (!wrap || !statusEl || !barEl) {
    return {
      show() {},
      hide() {},
      setUpload() {},
      setSending() {},
    };
  }

  const setBar = (ratio, indeterminate) => {
    wrap.classList.toggle('is-indeterminate', !!indeterminate);
    if (indeterminate) {
      barEl.style.width = '';
      return;
    }
    const pct = Math.max(0, Math.min(100, Math.round((Number(ratio) || 0) * 100)));
    barEl.style.width = `${pct}%`;
  };

  return {
    show() {
      wrap.hidden = false;
      root.classList.add('has-progress');
    },
    hide() {
      wrap.hidden = true;
      wrap.classList.remove('is-indeterminate');
      if (detailEl) {
        detailEl.hidden = true;
        detailEl.textContent = '';
      }
      statusEl.textContent = '';
      barEl.style.width = '0%';
      root.classList.remove('has-progress');
    },
    setUpload(files, loaded, total) {
      const i18n = formsI18n();
      const count = files.length;
      const fileBytes = files.reduce((sum, item) => sum + (item.file.size || 0), 0);
      const uploadTotal = total > 0 ? total : fileBytes;
      const uploadLoaded = Math.max(0, Math.min(loaded, uploadTotal || loaded));
      const index = estimateUploadIndex(uploadLoaded, files);
      const current = files[index];
      const allImages =
        count > 0 &&
        files.every(
          (item) => item.kind === 'image' || isImageFile(item.file, item.kind)
        );
      const template = allImages
        ? i18n.uploadingImage || 'Uploading image %1$s/%2$s'
        : count === 1
          ? i18n.uploadingFile || 'Uploading file %1$s/%2$s'
          : i18n.uploadingFiles || 'Uploading %1$s/%2$s';

      statusEl.textContent = formatTemplate(template, String(index + 1), String(count));

      if (detailEl) {
        const parts = [];
        if (current?.file?.name) {
          parts.push(current.file.name);
        }
        if (uploadTotal > 0) {
          const ofTpl = i18n.progressOf || '%1$s of %2$s';
          parts.push(
            formatTemplate(
              ofTpl,
              formatProgressSize(uploadLoaded),
              formatProgressSize(uploadTotal)
            )
          );
          const pct = Math.round((uploadLoaded / uploadTotal) * 100);
          parts.push(`${pct}%`);
        }
        detailEl.textContent = parts.join(' · ');
        detailEl.hidden = parts.length === 0;
      }

      setBar(uploadTotal > 0 ? uploadLoaded / uploadTotal : 0, false);
    },
    setSending() {
      const i18n = formsI18n();
      statusEl.textContent = i18n.sendingMessage || 'Sending message…';
      if (detailEl) {
        detailEl.hidden = true;
        detailEl.textContent = '';
      }
      setBar(1, true);
    },
  };
}

function postFormData(url, body, { onUploadProgress, onUploadComplete } = {}) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    xhr.withCredentials = true;
    xhr.responseType = 'json';

    if (xhr.upload) {
      xhr.upload.addEventListener('progress', (event) => {
        if (typeof onUploadProgress === 'function') {
          onUploadProgress(event);
        }
      });
      xhr.upload.addEventListener('load', () => {
        if (typeof onUploadComplete === 'function') {
          onUploadComplete();
        }
      });
    }

    xhr.addEventListener('load', () => {
      let data = xhr.response;
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data);
        } catch (err) {
          reject(err);
          return;
        }
      }
      resolve({ ok: xhr.status >= 200 && xhr.status < 300, status: xhr.status, data });
    });
    xhr.addEventListener('error', () => reject(new Error('network')));
    xhr.addEventListener('abort', () => reject(new Error('abort')));
    xhr.send(body);
  });
}

function initForm(root) {
  const form = root.querySelector('[data-bl-form-el]');
  const message = root.querySelector('[data-bl-form-message]');
  const submit = root.querySelector('[data-bl-form-submit]');
  const spinner = root.querySelector('[data-bl-form-spinner]');
  const label = root.querySelector('.bl-form__submit-label');
  if (!form || !submit) return;

  initFileUploads(root);
  initCharCounters(root);
  const progress = createProgressController(root);

  // Prove JavaScript ran: copy the signed token into the hidden check field.
  const jsField = form.querySelector('[data-bl-form-js-field]');
  const jsToken = root.dataset.blFormJs || '';
  if (jsField && jsToken) {
    jsField.value = jsToken;
  }

  const ajaxUrl = root.dataset.blFormAjax || '/wp-admin/admin-ajax.php';
  const successMsg = root.dataset.blFormSuccess || '';
  const errorMsg = root.dataset.blFormError || '';
  const validationMsg = root.dataset.blFormValidation || '';
  const afterSubmit = root.dataset.blFormAfter || 'message';
  const redirectUrl = root.dataset.blFormRedirect || '';

  const showMessage = (text, type) => {
    if (!message) return;
    message.hidden = !text;
    message.textContent = text || '';
    message.classList.remove('is-success', 'is-error');
    if (type) message.classList.add(type === 'success' ? 'is-success' : 'is-error');
  };

  const setLoading = (loading, { useProgress = false } = {}) => {
    submit.disabled = loading;
    root.classList.toggle('is-loading', loading);
    const showSpinner = loading && !useProgress;
    if (spinner) spinner.hidden = !showSpinner;
    if (label) label.hidden = showSpinner;
    if (!loading) {
      progress.hide();
    }
  };

  const clearFieldInvalid = (field) => {
    if (!field) return;
    field.classList.remove('is-invalid');
    field.removeAttribute('aria-invalid');
    const err = field.querySelector('[data-bl-form-field-error]');
    if (err) {
      err.hidden = true;
      err.textContent = '';
    }
    if (!root.querySelector('.is-invalid')) {
      showMessage('', '');
    }
  };

  const clearInvalid = () => {
    root.querySelectorAll('.is-invalid').forEach((node) => clearFieldInvalid(node));
  };

  const markInvalid = (fields) => {
    fieldEntriesFromPayload(fields).forEach(([name, msg]) => {
      const field = root.querySelector('[data-bl-form-field="' + CSS.escape(name) + '"]');
      if (!field) return;
      field.classList.add('is-invalid');
      field.setAttribute('aria-invalid', 'true');
      const err = ensureErrorEl(field);
      err.textContent = msg;
      err.hidden = !msg;
    });
  };

  const clearInvalidFromEvent = (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const field = target.closest('[data-bl-form-field]');
    if (field && field.classList.contains('is-invalid')) {
      clearFieldInvalid(field);
    }
  };

  form.addEventListener('input', clearInvalidFromEvent);
  form.addEventListener('change', clearInvalidFromEvent);

  const handleSuccess = (payload) => {
    // Only trust redirect from a real submission response (not honeypot / JS-check fakes).
    const redirect =
      (payload && payload.redirect) ||
      (payload && payload.entry_id && afterSubmit === 'redirect' ? redirectUrl : '') ||
      '';
    if (redirect) {
      window.location.assign(redirect);
      return;
    }
    showMessage((payload && payload.message) || successMsg, 'success');
    const fields = root.querySelector('.bl-form__fields');
    if (fields) fields.hidden = true;
    submit.hidden = true;
    progress.hide();
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (jsField && jsToken) {
      jsField.value = jsToken;
    }
    clearInvalid();
    showMessage('', '');

    const uploads = collectUploadFiles(form);
    const useProgress = uploads.length > 0;
    setLoading(true, { useProgress });

    if (useProgress) {
      progress.show();
      progress.setUpload(uploads, 0, uploads.reduce((sum, item) => sum + (item.file.size || 0), 0));
    }

    try {
      const body = new FormData(form);
      const { data } = await postFormData(ajaxUrl, body, {
        onUploadProgress: (event) => {
          if (!useProgress) return;
          const total =
            event.lengthComputable && event.total > 0
              ? event.total
              : uploads.reduce((sum, item) => sum + (item.file.size || 0), 0);
          progress.setUpload(uploads, event.loaded || 0, total);
        },
        onUploadComplete: () => {
          if (useProgress) {
            progress.setSending();
          }
        },
      });

      if (data && data.success) {
        handleSuccess((data && data.data) || {});
        return;
      }

      const payload = (data && data.data) || {};
      if (payload.code === 'validation') {
        markInvalid(payload.fields || {});
        showMessage(payload.message || validationMsg, 'error');
      } else {
        showMessage(payload.message || errorMsg, 'error');
      }
    } catch (err) {
      showMessage(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  });
}

function boot() {
  document.querySelectorAll('[data-bl-form]').forEach(initForm);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
