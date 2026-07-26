/**
 * Menu icon field: catalog picker + optional custom SVG.
 */

import { openIconPicker } from '../../../../src/js/editor/icons/icon-picker-service.js';

function isSvgValue(value) {
  return typeof value === 'string' && value.trim().toLowerCase().includes('<svg');
}

function syncPreview(root, value) {
  const preview = root.querySelector('[data-bl-events-menu-icon-preview]');
  const empty = root.querySelector('[data-bl-events-menu-icon-empty]');
  if (!preview) {
    return;
  }

  const trimmed = (value || '').trim();
  preview.replaceChildren();
  preview.hidden = trimmed === '';
  if (empty) {
    empty.hidden = trimmed !== '';
  }

  if (trimmed === '') {
    return;
  }

  if (isSvgValue(trimmed)) {
    const wrap = document.createElement('span');
    wrap.className = 'bl-events-menu-icon-field__svg';
    wrap.innerHTML = trimmed;
    preview.appendChild(wrap);
    return;
  }

  const icon = document.createElement('span');
  icon.className = 'bl-icon -icon-' + trimmed.replace(/[^a-z0-9_-]/gi, '');
  icon.setAttribute('aria-hidden', 'true');
  preview.appendChild(icon);
}

function setSvgOpen(root, open) {
  const panel = root.querySelector('[data-bl-events-menu-icon-svg-panel]');
  const toggle = root.querySelector('[data-bl-events-menu-icon-svg-toggle]');
  if (panel) {
    panel.hidden = !open;
  }
  if (toggle) {
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.classList.toggle('is-active', open);
  }
}

export function bootMenuIconField() {
  const root = document.querySelector('[data-bl-events-menu-icon-field]');
  if (!root) {
    return;
  }

  const input = root.querySelector('[data-bl-events-menu-icon-value]');
  const textarea = root.querySelector('[data-bl-events-menu-icon-svg]');
  const chooseBtn = root.querySelector('[data-bl-events-menu-icon-choose]');
  const svgToggle = root.querySelector('[data-bl-events-menu-icon-svg-toggle]');
  const clearBtn = root.querySelector('[data-bl-events-menu-icon-clear]');

  if (!input) {
    return;
  }

  let value = input.value || '';
  const startWithSvg = isSvgValue(value);
  setSvgOpen(root, startWithSvg);
  if (textarea && startWithSvg) {
    textarea.value = value;
  }
  syncPreview(root, value);

  const commit = (next, { openSvg = false } = {}) => {
    value = next == null ? '' : String(next);
    input.value = value;
    if (textarea && isSvgValue(value)) {
      textarea.value = value;
    } else if (textarea && !openSvg) {
      // Keep textarea text if user is editing SVG, otherwise clear when picking catalog icon.
      if (!isSvgValue(value)) {
        textarea.value = '';
      }
    }
    syncPreview(root, value);
    if (openSvg) {
      setSvgOpen(root, true);
    }
  };

  if (chooseBtn) {
    chooseBtn.addEventListener('click', () => {
      openIconPicker({
        currentValue: isSvgValue(value) ? '' : value,
        returnFocus: chooseBtn,
        onSelect: (iconName) => {
          commit(iconName);
          setSvgOpen(root, false);
        },
      });
    });
  }

  if (svgToggle) {
    svgToggle.addEventListener('click', () => {
      const panel = root.querySelector('[data-bl-events-menu-icon-svg-panel]');
      const willOpen = panel ? panel.hidden : true;
      setSvgOpen(root, willOpen);
      if (willOpen && textarea) {
        textarea.focus();
      }
    });
  }

  if (textarea) {
    textarea.addEventListener('input', () => {
      commit(textarea.value, { openSvg: true });
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      commit('');
      setSvgOpen(root, false);
      if (textarea) {
        textarea.value = '';
      }
    });
  }
}
