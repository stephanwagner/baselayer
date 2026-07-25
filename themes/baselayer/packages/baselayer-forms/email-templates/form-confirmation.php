<?php
defined('ABSPATH') || exit;
$rows = isset($rows) && is_array($rows) ? $rows : [];
$title = isset($title) ? (string) $title : '';
$intro = isset($intro) ? (string) $intro : '';
$footer = isset($footer) ? (string) $footer : '';
if ($title === '') {
	$title = __('Thank you', 'baselayer-forms');
}
?>
<h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;font-weight:700;color:#23292e;">
	<?= esc_html($title) ?>
</h1>
<?php if ($intro !== '') : ?>
<p style="margin:0 0 16px;font-size:15px;line-height:1.5;color:#23292e;">
	<?= nl2br(esc_html($intro)) ?>
</p>
<?php endif; ?>
<?php if ($rows !== []) : ?>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:0 0 20px;">
	<?php foreach ($rows as $row) : ?>
		<tr>
			<td style="padding:10px 0;border-bottom:1px solid #eaeef2;font-size:13px;color:#6f7882;width:34%;vertical-align:top;">
				<?= esc_html((string) ($row['label'] ?? '')) ?>
			</td>
			<td style="padding:10px 0;border-bottom:1px solid #eaeef2;font-size:15px;color:#23292e;vertical-align:top;">
				<?= $row['value'] ?? '' // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped in bl_forms_email_field_value_html. ?>
			</td>
		</tr>
	<?php endforeach; ?>
</table>
<?php endif; ?>
<?php if ($footer !== '') : ?>
<p style="margin:0;font-size:13px;line-height:1.5;color:#6f7882;">
	<?= nl2br(esc_html($footer)) ?>
</p>
<?php endif; ?>
