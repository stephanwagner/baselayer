<?php

defined('ABSPATH') || exit;

/**
 * Option set when a developer skips the ACF field-group import notice.
 */
const BL_ACF_IMPORT_SKIPPED_OPTION = 'baselayer_acf_import_skipped';

/**
 * Option set when ACF was chosen at install but Pro/groups were not ready yet.
 */
const BL_ACF_SETUP_PENDING_OPTION = 'baselayer_acf_setup_pending';

/**
 * Language key for bundled ACF import JSON (e.g. de_CH → de, en_US → en).
 *
 * Uses the site language (not the current admin user’s locale).
 * Falls back to "en" when no matching language file exists.
 */
function bl_acf_import_locale_key(): string
{
	$locale = get_option('WPLANG', '');
	if (!is_string($locale) || $locale === '') {
		$locale = function_exists('get_locale') ? (string) get_locale() : 'en_US';
	}

	$locale = strtolower(str_replace('-', '_', $locale));
	if ($locale === '') {
		return 'en';
	}

	$parts = explode('_', $locale);
	$lang = $parts[0] !== '' ? $parts[0] : 'en';

	return preg_match('/^[a-z]{2}$/', $lang) === 1 ? $lang : 'en';
}

/**
 * Absolute path to the bundled ACF field-group export JSON for the site language.
 *
 * Prefers import-blocks-acf-{lang}.json (e.g. -de, -en), then falls back to -en.
 */
function bl_acf_import_json_path(): string
{
	$dir = (defined('BL_ACF_PATH') ? BL_ACF_PATH : get_template_directory() . '/acf/');
	$lang = bl_acf_import_locale_key();
	$candidates = [
		$dir . 'import-blocks-acf-' . $lang . '.json',
		$dir . 'import-blocks-acf-en.json',
	];

	foreach ($candidates as $path) {
		if (is_readable($path)) {
			return $path;
		}
	}

	return $dir . 'import-blocks-acf-en.json';
}

/**
 * Whether the current user may import or skip ACF field groups.
 */
function bl_acf_import_user_can_manage(): bool
{
	return function_exists('bl_is_developer_user')
		&& bl_is_developer_user((int) get_current_user_id());
}

/**
 * Decode the bundled ACF export (array of field groups).
 *
 * @return list<array<string, mixed>>|null
 */
