/**
 * Blocks admin entry — definition editor.
 */
import { mountApp } from './admin/app.js';
import './admin/field-form.js';
import './admin/template-metabox.js';

document.addEventListener('DOMContentLoaded', () => {
  const root = document.querySelector('[data-bl-blocks-builder]');
  const input = document.getElementById('bl-forms-config-json');
  if (!root || !input) return;

  let initial = { fields: [], settings: {} };
  try {
    initial = JSON.parse(input.value || '{}') || initial;
  } catch (e) {
    /* ignore */
  }

  const type =
    root.dataset.blBlockType ||
    (window.blBlocksAdmin && window.blBlocksAdmin.type) ||
    'block';

  mountApp(root, initial, type);
});
