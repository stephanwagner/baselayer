<?php

defined('ABSPATH') || exit;

$bl_developer_tab = 'system';
$bl_developer_page_slug = bl_developer_settings_page_slug($bl_developer_tab);

function bl_developer_redis_safeguard_file_path(): string
{
	$stylesheet_dir = trailingslashit(get_stylesheet_directory());
	$preferred = $stylesheet_dir . 'includes/baselayer-redis-safeguard.php';
	if (is_readable($preferred)) {
		return $preferred;
	}

	// Legacy child-theme path before includes/ rename.
	$legacy = $stylesheet_dir . 'inc/baselayer-redis-safeguard.php';
	if (is_readable($legacy)) {
		return $legacy;
	}

	return $preferred;
}

function bl_developer_redis_safeguard_wpconfig_path(): string
{
	return trailingslashit(ABSPATH) . 'wp-config.php';
}

function bl_developer_redis_safeguard_block(): string
{
	$stylesheet = sanitize_key((string) get_option('stylesheet', 'baselayer'));
	if ($stylesheet === '') {
		$stylesheet = 'baselayer';
	}
	$relative_path = '/wp-content/themes/' . $stylesheet . '/includes/baselayer-redis-safeguard.php';
	return implode("\n", [
		'// BEGIN BaseLayer Redis safeguard',
		'if (!defined(\'WP_REDIS_DISABLE_COMMENT\')) {',
		"\tdefine('WP_REDIS_DISABLE_COMMENT', true);",
		'}',
		'$bl_redis_safeguard = __DIR__ . \'' . $relative_path . '\';',
		'if (file_exists($bl_redis_safeguard)) {',
		"\trequire_once \$bl_redis_safeguard;",
		'}',
		'// END BaseLayer Redis safeguard',
	]) . "\n\n";
}

function bl_developer_redis_safeguard_is_installed(): bool
{
	$file_path = bl_developer_redis_safeguard_file_path();
	$wp_config_path = bl_developer_redis_safeguard_wpconfig_path();
	if (!is_file($file_path) || !is_readable($wp_config_path)) {
		return false;
	}
	$wp_config = file_get_contents($wp_config_path);
	if ($wp_config === false) {
		return false;
	}
	return strpos($wp_config, '// BEGIN BaseLayer Redis safeguard') !== false
		&& strpos($wp_config, '// END BaseLayer Redis safeguard') !== false;
}

const BL_LATEST_PHP_VERSION_HOOK = 'baselayer_refresh_latest_php_version';

/**
 * Fetch latest stable PHP version from upstream releases.
 * Returns empty string when unavailable.
 */
function bl_fetch_latest_stable_php_version(): string
{
	if (!function_exists('wp_remote_get')) {
		return '';
	}
	$resp = wp_remote_get('https://api.github.com/repos/php/php-src/releases?per_page=100', [
		'timeout' => 8,
		'headers' => [
			'Accept' => 'application/vnd.github+json',
			'User-Agent' => 'baselayer-php-version-check',
		],
	]);
	if (is_wp_error($resp)) {
		return '';
	}
	$data = json_decode(wp_remote_retrieve_body($resp), true);
	if (!is_array($data)) {
		return '';
	}
	$best = null;
	foreach ($data as $release) {
		$tag_name = isset($release['tag_name']) ? (string) $release['tag_name'] : '';
		if ($tag_name === '' || !empty($release['prerelease']) || !empty($release['draft'])) {
			continue;
		}
		if (preg_match('/(\d+\.\d+\.\d+)/', $tag_name, $m) !== 1) {
			continue;
		}
		$version = (string) $m[1];
		if ($best === null || version_compare($version, (string) $best, '>')) {
			$best = $version;
		}
	}
	return is_string($best) ? $best : '';
}

add_action(BL_LATEST_PHP_VERSION_HOOK, function (): void {
	$version = bl_fetch_latest_stable_php_version();
	set_transient('bl_latest_stable_php_version', $version, 24 * HOUR_IN_SECONDS * 7 * 2);
});

/**
 * Schedule PHP version metadata refresh in background.
 */
function bl_schedule_latest_php_version_refresh(): void
{
	if (get_transient('bl_latest_stable_php_version') !== false) {
		return;
	}
	if (wp_next_scheduled(BL_LATEST_PHP_VERSION_HOOK)) {
		return;
	}
	wp_schedule_single_event(time() + 1, BL_LATEST_PHP_VERSION_HOOK);
}

function bl_developer_redis_enabled(): bool
{
	return function_exists('bl_config_redis_enabled') && bl_config_redis_enabled();
}

function bl_developer_redis_safeguard_install(): array
{
	$file_path = bl_developer_redis_safeguard_file_path();
	$wp_config_path = bl_developer_redis_safeguard_wpconfig_path();
	$block = bl_developer_redis_safeguard_block();

	if (!is_file($file_path) || !is_readable($file_path)) {
		return ['ok' => false, 'message' => __('Safeguard file is missing in theme /includes folder.', 'baselayer')];
	}
	if (!is_file($wp_config_path) || !is_readable($wp_config_path) || !is_writable($wp_config_path)) {
		return ['ok' => false, 'message' => __('Cannot update wp-config.php for Redis safeguard.', 'baselayer')];
	}

	$wp_config = file_get_contents($wp_config_path);
	if ($wp_config === false) {
		return ['ok' => false, 'message' => __('Failed to read wp-config.php.', 'baselayer')];
	}
	if (strpos($wp_config, '// BEGIN BaseLayer Redis safeguard') === false) {
		$needle = "/* That's all, stop editing! Happy publishing. */";
		if (strpos($wp_config, $needle) !== false) {
			$wp_config = str_replace($needle, "\n" . $block . "\n" . $needle, $wp_config);
		} else {
			$wp_config .= "\n" . $block;
		}
	} else {
		$wp_config = (string) preg_replace(
			'/\/\/ BEGIN BaseLayer Redis safeguard.*?\/\/ END BaseLayer Redis safeguard\s*/s',
			$block,
			$wp_config
		);
	}
	if (file_put_contents($wp_config_path, $wp_config) === false) {
		return ['ok' => false, 'message' => __('Failed to write Redis safeguard include to wp-config.php.', 'baselayer')];
	}

	return ['ok' => true, 'message' => __('Redis safeguard installed.', 'baselayer')];
}

