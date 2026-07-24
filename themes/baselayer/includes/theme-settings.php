<?php

defined('ABSPATH') || exit;

/**
 * Theme settings page under Settings (titles use core-style “Settings › …”).
 * Developer-first: some tabs/sections are only visible to users with developer rights.
 */

/** Tab definitions: slug => [ 'label' => string, 'developer_only' => bool ] */
const BL_THEME_SETTINGS_TABS = [
	'theme'     => ['label' => 'Theme', 'developer_only' => false],
	'blocks'    => ['label' => 'Blocks', 'developer_only' => false],
	'css'       => ['label' => 'CSS', 'developer_only' => false],
	'redirects' => ['label' => 'Redirects', 'developer_only' => false],
];

/**
 * Sub-tab query arg: use `bl_tab`, not `tab`, so slug `theme` is not mixed with core `tab` handling.
 */
const BL_THEME_SETTINGS_TAB_QUERY_VAR = 'bl_tab';

/** Tab slug => User rights key (Developer → User rights). */
const BL_THEME_SETTINGS_TAB_ACCESS = [
	'theme'     => 'theme_settings_general',
	'blocks'    => 'theme_settings_blocks',
	'css'       => 'theme_settings_css',
	'redirects' => 'theme_settings_redirects',
];

/**
 * Current Theme settings sub-tab from the request (empty if none; callers default to first available tab).
 */
function bl_theme_settings_request_tab_slug(): string
{
	$k = BL_THEME_SETTINGS_TAB_QUERY_VAR;
	if (!isset($_GET[$k]) || (string) $_GET[$k] === '') {
		return '';
	}
	return sanitize_key((string) wp_unslash($_GET[$k]));
}

/**
 * URL to Theme settings with a given sub-tab (e.g. theme, css, redirects).
 */
function bl_theme_settings_url_with_tab(string $slug): string
{
	return add_query_arg(
		[
			'page' => 'bl-theme-settings',
			BL_THEME_SETTINGS_TAB_QUERY_VAR => $slug,
		],
		admin_url('options-general.php')
	);
}

function bl_theme_settings_is_settings_page_post(): bool
{
	if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
		return false;
	}
	global $pagenow;
	$page = isset($_REQUEST['page']) ? sanitize_key((string) wp_unslash($_REQUEST['page'])) : '';

	return $pagenow === 'options-general.php' && $page === 'bl-theme-settings';
}

/**
 * POST body targets the Theme sub-tab (homepage, weekly report, etc.); action URL may omit bl_tab when empty.
 */
function bl_theme_settings_post_is_theme_tab(): bool
{
	$tab = bl_theme_settings_request_tab_slug();
	return $tab === '' || $tab === 'theme';
}

function bl_theme_settings_available_tabs(): array
{
	$is_dev = function_exists('bl_is_developer_user') && bl_is_developer_user((int) get_current_user_id());
	$tabs = [];
	foreach (BL_THEME_SETTINGS_TABS as $slug => $def) {
		if ($def['developer_only'] && !$is_dev) {
			continue;
		}
		if (function_exists('bl_admin_can_access')) {
			$access_key = BL_THEME_SETTINGS_TAB_ACCESS[$slug] ?? null;
			if ($access_key !== null && !bl_admin_can_access($access_key)) {
				continue;
			}
		}
		$tabs[$slug] = $def['label'];
	}
	return $tabs;
}

function bl_theme_settings_current_tab(): string
{
	$available = array_keys(bl_theme_settings_available_tabs());
	$requested = bl_theme_settings_request_tab_slug();
	if ($requested !== '' && in_array($requested, $available, true)) {
		return $requested;
	}
	return $available[0] ?? 'theme';
}

/**
 * Browser/window title and page &lt;h1&gt;: Settings › Theme [› Tab] when not on the first visible tab (core-style).
 */
function bl_theme_settings_admin_title(string $current_tab): string
{
	if (!function_exists('bl_admin_settings_submenu_title')) {
		return __('Theme', 'baselayer');
	}
	$available = bl_theme_settings_available_tabs();
	if ($available === []) {
		return bl_admin_settings_submenu_title(__('Theme', 'baselayer'));
	}
	$first_slug = array_key_first($available);
	if ($current_tab === $first_slug) {
		return bl_admin_settings_submenu_title(__('Theme', 'baselayer'));
	}
	$label = $available[$current_tab] ?? $current_tab;
	return bl_admin_settings_submenu_title(__('Theme', 'baselayer'), __($label, 'baselayer'));
}

/**
 * Admin screen title like WordPress core (e.g. Einstellungen › Allgemein): translated Settings + › + segment(s).
 *
 * @param string ...$parts Labels shown after “Settings ›”.
 */
function bl_admin_settings_submenu_title(string ...$parts): string
{
	$filtered = [];
	foreach ($parts as $p) {
		if ($p !== null && $p !== '') {
			$filtered[] = $p;
		}
	}
	$suffix = implode(' › ', $filtered);
	return __('Settings', 'default') . ' › ' . $suffix;
}

// Redirects form (self-POST to avoid options.php redirect flicker). Use admin_init so we run regardless of load-hook.
add_action('admin_init', function () {
	if (!current_user_can('manage_options') || !bl_theme_settings_is_settings_page_post()) {
		return;
	}
	if (empty($_POST['baselayer_save_redirects']) || empty($_POST['_wpnonce']) || !wp_verify_nonce($_POST['_wpnonce'], 'baselayer_save_redirects')) {
		return;
	}
	$value = isset($_POST['bl_redirects']) && is_array($_POST['bl_redirects']) ? $_POST['bl_redirects'] : [];
	$sanitized = bl_sanitize_redirects($value);
	bl_redirects_sync_htaccess($sanitized);
	update_option('bl_redirects', $sanitized);
	set_transient('baselayer_redirects_saved', '1', 30);
	wp_safe_redirect(bl_theme_settings_url_with_tab('redirects'));
	exit;
}, 1);

// CSS form (self-POST to avoid options.php redirect flicker)
add_action('admin_init', function () {
	if (!current_user_can('manage_options') || !bl_theme_settings_is_settings_page_post()) {
		return;
	}
	if (empty($_POST['baselayer_save_css']) || empty($_POST['_wpnonce']) || !wp_verify_nonce($_POST['_wpnonce'], 'baselayer_save_css')) {
		return;
	}
	$value = isset($_POST['baselayer_custom_css']) ? $_POST['baselayer_custom_css'] : '';
	$sanitized = bl_sanitize_custom_css($value);
	update_option('baselayer_custom_css', $sanitized);
	set_transient('baselayer_css_saved', '1', 30);
	wp_safe_redirect(bl_theme_settings_url_with_tab('css'));
	exit;
}, 1);

/**
 * Persist Theme sub-tab fields (explicit list; avoids get_registered_settings before register_setting runs).
 */
function bl_theme_settings_save_general_options_from_post(): void
{
	$trio_opts = ['baselayer_weekly_report_wday', 'baselayer_weekly_report_hour', 'baselayer_weekly_report_minute'];
	$schedule_before = [
		'baselayer_weekly_report_wday' => (string) get_option('baselayer_weekly_report_wday', '1'),
		'baselayer_weekly_report_hour' => (string) get_option('baselayer_weekly_report_hour', '8'),
		'baselayer_weekly_report_minute' => (string) get_option('baselayer_weekly_report_minute', '0'),
	];

	$pairs = [
		'blogname' => 'sanitize_text_field',
		'baselayer_weekly_report_enabled' => static function ($raw): string {
			return !empty($raw) ? '1' : '0';
		},
		'baselayer_weekly_report_wday' => 'bl_sanitize_weekly_report_wday',
		'baselayer_weekly_report_hour' => 'bl_sanitize_weekly_report_hour',
		'baselayer_weekly_report_minute' => 'bl_sanitize_weekly_report_minute',
		'baselayer_report_email' => 'bl_sanitize_report_email_list',
		'posts_per_page' => 'bl_sanitize_posts_per_page',
		'baselayer_excerpt_length' => 'bl_sanitize_excerpt_length',
		'baselayer_excerpt_more' => 'sanitize_text_field',
		'baselayer_og_image_fallback' => 'bl_sanitize_og_image_fallback',
		'baselayer_feature_image_fallback' => 'bl_sanitize_og_image_fallback',
		'show_on_front' => 'bl_sanitize_show_on_front',
		'page_on_front' => 'bl_sanitize_homepage_page_id',
		'page_for_posts' => 'bl_sanitize_homepage_page_id',
	];
	foreach ($pairs as $name => $sanitize) {
		if (!array_key_exists($name, $_POST)) {
			continue;
		}
		$raw = wp_unslash($_POST[$name]);
		if ($sanitize instanceof \Closure) {
			$value = $sanitize($raw);
		} else {
			$value = call_user_func($sanitize, $raw);
		}
		update_option($name, $value);
	}

	if (array_key_exists('custom_logo', $_POST)) {
		$logo_id = bl_sanitize_custom_logo(wp_unslash($_POST['custom_logo']));
		if ($logo_id > 0) {
			set_theme_mod('custom_logo', $logo_id);
		} else {
			remove_theme_mod('custom_logo');
		}
	}

	$front_id = (int) get_option('page_on_front');
	$posts_id = (int) get_option('page_for_posts');
	if ($front_id > 0 && $front_id === $posts_id) {
		update_option('page_for_posts', 0);
	}

	foreach ($trio_opts as $tkey) {
		if (
			array_key_exists($tkey, $_POST)
			&& (string) get_option($tkey, '') !== $schedule_before[$tkey]
		) {
			delete_option('baselayer_weekly_report_last_sent_week');
			break;
		}
	}
}

