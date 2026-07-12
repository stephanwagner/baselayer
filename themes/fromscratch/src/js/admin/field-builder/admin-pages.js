import { mount } from './index';
import { slugify } from './dom';

/**
 * Blocks admin: mount Field builder and sync schema into a hidden input on submit.
 * Also auto-fills slug from name when slug is untouched.
 */
function bootBlocksAdmin() {
  const root = document.getElementById('fs-field-builder');
  const fieldsInput = document.getElementById('fs-block-fields-json');
  const form = document.getElementById('fs-block-edit-form');
  if (!root || !fieldsInput || !form) {
    return;
  }

  const cfg = window.fsFieldBuilderBlocksAdmin || {};
  let initialFields = [];
  try {
    initialFields = fieldsInput.value ? JSON.parse(fieldsInput.value) : [];
  } catch (e) {
    initialFields = Array.isArray(cfg.initialFields) ? cfg.initialFields : [];
  }

  const api = mount(root, {
    mode: 'fields',
    initialFields: Array.isArray(initialFields) ? initialFields : [],
    i18n: {
      addField: cfg.addField || 'Add field',
      empty: cfg.empty || 'No fields yet. Add a field to get started.',
    },
  });

  form.addEventListener('submit', () => {
    fieldsInput.value = JSON.stringify(api.getSchema());
  });

  const nameInput = document.getElementById('fs-block-title');
  const slugInput = document.getElementById('fs-block-slug');
  if (nameInput && slugInput) {
    nameInput.addEventListener('input', () => {
      if (!slugInput.dataset.fsSlugTouched) {
        slugInput.value = slugify(nameInput.value);
      }
    });
    slugInput.addEventListener('input', () => {
      slugInput.dataset.fsSlugTouched = '1';
    });
    if (slugInput.value) {
      slugInput.dataset.fsSlugTouched = '1';
    }
  }
}

/**
 * UI Dev sandbox boot.
 */
function bootUiDev() {
  const root = document.getElementById('fs-field-builder');
  const inspectBtn = document.getElementById('fs-field-builder-inspect');
  const output = document.getElementById('fs-field-builder-output');
  if (!root || !inspectBtn || !output) {
    return;
  }

  const i18n = window.fsFieldBuilderUiDev || {};
  const api = mount(root, {
    mode: 'fields',
    initialFields: Array.isArray(i18n.initialFields) ? i18n.initialFields : [],
    i18n: {
      addField: i18n.addField || 'Add field',
      empty: i18n.empty || 'No fields yet. Add a field to get started.',
    },
  });

  inspectBtn.addEventListener('click', () => {
    output.value = JSON.stringify(api.getSchema(), null, 2);
  });
}

function boot() {
  if (document.getElementById('fs-block-edit-form')) {
    bootBlocksAdmin();
    return;
  }
  bootUiDev();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
