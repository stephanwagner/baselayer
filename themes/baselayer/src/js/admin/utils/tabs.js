/**
 * Tabs: binds tab switching for [data-bl-tabs] containers.
 * Structure: [data-bl-tabs] > [data-bl-tabs-nav] > [data-bl-tabs-btn][data-tab],
 *            [data-bl-tabs] > [data-bl-tabs-panels] > [data-bl-tabs-panel][data-tab]
 * Button and panel are matched by data-tab value. Active state: .active on btn, data-bl-tabs-panel-active on panel.
 */
document.addEventListener('DOMContentLoaded', function () {
  const roots = document.querySelectorAll('[data-bl-tabs]');
  roots.forEach(function (root) {
    const nav = root.querySelector('[data-bl-tabs-nav]');
    const panels = root.querySelectorAll('[data-bl-tabs-panel]');
    if (!nav || !panels.length) return;

    nav.addEventListener('click', function (e) {
      const btn = e.target.closest('[data-bl-tabs-btn]');
      if (!btn) return;
      const tabId = btn.getAttribute('data-tab');
      if (!tabId) return;

      nav.querySelectorAll('[data-bl-tabs-btn]').forEach(function (b) {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      panels.forEach(function (p) {
        if (p.getAttribute('data-tab') === tabId) {
          p.setAttribute('data-bl-tabs-panel-active', '1');
          p.classList.add('bl-tabs-panel--active');
        } else {
          p.removeAttribute('data-bl-tabs-panel-active');
          p.classList.remove('bl-tabs-panel--active');
        }
      });
    });
  });
});