// Theme sub-tab (self-POST): save stays on Theme settings; no redirect to options.php.
add_action('admin_init', function (): void {
	if (!current_user_can('manage_options') || !bl_theme_settings_is_settings_page_post() || !bl_theme_settings_post_is_theme_tab()) {
		return;
	}
	$url = bl_theme_settings_url_with_tab('theme');

	if (($_POST['action'] ?? '') === 'update' && ($_POST['option_page'] ?? '') === BL_THEME_OPTION_GROUP_GENERAL) {
		check_admin_referer(BL_THEME_OPTION_GROUP_GENERAL . '-options');
		bl_theme_settings_save_general_options_from_post();
		if (function_exists('bl_weekly_report_reschedule_cron')) {
			bl_weekly_report_reschedule_cron();
		}
		set_transient('baselayer_general_saved', '1', 30);
		wp_safe_redirect($url);
		exit;
	}
}, 20);

// Theme sub-tab: send the full weekly report immediately (manual send, same content as cron).
add_action('admin_init', function () {
	if (!current_user_can('manage_options') || !bl_theme_settings_is_settings_page_post() || !bl_theme_settings_post_is_theme_tab()) {
		return;
	}
	if (empty($_POST['baselayer_send_weekly_report_to_developer'])) {
		return;
	}
	if (empty($_POST['_wpnonce']) || !wp_verify_nonce((string) $_POST['_wpnonce'], 'baselayer_send_weekly_report_to_developer')) {
		return;
	}
	$url = bl_theme_settings_url_with_tab('theme');
	$posted = isset($_POST['baselayer_weekly_report_manual_recipient'])
		? sanitize_email(wp_unslash((string) $_POST['baselayer_weekly_report_manual_recipient']))
		: '';
	$current_user_mail = '';
	if (is_user_logged_in()) {
		$cud = wp_get_current_user();
		if ($cud instanceof WP_User && isset($cud->user_email) && is_email((string) $cud->user_email)) {
			$current_user_mail = (string) $cud->user_email;
		}
	}
	$developer_email = function_exists('bl_developer_email') ? bl_developer_email() : '';
	$recipient = $posted !== '' ? $posted : ($current_user_mail !== '' ? $current_user_mail : $developer_email);
	if ($recipient === '' || !is_email($recipient)) {
		set_transient(
			'baselayer_weekly_report_send_error',
			__('Please enter a valid email address.', 'baselayer'),
			30
		);
		wp_safe_redirect($url);
		exit;
	}
	if (!function_exists('bl_weekly_report_send')) {
		set_transient('baselayer_weekly_report_send_error', __('Weekly report sender is not available.', 'baselayer'), 30);
		wp_safe_redirect($url);
		exit;
	}
	$sent = bl_weekly_report_send([$recipient]);
	if ($sent) {
		set_transient('baselayer_weekly_report_send_success', $recipient, 30);
	} else {
		set_transient('baselayer_weekly_report_send_error', __('Weekly website report could not be sent.', 'baselayer'), 30);
	}
	wp_safe_redirect($url);
	exit;
}, 2);

// Ensure media modal is available on Theme sub-tab (client logo, OG image).
add_action('admin_enqueue_scripts', function ($hook_suffix) {
	if ($hook_suffix !== 'settings_page_bl-theme-settings') {
		return;
	}
	$can_theme = current_user_can('manage_options') && (!function_exists('bl_admin_can_access') || bl_admin_can_access('theme_settings_general'));
	if (!$can_theme) {
		return;
	}
	wp_enqueue_media();
}, 10);

// Enqueue WordPress code editor (syntax highlight, lint) for CSS tab
add_action('admin_enqueue_scripts', function ($hook_suffix) {
	if ($hook_suffix !== 'settings_page_bl-theme-settings') {
		return;
	}
	$tab = bl_theme_settings_request_tab_slug();
	if ($tab !== 'css') {
		return;
	}
	if (!current_user_can('manage_options') || (function_exists('bl_admin_can_access') && !bl_admin_can_access('theme_settings_css'))) {
		return;
	}
	$settings = wp_enqueue_code_editor([
		'type' => 'text/css',
	]);
	if ($settings === false) {
		return;
	}
	wp_add_inline_script('code-editor', sprintf(
		'jQuery(function() { if (wp.codeEditor && document.getElementById("baselayer_custom_css")) { wp.codeEditor.initialize("baselayer_custom_css", %s); } });',
		wp_json_encode($settings)
	));

	$overview_settings = $settings;
	if (is_array($overview_settings)) {
		$codemirror = isset($overview_settings['codemirror']) && is_array($overview_settings['codemirror'])
			? $overview_settings['codemirror']
			: [];
		$codemirror['readOnly'] = true;
		$overview_settings['codemirror'] = $codemirror;
	}
	wp_add_inline_script(
		'code-editor',
		sprintf(
			'window.blCssVarsOverviewEditorSettings = %s;',
			wp_json_encode($overview_settings)
		)
	);
}, 10);

// Redirect when access to requested tab is denied
add_action('load-settings_page_bl-theme-settings', function () {
	if (!current_user_can('manage_options')) {
		return;
	}
	$requested = bl_theme_settings_request_tab_slug();
	if ($requested === '') {
		return;
	}
	if ($requested === 'design') {
		wp_safe_redirect(admin_url('options-general.php?page=bl-theme-settings'));
		exit;
	}
	$access_key = BL_THEME_SETTINGS_TAB_ACCESS[$requested] ?? null;
	if ($access_key === null || !function_exists('bl_admin_can_access') || bl_admin_can_access($access_key)) {
		return;
	}
	wp_safe_redirect(
		$requested === 'theme'
			? admin_url('options-general.php?page=bl-theme-settings')
			: bl_theme_settings_url_with_tab('theme')
	);
	exit;
}, 1);

const BL_THEME_OPTION_GROUP_GENERAL = 'bl_theme_general';
const BL_THEME_OPTION_GROUP_FEATURES = 'bl_theme_features';
const BL_THEME_OPTION_GROUP_CSS = 'bl_theme_css';
const BL_THEME_OPTION_GROUP_SECURITY = 'bl_theme_security';
const BL_THEME_OPTION_GROUP_REDIRECTS = 'bl_theme_redirects';
const BL_THEME_OPTION_GROUP_BLOCKS = 'bl_theme_blocks';
const BL_THEME_OPTION_GROUP_DEVELOPER = 'bl_theme_developer';
const BL_THEME_OPTION_GROUP_DEVELOPER_GENERAL = 'bl_theme_developer_general';
const BL_THEME_OPTION_GROUP_LANGUAGES = 'bl_theme_languages';

add_action('admin_init', function () {
	register_setting(BL_THEME_OPTION_GROUP_DEVELOPER, 'baselayer_admin_access', [
		'type' => 'array',
		'sanitize_callback' => 'bl_sanitize_admin_access',
	]);
	if (defined('BL_BLOCK_SETTINGS_OPTION')) {
		register_setting(BL_THEME_OPTION_GROUP_BLOCKS, BL_BLOCK_SETTINGS_OPTION, [
			'type' => 'array',
			'sanitize_callback' => 'bl_sanitize_block_settings',
		]);
	}
}, 5);

