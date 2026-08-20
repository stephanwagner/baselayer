/**
 * Forms-only field-card extras (entry list “Show in overview”).
 * Registered via BlFormBuilder.configure({ fieldCard }) from the Forms admin app.
 */

import { openSimpleModal } from './modal.js';

function fb() {
  return window.BlFormBuilder || {};
}

const LIST_OVERVIEW_TYPES = ['text', 'email', 'phone'];

/**
 * Count other fields marked for the entries list.
 * Uses live field data (not DOM querySelector into nested cards).
 */
function countOtherListOverviewFields(exceptId) {
  const except = String(exceptId || '');
  let n = 0;
  document.querySelectorAll('.bl-forms-builder__field[data-bl-forms-field]').forEach((row) => {
    if (except && String(row.dataset.fieldId || '') === except) {
      return;
    }
    const field = row._blFieldRef;
    if (!field || !LIST_OVERVIEW_TYPES.includes(field.type)) {
      return;
    }
    if (field.show_in_list) {
      n += 1;
    }
  });
  return n;
}

/**
 * Whether another field of this type already has “show in list” enabled.
 */
function hasShowInListForType(type, exceptId = '') {
  const except = String(exceptId || '');
  let found = false;
  document.querySelectorAll('.bl-forms-builder__field[data-bl-forms-field]').forEach((row) => {
    if (found) {
      return;
    }
    if (except && String(row.dataset.fieldId || '') === except) {
      return;
    }
    const field = row._blFieldRef;
    if (!field || field.type !== type) {
      return;
    }
    if (field.show_in_list) {
      found = true;
    }
  });
  return found;
}

/**
 * First text / first email on the canvas get list overview on by default (max 3 total).
 */
function defaultShowInListForNewField(type, exceptId = '') {
  if (type !== 'text' && type !== 'email') {
    return false;
  }
  if (countOtherListOverviewFields(exceptId) >= 3) {
    return false;
  }
  return !hasShowInListForType(type, exceptId);
}

function createListOverviewControl(field) {
  const { el, t } = fb();
  const input = el('input', {
    type: 'checkbox',
    dataset: { blShowInList: '1' },
    checked: !!field.show_in_list,
  });
  input.addEventListener('change', () => {
    if (input.checked && countOtherListOverviewFields(field.id) >= 3) {
      input.checked = false;
      openSimpleModal(
        t('showInList', 'Show in overview'),
        t('showInListMax', 'You can show at most 3 fields in the entries list.')
      );
      return;
    }
    field.show_in_list = !!input.checked;
    document.dispatchEvent(new CustomEvent('bl-forms-builder-changed'));
  });

  return el('div', { className: 'bl-forms-builder__switch-setting' }, [
    el('label', { className: 'bl-forms-builder__switch' }, [
      input,
      el('span', { className: 'bl-forms-builder__switch-ui', 'aria-hidden': 'true' }),
      el('span', {
        className: 'bl-forms-builder__switch-label',
        text: t('showInList', 'Show in overview'),
      }),
    ]),
  ]);
}

/**
 * Hook bag for BlFormBuilder.configure({ fieldCard }).
 */
export const formsFieldCardExtras = {
  onInitField(field) {
    if (
      (field.type === 'text' || field.type === 'email') &&
      field.show_in_list === undefined
    ) {
      field.show_in_list = defaultShowInListForNewField(field.type, field.id);
    }
  },

  onNormalizeType(field, nextType) {
    if (!['text', 'email', 'phone'].includes(nextType)) {
      delete field.show_in_list;
    } else if (
      (nextType === 'text' || nextType === 'email') &&
      field.show_in_list === undefined
    ) {
      field.show_in_list = defaultShowInListForNewField(nextType, field.id);
    }
  },

  extraSwitches(field) {
    if (field.type === 'text' || field.type === 'email' || field.type === 'phone') {
      return [createListOverviewControl(field)];
    }
    return [];
  },

  onSerialize(data, { type, q }) {
    if (type === 'text' || type === 'email' || type === 'phone') {
      data.show_in_list = Boolean(q('[data-bl-show-in-list]')?.checked);
    }
  },
};

/**
 * Register Forms field-card extras on the shared kit.
 */
export function registerFormsFieldExtras() {
  const FormBuilder = window.BlFormBuilder;
  if (!FormBuilder || typeof FormBuilder.configure !== 'function') {
    return;
  }
  FormBuilder.configure({ fieldCard: formsFieldCardExtras });
}
