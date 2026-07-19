<?php

defined('ABSPATH') || exit;

/**
 * Block options overrides (child theme).
 *
 * Merged on top of the parent config/block-options.php.
 * - presets: associative — child slugs deep-merge / replace parent presets
 * - assignments: list — replaced wholesale by bl_config_merge_deep; prefer UI
 *   assignments (Block Creator) to append without copying the parent list, OR
 *   special-case is handled in resolve by concatenating file + UI only.
 *   For file child overrides of assignments, copy parent assignments and edit.
 * - blocks: per-block extra controls (associative merge)
 *
 * Example — add a preset and assign it via Block Creator UI, or:
 *
 * return [
 *   'presets' => [
 *     'my-spacing' => [
 *       'label' => 'My spacing',
 *       'controls' => [
 *         bl_block_options_control_container_margin('m'),
 *       ],
 *     ],
 *   ],
 * ];
 *
 * @return array<string, mixed>
 */
return [];
