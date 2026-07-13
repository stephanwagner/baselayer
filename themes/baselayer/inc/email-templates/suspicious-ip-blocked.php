<?php
defined('ABSPATH') || exit;

$security_page = function_exists('bl_developer_settings_page_slug') ? bl_developer_settings_page_slug('security') : 'bl-developer-security';
$security_url = admin_url('options-general.php?page=' . $security_page . '#bl-security-failed-logins');
?>
<h1
	style="
		margin: 0 0 20px;
		font-size: 24px;
		line-height: 1.3;
		font-weight: bold;
		text-align: left;
		color: #1f2937;
	"><?= esc_html__('IP temporarily blocked', 'baselayer') ?></h1>
<p style="margin: 0 0 16px; font-size: 16px; line-height: 1.5; color: #1f2937;">
	<?= esc_html(sprintf(__('The following IP address was temporarily blocked after failed logins exceeded the configured threshold on %s.', 'baselayer'), $site_name)) ?>
</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 0 16px; font-size: 16px; line-height: 1.5; color: #1f2937; border-collapse: collapse;">
	<tbody>
		<tr>
			<td style="padding: 4px 16px 4px 0; vertical-align: top; font-weight: 600;"><?= esc_html__('IP address', 'baselayer') ?></td>
			<td style="padding: 4px 0; vertical-align: top;"><code style="font-size: 15px;"><?= esc_html($blocked_ip) ?></code></td>
		</tr>
		<tr>
			<td style="padding: 4px 16px 4px 0; vertical-align: top; font-weight: 600;"><?= esc_html__('Blocked for', 'baselayer') ?></td>
			<td style="padding: 4px 0; vertical-align: top;"><?= esc_html($lockout_duration) ?></td>
		</tr>
		<tr>
			<td style="padding: 4px 16px 4px 0; vertical-align: top; font-weight: 600;"><?= esc_html__('Threshold', 'baselayer') ?></td>
			<td style="padding: 4px 0; vertical-align: top;">
				<?php
				echo esc_html(
					sprintf(
						/* translators: 1: number of failed attempts, 2: observation window in minutes */
						_n('%1$d failed attempt within %2$d minutes', '%1$d failed attempts within %2$d minutes', (int) $attempts, 'baselayer'),
						(int) $attempts,
						(int) $window_minutes
					)
				);
				?>
			</td>
		</tr>
	</tbody>
</table>

<p style="margin: 0 0 16px; font-size: 16px; line-height: 1.5; color: #1f2937;">
	<?php
	echo wp_kses(
		sprintf(
			/* translators: %s: URL to Developer › Security (failed logins / auto-blocked IPs). */
			__('This IP cannot use the site until the block expires. You can unblock the IP manually from the failed-login list in <a href="%s">Developer › Security</a>.', 'baselayer'),
			esc_url($security_url)
		),
		[
			'a' => [
				'href' => true,
			],
		]
	);
	?>
</p>

<p class="bl-mail-weekly-report-has-link" style="margin: 0; font-size: 14px; line-height: 1.5; color: #64748b;">
	<?= esc_html__('Sent to:', 'baselayer') ?> <?= esc_html($to_email) ?><br>
	<?= esc_html__('Sent at:', 'baselayer') ?> <?= esc_html($sent_at) ?>
</p>
