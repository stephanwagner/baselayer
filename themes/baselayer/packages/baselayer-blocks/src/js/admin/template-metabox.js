/**
 * Block metabox: generate / preview starter theme templates.
 */

function i18n(key, fallback) {
  const dict = (window.blBlocksAdmin && window.blBlocksAdmin.i18n) || {};
  return dict[key] || fallback || key;
}

function currentConfig() {
  const input = document.getElementById('bl-forms-config-json');
  if (!input) {
    return { fields: [], settings: {} };
  }
  try {
    return JSON.parse(input.value || '{}') || { fields: [], settings: {} };
  } catch (e) {
    return { fields: [], settings: {} };
  }
}

function currentTitle() {
  const titleInput = document.getElementById('title');
  return titleInput ? String(titleInput.value || '').trim() : '';
}

async function requestStarter({ postId, write }) {
  const admin = window.blBlocksAdmin || {};
  const path = admin.starterPath || 'baselayer-blocks/v1/starter-template';
  const config = currentConfig();
  const body = {
    postId,
    write: !!write,
    fields: Array.isArray(config.fields) ? config.fields : [],
    title: currentTitle(),
  };

  if (window.wp && wp.apiFetch) {
    return wp.apiFetch({ path, method: 'POST', data: body });
  }

  const root =
    (window.wpApiSettings && window.wpApiSettings.root) ||
    (admin.restUrl || '/wp-json/');
  const url = String(root).replace(/\/?$/, '/') + path.replace(/^\//, '');
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-WP-Nonce': admin.restNonce || '',
    },
    body: JSON.stringify(body),
    credentials: 'same-origin',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message =
      (data && data.message) ||
      i18n('starterGenerateFailed', 'Could not generate the starter template.');
    throw new Error(message);
  }
  return data;
}

function closeModal(overlay) {
  overlay.remove();
  document.removeEventListener('keydown', overlay._onKey);
}

