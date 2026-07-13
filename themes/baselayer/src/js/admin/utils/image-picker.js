/**
 * Image picker: binds "Select image" / "Remove" to the WordPress media modal.
 * Detected by structure: container [data-bl-image-picker] with
 * [data-bl-image-picker-input], [data-bl-image-picker-preview],
 * [data-bl-image-picker-select], [data-bl-image-picker-remove].
 * Requires wp.media (e.g. wp_enqueue_media() on the page).
 *
 * @param {HTMLElement | Document} [root=document] - Root to query within.
 */
function initImagePicker(root = document) {
  const scope = root && root !== document ? root : document;
  const containers = scope.querySelectorAll('[data-bl-image-picker]');

  containers.forEach((container) => {
    if (container.hasAttribute('data-bl-image-picker-inited')) {
      return;
    }

    const inputEl = container.querySelector('[data-bl-image-picker-input]');
    const previewEl = container.querySelector('[data-bl-image-picker-preview]');
    const selectEl = container.querySelector('[data-bl-image-picker-select]');
    const removeEl = container.querySelector('[data-bl-image-picker-remove]');

    if (!inputEl || !previewEl || !selectEl) {
      return;
    }

    container.setAttribute('data-bl-image-picker-inited', '1');

    let frame = null;

    function openFrame() {
      if (typeof wp === 'undefined' || !wp.media) {
        return;
      }
      if (frame) {
        frame.open();
        return;
      }
      frame = wp.media({
        library: { type: 'image' },
        multiple: false,
      });
      frame.on('select', () => {
        const attachment = frame.state().get('selection').first().toJSON();
        const url = attachment.sizes?.medium?.url ?? attachment.url ?? '';
        inputEl.value = String(attachment.id);
        previewEl.innerHTML = '';
        const img = document.createElement('img');
        img.src = url;
        img.alt = '';
        img.style.maxWidth = '240px';
        img.style.height = 'auto';
        img.style.display = 'block';
        previewEl.appendChild(img);
        if (removeEl) {
          removeEl.style.display = '';
        }
      });
      frame.open();
    }

    function clear() {
      inputEl.value = '0';
      previewEl.innerHTML = '';
      if (removeEl) {
        removeEl.style.display = 'none';
      }
    }

    selectEl.addEventListener('click', (e) => {
      e.preventDefault();
      openFrame();
    });

    if (removeEl) {
      removeEl.addEventListener('click', (e) => {
        e.preventDefault();
        clear();
      });
    }
  });
}

window.baselayerInitImagePicker = initImagePicker;

document.addEventListener('DOMContentLoaded', () => {
  initImagePicker();
});