add_action('admin_init', function () {
	register_setting(BL_THEME_OPTION_GROUP_DEVELOPER_GENERAL, 'admin_email', [
		'type' => 'string',
		'sanitize_callback' => 'sanitize_email',
	]);
	register_setting(BL_THEME_OPTION_GROUP_DEVELOPER_GENERAL, 'baselayer_report_email', [
		'type' => 'string',
		'sanitize_callback' => 'bl_sanitize_report_email_list',
	]);
	register_setting(BL_THEME_OPTION_GROUP_DEVELOPER_GENERAL, 'baselayer_developer_email', [
		'type' => 'string',
		'sanitize_callback' => 'sanitize_email',
	]);
}, 5);

/**
 * Report email (Developer › Settings). Used for automated reports e.g. weekly analytics.
 *
 * @return string Sanitized email or empty string.
 */
function bl_report_email(): string
{
	$list = bl_report_emails();
	return $list[0] ?? '';
}

/**
 * Parse and sanitize report recipient list (one email per line).
 *
 * @param mixed $value Raw option value.
 * @return string
 */
function bl_sanitize_report_email_list($value): string
{
	$text = is_string($value) ? $value : '';
	$lines = preg_split('/\r\n|\r|\n/', $text);
	if (!is_array($lines)) {
		return '';
	}
	$out = [];
	foreach ($lines as $line) {
		$email = sanitize_email(trim((string) $line));
		if ($email === '' || !is_email($email)) {
			continue;
		}
		$out[] = strtolower($email);
	}
	$out = array_values(array_unique($out));
	return implode("\n", $out);
}

/**
 * @return array<int, string> Report recipient emails.
 */
function bl_report_emails(): array
{
	$raw = get_option('baselayer_report_email', '');
	if (!is_string($raw) || trim($raw) === '') {
		return [];
	}
	$lines = preg_split('/\r\n|\r|\n/', $raw);
	if (!is_array($lines)) {
		return [];
	}
	$out = [];
	foreach ($lines as $line) {
		$email = sanitize_email(trim((string) $line));
		if ($email === '' || !is_email($email)) {
			continue;
		}
		$out[] = strtolower($email);
	}
	return array_values(array_unique($out));
}

/**
 * Developer email (Developer › Settings). Used for system alerts, errors and security warnings.
 *
 * @return string Sanitized email or empty string.
 */
function bl_developer_email(): string
{
	$email = get_option('baselayer_developer_email', '');
	return is_string($email) && is_email($email) ? $email : '';
}

add_action('admin_init', function () {
	register_setting(BL_THEME_OPTION_GROUP_GENERAL, 'baselayer_asset_version', [
		'type' => 'string',
		'default' => '1',
		'sanitize_callback' => 'bl_sanitize_asset_version',
	]);
	register_setting(BL_THEME_OPTION_GROUP_GENERAL, 'baselayer_excerpt_length', [
		'type' => 'string',
		'sanitize_callback' => 'bl_sanitize_excerpt_length',
	]);
	register_setting(BL_THEME_OPTION_GROUP_GENERAL, 'baselayer_excerpt_more', [
		'type' => 'string',
		'sanitize_callback' => 'sanitize_text_field',
	]);
	register_setting(BL_THEME_OPTION_GROUP_GENERAL, 'posts_per_page', [
		'type' => 'integer',
		'sanitize_callback' => 'bl_sanitize_posts_per_page',
	]);
	register_setting(BL_THEME_OPTION_GROUP_GENERAL, 'baselayer_og_image_fallback', [
		'type' => 'integer',
		'sanitize_callback' => 'bl_sanitize_og_image_fallback',
	]);
	register_setting(BL_THEME_OPTION_GROUP_GENERAL, 'baselayer_feature_image_fallback', [
		'type' => 'integer',
		'sanitize_callback' => 'bl_sanitize_og_image_fallback',
	]);
	register_setting(BL_THEME_OPTION_GROUP_GENERAL, 'baselayer_weekly_report_enabled', [
		'type' => 'string',
		'sanitize_callback' => static function ($value): string {
			return !empty($value) ? '1' : '0';
		},
	]);
	register_setting(BL_THEME_OPTION_GROUP_GENERAL, 'baselayer_report_email', [
		'type' => 'string',
		'sanitize_callback' => 'bl_sanitize_report_email_list',
	]);
	register_setting(BL_THEME_OPTION_GROUP_GENERAL, 'baselayer_weekly_report_wday', [
		'type' => 'string',
		'sanitize_callback' => 'bl_sanitize_weekly_report_wday',
		'default' => '1',
	]);
	register_setting(BL_THEME_OPTION_GROUP_GENERAL, 'baselayer_weekly_report_hour', [
		'type' => 'string',
		'sanitize_callback' => 'bl_sanitize_weekly_report_hour',
		'default' => '8',
	]);
	register_setting(BL_THEME_OPTION_GROUP_GENERAL, 'baselayer_weekly_report_minute', [
		'type' => 'string',
		'sanitize_callback' => 'bl_sanitize_weekly_report_minute',
		'default' => '0',
	]);
}, 5);

add_action('admin_init', function () {
	register_setting(BL_THEME_OPTION_GROUP_FEATURES, 'baselayer_features', [
		'type' => 'array',
		'sanitize_callback' => 'bl_sanitize_features',
	]);
}, 5);

add_action('admin_init', function () {
	register_setting(BL_THEME_OPTION_GROUP_CSS, 'baselayer_custom_css', [
		'type' => 'string',
		'sanitize_callback' => 'bl_sanitize_custom_css',
	]);
}, 5);

add_action('admin_init', function () {
	register_setting(BL_THEME_OPTION_GROUP_SECURITY, 'baselayer_site_password_protection', [
		'type' => 'string',
		'sanitize_callback' => 'bl_sanitize_site_password_protection',
	]);
	register_setting(BL_THEME_OPTION_GROUP_SECURITY, 'baselayer_maintenance_mode', [
		'type' => 'string',
		'sanitize_callback' => 'bl_sanitize_maintenance_mode',
	]);
	register_setting(BL_THEME_OPTION_GROUP_SECURITY, 'baselayer_maintenance_title', [
		'type' => 'string',
		'sanitize_callback' => 'bl_sanitize_maintenance_title',
	]);
	register_setting(BL_THEME_OPTION_GROUP_SECURITY, 'baselayer_maintenance_description', [
		'type' => 'string',
		'sanitize_callback' => 'bl_sanitize_maintenance_description',
	]);
}, 5);

add_action('admin_init', function () {
	register_setting(BL_THEME_OPTION_GROUP_REDIRECTS, 'bl_redirects', [
		'type' => 'array',
		'sanitize_callback' => 'bl_sanitize_redirects',
	]);
}, 5);

require_once __DIR__ . '/theme-settings/block-settings.php';

add_action('admin_init', function () {
	register_setting(BL_THEME_OPTION_GROUP_LANGUAGES, 'bl_theme_languages', [
		'type' => 'array',
		'sanitize_callback' => 'bl_sanitize_theme_languages',
	]);
}, 5);

/**
 * Sanitize Languages tab data: list of { id, name, nameNative }, plus default id.
 *
 * @param mixed $value Raw POST value.
 * @return array{list: array<int, array{id: string, name: string, nameNative: string}>, default: string}
 */
function bl_sanitize_theme_languages($value): array
{
	$list = [];
	$seen_ids = [];
	if (isset($value['list']) && is_array($value['list'])) {
		foreach ($value['list'] as $row) {
			if (!is_array($row)) {
				continue;
			}
			$id = isset($row['id']) ? preg_replace('/[^a-z0-9_-]/i', '', (string) $row['id']) : '';
			if ($id === '') {
				continue;
			}
			$id_lower = strtolower($id);
			if (isset($seen_ids[$id_lower])) {
				continue;
			}
			$seen_ids[$id_lower] = true;
			$list[] = [
				'id' => $id,
				'name' => isset($row['name']) ? sanitize_text_field((string) $row['name']) : '',
				'nameNative' => isset($row['nameNative']) ? sanitize_text_field((string) $row['nameNative']) : '',
			];
		}
	}
	$ids = array_column($list, 'id');
	$default = isset($value['default']) ? preg_replace('/[^a-z0-9_-]/i', '', (string) $value['default']) : '';
	if ($default === '' || !in_array($default, $ids, true)) {
		$default = $ids[0] ?? '';
	}
	// Ensure default language is first in the list.
	if ($default !== '' && count($list) > 1 && strtolower((string) ($list[0]['id'] ?? '')) !== strtolower($default)) {
		$default_index = null;
		foreach ($list as $i => $row) {
			if (strtolower((string) $row['id']) === strtolower($default)) {
				$default_index = $i;
				break;
			}
		}
		if ($default_index !== null) {
			$default_row = $list[$default_index];
			array_splice($list, $default_index, 1);
			array_unshift($list, $default_row);
		}
	}
	$use_url_prefix = isset($value['use_url_prefix']) ? (bool) $value['use_url_prefix'] : true;
	$prefix_default = $use_url_prefix && !empty($value['prefix_default']);
	$no_translation = isset($value['no_translation']) && in_array($value['no_translation'], ['hide', 'disabled', 'home'], true)
		? $value['no_translation'] : 'disabled';
	return ['list' => $list, 'default' => $default, 'use_url_prefix' => $use_url_prefix, 'prefix_default' => $prefix_default, 'no_translation' => $no_translation];
}

