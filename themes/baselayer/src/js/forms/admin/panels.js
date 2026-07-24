import { el, t, flattenFields, iconEl } from './dom.js';
import { openPagePicker } from '../../admin/utils/page-picker.js';

function fieldRow(label, control, help = '') {
  const children = [
    el('label', {}, [el('strong', { text: label })]),
    control,
  ];
  if (help) {
    children.push(el('span', { className: 'description', text: help }));
  }
  return el('p', { className: 'bl-forms-builder__setting' }, children);
}

function errorSection(title, children) {
  return el('div', { className: 'bl-forms-builder__field-errors' }, [
    el('h3', {
      className: 'bl-forms-builder__section-title',
      text: title,
    }),
    el('div', { className: 'bl-forms-builder__field-errors-box' }, children),
  ]);
}

function emailFieldsFromList(fields) {
  return flattenFields(fields || []).filter(
    (field) => field && field.type === 'email' && field.name && field.active !== false
  );
}

function emailFieldLabel(field) {
  const label = (field.label || '').trim();
  const name = field.name || '';
  if (label && label !== name) {
    return `${label} (${name})`;
  }
  return label || name;
}

function randomHoneypotName() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let out = 'hp_';
  for (let i = 0; i < 10; i += 1) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

function securityBadge(kind) {
  if (kind !== 'required' && kind !== 'always') {
    return null;
  }
  const badge = el('span', {
    className: 'bl-forms-builder__security-badge bl-forms-builder__security-badge--always',
  });
  const icon = iconEl('lock', 'bl-forms-builder__security-badge-icon');
  if (icon.innerHTML) {
    badge.appendChild(icon);
  }
  badge.appendChild(
    el('span', {
      className: 'bl-forms-builder__security-badge-text',
      text: t('securityAlwaysOn', 'Always on'),
    })
  );
  return badge;
}

/**
 * Security row heading with the shared switch control + status badge.
 *
 * @returns {{ root: HTMLElement, input: HTMLInputElement }}
 */
function securitySwitch(label, kind, { checked = false, disabled = false, onChange = null } = {}) {
  const input = el('input', {
    type: 'checkbox',
    checked: !!checked,
    disabled: !!disabled,
  });
  if (onChange && !disabled) {
    input.addEventListener('change', () => onChange(input.checked));
  }

  const labelChildren = [
    input,
    el('span', { className: 'bl-forms-builder__switch-ui', 'aria-hidden': 'true' }),
    el('span', { className: 'bl-forms-builder__switch-label', text: label }),
  ];
  const badge = securityBadge(kind);
  if (badge) {
    labelChildren.push(badge);
  }

  const root = el(
    'div',
    {
      className:
        'bl-forms-builder__switch-setting bl-forms-builder__security-heading' +
        (disabled ? ' is-disabled' : ''),
    },
    [el('label', { className: 'bl-forms-builder__switch' }, labelChildren)]
  );

  return { root, input };
}

/**
 * Plain switch (no security badge).
 *
 * @returns {{ root: HTMLElement, input: HTMLInputElement }}
 */
function plainSwitch(label, { checked = false, onChange = null } = {}) {
  const input = el('input', {
    type: 'checkbox',
    checked: !!checked,
  });
  if (onChange) {
    input.addEventListener('change', () => onChange(input.checked));
  }
  const root = el('div', { className: 'bl-forms-builder__switch-setting' }, [
    el('label', { className: 'bl-forms-builder__switch' }, [
      input,
      el('span', { className: 'bl-forms-builder__switch-ui', 'aria-hidden': 'true' }),
      el('span', { className: 'bl-forms-builder__switch-label', text: label }),
    ]),
  ]);
  return { root, input };
}

function securityOption(heading, help, extra = null) {
  const bodyChildren = [el('span', { className: 'description', text: help })];
  if (extra) {
    bodyChildren.push(extra);
  }
  return el('div', { className: 'bl-forms-builder__setting bl-forms-builder__security-option' }, [
    heading,
    el('div', { className: 'bl-forms-builder__security-body' }, bodyChildren),
  ]);
}

