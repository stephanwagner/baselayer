/**
 * Developer → Features — blocks engine change modal.
 */
(function () {
  const root = document.querySelector('[data-bl-blocks-system]');
  if (!root) {
    return;
  }

  const form = root.closest('form');
  const modal = document.getElementById('bl-blocks-system-modal');
  const valueInput = root.querySelector('[data-bl-blocks-system-value]');
  const openBtn = root.querySelector('[data-bl-blocks-system-open]');
  const switchBtn = modal?.querySelector('[data-bl-blocks-system-switch]');
  const current = root.getAttribute('data-current') || 'none';

  if (!form || !modal || !valueInput || !openBtn || !switchBtn) {
    return;
  }

  const getSelected = () => {
    const checked = modal.querySelector('input[name="bl_blocks_system_choice"]:checked');
    return checked instanceof HTMLInputElement ? checked.value : current;
  };

  const syncSwitchButton = () => {
    switchBtn.disabled = getSelected() === current;
  };

  const openModal = () => {
    modal.querySelectorAll('input[name="bl_blocks_system_choice"]').forEach((input) => {
      if (input instanceof HTMLInputElement) {
        input.checked = input.value === (valueInput.value || current);
      }
    });
    syncSwitchButton();
    modal.hidden = false;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('bl-blocks-system-modal-open');
    const first = modal.querySelector('input[name="bl_blocks_system_choice"]:checked');
    if (first instanceof HTMLElement) {
      first.focus();
    }
  };

  const closeModal = () => {
    modal.classList.remove('is-open');
    modal.hidden = true;
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('bl-blocks-system-modal-open');
    openBtn.focus();
  };

  openBtn.addEventListener('click', openModal);

  modal.querySelectorAll('[data-bl-blocks-system-close]').forEach((el) => {
    el.addEventListener('click', closeModal);
  });

  modal.querySelectorAll('input[name="bl_blocks_system_choice"]').forEach((input) => {
    input.addEventListener('change', syncSwitchButton);
  });

  switchBtn.addEventListener('click', () => {
    const next = getSelected();
    if (!next || next === current) {
      return;
    }
    valueInput.value = next;
    form.submit();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal.classList.contains('is-open')) {
      event.preventDefault();
      closeModal();
    }
  });
})();
