# Config overrides

PHP files in this folder are merged on top of the parent theme `config/`
(child values win). Associative keys deep-merge; list values replace wholesale.

Shipped stubs (edit as needed):

- `theme.php` — theme options
- `design.php` — colors, typography, gradients, layout
- `block-settings.php` — Theme → Blocks defaults
- `block-options.js` — placeholder only (editor options stay parent-bundled)
- `icons.js` — child theme icons build metadata
