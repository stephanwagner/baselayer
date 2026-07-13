<?php

defined('ABSPATH') || exit;

/**
 * Load the translations for the theme.
 * Must run on init or later (WordPress 6.7+); do not call __() with domain 'baselayer' before init.
 */
add_action('init', function () {
	load_theme_textdomain('baselayer');

	if (!is_textdomain_loaded('baselayer')) {
		$mofile = get_template_directory() . '/languages/baselayer-' . determine_locale() . '.mo';
		if (file_exists($mofile)) {
			load_textdomain('baselayer', $mofile);
		}
	}
}, 1);
