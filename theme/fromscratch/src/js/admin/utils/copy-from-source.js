/**
 * Copy text from a source element to clipboard.
 * Trigger has data-fs-copy-from-source="ID" (id of the source element).
 * Optional data-fs-copy-feedback-text="Copied" (shown after copy; default "Copied").
 * Source can be pre, textarea, input, or any element (uses textContent or value).
 *
 * @param {HTMLElement} [root=document] - Root to query within.
 */
function copyTextToClipboard(text) {
  if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    return navigator.clipboard.writeText(text);
  }

  return new Promise((resolve, reject) => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.top = '-9999px';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    textarea.setSelectionRange(0, text.length);

    let copied = false;
    try {
      copied = document.execCommand('copy');
    } catch (error) {
      document.body.removeChild(textarea);
      reject(error);
      return;
    }

    document.body.removeChild(textarea);
    if (copied) {
      resolve();
      return;
    }
    reject(new Error('Copy command was not successful'));
  });
}

function initCopyFromSource(root = document) {
  const scope = root || document;
  const triggers = scope.querySelectorAll('[data-fs-copy-from-source]');
  triggers.forEach((trigger) => {
    const sourceId = trigger.getAttribute('data-fs-copy-from-source');
    if (!sourceId) return;

    const source = scope.querySelector(`#${CSS.escape(sourceId)}`);
    if (!source) return;

    const feedbackText = trigger.getAttribute('data-fs-copy-feedback-text');
    const defaultLabel = trigger.textContent.trim();

    trigger.addEventListener('click', () => {
      const text = source.value !== undefined ? source.value : source.textContent;
      if (text == null) return;

      copyTextToClipboard(text)
        .then(() => {
          if (feedbackText) {
            trigger.textContent = feedbackText;
            setTimeout(() => {
              trigger.textContent = defaultLabel;
            }, 2000);
          } else {
            trigger.classList.add('fs-copied');
            setTimeout(() => {
              trigger.classList.remove('fs-copied');
            }, 180);
          }
        })
        .catch(() => {
          // Clipboard unavailable or blocked — leave button state unchanged.
        });
    });
  });
}

// Expose for reuse (e.g. after dynamic content)
window.fromscratchInitCopyFromSource = initCopyFromSource;

document.addEventListener('DOMContentLoaded', () => {
  initCopyFromSource();
});
