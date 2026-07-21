<?php

defined('ABSPATH') || exit;

/**
 * Load a forms email body template.
 *
 * @param array<string, mixed> $args
 */
function bl_forms_get_email_template(string $name, array $args = []): string
{
	$path = __DIR__ . '/email-templates/' . $name . '.php';
	if (!is_readable($path)) {
		return '';
	}

	extract($args, EXTR_SKIP);
	ob_start();
	include $path;

	return (string) ob_get_clean();
}

/**
 * Compose HTML email: prefer BaseLayer chrome when available.
 *
 * @param array<string, mixed> $args
 */
function bl_forms_compose_email(string $body_template, array $args = []): string
{
	$body = bl_forms_get_email_template($body_template, $args);
	if ($body === '') {
		return '';
	}

	if (function_exists('bl_get_email_template')) {
		$header = bl_get_email_template('email-header', $args);
		$footer = bl_get_email_template('email-footer', $args);
		if ($header !== '' && $footer !== '') {
			return $header . $body . $footer;
		}
	}

	$shell = bl_forms_get_email_template('email-shell', array_merge($args, [
		'email_body_html' => $body,
	]));

	return $shell !== '' ? $shell : $body;
}

/**
 * Send form notification emails and return status meta.
 *
 * @param array<string, mixed> $config
 * @param array<string, mixed> $values Sanitized field values keyed by name.
 * @return array{admin_sent: bool, user_sent: bool, admin_error: string, user_error: string}
 */
function bl_forms_send_emails(int $form_id, int $entry_id, array $config, array $values): array
{
	$status = [
		'admin_sent'  => false,
		'user_sent'   => false,
		'admin_error' => '',
		'user_error'  => '',
	];

	$settings = $config['settings'];
	$form_title = get_the_title($form_id);
	if ($form_title === '') {
		$form_title = sprintf(__('Form #%d', 'baselayer'), $form_id);
	}

	$site_name = wp_specialchars_decode(get_bloginfo('name'), ENT_QUOTES);
	$rows = bl_forms_email_field_rows($config['fields'], $values);
	$reply_to = '';
	$email_name = bl_forms_primary_email_field_name($config);
	if ($email_name !== '' && !empty($values[$email_name]) && is_email((string) $values[$email_name])) {
		$reply_to = (string) $values[$email_name];
	}

	$recipient = bl_forms_recipient($settings);
	$admin_subject = trim((string) ($settings['admin_email_subject'] ?? ''));
	if ($admin_subject === '') {
		$admin_subject = sprintf(
			/* translators: 1: site name, 2: form title */
			__('[%1$s] New submission: %2$s', 'baselayer'),
			$site_name,
			$form_title
		);
	}

	$headers = ['Content-Type: text/html; charset=UTF-8'];
	if ($reply_to !== '') {
		$headers[] = 'Reply-To: ' . $reply_to;
	}

	if ($recipient !== '') {
		$body = bl_forms_compose_email('form-submission', [
			'email_page_title' => $admin_subject,
			'site_name'        => $site_name,
			'form_title'       => $form_title,
			'entry_id'         => $entry_id,
			'rows'             => $rows,
			'site_url'         => home_url('/'),
		]);

		$sent = wp_mail($recipient, $admin_subject, $body, $headers);
		$status['admin_sent'] = (bool) $sent;
		if (!$sent) {
			$status['admin_error'] = __('Admin notification could not be sent.', 'baselayer');
		}
	} else {
		$status['admin_error'] = __('No valid recipient configured.', 'baselayer');
	}

	if (!empty($settings['notify_user']) && $reply_to !== '') {
		$user_subject = trim((string) ($settings['user_email_subject'] ?? ''));
		if ($user_subject === '') {
			$user_subject = sprintf(
				/* translators: %s: site name */
				__('We received your message — %s', 'baselayer'),
				$site_name
			);
		}

		$intro = trim((string) ($settings['user_email_intro'] ?? ''));
		if ($intro === '') {
			$intro = __('Thank you for your message. Here is a copy of what you sent:', 'baselayer');
		}

		$body = bl_forms_compose_email('form-confirmation', [
			'email_page_title' => $user_subject,
			'site_name'        => $site_name,
			'form_title'       => $form_title,
			'intro'            => $intro,
			'rows'             => $rows,
			'site_url'         => home_url('/'),
		]);

		$sent = wp_mail($reply_to, $user_subject, $body, ['Content-Type: text/html; charset=UTF-8']);
		$status['user_sent'] = (bool) $sent;
		if (!$sent) {
			$status['user_error'] = __('Confirmation email could not be sent.', 'baselayer');
		}
	}

	return $status;
}

/**
 * Build label/value rows for email templates.
 *
 * @param list<array<string, mixed>> $fields
 * @param array<string, mixed>       $values
 * @return list<array{label: string, value: string}>
 */
function bl_forms_email_field_rows(array $fields, array $values): array
{
	$rows = [];
	foreach ($fields as $field) {
		$type = (string) ($field['type'] ?? '');
		if (in_array($type, ['heading', 'text_block'], true)) {
			continue;
		}
		$name = (string) ($field['name'] ?? '');
		if ($name === '' || !array_key_exists($name, $values)) {
			continue;
		}
		$label = (string) ($field['label'] ?? $name);
		$value = $values[$name];
		if (is_array($value)) {
			$value = implode(', ', array_map('strval', $value));
		}
		$value = (string) $value;
		if ($type === 'terms') {
			$value = $value !== '' && $value !== '0'
				? __('Yes', 'baselayer')
				: __('No', 'baselayer');
		}
		$rows[] = [
			'label' => $label,
			'value' => $value,
		];
	}

	return $rows;
}
