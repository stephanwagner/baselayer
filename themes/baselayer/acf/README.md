# BaseLayer ACF Pro integration

Ships inside the parent theme as `themes/baselayer/acf/`. Enabled when **Blocks → ACF Pro** is selected at install (or under **Developer → Features**).

## Requirements

1. **ACF Pro** plugin installed and activated.
2. Feature flag `enable_acf` on (install choice or Developer → Features). BaseLayer Blocks (`enable_blocks`) stays off while ACF Pro is selected — the two systems are exclusive.

## Assets

Parent builds exclusive block bundles and enqueues them only when `bl_theme_blocks_system()` is `acf`:

- Front: `assets/js/blocks-acf.js`, `assets/css/blocks-acf.css`
- Admin / editor canvas: `assets/css/blocks-acf-editor.css`

Source entries: `src/js/blocks/blocks-acf.js`, `src/scss/blocks-acf.scss`, `src/scss/blocks-acf-editor.scss`.

BaseLayer Blocks uses the parallel `blocks-baselayer*` assets. Neither system is imported into `main` / `admin` core bundles.

If you fork ACF into a **child** theme as `acf/`, PHP loads the child’s `acf/acf.php` first. Add child SCSS/JS only when you override ACF assets in the child.

## Field groups

Bundled exports: `import-blocks-acf-en.json` / `import-blocks-acf-de.json`.

When ACF Pro is enabled and the site has **no field groups**, developers see an admin notice (**Import field groups** / **Skip**). Choosing **ACF Pro** at install also soft-tries this import once Pro is active.

You can still import manually via **ACF → Tools**.

## Contents

- `acf.php` — thin entry (`BL_ACF_PATH`); loads `includes/`
- `includes/` — bootstrap, block filters, field-group import notice
- `blocks.php` — block catalog
- `blocks/` — PHP templates, SCSS, JS per block
- `import-blocks-acf-*.json` — field-group exports
- `import-block-options-acf.json` — ACF block option assignments

## Install automation

When **ACF Pro** is selected during theme install, BaseLayer can:

- Write `ACF_PRO_LICENSE` to `wp-config.php` (optional key field)
- Activate the ACF Pro plugin when it is present
- Soft-import bundled field groups when Pro is active and none exist yet
- Show success/warning notices on the install result screen
- Fall back to the admin import notice if Pro was missing at install time
