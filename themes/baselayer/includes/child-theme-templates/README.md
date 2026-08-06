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

## Packages (Forms, Events, Blocks)

Do **not** copy `packages/` into the child. Forms, Events, and Blocks always load from the parent theme (or as standalone plugins). Parent updates replace package code; site config stays in the database.

- **Blocks:** choose **BaseLayer Blocks**, **ACF Pro**, or **None** at install (or under Developer → Features). BaseLayer block PHP/SCSS/JS live under `blocks/` in this theme. Catalog JSON lives at `blocks/import-blocks-{en,de}.json` (parent or this child; picked by site language). Move definitions between sites via **Blocks → Settings → Import / Export** (match by type + slug; no duplicates).
- **Forms:** Developer → Features → Enable forms
- **Events:** Developer → Features → Enable events, then configure each type under its menu → Settings (developers only; stored in `bl_events_instances` — not `config/content-types/`)

Optional Events markup overrides (child wins via the same template paths as the parent):

- `templates/event-date.php`
- `templates/event-status.php`
- `templates/event-meta.php`

## Config / templates

- Config stubs in `config/` (`theme.php`, `design.php`, `block-settings.php`, …) merge over the parent — see `config/README.md`
- **Content types:** `config/content-types/` is copied from the parent on install (file-based CPTs such as `post` and `project`). With a child active, **only** those files are loaded (no parent fallback). An empty or missing folder means no file-based CPTs. Events are **not** defined here.
- **Block Options:** edit in admin (DB store). Package seed fills an empty store once at install/bootstrap — not a theme config file.
- Optional templates: `templates/…` (same paths as the parent; child wins)

## ACF Pro

ACF Pro ships in the **parent** theme (`baselayer/acf/`) and is enabled via **Developer → Features → Blocks → ACF Pro** (or the install radio).

Parent builds exclusive block assets and enqueues only the active system:

- BaseLayer → `blocks-baselayer.js` / `.css` (+ editor CSS in admin)
- ACF Pro → `blocks-acf.js` / `.css` (+ editor CSS in admin)
- None → no block system assets

Child `main` / `admin` bundles forward parent core styles only; they should **not** re-forward parent ACF/BaseLayer block trees (parent already loads the chosen system separately). Keep child-only block overrides under this theme’s `blocks/`.

Only if you fork ACF into this child as `acf/` and need local asset overrides:

1. Keep ACF Pro selected under Features
2. Add child SCSS/JS entrypoints or imports for your forked `acf/blocks` and rebuild
3. Optionally import field groups from the parent’s `acf/import-blocks-acf-*.json` via **ACF → Tools**

See `acf/README.md` in the parent theme for details.
