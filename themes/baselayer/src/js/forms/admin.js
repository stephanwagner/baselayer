/**
 * Forms admin builder entry — tabbed Fields / Notifications / Settings UI.
 */
import { mountApp } from './admin/app.js';

document.addEventListener('DOMContentLoaded', () => {
  const root = document.querySelector('[data-bl-forms-builder]');
  const input = document.getElementById('bl-forms-config-json');
  if (!root || !input) return;

  let initial = { fields: [], settings: {} };
  try {
    initial = JSON.parse(input.value || '{}') || initial;
  } catch (e) {
    /* ignore */
  }

  mountApp(root, initial);
});