function bl_acf_import_load_groups(): ?array
{
	$path = bl_acf_import_json_path();
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
 * Field group keys from the theme ACF catalog.
 *
 * @return list<string>
 */
function bl_acf_theme_field_group_keys(): array
{
	$groups = bl_acf_import_load_groups();
	if ($groups === null) {
		return [];
	}

	$keys = [];
	foreach ($groups as $group) {
		$key = sanitize_key((string) ($group['key'] ?? ''));
		if ($key !== '') {
			$keys[] = $key;
		}
	}

	return array_values(array_unique($keys));
}

/**
 * ACF field group keys currently registered on the site.
 *
 * @return list<string>
 */
function bl_acf_existing_field_group_keys(): array
{
	if (!function_exists('acf_get_field_groups')) {
		return [];
	}

	$groups = acf_get_field_groups();
	if (!is_array($groups)) {
		return [];
	}

	$keys = [];
	foreach ($groups as $group) {
		if (!is_array($group)) {
			continue;
		}
		$key = sanitize_key((string) ($group['key'] ?? ''));
		if ($key !== '') {
			$keys[] = $key;
		}
	}

	return array_values(array_unique($keys));
}

/**
 * Theme catalog keys that are not yet present on the site.
 *
 * @return list<string>
 */
function bl_acf_missing_theme_field_group_keys(): array
{
	$theme = bl_acf_theme_field_group_keys();
	if ($theme === []) {
		return [];
	}

	$existing = array_fill_keys(bl_acf_existing_field_group_keys(), true);
	$missing = [];
	foreach ($theme as $key) {
		if (!isset($existing[$key])) {
			$missing[] = $key;
		}
	}

	return $missing;
}

/**
 * Whether ACF Pro is loaded enough to import field groups.
 */
function bl_acf_pro_is_active(): bool
{
	return function_exists('acf_import_field_group') && function_exists('acf_get_field_groups');
}

/**
 * Ensure ACF field types (and post types) are registered before import.
 *
 * Theme install may activate ACF Pro after WordPress `init` has already
 * fired. ACF registers group/repeater types in its own `init` callback, so
 * that request never flattens nested `sub_fields` and imports leave embeds
 * that later trigger "Undefined array key _name" warnings.
 */
function bl_acf_ensure_ready_for_import(): bool
{
	if (!function_exists('acf_import_field_group') || !function_exists('acf')) {
		return false;
	}

	$acf = acf();
	if (!is_object($acf)) {
		return false;
	}

	$group_ready = function_exists('acf_get_field_type') && acf_get_field_type('group');
	$repeater_ready = function_exists('acf_get_field_type') && acf_get_field_type('repeater');

	if ((!$group_ready || !$repeater_ready) && method_exists($acf, 'init')) {
		// Allow a late init when ACF was activated after WP `init` ran.
		if (function_exists('acf_get_data') && function_exists('acf_set_data') && acf_get_data('acf_did_init')) {
			acf_set_data('acf_did_init', null);
		}
		$acf->init();
	}

	if (!post_type_exists('acf-field-group') && method_exists($acf, 'register_post_types')) {
		$acf->register_post_types();
	}

	if (method_exists($acf, 'register_post_status') && function_exists('get_post_status_object')) {
		$status = get_post_status_object('acf-disabled');
		if (!$status) {
			$acf->register_post_status();
		}
	}

	return (bool) (function_exists('acf_get_field_type')
		&& acf_get_field_type('group')
		&& acf_get_field_type('repeater'));
}

/**
 * Whether all theme catalog field groups exist (key-aware).
 */
function bl_acf_theme_field_groups_ready(): bool
{
	$theme = bl_acf_theme_field_group_keys();
	if ($theme === []) {
		return false;
	}

	return bl_acf_missing_theme_field_group_keys() === [];
}

/**
 * Whether ACF was chosen but setup is still incomplete.
 */
function bl_acf_setup_is_pending(): bool
{
	return (string) get_option(BL_ACF_SETUP_PENDING_OPTION, '') === '1';
}

/**
 * Mark / clear pending ACF setup after install.
 */
function bl_acf_set_setup_pending(bool $pending): void
{
	if ($pending) {
		update_option(BL_ACF_SETUP_PENDING_OPTION, '1', false);
		return;
	}

	delete_option(BL_ACF_SETUP_PENDING_OPTION);
}

/**
 * Whether any ACF field group already exists in the site.
 *
 * @deprecated Prefer bl_acf_missing_theme_field_group_keys() / bl_acf_theme_field_groups_ready().
 */
function bl_acf_any_field_group_exists(): bool
{
	return bl_acf_existing_field_group_keys() !== [];
}

/**
 * Whether the import notice should show on this admin request.
 */
function bl_acf_import_should_show_notice(): bool
{
	if (!is_admin() || wp_doing_ajax() || wp_doing_cron()) {
		return false;
	}

	if (function_exists('bl_setup_completed') && !bl_setup_completed()) {
		return false;
	}

	if (!bl_acf_pro_is_active()) {
		return false;
	}

	if (!bl_acf_import_user_can_manage()) {
		return false;
	}

	if ((string) get_option(BL_ACF_IMPORT_SKIPPED_OPTION, '') === '1') {
		return false;
	}

	// Prompt when theme catalog groups are missing (even if other ACF groups exist).
	return bl_acf_missing_theme_field_group_keys() !== [];
}

/**
 * Import / update all field groups from the bundled JSON (matched by group key).
 *
 * @return int|WP_Error Number of groups imported/updated, or error.
 */
function bl_acf_import_run()
{
	if (!function_exists('acf_import_field_group')) {
		return new WP_Error('bl_acf_missing', __('ACF Pro is required to import field groups.', 'baselayer'));
	}

	if (!bl_acf_ensure_ready_for_import()) {
		return new WP_Error(
			'bl_acf_not_ready',
			__('ACF Pro field types are not ready yet. Activate ACF Pro and try the import again.', 'baselayer')
		);
	}

	$groups = bl_acf_import_load_groups();
	if ($groups === null) {
		return new WP_Error('bl_acf_json', __('Could not read the ACF import file.', 'baselayer'));
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
				'bl_acf_import_failed',
				sprintf(
					/* translators: %s: field group title */
					__('Failed to import field group “%s”.', 'baselayer'),
					$title
				)
			);
		}
		$count++;
	}

	delete_option(BL_ACF_IMPORT_SKIPPED_OPTION);
	bl_acf_set_setup_pending(false);

	if (function_exists('bl_block_options_import_acf')) {
		bl_block_options_import_acf(['merge' => true]);
	}

	return $count;
}

/**
 * Create the Blocks showcase page (ACF markup) when missing after setup finishes.
 *
 * @return int Page ID or 0.
 */
function bl_acf_ensure_blocks_showcase_page(): int
{
	$content_file = get_template_directory() . '/includes/install/content.php';
	if (is_readable($content_file)) {
		require_once $content_file;
	}

	if (!function_exists('bl_install_page_manifest') || !function_exists('bl_install_page_post_content')) {
		return 0;
	}

	// Prefer ACF markup for this page even if the runtime system flip-flops mid-request.
	$acf_html = get_template_directory() . '/includes/install/pages/blocks-acf.html';
	$manifest = bl_install_page_manifest();
	$def = $manifest['blocks'] ?? null;
	if (!is_array($def)) {
		return 0;
	}

	$slug = sanitize_title((string) ($def['slug'] ?? 'blocks'));
	$title = (string) ($def['title'] ?? 'Blocks');
	if ($slug === '') {
		return 0;
	}

	$existing = get_page_by_path($slug, OBJECT, 'page');
	if ($existing instanceof WP_Post) {
		return (int) $existing->ID;
	}

	$content = '';
	if (is_readable($acf_html)) {
		$raw = file_get_contents($acf_html);
		if (is_string($raw) && $raw !== '' && function_exists('bl_install_replace_page_placeholders')) {
			$content = bl_install_replace_page_placeholders($raw, $manifest, []);
		} elseif (is_string($raw)) {
			$content = $raw;
		}
	}
	if ($content === '') {
		$content = bl_install_page_post_content('blocks', $manifest, []);
	}

	$post_id = wp_insert_post(
		[
			'post_type'    => 'page',
			'post_status'  => 'private',
			'post_title'   => $title,
			'post_name'    => $slug,
			'post_content' => $content,
		],
		true
	);

	return is_wp_error($post_id) ? 0 : (int) $post_id;
}

