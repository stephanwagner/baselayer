<?php defined('ABSPATH') || exit; ?>
<h1
	style="
		margin: 0;
		font-size: 24px;
		line-height: 1.3;
		font-weight: 700;
		text-wrap: balance;
		text-align: center;
	">
	<?= wp_kses(__('Your weekly<br>website report', 'baselayer'), ['br' => []]) ?>
</h1>
<?php
$insights = is_array($insights ?? null) ? $insights : [];

$has_insights = !empty($insights['went_live_last_week'])
	|| !empty($insights['scheduled_upcoming'])
	|| !empty($insights['expired_last_week'])
	|| !empty($insights['expiring_upcoming']);

$has_matomo = !empty($matomo_enabled);

if (!$has_insights && !$has_matomo) {
?>
	<div
		style="
			margin: 32px auto 0;
			font-size: 16px;
			line-height: 1.5;
			color: #64748b;
			text-align: center;
			text-wrap: balance;
			max-width: 400px;
		">
		<?= esc_html__('Everything stayed unchanged last week, no content updates to show.', 'baselayer') ?>
	</div>
	<?php
} else {
	foreach (
		[
			'went_live_last_week' => [
				'title' => __('Published last week', 'baselayer'),
				'th' => [
					'date' => __('Published on', 'baselayer'),
					'label' => __('Page or post', 'baselayer'),
				],
			],
			'scheduled_upcoming' => [
				'title' => __('Upcoming scheduled pages or posts', 'baselayer'),
				'th' => [
					'date' => __('Scheduled on', 'baselayer'),
					'label' => __('Page or post', 'baselayer'),
				],
			],
			'expired_last_week' => [
				'title' => __('Expired last week', 'baselayer'),
				'th' => [
					'date' => __('Expired on', 'baselayer'),
					'label' => __('Page or post', 'baselayer'),
				],
			],
			'expiring_upcoming' => [
				'title' => __('Upcoming expirations', 'baselayer'),
				'th' => [
					'date' => __('Expires on', 'baselayer'),
					'label' => __('Page or post', 'baselayer'),
				],
			],
		] as $key => $data
	) {
		if (!empty($insights[$key])) {
	?>
			<div
				style="
					margin: 24px auto 6px;
					font-size: 16px;
					text-wrap: balance;
					font-weight: 600;
				">
				<?= esc_html($data['title']) ?>
			</div>
			<table
				role="presentation"
				width="100%"
				cellpadding="0"
				cellspacing="0"
				style="
					border: 0;
					border-collapse: collapse;
					font-size: 13px;
				">
				<tr>
					<th style="border-bottom: 1px solid #e2e8f0; padding: 0 6px 4px 0; font-weight: normal; color: #64748b; text-align: left; font-size: 11px; font-weight: 500;"><?= esc_html($data['th']['date']) ?></th>
					<th style="border-bottom: 1px solid #e2e8f0; padding: 0 0 4px 6px; font-weight: normal; color: #64748b; text-align: left; font-size: 11px; font-weight: 500;"><?= esc_html($data['th']['label']) ?></th>
				</tr>
				<?php foreach ($insights[$key] as $row) { ?>
					<tr>
						<td style="padding: 4px 6px 0 0; white-space: nowrap; color: #64748b; vertical-align: top;"><?= esc_html((string) ($row['date'] ?? '')) ?></td>
						<td style="padding: 4px 0 0 6px; vertical-align: top;" class="bl-mail-weekly-report-has-link" width="100%">
							<a href="<?= esc_url((string) ($row['url'] ?? '')) ?>"><?= esc_html((string) ($row['title'] ?? '')) ?></a> <span style="color: #64748b;">(<?= esc_html((string) ($row['post_type'] ?? '')) ?>)</span>
						</td>
					</tr>
				<?php } ?>
			</table>
<?php
		}
	}
}
?>

<?php if ($has_insights && !empty($matomo_enabled)) { ?>
	<div style="margin: 32px 0 0; height: 2px; background: #e2e8f0;"></div>
<?php } ?>