function downloadStarterFile(code, slug) {
  const safeSlug = String(slug || 'block')
    .replace(/[^a-z0-9_-]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase() || 'block';
  const filename = safeSlug + '.php';
  const blob = new Blob([String(code || '')], { type: 'application/x-httpd-php;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function openCodeModal(code, slug) {
  document.querySelectorAll('[data-bl-blocks-starter-modal]').forEach((node) => node.remove());

  const sourceId = 'bl-blocks-starter-code-' + String(Date.now());
  const overlay = document.createElement('div');
  overlay.className = 'bl-blocks-modal-overlay';
  overlay.setAttribute('data-bl-blocks-starter-modal', '1');
  overlay.setAttribute('role', 'presentation');

  const dialog = document.createElement('div');
  dialog.className = 'bl-blocks-modal bl-blocks-modal--starter';
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');
  dialog.setAttribute('aria-label', i18n('starterPreviewTitle', 'Starter template'));

  const header = document.createElement('div');
  header.className = 'bl-blocks-modal__header';
  const title = document.createElement('h2');
  title.className = 'bl-blocks-modal__title';
  title.textContent = i18n('starterPreviewTitle', 'Starter template');
  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'bl-blocks-modal__close';
  closeBtn.setAttribute('aria-label', i18n('starterClose', 'Close'));
  closeBtn.textContent = '×';
  header.append(title, closeBtn);

  const body = document.createElement('div');
  body.className = 'bl-blocks-modal__body';

  const admin = window.blBlocksAdmin || {};
  const editorSettings = admin.codeEditorSettings;
  const canUseCodeEditor =
    editorSettings &&
    window.wp &&
    window.wp.codeEditor &&
    typeof window.wp.codeEditor.initialize === 'function';

  if (canUseCodeEditor) {
    const wrap = document.createElement('div');
    wrap.className = 'bl-blocks-template-metabox__editor-wrap';
    const textarea = document.createElement('textarea');
    textarea.id = sourceId;
    textarea.className = 'bl-blocks-template-metabox__editor';
    textarea.setAttribute('readonly', '');
    textarea.value = code;
    wrap.appendChild(textarea);
    body.appendChild(wrap);
  } else {
    const pre = document.createElement('pre');
    pre.className = 'bl-blocks-template-metabox__code';
    const codeEl = document.createElement('code');
    codeEl.id = sourceId;
    codeEl.textContent = code;
    pre.appendChild(codeEl);
    body.appendChild(pre);
  }

  const footer = document.createElement('div');
  footer.className = 'bl-blocks-modal__footer';
  const copyBtn = document.createElement('button');
  copyBtn.type = 'button';
  copyBtn.className = 'button button-primary';
  copyBtn.setAttribute('data-bl-copy-from-source', sourceId);
  copyBtn.setAttribute(
    'data-bl-copy-feedback-text',
    i18n('starterCopied', 'Copied')
  );
  copyBtn.textContent = i18n('starterCopyCode', 'Copy code');
  const downloadBtn = document.createElement('button');
  downloadBtn.type = 'button';
  downloadBtn.className = 'button';
  downloadBtn.textContent = i18n('starterDownloadFile', 'Download file');
  const closeFooter = document.createElement('button');
  closeFooter.type = 'button';
  closeFooter.className = 'button';
  closeFooter.textContent = i18n('starterClose', 'Close');
  footer.append(copyBtn, downloadBtn, closeFooter);

  dialog.append(header, body, footer);
  overlay.appendChild(dialog);
  document.body.appendChild(overlay);

  if (canUseCodeEditor) {
    const editor = window.wp.codeEditor.initialize(sourceId, editorSettings);
    if (editor && editor.codemirror) {
      window.setTimeout(() => {
        editor.codemirror.refresh();
      }, 0);
      window.setTimeout(() => {
        editor.codemirror.refresh();
      }, 100);
    }
  }

  const onClose = () => closeModal(overlay);
  closeBtn.addEventListener('click', onClose);
  closeFooter.addEventListener('click', onClose);
  downloadBtn.addEventListener('click', () => {
    const source = document.getElementById(sourceId);
    const text =
      source && source.value !== undefined ? source.value : source ? source.textContent : code;
    downloadStarterFile(text, slug);
  });
  overlay.addEventListener('click', (evt) => {
    if (evt.target === overlay) onClose();
  });
  overlay._onKey = (evt) => {
    if (evt.key === 'Escape') onClose();
  };
  document.addEventListener('keydown', overlay._onKey);

  if (typeof window.baselayerInitCopyFromSource === 'function') {
    window.baselayerInitCopyFromSource(overlay);
  }
}

function setBusy(button, busy) {
  if (!button) return;
  button.disabled = !!busy;
  if (!button.hasAttribute('data-bl-blocks-generate-starter')) {
    return;
  }
  if (busy) {
    button.dataset.blBusyLabel = button.textContent;
    button.textContent = i18n('starterGenerating', 'Generating…');
  } else if (button.dataset.blBusyLabel) {
    button.textContent = button.dataset.blBusyLabel;
    delete button.dataset.blBusyLabel;
  }
}

async function onPreview(postId, trigger) {
  setBusy(trigger, true);
  try {
    const data = await requestStarter({ postId, write: false });
    openCodeModal(String((data && data.code) || ''), (data && data.slug) || 'block');
  } catch (err) {
    window.alert(
      (err && (err.message || err.error)) ||
        i18n('starterGenerateFailed', 'Could not generate the starter template.')
    );
  } finally {
    setBusy(trigger, false);
  }
}

async function onGenerate(postId, trigger) {
  setBusy(trigger, true);
  try {
    await requestStarter({ postId, write: true });
    window.location.reload();
  } catch (err) {
    window.alert(
      (err && (err.message || err.error)) ||
        i18n('starterWriteFailed', 'Could not create the template file.')
    );
    setBusy(trigger, false);
  }
}

export function bindTemplateMetabox() {
  const root = document.querySelector('[data-bl-blocks-template-metabox]');
  if (!root) return;

  const postId = Number(root.getAttribute('data-post-id') || 0);
  if (!postId) return;

  root.querySelectorAll('[data-bl-blocks-preview-starter]').forEach((btn) => {
    btn.addEventListener('click', () => onPreview(postId, btn));
  });

  const generateBtn = root.querySelector('[data-bl-blocks-generate-starter]');
  if (generateBtn) {
    generateBtn.addEventListener('click', () => onGenerate(postId, generateBtn));
  }
}

document.addEventListener('DOMContentLoaded', () => {
  bindTemplateMetabox();
});
