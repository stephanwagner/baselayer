<?php
defined('ABSPATH') || exit;
?>
<!DOCTYPE html>
<html lang="<?= esc_attr(str_replace('_', '-', determine_locale())) ?>">
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<?php if (!empty($email_page_title)) : ?>
		<title><?= esc_html((string) $email_page_title) ?></title>
	<?php endif; ?>
</head>
<body style="margin:0;padding:24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1f2937;background:#f8fafc;">
	<div style="max-width:640px;margin:0 auto;background:#fff;padding:24px 28px;border-radius:8px;">
		<?= $email_body_html // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
	</div>
</body>
</html>
