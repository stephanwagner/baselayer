<?php

defined('ABSPATH') || exit;

/**
 * Option set when a developer skips the ACF field-group import notice.
 */
const FS_ACF_IMPORT_SKIPPED_OPTION = 'fromscratch_acf_import_skipped';

/**
 * Absolute path to the bundled ACF field-group export JSON.
 */
function fs_acf_import_json_path(): string
{
	return get_template_directory() . '/acf/acf-import.json';
}

/**
 * Whether the current user may import or skip ACF field groups.
 */
function fs_acf_import_user_can_manage(): bool
{
	return function_exists('fs_is_developer_user')
		&& fs_is_developer_user((int) get_current_user_id());
}

/**
 * Decode the bundled ACF export (array of field groups).
 *
 * @return list<array<string, mixed>>|null
 */
function fs_acf_import_load_groups(): ?array
{
	$path = fs_acf_import_json_path();
	if (!is_readable($path)) {
		return null;
	}

	$raw = file_get_contents($path);
	if ($raw === false || $raw === '') {
		return null;
	}

	$decoded = json_decode($raw, true);
	if (!is_array($decoded)) {
		return null;
	}

	// Single group export vs multi-group Tools export.
	if (isset($decoded['key'])) {
		$decoded = [$decoded];
	}

	$groups = [];
	foreach ($decoded as $group) {
		if (is_array($group) && !empty($group['key']) && is_string($group['key'])) {
			$groups[] = $group;
		}
	}

	return $groups !== [] ? $groups : null;
}

/**
 * Field group keys expected from the bundled export.
 *
 * @return list<string>
 */
function fs_acf_import_expected_keys(): array
{
	$groups = fs_acf_import_load_groups();
	if ($groups === null) {
		return [];
	}

	return array_values(array_map(static fn(array $g): string => (string) $g['key'], $groups));
}

/**
 * Whether every bundled field group key already exists in ACF.
 */
function fs_acf_import_groups_present(): bool
{
	if (!function_exists('acf_get_field_group')) {
		return false;
	}

	$keys = fs_acf_import_expected_keys();
	if ($keys === []) {
		return true;
	}

	foreach ($keys as $key) {
		$group = acf_get_field_group($key);
		if (empty($group) || empty($group['key'])) {
			return false;
		}
	}

	return true;
}

/**
 * Whether the import notice should show on this admin request.
 */
function fs_acf_import_should_show_notice(): bool
{
	if (!is_admin() || wp_doing_ajax() || wp_doing_cron()) {
		return false;
	}

	if (function_exists('fs_setup_completed') && !fs_setup_completed()) {
		return false;
	}

	if (!function_exists('acf_import_field_group') || !function_exists('acf_get_field_group')) {
		return false;
	}

	if (!fs_acf_import_user_can_manage()) {
		return false;
	}

	if ((string) get_option(FS_ACF_IMPORT_SKIPPED_OPTION, '') === '1') {
		return false;
	}

	return !fs_acf_import_groups_present();
}

/**
 * Import all field groups from the bundled JSON.
 *
 * @return int|WP_Error Number of groups imported/updated, or error.
 */
function fs_acf_import_run()
{
	if (!function_exists('acf_import_field_group')) {
		return new WP_Error('fs_acf_missing', __('ACF Pro is required to import field groups.', 'fromscratch'));
	}

	$groups = fs_acf_import_load_groups();
	if ($groups === null) {
		return new WP_Error('fs_acf_json', __('Could not read the ACF import file.', 'fromscratch'));
	}

	$count = 0;
	foreach ($groups as $field_group) {
		if (function_exists('acf_get_field_group_post')) {
			$post = acf_get_field_group_post($field_group['key']);
			if ($post) {
				$field_group['ID'] = (int) $post->ID;
			}
		}

		$result = acf_import_field_group($field_group);
		if (empty($result)) {
			$title = isset($field_group['title']) ? (string) $field_group['title'] : (string) $field_group['key'];
			return new WP_Error(
				'fs_acf_import_failed',
				sprintf(
					/* translators: %s: field group title */
					__('Failed to import field group “%s”.', 'fromscratch'),
					$title
				)
			);
		}
		$count++;
	}

	delete_option(FS_ACF_IMPORT_SKIPPED_OPTION);

	return $count;
}

/**
 * Handle Import / Skip actions from the admin notice.
 */
function fs_acf_import_handle_actions(): void
{
	if (!is_admin() || !fs_acf_import_user_can_manage()) {
		return;
	}

	$action = isset($_REQUEST['fs_acf_import_action']) ? sanitize_key((string) $_REQUEST['fs_acf_import_action']) : '';
	if ($action !== 'import' && $action !== 'skip') {
		return;
	}

	check_admin_referer('fs_acf_import_' . $action);

	$redirect = wp_get_referer() ?: admin_url();
	$redirect = remove_query_arg(['fs_acf_import_action', '_wpnonce', 'fs_acf_import_result'], $redirect);

	if ($action === 'skip') {
		update_option(FS_ACF_IMPORT_SKIPPED_OPTION, '1', false);
		if (function_exists('fs_admin_notice_current_user')) {
			fs_admin_notice_current_user(
				'info',
				__('ACF field group import skipped. You can import manually via ACF → Tools.', 'fromscratch')
			);
		}
		wp_safe_redirect($redirect);
		exit;
	}

	$result = fs_acf_import_run();
	if (is_wp_error($result)) {
		if (function_exists('fs_admin_notice_current_user')) {
			fs_admin_notice_current_user('error', $result->get_error_message());
		}
		wp_safe_redirect($redirect);
		exit;
	}

	if (function_exists('fs_admin_notice_current_user')) {
		fs_admin_notice_current_user(
			'success',
			sprintf(
				/* translators: %d: number of field groups */
				_n(
					'Imported %d ACF field group.',
					'Imported %d ACF field groups.',
					(int) $result,
					'fromscratch'
				),
				(int) $result
			)
		);
	}

	wp_safe_redirect($redirect);
	exit;
}
add_action('admin_init', 'fs_acf_import_handle_actions');

/**
 * Admin notice: offer to import bundled ACF field groups.
 */
function fs_acf_import_admin_notice(): void
{
	if (!fs_acf_import_should_show_notice()) {
		return;
	}

	$import_url = wp_nonce_url(
		add_query_arg('fs_acf_import_action', 'import'),
		'fs_acf_import_import'
	);
	$skip_url = wp_nonce_url(
		add_query_arg('fs_acf_import_action', 'skip'),
		'fs_acf_import_skip'
	);
	?>
	<div class="notice notice-warning">
		<p>
			<strong><?= esc_html__('FromScratch ACF field groups', 'fromscratch') ?></strong>
		</p>
		<p>
			<?= esc_html__('ACF Pro is active, but the theme’s block and website field groups are not imported yet. Import them now, or skip if you manage fields yourself.', 'fromscratch') ?>
		</p>
		<p>
			<a href="<?= esc_url($import_url) ?>" class="button button-primary"><?= esc_html__('Import field groups', 'fromscratch') ?></a>
			<a href="<?= esc_url($skip_url) ?>" class="button"><?= esc_html__('Skip', 'fromscratch') ?></a>
		</p>
	</div>
	<?php
}
add_action('admin_notices', 'fs_acf_import_admin_notice');
