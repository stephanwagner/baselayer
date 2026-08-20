import { openSimpleModal } from './modal.js';

const { el, t, uid, slugifyName } = window.BlFormBuilder || {};

/**
 * @param {object} partial
 * @returns {object}
 */
function makeField(partial) {
  const type = partial.type || 'text';
  const label = partial.label != null ? String(partial.label) : '';
  const id = uid();
  const field = {
    id,
    type,
    label,
    name: slugifyName(partial.name || label || type),
    name_manual: true,
    hide_label: !!partial.hide_label,
    active: true,
    required: !!partial.required,
    placeholder: partial.placeholder || '',
    description: partial.description || '',
    width: partial.width || '100',
    width_custom: '',
    css_class: '',
  };

  if (partial.show_in_list !== undefined) {
    field.show_in_list = !!partial.show_in_list;
  }

  if (type === 'textarea') {
    field.rows = partial.rows || 4;
  }
  if (type === 'terms') {
    field.hide_label = partial.hide_label !== false;
    field.content =
      partial.content ||
      t('termsDefaultLabel', 'I agree to the [Privacy Policy](page:privacy).');
    field.default_value = '';
    if (!label) {
      field.label = t('termsDefaultFieldLabel', 'Privacy Policy');
      field.name = slugifyName(field.label);
    }
  }
  if (type === 'file' || type === 'image') {
    field.multiple = false;
    field.preview = true;
    field.upload_style = 'modern';
    field.extensions =
      partial.extensions != null
        ? String(partial.extensions)
        : type === 'image'
          ? 'jpg, jpeg, png, webp, gif, heic, avif'
          : 'pdf, doc, docx';
    if (partial.button_text != null) {
      field.button_text = String(partial.button_text);
    }
  }
  if (type === 'section') {
    return {
      id,
      type: 'section',
      label,
      width: partial.width || '100',
      width_custom: '',
      design: partial.design || 'card',
      show_title: partial.show_title !== false,
      css_class: typeof partial.css_class === 'string' ? partial.css_class : '',
      children: Array.isArray(partial.children) ? partial.children : [],
    };
  }

  return field;
}

function consentField() {
  return makeField({
    type: 'terms',
    required: true,
    label: t('termsDefaultFieldLabel', 'Privacy Policy'),
  });
}

/** Built-in starter template packs (fields only). */
export function getStarterTemplates() {
  return [
    {
      id: 'contact',
      label: t('templateContact', 'Contact Form'),
      settings: () => ({
        submit_label: t('templateSubmitContact', 'Send message'),
        user_email_field: 'email',
      }),
      fields: () => [
        makeField({
          type: 'text',
          label: t('templateFieldName', 'Name'),
          name: 'name',
          required: true,
          width: '50',
          placeholder: t('templatePlaceholderName', 'Jane Doe'),
          show_in_list: true,
        }),
        makeField({
          type: 'email',
          label: t('templateFieldEmail', 'Email'),
          name: 'email',
          required: true,
          width: '50',
          placeholder: 'name@example.com',
          show_in_list: true,
        }),
        makeField({
          type: 'text',
          label: t('templateFieldSubject', 'Subject'),
          name: 'subject',
          placeholder: t('templatePlaceholderSubject', 'How can we help?'),
        }),
        makeField({
          type: 'textarea',
          label: t('templateFieldMessage', 'Message'),
          name: 'message',
          required: true,
          rows: 4,
          placeholder: t('templatePlaceholderMessage', 'Tell us a bit more…'),
        }),
        consentField(),
      ],
    },
    {
      id: 'newsletter',
      label: t('templateNewsletter', 'Newsletter Signup'),
      settings: () => ({
        submit_label: t('templateSubmitSubscribe', 'Subscribe'),
        user_email_field: 'email',
      }),
      fields: () => [
        makeField({
          type: 'section',
          label: t('templateNewsletterSection', 'Sign up to our Newsletter'),
          design: 'card',
          children: [
            makeField({
              type: 'text',
              label: t('templateFieldName', 'Name'),
              name: 'name',
              required: true,
              placeholder: t('templatePlaceholderName', 'Jane Doe'),
              show_in_list: true,
            }),
            makeField({
              type: 'email',
              label: t('templateFieldEmail', 'Email'),
              name: 'email',
              required: true,
              placeholder: 'name@example.com',
              show_in_list: true,
            }),
            consentField(),
          ],
        }),
      ],
    },
    {
      id: 'job',
      label: t('templateJob', 'Job Application'),
      settings: () => ({
        submit_label: t('templateSubmitApplication', 'Submit Application'),
        user_email_field: 'email',
      }),
      fields: () => [
        makeField({
          type: 'text',
          label: t('templateFieldFullName', 'Full name'),
          name: 'full_name',
          required: true,
          placeholder: t('templatePlaceholderName', 'Jane Doe'),
          show_in_list: true,
        }),
        makeField({
          type: 'email',
          label: t('templateFieldEmail', 'Email'),
          name: 'email',
          required: true,
          placeholder: 'name@example.com',
          show_in_list: true,
        }),
        makeField({
          type: 'file',
          label: t('templateFieldCv', 'CV / Résumé'),
          name: 'cv',
          required: true,
          extensions: 'pdf, doc, docx',
        }),
        makeField({
          type: 'textarea',
          label: t('templateFieldMessage', 'Message'),
          name: 'message',
          rows: 4,
          placeholder: t('templatePlaceholderCover', 'A short note about your application…'),
        }),
        consentField(),
      ],
    },
  ];
}

