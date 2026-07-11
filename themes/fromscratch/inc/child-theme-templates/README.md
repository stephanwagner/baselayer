# {{name}}

Child theme of **FromScratch**. Parent updates leave this folder alone.

## Develop

1. Edit `src/scss/main.scss` and `src/js/main.js`.
2. From this theme folder:

```bash
npm install
npm run build    # icons + JS + CSS
npm run watch    # rebuild on change
```

Built files land in `assets/css/main.css`, `assets/js/main.js`, `assets/css/icons.css`, and `assets/icons.generated.json`.

## Icons

Drop SVGs into `assets/icons/` (optional `name-fill.svg` for a filled variant). Optional labels/keywords in `config/icons.js`. Then `npm run build` (or `npm run build:icons`).

Use as:

```html
<div class="fs-icon -icon-theme-logo-child"></div>
```

They also appear under **Theme** in the icon picker. An example `logo-child.svg` is included.

## Config / templates

- Config stubs in `config/` (`theme.php`, `design.php`, `block-settings.php`, …) merge over the parent — see `config/README.md`
- ACF blocks: `acf/blocks.php` merges over the parent by block `name` (commented example inside). Override markup with `acf/blocks/{name}/{name}.php` (child wins via `get_theme_file_path`)
- Optional templates: `templates/…` (same paths as the parent)
