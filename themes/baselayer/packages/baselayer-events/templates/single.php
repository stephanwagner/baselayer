<?php

defined('ABSPATH') || exit;

/**
 * Standalone singular event template.
 * Themes can override with single-{post_type}.php or single-{slug}.php.
 */

get_header();
?>

<main class="bl-events-single">
	<div class="bl-events-single__inner">
		<?php if (have_posts()) { ?>
			<?php
			while (have_posts()) {
				the_post();
				$post_id = (int) get_the_ID();
				?>
				<article id="post-<?= $post_id ?>" <?php post_class('bl-events-single__article'); ?>>
					<header class="bl-events-single__header">
						<h1 class="bl-events-single__title"><?php the_title(); ?></h1>
					</header>

					<?= bl_events_get_template_html('event-date', ['post_id' => $post_id]) // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
					<?= bl_events_get_template_html('event-status', ['post_id' => $post_id]) // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>

					<div class="bl-events-single__content">
						<?php the_content(); ?>
					</div>

					<?= bl_events_get_template_html('event-meta', [ // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
						'post_id' => $post_id,
						'plain_actions' => true,
					]) ?>
				</article>
				<?php
			}
			?>
		<?php } ?>
	</div>
</main>

<?php
get_footer();
