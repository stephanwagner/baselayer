# BaseLayer ACF drop-in

Optional Advanced Custom Fields Pro integration for BaseLayer themes.

## Install

1. Install and activate **ACF Pro**.
2. Copy this entire `acf/` folder into your **active theme or child theme** as `acf/` (so the theme has `acf/acf.php`).
3. Add asset imports to the theme that owns the build (usually the child):

**`src/scss/main.scss`**

```scss
@forward '../../acf/blocks/blocks';
```

**`src/scss/admin.scss`**

```scss
@forward '../../acf/blocks/blocks';
@forward '../../acf/blocks/blocks-editor';
```

**`src/js/main.js`** (or parent `src/js/main/main.js`)

```js
import '../../acf/blocks/blocks.js';
```

4. Run `npm run build` in that theme.
5. Optionally import field groups from `acf-import-en.json` / `acf-import-de.json` via **ACF → Tools**.

BaseLayer auto-loads `acf/acf.php` from the stylesheet directory first, then the parent template directory.

## Contents

- `acf.php` — bootstrap, block registration, helpers
- `blocks.php` — block catalog
- `block-filters.php` — editor filters
- `blocks/` — PHP templates, SCSS, JS per block
- `assets/js/` — editor helpers (inner-blocks toolbar)
- `acf-import-*.json` — optional field-group exports
