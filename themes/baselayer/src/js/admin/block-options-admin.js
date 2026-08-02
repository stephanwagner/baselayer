/**
 * Blocks → Block Options — tab shell (lists / creator come later).
 */
function boot() {
  const root = document.getElementById('bl-block-options-app');
  if (!root) {
    return;
  }

  const cfg = window.blBlockOptionsAdmin || {};
  const i18n = cfg.i18n || {};
  const t = (key, fallback) => i18n[key] || fallback;

  const tabs = [];
  if (cfg.hasBaselayer) {
    tabs.push({ id: 'baselayer', label: t('tabBaselayer', 'BaseLayer blocks'), empty: t('emptyBaselayer', '') });
  }
  if (cfg.hasAcf) {
    tabs.push({ id: 'acf', label: t('tabAcf', 'ACF blocks'), empty: t('emptyAcf', '') });
  }
  tabs.push({ id: 'system', label: t('tabSystem', 'System blocks'), empty: t('emptySystem', '') });
  tabs.push({ id: 'presets', label: t('tabPresets', 'Presets'), empty: t('emptyPresets', '') });

  let active = tabs[0] ? tabs[0].id : 'system';

  function el(tag, attrs = {}, children = []) {
    const node = document.createElement(tag);
    Object.entries(attrs || {}).forEach(([key, value]) => {
      if (value == null || value === false) {
        return;
      }
      if (key === 'className') {
        node.className = value;
      } else if (key === 'text') {
        node.textContent = value;
      } else if (key.startsWith('on') && typeof value === 'function') {
        node.addEventListener(key.slice(2).toLowerCase(), value);
      } else {
        node.setAttribute(key, value === true ? '' : String(value));
      }
    });
    (Array.isArray(children) ? children : [children]).forEach((child) => {
      if (child == null || child === false) {
        return;
      }
      node.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
    });
    return node;
  }

  function render() {
    root.replaceChildren();
    root.appendChild(el('p', { className: 'bl-bo-intro', text: t('intro', '') }));

    const tabBar = el('nav', { className: 'bl-forms-builder__tabs', role: 'tablist' });
    tabs.forEach((tab) => {
      tabBar.appendChild(
        el('button', {
          type: 'button',
          role: 'tab',
          className: 'bl-forms-builder__tab' + (tab.id === active ? ' is-active' : ''),
          text: tab.label,
          'aria-selected': tab.id === active ? 'true' : 'false',
          onClick: () => {
            active = tab.id;
            render();
          },
        })
      );
    });
    root.appendChild(tabBar);

    const current = tabs.find((tab) => tab.id === active) || tabs[0];
    root.appendChild(
      el('div', { className: 'bl-bo-panel', role: 'tabpanel' }, [
        el('p', { className: 'bl-bo-empty', text: (current && current.empty) || '' }),
      ])
    );
  }

  render();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
