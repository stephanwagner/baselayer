/**
 * Toggle a size-stable loading state on a theme `.button`.
 * Pair with CSS modifier `.-is-loading` (label stays in layout; spinner overlays).
 *
 * @param {HTMLButtonElement|HTMLInputElement|null|undefined} button
 * @param {boolean} [loading=true]
 */
export function setButtonLoading(button, loading = true) {
  if (!button) return;

  button.classList.toggle('-is-loading', loading);
  button.disabled = loading;

  if (loading) {
    button.setAttribute('aria-busy', 'true');
  } else {
    button.removeAttribute('aria-busy');
  }
}