function lockedOption(label, help) {
  const { root } = securitySwitch(label, 'always', { checked: true, disabled: true });
  return securityOption(root, help);
}

/**
 * Notifications + Settings + Security panels bound to config.settings.
 *
 * @param {object} settings
 * @param {HTMLElement} builderRoot — for data-fallback-* and admin email
 * @param {(settings: object) => void} onChange
 */
export function createPanels(settings, builderRoot, onChange) {
  const state = { ...(settings || {}) };
  let emailFields = [];

  if (!state.honeypot_name || state.honeypot_name === 'bl_forms_hp') {
    state.honeypot_name = randomHoneypotName();
  }
  if (state.min_fill_time_enabled === undefined) {
    state.min_fill_time_enabled = true;
  }
  if (state.min_fill_time === undefined || state.min_fill_time === '') {
    state.min_fill_time = 2;
  }
  if (state.rate_limit_enabled === undefined) {
    state.rate_limit_enabled = true;
  }
  if (state.rate_limit_max === undefined || state.rate_limit_max === '') {
    state.rate_limit_max = 3;
  }
  if (state.rate_limit_window === undefined || state.rate_limit_window === '') {
    state.rate_limit_window = 5;
  }
  if (!state.after_submit || !['message', 'redirect'].includes(state.after_submit)) {
    state.after_submit = 'message';
  }
  state.redirect_page_id = Number(state.redirect_page_id) || 0;

  const emit = () => onChange({ ...state });

  const bindText = (input, key) => {
    input.value = state[key] || '';
    input.addEventListener('input', () => {
      state[key] = input.value;
      emit();
    });
    return input;
  };

  const adminEmail = builderRoot.dataset.adminEmail || '';
  const fbAdminSubject = builderRoot.dataset.fallbackAdminSubject || '';
  const fbSubmit = builderRoot.dataset.fallbackSubmit || '';
  const fbSuccess = builderRoot.dataset.fallbackSuccess || '';
  const fbError = builderRoot.dataset.fallbackError || '';
  const fbValidation = builderRoot.dataset.fallbackValidation || '';
  const fbRequired = builderRoot.dataset.fallbackRequired || '';

  // Notifications
  const notifications = el('div', {
    className: 'bl-forms-builder__panel',
    dataset: { blFormsPanel: 'notifications' },
    hidden: true,
  });

  const recipient = bindText(
    el('input', { type: 'email', className: 'widefat', placeholder: adminEmail }),
    'recipient'
  );
  const adminSubject = bindText(
    el('input', {
      type: 'text',
      className: 'widefat',
      placeholder: fbAdminSubject,
    }),
    'admin_email_subject'
  );

  const userOptions = el('div', { className: 'bl-forms-builder__notify-user-options' });
  const sendToWrap = el('div', { className: 'bl-forms-builder__setting bl-forms-builder__send-to' });
  const sendToControl = el('div', { className: 'bl-forms-builder__send-to-control' });
  sendToWrap.append(
    el('label', {}, [el('strong', { text: t('emailField', 'Email field') })]),
    sendToControl
  );

  const userSubject = bindText(el('input', { type: 'text', className: 'widefat' }), 'user_email_subject');
  const userIntro = bindText(el('textarea', { className: 'widefat', rows: '3' }), 'user_email_intro');
  const userSubjectRow = fieldRow(t('subject', 'Subject'), userSubject);
  const userIntroRow = fieldRow(
    t('introText', 'Intro text'),
    userIntro,
    t(
      'introTextHelp',
      'This text appears above the submitted form data in the email. Placeholders can be used [field-id].'
    )
  );

  userOptions.append(sendToWrap, userSubjectRow, userIntroRow);

  const ensureSelectedEmailField = () => {
    const names = emailFields.map((field) => field.name);
    if (names.length === 0) {
      state.user_email_field = '';
      return;
    }
    if (!names.includes(state.user_email_field)) {
      state.user_email_field = names[0];
    }
  };

  const renderSendTo = () => {
    sendToControl.replaceChildren();
    ensureSelectedEmailField();

    if (emailFields.length === 0) {
      sendToControl.appendChild(
        el('div', {
          className: 'bl-forms-builder__notice bl-forms-builder__notice--warning',
          role: 'status',
          text: t('notifyUserHelp', 'Requires an Email field on the form.'),
        })
      );
      return;
    }

    if (emailFields.length === 1) {
      const only = emailFields[0];
      state.user_email_field = only.name;
      sendToControl.appendChild(
        el('span', {
          className: 'bl-forms-builder__send-to-value',
          text: emailFieldLabel(only),
        })
      );
      return;
    }

    const select = el('select', { className: 'widefat' });
    emailFields.forEach((field) => {
      const opt = document.createElement('option');
      opt.value = field.name;
      opt.textContent = emailFieldLabel(field);
      if (field.name === state.user_email_field) {
        opt.selected = true;
      }
      select.appendChild(opt);
    });
    select.addEventListener('change', () => {
      state.user_email_field = select.value;
      emit();
    });
    sendToControl.appendChild(select);
  };

  const notifySwitch = plainSwitch(t('notifyUser', 'Enable'), {
    checked: !!state.notify_user,
    onChange: (checked) => {
      state.notify_user = checked;
      syncNotifyOptions();
      emit();
    },
  });
  const notify = notifySwitch.input;

  const syncNotifyOptions = () => {
    userOptions.hidden = !notify.checked;
    if (notify.checked) {
      renderSendTo();
    }
  };

  notifications.append(
    fieldRow(
      t('recipient', 'Recipient'),
      recipient,
      t('recipientHelp', 'Leave empty to use the site administrator email.')
    ),
    fieldRow(t('subject', 'Subject'), adminSubject),
    el('hr', { className: 'bl-forms-builder__separator' }),
    el('div', { className: 'bl-forms-builder__section' }, [
      el('h3', {
        className: 'bl-forms-builder__section-title',
        text: t('confirmationEmail', 'Confirmation email'),
      }),
      notifySwitch.root,
      userOptions,
    ])
  );

  syncNotifyOptions();

  // Settings
  const settingsPanel = el('div', {
    className: 'bl-forms-builder__panel',
    dataset: { blFormsPanel: 'settings' },
    hidden: true,
  });

  const submitLabel = bindText(
    el('input', { type: 'text', className: 'widefat', placeholder: fbSubmit }),
    'submit_label'
  );
  const success = bindText(
    el('textarea', { className: 'widefat', rows: '2', placeholder: fbSuccess }),
    'success_message'
  );
  const error = bindText(
    el('textarea', { className: 'widefat', rows: '2', placeholder: fbError }),
    'error_message'
  );
  const validation = bindText(
    el('textarea', { className: 'widefat', rows: '2', placeholder: fbValidation }),
    'validation_message'
  );
  const requiredMsg = bindText(
    el('input', { type: 'text', className: 'widefat', placeholder: fbRequired }),
    'required_message'
  );

  const msgFallbacks = (window.blFormsAdmin && window.blFormsAdmin.messageFallbacks) || {};
  const charCountText = bindText(
    el('input', {
      type: 'text',
      className: 'widefat',
      placeholder: msgFallbacks.char_count || t('charCountTextDefault', '%remaining% characters remaining'),
    }),
    'char_count_text'
  );
  const charCountEmptyText = bindText(
    el('input', {
      type: 'text',
      className: 'widefat',
      placeholder: msgFallbacks.char_count_empty || t('charCountEmptyDefault', 'No characters remaining'),
    }),
    'char_count_empty_text'
  );
  const bindErrorMsg = (key, fallbackKey) =>
    bindText(
      el('input', {
        type: 'text',
        className: 'widefat',
        placeholder: msgFallbacks[fallbackKey] || '',
      }),
      key
    );

  const numberMsg = bindErrorMsg('number_message', 'number');
  const minMsg = bindErrorMsg('min_message', 'min');
  const maxMsg = bindErrorMsg('max_message', 'max');
  const emailMsg = bindErrorMsg('email_message', 'email');
  const urlMsg = bindErrorMsg('url_message', 'url');
  const phoneMsg = bindErrorMsg('phone_message', 'phone');
  const dateMsg = bindErrorMsg('date_message', 'date');
  const dateMinMsg = bindErrorMsg('date_min_message', 'date_min');
  const dateMaxMsg = bindErrorMsg('date_max_message', 'date_max');
  const dateBeforeMsg = bindErrorMsg('date_before_message', 'date_before');
  const dateAfterMsg = bindErrorMsg('date_after_message', 'date_after');
  const timeMsg = bindErrorMsg('time_message', 'time');
  const timeMinMsg = bindErrorMsg('time_min_message', 'time_min');
  const timeMaxMsg = bindErrorMsg('time_max_message', 'time_max');
  const datetimeMsg = bindErrorMsg('datetime_message', 'datetime');
  const datetimeMinMsg = bindErrorMsg('datetime_min_message', 'datetime_min');
  const datetimeMaxMsg = bindErrorMsg('datetime_max_message', 'datetime_max');
  const fileMsg = bindErrorMsg('file_message', 'file');
  const fileTypeMsg = bindErrorMsg('file_type_message', 'file_type');
  const fileSizeMsg = bindErrorMsg('file_size_message', 'file_size');
  const fileMaxMsg = bindErrorMsg('file_max_message', 'file_max');
  const optionMsg = bindErrorMsg('option_message', 'option');

  const rangeHelp = () =>
    el('span', {
      className: 'description bl-forms-builder__field-errors-help',
      text: t('minMaxMessageHelp', 'The placeholder %s is replaced by the limit.'),
    });

  const successRow = fieldRow(t('successMessage', 'Success message'), success);
  const wpMaxUploadLabel =
    (window.blFormsAdmin && window.blFormsAdmin.wpMaxUploadSize) || '';
  const uploadMaxSize = el('input', {
    type: 'number',
    className: 'small-text bl-forms-builder__security-input',
    min: '0.1',
    step: '0.1',
    value: state.upload_max_size_mb != null && state.upload_max_size_mb !== ''
      ? String(state.upload_max_size_mb)
      : '',
  });
  uploadMaxSize.addEventListener('input', () => {
    state.upload_max_size_mb = uploadMaxSize.value.trim();
    emit();
  });
  uploadMaxSize.addEventListener('change', () => {
    state.upload_max_size_mb = uploadMaxSize.value.trim();
    emit();
  });
  const uploadMaxSizeRow = el('div', { className: 'bl-forms-builder__security-inline' }, [
    uploadMaxSize,
    el('span', { text: t('uploadMaxSizeUnit', 'MB') }),
  ]);
  const fileSettingsBlock = el('div', { className: 'bl-forms-builder__field-errors' }, [
    el('h3', {
      className: 'bl-forms-builder__section-title',
      text: t('fileSettings', 'File settings'),
    }),
    el('div', { className: 'bl-forms-builder__field-errors-box' }, [
      fieldRow(
        t('uploadMaxSize', 'Maximum file size'),
        uploadMaxSizeRow,
        wpMaxUploadLabel
          ? t(
              'uploadMaxSizeHelp',
              'Leave empty to use the server limit (%s).'
            ).replace('%s', wpMaxUploadLabel)
          : t(
              'uploadMaxSizeHelpEmpty',
              'Leave empty to use the server limit.'
            )
      ),
    ]),
  ]);

  const afterOptions = el('div', { className: 'bl-forms-builder__after-submit' });
  const afterSelect = el('select', {
    className: 'widefat',
    'aria-label': t('afterSubmit', 'After submission'),
  });
  [
    { id: 'message', label: t('afterSubmitMessage', 'Show success message') },
    { id: 'redirect', label: t('afterSubmitRedirect', 'Go to page') },
  ].forEach((mode) => {
    const option = el('option', { value: mode.id, text: mode.label });
    if (state.after_submit === mode.id) {
      option.selected = true;
    }
    afterSelect.appendChild(option);
  });

  const redirectPanel = el('div', {
    className: 'bl-forms-builder__after-submit-redirect',
    hidden: state.after_submit !== 'redirect',
  });
  const redirectSummary = el('div', { className: 'bl-forms-builder__page-picker-summary' });
  const redirectPickBtn = el('button', {
    type: 'button',
    className: 'button -small',
    text: t('choosePage', 'Choose page'),
  });
  const redirectClearBtn = el('button', {
    type: 'button',
    className: 'button-link',
    text: t('clearPage', 'Clear'),
    hidden: !state.redirect_page_id,
  });
  const redirectActions = el('div', { className: 'bl-forms-builder__page-picker-actions' }, [
    redirectPickBtn,
    redirectClearBtn,
  ]);
  const redirectRow = el('div', { className: 'bl-forms-builder__page-picker-row' }, [
    redirectSummary,
    redirectActions,
  ]);

  const syncAfterSubmitUi = () => {
    const isRedirect = state.after_submit === 'redirect';
    redirectPanel.hidden = !isRedirect;
    afterSelect.value = state.after_submit === 'redirect' ? 'redirect' : 'message';

    redirectSummary.replaceChildren();
    if (state.redirect_page_id) {
      const title =
        state.redirect_page_title ||
        t('selectedPage', 'Selected page') + ' #' + state.redirect_page_id;
      redirectSummary.appendChild(
        el('span', {
          className: 'bl-forms-builder__page-picker-value',
          text: title,
        })
      );
      if (state.redirect_page_url) {
        redirectSummary.appendChild(
          el('span', {
            className: 'description bl-forms-builder__page-picker-url',
            text: state.redirect_page_url,
            title: state.redirect_page_url,
          })
        );
      }
    } else {
      redirectSummary.appendChild(
        el('span', {
          className: 'description',
          text: t('choosePageHelp', 'Select the page visitors should land on.'),
        })
      );
    }
    redirectClearBtn.hidden = !state.redirect_page_id;
    redirectPickBtn.textContent = state.redirect_page_id
      ? t('changePage', 'Change page')
      : t('choosePage', 'Choose page');
  };

  afterSelect.addEventListener('change', () => {
    state.after_submit = afterSelect.value === 'redirect' ? 'redirect' : 'message';
    syncAfterSubmitUi();
    emit();
  });

  redirectPickBtn.addEventListener('click', async () => {
    const cfg = window.blFormsAdmin || {};
    const page = await openPagePicker({
      selectedId: state.redirect_page_id || 0,
      title: t('pagePickerTitle', 'Select a page'),
      searchPlaceholder: t('pagePickerSearch', 'Search pages…'),
      empty: t('pagePickerEmpty', 'No pages found.'),
      loading: t('pagePickerLoading', 'Loading…'),
      cancelLabel: t('cancel', 'Cancel'),
      selectLabel: t('selectPage', 'Select'),
      restUrl: cfg.pagesRestUrl || '',
      restNonce: cfg.restNonce || '',
    });
    if (!page) {
      return;
    }
    state.redirect_page_id = page.id;
    state.redirect_page_title = page.title;
    state.redirect_page_url = page.url;
    syncAfterSubmitUi();
    emit();
  });

  redirectClearBtn.addEventListener('click', () => {
    state.redirect_page_id = 0;
    state.redirect_page_title = '';
    state.redirect_page_url = '';
    syncAfterSubmitUi();
    emit();
  });

  redirectPanel.append(redirectRow);

  afterOptions.append(
    fieldRow(t('afterSubmit', 'After submission'), afterSelect),
    redirectPanel
  );

  // Hydrate selected page label from localized bootstrap when editing.
  const boot = window.blFormsAdmin || {};
  if (
    state.redirect_page_id &&
    boot.redirectPage &&
    Number(boot.redirectPage.id) === state.redirect_page_id
  ) {
    state.redirect_page_title = boot.redirectPage.title || '';
    state.redirect_page_url = boot.redirectPage.url || '';
  }
  syncAfterSubmitUi();

  settingsPanel.append(
    fieldRow(t('submitLabel', 'Submit button label'), submitLabel),
    afterOptions,
    successRow,
    fieldRow(t('errorMessage', 'Error message'), error),
    fieldRow(t('validationMessage', 'Validation message'), validation),
    fileSettingsBlock
  );

  // Validation (field errors)
  const validationPanel = el('div', {
    className: 'bl-forms-builder__panel',
    dataset: { blFormsPanel: 'validation' },
    hidden: true,
  });

  validationPanel.append(
    errorSection(t('requiredError', 'Required'), [requiredMsg]),
    errorSection(t('charCountSection', 'Character count'), [
      fieldRow(
        t('charCountText', 'Character count text'),
        charCountText,
        t('charCountTextHelp', 'The placeholders %remaining%, %count%, and %max% are replaced by the remaining count, current count, and maximum.')
      ),
      fieldRow(t('charCountEmptyText', 'When limit is reached'), charCountEmptyText),
    ]),
    errorSection(t('numberError', 'Number'), [
      fieldRow(t('invalidError', 'Invalid'), numberMsg),
      fieldRow(t('minError', 'Minimum'), minMsg),
      fieldRow(t('maxError', 'Maximum'), maxMsg),
      rangeHelp(),
    ]),
    errorSection(t('emailError', 'Email'), [emailMsg]),
    errorSection(t('urlError', 'URL'), [urlMsg]),
    errorSection(t('phoneError', 'Phone'), [phoneMsg]),
    errorSection(t('dateError', 'Date'), [
      fieldRow(t('invalidError', 'Invalid'), dateMsg),
      fieldRow(t('minError', 'Minimum'), dateMinMsg),
      fieldRow(t('maxError', 'Maximum'), dateMaxMsg),
      rangeHelp(),
      fieldRow(t('dateBeforeError', 'Before related field'), dateBeforeMsg),
      fieldRow(t('dateAfterError', 'After related field'), dateAfterMsg),
      el('span', {
        className: 'description bl-forms-builder__field-errors-help',
        text: t(
          'dateRelationMessageHelp',
          'The placeholder %s is replaced by the related field label.'
        ),
      }),
    ]),
    errorSection(t('timeError', 'Time'), [
      fieldRow(t('invalidError', 'Invalid'), timeMsg),
      fieldRow(t('minError', 'Minimum'), timeMinMsg),
      fieldRow(t('maxError', 'Maximum'), timeMaxMsg),
      rangeHelp(),
    ]),
    errorSection(t('datetimeError', 'Date & time'), [
      fieldRow(t('invalidError', 'Invalid'), datetimeMsg),
      fieldRow(t('minError', 'Minimum'), datetimeMinMsg),
      fieldRow(t('maxError', 'Maximum'), datetimeMaxMsg),
      rangeHelp(),
    ]),
    errorSection(t('fileError', 'File'), [
      fieldRow(t('invalidError', 'Invalid'), fileMsg),
      fieldRow(
        t('fileTypeError', 'Wrong file type'),
        fileTypeMsg,
        t('fileTypeErrorHelp', 'The placeholder %s is replaced by the allowed file types.')
      ),
      fieldRow(
        t('fileSizeError', 'File too large'),
        fileSizeMsg,
        t('fileSizeErrorHelp', 'The placeholder %s is replaced by the maximum size.')
      ),
      fieldRow(
        t('fileMaxError', 'Too many files'),
        fileMaxMsg,
        t('fileMaxErrorHelp', 'The placeholder %s is replaced by the maximum number of files.')
      ),
    ]),
    errorSection(t('optionError', 'Choice'), [optionMsg])
  );

  // Security
  const securityPanel = el('div', {
    className: 'bl-forms-builder__panel',
    dataset: { blFormsPanel: 'security' },
    hidden: true,
  });

  const minFillSeconds = el('input', {
    type: 'number',
    className: 'small-text bl-forms-builder__security-input',
    min: '1',
    max: '300',
    step: '1',
    value: String(state.min_fill_time || 2),
  });
  const minFillOptions = el('div', {
    className: 'bl-forms-builder__security-controls',
    hidden: !state.min_fill_time_enabled,
  }, [
    el('div', { className: 'bl-forms-builder__security-inline' }, [
      el('span', { text: t('securityMinFillTimeAtLeast', 'At least') }),
      minFillSeconds,
      el('span', { text: t('securityMinFillTimeSeconds', 'seconds') }),
    ]),
  ]);

  const rateMax = el('input', {
    type: 'number',
    className: 'small-text bl-forms-builder__security-input',
    min: '1',
    max: '100',
    step: '1',
    value: String(state.rate_limit_max || 3),
  });
  const rateWindow = el('input', {
    type: 'number',
    className: 'small-text bl-forms-builder__security-input',
    min: '1',
    max: '1440',
    step: '1',
    value: String(state.rate_limit_window || 5),
  });
  const rateOptions = el('div', {
    className: 'bl-forms-builder__security-controls',
    hidden: !state.rate_limit_enabled,
  }, [
    el('div', { className: 'bl-forms-builder__security-inline' }, [
      el('span', { text: t('securityRateLimitMax', 'Max') }),
      rateMax,
      el('span', { text: t('securityRateLimitIn', 'submissions in') }),
      rateWindow,
      el('span', { text: t('securityRateLimitMinutes', 'minutes') }),
    ]),
  ]);

  const minFillSwitch = securitySwitch(
    t('securityMinFillTime', 'Minimum fill time'),
    'recommended',
    {
      checked: !!state.min_fill_time_enabled,
      onChange: (checked) => {
        state.min_fill_time_enabled = checked;
        minFillOptions.hidden = !checked;
        emit();
      },
    }
  );
  const rateSwitch = securitySwitch(
    t('securityRateLimit', 'Submission limit'),
    'recommended',
    {
      checked: !!state.rate_limit_enabled,
      onChange: (checked) => {
        state.rate_limit_enabled = checked;
        rateOptions.hidden = !checked;
        emit();
      },
    }
  );

  minFillSeconds.addEventListener('input', () => {
    const n = parseInt(minFillSeconds.value, 10);
    state.min_fill_time = Number.isFinite(n) && n > 0 ? n : 2;
    emit();
  });
  rateMax.addEventListener('input', () => {
    const n = parseInt(rateMax.value, 10);
    state.rate_limit_max = Number.isFinite(n) && n > 0 ? n : 3;
    emit();
  });
  rateWindow.addEventListener('input', () => {
    const n = parseInt(rateWindow.value, 10);
    state.rate_limit_window = Number.isFinite(n) && n > 0 ? n : 5;
    emit();
  });

  securityPanel.append(
    lockedOption(
      t('securityCsrf', 'CSRF protection'),
      t(
        'securityCsrfHelp',
        'A WordPress nonce is verified on every submission to block forged requests.'
      )
    ),
    lockedOption(
      t('securityJsCheck', 'JavaScript check'),
      t(
        'securityJsCheckHelp',
        'A hidden field is set by JavaScript. If the expected value is missing, the submission is discarded.'
      )
    ),
    lockedOption(
      t('securityHoneypot', 'Honeypot field'),
      t(
        'securityHoneypotHelp',
        'A field hidden from visitors detects simple bots. If it is filled, the submission is discarded.'
      )
    ),
    securityOption(
      minFillSwitch.root,
      t(
        'securityMinFillTimeHelp',
        'Submissions are rejected when the form is sent unusually quickly.'
      ),
      minFillOptions
    ),
    securityOption(
      rateSwitch.root,
      t(
        'securityRateLimitHelp',
        'Limits how often the same visitor can submit the form within a time period.'
      ),
      rateOptions
    )
  );

  return {
    notifications,
    settings: settingsPanel,
    validation: validationPanel,
    security: securityPanel,
    getSettings: () => {
      const next = { ...state };
      delete next.redirect_page_title;
      delete next.redirect_page_url;
      return next;
    },
    syncFields(fields) {
      emailFields = emailFieldsFromList(fields);
      if (notify.checked) {
        const before = state.user_email_field || '';
        renderSendTo();
        if ((state.user_email_field || '') !== before) {
          emit();
        }
      } else {
        ensureSelectedEmailField();
      }
    },
  };
}
