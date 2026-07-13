# Config overrides

PHP files in this folder are merged on top of the parent theme `config/`
(child values win). Associative keys deep-merge; list values replace wholesale.

Shipped stubs (edit as needed):

- `theme.php` — theme options
- `design.php` — colors, typography, gradients, layout
- `block-settings.php` — Theme → Blocks defaults
- `block-options.php` — presets + assignments for editor sidebar options (merges over parent)
- `icons.js` — child theme icons build metadata

## Content types

`content-types/` is copied from the parent on install (`baselayer/config/content-types/`).
When a child theme is active, only these files are loaded — there is no parent fallback.

## ACF blocks

Block registration lives under `acf/blocks.php`. See that stub for
merge-by-name rules and how to override render templates.
