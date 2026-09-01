/**
 * Shared admin field form renderer + modal shell for Blocks runtimes.
 */
import { createPagePickerControl, bindPagePickers } from './page-field.js';
import { createLinkControl, bindLinkFields } from './link-field.js';
import { createMediaPickerControl, bindMediaPickers } from './media-field.js';
import { bindIconPickers } from './icon-field.js';
import { bindAdminRepeaters } from './admin-repeater.js';
import {
  createSortable,
  dragStart,
  dragEnd,
} from '../../../../../src/js/admin/canvas-builder/sortable.js';
import {
  destroyWysiwygEditors,
  initWysiwygEditor,
  syncWysiwygTextarea,
} from './wysiwyg-field.js';

function whenInDocument(el, cb) {
  if (!el || typeof cb !== 'function') return;
  if (el.isConnected) {
    requestAnimationFrame(cb);
    return;
  }
  const obs = new MutationObserver(() => {
    if (el.isConnected) {
      obs.disconnect();
      requestAnimationFrame(cb);
    }
  });
  obs.observe(document.documentElement, { childList: true, subtree: true });
}

function el(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  Object.entries(props).forEach(([key, value]) => {
    if (value == null || value === false) return;
    if (key === 'className') node.className = value;
    else if (key === 'text') node.textContent = value;
    else if (key === 'html') node.innerHTML = value;
    else if (key === 'dataset') Object.assign(node.dataset, value);
    else if (key.startsWith('on') && typeof value === 'function') {
      node.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (key === 'checked') node.checked = Boolean(value);
    else if (key === 'value') node.value = value === true ? '' : String(value);
    else node.setAttribute(key, value === true ? '' : String(value));
  });
  (Array.isArray(children) ? children : [children]).forEach((child) => {
    if (child == null || child === false) return;
    node.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
  });
  return node;
}

function i18n(key, fallback) {
  const dict =
    (window.blBlocksFieldUi && window.blBlocksFieldUi.i18n) ||
    (window.blBlocksEditor && window.blBlocksEditor.i18n) ||
    (window.blBlocksPage && window.blBlocksPage.i18n) ||
    {};
  return dict[key] || fallback || key;
}

/** @param {unknown} raw */
function normalizeUiState(raw) {
  const base = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
  const repeaters =
    base.repeaters && typeof base.repeaters === 'object' && !Array.isArray(base.repeaters)
      ? { ...base.repeaters }
      : {};
  return { ...base, repeaters };
}

/** @param {{ repeaters?: Record<string, unknown> }} state */
function cloneUiState(state) {
  const repeaters = {};
  const src = (state && state.repeaters) || {};
  Object.keys(src).forEach((key) => {
    const flags = src[key];
    repeaters[key] = Array.isArray(flags) ? flags.map((v) => !!v) : [];
  });
  return { ...(state || {}), repeaters };
}

/**
 * Shared mutable UI state for a mounted field form tree.
 * @param {object} options
 */
function getUiShared(options) {
  if (options && options._uiShared) {
    return options._uiShared;
  }
  const shared = {
    state: normalizeUiState(options && options.uiState),
    notify() {
      if (options && typeof options.onUiStateChange === 'function') {
        options.onUiStateChange(cloneUiState(this.state));
      }
    },
  };
  if (options) {
    options._uiShared = shared;
  }
  return shared;
}

/** @param {string} parent @param {string} name */
function joinUiPath(parent, name) {
  const a = String(parent || '').replace(/^\.+|\.+$/g, '');
  const b = String(name || '').replace(/^\.+|\.+$/g, '');
  if (!a) return b;
  if (!b) return a;
  return a + '.' + b;
}

/** @param {object} options */
function resolveUiPathPrefix(options) {
  if (options && typeof options.getUiPath === 'function') {
    return String(options.getUiPath() || '');
  }
  return String((options && options.uiPath) || '');
}

/**
 * Clamp collapsed flags to row count (missing → expanded).
 * @param {unknown} flags
 * @param {number} length
 */
function clampCollapsedFlags(flags, length) {
  const src = Array.isArray(flags) ? flags : [];
  const out = [];
  for (let i = 0; i < length; i += 1) {
    out.push(i < src.length ? !!src[i] : false);
  }
  return out;
}

/**
 * Remap nested repeater UI keys under path when row indices change.
 * @param {Record<string, unknown>} repeaters
 * @param {string} path
 * @param {Record<number, number>} indexMap oldIndex → newIndex (-1 = removed)
 */
function remapNestedRepeaterKeys(repeaters, path, indexMap) {
  const prefix = path + '.';
  const next = {};
  Object.keys(repeaters || {}).forEach((key) => {
    if (key === path) {
      next[key] = repeaters[key];
      return;
    }
    if (!key.startsWith(prefix)) {
      next[key] = repeaters[key];
      return;
    }
    const rest = key.slice(prefix.length);
    const match = rest.match(/^(\d+)([\s\S]*)$/);
    if (!match) {
      next[key] = repeaters[key];
      return;
    }
    const oldIdx = parseInt(match[1], 10);
    const newIdx = indexMap[oldIdx];
    if (newIdx == null || newIdx < 0) {
      return;
    }
    next[prefix + String(newIdx) + match[2]] = repeaters[key];
  });
  return next;
}

/** @param {number} length @param {number} from @param {number} to */
function buildReorderIndexMap(length, from, to) {
  const order = Array.from({ length }, (_, i) => i);
  if (from < 0 || from >= length || to < 0 || to >= length || from === to) {
    const identity = {};
    for (let i = 0; i < length; i += 1) identity[i] = i;
    return identity;
  }
  const [item] = order.splice(from, 1);
  order.splice(to, 0, item);
  const map = {};
  order.forEach((oldIdx, newIdx) => {
    map[oldIdx] = newIdx;
  });
  return map;
}

/** @param {number} length @param {number} removed */
function buildRemoveIndexMap(length, removed) {
  const map = {};
  for (let i = 0; i < length; i += 1) {
    if (i === removed) map[i] = -1;
    else if (i > removed) map[i] = i - 1;
    else map[i] = i;
  }
  return map;
}

function isLayout(type) {
  return type === 'column' || type === 'section' || type === 'tab' || type === 'group';
}

/**
 * Pack factor (0–1) for flex row grouping, or null when width is not a shareable %.
 *
 * @param {object} field
 * @returns {number|null}
 */
function fieldPackFactor(field) {
  const width = String((field && field.width) || '100');
  if (width === 'auto') {
    return null;
  }
  if (width === 'custom') {
    const custom = String((field && field.width_custom) || '').trim();
    if (custom === '') {
      return 1;
    }
    const match = custom.match(/^(\d+(?:\.\d+)?)%$/);
    if (!match) {
      return null;
    }
    return Math.max(0, Math.min(1, parseFloat(match[1]) / 100));
  }
  const map = {
    100: 1,
    75: 0.75,
    66: 0.666667,
    50: 0.5,
    33: 0.333333,
    25: 0.25,
  };
  if (Object.prototype.hasOwnProperty.call(map, width)) {
    return map[width];
  }
  const pct = parseInt(width, 10);
  if (!Number.isFinite(pct) || pct <= 0) {
    return 1;
  }
  return Math.max(0, Math.min(1, pct / 100));
}

/**
 * Group fields into rows the way percentage widths pack on desktop (Forms).
 *
 * @param {object[]} fields
 * @returns {object[][]}
 */
function chunkFieldsIntoRows(fields) {
  const rows = [];
  let current = [];
  let sum = 0;

  (fields || []).forEach((field) => {
    if (!field) return;
    const factor = fieldPackFactor(field);
    const pack = factor == null ? 1 : factor;

    if (factor == null || pack >= 0.999) {
      if (current.length) {
        rows.push(current);
        current = [];
        sum = 0;
      }
      rows.push([field]);
      return;
    }

    if (sum > 0 && sum + pack > 1.001) {
      rows.push(current);
      current = [];
      sum = 0;
    }

    current.push(field);
    sum += pack;
  });

  if (current.length) {
    rows.push(current);
  }
  return rows;
}

/**
 * Apply flex width for a field/column cell in a modal flex row.
 * Percent widths set CSS vars; SCSS owns flex-basis + gap share.
 *
 * @param {HTMLElement} wrap
 * @param {object} field
 * @param {{ autoClass?: string }} [opts]
 */
function applyFieldWidth(wrap, field, opts = {}) {
  const width = String((field && field.width) || '100');
  const autoClass = opts.autoClass || '';

  const clearLayoutStyles = () => {
    wrap.style.flex = '';
    wrap.style.width = '';
    wrap.style.maxWidth = '';
    wrap.style.minWidth = '';
    wrap.style.removeProperty('--bl-blocks-field-width');
    wrap.style.removeProperty('--bl-blocks-field-width-factor');
  };

  const setPercentVars = (pct) => {
    const factor = Math.max(0, Math.min(1, pct / 100));
    clearLayoutStyles();
    wrap.style.setProperty('--bl-blocks-field-width', `${pct}%`);
    wrap.style.setProperty('--bl-blocks-field-width-factor', String(factor));
  };

  if (width === 'auto') {
    clearLayoutStyles();
    if (autoClass) {
      wrap.classList.add(autoClass);
    } else {
      wrap.style.flex = '1 1 0';
      wrap.style.width = 'auto';
      wrap.style.minWidth = '0';
      wrap.style.maxWidth = '100%';
    }
    return;
  }
  if (width === 'custom') {
    const custom = String((field && field.width_custom) || '').trim();
    if (custom) {
      const match = custom.match(/^(\d+(?:\.\d+)?)%$/);
      if (match) {
        const pct = parseFloat(match[1]);
        if (Number.isFinite(pct) && pct > 0) {
          setPercentVars(pct);
          return;
        }
      }
      clearLayoutStyles();
      wrap.style.flex = '0 1 auto';
      wrap.style.width = custom;
      wrap.style.maxWidth = '100%';
      wrap.style.minWidth = '0';
      return;
    }
    setPercentVars(100);
    return;
  }
  const map = {
    100: 100,
    75: 75,
    66: 66.6667,
    50: 50,
    33: 33.3333,
    25: 25,
  };
  let pct = map[width];
  if (pct == null) {
    const parsed = parseInt(width, 10);
    pct = Number.isFinite(parsed) && parsed > 0 ? parsed : 100;
  }
  setPercentVars(pct);
}

/**
 * @param {HTMLElement} wrap
 * @param {object} field
 */
function applyColumnWidth(wrap, field) {
  applyFieldWidth(wrap, field, {
    autoClass: 'bl-blocks-fields__layout--column-auto',
  });
}

function isStatic(type) {
  return (
    type === 'divider' ||
    type === 'spacer' ||
    type === 'row_break' ||
    type === 'heading' ||
    type === 'text_block' ||
    type === 'html' ||
    type === 'honeypot' ||
    type === 'captcha'
  );
}

/** @param {object} field */
function fieldShowAsCheckbox(field) {
  const type = field && field.type ? field.type : '';
  if (type === 'toggle') {
    return !!field.show_as_checkbox;
  }
  if (type === 'terms' || type === 'checkboxes') {
    return field.show_as_checkbox === undefined ? true : !!field.show_as_checkbox;
  }
  return true;
}

/** Build checkbox or switch control with optional adjacent text. */
function createBooleanControl(field, id, checked) {
  const asCheckbox = fieldShowAsCheckbox(field);
  const adjacent = String(field.content || '').trim();
  const input = el('input', {
    type: 'checkbox',
    id,
    checked: !!checked,
  });
  if (asCheckbox) {
    const children = [input];
    if (adjacent) {
      children.push(document.createTextNode(' '));
      children.push(el('span', { text: adjacent }));
    }
    return el('label', { className: 'bl-blocks-fields__choice' }, children);
  }
  const children = [
    input,
    el('span', { className: 'bl-blocks-fields__switch-ui', 'aria-hidden': 'true' }),
  ];
  if (adjacent) {
    children.push(el('span', { className: 'bl-blocks-fields__switch-label', text: adjacent }));
  }
  return el('label', { className: 'bl-blocks-fields__switch' }, children);
}

/**
 * Coerce field lists that arrived as JSON objects (non-sequential keys).
 *
 * @param {unknown} fields
 * @returns {array}
 */
function normalizeFieldList(fields) {
  if (Array.isArray(fields)) {
    return fields;
  }
  if (fields && typeof fields === 'object') {
    return Object.keys(fields)
      .sort((a, b) => Number(a) - Number(b))
      .map((key) => fields[key])
      .filter(Boolean);
  }
  return [];
}

/**
 * Strip any scheme and force https://. Loose check — any host-like value is fine.
 */
function normalizeHttpsUrl(raw) {
  let v = String(raw || '').replace(
    /^[\s\u00A0\u2000-\u200B\uFEFF]+|[\s\u00A0\u2000-\u200B\uFEFF]+$/g,
    ''
  );
  if (!v) return '';
  v = v.replace(/^[a-z][a-z0-9+.\-]*:/i, '').replace(/^\/\//, '');
  v = v.replace(/^[\s\u00A0\u2000-\u200B\uFEFF]+|[\s\u00A0\u2000-\u200B\uFEFF]+$/g, '');
  if (!v || v.startsWith('/') || v.startsWith('#') || v.startsWith('?')) {
    return '';
  }
  if (/\s/.test(v)) {
    return '';
  }
  const host = v.split(/[/?#]/)[0].split(':')[0];
  if (!host || !/[a-z0-9]/i.test(host)) {
    return '';
  }
  return 'https://' + v;
}

function bindHttpsUrlInput(input) {
  if (!(input instanceof HTMLInputElement) || input.dataset.blHttpsUrlBound === '1') {
    return;
  }
  input.dataset.blHttpsUrlBound = '1';
  input.addEventListener('blur', () => {
    const next = normalizeHttpsUrl(input.value);
    if (next !== '') {
      input.value = next;
    }
  });
}

/**
 * Bind PHP-rendered URL fields (Website / classic admin).
 *
 * @param {ParentNode} [root=document]
 */
export function bindHttpsUrlFields(root = document) {
  root.querySelectorAll('input[data-bl-blocks-https-url]').forEach((input) => {
    bindHttpsUrlInput(input);
  });
}

function collectLeafValue(field, control, type) {
  const name = field.name;
  if (!name) return null;
  if (type === 'page' && control && typeof control.getPageValue === 'function') {
    return control.getPageValue();
  }
  if ((type === 'image' || type === 'file') && control && typeof control.getMediaValue === 'function') {
    return control.getMediaValue();
  }
  if (type === 'link' && control && typeof control.getLinkValue === 'function') {
    return control.getLinkValue();
  }
  if (type === 'icon' && control && typeof control.getIconValue === 'function') {
    return control.getIconValue();
  }
  if (type === 'range' && control && typeof control.getRangeValue === 'function') {
    return control.getRangeValue();
  }
  if (type === 'wysiwyg' && control && control.tagName === 'TEXTAREA') {
    syncWysiwygTextarea(control);
    return control.value;
  }
  if (type === 'select') {
    if (control.multiple) {
      return Array.from(control.selectedOptions).map((o) => o.value);
    }
    return control.value;
  }
  if (type === 'checkboxes') {
    return Array.from(control.querySelectorAll('input[type="checkbox"]:checked')).map(
      (input) => input.value
    );
  }
  if (type === 'radio' || type === 'button_group') {
    const checked = control.querySelector('input[type="radio"]:checked');
    return checked ? checked.value : '';
  }
  if (type === 'toggle' || type === 'terms') {
    const input = control.tagName === 'INPUT' ? control : control.querySelector('input');
    return input && input.checked ? '1' : '';
  }
  if (type === 'url' && control && 'value' in control) {
    const next = normalizeHttpsUrl(control.value);
    if (next !== '' && next !== control.value) {
      control.value = next;
    }
    return next !== '' ? next : String(control.value || '').trim();
  }
  if (control && 'value' in control) {
    return control.value;
  }
  return '';
}

/**
 * Normalize conditional_logic for runtime evaluation (enabled + non-empty groups).
 *
 * @param {unknown} raw
 * @returns {{ enabled: boolean, groups: array }|null}
 */
function normalizeRuntimeLogic(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const logic = /** @type {{ enabled?: boolean, groups?: unknown }} */ (raw);
  if (!logic.enabled || !Array.isArray(logic.groups) || !logic.groups.length) {
    return null;
  }
  return /** @type {{ enabled: boolean, groups: array }} */ (logic);
}

function logicValueIsEmpty(value) {
  if (Array.isArray(value)) return value.length === 0;
  return String(value ?? '').trim() === '';
}

function logicCompare(left, right, operator) {
  const a = Array.isArray(left) ? '' : String(left ?? '');
  const b = Array.isArray(right) ? '' : String(right ?? '');
  if (a === '' || b === '') return false;
  if (a !== '' && b !== '' && !Number.isNaN(Number(a)) && !Number.isNaN(Number(b))) {
    const an = Number(a);
    const bn = Number(b);
    if (operator === '>') return an > bn;
    if (operator === '<') return an < bn;
    if (operator === '>=') return an >= bn;
    if (operator === '<=') return an <= bn;
    return false;
  }
  const cmp = a < b ? -1 : a > b ? 1 : 0;
  if (operator === '>') return cmp > 0;
  if (operator === '<') return cmp < 0;
  if (operator === '>=') return cmp >= 0;
  if (operator === '<=') return cmp <= 0;
  return false;
}

/**
 * @param {{ field?: string, operator?: string, value?: string }} rule
 * @param {unknown} value
 */
function logicRulePasses(rule, value) {
  const operator = String((rule && rule.operator) || '');
  const expected = String((rule && rule.value) ?? '');
  const empty = logicValueIsEmpty(value);

  switch (operator) {
    case 'checked':
      return !empty && !Array.isArray(value) && String(value) !== '0';
    case 'not_checked':
      return empty || (!Array.isArray(value) && String(value) === '0');
    case '==empty':
      return empty;
    case '!=empty':
      return !empty;
    case '==':
      return Array.isArray(value) ? value.includes(expected) : String(value) === expected;
    case '!=':
      return Array.isArray(value) ? !value.includes(expected) : String(value) !== expected;
    case 'contains':
      return Array.isArray(value)
        ? value.includes(expected)
        : expected !== '' && String(value).includes(expected);
    case 'not_contains':
      return Array.isArray(value)
        ? !value.includes(expected)
        : expected === '' || !String(value).includes(expected);
    case '>':
    case '<':
    case '>=':
    case '<=':
      return logicCompare(value, expected, operator);
    default:
      return false;
  }
}

/**
 * Whether logic groups pass (OR between groups, AND within a group).
 *
 * @param {{ groups: array }} logic
 * @param {(fieldId: string) => unknown} getSourceValue
 */
function logicConditionsMet(logic, getSourceValue) {
  const groups = logic && Array.isArray(logic.groups) ? logic.groups : [];
  for (let g = 0; g < groups.length; g += 1) {
    const group = groups[g];
    if (!Array.isArray(group) || !group.length) continue;
    let groupOk = true;
    for (let r = 0; r < group.length; r += 1) {
      const rule = group[r];
      if (!rule || typeof rule !== 'object') {
        groupOk = false;
        break;
      }
      const value = getSourceValue(String(rule.field || ''));
      if (!logicRulePasses(rule, value)) {
        groupOk = false;
        break;
      }
    }
    if (groupOk) return true;
  }
  return false;
}

function createLeafControl(field, values, controls) {
  const type = field.type || 'text';
  const name = field.name || '';
  if (!name) return null;

  const current =
    values[name] !== undefined && values[name] !== null
      ? values[name]
      : field.default_value != null
        ? field.default_value
        : '';

  const row = el('div', {
    className: 'bl-blocks-fields__row',
    dataset: { fieldName: name },
  });
  const id = 'bl-blocks-ui-' + name.replace(/[^a-z0-9_-]/gi, '_') + '-' + Math.random().toString(36).slice(2, 7);

  if (!field.hide_label) {
    const label = el('label', { className: 'bl-blocks-fields__label', text: field.label || name });
    label.setAttribute('for', id);
    if (field.required) {
      label.appendChild(document.createTextNode(' '));
      label.appendChild(el('span', { className: 'required', text: '*' }));
    }
    row.appendChild(label);
  }

  let control = null;
  const options = Array.isArray(field.options) ? field.options : [];

  if (type === 'textarea') {
    control = el('textarea', {
      className: 'widefat',
      id,
      rows: field.rows || 4,
      value: current == null ? '' : String(current),
    });
    if (field.placeholder) control.placeholder = field.placeholder;
  } else if (type === 'wysiwyg') {
    control = el('textarea', {
      className: 'widefat bl-blocks-fields__wysiwyg',
      id,
      rows: 8,
      value: current == null ? '' : String(current),
      dataset: { blWysiwyg: '1' },
    });
    // TinyMCE init after the node is in the DOM (caller appends row first).
    control._blInitWysiwyg = () => {
      initWysiwygEditor(id, field, {
        onChange: (html) => {
          if (control.value === html) return;
          control.value = html;
          // SidebarFields / logic sync on bubbled input|change (TinyMCE does not).
          control.dispatchEvent(new Event('input', { bubbles: true }));
        },
      });
    };
  } else if (type === 'select') {
    const multiple = !!field.multiple;
    const allowNull =
      !multiple &&
      (field.allow_null === undefined ||
        (field.allow_null !== false && field.allow_null !== 0 && field.allow_null !== '0'));
    control = el('select', { className: 'widefat', id });
    if (multiple) control.multiple = true;
    if (field.required) control.required = true;
    if (allowNull) {
      const emptyLabel =
        String(field.placeholder || '').trim() ||
        i18n('selectEmptyOptionPlaceholder', 'Please select…');
      control.appendChild(el('option', { value: '', text: emptyLabel }));
    }
    const selected = multiple
      ? (Array.isArray(current) ? current : []).map(String)
      : [String(current == null ? '' : current)];
    options.forEach((opt) => {
      const ov = String(opt.value ?? '');
      const option = el('option', { value: ov, text: opt.label || ov });
      if (selected.includes(ov)) option.selected = true;
      control.appendChild(option);
    });
  } else if (type === 'button_group') {
    const layout = field.layout === 'vertical' ? 'vertical' : 'horizontal';
    control = el('div', {
      className: 'bl-blocks-fields__button-group -' + layout,
      role: 'group',
    });
    options.forEach((opt, i) => {
      const ov = String(opt.value ?? '');
      const oid = id + '-' + i;
      const input = el('input', {
        type: 'radio',
        name: id,
        id: oid,
        value: ov,
        checked: String(current) === ov,
      });
      control.appendChild(
        el('label', { className: 'bl-blocks-fields__btn-option', for: oid }, [
          input,
          el('span', { text: opt.label || ov }),
        ])
      );
    });
  } else if (type === 'radio') {
    control = el('div', { className: 'bl-blocks-fields__choices' });
    options.forEach((opt, i) => {
      const ov = String(opt.value ?? '');
      const oid = id + '-' + i;
      const input = el('input', {
        type: 'radio',
        name: id,
        id: oid,
        value: ov,
        checked: String(current) === ov,
      });
      control.appendChild(
        el('label', { className: 'bl-blocks-fields__choice' }, [
          input,
          document.createTextNode(' ' + (opt.label || ov)),
        ])
      );
    });
  } else if (type === 'checkboxes') {
    control = el('div', { className: 'bl-blocks-fields__choices' });
    const list = Array.isArray(current) ? current.map(String) : [];
    const asCheckbox = fieldShowAsCheckbox(field);
    options.forEach((opt, i) => {
      const ov = String(opt.value ?? '');
      const oid = id + '-' + i;
      const input = el('input', {
        type: 'checkbox',
        id: oid,
        value: ov,
        checked: list.includes(ov),
      });
      const optLabel = opt.label || ov;
      if (asCheckbox) {
        control.appendChild(
          el('label', { className: 'bl-blocks-fields__choice' }, [
            input,
            document.createTextNode(' ' + optLabel),
          ])
        );
      } else {
        control.appendChild(
          el('label', { className: 'bl-blocks-fields__switch' }, [
            input,
            el('span', { className: 'bl-blocks-fields__switch-ui', 'aria-hidden': 'true' }),
            el('span', { className: 'bl-blocks-fields__switch-label', text: optLabel }),
          ])
        );
      }
    });
  } else if (type === 'toggle' || type === 'terms') {
    control = createBooleanControl(
      field,
      id,
      !!current && current !== '0' && current !== ''
    );
  } else if (type === 'hidden') {
    control = el('input', {
      type: 'hidden',
      id,
      value: current == null ? '' : String(current),
    });
  } else if (type === 'page') {
    control = createPagePickerControl(field, current);
    if (control) control.id = id;
  } else if (type === 'image' || type === 'file') {
    control = createMediaPickerControl(field, current);
    if (control) control.id = id;
  } else if (type === 'link') {
    control = createLinkControl(field, current);
    if (control) control.id = id;
  } else if (type === 'icon') {
    const iconUi = (window.baselayerIcons && window.baselayerIcons.ui) || {};
    const iconLabels = (window.baselayerIcons && window.baselayerIcons.labels) || {};
    const chooseLabel = iconUi.choose || i18n('chooseIcon', 'Choose icon');
    const removeLabel = iconUi.remove || i18n('clearIcon', 'Remove');
    const humanizeIcon = (slug) =>
      String(slug || '')
        .replace(/-/g, ' ')
        .replace(/^\w/, (char) => char.toUpperCase());
    const iconDisplayName = (slug) => {
      if (!slug) return '';
      const base = String(slug).replace(/-fill$/, '');
      return iconLabels[slug] || iconLabels[base] || humanizeIcon(base || slug);
    };

    const hidden = el('input', {
      type: 'hidden',
      id,
      value: current == null ? '' : String(current),
    });
    const valueBody = el('div', { className: 'bl-icon-picker__value-body' });
    const clearBtn = el(
      'button',
      {
        type: 'button',
        className: 'button-link bl-blocks-fields__card-remove bl-icon-picker__clear',
        title: removeLabel,
        'aria-label': removeLabel,
      },
      [el('span', { className: 'bl-icon -icon-close', 'aria-hidden': 'true' })]
    );
    const valueRow = el('div', { className: 'bl-icon-picker__value' }, [valueBody, clearBtn]);
    const chooseBtn = el('button', {
      type: 'button',
      className: 'button bl-icon-picker__trigger',
      text: chooseLabel,
    });
    const actions = el('div', { className: 'bl-icon-picker__control' }, [chooseBtn]);

    const syncIconPreview = (slug) => {
      const next = slug ? String(slug) : '';
      hidden.value = next;
      valueBody.replaceChildren();
      if (next) {
        valueBody.append(
          el('span', { className: 'bl-icon -icon-' + next, 'aria-hidden': 'true' }),
          el('span', { className: 'bl-icon-picker__value-name', text: iconDisplayName(next) })
        );
        valueRow.hidden = false;
      } else {
        valueRow.hidden = true;
      }
      // SidebarFields syncs on bubbled change; picker updates do not fire input/change alone.
      if (control) {
        control.dispatchEvent(new Event('change', { bubbles: true }));
      }
    };
    syncIconPreview(current == null ? '' : String(current));

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
        // Icon picker unavailable — leave hidden input editable via clear only.
      }
    });
    clearBtn.addEventListener('click', (evt) => {
      evt.preventDefault();
      evt.stopPropagation();
      syncIconPreview('');
    });

    control = el('div', { className: 'bl-blocks-fields__icon bl-icon-picker' }, [
      valueRow,
      actions,
      hidden,
    ]);
    control.getIconValue = () => hidden.value || '';
  } else if (type === 'range') {
    const mode = field.mode === 'single' ? 'single' : 'range';
    const minFallback =
      field.min != null && field.min !== '' ? String(field.min) : '';
    const maxFallback =
      field.max != null && field.max !== '' ? String(field.max) : '';
    const resolveCurrent = () => {
      const hasStored = values[name] !== undefined && values[name] !== null;
      if (mode === 'single') {
        if (hasStored) {
          if (typeof current === 'object' && !Array.isArray(current)) {
            return current.from != null && current.from !== ''
              ? String(current.from)
              : '';
          }
          return current === '' ? '' : String(current);
        }
        const dv = field.default_value;
        if (dv != null && typeof dv === 'object' && !Array.isArray(dv)) {
          if (dv.from != null && dv.from !== '') return String(dv.from);
        } else if (dv != null && String(dv).trim() !== '') {
          return String(dv).trim();
        }
        return minFallback;
      }
      if (hasStored && typeof current === 'object' && !Array.isArray(current)) {
        return {
          from: current.from != null && current.from !== '' ? String(current.from) : '',
          to: current.to != null && current.to !== '' ? String(current.to) : '',
        };
      }
      if (hasStored && (typeof current === 'string' || typeof current === 'number')) {
        return { from: String(current), to: '' };
      }
      const dv = field.default_value;
      const fromDv =
        dv && typeof dv === 'object' && !Array.isArray(dv) && dv.from != null && dv.from !== ''
          ? String(dv.from)
          : '';
      const toDv =
        dv && typeof dv === 'object' && !Array.isArray(dv) && dv.to != null && dv.to !== ''
          ? String(dv.to)
          : '';
      return {
        from: fromDv !== '' ? fromDv : minFallback,
        to: toDv !== '' ? toDv : maxFallback,
      };
    };
    const resolved = resolveCurrent();
    const prefix = field.prefix != null ? String(field.prefix).trim() : '';
    const suffix = field.suffix != null ? String(field.suffix).trim() : '';
    const applyBounds = (input) => {
      if (field.min != null && field.min !== '') input.min = String(field.min);
      if (field.max != null && field.max !== '') input.max = String(field.max);
      if (field.step != null && field.step !== '') input.step = String(field.step);
    };
    const wrapAffix = (input) => {
      if (!prefix && !suffix) return input;
      const group = el('div', { className: 'bl-blocks-fields__input-group' });
      if (prefix) {
        group.appendChild(
          el('span', { className: 'bl-blocks-fields__affix bl-blocks-fields__affix--prefix', text: prefix })
        );
      }
      group.appendChild(input);
      if (suffix) {
        group.appendChild(
          el('span', { className: 'bl-blocks-fields__affix bl-blocks-fields__affix--suffix', text: suffix })
        );
      }
      return group;
    };

    if (mode === 'single') {
      const input = el('input', {
        className: 'widefat',
        type: 'number',
        id,
        value: resolved == null ? '' : String(resolved),
      });
      applyBounds(input);
      control = wrapAffix(input);
      control.getRangeValue = () => input.value.trim();
    } else {
      const pair = resolved && typeof resolved === 'object' ? resolved : { from: '', to: '' };
      const fromInput = el('input', {
        className: 'widefat',
        type: 'number',
        id,
        value: pair.from,
        'aria-label': i18n('rangeFrom', 'From'),
      });
      const toInput = el('input', {
        className: 'widefat',
        type: 'number',
        id: id + '-to',
        value: pair.to,
        'aria-label': i18n('rangeTo', 'To'),
      });
      applyBounds(fromInput);
      applyBounds(toInput);
      control = el('div', { className: 'bl-blocks-fields__range' }, [
        wrapAffix(fromInput),
        el('span', { className: 'bl-blocks-fields__range-sep', text: '–' }),
        wrapAffix(toInput),
      ]);
      control.getRangeValue = () => ({
        from: fromInput.value.trim(),
        to: toInput.value.trim(),
      });
    }
  } else {
    let inputType = 'text';
    if (type === 'email' || type === 'number' || type === 'date' || type === 'time') {
      inputType = type;
    } else if (type === 'phone') {
      inputType = 'tel';
    } else if (type === 'datetime') {
      inputType = 'datetime-local';
    }
    control = el('input', {
      className: 'widefat',
      type: inputType,
      id,
      value: current == null ? '' : String(current),
    });
    if (field.placeholder) control.placeholder = field.placeholder;
    if (type === 'number') {
      if (field.min != null && field.min !== '') control.min = String(field.min);
      if (field.max != null && field.max !== '') control.max = String(field.max);
      if (field.step != null && field.step !== '') control.step = String(field.step);
    }
    if (type === 'url') {
      if (!control.placeholder) control.placeholder = 'https://';
      bindHttpsUrlInput(control);
    }
  }

  if (control) {
    const prefix = field.prefix != null ? String(field.prefix).trim() : '';
    const suffix = field.suffix != null ? String(field.suffix).trim() : '';
    const affixTypes = ['text', 'email', 'phone', 'url', 'number', 'date', 'time', 'datetime'];
    if ((prefix || suffix) && affixTypes.includes(type) && control.tagName === 'INPUT') {
      const group = el('div', { className: 'bl-blocks-fields__input-group' });
      if (prefix) {
        group.appendChild(
          el('span', { className: 'bl-blocks-fields__affix bl-blocks-fields__affix--prefix', text: prefix })
        );
      }
      group.appendChild(control);
      if (suffix) {
        group.appendChild(
          el('span', { className: 'bl-blocks-fields__affix bl-blocks-fields__affix--suffix', text: suffix })
        );
      }
      row.appendChild(group);
    } else if (type === 'wysiwyg') {
      // Wrapper keeps TinyMCE chrome (.mce-tinymce) targetable from admin/theme CSS.
      row.appendChild(el('div', { className: 'bl-wysiwyg-editor' }, [control]));
    } else {
      row.appendChild(control);
    }
    if (type === 'wysiwyg' && typeof control._blInitWysiwyg === 'function') {
      whenInDocument(control, () => {
        if (typeof control._blInitWysiwyg === 'function') {
          control._blInitWysiwyg();
          delete control._blInitWysiwyg;
        }
      });
    }
    controls.push({ field, control, type });
  }
  if (field.description) {
    row.appendChild(
      el('p', { className: 'description bl-blocks-fields__description', text: field.description })
    );
  }
  return row;
}

/**
 * Build an editable field form from a definition schema.
 *
 * @param {array} fields
 * @param {object} values
 * @param {{
 *   layout?: 'default'|'compact',
 *   uiState?: object,
 *   onUiStateChange?: (ui: object) => void,
 *   uiPath?: string,
 *   getUiPath?: () => string,
 *   _uiShared?: object,
 * }} [options]
 * @returns {{ root: HTMLElement, getValues: () => object }}
 */
export function createFieldForm(fields, values = {}, options = {}) {
  const compact = options && options.layout === 'compact';
  getUiShared(options);
  const rootAttrs = {
    className:
      'bl-blocks-fields bl-admin-form' + (compact ? ' bl-blocks-fields--compact' : ''),
    dataset: { blBlocksFields: '' },
  };
  if (compact) {
    rootAttrs.dataset.layout = 'compact';
  }
  const root = el('div', rootAttrs);
  /** @type {Array<{ kind: 'leaf'|'repeater', field: object, control?: HTMLElement, type?: string, getRows?: Function }>} */
  const entries = [];
  /** @type {Record<string, object>} */
  const fieldById = Object.create(null);
  /** @type {Array<{ el: HTMLElement, logic: { enabled: boolean, groups: array } }>} */
  const logicTargets = [];
  fields = normalizeFieldList(fields);

  const registerField = (field) => {
    const id = field && field.id != null ? String(field.id).trim() : '';
    if (id) {
      fieldById[id] = field;
    }
  };

  const registerLogicTarget = (el, field) => {
    const logic = normalizeRuntimeLogic(field && field.conditional_logic);
    if (!logic || !el) return;
    logicTargets.push({ el, logic });
  };

  const getLogicSourceValue = (fieldId) => {
    const def = fieldById[fieldId];
    if (!def || !def.name) return '';
    const entry = entries.find(
      (e) => e.kind === 'leaf' && e.field && e.field.name === def.name
    );
    if (!entry) return '';
    const val = collectLeafValue(entry.field, entry.control, entry.type);
    return val == null ? '' : val;
  };

  const evaluateLogic = () => {
    logicTargets.forEach(({ el, logic }) => {
      el.hidden = !logicConditionsMet(logic, getLogicSourceValue);
    });
  };

  const appendLayoutWrap = (field, type, parent, valueMap) => {
    registerField(field);
    const design = ['standard', 'outline', 'card'].includes(field.design)
      ? field.design
      : 'standard';
    const layoutClass = [
      'bl-blocks-fields__layout',
      'bl-blocks-fields__layout--' + type,
      'bl-blocks-fields__layout--' + design,
    ];
    if (field.css_class) {
      layoutClass.push(String(field.css_class).trim());
    }
    const wrap = el('div', { className: layoutClass.filter(Boolean).join(' ') });
    const showTitle =
      type !== 'section' ||
      (field.show_title !== false && field.show_title !== 0 && field.show_title !== '0');
    if (type === 'section' && showTitle && field.label) {
      wrap.appendChild(el('h3', { className: 'bl-blocks-fields__section-title', text: field.label }));
    }
    if (type === 'column' && !compact) {
      applyColumnWidth(wrap, field);
    }
    registerLogicTarget(wrap, field);
    parent.appendChild(wrap);
    walk(field.children || [], wrap, valueMap);
    return wrap;
  };

  /**
   * Consecutive column fields → flex row group (Forms-style).
   *
   * @param {object[]} columns
   * @param {HTMLElement} parent
   * @param {object} valueMap
   */
  const appendColumnGroup = (columns, parent, valueMap) => {
    const active = (columns || []).filter((col) => col && col.active !== false);
    if (!active.length) return;
    if (compact || active.length === 1) {
      active.forEach((col) => appendLayoutWrap(col, 'column', parent, valueMap));
      return;
    }
    const group = el('div', { className: 'bl-blocks-fields__columns' });
    active.forEach((col) => appendLayoutWrap(col, 'column', group, valueMap));
    parent.appendChild(group);
  };

  const appendTabGroup = (tabs, parent, valueMap) => {
    const activeTabs = (tabs || []).filter((tab) => tab && tab.active !== false);
    if (!activeTabs.length) return;

    const group = el('div', {
      className: 'bl-blocks-fields__tabs',
      dataset: { blBlocksTabs: '1' },
    });
    const tablist = el('div', {
      className: 'bl-blocks-fields__tablist',
      role: 'tablist',
    });
    const panels = [];

    activeTabs.forEach((tab, index) => {
      registerField(tab);
      const tabId = String(tab.id || 'tab' + index);
      const panelId = 'bl-blocks-tab-panel-' + tabId;
      const btnId = 'bl-blocks-tab-' + tabId;
      const label = String(tab.label || '').trim() || i18n('tabType', 'Tab') + ' ' + (index + 1);
      const btn = el('button', {
        type: 'button',
        className: 'bl-blocks-fields__tab' + (index === 0 ? ' is-active' : ''),
        role: 'tab',
        id: btnId,
        'aria-controls': panelId,
        'aria-selected': index === 0 ? 'true' : 'false',
        tabindex: index === 0 ? '0' : '-1',
        text: label,
        dataset: { blBlocksTab: '1' },
      });
      tablist.appendChild(btn);

      const design = 'standard';
      const panelClass = [
        'bl-blocks-fields__tab-panel',
        'bl-blocks-fields__tab-panel--' + design,
      ];
      if (tab.css_class) {
        panelClass.push(String(tab.css_class).trim());
      }
      const panel = el('div', {
        className: panelClass.filter(Boolean).join(' '),
        role: 'tabpanel',
        id: panelId,
        'aria-labelledby': btnId,
        hidden: index !== 0,
      });
      walk(tab.children || [], panel, valueMap);
      panels.push(panel);
    });

    const activate = (index) => {
      Array.from(tablist.children).forEach((btn, i) => {
        const on = i === index;
        btn.classList.toggle('is-active', on);
        btn.setAttribute('aria-selected', on ? 'true' : 'false');
        btn.tabIndex = on ? 0 : -1;
        if (panels[i]) {
          panels[i].hidden = !on;
        }
        if (on && typeof btn.scrollIntoView === 'function') {
          btn.scrollIntoView({ inline: 'nearest', block: 'nearest' });
        }
      });
    };

    tablist.addEventListener('click', (evt) => {
      const btn = evt.target.closest('[data-bl-blocks-tab]');
      if (!btn || !tablist.contains(btn)) return;
      const index = Array.from(tablist.children).indexOf(btn);
      if (index >= 0) activate(index);
    });

    group.appendChild(tablist);
    panels.forEach((panel) => group.appendChild(panel));
    parent.appendChild(group);
  };

  /**
   * Append leaf fields. Modal packs by width (Forms-style); compact stacks full-width.
   *
   * @param {object[]} buffer
   * @param {HTMLElement} parent
   * @param {object} valueMap
   */
  const flushLeafBuffer = (buffer, parent, valueMap) => {
    if (!buffer.length) return;

    const appendLeafRow = (field, row) => {
      registerField(field);
      registerLogicTarget(row, field);
      return row;
    };

    if (compact) {
      buffer.forEach((field) => {
        const leafControls = [];
        const row = createLeafControl(field, valueMap, leafControls);
        if (!row) return;
        appendLeafRow(field, row);
        parent.appendChild(row);
        leafControls.forEach((c) => entries.push({ kind: 'leaf', ...c }));
      });
      return;
    }

    chunkFieldsIntoRows(buffer).forEach((rowFields) => {
      const built = [];
      rowFields.forEach((field) => {
        const leafControls = [];
        const row = createLeafControl(field, valueMap, leafControls);
        if (!row) return;
        appendLeafRow(field, row);
        leafControls.forEach((c) => entries.push({ kind: 'leaf', ...c }));
        built.push({ field, row });
      });
      if (!built.length) return;

      const needsPack =
        built.length > 1 ||
        built.some(({ field }) => {
          const factor = fieldPackFactor(field);
          return factor == null || factor < 0.999;
        });

      if (!needsPack) {
        parent.appendChild(built[0].row);
        return;
      }

      const group = el('div', { className: 'bl-blocks-fields__field-row' });
      built.forEach(({ field, row }) => {
        applyFieldWidth(row, field);
        group.appendChild(row);
      });
      parent.appendChild(group);
    });
  };

  const walk = (list, parent, valueMap) => {
    const fields = list || [];
    let i = 0;
    /** @type {object[]} */
    let leafBuffer = [];

    const flushLeaves = () => {
      flushLeafBuffer(leafBuffer, parent, valueMap);
      leafBuffer = [];
    };

    while (i < fields.length) {
      const field = fields[i];
      if (!field || field.active === false) {
        i += 1;
        continue;
      }
      const type = field.type || 'text';

      if (type === 'tab') {
        flushLeaves();
        const run = [];
        while (i < fields.length && fields[i] && fields[i].type === 'tab') {
          run.push(fields[i]);
          i += 1;
        }
        appendTabGroup(run, parent, valueMap);
        continue;
      }

      if (type === 'column') {
        flushLeaves();
        const run = [];
        while (i < fields.length && fields[i] && fields[i].type === 'column') {
          run.push(fields[i]);
          i += 1;
        }
        appendColumnGroup(run, parent, valueMap);
        continue;
      }

      if (isLayout(type)) {
        flushLeaves();
        appendLayoutWrap(field, type, parent, valueMap);
        i += 1;
        continue;
      }

      if (type === 'heading') {
        flushLeaves();
        const content = String(field.content || field.label || '').trim();
        if (content) {
          const levelRaw = String(field.level || 'h4').toLowerCase();
          const tag = ['h2', 'h3', 'h4'].includes(levelRaw) ? levelRaw : 'h4';
          parent.appendChild(el(tag, { className: 'bl-blocks-fields__heading', text: content }));
        }
        i += 1;
        continue;
      }
      if (type === 'text_block' || type === 'html') {
        flushLeaves();
        const content = field.default_value || field.content || field.label || '';
        if (content) {
          parent.appendChild(el('div', { className: 'bl-blocks-fields__static', html: content }));
        }
        i += 1;
        continue;
      }
      if (isStatic(type)) {
        flushLeaves();
        i += 1;
        continue;
      }

      if (type === 'repeater') {
        flushLeaves();
        registerField(field);
        const repeater = createRepeaterControl(field, valueMap, entries, options);
        registerLogicTarget(repeater, field);
        parent.appendChild(repeater);
        i += 1;
        continue;
      }

      leafBuffer.push(field);
      i += 1;
    }

    flushLeaves();
  };

  walk(fields, root, values || {});

  if (logicTargets.length) {
    root.addEventListener('change', evaluateLogic);
    root.addEventListener('input', evaluateLogic);
    evaluateLogic();
  }

  const getValues = () => {
    const out = {};
    entries.forEach((entry) => {
      if (entry.kind === 'repeater' && typeof entry.getRows === 'function') {
        if (entry.field.name) {
          out[entry.field.name] = entry.getRows();
        }
        return;
      }
      if (entry.kind === 'leaf') {
        const val = collectLeafValue(entry.field, entry.control, entry.type);
        if (entry.field.name) {
          out[entry.field.name] = val;
        }
      }
    });
    return out;
  };

  return { root, getValues };
}

function createRepeaterControl(field, valueMap, entries, options = {}) {
  const compact = options && options.layout === 'compact';
  const name = field.name || '';
  const children = Array.isArray(field.children) ? field.children : [];
  const minRows = Math.max(0, parseInt(field.min_rows, 10) || 0);
  const maxRows = Math.max(0, parseInt(field.max_rows, 10) || 0);
  const buttonLabel = field.button_label || i18n('addRow', 'Add entry');
  const design = ['standard', 'outline', 'card'].includes(field.design)
    ? field.design
    : 'standard';
  const showTitle =
    field.show_title !== false && field.show_title !== 0 && field.show_title !== '0';

  const uiShared = getUiShared(options);
  const getRepeaterPath = () => joinUiPath(resolveUiPathPrefix(options), name);

  let rows = Array.isArray(valueMap[name]) ? valueMap[name].slice() : [];
  while (rows.length < minRows) {
    rows.push({});
  }

  const classNames = ['bl-blocks-fields__repeater', 'bl-blocks-fields__repeater--' + design];
  if (field.css_class) {
    classNames.push(String(field.css_class).trim());
  }

  const wrap = el('div', {
    className: classNames.filter(Boolean).join(' '),
    dataset: { fieldName: name },
  });

  if (showTitle && !field.hide_label && field.label) {
    wrap.appendChild(el('div', { className: 'bl-blocks-fields__label', text: field.label }));
  }
  if (field.description) {
    wrap.appendChild(
      el('p', { className: 'description bl-blocks-fields__description', text: field.description })
    );
  }

  const rowsEl = el('div', { className: 'bl-blocks-fields__repeater-rows is-sortable' });
  const emptyHelp = el('p', {
    className: 'description bl-blocks-fields__repeater-empty',
    text: i18n('chooseEntriesHelp', 'Add one or more entries.'),
  });
  /** @type {Array<{ getValues: Function, rowEl: HTMLElement, removeBtn: HTMLElement, rowPathRef: { current: string }, collapsed: boolean }>} */
  const rowForms = [];

  const dispatchChange = () => {
    wrap.dispatchEvent(new Event('change', { bubbles: true }));
  };

  const readCollapsedFlags = () =>
    rowForms.map((r) => !!(r.collapsed || r.rowEl.classList.contains('is-collapsed')));

  const persistCollapsed = () => {
    const path = getRepeaterPath();
    if (!path) return;
    if (!uiShared.state.repeaters) {
      uiShared.state.repeaters = {};
    }
    uiShared.state.repeaters[path] = readCollapsedFlags();
    uiShared.notify();
  };

  const syncRowPathRefs = () => {
    const path = getRepeaterPath();
    rowForms.forEach((entry, i) => {
      entry.rowPathRef.current = joinUiPath(path, String(i));
    });
  };

  const syncRowTitles = () => {
    Array.from(rowsEl.children).forEach((rowEl, i) => {
      const title = rowEl.querySelector('.bl-blocks-fields__repeater-row-title');
      if (title) {
        const template = i18n('rowLabel', 'Entry %d');
        title.textContent = template.replace('%d', String(i + 1));
      }
    });
  };

  const syncRowFormsOrder = () => {
    const byEl = new Map(rowForms.map((entry) => [entry.rowEl, entry]));
    const next = [];
    Array.from(rowsEl.children).forEach((rowEl) => {
      const entry = byEl.get(rowEl);
      if (entry) next.push(entry);
    });
    rowForms.length = 0;
    next.forEach((entry) => rowForms.push(entry));
    syncRowPathRefs();
  };

  const canAdd = () => maxRows === 0 || rowForms.length < maxRows;
  const canRemove = () => rowForms.length > minRows;

  const addBtn = el('button', {
    type: 'button',
    className: 'button bl-blocks-fields__repeater-add',
    text: buttonLabel,
  });

  const refreshEmptyHelp = () => {
    emptyHelp.hidden = rowForms.length > 0;
  };

  const refreshAddBtn = () => {
    addBtn.disabled = !canAdd();
  };

  const refreshRemoveBtns = () => {
    const allowRemove = canRemove();
    rowForms.forEach((r) => {
      r.removeBtn.disabled = !allowRemove;
    });
  };

  const setCollapsed = (entry, collapsed) => {
    entry.collapsed = !!collapsed;
    entry.rowEl.classList.toggle('is-collapsed', entry.collapsed);
    const toggle = entry.rowEl.querySelector('.bl-blocks-fields__repeater-collapse');
    const icon = toggle && toggle.querySelector('.bl-icon');
    if (toggle) {
      const label = entry.collapsed
        ? i18n('expandEntry', 'Expand')
        : i18n('collapseEntry', 'Collapse');
      toggle.title = label;
      toggle.setAttribute('aria-label', label);
      toggle.setAttribute('aria-expanded', entry.collapsed ? 'false' : 'true');
    }
    if (icon) {
      icon.className =
        'bl-icon ' + (entry.collapsed ? '-icon-expand-content' : '-icon-collapse-content');
    }
  };

  const initialFlags = clampCollapsedFlags(
    uiShared.state.repeaters[getRepeaterPath()],
    rows.length
  );

  const mountRow = (rowValues, initialCollapsed = false) => {
    const rowEl = el('div', { className: 'bl-blocks-fields__repeater-row' });
    const handle = el(
      'button',
      {
        type: 'button',
        className: 'bl-blocks-fields__repeater-handle',
        title: i18n('dragEntry', 'Drag to reorder'),
        'aria-label': i18n('dragEntry', 'Drag to reorder'),
      },
      [el('span', { className: 'bl-icon -icon-drag', 'aria-hidden': 'true' })]
    );
    const title = el('span', { className: 'bl-blocks-fields__repeater-row-title', text: '' });
    const collapseBtn = el(
      'button',
      {
        type: 'button',
        className: 'button-link bl-blocks-fields__repeater-collapse',
        title: i18n('collapseEntry', 'Collapse'),
        'aria-label': i18n('collapseEntry', 'Collapse'),
        'aria-expanded': 'true',
      },
      [el('span', { className: 'bl-icon -icon-collapse-content', 'aria-hidden': 'true' })]
    );
    const removeBtn = el(
      'button',
      {
        type: 'button',
        className: 'button-link bl-blocks-fields__repeater-remove',
        title: i18n('removeRow', 'Remove entry'),
        'aria-label': i18n('removeRow', 'Remove entry'),
      },
      [el('span', { className: 'bl-icon -icon-delete', 'aria-hidden': 'true' })]
    );
    const actions = el('div', { className: 'bl-blocks-fields__repeater-row-actions' }, [
      collapseBtn,
      removeBtn,
    ]);
    const header = el('div', { className: 'bl-blocks-fields__repeater-row-header' }, [
      handle,
      title,
      actions,
    ]);
    const body = el('div', { className: 'bl-blocks-fields__repeater-row-body' });

    const rowIndex = rowForms.length;
    const rowPathRef = {
      current: joinUiPath(getRepeaterPath(), String(rowIndex)),
    };
    const childOptions = {
      ...options,
      _uiShared: uiShared,
      getUiPath: () => rowPathRef.current,
    };
    const form = createFieldForm(children, rowValues || {}, childOptions);
    body.appendChild(form.root);
    rowEl.append(header, body);
    rowsEl.appendChild(rowEl);

    const entry = {
      getValues: form.getValues,
      rowEl,
      removeBtn,
      rowPathRef,
      collapsed: !!initialCollapsed,
    };
    rowForms.push(entry);
    setCollapsed(entry, entry.collapsed);

    collapseBtn.addEventListener('click', (evt) => {
      evt.preventDefault();
      evt.stopPropagation();
      setCollapsed(entry, !entry.collapsed);
      persistCollapsed();
    });

    removeBtn.addEventListener('click', (evt) => {
      evt.preventDefault();
      evt.stopPropagation();
      if (!canRemove()) return;
      const idx = rowForms.indexOf(entry);
      if (idx < 0) return;
      const prevLen = rowForms.length;
      const indexMap = buildRemoveIndexMap(prevLen, idx);
      rowForms.splice(idx, 1);
      rowEl.remove();
      uiShared.state.repeaters = remapNestedRepeaterKeys(
        uiShared.state.repeaters,
        getRepeaterPath(),
        indexMap
      );
      syncRowPathRefs();
      syncRowTitles();
      refreshAddBtn();
      refreshEmptyHelp();
      refreshRemoveBtns();
      persistCollapsed();
      dispatchChange();
    });

    removeBtn.disabled = !canRemove();
    syncRowTitles();
    refreshAddBtn();
    refreshEmptyHelp();
  };

  rows.forEach((rowValues, i) => mountRow(rowValues, initialFlags[i]));

  addBtn.addEventListener('click', () => {
    if (!canAdd()) return;
    mountRow({}, false);
    persistCollapsed();
    refreshRemoveBtns();
    dispatchChange();
  });

  createSortable(rowsEl, {
    animation: 150,
    handle: '.bl-blocks-fields__repeater-handle',
    draggable: '.bl-blocks-fields__repeater-row',
    filter: '.bl-blocks-fields__repeater-collapse, .bl-blocks-fields__repeater-remove',
    preventOnFilter: true,
    ghostClass: 'is-dragging-ghost',
    chosenClass: 'is-dragging-chosen',
    onStart: () => dragStart(),
    onEnd: (evt) => {
      dragEnd();
      const oldIndex = typeof evt.oldIndex === 'number' ? evt.oldIndex : -1;
      const newIndex = typeof evt.newIndex === 'number' ? evt.newIndex : -1;
      const length = rowForms.length;
      if (oldIndex >= 0 && newIndex >= 0 && oldIndex !== newIndex) {
        const indexMap = buildReorderIndexMap(length, oldIndex, newIndex);
        uiShared.state.repeaters = remapNestedRepeaterKeys(
          uiShared.state.repeaters,
          getRepeaterPath(),
          indexMap
        );
      }
      syncRowFormsOrder();
      syncRowTitles();
      persistCollapsed();
      dispatchChange();
    },
  });

  wrap.appendChild(rowsEl);
  wrap.appendChild(emptyHelp);
  wrap.appendChild(addBtn);
  refreshAddBtn();
  refreshEmptyHelp();

  entries.push({
    kind: 'repeater',
    field,
    getRows: () => {
      syncRowFormsOrder();
      return rowForms.map((r) => r.getValues());
    },
  });

  return wrap;
}

/**
 * Open a modal with field form.
 *
 * @param {{
 *   title?: string,
 *   fields: array,
 *   values?: object,
 *   uiState?: object,
 *   onUiStateChange?: (ui: object) => void,
 *   onSave?: (values: object) => void,
 * }} opts
 */
export function openFieldsModal(opts) {
  const title = opts.title || i18n('edit', 'Edit');
  const form = createFieldForm(normalizeFieldList(opts.fields), opts.values || {}, {
    layout: 'default',
    uiState: opts.uiState,
    onUiStateChange: opts.onUiStateChange,
  });

  const overlay = el('div', { className: 'bl-blocks-modal-overlay', role: 'presentation' });
  const dialog = el('div', {
    className: 'bl-blocks-modal',
    role: 'dialog',
    'aria-modal': 'true',
    'aria-label': title,
  });

  const close = () => {
    destroyWysiwygEditors(dialog);
    document.removeEventListener('keydown', onKey);
    overlay.remove();
  };

  const onKey = (evt) => {
    if (evt.key === 'Escape') {
      evt.preventDefault();
      close();
    }
  };

  const header = el('div', { className: 'bl-blocks-modal__header' }, [
    el('h2', { className: 'bl-blocks-modal__title', text: title }),
    el('button', {
      type: 'button',
      className: 'bl-blocks-modal__close',
      text: '×',
      'aria-label': i18n('close', 'Close'),
      onClick: close,
    }),
  ]);

  const body = el('div', { className: 'bl-blocks-modal__body' }, [form.root]);
  const footer = el('div', { className: 'bl-blocks-modal__footer' }, [
    el('button', {
      type: 'button',
      className: 'button',
      text: i18n('cancel', 'Cancel'),
      onClick: close,
    }),
    el('button', {
      type: 'button',
      className: 'button button-primary',
      text: i18n('save', 'Save'),
      onClick: () => {
        if (typeof opts.onSave === 'function') {
          opts.onSave(form.getValues());
        }
        close();
      },
    }),
  ]);

  dialog.append(header, body, footer);
  overlay.appendChild(dialog);
  overlay.addEventListener('click', (evt) => {
    if (evt.target === overlay) close();
  });
  document.body.appendChild(overlay);
  document.addEventListener('keydown', onKey);

  const first = dialog.querySelector('input, textarea, select, button');
  if (first && typeof first.focus === 'function') {
    setTimeout(() => first.focus(), 0);
  }

  return { close, getValues: form.getValues };
}

/**
 * Activate tab panels for PHP-rendered field UIs (Website Settings).
 *
 * @param {ParentNode} [root=document]
 */
export function bindFieldTabs(root = document) {
  root.querySelectorAll('[data-bl-blocks-tabs]').forEach((group) => {
    if (group.dataset.blBlocksTabsBound === '1') return;
    group.dataset.blBlocksTabsBound = '1';
    const tablist = group.querySelector('.bl-blocks-fields__tablist');
    if (!tablist) return;
    const buttons = Array.from(tablist.querySelectorAll('[data-bl-blocks-tab]'));
    const panels = buttons.map((btn) => {
      const id = btn.getAttribute('aria-controls');
      return id ? group.querySelector('#' + CSS.escape(id)) : null;
    });

    const activate = (index) => {
      buttons.forEach((btn, i) => {
        const on = i === index;
        btn.classList.toggle('is-active', on);
        btn.setAttribute('aria-selected', on ? 'true' : 'false');
        btn.tabIndex = on ? 0 : -1;
        if (panels[i]) {
          panels[i].hidden = !on;
        }
        if (on && typeof btn.scrollIntoView === 'function') {
          btn.scrollIntoView({ inline: 'nearest', block: 'nearest' });
        }
      });
    };

    tablist.addEventListener('click', (evt) => {
      const btn = evt.target.closest('[data-bl-blocks-tab]');
      if (!btn || !tablist.contains(btn)) return;
      const index = buttons.indexOf(btn);
      if (index >= 0) activate(index);
    });
  });
}

/**
 * localStorage helpers for page/admin field UI collapse state.
 * @param {string} storageKey
 */
export function loadUiStateFromStorage(storageKey) {
  if (!storageKey || typeof window === 'undefined' || !window.localStorage) {
    return normalizeUiState(null);
  }
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return normalizeUiState(null);
    return normalizeUiState(JSON.parse(raw));
  } catch (err) {
    return normalizeUiState(null);
  }
}

