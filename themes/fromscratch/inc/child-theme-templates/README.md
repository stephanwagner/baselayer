# {{name}}

Child theme of **FromScratch**. Parent updates leave this folder alone.

## Develop

1. Edit `src/scss/main.scss` and `src/js/main.js`.
2. From this theme folder:

```bash
npm install
npm run build    # one-shot: expanded + minified
npm run watch    # rebuild on change (development outputs)
```

Built files land in `assets/css/main.css` and `assets/js/main.js` and load after the parent theme assets.

## Config / templates

- Optional overrides: `config/theme-design.php`, `config/theme.php`, …
- Optional templates: `templates/…` (same paths as the parent)
