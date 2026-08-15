<?php
/**
 * Article list block (BaseLayer Blocks).
 */

$post_type = function_exists('bl_article_list_resolve_post_type')
	? bl_article_list_resolve_post_type(bl_block_field('post_type'))
	: (string) (bl_block_field('post_type') ?: '');
$post_taxonomy = bl_block_field('post_taxonomy');
$has_category_filters = (bool) bl_block_field('has_category_filters');
$has_limit = (bool) bl_block_field('has_limit');
$limit_type = (string) (bl_block_field('limit_type') ?: 'pagination');
$limit = bl_block_field('limit');
$order_by = (string) (bl_block_field('order_by') ?: 'date');
$order_direction = strtoupper((string) (bl_block_field('order_direction') ?: 'DESC'));
$design = (string) (bl_block_field('design') ?: 'list');

if ($post_type === '') {
	return;
}

if (!in_array($order_direction, ['ASC', 'DESC'], true)) {
	$order_direction = 'DESC';
}

$posts_per_page = -1;
$paged = 1;
$uses_pagination = false;
if ($has_limit) {
	if ($limit_type === '') {
		$limit_type = 'pagination';
	}
	$posts_per_page = is_numeric($limit) ? (int) $limit : 0;
	if ($limit_type === 'limit') {
		$posts_per_page = $posts_per_page > 0 ? $posts_per_page : 20;
	} else {
		$uses_pagination = true;
		$paged = max(1, (int) get_query_var('paged'), (int) get_query_var('page'));
		$posts_per_page = $posts_per_page > 0 ? $posts_per_page : 20;
	}
}

$post_taxonomy_term = function_exists('bl_article_list_post_taxonomy_term')
	? bl_article_list_post_taxonomy_term($post_type, $post_taxonomy)
	: null;
$taxonomy = function_exists('bl_cpt_filter_taxonomy') ? bl_cpt_filter_taxonomy($post_type) : '';
if ($post_taxonomy_term !== null) {
	$taxonomy = $post_taxonomy_term['taxonomy'];
}
$editor_default_term_id = $post_taxonomy_term['term_id'] ?? 0;
$selected_term_id = ($taxonomy !== '' && function_exists('bl_article_list_selected_term_id'))
	? bl_article_list_selected_term_id($taxonomy, $editor_default_term_id, 'block')
	: 0;

if ($has_category_filters && $taxonomy === '') {
	$has_category_filters = false;
}

$form_action = function_exists('bl_article_list_block_form_action') ? bl_article_list_block_form_action() : '';
$scroll_anchor = '';
if (function_exists('bl_article_list_block_scroll_anchor')) {
	// Helper expects an ACF-style block array; pass slug for stable id when available.
	$scroll_anchor = bl_article_list_block_scroll_anchor([
		'id'   => 'baselayer-article-list',
		'name' => 'baselayer/article-list',
	]);
}

$query_args = [
	'post_type'      => $post_type,
	'posts_per_page' => $posts_per_page,
	'orderby'        => $order_by,
	'order'          => $order_direction,
	'paged'          => $paged,
];
if (!$uses_pagination) {
	$query_args['no_found_rows'] = true;
}

$tax_query = function_exists('bl_article_list_build_tax_query')
	? bl_article_list_build_tax_query($taxonomy, $selected_term_id)
	: [];
if ($tax_query !== []) {
	$query_args['tax_query'] = $tax_query;
}

if (function_exists('bl_is_event_post_type') && bl_is_event_post_type($post_type)
	&& function_exists('bl_event_apply_public_listing_query_args')) {
	$query_args = bl_event_apply_public_listing_query_args($query_args);
}

$query = new WP_Query($query_args);
$posts = $query->posts;

$pagination_args = [];
if ($uses_pagination && $query->max_num_pages > 1) {
	$pagination_args = [
		'pagination_base_url' => $form_action,
		'add_args'            => function_exists('bl_article_list_active_filter_query_args')
			? bl_article_list_active_filter_query_args($taxonomy, $selected_term_id, 'block')
			: [],
	];
	if ($scroll_anchor !== '') {
		$pagination_args['scroll_anchor'] = $scroll_anchor;
	}
}

$class_names = ['bl-wp-block', '-baselayer-block', 'article-list__wrapper', '-block'];
$wrapper_attributes = get_block_wrapper_attributes([
	'class' => implode(' ', $class_names),
]);
?>
<div <?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
	<div class="article-list__scroll-anchor"<?php echo $scroll_anchor !== '' ? ' id="' . esc_attr($scroll_anchor) . '"' : ''; ?>></div>
	<?php if ($has_category_filters && $taxonomy !== '') : ?>
		<?php
		bl_render_template('article-list-filter', [
			'taxonomy'         => $taxonomy,
			'selected_term_id' => $selected_term_id,
			'form_action'      => $form_action,
			'scroll_anchor'    => $scroll_anchor,
			'filter_context'   => 'block',
		]);
		?>
	<?php endif; ?>

	<?php if (!empty($posts)) : ?>
		<div class="article-list__container">
			<div class="article-list__items -design-<?php echo esc_attr($design); ?>">
				<?php
				foreach ($posts as $post) {
					$GLOBALS['post'] = $post;
					setup_postdata($post);
					bl_render_template('article-preview');
				}
				wp_reset_postdata();
				?>
			</div>
		</div>
	<?php else : ?>
		<div class="article-list__empty"><?php echo esc_html__('No posts found.', 'baselayer'); ?></div>
	<?php endif; ?>

	<?php if ($pagination_args !== [] && function_exists('bl_render_pagination_for_query')) : ?>
		<?php bl_render_pagination_for_query($query, $pagination_args); ?>
	<?php endif; ?>
</div>
