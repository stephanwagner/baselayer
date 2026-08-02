/**
 * Render registered block icons outside the editor canvas.
 *
 * Core block icons are not available as strings in PHP — they live on the
 * client after wp.blockLibrary.registerCoreBlocks(). Prefer server SVG /
 * dashicon strings when present; otherwise use getBlockType + BlockIcon
 * (same approach as Theme → Blocks).
 */

function fallbackDashicon() {
  const span = document.createElement('span');
  span.className = 'dashicons dashicons-block-default';
  return span;
}

function appendStringIcon(host, icon) {
  if (typeof icon !== 'string' || icon.trim() === '') {
    return false;
  }
  if (icon.trim().startsWith('<svg')) {
    host.innerHTML = icon;
    return true;
  }
  const slug = icon.startsWith('dashicons-') ? icon : `dashicons-${icon}`;
  const span = document.createElement('span');
  span.className = `dashicons ${slug}`;
  host.appendChild(span);
  return true;
}

function mountReactIcon(host, icon) {
  const BlockIcon = window.wp?.blockEditor?.BlockIcon;
  const createElement = window.wp?.element?.createElement;
  if (!BlockIcon || !createElement || !icon) {
    host.appendChild(fallbackDashicon());
    return;
  }

  const reactEl = createElement(BlockIcon, { icon, showColors: false });
  if (typeof window.wp.element.createRoot === 'function') {
    window.wp.element.createRoot(host).render(reactEl);
    return;
  }
  if (typeof window.wp.element.render === 'function') {
    window.wp.element.render(reactEl, host);
    return;
  }
  host.appendChild(fallbackDashicon());
}

/**
 * Resolve icon for a block name and paint into host (empties host first).
 *
 * @param {HTMLElement} host
 * @param {string} blockName
 * @param {string|null} [serverIcon]
 */
export function paintBlockTypeIcon(host, blockName, serverIcon = null) {
  host.replaceChildren();

  if (typeof serverIcon === 'string' && serverIcon.trim().startsWith('<svg')) {
    appendStringIcon(host, serverIcon);
    return;
  }

  const clientIcon = window.wp?.blocks?.getBlockType?.(blockName)?.icon;
  if (clientIcon) {
    if (typeof clientIcon === 'string') {
      if (!appendStringIcon(host, clientIcon)) {
        host.appendChild(fallbackDashicon());
      }
      return;
    }
    // Object / element / component — BlockIcon knows how to render it.
    const mount = document.createElement('span');
    mount.className = 'bl-block-type-icon__react';
    host.appendChild(mount);
    mountReactIcon(mount, clientIcon);
    return;
  }

  if (appendStringIcon(host, serverIcon)) {
    return;
  }

  host.appendChild(fallbackDashicon());
}

/**
 * @param {string} blockName
 * @param {string|null} [serverIcon]
 * @param {string} [className]
 * @returns {HTMLElement}
 */
export function createBlockTypeIconEl(
  blockName,
  serverIcon = null,
  className = 'bl-bo-block-icon'
) {
  const wrap = document.createElement('span');
  wrap.className = className;
  wrap.setAttribute('aria-hidden', 'true');
  paintBlockTypeIcon(wrap, blockName, serverIcon);
  return wrap;
}

/**
 * Run callback once core block types (with icons) are registered.
 *
 * @param {() => void} callback
 */
export function whenBlockTypesReady(callback) {
  let done = false;
  const ready = () => {
    const type = window.wp?.blocks?.getBlockType?.('core/paragraph');
    return !!(type && type.icon);
  };

  const run = () => {
    if (done) {
      return;
    }
    done = true;
    callback();
  };

  if (ready()) {
    run();
    return;
  }

  const start = () => {
    if (ready()) {
      run();
      return;
    }
    if (!window.wp?.data?.subscribe) {
      run();
      return;
    }
    const unsub = window.wp.data.subscribe(() => {
      if (ready()) {
        unsub();
        run();
      }
    });
    // Don't hang forever if block library failed to load.
    window.setTimeout(() => {
      try {
        unsub();
      } catch (e) {
        // ignore
      }
      run();
    }, 4000);
  };

  if (window.wp?.domReady) {
    window.wp.domReady(start);
  } else if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
}