/**
 * Preserve existing asset version when the option is not in the form (e.g. saving Features only).
 * Prevents cache version from being reset when saving other General-group forms.
 */
function bl_sanitize_asset_version($value): string
{
	$value = is_string($value) ? trim($value) : '';
	if ($value === '') {
		return (string) get_option('baselayer_asset_version', '1');
	}
	return sanitize_text_field($value);
}

function bl_sanitize_excerpt_length($value): string
{
	$value = is_string($value) ? trim($value) : '';
	if ($value === '') {
		return '';
	}
	$n = absint($value);
	return (string) ($n > 0 ? $n : '');
}

/**
 * Core option `posts_per_page` (Settings → Reading). Same value saved from Theme → General.
 *
 * @param mixed $value Raw value from form.
 */
function bl_sanitize_posts_per_page($value): int
{
	if ($value === '' || $value === null) {
		return max(1, (int) get_option('posts_per_page', 10));
	}
	$n = absint($value);
	if ($n < 1) {
		$n = 1;
	}
	return min($n, 999);
}

/**
 * Core option `show_on_front` (Settings → Reading). Saved from Theme → General.
 *
 * @param mixed $value Raw value from form.
 */
function bl_sanitize_show_on_front($value): string
{
	$value = is_string($value) ? $value : '';
	return in_array($value, ['posts', 'page'], true) ? $value : 'posts';
}

/**
 * Core options `page_on_front` / `page_for_posts` (Settings → Reading). Saved from Theme → General.
 *
 * @param mixed $value Raw value from form.
 */
function bl_sanitize_homepage_page_id($value): int
{
	$id = absint($value);
	if ($id <= 0) {
		return 0;
	}
	$post = get_post($id);
	return ($post && $post->post_type === 'page') ? $id : 0;
}

function bl_sanitize_custom_logo($value): int
{
	$id = absint($value);
	if ($id <= 0) {
		return 0;
	}
	return wp_attachment_is_image($id) ? $id : 0;
}

function bl_sanitize_og_image_fallback($value): int
{
	$id = absint($value);
	if ($id <= 0) {
		return 0;
	}
	return wp_attachment_is_image($id) ? $id : 0;
}

/**
 * Sanitize custom CSS: strip HTML, limit length. Output is escaped when printed.
 */
function bl_sanitize_custom_css($value): string
{
	$value = is_string($value) ? $value : '';
	$value = wp_strip_all_tags($value);
	$value = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $value);
	return substr($value, 0, 256 * 1024);
}

/**
 * Sanitize redirects list. Expects POST bl_redirects as array of [from, to, code]. Saves as bl_redirects keyed by from path.
 */
function bl_sanitize_redirects($value): array
{
	$out = [];
	if (!is_array($value)) {
		$value = [];
	}
	$allowed_codes = [301, 302];
	foreach ($value as $row) {
		if (!is_array($row)) {
			continue;
		}
		$from = isset($row['from']) ? trim((string) $row['from']) : '';
		$to = isset($row['to']) ? trim((string) $row['to']) : '';
		$code = isset($row['code']) ? absint($row['code']) : 301;
		if ($from === '' || $to === '') {
			continue;
		}
		$from = bl_normalize_redirect_from_path($from);
		$to = bl_normalize_redirect_to_path($to);
		if ($from === '' || $to === '') {
			continue;
		}
		$code = in_array($code, $allowed_codes, true) ? $code : 301;
		$out[$from] = ['to' => $to, 'code' => $code];
	}
	return $out;
}

/**
 * Write or remove .htaccess redirect rules according to config/theme.php → redirects.method.
 *
 * @return bool True when no write was required or the file was updated successfully.
 */
function bl_redirects_sync_htaccess(array $redirects): bool
{
	$method = function_exists('bl_config_redirects') ? bl_config_redirects('method') : 'wordpress';
	if (!in_array($method, ['wordpress', 'htaccess'], true)) {
		$method = 'wordpress';
	}

	if ($method !== 'htaccess') {
		bl_remove_redirects_htaccess_block();
		delete_transient('baselayer_redirects_htaccess_error');
		return true;
	}

	if (!function_exists('bl_can_use_htaccess_redirects') || !bl_can_use_htaccess_redirects()) {
		set_transient('baselayer_redirects_htaccess_error', 'unavailable', 30);
		return false;
	}

	$ok = bl_write_redirects_htaccess($redirects);
	if (!$ok) {
		set_transient('baselayer_redirects_htaccess_error', 'writable', 30);
	} else {
		delete_transient('baselayer_redirects_htaccess_error');
	}

	return $ok;
}

/**
 * Normalize "from" path: no protocol, leading slash, no query string.
 */
function bl_normalize_redirect_from_path(string $path): string
{
	$path = preg_replace('#^https?://[^/]*#i', '', $path);
	$path = trim($path, '/');
	return $path === '' ? '' : '/' . $path;
}

/**
 * Normalize "to" path or URL: allow full URL or path starting with /.
 */
function bl_normalize_redirect_to_path(string $path): string
{
	$path = trim($path);
	if ($path === '') {
		return '';
	}
	if (preg_match('#^https?://#i', $path)) {
		return esc_url_raw($path, ['http', 'https']);
	}
	$path = trim($path, '/');
	return $path === '' ? '/' : '/' . $path;
}

const BL_HTACCESS_REDIRECTS_MARKER_START = '# BEGIN BaseLayer redirects';
const BL_HTACCESS_REDIRECTS_MARKER_END = '# END BaseLayer redirects';

/**
 * Remove the BaseLayer redirects block from .htaccess.
 */
function bl_remove_redirects_htaccess_block(): bool
{
	$file = ABSPATH . '.htaccess';
	if (!file_exists($file) || !is_writable($file)) {
		return false;
	}
	$content = (string) file_get_contents($file);
	$pattern = '/\s*' . preg_quote(BL_HTACCESS_REDIRECTS_MARKER_START, '/') . '.*?' . preg_quote(BL_HTACCESS_REDIRECTS_MARKER_END, '/') . '\s*/s';
	if (!preg_match($pattern, $content)) {
		return true;
	}
	$content = preg_replace($pattern, "\n", $content);
	return (bool) file_put_contents($file, trim($content) . "\n", LOCK_EX);
}

/**
 * Write redirect rules to .htaccess. Block is always placed at the start of the file (before WordPress) so rules run first.
 */
function bl_write_redirects_htaccess(array $redirects): bool
{
	$file = rtrim(ABSPATH, '/\\') . '/.htaccess';
	if (file_exists($file) && !is_writable($file)) {
		return false;
	}
	$dir = dirname($file);
	if (!file_exists($file) && (!is_writable($dir) || !is_dir($dir))) {
		return false;
	}
	$content = file_exists($file) ? (string) file_get_contents($file) : '';
	$block_pattern = '/\s*' . preg_quote(BL_HTACCESS_REDIRECTS_MARKER_START, '/') . '.*?' . preg_quote(BL_HTACCESS_REDIRECTS_MARKER_END, '/') . '\s*/s';
	$content = preg_replace($block_pattern, "\n", $content);
	$content = trim($content);

	if ($redirects !== []) {
		$block = BL_HTACCESS_REDIRECTS_MARKER_START . "\n";
		$block .= "<IfModule mod_rewrite.c>\nRewriteEngine On\n";
		$home_path = parse_url(home_url('/'), PHP_URL_PATH);
		$home_path = is_string($home_path) ? trim($home_path, '/') : '';
		$block .= $home_path !== '' ? 'RewriteBase /' . $home_path . "\n" : "RewriteBase /\n";
		foreach ($redirects as $from => $item) {
			$to = $item['to'];
			$code = (int) ($item['code'] ?? 301);
			$path_for_regex = ltrim($from, '/');
			$rewrite_pattern = $path_for_regex === '' ? '^/?$' : '^' . preg_quote($path_for_regex, '#') . '/?$';
			$target = bl_redirect_htaccess_rewrite_target($to);
			$target = strpos($target, ' ') !== false ? '"' . $target . '"' : $target;
			$block .= 'RewriteRule ' . $rewrite_pattern . ' ' . $target . ' [R=' . $code . ',L,NC]' . "\n";
		}
		$block .= "</IfModule>\n";
		$block .= BL_HTACCESS_REDIRECTS_MARKER_END . "\n";
		$content = $block . ($content !== '' ? "\n\n" . $content : '');
	}

	$content = trim($content) . "\n";
	return (bool) file_put_contents($file, $content, LOCK_EX);
}

