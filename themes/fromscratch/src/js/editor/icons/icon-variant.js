import { findIconByValue, hasVariant } from './icon-catalog';

const VARIANT_STORAGE_KEY = 'fromscratchIconVariant';

export const readStoredVariant = () => {
  try {
    return window.localStorage.getItem(VARIANT_STORAGE_KEY) === 'fill' ? 'fill' : 'outline';
  } catch {
    return 'outline';
  }
};

export const writeStoredVariant = (variant) => {
  try {
    window.localStorage.setItem(VARIANT_STORAGE_KEY, variant);
  } catch {
    // Storage may be unavailable (private mode / disabled) — ignore.
  }
};

/**
 * Resolve the outline/filled toggle when opening the icon picker.
 *
 * - fill when the stored value is a fill variant (e.g. heart-fill)
 * - outline when the icon supports fill but the stored value is outline (e.g. heart)
 * - stored preference when the icon has no fill alternative (e.g. bolt)
 *
 * @param {string} value Selected icon file name, or '' when none.
 * @returns {'outline'|'fill'}
 */
export const resolvePickerVariant = (value) => {
  const stored = readStoredVariant();
  const selected = findIconByValue(value);

  if (!selected) {
    return stored;
  }

  if (selected.variant !== 'outline') {
    return selected.variant;
  }

  if (hasVariant(selected.icon, 'fill')) {
    return 'outline';
  }

  return stored;
};
