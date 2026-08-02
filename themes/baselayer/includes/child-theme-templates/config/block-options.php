<?php

defined('ABSPATH') || exit;

/**
 * Block options overrides (child theme).
 *
 * Merged on top of the parent config/block-options.php.
 * - presets: associative — child slugs deep-merge / replace parent presets
 * - assignments: list — replaced wholesale by bl_config_merge_deep; for
 *   file child overrides, copy parent assignments and edit.
 * - blocks: per-block extra controls (associative merge)
 *
 * Example — add a preset:
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