function bl_sanitize_features($value): array
{
	if (!is_array($value)) {
		return [];
	}
	$defaults = function_exists('bl_theme_feature_defaults') ? bl_theme_feature_defaults() : [];
	$out = [];
	foreach (array_keys($defaults) as $key) {
		if ($key === 'language_mode') {
			continue;
		}
		$out[$key] = (!empty($value[$key])) ? 1 : 0;
	}
	$mode = isset($value['language_mode']) ? (string) $value['language_mode'] : 'content';
	$out['language_mode'] = in_array($mode, ['content', 'google_translate'], true) ? $mode : 'content';
	if (empty($out['enable_webp'])) {
		$out['enable_webp_convert_original'] = 0;
	}
	if (empty($out['enable_post_expirator'])) {
		wp_clear_scheduled_hook('bl_expire_post');
	}
	return $out;
}

function bl_sanitize_admin_access($value): array
{
	$defaults = function_exists('bl_admin_access_defaults') ? bl_admin_access_defaults() : [];
	if (!is_array($value)) {
		return $defaults;
	}
	$out = [];
	foreach (array_keys($defaults) as $item) {
		$out[$item] = [
			'admin' => !empty($value[$item]['admin']) ? 1 : 0,
			'developer' => !empty($value[$item]['developer']) ? 1 : 0,
		];
	}
	return $out;
}

function bl_sanitize_site_password_protection($value): string
{
	$enabled = !empty($value) ? '1' : '';
	$new_password = isset($_POST['baselayer_site_password_new']) ? trim((string) wp_unslash($_POST['baselayer_site_password_new'])) : '';
	if ($new_password !== '') {
		update_option('baselayer_site_password_hash', wp_hash_password($new_password), true);
		update_option('baselayer_site_password_plain', $new_password, true);
	} else {
		update_option('baselayer_site_password_hash', '', true);
		update_option('baselayer_site_password_plain', '', true);
	}
	return $enabled;
}

function bl_sanitize_maintenance_mode($value): string
{
	return !empty($value) ? '1' : '';
}

function bl_sanitize_maintenance_title($value): string
{
	$value = is_string($value) ? trim($value) : '';
	return sanitize_text_field($value);
}

function bl_sanitize_maintenance_description($value): string
{
	$value = is_string($value) ? trim($value) : '';
	return sanitize_textarea_field($value);
}

