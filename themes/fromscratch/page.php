<?php get_header(); ?>

<main class="content__wrapper">
	<div class="content__container container">

		<?= fs_breadcrumbs() ?>

		<div class="content__content">
			<?php
			while (have_posts()) {
				the_post();

				if (fs_page_should_show_title((int) get_the_ID())) {
					echo '<h1>' . esc_html(get_the_title()) . '</h1>';
				}

				the_content();
			}
			?>
		</div>

	</div>
</main>

<?php get_footer(); ?>