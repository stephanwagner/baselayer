# Block import starters

The theme catalog lives at (locale-selected at install/import):

- `themes/baselayer/blocks/import-blocks-en.json`
- `themes/baselayer/blocks/import-blocks-de.json`

Site language (`WPLANG`) picks `import-blocks-{lang}.json`, then falls back to `-en`. Same pattern as ACF’s `import-blocks-acf-*.json`.

Core block options (presets + `core/*` assignments):

`themes/baselayer/blocks/import-block-options-core.json`

Ship definitions in this catalog for theme bootstrap / programmatic import. In admin, move definitions between sites via **Blocks → Settings → Import / Export** (JSON download + upload). Definitions match by `type` + `settings.slug`; importing twice updates in place (no duplicates).

Export types:

- **All** — envelope `{ definitions, block_options }` (full store: presets + core + Baselayer + ACF)
- **Blocks / Content Fields / Website Fields** — definition list (blocks include embedded `block_options`)
- **Block options** — store only (`{ version, presets, blocks }`)

Import accepts the envelope, a definition list, or a store-only JSON.
