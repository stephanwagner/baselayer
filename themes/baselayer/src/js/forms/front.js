/**
 * Frontend form AJAX submit + spinner + image preview.
 */
function initImagePreviews(root) {
  root.querySelectorAll('[data-bl-form-image-input]').forEach((input) => {
    const preview = input
      .closest('.bl-form__field')
      ?.querySelector('[data-bl-form-image-preview]');
    if (!preview) return;

    input.addEventListener('change', () => {
      preview.replaceChildren();
      const files = Array.from(input.files || []).filter((file) =>
        String(file.type || '').startsWith('image/')
      );
      if (!files.length) {
        preview.hidden = true;
        return;
      }
      preview.hidden = false;
      files.forEach((file) => {
        const img = document.createElement('img');
        img.className = 'bl-form__image-preview-item';
        img.alt = file.name || '';
        img.src = URL.createObjectURL(file);
        img.onload = () => URL.revokeObjectURL(img.src);
        preview.appendChild(img);
      });
    });
  });
}

function initForm(root) {
  const form = root.querySelector('[data-bl-form-el]');
  const message = root.querySelector('[data-bl-form-message]');
  const submit = root.querySelector('[data-bl-form-submit]');
  const spinner = root.querySelector('[data-bl-form-spinner]');
  const label = root.querySelector('.bl-form__submit-label');
  if (!form || !submit) return;

  initImagePreviews(root);

  // Prove JavaScript ran: copy the signed token into the hidden check field.
  const jsField = form.querySelector('[data-bl-form-js-field]');
  const jsToken = root.dataset.blFormJs || '';
  if (jsField && jsToken) {
    jsField.value = jsToken;
  }

  const ajaxUrl = root.dataset.blFormAjax || '/wp-admin/admin-ajax.php';
  const successMsg = root.dataset.blFormSuccess || '';
  const errorMsg = root.dataset.blFormError || '';
  const validationMsg = root.dataset.blFormValidation || '';
  const afterSubmit = root.dataset.blFormAfter || 'message';
  const redirectUrl = root.dataset.blFormRedirect || '';

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

  const handleSuccess = (payload) => {
    // Only trust redirect from a real submission response (not honeypot / JS-check fakes).
    const redirect =
      (payload && payload.redirect) ||
      (payload && payload.entry_id && afterSubmit === 'redirect' ? redirectUrl : '') ||
      '';
    if (redirect) {
      window.location.assign(redirect);
      return;
    }
    showMessage((payload && payload.message) || successMsg, 'success');
    const fields = root.querySelector('.bl-form__fields');
    if (fields) fields.hidden = true;
    submit.hidden = true;
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (jsField && jsToken) {
      jsField.value = jsToken;
    }
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
        handleSuccess((data && data.data) || {});
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
