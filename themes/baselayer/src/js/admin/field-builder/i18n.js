/**
 * Field-builder UI strings from window.blFieldBuilderI18n (PHP localize).
 *
 * @param {string} key
 * @param {string} fallback
 * @returns {string}
 */
export function t(key, fallback) {
  const bag =
    typeof window !== 'undefined' && window.blFieldBuilderI18n && typeof window.blFieldBuilderI18n === 'object'
      ? window.blFieldBuilderI18n
      : {};
  const value = bag[key];
  return typeof value === 'string' && value !== '' ? value : fallback;
}

/**
 * Localized field-type label, or fallback.
 *
 * @param {string} typeId
 * @param {string} fallback
 * @returns {string}
 */
export function typeLabel(typeId, fallback) {
  const bag =
    typeof window !== 'undefined' && window.blFieldBuilderI18n && typeof window.blFieldBuilderI18n === 'object'
      ? window.blFieldBuilderI18n
      : {};
  const types = bag.types && typeof bag.types === 'object' ? bag.types : {};
  const value = types[typeId];
  return typeof value === 'string' && value !== '' ? value : fallback;
}
