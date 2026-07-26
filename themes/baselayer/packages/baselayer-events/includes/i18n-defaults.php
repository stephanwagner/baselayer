<?php

defined('ABSPATH') || exit;

/**
 * Default-instance labels for the translation catalog.
 *
 * Config strings are passed through __() at runtime; list them here so
 * `wp i18n make-pot` can extract them.
 *
 * @return list<string>
 */
function bl_events_i18n_default_strings(): array
{
	return [
		/* Statuses */
		__('Cancelled', 'baselayer-events'),
		__('Postponed', 'baselayer-events'),
		__('Sold Out', 'baselayer-events'),

		/* Metadata panel / groups / fields (config/default-instance.php) */
		__('Event metadata', 'baselayer-events'),
		__('Location', 'baselayer-events'),
		__('Venue name', 'baselayer-events'),
		__('Address', 'baselayer-events'),
		__('Organizer', 'baselayer-events'),
		__('Name', 'baselayer-events'),
		__('Email', 'baselayer-events'),
		__('Website', 'baselayer-events'),
		__('Contact', 'baselayer-events'),
		__('Phone', 'baselayer-events'),

		/* Default CPT labels */
		__('Events', 'baselayer-events'),
		__('Event', 'baselayer-events'),
	];
}
