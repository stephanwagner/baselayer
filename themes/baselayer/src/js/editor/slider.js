function getSliderClientId(element) {
  const sliderBlock = element.closest(
    '.block-editor-block-list__block[data-type="acf/slider"]'
  );

  return sliderBlock?.dataset?.block || null;
}

// Select the slider when clicking the floating badge.
document.addEventListener(
  'mousedown',
  (event) => {
    const badge = event.target.closest('.slider__editor-badge');

    if (!badge) {
      return;
    }

    const clientId = getSliderClientId(badge);

    if (!clientId) {
      return;
    }

    wp.data.dispatch('core/block-editor').selectBlock(clientId);
  },
  true
);
