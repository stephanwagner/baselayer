# BaseLayer

A modern WordPress foundation theme for developers who prefer full control.

## Author

Stephan Wagner \
Co-Founder & Lead Developer \
bytes and stripes GbR \
https://bytesandstripes.com

## Assets

Source files live in `themes/baselayer/src` (repo root has the npm project).

Local build output goes to `themes/baselayer/assets/css` and `assets/js` (gitignored).
Committed fallbacks live in `themes/baselayer/assets/release/` (minified). Enqueue prefers a local build, then release files.

### Watch (development)

```bash
npm run watch
```

### Build (local)

```bash
npm run build
```

### Release (commit-ready mins)

```bash
npm run release
```

Copies built `*.min.*` (and `icons.css`) into `assets/release/`.
