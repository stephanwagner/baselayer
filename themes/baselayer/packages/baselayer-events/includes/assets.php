<?php

defined('ABSPATH') || exit;

/**
 * Enqueue frontend Events CSS.
 */
function bl_events_enqueue_front_assets(): void
{
	if (bl_events_get_instances(true) === []) {
		return;
	}
	bl_events_enqueue_style('bl-events', 'events');
}
add_action('wp_enqueue_scripts', 'bl_events_enqueue_front_assets', 20);

/**
 * Enqueue block editor script + CSS.
 */
function bl_events_enqueue_editor_assets(): void
{
	$post_types = bl_event_post_types();
	if ($post_types === []) {
		return;
	}

	bl_events_enqueue_style('bl-events-admin', 'events-admin');
	if (!bl_events_enqueue_script('bl-events-editor', 'events-editor', [
		'wp-plugins',
		'wp-edit-post',
		'wp-element',
		'wp-components',
		'wp-data',
		'wp-core-data',
		'wp-i18n',
		'wp-editor',
	])) {
		return;
	}

	$pt = $post_types[0];
	$lookahead = function_exists('bl_event_recurrence_lookahead_label')
		? bl_event_recurrence_lookahead_label($pt)
		: '1 year';
	$horizon = function_exists('bl_event_recurrence_horizon_date')
		? bl_event_recurrence_horizon_date($pt)
		: '';

	$meta_by_type = [];
	$statuses_by_type = [];
	$panel_titles = [];
	foreach ($post_types as $type) {
		$meta_by_type[$type] = function_exists('bl_cpt_event_meta_config')
			? bl_cpt_event_meta_config($type)
			: ['title' => '', 'groups' => []];
		$statuses_by_type[$type] = function_exists('bl_event_get_status_options')
			? bl_event_get_status_options($type)
			: [];
		$inst = bl_events_get_instance($type);
		$panel_titles[$type] = is_array($inst) && !empty($inst['labels']['singular_name'])
			? (string) $inst['labels']['singular_name']
			: $type;
	}

	wp_localize_script('bl-events-editor', 'baselayerEvents', [
		'postTypes' => $post_types,
		'postType' => $pt,
		'panelTitle' => $panel_titles[$pt] ?? __('Event', 'baselayer-events'),
		'panelTitles' => $panel_titles,
		'startDateLabel' => __('Start date', 'baselayer-events'),
		'endDateLabel' => __('End date', 'baselayer-events'),
		'includeTimesLabel' => __('Include times', 'baselayer-events'),
		'startTimeLabel' => __('Start time', 'baselayer-events'),
		'endTimeLabel' => __('End time', 'baselayer-events'),
		'statusLabel' => __('Status', 'baselayer-events'),
		'statusCustomLabel' => __('Status label', 'baselayer-events'),
		'statusColorLabel' => __('Color', 'baselayer-events'),
		'statusInfoLabel' => __('Status information', 'baselayer-events'),
		'statuses' => $statuses_by_type[$pt] ?? [],
		'statusesByType' => $statuses_by_type,
		'statusColorPresets' => function_exists('bl_event_status_color_presets')
			? array_map(
				static function (string $key, string $label): array {
					return [
						'key' => $key,
						'label' => $label,
					];
				},
				array_keys(bl_event_status_color_presets()),
				array_values(bl_event_status_color_presets())
			)
			: [],
		'statusColorDefault' => defined('BL_EVENT_STATUS_COLOR_DEFAULT')
			? BL_EVENT_STATUS_COLOR_DEFAULT
			: 'info',
		'recurringTitle' => __('Recurring', 'baselayer-events'),
		'notRepeating' => __('Not repeating', 'baselayer-events'),
		'editRecurrence' => __('Edit recurrence', 'baselayer-events'),
		'recurrenceNeedsDate' => __('Set a start date to create occurrence posts.', 'baselayer-events'),
		'partOfRecurring' => __('Part of a recurring event.', 'baselayer-events'),
		'masterLabel' => __('Master:', 'baselayer-events'),
		'editInMaster' => __('Edit in master event', 'baselayer-events'),
		'occurrencesLabel' => __('%d occurrences', 'baselayer-events'),
		'occurrenceLabel' => __('%d occurrence', 'baselayer-events'),
		'customContentTitle' => __('This occurrence has custom content.', 'baselayer-events'),
		'customContentHelp' => __('It will not update when the master event changes.', 'baselayer-events'),
		'revertToMaster' => __('Revert to master', 'baselayer-events'),
		'modalTitle' => __('Recurrence settings', 'baselayer-events'),
		'freqLabel' => __('Repeats', 'baselayer-events'),
		'everyLabel' => __('Every', 'baselayer-events'),
		'onLabel' => __('On weekday', 'baselayer-events'),
		'endsLabel' => __('Ends', 'baselayer-events'),
		'endsNever' => __('Never', 'baselayer-events'),
		'endsOnDate' => __('On date', 'baselayer-events'),
		'endsAfter' => __('After', 'baselayer-events'),
		'occurrencesUnit' => __('occurrences', 'baselayer-events'),
		'nextOccurrences' => __('Next occurrences', 'baselayer-events'),
		'moreOccurrences' => __('+%d more', 'baselayer-events'),
		'cancelLabel' => __('Cancel', 'baselayer-events'),
		'saveLabel' => __('Save', 'baselayer-events'),
		'clearRecurrence' => __('Stop repeating', 'baselayer-events'),
		'freqDaily' => __('Daily', 'baselayer-events'),
		'freqWeekly' => __('Weekly', 'baselayer-events'),
		'freqMonthly' => __('Monthly', 'baselayer-events'),
		'freqYearly' => __('Yearly', 'baselayer-events'),
		'unitDay' => __('day(s)', 'baselayer-events'),
		'unitWeek' => __('week(s)', 'baselayer-events'),
		'unitMonth' => __('month(s)', 'baselayer-events'),
		'unitYear' => __('year(s)', 'baselayer-events'),
		/* translators: %d: interval */
		'everyNDays' => __('Every %d days', 'baselayer-events'),
		/* translators: %d: interval */
		'everyNWeeks' => __('Every %d weeks', 'baselayer-events'),
		/* translators: %d: interval */
		'everyNMonths' => __('Every %d months', 'baselayer-events'),
		/* translators: %d: interval */
		'everyNYears' => __('Every %d years', 'baselayer-events'),
		'weekdayLabels' => [
			'mo' => __('Mon', 'baselayer-events'),
			'tu' => __('Tue', 'baselayer-events'),
			'we' => __('Wed', 'baselayer-events'),
			'th' => __('Thu', 'baselayer-events'),
			'fr' => __('Fri', 'baselayer-events'),
			'sa' => __('Sat', 'baselayer-events'),
			'su' => __('Sun', 'baselayer-events'),
		],
		'lookaheadLabel' => $lookahead,
		'horizonDate' => $horizon,
		'revertRestUrl' => esc_url_raw(rest_url('baselayer/v1/event-revert/')),
		'restNonce' => wp_create_nonce('wp_rest'),
		'dateFormat' => get_option('date_format', 'F j, Y'),
		'meta' => $meta_by_type[$pt] ?? ['title' => '', 'groups' => []],
		'metaByType' => $meta_by_type,
		'editMetadata' => __('Edit metadata', 'baselayer-events'),
		'noMetadata' => __('No metadata', 'baselayer-events'),
		'metadataModalTitle' => __('Event metadata', 'baselayer-events'),
	]);
}