add_action('admin_menu', function () use ($bl_developer_tab, $bl_developer_page_slug) {
	if (!current_user_can('manage_options')) {
		return;
	}
	if (!function_exists('bl_is_developer_user') || !bl_is_developer_user((int) get_current_user_id())) {
		return;
	}
	$tabs = bl_developer_settings_available_tabs();
	if (!isset($tabs[$bl_developer_tab])) {
		return;
	}
	$label = $tabs[$bl_developer_tab]['label'];
	add_submenu_page(
		'options-general.php',
		__('Developer settings', 'baselayer') . ' – ' . $label,
		__('Developer', 'baselayer'),
		'manage_options',
		$bl_developer_page_slug,
		'bl_render_developer_system',
		bl_developer_tab_position($bl_developer_tab)
	);
}, 20);

// phpinfo() in new window (must run before any output).
add_action(bl_developer_settings_load_hook($bl_developer_page_slug), function (): void {
	if (!current_user_can('manage_options')) {
		return;
	}
	if (function_exists('bl_is_developer_user') && !bl_is_developer_user((int) get_current_user_id())) {
		return;
	}
	if (!empty($_GET['phpinfo']) && $_GET['phpinfo'] === '1') {
		phpinfo();
		exit;
	}
}, 1);

add_action('admin_init', function () use ($bl_developer_page_slug) {
	global $pagenow;
	if ($pagenow !== 'options-general.php' || $_SERVER['REQUEST_METHOD'] !== 'POST') {
		return;
	}
	if ((isset($_GET['page']) ? $_GET['page'] : '') !== $bl_developer_page_slug) {
		return;
	}
	if (!current_user_can('manage_options') || !function_exists('bl_is_developer_user') || !bl_is_developer_user((int) get_current_user_id())) {
		return;
	}
	$url = admin_url('options-general.php?page=' . bl_developer_settings_page_slug('system'));

	// Redis safeguard install (manual action).
	if (bl_developer_redis_enabled() && !empty($_POST['baselayer_install_redis_safeguard']) && !empty($_POST['_wpnonce']) && wp_verify_nonce($_POST['_wpnonce'], 'baselayer_install_redis_safeguard')) {
		$result = bl_developer_redis_safeguard_install();
		set_transient('baselayer_redis_safeguard_notice', $result, 30);
		wp_safe_redirect($url);
		exit;
	}

	// Performance settings
	if (!empty($_POST['baselayer_save_perf']) && !empty($_POST['_wpnonce']) && wp_verify_nonce($_POST['_wpnonce'], 'baselayer_perf')) {
		$on = isset($_POST['baselayer_perf_admin_bar']) && $_POST['baselayer_perf_admin_bar'] === '1';
		update_option('baselayer_perf_admin_bar', $on ? '1' : '0');

		$guest_on = isset($_POST['baselayer_perf_panel_guest']) && $_POST['baselayer_perf_panel_guest'] === '1';
		update_option('baselayer_perf_panel_guest', $guest_on ? '1' : '0');
		$raw = isset($_POST['baselayer_perf_panel_guest_ips']) ? sanitize_text_field(wp_unslash($_POST['baselayer_perf_panel_guest_ips'])) : '';
		$ips = array_filter(array_map('trim', explode(',', $raw)));
		$ips = array_filter($ips, static function ($ip) {
			return filter_var($ip, FILTER_VALIDATE_IP) !== false;
		});
		update_option('baselayer_perf_panel_guest_ips', implode(', ', $ips));
		if (bl_developer_redis_enabled()) {
			$redis_guard_result = bl_developer_redis_safeguard_install();
			if (is_array($redis_guard_result) && empty($redis_guard_result['ok'])) {
				set_transient('baselayer_redis_safeguard_notice', $redis_guard_result, 30);
			}
		}
		set_transient('baselayer_perf_admin_bar_saved', '1', 30);
		wp_safe_redirect($url);
		exit;
	}

	// Profile picture mode (upload vs Gravatar)
	if (!empty($_POST['baselayer_save_profile_picture_mode']) && !empty($_POST['_wpnonce']) && wp_verify_nonce($_POST['_wpnonce'], 'baselayer_profile_picture_mode')) {
		$default = defined('BL_PROFILE_PICTURE_MODE_DEFAULT') ? BL_PROFILE_PICTURE_MODE_DEFAULT : 'upload';
		$mode = isset($_POST['baselayer_profile_picture_mode']) ? sanitize_key((string) wp_unslash($_POST['baselayer_profile_picture_mode'])) : $default;
		update_option('baselayer_profile_picture_mode', $mode === 'gravatar' ? 'gravatar' : $default);
		set_transient('baselayer_system_saved', '1', 30);
		wp_safe_redirect($url);
		exit;
	}

	// Search engine visibility (blog_public)
	if (!empty($_POST['baselayer_save_search_visibility']) && !empty($_POST['_wpnonce']) && wp_verify_nonce($_POST['_wpnonce'], 'baselayer_system_search_visibility')) {
		$discourage = !empty($_POST['blog_public_discourage']);
		update_option('blog_public', $discourage ? '0' : '1');
		set_transient('baselayer_system_saved', '1', 30);
		wp_safe_redirect($url);
		exit;
	}

	// Matomo settings
	if (!empty($_POST['baselayer_save_matomo']) && !empty($_POST['_wpnonce']) && wp_verify_nonce($_POST['_wpnonce'], 'baselayer_system_matomo')) {
		$matomo_url = isset($_POST['baselayer_matomo_url']) ? esc_url_raw(trim((string) wp_unslash($_POST['baselayer_matomo_url']))) : '';
		$site_id = isset($_POST['baselayer_matomo_site_id']) ? (int) $_POST['baselayer_matomo_site_id'] : 1;
		$token = isset($_POST['baselayer_matomo_token_auth']) ? sanitize_text_field((string) wp_unslash($_POST['baselayer_matomo_token_auth'])) : '';
		$custom_js = isset($_POST['baselayer_matomo_custom_js']) ? trim((string) wp_unslash($_POST['baselayer_matomo_custom_js'])) : '';

		update_option('baselayer_matomo_url', $matomo_url);
		update_option('baselayer_matomo_site_id', max(1, $site_id));
		update_option('baselayer_matomo_token_auth', $token);
		update_option('baselayer_matomo_custom_js', $custom_js);

		set_transient('baselayer_system_saved', '1', 30);
		wp_safe_redirect($url);
		exit;
	}

	// Email (addresses, delivery, test) — formerly Developer › Email tab
	if (!empty($_POST['option_page']) && $_POST['option_page'] === BL_THEME_OPTION_GROUP_DEVELOPER_GENERAL && !empty($_POST['_wpnonce']) && wp_verify_nonce($_POST['_wpnonce'], BL_THEME_OPTION_GROUP_DEVELOPER_GENERAL . '-options')) {
		$admin_email = isset($_POST['admin_email']) ? sanitize_email(wp_unslash($_POST['admin_email'])) : '';
		if (is_email($admin_email)) {
			add_filter('send_site_admin_email_change_email', '__return_false', 10, 3);
			update_option('admin_email', $admin_email);
			remove_filter('send_site_admin_email_change_email', '__return_false', 10);
		}
		$developer_email = isset($_POST['baselayer_developer_email']) ? sanitize_email(wp_unslash($_POST['baselayer_developer_email'])) : '';
		update_option('baselayer_developer_email', is_email($developer_email) ? $developer_email : '');
		set_transient('baselayer_email_saved', '1', 30);
		wp_safe_redirect($url);
		exit;
	}

	if (!empty($_POST['baselayer_save_mail_delivery']) && !empty($_POST['_wpnonce']) && wp_verify_nonce($_POST['_wpnonce'], 'baselayer_system_mail_delivery')) {
		$from_email = isset($_POST['baselayer_email_from']) ? sanitize_email(wp_unslash($_POST['baselayer_email_from'])) : '';
		update_option('baselayer_email_from', is_email($from_email) ? $from_email : '');
		update_option('baselayer_email_from_name', sanitize_text_field(wp_unslash($_POST['baselayer_email_from_name'] ?? '')));

		$mailer = isset($_POST['baselayer_mailer']) && in_array($_POST['baselayer_mailer'], ['php', 'smtp', 'sendgrid'], true) ? $_POST['baselayer_mailer'] : 'php';
		update_option('baselayer_mailer', $mailer);

		if ($mailer === 'smtp') {
			update_option('baselayer_smtp_host', sanitize_text_field(wp_unslash($_POST['baselayer_smtp_host'] ?? '')));
			$port = absint($_POST['baselayer_smtp_port'] ?? 587);
			update_option('baselayer_smtp_port', $port > 0 && $port <= 65535 ? $port : 587);
			$enc = isset($_POST['baselayer_smtp_encryption']) && in_array($_POST['baselayer_smtp_encryption'], ['none', 'tls', 'ssl'], true) ? $_POST['baselayer_smtp_encryption'] : 'tls';
			update_option('baselayer_smtp_encryption', $enc);
			update_option('baselayer_smtp_user', sanitize_text_field(wp_unslash($_POST['baselayer_smtp_user'] ?? '')));
			$smtp_pass = isset($_POST['baselayer_smtp_pass']) ? wp_unslash($_POST['baselayer_smtp_pass']) : '';
			if ($smtp_pass !== '') {
				update_option('baselayer_smtp_pass', $smtp_pass);
			}
		}

		if ($mailer === 'sendgrid') {
			update_option('baselayer_sendgrid_api_key', sanitize_text_field(wp_unslash($_POST['baselayer_sendgrid_api_key'] ?? '')));
		}

		set_transient('baselayer_email_saved', '1', 30);
		wp_safe_redirect($url);
		exit;
	}

	if (!empty($_POST['baselayer_send_test_mail']) && !empty($_POST['_wpnonce']) && wp_verify_nonce($_POST['_wpnonce'], 'baselayer_system_test_mail')) {
		$to = isset($_POST['baselayer_test_mail_to']) ? sanitize_email(wp_unslash($_POST['baselayer_test_mail_to'])) : '';

		if ($to === '' && function_exists('bl_developer_email')) {
			$to = bl_developer_email();
		}

		if (!is_email($to)) {
			set_transient('baselayer_email_test_mail_error', __('Please enter a valid email address before sending a test.', 'baselayer'), 30);
			wp_safe_redirect($url);
			exit;
		}
		$site_name = get_bloginfo('name');
		$sent_at = wp_date(get_option('date_format') . ' ' . get_option('time_format'));
		$test_title = __('Test email', 'baselayer');
		$body = bl_compose_email_document('test-mail', [
			'site_name' => $site_name,
			'to_email' => $to,
			'sent_at' => $sent_at,
			'email_page_title' => $test_title,
			'email_html_lang' => str_replace('_', '-', determine_locale()),
			'email_footer_html' => esc_html__('This email was sent to verify your mail delivery settings.', 'baselayer'),
		]);
		if ($body === '') {
			set_transient('baselayer_email_test_mail_error', __('Test email template could not be loaded.', 'baselayer'), 30);
			wp_safe_redirect($url);
			exit;
		}
		$subject = sprintf(/* translators: %s: site name */ __('Test email from %s', 'baselayer'), $site_name);
		$headers = ['Content-Type: text/html; charset=UTF-8'];

		$bl_test_mail_error_detail = null;
		$capture = function ($wp_error) use (&$bl_test_mail_error_detail) {
			if ($wp_error instanceof WP_Error) {
				$msgs = $wp_error->get_error_messages();
				$bl_test_mail_error_detail = implode(' ', $msgs);
			}
		};
		add_action('wp_mail_failed', $capture, 10, 1);

		$sent = wp_mail($to, $subject, $body, $headers);

		remove_action('wp_mail_failed', $capture, 10);

		if ($sent) {
			set_transient('baselayer_email_test_mail_success', $to, 30);
		} else {
			$base = __('The test email could not be sent.', 'baselayer');
			if ($bl_test_mail_error_detail !== null && $bl_test_mail_error_detail !== '') {
				$base .= ' ' . sprintf(/* translators: %s: error detail from mailer */ __('Reason: %s', 'baselayer'), $bl_test_mail_error_detail);
			} else {
				$base .= ' ' . __('Check your mail delivery settings or try SMTP / SendGrid.', 'baselayer');
			}
			set_transient('baselayer_email_test_mail_error', $base, 30);
		}
		wp_safe_redirect($url);
		exit;
	}
}, 1);

