import { el, t, flattenFields } from './dom.js';

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

function emailFieldsFromList(fields) {
  return flattenFields(fields || []).filter(
    (field) => field && field.type === 'email' && field.name
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
  const isRequired = kind === 'required';
  return el('span', {
    className:
      'bl-forms-builder__security-badge' +
      (isRequired
        ? ' bl-forms-builder__security-badge--required'
        : ' bl-forms-builder__security-badge--recommended'),
    text: isRequired
      ? t('securityRequired', 'required')
      : t('securityRecommended', 'recommended'),
  });
}

function securityLabel(checkbox, label, kind) {
  return el('label', { className: 'bl-forms-builder__security-label' }, [
    checkbox,
    el('span', { className: 'bl-forms-builder__security-label-text', text: label }),
    securityBadge(kind),
  ]);
}

function lockedOption(label, help, kind = 'required') {
  const cb = el('input', { type: 'checkbox', checked: true, disabled: true });
  return el('div', { className: 'bl-forms-builder__setting bl-forms-builder__security-option' }, [
    securityLabel(cb, label, kind),
    el('span', { className: 'description', text: help }),
  ]);
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
  const fbSubmit = builderRoot.dataset.fallbackSubmit || '';
  const fbSuccess = builderRoot.dataset.fallbackSuccess || '';
  const fbError = builderRoot.dataset.fallbackError || '';
  const fbValidation = builderRoot.dataset.fallbackValidation || '';

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
  const adminSubject = bindText(el('input', { type: 'text', className: 'widefat' }), 'admin_email_subject');
  const notify = el('input', { type: 'checkbox', checked: !!state.notify_user });

  const userOptions = el('div', { className: 'bl-forms-builder__notify-user-options' });
  const sendToWrap = el('div', { className: 'bl-forms-builder__setting bl-forms-builder__send-to' });
  const sendToControl = el('div', { className: 'bl-forms-builder__send-to-control' });
  sendToWrap.append(
    el('label', {}, [el('strong', { text: t('sendTo', 'Send to') })]),
    sendToControl
  );

  const userSubject = bindText(el('input', { type: 'text', className: 'widefat' }), 'user_email_subject');
  const userIntro = bindText(el('textarea', { className: 'widefat', rows: '3' }), 'user_email_intro');
  const userSubjectRow = fieldRow(t('userSubject', 'User email subject'), userSubject);
  const userIntroRow = fieldRow(t('userIntro', 'User email intro'), userIntro);

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
        el('span', {
          className: 'description',
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

  const syncNotifyOptions = () => {
    userOptions.hidden = !notify.checked;
    if (notify.checked) {
      renderSendTo();
    }
  };

  notify.addEventListener('change', () => {
    state.notify_user = notify.checked;
    syncNotifyOptions();
    emit();
  });

  notifications.append(
    fieldRow(t('recipient', 'Notification recipient'), recipient, t('recipientHelp')),
    fieldRow(t('adminSubject', 'Admin email subject'), adminSubject),
    el('p', { className: 'bl-forms-builder__setting' }, [
      el('label', {}, [notify, ' ' + t('notifyUser', 'Send confirmation email to submitter')]),
    ]),
    userOptions
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

  settingsPanel.append(
    fieldRow(t('submitLabel', 'Submit button label'), submitLabel),
    fieldRow(t('successMessage', 'Success message'), success),
    fieldRow(t('errorMessage', 'Error message'), error),
    fieldRow(t('validationMessage', 'Validation message'), validation)
  );

  // Security
  const securityPanel = el('div', {
    className: 'bl-forms-builder__panel',
    dataset: { blFormsPanel: 'security' },
    hidden: true,
  });

  const minFillEnabled = el('input', {
    type: 'checkbox',
    checked: !!state.min_fill_time_enabled,
  });
  const minFillSeconds = el('input', {
    type: 'number',
    className: 'small-text',
    min: '1',
    max: '300',
    step: '1',
    value: String(state.min_fill_time || 2),
  });
  const minFillOptions = el('div', {
    className: 'bl-forms-builder__security-options',
    hidden: !state.min_fill_time_enabled,
  }, [
    el('div', { className: 'bl-forms-builder__security-inline' }, [
      minFillSeconds,
      el('span', { text: t('securityMinFillTimeSeconds', 'seconds') }),
    ]),
  ]);

  const rateEnabled = el('input', {
    type: 'checkbox',
    checked: !!state.rate_limit_enabled,
  });
  const rateMax = el('input', {
    type: 'number',
    className: 'small-text',
    min: '1',
    max: '100',
    step: '1',
    value: String(state.rate_limit_max || 3),
  });
  const rateWindow = el('input', {
    type: 'number',
    className: 'small-text',
    min: '1',
    max: '1440',
    step: '1',
    value: String(state.rate_limit_window || 5),
  });
  const rateOptions = el('div', {
    className: 'bl-forms-builder__security-options',
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

  minFillEnabled.addEventListener('change', () => {
    state.min_fill_time_enabled = minFillEnabled.checked;
    minFillOptions.hidden = !minFillEnabled.checked;
    emit();
  });
  minFillSeconds.addEventListener('input', () => {
    const n = parseInt(minFillSeconds.value, 10);
    state.min_fill_time = Number.isFinite(n) && n > 0 ? n : 2;
    emit();
  });

  rateEnabled.addEventListener('change', () => {
    state.rate_limit_enabled = rateEnabled.checked;
    rateOptions.hidden = !rateEnabled.checked;
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
      ),
      'required'
    ),
    lockedOption(
      t('securityJsCheck', 'JavaScript check'),
      t(
        'securityJsCheckHelp',
        'A hidden field is filled by JavaScript. Submissions without a valid value are discarded quietly.'
      ),
      'required'
    ),
    el('div', { className: 'bl-forms-builder__setting bl-forms-builder__security-option' }, [
      securityLabel(
        el('input', { type: 'checkbox', checked: true, disabled: true }),
        t('securityHoneypot', 'Honeypot field'),
        'required'
      ),
      el('span', {
        className: 'description',
        text: t(
          'securityHoneypotHelp',
          'A hidden field traps bots. If it is filled, the submission is discarded quietly.'
        ),
      }),
    ]),
    el('div', { className: 'bl-forms-builder__setting bl-forms-builder__security-option' }, [
      securityLabel(minFillEnabled, t('securityMinFillTime', 'Minimum fill time'), 'recommended'),
      el('span', {
        className: 'description',
        text: t(
          'securityMinFillTimeHelp',
          'Reject submissions that are sent faster than a real visitor would typically fill the form.'
        ),
      }),
      minFillOptions,
    ]),
    el('div', { className: 'bl-forms-builder__setting bl-forms-builder__security-option' }, [
      securityLabel(rateEnabled, t('securityRateLimit', 'Maximum submissions'), 'recommended'),
      el('span', {
        className: 'description',
        text: t(
          'securityRateLimitHelp',
          'Limit how many times the same visitor can submit this form in a time window.'
        ),
      }),
      rateOptions,
    ])
  );

  return {
    notifications,
    settings: settingsPanel,
    security: securityPanel,
    getSettings: () => ({ ...state }),
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
