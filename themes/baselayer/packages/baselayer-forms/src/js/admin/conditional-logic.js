import { el, t, typeLabel } from './dom.js';

/** Field types that cannot be used as condition sources. */
export const LOGIC_SOURCE_EXCLUDE = [
  'column',
  'section',
  'divider',
  'spacer',
  'heading',
  'text_block',
  'html',
  'captcha',
  'honeypot',
];

const OPS_TOGGLE = ['checked', 'not_checked'];
const OPS_CHOICE = ['==', '!=', '==empty', '!=empty'];
const OPS_MULTI = ['contains', 'not_contains', '==empty', '!=empty'];
const OPS_TEXT = ['==', '!=', 'contains', 'not_contains', '==empty', '!=empty'];
const OPS_NUMBER = ['==', '!=', '>', '<', '>=', '<=', '==empty', '!=empty'];
const OPS_TEMPORAL = ['==', '!=', '>', '<', '==empty', '!=empty'];
const OPS_FILE = ['==empty', '!=empty'];

const ALL_OPERATORS = [
  ...OPS_TOGGLE,
  ...OPS_CHOICE,
  ...OPS_MULTI,
  ...OPS_TEXT,
  ...OPS_NUMBER,
  ...OPS_TEMPORAL,
];

/**
 * @param {string} type
 * @returns {string[]}
 */
export function operatorsForType(type) {
  switch (type) {
    case 'toggle':
    case 'terms':
      return [...OPS_TOGGLE];
    case 'radio':
    case 'select':
    case 'button_group':
      return [...OPS_CHOICE];
    case 'checkboxes':
      return [...OPS_MULTI];
    case 'number':
      return [...OPS_NUMBER];
    case 'date':
    case 'time':
    case 'datetime':
      return [...OPS_TEMPORAL];
    case 'file':
    case 'image':
      return [...OPS_FILE];
    case 'text':
    case 'textarea':
    case 'email':
    case 'url':
    case 'phone':
    case 'hidden':
      return [...OPS_TEXT];
    default:
      return [...OPS_TEXT];
  }
}

/**
 * @param {string} operator
 * @returns {boolean}
 */
export function operatorNeedsValue(operator) {
  return !['checked', 'not_checked', '==empty', '!=empty'].includes(operator);
}

/**
 * @param {string} operator
 * @returns {string}
 */
export function operatorLabel(operator) {
  const map = {
    checked: t('logicOpChecked', 'Checked'),
    not_checked: t('logicOpNotChecked', 'Not checked'),
    '==': t('logicOpEquals', 'Is equal to'),
    '!=': t('logicOpNotEquals', 'Is not equal to'),
    contains: t('logicOpContains', 'Contains'),
    not_contains: t('logicOpNotContains', 'Does not contain'),
    '==empty': t('logicOpEmpty', 'Has no value'),
    '!=empty': t('logicOpNotEmpty', 'Has any value'),
    '>': t('logicOpGreater', 'Greater than'),
    '<': t('logicOpLess', 'Less than'),
    '>=': t('logicOpGreaterOrEqual', 'Greater than or equal to'),
    '<=': t('logicOpLessOrEqual', 'Less than or equal to'),
  };
  return map[operator] || operator;
}

/**
 * @param {unknown} raw
 * @returns {{ enabled: boolean, groups: array }}
 */
export function normalizeConditionalLogic(raw) {
  const empty = { enabled: false, groups: [] };
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return empty;
  }
  const groupsIn = Array.isArray(raw.groups) ? raw.groups : [];
  const groups = [];
  groupsIn.forEach((group) => {
    if (!Array.isArray(group)) {
      return;
    }
    const rules = [];
    group.forEach((rule) => {
      if (!rule || typeof rule !== 'object') {
        return;
      }
      const fieldId = String(rule.field || '').trim();
      const operator = String(rule.operator || '').trim();
      if (!fieldId || !ALL_OPERATORS.includes(operator)) {
        return;
      }
      rules.push({
        field: fieldId,
        operator,
        value: operatorNeedsValue(operator) ? String(rule.value ?? '') : '',
      });
    });
    if (rules.length) {
      groups.push(rules);
    }
  });
  return {
    enabled: !!raw.enabled && groups.length > 0,
    groups,
  };
}

