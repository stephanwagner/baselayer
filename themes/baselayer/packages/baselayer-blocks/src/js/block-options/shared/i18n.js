/**
 * Inspector strings localized from PHP (baselayerBlockOptionsI18n).
 *
 * @param {string} key
 * @param {string} fallback English fallback when the dict is missing.
 */
export function t(key, fallback) {
  const dict = window.baselayerBlockOptionsI18n || {};
  return dict[key] || fallback;
}