function theme_settings_page(): void
{
	if (!current_user_can('manage_options')) {
		wp_die(esc_html__('You do not have sufficient permissions to access this page.', 'baselayer'));
	}
	if (!bl_theme_settings_has_any_access()) {
		wp_safe_redirect(admin_url('options-general.php'));
		exit;
	}
	$tab = bl_theme_settings_current_tab();
	$available_tabs = bl_theme_settings_available_tabs();

	$bump_notice = get_transient('baselayer_bump_notice');
	if ($bump_notice !== false) {
		delete_transient('baselayer_bump_notice');
	}
	$redirects_saved = get_transient('baselayer_redirects_saved');
	if ($redirects_saved !== false) {
		delete_transient('baselayer_redirects_saved');
	}
	$redirects_htaccess_error = get_transient('baselayer_redirects_htaccess_error');
	if ($redirects_htaccess_error !== false) {
		delete_transient('baselayer_redirects_htaccess_error');
	}
	$css_saved = get_transient('baselayer_css_saved');
	if ($css_saved !== false) {
		delete_transient('baselayer_css_saved');
	}
	$weekly_send_success = get_transient('baselayer_weekly_report_send_success');
	if ($weekly_send_success !== false) {
		delete_transient('baselayer_weekly_report_send_success');
	}
	$weekly_send_error = get_transient('baselayer_weekly_report_send_error');
	if ($weekly_send_error !== false) {
		delete_transient('baselayer_weekly_report_send_error');
	}
	$general_saved = get_transient('baselayer_general_saved');
	if ($general_saved !== false) {
		delete_transient('baselayer_general_saved');
	}
	$blocks_saved = get_transient('baselayer_blocks_saved');
	if ($blocks_saved !== false) {
		delete_transient('baselayer_blocks_saved');
	}
?>
	<div class="wrap">
		<h1><?= esc_html(bl_theme_settings_admin_title($tab)) ?></h1>
		<?php
		$notices = [];
		if ($redirects_saved !== false || $css_saved !== false || $general_saved !== false || $blocks_saved !== false) {
			$notices[] = ['type' => 'success', 'message' => __('Settings saved.', 'baselayer')];
		}
		if ($redirects_htaccess_error === 'writable') {
			$notices[] = ['type' => 'error', 'message' => __('Redirects were saved, but the .htaccess file could not be updated. Check file permissions.', 'baselayer')];
		} elseif ($redirects_htaccess_error === 'unavailable') {
			$notices[] = ['type' => 'error', 'message' => __('Redirects were saved, but Apache .htaccess redirects are not available on this server (not Apache, mod_rewrite missing, or .htaccess not writable). Use redirects.method = wordpress in config/theme.php or fix the server.', 'baselayer')];
		}
		if ($weekly_send_success !== false) {
			$notices[] = ['type' => 'success', 'message' => sprintf(__('Weekly website report sent to %s.', 'baselayer'), (string) $weekly_send_success)];
		}
		if ($weekly_send_error !== false) {
			$notices[] = ['type' => 'error', 'message' => (string) $weekly_send_error];
		}
		foreach ($notices as $notice) :
			$notice_type = ($notice['type'] ?? '') === 'error' ? 'notice-error' : 'notice-success';
			?>
			<div class="notice <?= esc_attr($notice_type) ?> is-dismissible">
				<p><strong><?= esc_html((string) ($notice['message'] ?? '')) ?></strong></p>
			</div>
		<?php endforeach; ?>

		<?php if (!empty($available_tabs)) : ?>
			<nav class="nav-tab-wrapper wp-clearfix" aria-label="Secondary menu">
				<?php foreach ($available_tabs as $slug => $label) : ?>
					<a href="<?= esc_url(bl_theme_settings_url_with_tab($slug)) ?>" class="nav-tab <?= $tab === $slug ? 'nav-tab-active' : '' ?>"><?= esc_html(__($label, 'baselayer')) ?></a>
				<?php endforeach; ?>
			</nav>
		<?php endif; ?>

		<?php if ($tab === 'theme') : ?>
			<?php
			$blogname = (string) get_option('blogname', '');
			$custom_logo_id = (int) get_theme_mod('custom_logo');
			$custom_logo_url = $custom_logo_id > 0 ? wp_get_attachment_image_url($custom_logo_id, 'medium') : '';
			$og_fallback_id = (int) get_option('baselayer_og_image_fallback', 0);
			$og_fallback_url = $og_fallback_id > 0 ? wp_get_attachment_image_url($og_fallback_id, 'medium') : '';
			$feature_image_fallback_id = (int) get_option('baselayer_feature_image_fallback', 0);
			$feature_image_fallback_url = $feature_image_fallback_id > 0 ? wp_get_attachment_image_url($feature_image_fallback_id, 'medium') : '';
			$_weekly_sender = wp_get_current_user();
			$weekly_manual_send_default_email = (isset($_weekly_sender->user_email) && is_email((string) $_weekly_sender->user_email))
				? (string) $_weekly_sender->user_email
				: (function_exists('bl_developer_email') ? bl_developer_email() : '');
			?>
			<form method="post" action="<?= esc_url(bl_theme_settings_url_with_tab('theme')) ?>" class="bl-page-settings-form">
				<?php settings_fields(BL_THEME_OPTION_GROUP_GENERAL); ?>
				<?php
				$bl_show_on_front = get_option('show_on_front');
				$bl_show_on_front = ($bl_show_on_front === 'page') ? 'page' : 'posts';
				?>
				<table class="form-table" style="margin-top: -8px;" role="presentation">
					<tr>
						<th scope="row"><label for="blogname"><?= esc_html__('Website title', 'baselayer') ?></label></th>
						<td>
							<input name="blogname" type="text" id="blogname" value="<?= esc_attr($blogname) ?>" class="regular-text">
							<p class="description"><?= esc_html__('Used in the admin bar, emails, and schema.', 'baselayer') ?></p>
						</td>
					</tr>
					<tr>
						<th scope="row"><?= esc_html(__('Your homepage displays', 'default')) ?></th>
						<td>
							<fieldset class="bl-homepage-display-fieldset">
								<legend class="screen-reader-text"><?= esc_html(__('Your homepage displays', 'default')) ?></legend>
								<p>
									<label>
										<input type="radio" name="show_on_front" id="bl_show_on_front_posts" value="posts" class="tog" <?= checked($bl_show_on_front, 'posts', false) ?>>
										<?= esc_html(__('Your latest posts', 'default')) ?>
									</label>
								</p>
								<p>
									<label>
										<input type="radio" name="show_on_front" id="bl_show_on_front_page" value="page" class="tog" <?= checked($bl_show_on_front, 'page', false) ?>>
										<?= esc_html(__('A static page (select below)', 'baselayer')) ?>
									</label>
								</p>
								<ul id="bl-homepage-static-fields" style="margin: 0 0 0 24px; list-style: none; padding: 0;">
									<li style="margin-bottom: 8px;">
										<label for="page_on_front"><?php echo esc_html(__('Homepage', 'default')); ?>:</label><br>
										<?php
										wp_dropdown_pages([
											'name' => 'page_on_front',
											'id' => 'page_on_front',
											'echo' => 1,
											'show_option_none' => __('– Select –', 'default'),
											'option_none_value' => '0',
											'selected' => (int) get_option('page_on_front'),
										]);
										?>
									</li>
									<li>
										<label for="page_for_posts"><?php echo esc_html(__('Posts page', 'default')); ?>:</label><br>
										<?php
										wp_dropdown_pages([
											'name' => 'page_for_posts',
											'id' => 'page_for_posts',
											'echo' => 1,
											'show_option_none' => __('– Select –', 'default'),
											'option_none_value' => '0',
											'selected' => (int) get_option('page_for_posts'),
										]);
										?>
									</li>
								</ul>
							</fieldset>
						</td>
					</tr>
					<tr>
						<th scope="row">
							<label for="posts_per_page"><?= esc_html__('Posts per page', 'baselayer') ?></label>
						</th>
						<td>
							<?php $posts_per_page_val = max(1, (int) get_option('posts_per_page', 10)); ?>
							<input type="number" name="posts_per_page" id="posts_per_page" value="<?= esc_attr((string) $posts_per_page_val) ?>" min="1" max="999" step="1" class="small-text">
							<p class="description"><?= esc_html__('How many posts appear per page on the blog, archives, and search results.', 'baselayer') ?></p>
						</td>
					</tr>
					<tr>
						<th scope="row">
							<label for="baselayer_excerpt_length"><?= esc_html__('Excerpt length', 'baselayer') ?></label>
						</th>
						<td>
							<?php
							$excerpt_length_opt = get_option('baselayer_excerpt_length', '');
							$excerpt_length_val = $excerpt_length_opt !== '' ? $excerpt_length_opt : '50';
							?>
							<input type="number" name="baselayer_excerpt_length" id="baselayer_excerpt_length" value="<?= esc_attr($excerpt_length_val) ?>" min="1" max="999" step="1" class="small-text">
							<p class="description"><?= esc_html__('Number of words used when trimming excerpts.', 'baselayer') ?></p>
						</td>
					</tr>
					<tr>
						<th scope="row">
							<label for="baselayer_excerpt_more"><?= esc_html__('Excerpt "more" text', 'baselayer') ?></label>
						</th>
						<td>
							<?php
							$excerpt_more_opt = get_option('baselayer_excerpt_more');
							$excerpt_more_val = $excerpt_more_opt !== false ? $excerpt_more_opt : '…';
							?>
							<input type="text" name="baselayer_excerpt_more" id="baselayer_excerpt_more" value="<?= esc_attr($excerpt_more_val) ?>" class="small-text" maxlength="20">
							<p class="description"><?= esc_html__('Text shown after the excerpt when it is truncated (e.g. …). Leave blank for none.', 'baselayer') ?></p>
						</td>
					</tr>
				</table>

				<div class="bl-submit-row">
					<button type="submit" class="button button-primary"><?= esc_html__('Save Changes') ?></button>
				</div>

				<script>
					(function() {
						function blSyncHomepageStaticFields() {
							var posts = document.getElementById('bl_show_on_front_posts');
							var wrap = document.getElementById('bl-homepage-static-fields');
							if (!wrap) return;
							var showStatic = document.getElementById('bl_show_on_front_page');
							wrap.style.display = showStatic && showStatic.checked ? '' : 'none';
						}
						document.querySelectorAll('input[name="show_on_front"]').forEach(function(el) {
							el.addEventListener('change', blSyncHomepageStaticFields);
						});
						blSyncHomepageStaticFields();
					})();
				</script>

				<hr>

				<h2 class="title"><?= esc_html__('Weekly website report', 'baselayer') ?></h2>
				<p class="description" style="margin-bottom: 12px;"><?= esc_html__('Sends a weekly summary with analytics when Matomo is enabled.', 'baselayer') ?></p>
				<table class="form-table" role="presentation">
					<tr>
						<th scope="row"><?= esc_html__('Weekly reports', 'baselayer') ?></th>
						<td>
							<label>
								<input type="hidden" name="baselayer_weekly_report_enabled" value="0">
								<input type="checkbox" name="baselayer_weekly_report_enabled" value="1" <?= checked(get_option('baselayer_weekly_report_enabled', '0'), '1', false) ?>>
								<?= esc_html__('Enable reports', 'baselayer') ?>
							</label>
						</td>
					</tr>
					<?php
					if (function_exists('bl_weekly_report_render_schedule_settings_row')) {
						bl_weekly_report_render_schedule_settings_row();
					}
					?>
					<tr>
						<th scope="row"><label for="baselayer_report_email"><?= esc_html__('Recipents', 'baselayer') ?></label></th>
						<td>
							<textarea name="baselayer_report_email" id="baselayer_report_email" rows="3" class="regular-text"><?= esc_textarea((string) get_option('baselayer_report_email', '')) ?></textarea>
							<p class="description"><?= esc_html__('One email address per line.', 'baselayer') ?></p>
						</td>
					</tr>
					<tr>
						<th scope="row"><?= esc_html__('Send report', 'baselayer') ?></th>
						<td>
							<div style="display:flex; flex-wrap:wrap; align-items:center; gap:8px; max-width:100%;">
								<label for="baselayer_weekly_report_manual_recipient" class="screen-reader-text"><?= esc_html__('Recipient email', 'baselayer') ?></label>
								<input
									type="email"
									name="baselayer_weekly_report_manual_recipient"
									id="baselayer_weekly_report_manual_recipient"
									form="bl-send-weekly-report-to-developer"
									value="<?= esc_attr($weekly_manual_send_default_email) ?>"
									class="regular-text"
									autocomplete="email"
								>
								<button type="submit" form="bl-send-weekly-report-to-developer" class="button"><?= esc_html__('Send report', 'baselayer') ?></button>
							</div>
							<p class="description">
								<?= esc_html__('Sends the current weekly report to provided email address.', 'baselayer') ?>
							</p>
						</td>
					</tr>
				</table>
				<div class="bl-submit-row">
					<button type="submit" class="button button-primary"><?= esc_html__('Save Changes') ?></button>
				</div>

				<hr>

				<h2 class="title"><?= esc_html__('Site logo', 'baselayer') ?></h2>
				<p class="description" style="margin-bottom: 12px;"><?= esc_html__('Shown on the login page instead of the WordPress logo. Also used as the schema.org logo fallback when no schema logo is set.', 'baselayer') ?></p>
				
				<div class="bl-image-picker" style="margin-top: 16px;" data-bl-image-picker>
					<input type="hidden" name="custom_logo" id="custom_logo" value="<?= esc_attr($custom_logo_id) ?>" data-bl-image-picker-input>
					<div class="bl-image-picker-preview" data-bl-image-picker-preview>
						<?php if ($custom_logo_url) : ?>
							<img src="<?= esc_url($custom_logo_url) ?>" alt="">
						<?php endif; ?>
					</div>
					<p style="margin-bottom: 0;">
						<button type="button" class="button" data-bl-image-picker-select><?= esc_html__('Select image', 'baselayer') ?></button>
						<button type="button" class="button" data-bl-image-picker-remove<?= $custom_logo_id <= 0 ? ' style="display:none;"' : '' ?>><?= esc_html__('Remove', 'baselayer') ?></button>
					</p>
				</div>

				<hr>

				<h2 class="title"><?= esc_html__('Fallback OG image', 'baselayer') ?></h2>
				<p class="description"><?= esc_html__('Used as the social preview image (og:image) when a page or post has no SEO image and no featured image.', 'baselayer') ?></p>
				<p class="description" style="margin-bottom: 12px;"><?= esc_html__('Best size: 1200 × 630 px.', 'baselayer') ?></p>

				<div class="bl-image-picker" style="margin-top: 16px;" data-bl-image-picker>
					<input type="hidden" name="baselayer_og_image_fallback" id="baselayer_og_image_fallback" value="<?= esc_attr($og_fallback_id) ?>" data-bl-image-picker-input>
					<div class="bl-image-picker-preview" data-bl-image-picker-preview>
						<?php if ($og_fallback_url) : ?>
							<img src="<?= esc_url($og_fallback_url) ?>" alt="" style="max-width: 240px; height: auto; display: block; border-radius: 3px;">
						<?php endif; ?>
					</div>
					<p style="margin-bottom: 0;">
						<button type="button" class="button" data-bl-image-picker-select><?= esc_html__('Select image', 'baselayer') ?></button>
						<button type="button" class="button" data-bl-image-picker-remove<?= $og_fallback_id <= 0 ? ' style="display:none;"' : '' ?>><?= esc_html__('Remove', 'baselayer') ?></button>
					</p>
				</div>

				<hr>

				<h2 class="title"><?= esc_html__('Fallback featured image', 'baselayer') ?></h2>
				<p class="description"><?= esc_html__('Used as the featured image when a page or post has no featured image set.', 'baselayer') ?></p>
				<p class="description" style="margin-bottom: 12px;"><?= esc_html__('Best size: 2400 × 2400 px.', 'baselayer') ?></p>

				<div class="bl-image-picker" style="margin-top: 16px;" data-bl-image-picker>
					<input type="hidden" name="baselayer_feature_image_fallback" id="baselayer_feature_image_fallback" value="<?= esc_attr($feature_image_fallback_id) ?>" data-bl-image-picker-input>
					<div class="bl-image-picker-preview" data-bl-image-picker-preview>
						<?php if ($feature_image_fallback_url) : ?>
							<img src="<?= esc_url($feature_image_fallback_url) ?>" alt="" style="max-width: 240px; height: auto; display: block; border-radius: 3px;">
						<?php endif; ?>
					</div>
					<p style="margin-bottom: 0;">
						<button type="button" class="button" data-bl-image-picker-select><?= esc_html__('Select image', 'baselayer') ?></button>
						<button type="button" class="button" data-bl-image-picker-remove<?= $feature_image_fallback_id <= 0 ? ' style="display:none;"' : '' ?>><?= esc_html__('Remove', 'baselayer') ?></button>
					</p>
				</div>

				<hr>

				<div class="bl-submit-row">
					<button type="submit" class="button button-primary"><?= esc_html__('Save Changes') ?></button>
				</div>
			</form>
			<form method="post" action="<?= esc_url(bl_theme_settings_url_with_tab('theme')) ?>" id="bl-send-weekly-report-to-developer" style="display:none;">
				<?php wp_nonce_field('baselayer_send_weekly_report_to_developer'); ?>
				<input type="hidden" name="baselayer_send_weekly_report_to_developer" value="1">
			</form>
		<?php elseif ($tab === 'blocks') : ?>
			<?php bl_render_theme_settings_blocks_tab(); ?>
		<?php elseif ($tab === 'redirects') : ?>
			<?php
			$redirects_raw = get_option('bl_redirects', []);
			$redirects_list = [];
			foreach ($redirects_raw as $from => $item) {
				$redirects_list[] = [
					'from' => $from,
					'to' => is_array($item) ? ($item['to'] ?? '') : (string) $item,
					'code' => is_array($item) ? (int) ($item['code'] ?? 301) : 301,
				];
			}
			?>
			<form method="post" action="<?= esc_url(bl_theme_settings_url_with_tab('redirects')) ?>" class="bl-page-settings-form" id="bl-redirects-form">
				<?php wp_nonce_field('baselayer_save_redirects'); ?>
				<input type="hidden" name="baselayer_save_redirects" value="1">
				<input type="hidden" name="page" value="bl-theme-settings">
				<input type="hidden" name="<?= esc_attr(BL_THEME_SETTINGS_TAB_QUERY_VAR) ?>" value="redirects">
				<?php
				$redirect_method = function_exists('bl_config_redirects') ? bl_config_redirects('method') : 'wordpress';
				if ($redirect_method === 'htaccess') : ?>
					<?php if (function_exists('bl_can_use_htaccess_redirects') && !bl_can_use_htaccess_redirects()) : ?>
						<div class="notice notice-warning inline">
							<p><?= esc_html__('This server does not support .htaccess redirects. Redirects will not work unless Apache with mod_rewrite and a writable .htaccess file are available – or redirects.method is set to wordpress in config/theme.php.', 'baselayer') ?></p>
						</div>
					<?php endif; ?>
				<?php elseif (
					function_exists('bl_can_use_htaccess_redirects') && bl_can_use_htaccess_redirects() &&
					function_exists('bl_is_developer_user') && bl_is_developer_user((int) get_current_user_id())
				) : ?>
					<div class="notice notice-info inline">
						<p><?= esc_html__('You are running Apache. For better performance, you can set the redirect method to htaccess in config/theme.php under redirects.', 'baselayer') ?></p>
					</div>
				<?php endif; ?>
				<h2 class="title"><?= esc_html__('Redirects', 'baselayer') ?></h2>
				<p class="description"><?= esc_html__('Enter paths without the domain (e.g. /old-path).', 'baselayer') ?></p>
				<p class="description"><?= esc_html__('The source URL represents the requested path.', 'baselayer') ?></p>
				<p class="description" style="margin-bottom: 12px;"><?= esc_html__('The target URL can be an internal path or a full URL.', 'baselayer') ?></p>
				<table class="wp-list-table widefat fixed striped" id="bl-redirects-table" style="width: auto;">
					<thead>
						<tr>
							<th scope="col" class="column-from" style="width: 50%;"><?= esc_html__('From URL', 'baselayer') ?></th>
							<th scope="col" class="column-to" style="width: 50%;"><?= esc_html__('To URL', 'baselayer') ?></th>
							<th scope="col" class="column-code"><?= esc_html__('Code', 'baselayer') ?></th>
							<th scope="col" class="column-delete"></th>
						</tr>
					</thead>
					<tbody>
						<?php foreach ($redirects_list as $i => $r) : ?>
							<tr class="bl-redirect-row">
								<td><input type="text" name="bl_redirects[<?= (int) $i ?>][from]" value="<?= esc_attr($r['from']) ?>" class="regular-text" style="width: 100%;" placeholder="<?= esc_attr__('/old-path', 'baselayer') ?>"></td>
								<td><input type="text" name="bl_redirects[<?= (int) $i ?>][to]" value="<?= esc_attr($r['to']) ?>" class="regular-text" style="width: 100%;" placeholder="<?= esc_attr__('/new-path', 'baselayer') ?>"></td>
								<td>
									<select name="bl_redirects[<?= (int) $i ?>][code]">
										<option value="301" <?= selected($r['code'], 301, false) ?>><?= esc_html__('301 (Permanent)', 'baselayer') ?></option>
										<option value="302" <?= selected($r['code'], 302, false) ?>><?= esc_html__('302 (Temporary)', 'baselayer') ?></option>
									</select>
								</td>
								<td><button type="button" class="button bl-redirect-remove"><?= esc_html__('Remove', 'baselayer') ?></button></td>
							</tr>
						<?php endforeach; ?>
						<tr class="bl-redirect-row bl-redirect-template" style="display: none;">
							<td><input type="text" name="bl_redirects[__i__][from]" value="" class="regular-text" style="width: 100%;" placeholder="<?= esc_attr__('/old-path', 'baselayer') ?>" disabled></td>
							<td><input type="text" name="bl_redirects[__i__][to]" value="" class="regular-text" style="width: 100%;" placeholder="<?= esc_attr__('/new-path', 'baselayer') ?>" disabled></td>
							<td><select name="bl_redirects[__i__][code]" disabled>
									<option value="301"><?= esc_html__('301 (Permanent)', 'baselayer') ?></option>
									<option value="302"><?= esc_html__('302 (Temporary)', 'baselayer') ?></option>
								</select></td>
							<td><button type="button" class="button bl-redirect-remove"><?= esc_html__('Remove', 'baselayer') ?></button></td>
						</tr>
					</tbody>
				</table>
				<p style="margin-top: 12px;">
					<button type="button" class="button" id="bl-redirect-add"><?= esc_html__('Add redirect', 'baselayer') ?></button>
				</p>
				<div class="bl-submit-row">
					<button type="submit" class="button button-primary"><?= esc_html__('Save Changes') ?></button>
				</div>
			</form>
			<script>
				(function() {
					var form = document.getElementById('bl-redirects-form');
					if (!form) return;
					var tbody = form.querySelector('#bl-redirects-table tbody');
					var template = form.querySelector('.bl-redirect-template');
					var index = tbody.querySelectorAll('.bl-redirect-row:not(.bl-redirect-template)').length;
					form.querySelector('#bl-redirect-add').addEventListener('click', function() {
						var tr = template.cloneNode(true);
						tr.classList.remove('bl-redirect-template');
						tr.style.display = '';
						tr.querySelectorAll('[name]').forEach(function(inp) {
							inp.name = inp.name.replace(/__i__/g, index);
							inp.removeAttribute('disabled');
						});
						tbody.insertBefore(tr, template);
						index++;
					});
					tbody.addEventListener('click', function(e) {
						if (e.target.classList.contains('bl-redirect-remove')) {
							e.target.closest('tr').remove();
						}
					});
				})();
			</script>
		<?php elseif ($tab === 'css') : ?>
			<form method="post" action="<?= esc_url(bl_theme_settings_url_with_tab('css')) ?>" class="bl-page-settings-form">
				<?php wp_nonce_field('baselayer_save_css'); ?>
				<input type="hidden" name="baselayer_save_css" value="1">
				<h2 class="title"><?= esc_html__('Custom CSS', 'baselayer') ?></h2>
				<p class="description"><?= esc_html__('Custom CSS runs last and overrides theme styles.', 'baselayer') ?></p>
				<p class="description">
					<?php
					echo wp_kses(
						sprintf(
							/* translators: %s: example CSS variable usage (wrapped in code.bl-code-small). */
							__('All CSS variables are available, e.g. %s:', 'baselayer'),
							'<code class="bl-code-small">' . esc_html('var(--bl-color-primary)') . '</code>'
						),
						[
							'code' => ['class' => true],
						]
					);
					?>
					<button type="button" class="button-link bl-css-vars-overview-open" id="bl-css-vars-overview-open" aria-haspopup="dialog" aria-controls="bl-css-vars-overview-modal"><?= esc_html__('Variable overview', 'baselayer') ?></button>
				</p>
				<table class="form-table" style="margin-top: 24px;" role="presentation">
					<tr>
						<td colspan="2" style="padding: 0;">
							<div class="bl-custom-css-editor-wrap">
								<label for="baselayer_custom_css" class="screen-reader-text"><?= esc_html__('Custom CSS', 'baselayer') ?></label>
								<textarea name="baselayer_custom_css" id="baselayer_custom_css" rows="16" class="large-text code" style="width: 100%; font-family: Consolas, Monaco, monospace;"><?= esc_textarea(get_option('baselayer_custom_css', '')) ?></textarea>
							</div>
						</td>
					</tr>
				</table>
				<div class="bl-submit-row">
					<button type="submit" class="button button-primary"><?= esc_html__('Save Changes') ?></button>
				</div>
			</form>
			<?php
			$bl_variables_root_preview = function_exists('bl_variables_compiled_root_block')
				? bl_variables_compiled_root_block()
				: (function_exists('bl_variables_scss_root_block') ? bl_variables_scss_root_block() : '');
			?>
			<div id="bl-css-vars-overview-modal" class="bl-css-vars-overview-modal" aria-hidden="true">
				<div class="bl-css-vars-overview-backdrop" data-bl-css-vars-overview-close tabindex="-1"></div>
				<div class="bl-css-vars-overview-dialog" role="dialog" aria-modal="true" aria-labelledby="bl-css-vars-overview-title" tabindex="-1">
					<h2 id="bl-css-vars-overview-title" class="bl-css-vars-overview-title"><?= esc_html__('CSS variables', 'baselayer') ?></h2>
					<?php if ($bl_variables_root_preview !== '') : ?>
						<div class="bl-css-vars-overview-editor-wrap">
							<textarea id="bl-css-vars-overview-code" readonly rows="14" class="large-text code" autocomplete="off"><?= esc_textarea($bl_variables_root_preview) ?></textarea>
						</div>
					<?php else : ?>
						<p class="bl-css-vars-overview-empty"><?= esc_html__('Could not read CSS variables from the loaded theme styles.', 'baselayer') ?></p>
					<?php endif; ?>
					<p class="bl-css-vars-overview-actions">
						<button type="button" class="button button-primary" data-bl-css-vars-overview-close><?= esc_html__('Close', 'baselayer') ?></button>
					</p>
				</div>
			</div>
			<script>
				(function() {
					var modal = document.getElementById('bl-css-vars-overview-modal');
					var openBtn = document.getElementById('bl-css-vars-overview-open');
					var textarea = document.getElementById('bl-css-vars-overview-code');
					if (!modal || !openBtn || !textarea) return;
					var dialog = modal.querySelector('.bl-css-vars-overview-dialog');
					var overviewEditor = null;

					function ensureVariablesOverviewEditor() {
						if (overviewEditor && overviewEditor.codemirror) {
							overviewEditor.codemirror.refresh();
							return;
						}
						if (!window.wp || !window.wp.codeEditor || !window.blCssVarsOverviewEditorSettings) {
							return;
						}
						overviewEditor = window.wp.codeEditor.initialize('bl-css-vars-overview-code', window.blCssVarsOverviewEditorSettings);
						if (overviewEditor && overviewEditor.codemirror) {
							window.setTimeout(function() {
								overviewEditor.codemirror.refresh();
							}, 0);
						}
					}

					function openModal() {
						modal.classList.add('is-open');
						modal.setAttribute('aria-hidden', 'false');
						document.body.classList.add('bl-css-vars-overview-modal-active');
						if (dialog) {
							dialog.focus();
						}
						ensureVariablesOverviewEditor();
						if (overviewEditor && overviewEditor.codemirror) {
							window.setTimeout(function() {
								overviewEditor.codemirror.refresh();
							}, 100);
						}
					}
					function closeModal() {
						modal.classList.remove('is-open');
						modal.setAttribute('aria-hidden', 'true');
						document.body.classList.remove('bl-css-vars-overview-modal-active');
						openBtn.focus();
					}
					openBtn.addEventListener('click', function(e) {
						e.preventDefault();
						openModal();
					});
					modal.querySelectorAll('[data-bl-css-vars-overview-close]').forEach(function(el) {
						el.addEventListener('click', closeModal);
					});
					document.addEventListener('keydown', function(e) {
						if (e.key === 'Escape' && modal.classList.contains('is-open')) {
							closeModal();
						}
					});
				})();
			</script>
		<?php endif; ?>
	</div>
<?php
}


