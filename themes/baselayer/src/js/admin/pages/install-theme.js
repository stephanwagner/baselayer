/**
 * Developer section on the BaseLayer install page:
 * - When only the new user has developer rights: force "Log in as this user" checked (readonly, value still sent).
 * - When only the current user has developer rights: uncheck "Log in as this user".
 * - Sync theme name into the description on blur (BaseLayer / previous name → new name).
 * Runs once on DOMContentLoaded.
 */

function initDeveloperInstaller() {
  const form = document.querySelector('form[data-fs-install-form]');

  if (!form) {
    return;
  }

  const currentDevCheckbox = form.querySelector(
    'input[type="checkbox"][name="developer[current_user][has_developer_rights]"]',
  );
  const newDevCheckbox = form.querySelector('input[type="checkbox"][name="developer[new_user][has_developer_rights]"]');
  const loginAfterSetupCheckbox = form.querySelector(
    'input[type="checkbox"][name="developer[new_user][login_after_setup]"]',
  );

  if (!newDevCheckbox || !loginAfterSetupCheckbox) {
    return;
  }

  function syncLoginAfterSetup() {
    const currentHasDev = currentDevCheckbox?.checked ?? false;
    const newHasDev = newDevCheckbox.checked;

    if (!currentHasDev && newHasDev) {
      // Only new user will be developer → force "Log in as this user" (readonly, value still sent).
      loginAfterSetupCheckbox.checked = true;
      loginAfterSetupCheckbox.setAttribute('data-fs-forced', '1');
    } else {
      loginAfterSetupCheckbox.removeAttribute('data-fs-forced');
      if (currentHasDev && !newHasDev) {
        // Only current user is developer → uncheck "Log in as this user".
        loginAfterSetupCheckbox.checked = false;
      }
    }
  }

  loginAfterSetupCheckbox.addEventListener('click', (e) => {
    if (loginAfterSetupCheckbox.getAttribute('data-fs-forced') === '1') {
      e.preventDefault();
      loginAfterSetupCheckbox.checked = true;
    }
  });

  currentDevCheckbox?.addEventListener('change', syncLoginAfterSetup);
  newDevCheckbox.addEventListener('change', syncLoginAfterSetup);

  syncLoginAfterSetup();
}

/**
 * Keep theme description in sync with theme name on blur.
 * Replaces "BaseLayer" or the previously synced name so typo fixes update too.
 */
function initThemeNameDescriptionSync() {
  const form = document.querySelector('form[data-fs-install-form]');
  if (!form) {
    return;
  }

  const nameInput = form.querySelector('input[name="theme[name]"]');
  const descriptionInput = form.querySelector('input[name="theme[description]"]');
  if (!nameInput || !descriptionInput) {
    return;
  }

  let syncedName = nameInput.value.trim();

  function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function replaceAll(haystack, needle, replacement) {
    if (!needle) {
      return haystack;
    }
    return haystack.replace(new RegExp(escapeRegExp(needle), 'g'), replacement);
  }

  nameInput.addEventListener('blur', () => {
    const nextName = nameInput.value.trim();
    if (!nextName) {
      return;
    }

    let description = descriptionInput.value;
    const before = description;

    if (syncedName && syncedName !== nextName && description.includes(syncedName)) {
      description = replaceAll(description, syncedName, nextName);
    }

    if (description.includes('BaseLayer') && nextName !== 'BaseLayer') {
      description = replaceAll(description, 'BaseLayer', nextName);
    }

    if (description !== before) {
      descriptionInput.value = description;
    }

    syncedName = nextName;
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initDeveloperInstaller();
  initThemeNameDescriptionSync();
});

