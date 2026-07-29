<?php get_header(); ?>

<main class="content__wrapper">
	<div class="content__container container">

		<?php
		$hero_post_id = (int) get_queried_object_id();
		$hero_active = function_exists('bl_hero_get_context') && bl_hero_get_context($hero_post_id) !== null;
		if ($hero_active) {
			bl_render_template('hero', ['post_id' => $hero_post_id]);
		}
		?>

		<?= bl_breadcrumbs() ?>

		<div class="content__content">
			<?php
			while (have_posts()) {
				the_post();

				if (!$hero_active && bl_page_should_show_title((int) get_the_ID())) {
					echo '<h1>' . esc_html(get_the_title()) . '</h1>';
				}

				the_content();
			}
			?>
		</div>

	</div>
</main>

<?php get_footer(); ?>