function templateButton(label, onClick) {
  return el('button', {
    type: 'button',
    className: 'button bl-button bl-forms-templates__btn',
    text: label,
    onClick,
  });
}

/**
 * Browse starter templates in a modal.
 *
 * @param {{ replaceFields: (fields: array) => void }} canvas
 * @param {{ applySettings?: (partial: object) => void }} panels
 */
function openTemplatesBrowser(canvas, panels) {
  document.querySelectorAll('.bl-forms-builder__modal').forEach((node) => node.remove());

  const title = t('templates', 'Templates');
  const backdrop = el('div', {
    className: 'bl-forms-builder__modal',
    role: 'dialog',
    'aria-modal': 'true',
    'aria-label': title,
  });

  const close = () => {
    document.removeEventListener('keydown', onKey);
    backdrop.remove();
  };

  const onKey = (evt) => {
    if (evt.key === 'Escape') {
      close();
    }
  };
  document.addEventListener('keydown', onKey);

  backdrop.addEventListener('click', (evt) => {
    if (evt.target === backdrop) {
      close();
    }
  });

  const list = el('div', { className: 'bl-forms-templates__list' });
  getStarterTemplates().forEach((tpl) => {
    list.appendChild(
      templateButton(tpl.label, () => {
        close();
        openSimpleModal(
          t('templateApplyTitle', 'Apply template?'),
          t(
            'templateApplyMessage',
            'Applying this template will overwrite all existing fields on this form. Other settings stay as they are, except the submit button label when the template defines one.'
          ),
          {
            confirmLabel: t('templateApplyConfirm', 'Apply template'),
            onConfirm: () => {
              canvas.replaceFields(tpl.fields());
              if (typeof tpl.settings === 'function' && typeof panels?.applySettings === 'function') {
                panels.applySettings(tpl.settings());
              }
            },
          }
        );
      })
    );
  });

  const body = el('div', { className: 'bl-forms-builder__modal-body bl-forms-templates__modal-body' }, [
    el('p', {
      className: 'description',
      text: t(
        'templatesBrowseHelp',
        'Choose a template to create this form with predefined fields.'
      ),
    }),
    list,
  ]);

  const dialog = el('div', {
    className: 'bl-forms-builder__modal-dialog bl-forms-templates__modal-dialog',
  });
  dialog.append(
    el('div', { className: 'bl-forms-builder__modal-header' }, [
      el('h2', { className: 'bl-forms-builder__modal-title', text: title }),
    ]),
    body,
    el('div', { className: 'bl-forms-builder__modal-footer' }, [
      el('button', {
        type: 'button',
        className: 'button',
        text: t('cancel', 'Cancel'),
        onClick: close,
      }),
    ])
  );
  backdrop.appendChild(dialog);
  document.body.appendChild(backdrop);
}

/**
 * Bind Templates browse button in the Tools metabox.
 *
 * @param {{ replaceFields: (fields: array) => void }} canvas
 * @param {{ applySettings?: (partial: object) => void }} panels
 */
export function bindTemplates(canvas, panels) {
  const browseBtn = document.querySelector('[data-bl-forms-browse-templates]');
  if (!browseBtn || typeof canvas.replaceFields !== 'function') {
    return;
  }

  browseBtn.addEventListener('click', (evt) => {
    evt.preventDefault();
    openTemplatesBrowser(canvas, panels);
  });
}
