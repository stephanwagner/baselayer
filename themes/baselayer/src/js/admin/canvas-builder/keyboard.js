/**
 * Keyboard shortcuts for undo / redo (and optional delete).
 *
 * @param {object} options
 * @param {() => boolean} [options.undo]
 * @param {() => boolean} [options.redo]
 * @param {() => void} [options.removeSelected]
 * @param {() => boolean} [options.isEnabled]
 */
export function bindKeyboard(options = {}) {
  const handler = (event) => {
    if (typeof options.isEnabled === 'function' && !options.isEnabled()) {
      return;
    }
    const target = event.target;
    if (
      target &&
      (target.closest?.('input, textarea, select, [contenteditable="true"]') ||
        target.isContentEditable)
    ) {
      // Allow undo in fields to be native; only intercept when meta/ctrl without typing conflicts
      // Skip delete-selected while typing.
      if (event.key === 'Backspace' || event.key === 'Delete') {
        return;
      }
    }

    const mod = event.metaKey || event.ctrlKey;
    if (mod && String(event.key).toLowerCase() === 'z') {
      event.preventDefault();
      if (event.shiftKey) {
        options.redo?.();
      } else {
        options.undo?.();
      }
      return;
    }
    if (mod && String(event.key).toLowerCase() === 'y') {
      event.preventDefault();
      options.redo?.();
    }
  };

  document.addEventListener('keydown', handler);
  return () => document.removeEventListener('keydown', handler);
}
