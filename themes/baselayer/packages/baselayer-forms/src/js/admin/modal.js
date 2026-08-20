/**
 * Shared form-builder notice / confirm modal.
 */

function fb() {
  return window.BlFormBuilder || {};
}

/**
 * @param {string} title
 * @param {string} message
 * @param {{ confirmLabel?: string, onConfirm?: () => void }} [options]
 */
export function openSimpleModal(title, message, options = {}) {
  const { el, t } = fb();
  if (!el || !t) {
    window.alert(message);
    return;
  }

  document.querySelectorAll('.bl-forms-builder__modal').forEach((node) => node.remove());

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

  const footerChildren = [
    el('button', {
      type: 'button',
      className: 'button',
      text: options.onConfirm ? t('cancel', 'Cancel') : t('close', 'Close'),
      onClick: close,
    }),
  ];

  if (options.onConfirm) {
    footerChildren.push(
      el('button', {
        type: 'button',
        className: 'button button-primary',
        text: options.confirmLabel || t('apply', 'Apply'),
        onClick: () => {
          options.onConfirm();
          close();
        },
      })
    );
  }

  const dialog = el('div', { className: 'bl-forms-builder__modal-dialog' });
  dialog.append(
    el('div', { className: 'bl-forms-builder__modal-header' }, [
      el('h2', { className: 'bl-forms-builder__modal-title', text: title }),
    ]),
    el('div', { className: 'bl-forms-builder__modal-body' }, [el('p', { text: message })]),
    el('div', { className: 'bl-forms-builder__modal-footer' }, footerChildren)
  );
  backdrop.appendChild(dialog);
  document.body.appendChild(backdrop);
}