/**
 * Whether the current user has access to at least one Theme settings tab (for menu visibility).
 * When all Theme settings tabs are disabled in User rights for that role, the menu is hidden.
 */
function bl_theme_settings_has_any_access(): bool
{
	if (!function_exists('bl_admin_can_access')) {
		return true;
	}
	foreach (array_values(BL_THEME_SETTINGS_TAB_ACCESS) as $key) {
		if (bl_admin_can_access($key)) {
			return true;
		}
	}
	return false;
}

function add_theme_settings_menu_item(): void
{
	if (!current_user_can('manage_options')) {
		return;
	}
	if (!bl_theme_settings_has_any_access()) {
		return;
	}
	add_submenu_page(
		'options-general.php',
		__('Theme settings', 'baselayer'),
		__('Theme', 'baselayer'),
		'manage_options',
		'bl-theme-settings',
		'theme_settings_page',
		0
	);
}
add_action('admin_menu', 'add_theme_settings_menu_item', 1);

add_action('load-settings_page_bl-theme-settings', static function (): void {
	global $title;
	$title = bl_theme_settings_admin_title(bl_theme_settings_current_tab());
});

add_filter('submenu_file', function ($submenu_file, $parent_file) {
	if ($parent_file === 'options-general.php' && isset($_GET['page']) && $_GET['page'] === 'bl-theme-settings') {
		return 'bl-theme-settings';
	}
	return $submenu_file;
}, 10, 2);