/**
 * PHP / server summary (Developer tab and optionally reused elsewhere).
 */
function bl_developer_render_system_info_panel(): void
{
	$bl_system_status = static function (bool $check, string $label): string {
		$check_icon = '<svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentColor"><path d="m389-369 299-299q11-11 25.5-11t25.5 11q11 11 11 25.5T739-617L415-292q-11 11-25.5 11T364-292L221-435q-11-11-11-25.5t11-25.5q11-11 25.5-11t25.5 11l117 117Z"/></svg>';
		$cross_icon = '<svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentColor"><path d="M480-429 316-265q-11 11-25 10.5T266-266q-11-11-11-25.5t11-25.5l163-163-164-164q-11-11-10.5-25.5T266-695q11-11 25.5-11t25.5 11l163 164 164-164q11-11 25.5-11t25.5 11q11 11 11 25.5T695-644L531-480l164 164q11 11 11 25t-11 25q-11 11-25.5 11T644-266L480-429Z"/></svg>';
		$label = esc_html($label);
		return '<span class="bl-system-status-icon-wrap">' . ($check ? $check_icon : $cross_icon) . '<span class="bl-system-status-icon-label">' . $label . '</span></span>';
	};

	$opcache_ext_loaded = extension_loaded('Zend OPcache') || extension_loaded('opcache');
	$opcache_enable_read = $opcache_ext_loaded ? ini_get('opcache.enable') : null;
	$opcache_ini_is_one = $opcache_ext_loaded
		&& (string) (is_scalar($opcache_enable_read) ? trim((string) $opcache_enable_read) : '') === '1';

	$xdebug_on = bl_developer_perf_xdebug_enabled();
	$memory_limit = ini_get('memory_limit');
	$db_server = function_exists('bl_developer_perf_db_server') ? bl_developer_perf_db_server() : null;
	$upload_max = ini_get('upload_max_filesize');
	$post_max = ini_get('post_max_size');
	$system_url = admin_url('options-general.php?page=' . bl_developer_settings_page_slug('system'));

	$bl_parse_bytes = function ($value): ?int {
		if ($value === false || $value === null) {
			return null;
		}
		$value = trim((string) $value);
		if ($value === '' || $value === '-1') {
			return null;
		}
		if (preg_match('/^(\d+(?:\.\d+)?)\s*([KMG])$/i', $value, $m) !== 1) {
			return null;
		}
		$amount = (float) $m[1];
		$unit = strtoupper($m[2]);
		$multiplier = match ($unit) {
			'K' => 1024,
			'M' => 1024 * 1024,
			'G' => 1024 * 1024 * 1024,
			default => 1,
		};
		return (int) floor($amount * $multiplier);
	};

	$bl_render_warning = function (?string $message): string {
		if ($message === null || $message === '') {
			return '';
		}

		$warning_label = esc_html(__('Warning:', 'baselayer'));
		$warning_text = esc_html($message);

		return '<div class="bl-warning-wrap">'
			. '<span class="bl-warning-label">' . $warning_label . '</span>'
			. ' '
			. '<span class="bl-warning-text">' . $warning_text . '</span>'
			. '</div>';
	};

	$bl_latest_php_major = 8;
	$bl_latest_php_minor = 5;

	$bl_latest_php_version = get_transient('bl_latest_stable_php_version');
	if ($bl_latest_php_version === false) {
		bl_schedule_latest_php_version_refresh();
		$bl_latest_php_version = '';
	}

	if (is_string($bl_latest_php_version) && $bl_latest_php_version !== '' && preg_match('/^(\d+)\.(\d+)\./', $bl_latest_php_version, $m) === 1) {
		$bl_latest_php_major = (int) $m[1];
		$bl_latest_php_minor = (int) $m[2];
	}

	$bl_php_min_minor = max(0, $bl_latest_php_minor - 2);
	$php_parts = explode('.', PHP_VERSION);
	$php_major = (int) ($php_parts[0] ?? 0);
	$php_minor = (int) ($php_parts[1] ?? 0);
	$php_version_warning = null;
	if ($php_major < $bl_latest_php_major || ($php_major === $bl_latest_php_major && $php_minor < $bl_php_min_minor)) {
		$php_version_warning = sprintf(
			/* translators: 1: current PHP version, 2: recommended minimum PHP version, 3: latest stable PHP major.minor */
			__('Your PHP version (%1$s) is older than recommended. Consider upgrading to at least %2$s (latest stable is %3$s).', 'baselayer'),
			PHP_VERSION,
			$bl_latest_php_major . '.' . $bl_php_min_minor,
			$bl_latest_php_major . '.' . $bl_latest_php_minor
		);
	}

	$memory_warning = null;
	$memory_limit_bytes = $bl_parse_bytes($memory_limit);
	if ($memory_limit_bytes !== null && $memory_limit_bytes < 256 * 1024 * 1024) {
		$memory_warning = __('Consider increasing `memory_limit` to at least 256M.', 'baselayer');
	}

	$upload_warning = null;
	$upload_bytes = $bl_parse_bytes($upload_max);
	if ($upload_bytes !== null && $upload_bytes < 16 * 1024 * 1024) {
		$upload_warning = __('Consider increasing `upload_max_filesize` to at least 16M.', 'baselayer');
	}

	$post_warning = null;
	$post_bytes = $bl_parse_bytes($post_max);
	if ($post_bytes !== null && $post_bytes < 16 * 1024 * 1024) {
		$post_warning = __('Consider increasing `post_max_size` to at least 16M.', 'baselayer');
	}

	$upload_post_warning = null;
	if ($upload_bytes !== null && $post_bytes !== null && $post_bytes < $upload_bytes) {
		$upload_post_warning = __('`post_max_size` is smaller than `upload_max_filesize`. Some uploads may fail. Increase `post_max_size`.', 'baselayer');
	}

	$debug_enabled = function_exists('bl_is_debug') && bl_is_debug();
	$debugmode_warning = $debug_enabled ? __('Debug mode is enabled. Disable it in production.', 'baselayer') : null;
	$xdebug_warning = $xdebug_on ? __('Xdebug is enabled. Disable it in production for better performance.', 'baselayer') : null;

	$opcache_warning = null;
	if (!$opcache_ext_loaded) {
		$opcache_warning = __('Install PHP OPcache for significantly better performance.', 'baselayer');
		$opcache_status = $bl_system_status(false, esc_html__('Not installed', 'baselayer'));
	} elseif ($opcache_ini_is_one) {
		$opcache_status = $bl_system_status(true, esc_html__('Active', 'baselayer'));
	} else {
		$opcache_status = $bl_system_status(false, esc_html__('Unknown, See PHP info', 'baselayer'));
	}

	$redis_enabled = bl_developer_redis_enabled();
	$object_cache_active = function_exists('wp_using_ext_object_cache') && wp_using_ext_object_cache();
	$is_redis_installed = $redis_enabled && (
		defined('WP_REDIS_VERSION')
		|| class_exists('\RedisCache\Plugin')
		|| function_exists('redis_cache_enable')
	);
	$redis_guard_installed = $redis_enabled ? bl_developer_redis_safeguard_is_installed() : false;

	$object_cache_warning = null;
	if (!$object_cache_active) {
		$object_cache_warning = $redis_enabled && $is_redis_installed
			? __('Redis is installed, but object cache is not active. Enable Redis object caching.', 'baselayer')
			: __('No object cache detected. Consider enabling an object cache for better performance.', 'baselayer');
	}

	$object_cache_row_value = $object_cache_active ? $bl_system_status(true, esc_html__('Active', 'baselayer')) : $bl_system_status(false, esc_html__('Inactive', 'baselayer'));
	$redis_safeguard_warning = null;
	if ($redis_enabled && $is_redis_installed && !$redis_guard_installed) {
		$redis_safeguard_warning = __('Redis object cache is active but safeguard is not installed. Install the safeguard to prevent outages when Redis is unavailable.', 'baselayer');
	}

	$db_version_warning = null;
	if ($db_server !== null && isset($db_server['type'], $db_server['version']) && stripos((string) $db_server['type'], 'mysql') !== false) {
		if (preg_match('/^(\d+)/', (string) $db_server['version'], $m) === 1) {
			$db_major = (int) $m[1];
			if ($db_major > 0 && $db_major < 8) {
				$db_version_warning = sprintf(
					/* translators: %s: database server version */
					__('Database version (%s) is quite old. Consider upgrading.', 'baselayer'),
					$db_server['version']
				);
			}
		}
	}

	$dash = '&mdash;';
	?>
	<div class="bl-page-settings-form" style="margin-bottom: 24px;">
		<h2 class="title" style="margin-top: 0;"><?= esc_html__('System info', 'baselayer') ?></h2>
		<table class="widefat -large-padding striped bl-system-info-table" role="presentation">
			<tbody>
				<tr>
					<th scope="row"><?= esc_html__('PHP version', 'baselayer') ?></th>
					<td>
						<div>
							<?= esc_html(PHP_VERSION) ?><br>
							<a href="<?= esc_url(add_query_arg('phpinfo', '1', $system_url)) ?>" target="_blank" rel="noopener noreferrer"><?= esc_html__('Open PHP info', 'baselayer') ?></a>
						</div>
						<?= $bl_render_warning($php_version_warning) ?>
					</td>
				</tr>

				<tr>
					<th scope="row">OPcache</th>
					<td>
						<?= $opcache_status ?>
						<?= $bl_render_warning($opcache_warning) ?>
					</td>
				</tr>
				<tr>
					<th scope="row"><?= esc_html__('Object cache', 'baselayer') ?></th>
					<td>
						<?= $object_cache_row_value ?>
						<?= $bl_render_warning($object_cache_warning) ?>
					</td>
				</tr>
				<?php if ($redis_enabled) : ?>
					<tr>
						<th scope="row"><?= esc_html__('Redis safeguard', 'baselayer') ?></th>
						<td>
							<?= $redis_guard_installed ? $bl_system_status(true, esc_html__('Installed', 'baselayer')) : $bl_system_status(false, esc_html__('Not installed', 'baselayer')) ?>
							<?php if (!$redis_guard_installed) : ?>
								<form method="post" action="<?= esc_url(admin_url('options-general.php?page=' . bl_developer_settings_page_slug('system'))) ?>" style="display: block;">
									<?php wp_nonce_field('baselayer_install_redis_safeguard'); ?>
									<input type="hidden" name="baselayer_install_redis_safeguard" value="1">
									<button type="submit" class="is-link"><?= esc_html__('Install safeguard file', 'baselayer') ?></button>
								</form>
							<?php endif; ?>
							<?= $bl_render_warning($redis_safeguard_warning) ?>
						</td>
					</tr>
				<?php endif; ?>
				<tr>
					<th scope="row">Xdebug</th>
					<td>
						<?= $xdebug_on ? $bl_system_status(true, esc_html__('Enabled', 'baselayer')) : $bl_system_status(false, esc_html__('Disabled', 'baselayer')) ?>
						<?= $bl_render_warning($xdebug_warning) ?>
					</td>
				</tr>
				<tr>
					<th scope="row"><?= esc_html__('Debug mode', 'baselayer') ?></th>
					<td>
						<?= $debug_enabled ? $bl_system_status(true, esc_html__('Enabled', 'baselayer')) : $bl_system_status(false, esc_html__('Disabled', 'baselayer')) ?>
						<?= $bl_render_warning($debugmode_warning) ?>
					</td>
				</tr>
				<tr>
					<th scope="row"><?= esc_html__('Memory limit', 'baselayer') ?></th>
					<td>
						<?= $memory_limit !== false && $memory_limit !== '' ? esc_html($memory_limit) : $dash ?>
						<?= $bl_render_warning($memory_warning) ?>
					</td>
				</tr>
				<tr>
					<th scope="row"><?= esc_html__('Max upload size', 'baselayer') ?></th>
					<td>
						<?= $upload_max !== false && $upload_max !== '' ? esc_html($upload_max) : $dash ?>
						<?= $bl_render_warning($upload_warning) ?>
					</td>
				</tr>
				<tr>
					<th scope="row"><?= esc_html__('Max post size', 'baselayer') ?></th>
					<td>
						<?= $post_max !== false && $post_max !== '' ? esc_html($post_max) : $dash ?>
						<?= $bl_render_warning($post_warning) ?>
						<?= $bl_render_warning($upload_post_warning) ?>
					</td>
				</tr>
				<?php if ($db_server !== null) : ?>
					<tr>
						<th scope="row"><?= esc_html__('Database', 'baselayer') ?></th>
						<td><?= esc_html($db_server['type']) ?></td>
					</tr>
					<tr>
						<th scope="row"><?= esc_html__('Database version', 'baselayer') ?></th>
						<td>
							<?= esc_html($db_server['version']) ?>
							<?= $bl_render_warning($db_version_warning) ?>
						</td>
					</tr>
				<?php endif; ?>
			</tbody>
		</table>
	</div>
	<?php
}

