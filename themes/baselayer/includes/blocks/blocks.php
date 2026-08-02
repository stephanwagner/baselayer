<?php

defined('ABSPATH') || exit;

/**
 * BaseLayer block options.
 *
 * Admin: Blocks → Block Options (store: bl_block_options).
 * Theme seed: config/block-options-import.json (imported on install / admin).
 */

require_once __DIR__ . '/store.php';
require_once __DIR__ . '/admin.php';
require_once __DIR__ . '/import.php';
require_once __DIR__ . '/controls.php';
require_once __DIR__ . '/resolve.php';
require_once __DIR__ . '/localize.php';
