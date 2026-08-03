# BaseLayer ACF Pro integration

Ships inside the parent theme as `themes/baselayer/acf/`. Enabled when **Custom blocks → ACF Pro** is selected at install (or under **Developer → Features**).

## Requirements

1. **ACF Pro** plugin installed and activated.
2. Feature flag `enable_acf` on (install choice or Developer → Features). BaseLayer Custom Blocks (`enable_blocks`) stays off while ACF Pro is selected — the two systems are exclusive.

## Assets

Parent theme SCSS/JS already include ACF block styles and scripts:

- `src/scss/main.scss` → `@forward '../../acf/blocks/blocks' as acf-*;`
- `src/scss/admin.scss` → blocks + blocks-editor (namespaced)
- `src/js/main/main.js` → `import '../../../acf/blocks/blocks.js'`

Child themes that `@forward` parent `main` / `admin` inherit these assets. No uncommenting or copying is required for the default path.

If you fork ACF into a **child** theme as `acf/`, PHP loads the child’s `acf/acf.php` first. You only need child SCSS/JS imports when you override ACF assets in the child.

## Field groups

Bundled exports: `acf-import-en.json` / `acf-import-de.json`.

When ACF Pro is enabled and the site has **no field groups**, developers see an admin notice (**Import field groups** / **Skip**). Choosing **ACF Pro** at install also soft-tries this import once Pro is active.

You can still import manually via **ACF → Tools**.

## Contents

- `acf.php` — bootstrap, block registration, helpers (`BL_ACF_PATH`)
- `acf-import-notice.php` — admin notice + import/skip handlers
- `blocks.php` — block catalog
- `block-filters.php` — editor filters
- `blocks/` — PHP templates, SCSS, JS per block
- `assets/js/` — editor helpers (inner-blocks toolbar)
- `acf-import-*.json` — field-group exports

## Install automation

When **ACF Pro** is selected during theme install, BaseLayer can:

- Write `ACF_PRO_LICENSE` to `wp-config.php` (optional key field)
- Activate the ACF Pro plugin when it is present
- Soft-import bundled field groups when Pro is active and none exist yet
- Show success/warning notices on the install result screen
- Fall back to the admin import notice if Pro was missing at install time