function bl_render_developer_system(): void
{
	if (!current_user_can('manage_options')) {
		wp_die(esc_html__('You do not have sufficient permissions to access this page.', 'baselayer'));
	}

	$system_saved = get_transient('baselayer_system_saved');
	if ($system_saved !== false) {
		delete_transient('baselayer_system_saved');
	}
	$perf_saved = get_transient('baselayer_perf_admin_bar_saved');
	if ($perf_saved !== false) {
		delete_transient('baselayer_perf_admin_bar_saved');
	}
	$redis_guard_notice = null;
	if (bl_developer_redis_enabled()) {
		$redis_guard_notice = get_transient('baselayer_redis_safeguard_notice');
		if ($redis_guard_notice !== false) {
			delete_transient('baselayer_redis_safeguard_notice');
		}
	}
	$email_saved = get_transient('baselayer_email_saved');
	if ($email_saved !== false) {
		delete_transient('baselayer_email_saved');
	}
	$test_mail_success = get_transient('baselayer_email_test_mail_success');
	if ($test_mail_success !== false) {
		delete_transient('baselayer_email_test_mail_success');
	}
	$test_mail_error = get_transient('baselayer_email_test_mail_error');
	if ($test_mail_error !== false) {
		delete_transient('baselayer_email_test_mail_error');
	}
?>
	<div class="wrap">
		<?php bl_developer_settings_screen_heading(); ?>
		<?php if ($system_saved !== false || $perf_saved !== false || $email_saved !== false) : ?>
			<div class="notice notice-success is-dismissible">
				<p><strong><?= esc_html(__('Settings saved.', 'baselayer')) ?></strong></p>
			</div>
		<?php endif; ?>
		<?php if (is_array($redis_guard_notice) && !empty($redis_guard_notice['message'])) : ?>
			<div class="notice <?= !empty($redis_guard_notice['ok']) ? 'notice-success' : 'notice-warning' ?> is-dismissible">
				<p><strong><?= esc_html((string) $redis_guard_notice['message']) ?></strong></p>
			</div>
		<?php endif; ?>

		<?php bl_developer_settings_render_nav(); ?>

		<?php if ((int) get_option('blog_public', 1) === 0) : ?>
			<div class="notice notice-warning inline" style="margin: 16px 0 0;">
				<p><strong><?= esc_html__('Search engines are asked not to index this site.', 'baselayer') ?></strong></p>
			</div>
		<?php endif; ?>

		<?php
		$current_ip = function_exists('bl_developer_perf_current_ip') ? bl_developer_perf_current_ip() : '';
		$guest_ips = get_option('baselayer_perf_panel_guest_ips', '');
		$guest_panel_on = get_option('baselayer_perf_panel_guest', '0') === '1';
		$matomo_url_value = (string) get_option('baselayer_matomo_url', '');
		$matomo_site_id_value = (int) get_option('baselayer_matomo_site_id', 1);
		$matomo_token_value = (string) get_option('baselayer_matomo_token_auth', '');
		$matomo_custom_js_value = (string) get_option('baselayer_matomo_custom_js', '');
		$matomo_feature_enabled = function_exists('bl_theme_feature_enabled') && bl_theme_feature_enabled('matomo');
		?>
		<?php if ($test_mail_success !== false) : ?>
			<div class="notice notice-success is-dismissible">
				<p><strong><?= esc_html(sprintf(__('Test email sent to %s.', 'baselayer'), $test_mail_success === '1' ? __('the address', 'baselayer') : $test_mail_success)) ?></strong></p>
			</div>
		<?php endif; ?>
		<?php if ($test_mail_error !== false) : ?>
			<div class="notice notice-error is-dismissible">
				<p><strong><?= esc_html($test_mail_error) ?></strong></p>
			</div>
		<?php endif; ?>

		<?php
		if (function_exists('bl_developer_render_email_settings_section')) {
			bl_developer_render_email_settings_section();
		}
		?>

		<hr class="bl-page-settings-divider">

		<div class="bl-page-settings-form" style="margin-bottom: 24px;">

			<form method="post" action="" style="margin-top: 12px;">
				<?php wp_nonce_field('baselayer_perf'); ?>
				<h2 class="title"><?= esc_html__('Performance', 'baselayer') ?></h2>
				<input type="hidden" name="baselayer_save_perf" value="1">
				<p style="margin-bottom: 8px;">
					<label>
						<input type="hidden" name="baselayer_perf_admin_bar" value="0">
						<input type="checkbox" name="baselayer_perf_admin_bar" value="1" <?= checked(get_option('baselayer_perf_admin_bar', '1'), '1', false) ?>>
						<?= esc_html__('Show performance panel in admin bar', 'baselayer') ?>
					</label>
				</p>
				<p style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
					<label>
						<input type="hidden" name="baselayer_perf_panel_guest" value="0">
						<input type="checkbox" name="baselayer_perf_panel_guest" id="baselayer_perf_panel_guest" value="1" <?= checked($guest_panel_on, true, false) ?>>
						<?= esc_html__('Enable performance panel for logged out users', 'baselayer') ?>
					</label>
				</p>
				<div id="bl-perf-guest-ips-wrap" class="bl-perf-guest-ips-wrap bl-indent-checkbox" style="margin-top: 12px; <?= $guest_panel_on ? '' : 'display: none;' ?>">
					<p style="margin-bottom: 6px;">
						<?= esc_html__('Your current IP address:', 'baselayer') ?> <code id="bl-perf-current-ip"><?= $current_ip !== '' ? esc_html($current_ip) : '&mdash;' ?></code>
					</p>
					<p style="margin-bottom: 0;">
						<label for="baselayer_perf_panel_guest_ips"><?= esc_html__('Allowed IP addresses', 'baselayer') ?></label><br>
						<input type="text" name="baselayer_perf_panel_guest_ips" id="baselayer_perf_panel_guest_ips" value="<?= esc_attr($guest_ips) ?>" class="regular-text" placeholder="<?= esc_attr__('192.168.1.1, 10.0.0.1', 'baselayer') ?>" style="margin-top: 4px; max-width: 320px;">
						<span class="description" style="display: block; margin-top: 4px;"><?= esc_html__('Comma-separated. Only these IPs will see the panel when logged out.', 'baselayer') ?></span>
					</p>
				</div>
				<div class="bl-submit-row">
					<button type="submit" class="button button-primary"><?= esc_html__('Save Changes') ?></button>
				</div>
			</form>
			<script>
				(function() {
					var cb = document.getElementById('baselayer_perf_panel_guest');
					var wrap = document.getElementById('bl-perf-guest-ips-wrap');
					if (cb && wrap) {
						cb.addEventListener('change', function() {
							wrap.style.display = this.checked ? '' : 'none';
						});
					}
				})();
			</script>
		</div>

		<?php if ($matomo_feature_enabled) : ?>
			<hr class="bl-page-settings-divider">

			<form method="post" action="" class="bl-page-settings-form" id="bl-matomo-settings">
				<?php wp_nonce_field('baselayer_system_matomo'); ?>
				<input type="hidden" name="baselayer_save_matomo" value="1">
				<h2 class="title"><?= esc_html__('Matomo', 'baselayer') ?></h2>
				<p class="description"><?= esc_html__('Loads the Matomo tracking script on the frontend and transmits page view and interaction data to the configured Matomo endpoint using the provided site ID.', 'baselayer') ?></p>
				<table class="form-table" role="presentation">
					<tr>
						<th scope="row"><label for="baselayer_matomo_url"><?= esc_html__('Matomo URL', 'baselayer') ?></label></th>
						<td>
							<input type="url" name="baselayer_matomo_url" id="baselayer_matomo_url" value="<?= esc_attr($matomo_url_value) ?>" class="regular-text" placeholder="https://analytics.example.com" style="max-width: 420px;">
							<p class="description"><?= esc_html__('Base URL of your Matomo instance, e.g. https://analytics.example.com', 'baselayer') ?></p>
						</td>
					</tr>
					<tr>
						<th scope="row"><label for="baselayer_matomo_site_id"><?= esc_html__('Site ID', 'baselayer') ?></label></th>
						<td>
							<input type="number" min="1" step="1" name="baselayer_matomo_site_id" id="baselayer_matomo_site_id" value="<?= esc_attr((string) $matomo_site_id_value) ?>" class="small-text">
							<p class="description"><?= esc_html__('Matomo site ID (idSite). Default is 1.', 'baselayer') ?></p>
						</td>
					</tr>
					<tr>
						<th scope="row"><label for="baselayer_matomo_token_auth"><?= esc_html__('Auth Token', 'baselayer') ?></label></th>
						<td>
							<input type="text" name="baselayer_matomo_token_auth" id="baselayer_matomo_token_auth" value="<?= esc_attr($matomo_token_value) ?>" class="regular-text" style="max-width: 420px;">
							<p class="description"><?= esc_html__('To enable analytics on the dashboard or in emails, provide an auth token. You can create auth tokens in Matomo under Administration › Personal › Security › Auth tokens.', 'baselayer') ?></p>
						</td>
					</tr>
					<tr>
						<th scope="row"><label for="baselayer_matomo_custom_js"><?= esc_html__('Tracking settings', 'baselayer') ?></label></th>
						<td>
							<textarea name="baselayer_matomo_custom_js" id="baselayer_matomo_custom_js" rows="4" class="large-text code bl-code-small" placeholder="_paq.push(['disableCookies']);"><?= esc_textarea($matomo_custom_js_value) ?></textarea>
							<p class="description"><?= esc_html__('Optional additional _paq commands. One command per line.', 'baselayer') ?></p>
						</td>
					</tr>
				</table>
				<div class="bl-submit-row">
					<button type="submit" class="button button-primary"><?= esc_html__('Save Changes') ?></button>
				</div>
			</form>
		<?php endif; ?>

		<hr class="bl-page-settings-divider">

		<?php
		$profile_picture_default = defined('BL_PROFILE_PICTURE_MODE_DEFAULT') ? BL_PROFILE_PICTURE_MODE_DEFAULT : 'upload';
		$profile_picture_mode = function_exists('bl_profile_picture_mode') ? bl_profile_picture_mode() : $profile_picture_default;
		?>
		<form method="post" action="" class="bl-page-settings-form" id="bl-profile-picture-mode">
			<?php wp_nonce_field('baselayer_profile_picture_mode'); ?>
			<input type="hidden" name="baselayer_save_profile_picture_mode" value="1">
			<h2 class="title"><?= esc_html__('Profile picture', 'baselayer') ?></h2>
			<table class="form-table" role="presentation">
				<tr>
					<th scope="row"><?= esc_html__('Source', 'baselayer') ?></th>
					<td>
						<fieldset>
							<label style="display: block; margin-bottom: 0 !important;">
								<input type="radio" name="baselayer_profile_picture_mode" value="upload" <?= checked($profile_picture_mode, 'upload', false) ?>>
								<?= esc_html__('Upload image', 'baselayer') ?>
							</label>
							<p class="description bl-indent-checkbox"><?= esc_html__('Allows users to upload a custom picture on their profile page.', 'baselayer') ?></p>
							<label style="display: block; margin-top: 16px !important; margin-bottom: 0 !important;">
								<input type="radio" name="baselayer_profile_picture_mode" value="gravatar" <?= checked($profile_picture_mode, 'gravatar', false) ?>>
								<?= esc_html__('Gravatar (WordPress default)', 'baselayer') ?>
							</label>
							<p class="description bl-indent-checkbox"><?= esc_html__('Uses the account email and Gravatar.com, as in a standard WordPress install.', 'baselayer') ?></p>
						</fieldset>
					</td>
				</tr>
			</table>
			<div class="bl-submit-row">
				<button type="submit" class="button button-primary"><?= esc_html__('Save Changes') ?></button>
			</div>
		</form>

		<hr class="bl-page-settings-divider">

		<form method="post" action="" class="bl-page-settings-form" id="bl-search-visibility">
			<?php wp_nonce_field('baselayer_system_search_visibility'); ?>
			<input type="hidden" name="baselayer_save_search_visibility" value="1">
			<h2 class="title"><?= esc_html__('Search engine visibility', 'baselayer') ?></h2>
			<p class="description"><?= esc_html__('When enabled, search engines are asked not to index this site.', 'baselayer') ?></p>
			<table class="form-table" role="presentation">
				<tr>
					<th scope="row"><?= esc_html__('Visibility', 'baselayer') ?></th>
					<td>
						<label>
							<input type="checkbox" name="blog_public_discourage" value="1" <?= checked((int) get_option('blog_public', 1), 0, false) ?>>
							<?= esc_html__('Discourage search engines from indexing this site', 'baselayer') ?>
						</label>
						<p class="description bl-indent-checkbox"><?= esc_html__('It is up to search engines whether they follow this request.', 'baselayer') ?></p>
					</td>
				</tr>
			</table>
			<div class="bl-submit-row">
				<button type="submit" class="button button-primary"><?= esc_html__('Save Changes') ?></button>
			</div>
		</form>

	</div>
<?php
}