/**
 * Handle Import / Skip actions from the admin notice.
 */
function bl_acf_import_handle_actions(): void
{
	if (!is_admin() || !bl_acf_import_user_can_manage()) {
		return;
	}

	$action = isset($_REQUEST['bl_acf_import_action']) ? sanitize_key((string) $_REQUEST['bl_acf_import_action']) : '';
	if ($action !== 'import' && $action !== 'skip') {
		return;
	}

	check_admin_referer('bl_acf_import_' . $action);

	$redirect = wp_get_referer() ?: admin_url();
	$redirect = remove_query_arg(['bl_acf_import_action', '_wpnonce', 'bl_acf_import_result'], $redirect);

	if ($action === 'skip') {
		update_option(BL_ACF_IMPORT_SKIPPED_OPTION, '1', false);
		if (function_exists('bl_admin_notice_current_user')) {
			bl_admin_notice_current_user(
				'info',
				__('ACF field group import skipped. You can import manually via ACF → Tools.', 'baselayer')
			);
		}
		wp_safe_redirect($redirect);
		exit;
	}

	$result = bl_acf_import_run();
	if (is_wp_error($result)) {
		if (function_exists('bl_admin_notice_current_user')) {
			bl_admin_notice_current_user('error', $result->get_error_message());
		}
		wp_safe_redirect($redirect);
		exit;
	}

	$showcase_id = bl_acf_ensure_blocks_showcase_page();

	if (function_exists('bl_admin_notice_current_user')) {
		$message = sprintf(
			/* translators: %d: number of field groups */
			_n(
				'Imported %d ACF field group.',
				'Imported %d ACF field groups.',
				(int) $result,
				'baselayer'
			),
			(int) $result
		);
		if ($showcase_id > 0) {
			$message .= ' ' . __('Blocks showcase page is ready.', 'baselayer');
		}
		bl_admin_notice_current_user('success', $message);
	}

	wp_safe_redirect($redirect);
	exit;
}
add_action('admin_init', 'bl_acf_import_handle_actions');

/**
 * Admin notice: offer to import bundled ACF field groups.
 */
function bl_acf_import_admin_notice(): void
{
	if (!bl_acf_import_should_show_notice()) {
		return;
	}

	$missing = count(bl_acf_missing_theme_field_group_keys());
	$import_url = wp_nonce_url(
		add_query_arg('bl_acf_import_action', 'import'),
		'bl_acf_import_import'
	);
	$skip_url = wp_nonce_url(
		add_query_arg('bl_acf_import_action', 'skip'),
		'bl_acf_import_skip'
	);

	$pending = bl_acf_setup_is_pending();
	?>
	<div class="notice notice-warning">
		<p>
			<strong><?= esc_html__('BaseLayer ACF setup', 'baselayer') ?></strong>
		</p>
		<?php if ($pending) : ?>
			<p>
				<?= esc_html__('ACF was selected during theme install, but field groups are not fully imported yet. Finish setup so Website settings, Hero, and the Blocks demo work.', 'baselayer') ?>
			</p>
			<ol style="margin-left: 1.25em;">
				<li><?= esc_html__('Confirm ACF Pro is active.', 'baselayer') ?></li>
				<li><?= esc_html__('Import the theme field groups (button below).', 'baselayer') ?></li>
				<li><?= esc_html__('Open Website settings, then the Blocks page once it is created.', 'baselayer') ?></li>
			</ol>
		<?php else : ?>
			<p>
				<?= esc_html(
					sprintf(
						/* translators: %d: number of missing field groups */
						_n(
							'%d theme field group is missing. Import to update Website, Hero, and block fields.',
							'%d theme field groups are missing. Import to update Website, Hero, and block fields.',
							$missing,
							'baselayer'
						),
						$missing
					)
				) ?>
			</p>
		<?php endif; ?>
		<p style="margin-top: 12px;">
			<a href="<?= esc_url($import_url) ?>" class="button button-primary bl-button"><?= esc_html__('Import field groups', 'baselayer') ?></a>
			<a href="<?= esc_url($skip_url) ?>" class="button bl-button"><?= esc_html__('Skip', 'baselayer') ?></a>
		</p>
	</div>
	<?php
}
add_action('admin_notices', 'bl_acf_import_admin_notice');
