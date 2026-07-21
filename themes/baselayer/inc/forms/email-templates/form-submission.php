<?php
defined('ABSPATH') || exit;
$rows = isset($rows) && is_array($rows) ? $rows : [];
?>
<h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;font-weight:700;color:#1f2937;">
	<?= esc_html__('New form submission', 'baselayer') ?>
</h1>
<p style="margin:0 0 16px;font-size:15px;line-height:1.5;color:#1f2937;">
	<?= esc_html(sprintf(
		/* translators: 1: form title, 2: site name */
		__('A new submission was received for “%1$s” on %2$s.', 'baselayer'),
		(string) ($form_title ?? ''),
		(string) ($site_name ?? '')
	)) ?>
</p>
<?php if ($rows !== []) : ?>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:0 0 20px;">
	<?php foreach ($rows as $row) : ?>
		<tr>
			<td style="padding:10px 0;border-bottom:1px solid #e2e8f0;font-size:13px;color:#64748b;width:34%;vertical-align:top;">
				<?= esc_html((string) ($row['label'] ?? '')) ?>
			</td>
			<td style="padding:10px 0;border-bottom:1px solid #e2e8f0;font-size:15px;color:#1f2937;vertical-align:top;">
				<?= nl2br(esc_html((string) ($row['value'] ?? ''))) ?>
			</td>
		</tr>
	<?php endforeach; ?>
</table>
<?php endif; ?>
<p style="margin:0;font-size:13px;line-height:1.5;color:#64748b;">
	<?= esc_html(sprintf(__('Entry ID: %d', 'baselayer'), (int) ($entry_id ?? 0))) ?>
</p>
