# Block import starters

The theme catalog lives at:

`themes/baselayer/blocks/import-blocks.json`

Core block options (presets + `core/*` assignments):

`themes/baselayer/blocks/import-block-options-core.json`

Ship definitions in this catalog for theme bootstrap / programmatic import. In admin, move definitions between sites via **Blocks → Settings → Import / Export** (JSON download + upload). Definitions match by `type` + `settings.slug`; importing twice updates in place (no duplicates).