add_action('enqueue_block_editor_assets', 'bl_events_enqueue_editor_assets', 20);

/**
 * Admin list: occurrences modal assets.
 */
function bl_events_enqueue_admin_list_assets(string $hook): void
{
	if ($hook !== 'edit.php') {
		return;
	}
	$screen = function_exists('get_current_screen') ? get_current_screen() : null;
	if (!$screen || !bl_is_event_post_type($screen->post_type)) {
		return;
	}

	bl_events_enqueue_style('bl-events-admin', 'events-admin');
	if (!bl_events_enqueue_script('bl-events-admin', 'events-admin', ['jquery'])) {
		return;
	}

	wp_localize_script('bl-events-admin', 'baselayerEventOccurrences', [
		'restUrl' => esc_url_raw(rest_url('baselayer/v1/event-occurrences/')),
		'restoreUrl' => esc_url_raw(rest_url('baselayer/v1/event-restore-occurrence')),
		'softDeleteUrl' => esc_url_raw(rest_url('baselayer/v1/event-soft-delete-occurrence')),
		'restNonce' => wp_create_nonce('wp_rest'),
		'modalTitle' => __('Occurrences', 'baselayer-events'),
		'empty' => __('No upcoming occurrences.', 'baselayer-events'),
		'editLabel' => __('Edit', 'baselayer-events'),
		'editOccurrencesLabel' => __('Edit occurrences', 'baselayer-events'),
		'restoreLabel' => __('Restore', 'baselayer-events'),
		'deleteLabel' => __('Delete', 'baselayer-events'),
		'deleteConfirm' => __('Remove this date from the series? It will not appear in Trash; you can restore it here later.', 'baselayer-events'),
		'deleteDetachedConfirm' => __('This occurrence has custom content. Deleting removes that content permanently. Continue?', 'baselayer-events'),
		'closeLabel' => __('Close', 'baselayer-events'),
		'loadingLabel' => __('Loading…', 'baselayer-events'),
		'customContent' => __('Custom content', 'baselayer-events'),
		'deletedLabel' => __('Deleted', 'baselayer-events'),
		'errorLabel' => __('Could not load occurrences.', 'baselayer-events'),
		'actionErrorLabel' => __('Something went wrong. Please try again.', 'baselayer-events'),
	]);
}
add_action('admin_enqueue_scripts', 'bl_events_enqueue_admin_list_assets');
