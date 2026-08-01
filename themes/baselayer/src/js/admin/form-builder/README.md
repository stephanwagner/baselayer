# Form builder (theme kit)

Shared field cards, layout containers, and conditional-logic UI for Forms and Blocks.

Source: `themes/baselayer/src/js/admin/form-builder/`  
Built asset: `form-builder-admin`  
Enqueue: `bl_form_builder_enqueue_kit()` in `includes/form-builder.php`

Packages vendor a copy under `assets/vendor/form-builder/` for standalone plugin use.

Runtime global: `window.BlFormBuilder`  
Canvas / palette DnD remains `window.BlCanvasBuilder`.

## Package-specific field UI

Use `BlFormBuilder.configure({ fieldCard: { … } })` before mounting:

- `onInitField(field)` — defaults for new/loaded fields
- `onNormalizeType(field, nextType)` — strip/set keys on type change
- `extraSwitches(field)` — return `Node[]` appended to Active / status switches
- `onSerialize(data, { type, q, body, row })` — package keys when serializing

Forms registers entry-list “Show in overview” this way; Blocks leaves hooks unset.
