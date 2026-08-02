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

File-based CPTs only (e.g. `post.php`, `project.php`). **Events** are not content-types files: they are toggled under Developer → Features and configured in admin (each event type’s menu → Settings). Do not put `packages/` in the child; Forms/Events/Blocks load from the parent.

## Blocks

BaseLayer Blocks definitions live in the database (Blocks admin). Theme templates and assets go under `blocks/{slug}/`. Optional ACF support is a separate drop-in — copy repo `acf/` into the theme and see that package’s README.
