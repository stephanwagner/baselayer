/**
 * Toggle content blocks by scope. Checkbox has data-bl-checkbox-toggle="SCOPE",
 * content has data-bl-checkbox-toggle-content="SCOPE". All elements with matching scope are shown/hidden.
 *
 * @param {HTMLElement} [root=document] - Root to query within.
 */
function initCheckboxToggleContent(root = document) {
  const scope = root || document;
  const checkboxes = scope.querySelectorAll('input[type="checkbox"][data-bl-checkbox-toggle]');
  checkboxes.forEach((checkbox) => {
    const toggleScope = checkbox.getAttribute('data-bl-checkbox-toggle');
    if (!toggleScope) return;

    const allWithScope = scope.querySelectorAll('[data-bl-checkbox-toggle-content]');
    const contentElements = Array.from(allWithScope).filter(
      (el) => el.getAttribute('data-bl-checkbox-toggle-content') === toggleScope,
    );
    if (!contentElements.length) return;

    function update() {
      const show = checkbox.checked;
      contentElements.forEach((el) => {
        el.style.display = show ? '' : 'none';
      });
    }

    checkbox.addEventListener('change', update);
    update();
  });
}

// Expose for reuse (e.g. after dynamic content)
window.baselayerInitCheckboxToggleContent = initCheckboxToggleContent;

document.addEventListener('DOMContentLoaded', () => {
  initCheckboxToggleContent();
});
