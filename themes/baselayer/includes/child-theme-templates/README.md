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

- **Blocks:** on by default (Developer → Features). Custom block PHP/SCSS/JS live under `blocks/` in this theme. Import the Accordion starter via **Blocks → Import / Export** (`packages/baselayer-blocks/import/accordion.json` in the parent).
- **Forms:** Developer → Features → Enable forms
- **Events:** Developer → Features → Enable events, then configure each type under its menu → Settings (developers only; stored in `bl_events_instances` — not `config/content-types/`)

Optional Events markup overrides (child wins via the same template paths as the parent):

- `templates/event-date.php`
- `templates/event-status.php`
- `templates/event-meta.php`

## Config / templates

- Config stubs in `config/` (`theme.php`, `design.php`, `block-settings.php`, …) merge over the parent — see `config/README.md`
- **Content types:** `config/content-types/` is copied from the parent on install (file-based CPTs such as `post` and `project`). With a child active, **only** those files are loaded (no parent fallback). An empty or missing folder means no file-based CPTs. Events are **not** defined here.
- **`config/block-options.php`:** presets and assignments for editor sidebar options (merged over parent).
- Optional templates: `templates/…` (same paths as the parent; child wins)

## Optional ACF drop-in

ACF is not shipped in the theme. To use ACF Pro blocks:

1. Install/activate **ACF Pro**
2. Copy the repo-root `acf/` folder into this child (or the parent) as `acf/`
3. Uncomment the ACF `@forward` / `import` lines in `src/scss/main.scss`, `src/scss/admin.scss`, and `src/js/main.js`
4. `npm run build`
5. Optionally import field groups from `acf/acf-import-en.json` / `acf-import-de.json`

See `acf/README.md` in the BaseLayer repository for details.