/**
 * @param {string} storageKey
 * @param {object} uiState
 */
export function saveUiStateToStorage(storageKey, uiState) {
  if (!storageKey || typeof window === 'undefined' || !window.localStorage) {
    return;
  }
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(cloneUiState(uiState)));
  } catch (err) {
    // Quota / private mode — ignore.
  }
}

/** @param {number|string} postId @param {string} definitionKey */
export function pageRepeaterUiStorageKey(postId, definitionKey) {
  return 'bl-blocks-repeater-ui:' + String(postId || 0) + ':' + String(definitionKey || '');
}

/**
 * Parse JSON config from a classic / Website field host.
 *
 * @param {Element} host
 * @param {string} selector
 * @return {{ fields: array, values: object }}
 */
function parseClassicHostConfig(host, selector) {
  const cfgEl = host.querySelector(selector);
  let fields = [];
  let values = {};
  if (cfgEl) {
    try {
      const parsed = JSON.parse(cfgEl.textContent || '{}') || {};
      fields = Array.isArray(parsed.fields) ? parsed.fields : [];
      values =
        parsed.values && typeof parsed.values === 'object' && !Array.isArray(parsed.values)
          ? parsed.values
          : {};
    } catch (err) {
      fields = [];
      values = {};
    }
  }
  return { fields, values };
}

