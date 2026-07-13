import { mount } from './index';

function boot() {
  const root = document.getElementById('bl-field-builder');
  const inspectBtn = document.getElementById('bl-field-builder-inspect');
  const output = document.getElementById('bl-field-builder-output');
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

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