<?php if (!empty($matomo_enabled)) : ?>

	<div
		style="
			margin: 32px auto 16px;
			font-size: 16px;
			text-align: center;
			text-wrap: balance;
			max-width: 320px;
			font-weight: 600;
		">
		<?= wp_kses(__('Visitors and page views <div class="bl-mail__small-mobile-inline">of the last week</div>', 'baselayer'), ['br' => [], 'div' => ['class' => []]]) ?>
	</div>
	<?php if (!empty($daily_chart_url)) : ?>
		<img
			src="<?= esc_url($daily_chart_url) ?>"
			alt=""
			style="
				display: block;
				width: 100%;
				max-width: 100%;
				height: auto;
			">
	<?php endif; ?>
	<table
		role="presentation"
		width="100%"
		cellpadding="0"
		cellspacing="0"
		style="
			border: 0;
			margin-top: 24px;
			border-collapse: collapse;
			font-size: 13px;
			line-height: 1.4;
		">
		<tr>
			<th style="border-bottom: 2px solid #e2e8f0;"></th>
			<th class="bl-mail__table-th" style="border-bottom: 2px solid #e2e8f0; padding: 0 4px 6px; text-align: center; font-weight: 700; color: #2284e5; white-space: nowrap;"><?= wp_kses(__('Unique<br>visitors', 'baselayer'), ['br' => []]) ?></th>
			<th class="bl-mail__table-th" style="border-bottom: 2px solid #e2e8f0; padding: 0 4px 6px; text-align: center; font-weight: 700; color: #8f70cc; white-space: nowrap;"><?= wp_kses(__('Visits<br>total', 'baselayer'), ['br' => []]) ?></th>
			<th class="bl-mail__table-th" style="border-bottom: 2px solid #e2e8f0; padding: 0 4px 6px; text-align: center; font-weight: 700; color: #ff6673; white-space: nowrap;"><?= wp_kses(__('Page<br>views', 'baselayer'), ['br' => []]) ?></th>
		</tr>
		<?php foreach (($daily ?? []) as $row) : ?>
			<?php
			$date_str = isset($row['date']) ? (string) $row['date'] : '';
			$daily_weekday = '';
			$daily_written = '';
			if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $date_str)) {
				$dd = \DateTimeImmutable::createFromFormat('Y-m-d', $date_str, wp_timezone());
				if ($dd instanceof \DateTimeImmutable) {
					$daily_weekday = wp_date('l', $dd->getTimestamp());
					$daily_written = wp_date('j. M Y', $dd->getTimestamp());
				}
			}
			?>
			<tr>
				<td style="border-bottom: 2px solid #e2e8f0; line-height: 1.4; padding: 6px 0"><b style="font-weight: 700;"><?php if ($daily_weekday !== '') : ?><?= esc_html($daily_weekday) ?></b><br><span style="color: #64748b;"><?= esc_html($daily_written) ?></span><?php endif; ?></td>
				<td style="border-bottom: 2px solid #e2e8f0; padding: 6px; text-align: center; font-weight: 700;"><?= esc_html(number_format_i18n((int) ($row['unique'] ?? 0))) ?></td>
				<td style="border-bottom: 2px solid #e2e8f0; padding: 6px; text-align: center;"><?= esc_html(number_format_i18n((int) ($row['visits'] ?? 0))) ?></td>
				<td style="border-bottom: 2px solid #e2e8f0; padding: 6px; text-align: center;"><?= esc_html(number_format_i18n((int) ($row['pageviews'] ?? 0))) ?></td>
			</tr>
		<?php endforeach; ?>
	</table>

	<div
		style="
			margin: 32px auto 16px;
			font-size: 16px;
			text-align: center;
			text-wrap: balance;
			font-weight: 600;
		">
		<?= wp_kses(__('Visitors and page views <div class="bl-mail__small-mobile-inline">of the last 8 weeks</div>', 'baselayer'), ['br' => [], 'div' => ['class' => []]]) ?>
	</div>
	<?php if (!empty($weekly_chart_url)) : ?>
		<img
			src="<?= esc_url($weekly_chart_url) ?>"
			alt=""
			style="
				display: block;
				width: 100%;
				max-width: 100%;
				height: auto;
			">
	<?php endif; ?>
	<table
		role="presentation"
		width="100%"
		cellpadding="0"
		cellspacing="0"
		border="0"
		style="
			border: 0;
			margin-top: 24px;
			border-collapse: collapse;
			font-size: 13px;
			line-height: 1.4;
		">
		<tr>
			<th style="border-bottom: 2px solid #e2e8f0;"></th>
			<th class="bl-mail__table-th" style="border-bottom: 2px solid #e2e8f0; padding: 0 4px 6px; text-align: center; font-weight: 600; color: #2284e5; white-space: nowrap;"><?= wp_kses(__('Unique<br>visitors', 'baselayer'), ['br' => []]) ?></th>
			<th class="bl-mail__table-th" style="border-bottom: 2px solid #e2e8f0; padding: 0 4px 6px; text-align: center; font-weight: 600; color: #8f70cc; white-space: nowrap;"><?= wp_kses(__('Visits<br>total', 'baselayer'), ['br' => []]) ?></th>
			<th class="bl-mail__table-th" style="border-bottom: 2px solid #e2e8f0; padding: 0 4px 6px; text-align: center; font-weight: 600; color: #ff6673; white-space: nowrap;"><?= wp_kses(__('Page<br>views', 'baselayer'), ['br' => []]) ?></th>
		</tr>
		<?php foreach (($weekly ?? []) as $row) : ?>
			<?php
			$week_line = '';
			$monday_written = '';
			if (function_exists('bl_weekly_report_email_iso_week_row_labels')) {
				[$week_line, $monday_written] = bl_weekly_report_email_iso_week_row_labels($row);
			}
			?>
			<tr>
				<td style="border-bottom: 2px solid #e2e8f0; line-height: 1.4; padding: 6px 0"><b style="font-weight: 700;"><?php if ($week_line !== '') : ?><?= esc_html($week_line) ?></b><br><span style="color: #64748b;"><?= esc_html($monday_written) ?></span><?php endif; ?></td>
				<td style="border-bottom: 2px solid #e2e8f0; padding: 6px; text-align: center; font-weight: 700;"><?= esc_html(number_format_i18n((int) ($row['unique'] ?? 0))) ?></td>
				<td style="border-bottom: 2px solid #e2e8f0; padding: 6px; text-align: center;"><?= esc_html(number_format_i18n((int) ($row['visits'] ?? 0))) ?></td>
				<td style="border-bottom: 2px solid #e2e8f0; padding: 6px; text-align: center;"><?= esc_html(number_format_i18n((int) ($row['pageviews'] ?? 0))) ?></td>
			</tr>
		<?php endforeach; ?>
	</table>

