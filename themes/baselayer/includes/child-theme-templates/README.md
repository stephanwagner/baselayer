# {{name}}

Child theme of **BaseLayer**.

## First run

From this theme folder:

```bash
npm install
npm run build    # icons + JS + CSS
npm run watch    # rebuild on change
```

Built files land in `assets/css/main.css`, `assets/css/admin.css`, `assets/js/main.js`, `assets/css/icons.css`, and `assets/icons.generated.json`.

The child CSS bundles contain the complete configured parent styles plus child styles. `main.css` replaces the parent frontend bundle; `admin.css` replaces the parent admin/editor bundle. If a child bundle is missing, BaseLayer falls back to its standalone parent bundle.

## Sass and CSS variables

- Override parent Sass defaults in `src/scss/_config.scss`. It includes color and breakpoint examples; all available values are listed in the parent `src/scss/_config.scss`.
- Add child-only CSS custom properties in `src/scss/_root.scss`.
- `npm run build:css` compiles the complete parent frontend and admin styles with the child config. Sass-only values, including media-query breakpoints, are therefore overridden too.
- After updating or replacing BaseLayer, run the child build again so both CSS bundles contain the new parent styles. BaseLayer keeps `src/scss/_config.scss`, `src/scss/main.scss`, and `src/scss/admin.scss` as stable child-theme entrypoints.

## Icons

Drop SVGs into `assets/icons/`. Optional labels/keywords in `config/icons.js`. Then `npm run build` (or `npm run build:icons`).

Use as:

```html
<div class="bl-icon -icon-theme-logo-child"></div>
```

They also appear under **Theme** in the icon picker. An example `logo-child.svg` is included.

## Config / templates

- Config stubs in `config/` (`theme.php`, `design.php`, `block-settings.php`, …) merge over the parent — see `config/README.md`
- **Content types:** `config/content-types/` is copied from the parent on install. With a child active, **only** those files are loaded (no parent fallback). An empty or missing folder means no CPTs.
- **`config/block-options.php`:** presets and assignments for editor sidebar options (merged over parent). Optional Block Creator UI (Developer → Features) can add an overlay without editing files.
- Optional templates: `templates/…` (same paths as the parent; child wins)

## Add an ACF block

1. Register (or override) the block in `acf/blocks.php` (merged with parent by `name`)
2. Add `acf/blocks/{name}/{name}.php`
3. Add styles/scripts under `acf/blocks/{name}/`, then `@forward` / `import` them in `_blocks.scss`, `_blocks-editor.scss`, and `blocks.js`
4. Create the block’s fields in **ACF** (WP admin) — field groups are not synced from theme files
5. `npm run build`

See the commented `my-block` example under `acf/blocks/` for the file layout.
