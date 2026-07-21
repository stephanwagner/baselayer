import { el, t } from './dom.js';

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

/**
 * Notifications + Settings panels bound to config.settings.
 *
 * @param {HTMLElement} rootMount
 * @param {object} settings
 * @param {HTMLElement} builderRoot — for data-fallback-* and admin email
 * @param {(settings: object) => void} onChange
 */
export function createPanels(settings, builderRoot, onChange) {
  const state = { ...(settings || {}) };

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
  notify.addEventListener('change', () => {
    state.notify_user = notify.checked;
    emit();
  });
  const userSubject = bindText(el('input', { type: 'text', className: 'widefat' }), 'user_email_subject');
  const userIntro = bindText(el('textarea', { className: 'widefat', rows: '3' }), 'user_email_intro');

  notifications.append(
    fieldRow(t('recipient', 'Notification recipient'), recipient, t('recipientHelp')),
    fieldRow(t('adminSubject', 'Admin email subject'), adminSubject),
    el('p', { className: 'bl-forms-builder__setting' }, [
      el('label', {}, [notify, ' ' + t('notifyUser', 'Send confirmation email to submitter')]),
      el('span', { className: 'description', text: t('notifyUserHelp') }),
    ]),
    fieldRow(t('userSubject', 'User email subject'), userSubject),
    fieldRow(t('userIntro', 'User email intro'), userIntro)
  );

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

  return { notifications, settings: settingsPanel, getSettings: () => ({ ...state }) };
}
