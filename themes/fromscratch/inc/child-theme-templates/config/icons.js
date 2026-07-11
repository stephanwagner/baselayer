/**
 * Icons configuration.
 *
 * Theme (project/customer) icons for the icon picker and `-icon-theme-*` classes.
 *
 * Parent defaults (parent theme icons):
 *   fromscratch/config/icons.js
 *
 * Drop SVGs into `assets/icons/`.
 * You may add a display label and English search keywords per file below; both are
 * optional and fall back to a humanized file name.
 *
 * Then run `npm run build` (or just `npm run build:icons`) to regenerate:
 *   - assets/css/icons.css
 *   - assets/icons.generated.json
 *
 * Theme icons show up at the TOP of the icon picker under their own category
 * and are usable anywhere via `-icon-theme-<name>` (e.g. `-icon-theme-logo-child`).
 * Run `npm run build` (or `npm run build:icons`) after adding or changing SVGs.
 *
 * NOTE: icons render as a single-color mask (they inherit `currentColor`), so
 * multi-color artwork will appear as a monochrome silhouette.
 */
export const themeIcons = {
  // Class / picker prefix (`-icon-theme-<name>`). Files live in assets/icons/.
  prefix: 'theme',

  // Category shown (at the top) in the icon picker.
  category: { slug: 'theme', label: 'Theme' },

  // Optional per-file metadata, keyed by the base file name (without .svg / -fill).
  meta: {
    'logo-child': { label: 'Logo Child Theme', keywords: ['brand', 'marke', 'signet', 'child'] }
  }
};
