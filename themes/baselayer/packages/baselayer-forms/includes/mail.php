<?php

defined('ABSPATH') || exit;

/**
 * Load a forms email body template.
 *
 * @param array<string, mixed> $args
 */
function bl_forms_get_email_template(string $name, array $args = []): string
{
	$path = bl_forms_path('email-templates/' . $name . '.php');
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
		$form_title = sprintf(__('Form #%d', 'baselayer-forms'), $form_id);
	}

	$site_name = wp_specialchars_decode(get_bloginfo('name'), ENT_QUOTES);
	$admin_rows = bl_forms_email_field_rows($config['fields'], $values, true);
	$reply_to = '';
	$email_name = bl_forms_primary_email_field_name($config);
	if ($email_name !== '' && !empty($values[$email_name]) && is_email((string) $values[$email_name])) {
		$reply_to = (string) $values[$email_name];
	}

	$recipient = bl_forms_recipient($settings);
	$subject_vars = [
		'form_title' => $form_title,
		'site_name'  => $site_name,
	];
	$admin_subject = bl_forms_resolve_setting_string($settings, 'admin_email_subject');
	if ($admin_subject === '') {
		/* translators: Placeholders: {site_name}, {form_title} */
		$admin_subject = __('[{site_name}] New submission: {form_title}', 'baselayer-forms');
	}
	$admin_subject = bl_forms_replace_placeholders($admin_subject, $subject_vars);

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
			'rows'             => $admin_rows,
			'site_url'         => home_url('/'),
		]);

		$sent = wp_mail($recipient, $admin_subject, $body, $headers);
		$status['admin_sent'] = (bool) $sent;
		if (!$sent) {
			$status['admin_error'] = __('Admin notification could not be sent.', 'baselayer-forms');
		}
	} else {
		$status['admin_error'] = __('No valid recipient configured.', 'baselayer-forms');
	}

	if (!empty($settings['notify_user']) && $reply_to !== '') {
		$user_subject = bl_forms_resolve_setting_string($settings, 'user_email_subject');
		if ($user_subject === '') {
			/* translators: Placeholder: {site_name} */
			$user_subject = __('We received your message – {site_name}', 'baselayer-forms');
		}
		$user_subject = bl_forms_replace_placeholders($user_subject, $subject_vars);

		$title = bl_forms_resolve_setting_string($settings, 'user_email_title');
		if ($title === '') {
			$title = __('Thank you', 'baselayer-forms');
		}
		$title = bl_forms_replace_placeholders($title, $subject_vars);

		$intro = bl_forms_resolve_setting_string($settings, 'user_email_intro');
		if ($intro === '') {
			$intro = __('Thank you for your message. Here is a copy of what you sent:', 'baselayer-forms');
		} else {
			$intro = bl_forms_replace_placeholders($intro, $subject_vars);
			$intro = bl_forms_replace_field_placeholders($intro, $config['fields'], $values);
		}

		$footer = bl_forms_resolve_setting_string($settings, 'user_email_footer');
		if ($footer === '') {
			/* translators: Placeholder: {site_name} */
			$footer = __('You received this email because you submitted a form on {site_name}.', 'baselayer-forms');
		}
		$footer = bl_forms_replace_placeholders($footer, $subject_vars);

		$body = bl_forms_compose_email('form-confirmation', [
			'email_page_title' => $user_subject,
			'site_name'        => $site_name,
			'form_title'       => $form_title,
			'title'            => $title,
			'intro'            => $intro,
			'footer'           => $footer,
			'rows'             => bl_forms_email_field_rows($config['fields'], $values, false),
			'site_url'         => home_url('/'),
		]);

		$sent = wp_mail($reply_to, $user_subject, $body, ['Content-Type: text/html; charset=UTF-8']);
		$status['user_sent'] = (bool) $sent;
		if (!$sent) {
			$status['user_error'] = __('Confirmation email could not be sent.', 'baselayer-forms');
		}
	}

	return $status;
}

