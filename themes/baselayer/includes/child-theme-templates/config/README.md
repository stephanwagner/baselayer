# Config overrides

PHP files in this folder are merged on top of the parent theme `config/`
(child values win). Associative keys deep-merge; list values replace wholesale.

Shipped stubs (edit as needed):

- `theme.php` — theme options
- `design.php` — colors, typography, gradients, layout
- `block-settings.php` — Theme → Blocks defaults
- `block-options.php` — optional overrides (runtime seed is package `seed/block-options-import.json`; theme may ship `config/block-options/import.json`)
- `icons.js` — child theme icons build metadata

## Content types

`content-types/` is copied from the parent on install (`baselayer/config/content-types/`).
When a child theme is active, only these files are loaded — there is no parent fallback.

File-based CPTs only (e.g. `post.php`, `project.php`). **Events** are not content-types files: they are toggled under Developer → Features and configured in admin (each event type’s menu → Settings). Do not put `packages/` in the child; Forms/Events/Blocks load from the parent.

## Blocks

BaseLayer Blocks definitions live in the database (Blocks admin). Theme templates and assets go under `blocks/{slug}/`. ACF Pro ships in the parent theme (`acf/`) and is enabled via Developer → Features (exclusive with BaseLayer Blocks).
