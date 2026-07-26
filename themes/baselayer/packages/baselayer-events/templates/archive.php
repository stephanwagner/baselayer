<?php

defined('ABSPATH') || exit;

/**
 * Standalone event CPT / category archive.
 * Themes can override with archive-{post_type}.php, archive-{slug}.php, or taxonomy-{tax}.php.
 */

$ctx = function_exists('bl_events_archive_context')
	? bl_events_archive_context()
	: [
		'post_type' => '',
		'heading' => __('Events', 'baselayer-events'),
		'empty' => __('No events found.', 'baselayer-events'),
		'design' => 'list',
		'category_filter' => false,
		'taxonomy' => '',
		'archive_slug' => '',
		'archive_url' => '',
	];

$design = isset($ctx['design']) ? (string) $ctx['design'] : 'list';
$heading = isset($ctx['heading']) ? (string) $ctx['heading'] : __('Events', 'baselayer-events');
$empty = isset($ctx['empty']) ? (string) $ctx['empty'] : __('No events found.', 'baselayer-events');
$taxonomy = isset($ctx['taxonomy']) ? (string) $ctx['taxonomy'] : '';
$show_filter = !empty($ctx['category_filter']) && !is_tax() && $taxonomy !== '';
$filter_terms = $show_filter && function_exists('bl_events_archive_filter_terms')
	? bl_events_archive_filter_terms($taxonomy)
	: [];
$show_filter = $show_filter && $filter_terms !== [];
$selected_term_id = $show_filter && function_exists('bl_events_archive_filter_term_id')
	? bl_events_archive_filter_term_id($taxonomy)
	: 0;
$query_var = $show_filter && function_exists('bl_events_archive_filter_query_var')
	? bl_events_archive_filter_query_var($taxonomy)
	: '';
$form_action = isset($ctx['archive_url']) && is_string($ctx['archive_url']) ? $ctx['archive_url'] : '';

get_header();
?>

<main class="bl-events-archive bl-events-archive--<?= esc_attr($design) ?>">
	<div class="bl-events-archive__inner">
		<header class="bl-events-archive__header<?= $show_filter ? ' bl-events-archive__header--has-filter' : '' ?>">
			<h1 class="bl-events-archive__title"><?= esc_html($heading) ?></h1>

			<?php if ($show_filter && $query_var !== '' && $form_action !== '') { ?>
				<form class="bl-events-archive__filter" method="get" action="<?= esc_url($form_action) ?>">
					<label class="screen-reader-text" for="bl-events-archive-filter">
						<?= esc_html__('Filter by category', 'baselayer-events') ?>
					</label>
					<select id="bl-events-archive-filter" name="<?= esc_attr($query_var) ?>" onchange="this.form.submit()">
						<option value=""><?= esc_html__('All categories', 'baselayer-events') ?></option>
						<?php foreach ($filter_terms as $term) { ?>
							<option
								value="<?= esc_attr($term->slug) ?>"
								<?= selected($selected_term_id, (int) $term->term_id, false) ?>
							>
								<?= esc_html($term->name) ?>
							</option>
						<?php } ?>
					</select>
					<noscript>
						<button type="submit"><?= esc_html__('Filter', 'baselayer-events') ?></button>
					</noscript>
				</form>
			<?php } ?>
		</header>

		<?php if (have_posts()) { ?>
			<div class="bl-events-archive__items">
				<?php
				$current_month = null;
				while (have_posts()) {
					the_post();
					$post_id = (int) get_the_ID();
					$month_key = function_exists('bl_events_archive_month_key')
						? bl_events_archive_month_key($post_id)
						: '';
					$month_label = function_exists('bl_events_archive_month_label')
						? bl_events_archive_month_label($post_id)
						: '';

					if ($month_key !== '' && $month_key !== $current_month) {
						$current_month = $month_key;
						if ($month_label !== '') {
							printf(
								'<h2 class="bl-events-archive__month">%s</h2>',
								esc_html($month_label)
							);
						}
					}

					echo bl_events_get_template_html('event-preview', [ // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
						'post_id' => $post_id,
					]);
				}
				?>
			</div>

			<?php
			the_posts_pagination([
				'mid_size' => 1,
				'prev_text' => __('Previous', 'baselayer-events'),
				'next_text' => __('Next', 'baselayer-events'),
			]);
			?>
		<?php } else { ?>
			<p class="bl-events-archive__empty"><?= esc_html($empty) ?></p>
		<?php } ?>
	</div>
</main>

<?php
get_footer();
