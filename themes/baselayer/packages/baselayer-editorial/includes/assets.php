<?php

defined('ABSPATH') || exit;

/**
 * Screens that need the editorial admin assets.
 *
 * @return bool
 */
function bl_editorial_should_enqueue_admin_assets(): bool
{
	$screen = function_exists('get_current_screen') ? get_current_screen() : null;
	if ($screen && in_array($screen->id, ['profile', 'user-edit'], true)) {
		return true;
	}

	$page = isset($_GET['page']) ? sanitize_key((string) $_GET['page']) : '';
	if ($page === '' && $screen && !empty($screen->id)) {
		// Fallback: settings_page_bl-developer-editorial → bl-developer-editorial
		if (str_starts_with($screen->id, 'settings_page_')) {
			$page = substr($screen->id, strlen('settings_page_'));
		}
	}

	if ($page === 'bl-editorial-settings') {
		return true;
	}

	if (function_exists('bl_developer_settings_page_slug') && $page === bl_developer_settings_page_slug('editorial')) {
		return true;
	}

	if ($screen && (
		$screen->id === 'settings_page_bl-editorial-settings'
		|| $screen->id === 'settings_page_bl-developer-editorial'
	)) {
		return true;
	}

	return false;
}

/**
 * Enqueue profile / settings admin assets.
 */
function bl_editorial_enqueue_admin_assets(): void
{
	if (!bl_editorial_should_enqueue_admin_assets()) {
		return;
	}

	bl_editorial_enqueue_style('bl-editorial-admin', 'editorial-admin');
	if (!bl_editorial_enqueue_script('bl-editorial-admin', 'editorial-admin', ['wp-api', 'wp-i18n'])) {
		return;
	}

	$api = [
		'root'  => esc_url_raw(rest_url()),
		'nonce' => wp_create_nonce('wp_rest'),
	];

	wp_localize_script('bl-editorial-admin', 'blEditorialAdmin', [
		'pagesRestUrl' => esc_url_raw(rest_url('wp/v2/pages')),
		'restNonce'    => $api['nonce'],
		'i18n'         => [
			'selectPages'       => __('Select pages', 'baselayer-editorial'),
			'searchPages'       => __('Search…', 'baselayer-editorial'),
			'noPages'           => __('No pages found.', 'baselayer-editorial'),
			'loading'           => __('Loading…', 'baselayer-editorial'),
			'cancel'            => __('Cancel', 'baselayer-editorial'),
			'select'            => __('Select', 'baselayer-editorial'),
			'noPagesSelected'   => __('No pages selected.', 'baselayer-editorial'),
			'remove'            => __('Remove', 'baselayer-editorial'),
		],
	]);
}
add_action('admin_enqueue_scripts', 'bl_editorial_enqueue_admin_assets');

/**
 * Enqueue block editor status panel.
 */
function bl_editorial_enqueue_editor_assets(): void
{
	bl_editorial_enqueue_style('bl-editorial-editor', 'editorial-editor');

	if (!bl_editorial_enqueue_script(
		'bl-editorial-editor',
		'editorial-editor',
		['wp-plugins', 'wp-edit-post', 'wp-element', 'wp-components', 'wp-data', 'wp-i18n']
	)) {
		return;
	}

	$user_id = get_current_user_id();
	$requires_approval = $user_id > 0 && bl_editorial_user_requires_approval($user_id);

	wp_localize_script('bl-editorial-editor', 'blEditorialEditor', [
		'requiresApproval' => $requires_approval,
		'canUpdatePublished' => true,
		'liveStatuses' => ['publish', 'future'],
		'i18n' => [
			'pendingLabel' => __('Editorial', 'baselayer-editorial'),
			'pendingText'  => __('Pending review — awaiting approval', 'baselayer-editorial'),
		],
	]);
}
add_action('enqueue_block_editor_assets', 'bl_editorial_enqueue_editor_assets', 20);
