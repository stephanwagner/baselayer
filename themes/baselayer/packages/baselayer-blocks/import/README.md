# Block import starters

The theme catalog lives at:

`themes/baselayer/blocks/blocks-import.json`

Ship definitions in this catalog for theme bootstrap / programmatic import. In admin, move definitions between sites via **Blocks → Settings → Import / Export** (JSON download + upload). Definitions match by `type` + `settings.slug`; importing twice updates in place (no duplicates).
