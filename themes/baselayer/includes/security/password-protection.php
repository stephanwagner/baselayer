<?php

defined('ABSPATH') || exit;

/**
 * Site password protection: frontend and admin behind one shared password.
 * Logged-in administrators and editors bypass the gate. Options in Settings → Developer → Security.
 */

/**
 * Run the site password gate: allow if disabled, or user is admin/editor, or valid cookie, or correct POST.
 * Otherwise output password form and exit.
 *
 * @return void
 */
function bl_site_password_gate(): void
{
	if (get_option('baselayer_site_password_protection') !== '1') {
		return;
	}
	$hash = get_option('baselayer_site_password_hash', '');
	if ($hash === '') {
		return;
	}
	if (defined('DOING_CRON') && DOING_CRON) {
		return;
	}
	if (defined('WP_CLI') && constant('WP_CLI')) {
		return;
	}
	// Logged-in admins and editors skip the gate
	if (is_user_logged_in()) {
		$user = wp_get_current_user();
		if ($user->exists() && (user_can($user, 'edit_posts') || user_can($user, 'manage_options'))) {
			return;
		}
	}
	$cookie_name = 'baselayer_site_access';
	$cookie_value = isset($_COOKIE[$cookie_name]) ? sanitize_text_field(wp_unslash($_COOKIE[$cookie_name])) : '';
	if ($cookie_value !== '') {
		$transient_key = 'baselayer_site_access_' . $cookie_value;
		if (get_transient($transient_key) !== false) {
			return;
		}
	}
	// POST with password
	if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['baselayer_site_password'])) {
		$submitted = trim((string) wp_unslash($_POST['baselayer_site_password']));
		if ($submitted !== '' && wp_check_password($submitted, $hash)) {
			$token = bin2hex(random_bytes(32));
			$days = (int) (function_exists('bl_config') ? bl_config('site_password_cookie_days') : 1);
			$days = max(1, min(365, $days));
			$expire = time() + ($days * DAY_IN_SECONDS);
			set_transient('baselayer_site_access_' . $token, '1', $days * DAY_IN_SECONDS);
			$secure = is_ssl();
			setcookie($cookie_name, $token, $expire, COOKIEPATH, COOKIE_DOMAIN, $secure, true);
			if (COOKIEPATH !== '/') {
				setcookie($cookie_name, $token, $expire, '/', COOKIE_DOMAIN, $secure, true);
			}
			$redirect = $_SERVER['REQUEST_URI'] ?? '/';
			wp_safe_redirect(esc_url_raw($redirect), 302);
			exit;
		}
	}
	bl_site_password_show_form();
}

/**
 * Output minimal HTML password form and exit.
 */
function bl_site_password_show_form(): void
{
	$title = __('Protected Area', 'baselayer');
	$notice = __('This site is password protected.', 'baselayer');
	$label = __('Password', 'baselayer');
	$submit = __('Log in', 'baselayer');
	$current_url = $_SERVER['REQUEST_URI'] ?? '/';
	$current_url = esc_url($current_url);

	$extra_css = '
		form { display: flex; flex-direction: column; align-items: center; gap: 16px; }
		input[type="password"] {
			width: 100%; max-width: 240px; padding: 8px 16px; font-size: 15px; line-height: 24px;
			box-sizing: border-box; text-align: center; border-radius: 4px; border: 1px solid #c3c4c7;
			background: #fff; font-weight: 400; outline: none;
		}
		input[type="password"]:focus { border-color: #2271b1; }
		button { margin: 0; padding: 8px 32px; font-size: 16px; line-height: 1.5; cursor: pointer;
			background: #2271b1; color: #fff; border: none; font-weight: 400; border-radius: 4px;
		}
		button:hover { background: #135e96; }
		.error { margin: -8px 0 20px; color: #e33; font-weight: 500; }
		@media (max-width: 600px) { .error { margin-top: -16px; margin-bottom: 16px; } }
	';

	$body = '<div class="notice"><span>' . esc_html($notice) . '</span></div>';
	if (isset($_POST['baselayer_site_password'])) {
		$body .= '<div class="error">' . esc_html__('Incorrect password.', 'baselayer') . '</div>';
	}
	$body .= '<form method="post" action="' . $current_url . '">';
	$body .= '<input type="password" name="baselayer_site_password" id="baselayer_site_password" autocomplete="current-password" placeholder="' . esc_attr($label) . '" autofocus>';
	$body .= '<button type="submit">' . esc_html($submit) . '</button>';
	$body .= '</form>';

	bl_block_page($title, $body, ['extra_css' => $extra_css]);
}

add_action('init', 'bl_site_password_gate', 1);
