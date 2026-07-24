<?php

defined('ABSPATH') || exit;

/**
 * Load an email template from includes/email-templates. Variables in $args are extracted for the template.
 *
 * @param string $name Template name (file name without .php).
 * @param array  $args Variables to pass to the template (e.g. site_name, to_email).
 * @return string Rendered HTML or empty string if template not found.
 */
function bl_get_email_template(string $name, array $args = []): string
{
	$path = get_template_directory() . '/includes/email-templates/' . $name . '.php';
	if (!is_readable($path)) {
		return '';
	}
	extract($args, EXTR_SKIP);
	ob_start();
	include $path;
	return (string) ob_get_clean();
}

/**
 * Wrap a body template with email-header and email-footer (shared layout).
 *
 * The caller sets copy; each part is shown only when the string is non-empty (after trim):
 * - email_page_title — `<title>`
 * - email_footer_html — footer row (sanitized with wp_kses_post)
 * - email_html_lang — `<html lang>`; defaults from site locale when omitted or empty
 *
 * @param string $content_template Template name under includes/email-templates (without .php).
 * @see baselayer_email_document_args Filter to adjust $args per template.
 */
function bl_compose_email_document(string $content_template, array $args = []): string
{
	$args = apply_filters('baselayer_email_document_args', $args, $content_template);
	$header = bl_get_email_template('email-header', $args);
	$footer = bl_get_email_template('email-footer', $args);
	$body = bl_get_email_template($content_template, $args);
	if ($header === '' || $footer === '') {
		return $body;
	}

	return $header . $body . $footer;
}

/**
 * From address for all outgoing mail. Fallback to WordPress default when empty.
 */
add_filter('wp_mail_from', function ($email) {
	$custom = get_option('baselayer_email_from', '');
	if ($custom !== '' && is_email($custom)) {
		return $custom;
	}
	return get_option('admin_email', '');
});

add_filter('wp_mail_from_name', function ($name) {
	$custom = get_option('baselayer_email_from_name', '');
	if ($custom !== '') {
		return $custom;
	}
	return get_bloginfo('name', 'display');
});

/**
 * Hook into WordPress mail to use Developer › Settings mail delivery settings (SMTP or SendGrid).
 * From address is set via wp_mail_from / wp_mail_from_name filters above.
 */
add_action('phpmailer_init', 'bl_phpmailer_init_from_settings', 20, 1);

function bl_phpmailer_init_from_settings($phpmailer): void
{
	$mailer = get_option('baselayer_mailer', 'php');

	if ($mailer === 'php' || $mailer === '') {
		return;
	}

	if ($mailer === 'smtp') {
		$host = get_option('baselayer_smtp_host', '');
		if ($host === '') {
			return;
		}
		$phpmailer->isSMTP();
		$phpmailer->Host = $host;
		$phpmailer->Port = (int) get_option('baselayer_smtp_port', 587);
		$enc = get_option('baselayer_smtp_encryption', 'tls');
		$phpmailer->SMTPSecure = $enc === 'none' ? '' : $enc;
		$user = get_option('baselayer_smtp_user', '');
		$phpmailer->SMTPAuth = $user !== '';
		if ($user !== '') {
			$phpmailer->Username = $user;
			$phpmailer->Password = get_option('baselayer_smtp_pass', '');
		}
		return;
	}

	if ($mailer === 'sendgrid') {
		$api_key = get_option('baselayer_sendgrid_api_key', '');
		if ($api_key === '') {
			return;
		}
		$phpmailer->isSMTP();
		$phpmailer->Host = 'smtp.sendgrid.net';
		$phpmailer->Port = 587;
		$phpmailer->SMTPSecure = 'tls';
		$phpmailer->SMTPAuth = true;
		$phpmailer->Username = 'apikey';
		$phpmailer->Password = $api_key;
	}
}
