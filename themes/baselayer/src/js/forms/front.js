/**
 * Frontend form AJAX submit + spinner.
 */
function initForm(root) {
  const form = root.querySelector('[data-bl-form-el]');
  const message = root.querySelector('[data-bl-form-message]');
  const submit = root.querySelector('[data-bl-form-submit]');
  const spinner = root.querySelector('[data-bl-form-spinner]');
  const label = root.querySelector('.bl-form__submit-label');
  if (!form || !submit) return;

  const ajaxUrl = root.dataset.blFormAjax || '/wp-admin/admin-ajax.php';
  const successMsg = root.dataset.blFormSuccess || '';
  const errorMsg = root.dataset.blFormError || '';
  const validationMsg = root.dataset.blFormValidation || '';

  const showMessage = (text, type) => {
    if (!message) return;
    message.hidden = !text;
    message.textContent = text || '';
    message.classList.remove('is-success', 'is-error');
    if (type) message.classList.add(type === 'success' ? 'is-success' : 'is-error');
  };

  const setLoading = (loading) => {
    submit.disabled = loading;
    root.classList.toggle('is-loading', loading);
    if (spinner) spinner.hidden = !loading;
    if (label) label.hidden = loading;
  };

  const clearInvalid = () => {
    root.querySelectorAll('.is-invalid').forEach((node) => node.classList.remove('is-invalid'));
  };

  const markInvalid = (names) => {
    (names || []).forEach((name) => {
      const field = root.querySelector('[data-bl-form-field="' + CSS.escape(name) + '"]');
      if (field) field.classList.add('is-invalid');
    });
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearInvalid();
    showMessage('', '');
    setLoading(true);

    try {
      const body = new FormData(form);
      const response = await fetch(ajaxUrl, {
        method: 'POST',
        body,
        credentials: 'same-origin',
      });
      const data = await response.json();
      if (data && data.success) {
        showMessage((data.data && data.data.message) || successMsg, 'success');
        form.hidden = true;
        return;
      }

      const payload = (data && data.data) || {};
      if (payload.code === 'validation') {
        markInvalid(payload.fields || []);
        showMessage(payload.message || validationMsg, 'error');
      } else {
        showMessage(payload.message || errorMsg, 'error');
      }
    } catch (err) {
      showMessage(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  });
}

function boot() {
  document.querySelectorAll('[data-bl-form]').forEach(initForm);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