<?php else : ?>

	<div
		class="bl-mail-weekly-report-has-link"
		style="
			margin: 32px auto 0;
			font-size: 16px;
			line-height: 1.5;
			color: #64748b;
			text-align: center;
			text-wrap: balance;
		">
		<?php
		$matomo_info = __(
			'Visitor statistics for this report are not enabled yet. A <a href="%s">developer</a> can turn on analytics in <a href="%s">WordPress</a> to show visiter charts and key numbers in future emails.',
			'baselayer'
		);
		echo wp_kses(
			sprintf($matomo_info, esc_url($developer_email_link ?? ''), esc_url($developer_settings_url ?? '')),
			[
				'a' => [
					'href' => [],
				],
			]
		);
		?>
	</div>

<?php endif; ?>

<div
	style="
		padding-top: 32px;
		text-align: center;
	">
	<?php if ($has_matomo && !empty($stats_url)) : ?>
		<div
			style="
				font-size: 17px;
				line-height: 1.4;
				text-align: center;
			">
			<a
				href="<?= esc_url($stats_url) ?>"
				class="bl-mail__button"
				style="
					color: #1f2937;
					text-decoration: none;
					padding: 8px 24px;
					border-radius: 32px;
					background: #e2e8f0;
					display: inline-block;
					transition: background-color 280ms, color 280ms;
				">
				<?= esc_html__('Open analytics', 'baselayer') ?>
			</a>
		</div>
	<?php endif; ?>

	<div
		style="
			<?php if ($has_matomo && !empty($stats_url)) { ?>
			margin-top: 16px;
			<?php } ?>
			font-size: 17px;
			line-height: 1.4;
			text-align: center;
		">
		<a
			href="<?= esc_url($admin_url) ?>"
			class="bl-mail__button"
			style="
				color: #1f2937;
				text-decoration: none;
				padding: 8px 24px;
				border-radius: 32px;
				background: #e2e8f0;
				display: inline-block;
				transition: background-color 280ms, color 280ms;
			">
			<?= esc_html__('Open admin dashboard', 'baselayer') ?>
		</a>
	</div>
</div>