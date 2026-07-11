<?php get_header(); ?>

<main class="content__wrapper">
	<div class="content__container container">

		<?php
		if (have_posts()) {
			while (have_posts()) {
				the_post();
				the_content();
			}
		}
		?>
	</div>
</main>

<?php get_footer(); ?>