/**
 * @param {HTMLElement|null|undefined} body
 * @returns {{ enabled: boolean, groups: array }|null}
 */
export function readConditionalLogicFromDom(body) {
  if (!body) {
    return null;
  }
  const input = body.querySelector('[data-bl-conditional-logic]');
  if (!input) {
    return null;
  }
  try {
    const parsed = JSON.parse(input.value || '{}');
    const logic = normalizeConditionalLogic(parsed);
    return logic.enabled || logic.groups.length ? logic : { enabled: false, groups: [] };
  } catch (e) {
    return { enabled: false, groups: [] };
  }
}

/**
 * Collect sibling fields that can act as condition sources.
 *
 * @param {string} exceptId
 * @returns {array}
 */
export function collectLogicSourceFields(exceptId = '') {
  const out = [];
  document.querySelectorAll('.bl-forms-builder__field[data-bl-forms-field]').forEach((row) => {
    const id = row.dataset.fieldId || '';
    const type = row.dataset.fieldType || '';
    if (!id || id === exceptId) {
      return;
    }
    if (LOGIC_SOURCE_EXCLUDE.includes(type)) {
      return;
    }
    const labelInput = row.querySelector('[data-bl-label]');
    const sectionLabel = row.querySelector('.bl-forms-builder__section-label-input');
    const preview = row.querySelector(':scope > .bl-forms-builder__field-header .bl-forms-builder__preview');
    const label =
      (labelInput?.value || '').trim() ||
      (sectionLabel?.value || '').trim() ||
      (preview?.textContent || '').trim() ||
      typeLabel(type);
    const options = Array.from(row.querySelectorAll('[data-bl-option]')).map((opt) => ({
      label: opt.querySelector('[data-bl-opt-label]')?.value || '',
      value: opt.querySelector('[data-bl-opt-value]')?.value || '',
    }));
    out.push({ id, type, label, options });
  });
  return out;
}

function emptyRule(sources) {
  const first = sources[0];
  const ops = first ? operatorsForType(first.type) : ['=='];
  return {
    field: first?.id || '',
    operator: ops[0] || '==',
    value: '',
  };
}

/**
 * Conditional logic editor for a field card panel.
 *
 * @param {object} field
 * @param {() => array} [getSources]
 * @returns {HTMLElement}
 */
