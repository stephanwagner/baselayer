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
		'month_filter' => false,
		'taxonomy' => '',
		'archive_slug' => '',
		'archive_url' => '',
	];

$design = isset($ctx['design']) ? (string) $ctx['design'] : 'list';
$heading = isset($ctx['heading']) ? (string) $ctx['heading'] : __('Events', 'baselayer-events');
$empty = isset($ctx['empty']) ? (string) $ctx['empty'] : __('No events found.', 'baselayer-events');
$post_type = isset($ctx['post_type']) ? (string) $ctx['post_type'] : '';
$taxonomy = isset($ctx['taxonomy']) ? (string) $ctx['taxonomy'] : '';
$show_category = !empty($ctx['category_filter']) && !is_tax() && $taxonomy !== '';
$filter_terms = $show_category && function_exists('bl_events_archive_filter_terms')
	? bl_events_archive_filter_terms($taxonomy)
	: [];
$show_category = $show_category && $filter_terms !== [];
$selected_term_id = $show_category && function_exists('bl_events_archive_filter_term_id')
	? bl_events_archive_filter_term_id($taxonomy)
	: 0;
$category_query_var = $show_category && function_exists('bl_events_archive_filter_query_var')
	? bl_events_archive_filter_query_var($taxonomy)
	: '';

$show_month = !empty($ctx['month_filter']);
$from_query_var = function_exists('bl_events_archive_from_query_var')
	? bl_events_archive_from_query_var()
	: 'bl_event_from';
$from_options = ($show_month && function_exists('bl_events_archive_from_month_options'))
	? bl_events_archive_from_month_options()
	: [];
$selected_from = ($show_month && function_exists('bl_events_archive_selected_from_month'))
	? bl_events_archive_selected_from_month()
	: '';
$occupied_months = ($show_month && $post_type !== '' && function_exists('bl_events_archive_occupied_months'))
	? bl_events_archive_occupied_months($post_type)
	: [];
$occupied_lookup = array_fill_keys($occupied_months, true);

$form_action = '';
if (is_tax()) {
	$term = get_queried_object();
	if ($term instanceof \WP_Term) {
		$link = get_term_link($term);
		$form_action = is_string($link) && !is_wp_error($link) ? $link : '';
	}
} elseif (isset($ctx['archive_url']) && is_string($ctx['archive_url'])) {
	$form_action = $ctx['archive_url'];
}

$show_filters = $form_action !== '' && ($show_category || ($show_month && $from_options !== []));

$pagination_args = [];
if ($show_month && $selected_from !== '') {
	$pagination_args[$from_query_var] = $selected_from;
}
if ($show_category && $category_query_var !== '' && $selected_term_id > 0) {
	$term = get_term($selected_term_id, $taxonomy);
	if ($term instanceof \WP_Term) {
		$pagination_args[$category_query_var] = $term->slug;
	}
}

get_header();
?>

<main class="bl-events-archive bl-events-archive--<?= esc_attr($design) ?>">
	<div class="bl-events-archive__inner">
		<header class="bl-events-archive__header<?= $show_filters ? ' bl-events-archive__header--has-filter' : '' ?>">
			<h1 class="bl-events-archive__title"><?= esc_html($heading) ?></h1>

			<?php if ($show_filters) { ?>
				<form class="bl-events-archive__filters" method="get" action="<?= esc_url($form_action) ?>">
					<?php if ($show_month && $from_options !== []) { ?>
						<div class="bl-events-archive__filter bl-events-archive__filter--from">
							<label class="screen-reader-text" for="bl-events-archive-from">
								<?= esc_html__('From month', 'baselayer-events') ?>
							</label>
							<select
								id="bl-events-archive-from"
								name="<?= esc_attr($from_query_var) ?>"
								onchange="this.form.submit()"
							>
								<option value=""><?= esc_html__('From today', 'baselayer-events') ?></option>
								<?php foreach ($from_options as $opt) {
									$key = (string) ($opt['key'] ?? '');
									$label = (string) ($opt['label'] ?? '');
									if ($key === '' || $label === '') {
										continue;
									}
									$has_events = isset($occupied_lookup[$key]);
									?>
									<option
										value="<?= esc_attr($key) ?>"
										<?= selected($selected_from, $key, false) ?>
										<?= $has_events ? '' : ' disabled' ?>
									>
										<?= esc_html($label) ?>
									</option>
								<?php } ?>
							</select>
						</div>
					<?php } ?>

					<?php if ($show_category && $category_query_var !== '') { ?>
						<div class="bl-events-archive__filter bl-events-archive__filter--category">
							<label class="screen-reader-text" for="bl-events-archive-filter">
								<?= esc_html__('Filter by category', 'baselayer-events') ?>
							</label>
							<select
								id="bl-events-archive-filter"
								name="<?= esc_attr($category_query_var) ?>"
								onchange="this.form.submit()"
							>
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
						</div>
					<?php } ?>

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
					$loop_post_id = (int) get_the_ID();
					$month_key = function_exists('bl_events_archive_month_key')
						? bl_events_archive_month_key($loop_post_id)
						: '';
					$month_label = function_exists('bl_events_archive_month_label')
						? bl_events_archive_month_label($loop_post_id)
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
						'post_id' => $loop_post_id,
					]);
				}
				?>
			</div>

			<?php
			the_posts_pagination([
				'mid_size' => 1,
				'prev_text' => __('Previous', 'baselayer-events'),
				'next_text' => __('Next', 'baselayer-events'),
				'add_args' => $pagination_args,
			]);
			?>
		<?php } else { ?>
			<p class="bl-events-archive__empty"><?= esc_html($empty) ?></p>
		<?php } ?>
	</div>
</main>

<?php
get_footer();
