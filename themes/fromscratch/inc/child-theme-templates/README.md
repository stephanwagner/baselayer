# {{name}}

Child theme of **FromScratch**.

## First run

From this theme folder:

```bash
npm install
npm run build    # icons + JS + CSS
npm run watch    # rebuild on change
```

Built files land in `assets/css/main.css`, `assets/js/main.js`, `assets/css/icons.css`, and `assets/icons.generated.json`.

Edit `src/scss/main.scss` and `src/js/main.js`. After build, child CSS/JS load on the front **and** in the block editor.

## Icons

Drop SVGs into `assets/icons/`. Optional labels/keywords in `config/icons.js`. Then `npm run build` (or `npm run build:icons`).

Use as:

```html
<div class="fs-icon -icon-theme-logo-child"></div>
```

They also appear under **Theme** in the icon picker. An example `logo-child.svg` is included.

## Config / templates

- Config stubs in `config/` (`theme.php`, `design.php`, `block-settings.php`, …) merge over the parent — see `config/README.md`
- **Content types:** `config/content-types/` is copied from the parent on install. With a child active, **only** those files are loaded (no parent fallback). An empty or missing folder means no CPTs.
- **`config/block-options.js`:** placeholder only — editor block options stay parent-bundled
- Optional templates: `templates/…` (same paths as the parent; child wins)

## Add an ACF block

1. Register (or override) the block in `acf/blocks.php` (merged with parent by `name`)
2. Add `acf/blocks/{name}/{name}.php`
3. Add styles/scripts under `acf/blocks/{name}/`, then `@forward` / `import` them in `_blocks.scss`, `_blocks-editor.scss`, and `blocks.js`
4. Create the block’s fields in **ACF** (WP admin) — field groups are not synced from theme files
5. `npm run build`

See the commented `my-block` example under `acf/blocks/` for the file layout.
