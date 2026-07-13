import { mount } from './index';
import { slugify } from './dom';
import { mountOptionsStack } from './options-stack';

/**
 * Blocks admin: mount Field builder + combined Options stack; sync on submit.
 */
function bootBlocksAdmin() {
  const fieldsRoot = document.getElementById('fs-field-builder');
  const optionsRoot = document.getElementById('fs-options-stack');
  const fieldsInput = document.getElementById('fs-block-fields-json');
  const stackInput = document.getElementById('fs-block-options-stack-json');
  const form = document.getElementById('fs-block-edit-form');
  if (!fieldsRoot || !fieldsInput || !form) {
    return;
  }

  const cfg = window.fsFieldBuilderBlocksAdmin || {};

  let initialFields = [];
  try {
    initialFields = fieldsInput.value ? JSON.parse(fieldsInput.value) : [];
  } catch (e) {
    initialFields = Array.isArray(cfg.initialFields) ? cfg.initialFields : [];
  }

  const fieldsApi = mount(fieldsRoot, {
    mode: 'fields',
    initialFields: Array.isArray(initialFields) ? initialFields : [],
    i18n: {
      addField: cfg.addField || 'Add field',
      empty: cfg.empty || 'No fields yet. Add a field to get started.',
    },
  });

  let stackApi = null;
  if (optionsRoot && stackInput) {
    let initialStack = [];
    try {
      initialStack = stackInput.value ? JSON.parse(stackInput.value) : [];
    } catch (e) {
      initialStack = Array.isArray(cfg.initialOptionsStack) ? cfg.initialOptionsStack : [];
    }

    stackApi = mountOptionsStack(optionsRoot, {
      presets: Array.isArray(cfg.presets) ? cfg.presets : [],
      initialStack: Array.isArray(initialStack) ? initialStack : [],
      i18n: {
        addPreset: cfg.addPreset || 'Add preset',
        addOption: cfg.addOption || 'Add option',
        empty: cfg.emptyOptionsStack || 'No options yet. Add a preset or a custom option.',
        removePreset: cfg.removePreset || 'Remove',
        presetBadge: cfg.presetBadge || 'Preset',
      },
    });
  }

  form.addEventListener('submit', () => {
    fieldsInput.value = JSON.stringify(fieldsApi.getSchema());
    if (stackInput && stackApi) {
      stackInput.value = JSON.stringify(stackApi.getStack());
    }
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
