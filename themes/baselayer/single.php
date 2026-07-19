<?php get_header(); ?>

<main class="content__wrapper">
	<div class="content__container container">

		<?= bl_breadcrumbs() ?>

		<div class="content__content">
			<?php
			while (have_posts()) {
				the_post();

				$post_id = (int) get_the_ID();

				if (bl_page_should_show_title($post_id)) {
					echo '<h1>' . esc_html(get_the_title()) . '</h1>';
				}

				if (function_exists('bl_is_event_post_type') && bl_is_event_post_type(get_post_type())) {
					bl_render_template('event-date', ['post_id' => $post_id]);
					bl_render_template('event-status', ['post_id' => $post_id]);
				}

				the_content();

				if (function_exists('bl_is_event_post_type') && bl_is_event_post_type(get_post_type())) {
					bl_render_template('event-meta', ['post_id' => $post_id]);
				}
			}
			?>
		</div>

	</div>
</main>

<?php get_footer(); ?>