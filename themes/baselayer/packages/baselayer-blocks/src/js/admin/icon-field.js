/**
 * Icon field picker for PHP-rendered Website / admin field UI.
 */

function i18n(key, fallback) {
  const dict =
    (window.blBlocksFieldUi && window.blBlocksFieldUi.i18n) ||
    (window.blBlocksEditor && window.blBlocksEditor.i18n) ||
    (window.blBlocksAdmin && window.blBlocksAdmin.i18n) ||
    {};
  return dict[key] || fallback || key;
}

function iconDisplayName(slug) {
  if (!slug) return '';
  const labels = (window.baselayerIcons && window.baselayerIcons.labels) || {};
  const base = String(slug).replace(/-fill$/, '');
  if (labels[slug]) return labels[slug];
  if (labels[base]) return labels[base];
  return base
    .replace(/-/g, ' ')
    .replace(/^\w/, (char) => char.toUpperCase());
}

/**
 * @param {HTMLElement} wrap
 */
function bindOneIconPicker(wrap) {
  if (wrap.dataset.blIconBound === '1') return;
  wrap.dataset.blIconBound = '1';

  const hidden = wrap.querySelector('[data-bl-icon-input]');
  const valueRow = wrap.querySelector('.bl-icon-picker__value');
  const valueBody = wrap.querySelector('.bl-icon-picker__value-body');
  const chooseBtn = wrap.querySelector('[data-bl-icon-choose], .bl-icon-picker__trigger');
  const clearBtn = wrap.querySelector('[data-bl-icon-clear], .bl-icon-picker__clear');
  if (!(hidden instanceof HTMLInputElement) || !valueBody || !chooseBtn) return;

  const iconUi = (window.baselayerIcons && window.baselayerIcons.ui) || {};
  const chooseLabel = iconUi.choose || i18n('chooseIcon', 'Choose icon');
  const removeLabel = iconUi.remove || i18n('clearIcon', 'Remove');
  chooseBtn.textContent = chooseLabel;
  if (clearBtn) {
    clearBtn.title = removeLabel;
    clearBtn.setAttribute('aria-label', removeLabel);
  }

  const syncIconPreview = (slug) => {
    const next = slug ? String(slug) : '';
    hidden.value = next;
    valueBody.replaceChildren();
    if (next) {
      const icon = document.createElement('span');
      icon.className = 'bl-icon -icon-' + next;
      icon.setAttribute('aria-hidden', 'true');
      const name = document.createElement('span');
      name.className = 'bl-icon-picker__value-name';
      name.textContent = iconDisplayName(next);
      valueBody.append(icon, name);
      if (valueRow) valueRow.hidden = false;
    } else if (valueRow) {
      valueRow.hidden = true;
    }
    wrap.dispatchEvent(new Event('change', { bubbles: true }));
  };

  syncIconPreview(hidden.value || '');

  chooseBtn.addEventListener('click', async () => {
    try {
      const { openIconPicker } = await import(
        '../../../../../src/js/editor/icons/icon-picker-service.js'
      );
      openIconPicker({
        currentValue: hidden.value || '',
        returnFocus: chooseBtn,
        onSelect: (iconName) => syncIconPreview(iconName || ''),
      });
    } catch (err) {
      // Icon picker unavailable.
    }
  });

  if (clearBtn) {
    clearBtn.addEventListener('click', (evt) => {
      evt.preventDefault();
      evt.stopPropagation();
      syncIconPreview('');
    });
  }
}

/**
 * @param {ParentNode} [root=document]
 */
export function bindIconPickers(root = document) {
  const scope = root && root.querySelectorAll ? root : document;
  scope.querySelectorAll('[data-bl-blocks-icon-picker]').forEach((wrap) => {
    if (wrap instanceof HTMLElement) {
      bindOneIconPicker(wrap);
    }
  });
}
