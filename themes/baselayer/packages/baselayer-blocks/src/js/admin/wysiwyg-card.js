/**
 * Blocks field-card settings for the wysiwyg type (toolbar presets + custom buttons + code editing).
 */

import { WYSIWYG_MIN_HEIGHT_PX } from './wysiwyg-field.js';

const TOOLBAR_OPTIONS = [
  { value: 'basic', labelKey: 'wysiwygToolbarBasic', fallback: 'Basic' },
  { value: 'standard', labelKey: 'wysiwygToolbarStandard', fallback: 'Standard' },
  { value: 'full', labelKey: 'wysiwygToolbarFull', fallback: 'Full' },
  { value: 'custom', labelKey: 'wysiwygToolbarCustom', fallback: 'Custom' },
];

const CODEX_URL = 'https://codex.wordpress.org/TinyMCE_Custom_Buttons';

/**
 * Pixel editor height for Appearance (after width).
 *
 * @param {object} field
 * @param {object} FormBuilder window.BlFormBuilder
 * @returns {HTMLElement[]}
 */
export function createWysiwygHeightSettings(field, FormBuilder) {
  const { el, t } = FormBuilder;
  if (!el || !t) return [];

  const raw = parseInt(field.height, 10);
  const value =
    Number.isFinite(raw) && raw >= WYSIWYG_MIN_HEIGHT_PX ? String(raw) : '';
  const input = el('input', {
    type: 'number',
    className: 'widefat',
    min: String(WYSIWYG_MIN_HEIGHT_PX),
    step: '1',
    dataset: { blWysiwygHeight: '1' },
    value,
    placeholder: '200',
  });
  const sync = () => {
    const next = parseInt(input.value, 10);
    if (Number.isFinite(next) && next >= WYSIWYG_MIN_HEIGHT_PX) {
      field.height = next;
      input.value = String(next);
    } else {
      delete field.height;
      input.value = '';
    }
    document.dispatchEvent(new CustomEvent('bl-forms-builder-changed'));
  };
  input.addEventListener('change', sync);
  input.addEventListener('blur', sync);

  return [
    el('p', {}, [
      el('label', { text: t('wysiwygHeight', 'Height') }),
      el('div', { className: 'bl-blocks-fields__input-group bl-forms-builder__wysiwyg-height' }, [
        input,
        el('span', {
          className: 'bl-blocks-fields__affix bl-blocks-fields__affix--suffix',
          text: 'px',
        }),
      ]),
    ]),
    el('p', {
      className: 'description',
      text: t('wysiwygHeightHelp', 'Editor height in pixels. Leave empty for the default.'),
    }),
  ];
}

/**
 * @param {object} FormBuilder window.BlFormBuilder
 * @returns {HTMLElement[]}
 */
export function createWysiwygToolbarSettings(field, FormBuilder) {
  const { el, t } = FormBuilder;
  if (!el || !t) return [];

  const preset = ['basic', 'standard', 'full', 'custom'].includes(field.toolbar)
    ? field.toolbar
    : 'basic';
  field.toolbar = preset;
  if (field.toolbar_custom == null) {
    field.toolbar_custom = '';
  }
  if (field.allow_code_editing == null) {
    field.allow_code_editing = false;
  }

  const select = el('select', {
    className: 'widefat',
    dataset: { blWysiwygToolbar: '1' },
  });
  TOOLBAR_OPTIONS.forEach((opt) => {
    const option = el('option', {
      value: opt.value,
      text: t(opt.labelKey, opt.fallback),
      selected: preset === opt.value ? true : undefined,
    });
    select.appendChild(option);
  });

  const customWrap = el('div', {
    className: 'bl-forms-builder__wysiwyg-custom',
    hidden: preset !== 'custom' ? true : undefined,
  });
  const customInput = el('input', {
    type: 'text',
    className: 'widefat',
    dataset: { blWysiwygToolbarCustom: '1' },
    value: field.toolbar_custom || '',
    placeholder: 'bold,italic,underline,link,bullist',
  });
  customInput.addEventListener('input', () => {
    field.toolbar_custom = customInput.value;
    document.dispatchEvent(new CustomEvent('bl-forms-builder-changed'));
  });
  customWrap.append(
    el('p', {}, [
      el('label', { text: t('wysiwygCustomButtons', 'Custom toolbar buttons') }),
      customInput,
    ]),
    el('p', {
      className: 'description',
      html: t(
        'wysiwygCustomButtonsHelp',
        'Comma-separated TinyMCE button IDs (e.g. bold,italic,link). Use | between commas to separate groups. Undo/redo are always included. See the <a href="%s" target="_blank" rel="noopener noreferrer">WordPress TinyMCE button docs</a>.'
      ).replace('%s', CODEX_URL),
    })
  );

  select.addEventListener('change', () => {
    field.toolbar = select.value || 'basic';
    customWrap.hidden = field.toolbar !== 'custom';
    document.dispatchEvent(new CustomEvent('bl-forms-builder-changed'));
  });

  const codeInput = el('input', {
    type: 'checkbox',
    dataset: { blWysiwygAllowCodeEditing: '1' },
    checked: !!field.allow_code_editing,
  });
  codeInput.addEventListener('change', () => {
    field.allow_code_editing = codeInput.checked;
    document.dispatchEvent(new CustomEvent('bl-forms-builder-changed'));
  });
  const codeSwitch = el('div', { className: 'bl-forms-builder__switch-setting' }, [
    el('label', { className: 'bl-forms-builder__switch' }, [
      codeInput,
      el('span', { className: 'bl-forms-builder__switch-ui', 'aria-hidden': 'true' }),
      el('span', {
        className: 'bl-forms-builder__switch-label',
        text: t('wysiwygAllowCodeEditing', 'Allow code editing'),
      }),
    ]),
    el('p', {
      className: 'description',
      text: t(
        'wysiwygAllowCodeEditingHelp',
        'Shows Visual and Text tabs so authors can edit HTML.'
      ),
    }),
  ]);

  return [
    el('div', { className: 'bl-forms-builder__wysiwyg-toolbar' }, [
      el('p', {}, [
        el('label', { text: t('wysiwygToolbar', 'Toolbar') }),
        select,
      ]),
      el('p', {
        className: 'description',
        text: t(
          'wysiwygToolbarHelp',
          'Basic: bold, italic, link. Standard adds lists. Full adds headings and alignment.'
        ),
      }),
      customWrap,
    ]),
    codeSwitch,
  ];
}

/**
 * Serialize toolbar, code-editing, and height from the settings DOM into data.
 *
 * @param {object} data
 * @param {{ q: Function }} ctx
 */
export function serializeWysiwygToolbar(data, ctx) {
  if (!data || data.type !== 'wysiwyg') return;
  const q = ctx.q;
  const toolbar = q('[data-bl-wysiwyg-toolbar]')?.value || 'basic';
  data.toolbar = ['basic', 'standard', 'full', 'custom'].includes(toolbar) ? toolbar : 'basic';
  const custom = q('[data-bl-wysiwyg-toolbar-custom]')?.value ?? '';
  if (data.toolbar === 'custom') {
    data.toolbar_custom = String(custom).trim();
  } else {
    delete data.toolbar_custom;
  }
  data.allow_code_editing = !!q('[data-bl-wysiwyg-allow-code-editing]')?.checked;

  const heightRaw = parseInt(q('[data-bl-wysiwyg-height]')?.value, 10);
  if (Number.isFinite(heightRaw) && heightRaw >= WYSIWYG_MIN_HEIGHT_PX) {
    data.height = heightRaw;
  } else {
    delete data.height;
  }
}
