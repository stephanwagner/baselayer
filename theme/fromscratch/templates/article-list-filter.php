<?php

defined('ABSPATH') || exit;

$taxonomy = isset($taxonomy) && is_string($taxonomy) ? $taxonomy : '';
$selected_term_id = isset($selected_term_id) ? (int) $selected_term_id : 0;
$form_action = isset($form_action) && is_string($form_action) ? $form_action : '';
$wrapper_class = isset($wrapper_class) && is_string($wrapper_class) ? $wrapper_class : '';

if ($taxonomy === '' || !taxonomy_exists($taxonomy)) {
	return;
}

$terms = fs_article_list_filter_terms($taxonomy);
if ($terms === []) {
	return;
}

$query_var = fs_article_list_filter_query_var($taxonomy);
if ($query_var === '') {
	return;
}

$tax_obj = get_taxonomy($taxonomy);
$all_label = __('All categories', 'fromscratch');
if ($tax_obj instanceof \WP_Taxonomy && isset($tax_obj->labels->name) && is_string($tax_obj->labels->name) && $tax_obj->labels->name !== '') {
	$all_label = sprintf(
		/* translators: %s: taxonomy plural label, e.g. Categories */
		__('All %s', 'fromscratch'),
		$tax_obj->labels->name
	);
}

if ($form_action === '' && is_post_type_archive()) {
	$pto = get_query_var('post_type');
	$post_type = is_array($pto) ? (string) ($pto[0] ?? '') : (string) $pto;
	if ($post_type !== '') {
		$form_action = (string) get_post_type_archive_link($post_type);
	}
}
if ($form_action === '' && is_singular()) {
	$form_action = (string) get_permalink();
}
if ($form_action === '') {
	$form_action = home_url('/');
}

$filter_id = 'fs-article-list-filter-' . sanitize_html_class($taxonomy);
$wrapper_classes = array_filter([
	'article-list__filter',
	$wrapper_class,
]);
?>
<form class="<?= esc_attr(implode(' ', $wrapper_classes)) ?>" method="get" action="<?= esc_url($form_action) ?>" data-article-list-filter>
	<label class="screen-reader-text" for="<?= esc_attr($filter_id) ?>">
		<?= esc_html($all_label) ?>
	</label>
	<div class="article-list__filter-select-container select-container">
		<select class="article-list__filter-select" id="<?= esc_attr($filter_id) ?>" name="<?= esc_attr($query_var) ?>">
			<option value=""><?= esc_html($all_label) ?></option>
			<?php foreach ($terms as $term) { ?>
				<option value="<?= esc_attr($term->slug) ?>"<?= selected($selected_term_id, (int) $term->term_id, false) ?>>
					<?= esc_html($term->name) ?>
				</option>
			<?php } ?>
		</select>
	</div>
</form>
