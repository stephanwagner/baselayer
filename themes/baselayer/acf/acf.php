<?php

defined('ABSPATH') || exit;

/**
 * Absolute path to this ACF drop-in package (package root, not includes/).
 */
if (!defined('BL_ACF_PATH')) {
	define('BL_ACF_PATH', __DIR__ . '/');
}

require_once BL_ACF_PATH . 'includes/bootstrap.php';
require_once BL_ACF_PATH . 'includes/block-filters.php';