export function createConditionalLogicEditor(field, getSources = () => collectLogicSourceFields(field.id)) {
  if (!field.conditional_logic || typeof field.conditional_logic !== 'object') {
    field.conditional_logic = { enabled: false, groups: [] };
  } else {
    field.conditional_logic = normalizeConditionalLogic(field.conditional_logic);
  }

  const wrap = el('div', { className: 'bl-forms-builder__logic' });
  const hidden = el('input', {
    type: 'hidden',
    dataset: { blConditionalLogic: '1' },
  });

  // Keep live group/rule object references stable. Replacing them in syncHidden
  // orphaned closures on Add rule / field selects so clicks mutated discarded arrays.
  const syncHidden = (notify = true) => {
    hidden.value = JSON.stringify(normalizeConditionalLogic(field.conditional_logic));
    if (notify) {
      document.dispatchEvent(new CustomEvent('bl-forms-builder-changed'));
    }
  };

  const getGroup = (groupIndex) => field.conditional_logic.groups[groupIndex];
  const getRule = (groupIndex, ruleIndex) => getGroup(groupIndex)?.[ruleIndex];

  const pruneMissingSources = () => {
    const ids = new Set(getSources().map((s) => s.id));
    field.conditional_logic.groups = field.conditional_logic.groups
      .map((group) => group.filter((rule) => ids.has(rule.field)))
      .filter((group) => group.length > 0);
    if (!field.conditional_logic.groups.length) {
      field.conditional_logic.enabled = false;
    }
  };
  pruneMissingSources();

  const groupsMount = el('div', { className: 'bl-forms-builder__logic-groups' });

  const renderValueControl = (groupIndex, ruleIndex, source) => {
    const rule = getRule(groupIndex, ruleIndex);
    if (!rule) {
      return el('span', { className: 'bl-forms-builder__logic-value-empty', 'aria-hidden': 'true' });
    }
    if (!operatorNeedsValue(rule.operator)) {
      return el('span', { className: 'bl-forms-builder__logic-value-empty', 'aria-hidden': 'true' });
    }
    const options = Array.isArray(source?.options) ? source.options.filter((o) => (o.value || '').trim() !== '') : [];
    if (options.length && ['radio', 'select', 'button_group', 'checkboxes'].includes(source?.type)) {
      const select = el('select', {
        className: 'bl-forms-builder__logic-value',
        'aria-label': t('logicValue', 'Value'),
      });
      select.appendChild(el('option', { value: '', text: t('logicSelectValue', '— Select —') }));
      options.forEach((opt) => {
        select.appendChild(
          el('option', {
            value: opt.value,
            text: opt.label || opt.value,
          })
        );
      });
      select.value = rule.value || '';
      if (rule.value && select.value !== rule.value) {
        select.appendChild(el('option', { value: rule.value, text: rule.value }));
        select.value = rule.value;
      }
      select.addEventListener('change', () => {
        const live = getRule(groupIndex, ruleIndex);
        if (!live) {
          return;
        }
        live.value = select.value;
        syncHidden();
      });
      return select;
    }
    const input = el('input', {
      type: source?.type === 'number' ? 'number' : 'text',
      className: 'widefat bl-forms-builder__logic-value',
      value: rule.value || '',
      'aria-label': t('logicValue', 'Value'),
    });
    input.addEventListener('input', () => {
      const live = getRule(groupIndex, ruleIndex);
      if (!live) {
        return;
      }
      live.value = input.value;
      syncHidden();
    });
    return input;
  };

  const renderRuleRow = (groupIndex, ruleIndex, sources) => {
    const rule = getRule(groupIndex, ruleIndex);
    if (!rule) {
      return el('div', { className: 'bl-forms-builder__logic-rule' });
    }
    let source = sources.find((s) => s.id === rule.field) || sources[0] || null;
    if (source && rule.field !== source.id) {
      rule.field = source.id;
    }
    const ops = source ? operatorsForType(source.type) : ['=='];
    if (!ops.includes(rule.operator)) {
      rule.operator = ops[0];
      if (!operatorNeedsValue(rule.operator)) {
        rule.value = '';
      }
    }

    const fieldSelect = el('select', {
      className: 'bl-forms-builder__logic-field',
      'aria-label': t('logicField', 'Field'),
    });
    if (!sources.length) {
      fieldSelect.appendChild(
        el('option', { value: '', text: t('logicNoFields', 'No fields available') })
      );
      fieldSelect.disabled = true;
    } else {
      sources.forEach((s) => {
        fieldSelect.appendChild(
          el('option', {
            value: s.id,
            text: `${s.label} (${typeLabel(s.type)})`,
          })
        );
      });
      fieldSelect.value = rule.field || sources[0].id;
    }

    const opSelect = el('select', {
      className: 'bl-forms-builder__logic-operator',
      'aria-label': t('logicOperator', 'Operator'),
    });
    ops.forEach((op) => {
      opSelect.appendChild(el('option', { value: op, text: operatorLabel(op) }));
    });
    opSelect.value = rule.operator;

    const valueSlot = el('div', { className: 'bl-forms-builder__logic-value-slot' });
    const refreshValue = () => {
      const live = getRule(groupIndex, ruleIndex);
      const liveSource =
        sources.find((s) => s.id === live?.field) || sources[0] || null;
      valueSlot.replaceChildren(renderValueControl(groupIndex, ruleIndex, liveSource));
    };
    refreshValue();

    fieldSelect.addEventListener('change', () => {
      const live = getRule(groupIndex, ruleIndex);
      if (!live) {
        return;
      }
      live.field = fieldSelect.value;
      source = sources.find((s) => s.id === live.field) || null;
      const nextOps = source ? operatorsForType(source.type) : ['=='];
      live.operator = nextOps.includes(live.operator) ? live.operator : nextOps[0];
      if (!operatorNeedsValue(live.operator)) {
        live.value = '';
      }
      renderGroups();
      syncHidden();
    });

    opSelect.addEventListener('change', () => {
      const live = getRule(groupIndex, ruleIndex);
      if (!live) {
        return;
      }
      live.operator = opSelect.value;
      if (!operatorNeedsValue(live.operator)) {
        live.value = '';
      }
      refreshValue();
      syncHidden();
    });

    const deleteBtn = el('button', {
      type: 'button',
      className: 'bl-forms-builder__icon-btn bl-forms-builder__icon-btn--danger',
      title: t('delete', 'Delete'),
      'aria-label': t('delete', 'Delete'),
      onClick: () => {
        const group = getGroup(groupIndex);
        if (!group) {
          return;
        }
        group.splice(ruleIndex, 1);
        if (!group.length) {
          field.conditional_logic.groups.splice(groupIndex, 1);
        }
        renderGroups();
        syncHidden();
      },
    });
    deleteBtn.textContent = '×';

    return el('div', { className: 'bl-forms-builder__logic-rule' }, [
      fieldSelect,
      opSelect,
      valueSlot,
      deleteBtn,
    ]);
  };

  const renderGroup = (groupIndex, sources) => {
    const group = getGroup(groupIndex);
    if (!group) {
      return el('div', { className: 'bl-forms-builder__logic-group' });
    }
    const box = el('div', { className: 'bl-forms-builder__logic-group' });
    const label =
      groupIndex === 0
        ? t('logicShowIf', 'Show this field if')
        : t('logicOrIf', 'or if');
    box.appendChild(el('p', { className: 'bl-forms-builder__logic-group-label', text: label }));

    const rulesWrap = el('div', { className: 'bl-forms-builder__logic-rules' });
    group.forEach((_, ruleIndex) => {
      if (ruleIndex > 0) {
        rulesWrap.appendChild(
          el('p', { className: 'bl-forms-builder__logic-and', text: t('logicAnd', 'and') })
        );
      }
      rulesWrap.appendChild(renderRuleRow(groupIndex, ruleIndex, sources));
    });
    box.appendChild(rulesWrap);

    box.appendChild(
      el('button', {
        type: 'button',
        className: 'button bl-button-small',
        text: t('logicAddRule', 'Add rule'),
        onClick: () => {
          const liveGroup = getGroup(groupIndex);
          if (!liveGroup) {
            return;
          }
          liveGroup.push(emptyRule(getSources()));
          renderGroups();
          syncHidden();
        },
      })
    );

    return box;
  };

  const renderGroups = () => {
    const sources = getSources();
    groupsMount.replaceChildren();
    if (!field.conditional_logic.enabled) {
      return;
    }
    if (!field.conditional_logic.groups.length) {
      field.conditional_logic.groups.push([emptyRule(sources)]);
    }
    field.conditional_logic.groups.forEach((_, index) => {
      if (index > 0) {
        groupsMount.appendChild(
          el('p', { className: 'bl-forms-builder__logic-or', text: t('logicOr', 'or') })
        );
      }
      groupsMount.appendChild(renderGroup(index, sources));
    });
    groupsMount.appendChild(
      el('button', {
        type: 'button',
        className: 'button bl-button-small bl-forms-builder__logic-add-group',
        text: t('logicAddGroup', 'Add rule group'),
        onClick: () => {
          field.conditional_logic.groups.push([emptyRule(getSources())]);
          renderGroups();
          syncHidden();
        },
      })
    );
  };

  const enableSwitch = (() => {
    const input = el('input', {
      type: 'checkbox',
      checked: !!field.conditional_logic.enabled,
    });
    input.addEventListener('change', () => {
      field.conditional_logic.enabled = input.checked;
      if (input.checked && !field.conditional_logic.groups.length) {
        field.conditional_logic.groups = [[emptyRule(getSources())]];
      }
      renderGroups();
      syncHidden();
    });
    return el('div', { className: 'bl-forms-builder__switch-setting' }, [
      el('label', { className: 'bl-forms-builder__switch' }, [
        input,
        el('span', { className: 'bl-forms-builder__switch-ui', 'aria-hidden': 'true' }),
        el('span', {
          className: 'bl-forms-builder__switch-label',
          text: t('logicEnable', 'Conditional logic'),
        }),
      ]),
    ]);
  })();

  wrap.append(
    enableSwitch,
    el('p', {
      className: 'description bl-forms-builder__logic-help',
      text: t(
        'logicHelp',
        'Show this field only when the conditions below are met. Rules in a group use AND; groups use OR.'
      ),
    }),
    groupsMount,
    hidden
  );

  renderGroups();
  syncHidden(false);

  return wrap;
}
