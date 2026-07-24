import { el, t, writeConfig } from './dom.js';
import { createPalette } from './palette.js';
import { createCanvas } from './canvas.js';
import { createPanels } from './panels.js';

/**
 * Mount the tabbed form builder.
 *
 * @param {HTMLElement} root
 * @param {{ fields?: array, settings?: object }} initial
 */
export function mountApp(root, initial) {
  root.replaceChildren();
  root.classList.add('bl-forms-builder', 'bl-forms-builder--tabs');

  let settingsState = { ...(initial.settings || {}) };

  const syncAll = () => {
    const fields = canvas.getFields();
    panels.syncFields(fields);
    writeConfig({
      fields,
      settings: panels.getSettings(),
    });
    canvas.syncEmpty();
  };

  const canvas = createCanvas({
    fields: initial.fields || [],
    onChange: syncAll,
  });

  const palette = createPalette((type) => {
    canvas.addField(type, true);
  });

  const panels = createPanels(settingsState, root, (next) => {
    settingsState = next;
    syncAll();
  });

  const fieldsPanel = el('div', {
    className: 'bl-forms-builder__panel is-active',
    dataset: { blFormsPanel: 'fields' },
  });
  const fieldsLayout = el('div', { className: 'bl-forms-builder__fields-layout' }, [
    palette,
    canvas.root,
  ]);
  fieldsPanel.appendChild(fieldsLayout);

  const tabBar = el('nav', { className: 'bl-forms-builder__tabs', role: 'tablist' });
  const tabs = [
    { id: 'fields', label: t('tabFields', 'Fields › Form'), panel: fieldsPanel },
    { id: 'notifications', label: t('tabNotifications', 'Notifications'), panel: panels.notifications },
    { id: 'settings', label: t('tabSettings', 'Settings'), panel: panels.settings },
    { id: 'validation', label: t('tabValidation', 'Validation'), panel: panels.validation },
    { id: 'security', label: t('tabSecurity', 'Security'), panel: panels.security },
  ];

  const activate = (id) => {
    tabs.forEach((tab) => {
      const active = tab.id === id;
      tab.button.classList.toggle('is-active', active);
      tab.button.setAttribute('aria-selected', active ? 'true' : 'false');
      tab.panel.hidden = !active;
      tab.panel.classList.toggle('is-active', active);
    });
  };

  tabs.forEach((tab, index) => {
    tab.button = el('button', {
      type: 'button',
      className: 'bl-forms-builder__tab' + (index === 0 ? ' is-active' : ''),
      role: 'tab',
      text: tab.label,
      dataset: { blFormsTab: tab.id },
      onClick: () => activate(tab.id),
    });
    tab.button.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
    tabBar.appendChild(tab.button);
  });

  const panelsWrap = el('div', { className: 'bl-forms-builder__panels' }, [
    fieldsPanel,
    panels.notifications,
    panels.settings,
    panels.validation,
    panels.security,
  ]);

  root.append(tabBar, panelsWrap);

  const form = root.closest('form');
  if (form) {
    form.addEventListener('submit', syncAll);
  }
  root.addEventListener('input', syncAll);
  root.addEventListener('change', syncAll);
  document.addEventListener('bl-forms-builder-changed', syncAll);

  syncAll();
}
