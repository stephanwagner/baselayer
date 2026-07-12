<?php

defined('ABSPATH') || exit;

/**
 * FromScratch Block Creator — block options engine + optional admin UI.
 *
 * File baseline: config/block-options.php
 * UI overlay (feature-flagged): option fs_block_creator_block_options
 */

require_once __DIR__ . '/controls.php';
require_once __DIR__ . '/resolve.php';
require_once __DIR__ . '/localize.php';
require_once __DIR__ . '/custom-blocks.php';

if (is_admin()) {
	require_once __DIR__ . '/admin.php';
}