/**
 * Replace {token} placeholders in email subjects (and similar strings).
 *
 * Supported tokens: form_title, site_name.
 *
 * @param array<string, string> $vars
 */
function bl_forms_replace_email_placeholders(string $text, array $vars): string
{
	return bl_forms_replace_placeholders($text, $vars);
}

/**
 * Replace {field-name} tokens with submitted display values.
 * Legacy [field-name] tokens are still supported.
 *
 * @param list<array<string, mixed>> $fields
 * @param array<string, mixed>       $values
 */
function bl_forms_replace_field_placeholders(string $text, array $fields, array $values): string
{
	if ($text === '' || (!str_contains($text, '{') && !str_contains($text, '['))) {
		return $text;
	}

	$by_name = [];
	foreach (bl_forms_iter_fields($fields) as $field) {
		$name = sanitize_key((string) ($field['name'] ?? ''));
		if ($name === '' || !array_key_exists($name, $values)) {
			continue;
		}
		$by_name[$name] = bl_forms_format_field_display_value($field, $values[$name]);
	}

	if ($by_name === []) {
		return $text;
	}

	return (string) preg_replace_callback(
		'/\{([a-zA-Z0-9_-]+)\}|\[([a-zA-Z0-9_-]+)\]/',
		static function (array $matches) use ($by_name): string {
			$key = sanitize_key($matches[1] !== '' ? $matches[1] : ($matches[2] ?? ''));
			return array_key_exists($key, $by_name) ? $by_name[$key] : $matches[0];
		},
		$text
	);
}

/**
 * Build label/value rows for email templates.
 *
 * When `$link_files` is true, saved file/image values use the filename as the link text.
 * Confirmation emails pass false so download URLs are not exposed to submitters.
 * `value` is HTML-safe for direct output in email templates.
 *
 * @param list<array<string, mixed>> $fields
 * @param array<string, mixed>       $values
 * @return list<array{label: string, value: string}>
 */
function bl_forms_email_field_rows(array $fields, array $values, bool $link_files = false): array
{
	$rows = [];
	foreach (bl_forms_iter_fields($fields) as $field) {
		$type = (string) ($field['type'] ?? '');
		if (in_array($type, bl_forms_content_field_types(), true) || $type === 'honeypot') {
			continue;
		}
		$name = (string) ($field['name'] ?? '');
		if ($name === '' || !array_key_exists($name, $values)) {
			continue;
		}
		$label = (string) ($field['label'] ?? $name);
		$rows[] = [
			'label' => $label,
			'value' => bl_forms_email_field_value_html($field, $values[$name], $link_files),
		];
	}

	return $rows;
}

/**
 * HTML-safe display value for one field in notification emails.
 *
 * @param array<string, mixed> $field
 * @param mixed                $value
 */
function bl_forms_email_field_value_html(array $field, $value, bool $link_files = false): string
{
	$type = (string) ($field['type'] ?? '');
	if (in_array($type, ['file', 'image'], true)) {
		$items = is_array($value) ? $value : [];
		$parts = [];
		foreach ($items as $item) {
			if (!is_array($item)) {
				continue;
			}
			$fname = (string) ($item['name'] ?? '');
			$furl = (string) ($item['url'] ?? '');
			if ($link_files && $fname !== '' && $furl !== '') {
				$parts[] = '<a href="' . esc_url($furl) . '" style="color:#2563eb;text-decoration:underline;">' . esc_html($fname) . '</a>';
			} elseif ($fname !== '') {
				$parts[] = esc_html($fname);
			} elseif ($link_files && $furl !== '') {
				$parts[] = '<a href="' . esc_url($furl) . '" style="color:#2563eb;text-decoration:underline;">' . esc_html($furl) . '</a>';
			}
		}

		return implode('<br>', $parts);
	}

	return nl2br(esc_html(bl_forms_format_field_display_value($field, $value)));
}
