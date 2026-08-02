<?php

defined('ABSPATH') || exit;

if (defined('BL_BLOCK_OPTIONS_LOADED')) {
	return;
}
define('BL_BLOCK_OPTIONS_LOADED', true);

/**
 * BaseLayer block options (package-owned).
 *
 * Admin: Blocks → Block Options (store: bl_block_options).
 * Customs: customs/<name>/custom.php (auto-discovered).
 * Default seed: seed/block-options-import.json (theme may override).
 */

require_once __DIR__ . '/store.php';
require_once __DIR__ . '/controls.php';
require_once __DIR__ . '/customs.php';
require_once __DIR__ . '/resolve.php';
require_once __DIR__ . '/import.php';
require_once __DIR__ . '/localize.php';

// Eager-load customs so factory helpers (bl_block_options_control_*) exist.
bl_block_options_customs_registry();

if (is_admin()) {
	require_once __DIR__ . '/admin.php';
}
