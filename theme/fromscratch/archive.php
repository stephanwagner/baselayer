<?php

/**
 * Public archive listings for custom post types (`has_archive` in config).
 * Not used for a default blog posts index; build listings with pages/blocks instead.
 */

defined('ABSPATH') || exit;

get_header();

$archive_heading = fs_archive_heading();

$archive_type = fs_archive_cpt_type();
?>

<div class="content__wrapper">
	<div class="content__container container">

		<?= fs_breadcrumbs() ?>

		<div class="content__content">

			<h1><?php echo wp_kses_post($archive_heading); ?></h1>

			<?php if (have_posts()) { ?>
				<?php /*if ($archive_type === 'event') : ?>
					<div class="event-archive">
						<?php
						$month_marker = '';
						while (have_posts()) {
							the_post();
							$start_ts = (int) get_post_meta(get_the_ID(), FS_EVENT_META_START_TS, true);
							if ($start_ts > 0) {
								$month_label = wp_date('F Y', $start_ts);
							} else {
								$sd = get_post_meta(get_the_ID(), FS_EVENT_META_START_DATE, true);
								$month_label = is_string($sd) && preg_match('/^\d{4}-\d{2}-\d{2}$/', $sd)
									? wp_date('F Y', strtotime($sd . ' 12:00:00'))
									: '';
							}
							if ($month_label !== '' && $month_label !== $month_marker) {
								$month_marker = $month_label;
								echo '<h2 class="event-archive__month">' . esc_html($month_label) . '</h2>';
							}
							// TODO
							// TODO fs_render_template('__content-event');
						}
						?>
					</div>
				<?php else : */ ?>

				<div class="article-list__container">
					<div class="article-list__items -design-<?= esc_attr(fs_archive_design()) ?>">
						<?php
						while (have_posts()) {
							the_post();
							fs_render_template('article-preview');
						}
						?>
					</div>
				</div>

				<?php
				fs_render_template('pagination');
				?>
			<?php } else { ?>
				<div class="article-list__empty"><?= esc_html(fs_cpt_text('empty')) ?></div>
			<?php } ?>
		</div>

	</div>
</div>

<?php get_footer(); ?>