/**
 * Mount one classic field host (Website page or content-column metabox).
 *
 * @param {HTMLElement} host
 */
function mountClassicFieldHost(host) {
  if (!host || host.dataset.blBlocksFieldsMounted === '1') {
    return;
  }
  host.dataset.blBlocksFieldsMounted = '1';

  const isWebsite = host.hasAttribute('data-bl-blocks-website-fields');
  const cfgSelector = isWebsite ? '[data-bl-blocks-website-config]' : '[data-bl-blocks-classic-config]';
  const parsed = parseClassicHostConfig(host, cfgSelector);
  const fields = parsed.fields;
  let values = parsed.values;

  const formEl = host.closest('form');
  const wrap = host.parentElement;
  let hidden = isWebsite
    ? formEl && formEl.querySelector('[data-bl-blocks-website-json]')
    : (wrap && wrap.querySelector('[data-bl-blocks-classic-json]')) ||
      host.querySelector('[data-bl-blocks-classic-json]');

  if (isWebsite && formEl && !hidden) {
    hidden = el('input', {
      type: 'hidden',
      name: 'bl_blocks_values_json',
      dataset: { blBlocksWebsiteJson: '1' },
    });
    formEl.appendChild(hidden);
  }

  const allowModal = host.hasAttribute('data-bl-blocks-classic-modal');
  const modalTitle = host.getAttribute('data-title') || i18n('edit', 'Edit');
  const state = { form: null };

  const syncHidden = () => {
    if (!hidden || !state.form) {
      return;
    }
    hidden.value = JSON.stringify(state.form.getValues());
  };

  const render = (nextValues) => {
    destroyWysiwygEditors(host);
    state.form = createFieldForm(fields, nextValues || {}, { layout: 'default' });
    host.replaceChildren(state.form.root);
    syncHidden();
  };

  render(values);

  if (formEl && host.dataset.blBlocksSubmitBound !== '1') {
    host.dataset.blBlocksSubmitBound = '1';
    formEl.addEventListener('submit', syncHidden);
  }

  if (allowModal && wrap && !wrap.querySelector(':scope > .bl-blocks-edit-fields-button')) {
    const btn = el('button', {
      type: 'button',
      className: 'button bl-blocks-edit-fields-button',
      text: i18n('openFieldEditor', 'Open field editor'),
    });
    btn.addEventListener('click', () => {
      openFieldsModal({
        title: modalTitle,
        fields,
        values: state.form ? state.form.getValues() : values,
        onSave: (next) => {
          values = next && typeof next === 'object' ? next : {};
          render(values);
        },
      });
    });
    wrap.insertBefore(btn, host);
  }

  return state.form;
}

/**
 * Mount Website settings + content-column field forms (admin JS renderer).
 */
export function mountWebsiteFields(root = document) {
  const hosts = root.querySelectorAll(
    '[data-bl-blocks-website-fields], [data-bl-blocks-classic-fields]'
  );
  let last = null;
  hosts.forEach((host) => {
    last = mountClassicFieldHost(host);
  });
  return last;
}

// Expose for editor bundle / inline usage.
window.blBlocksFieldUiApi = {
  createFieldForm,
  openFieldsModal,
  loadUiStateFromStorage,
  saveUiStateToStorage,
  pageRepeaterUiStorageKey,
  bindPagePickers,
  bindLinkFields,
  bindMediaPickers,
  bindIconPickers,
  bindAdminRepeaters,
  bindHttpsUrlFields,
  bindFieldTabs,
  mountWebsiteFields,
};

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    mountWebsiteFields(document);
    // Legacy PHP-rendered pickers (no-op when Website uses createFieldForm).
    bindPagePickers(document);
    bindLinkFields(document);
    bindMediaPickers(document);
    bindIconPickers(document);
    bindHttpsUrlFields(document);
    bindFieldTabs(document);
    bindAdminRepeaters(document);
  });
}
