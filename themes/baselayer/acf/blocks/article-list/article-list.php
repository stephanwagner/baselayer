<?php

// Class names
$classNames = ['bl-wp-block'];

// ID for specific styling
$classNames[] = $block['id'];

// Add class provided via class_field in WP backend
if (!empty($block['className'])) {
    $classNames[] = $block['className'];
}

// Add wrapper class
$classNames[] = 'article-list__wrapper';
$classNames[] = '-block';

// Fields (block JSON data fallback — get_field alone can miss saved block attrs)
$postType = bl_article_list_resolve_post_type(bl_acf_block_field($block, 'post_type'));
$postTaxonomy = bl_acf_block_field($block, 'post_taxonomy');
$hasCategoryFilters = (bool) bl_acf_block_field($block, 'has_category_filters');
$queryLimit = bl_article_list_block_query_limit($block);
$usesPagination = $queryLimit['uses_pagination'];
$orderBy = bl_acf_block_field_choice_value(bl_acf_block_field($block, 'order_by')) ?: 'date';
$orderDirection = strtoupper(bl_acf_block_field_choice_value(bl_acf_block_field($block, 'order_direction')) ?: 'DESC');
$design = bl_acf_block_field_choice_value(bl_acf_block_field($block, 'design')) ?: 'list';

if ($postType === '') {
    return;
}

if (!in_array($orderDirection, ['ASC', 'DESC'], true)) {
    $orderDirection = 'DESC';
}

$postTaxonomyTerm = bl_article_list_post_taxonomy_term($postType, $postTaxonomy);
$taxonomy = bl_cpt_filter_taxonomy($postType);
if ($postTaxonomyTerm !== null) {
    $taxonomy = $postTaxonomyTerm['taxonomy'];
}
$editorDefaultTermId = $postTaxonomyTerm['term_id'] ?? 0;
$selectedTermId = $taxonomy !== ''
    ? bl_article_list_selected_term_id($taxonomy, $editorDefaultTermId, 'block')
    : 0;

if ($hasCategoryFilters && $taxonomy === '') {
    $hasCategoryFilters = false;
}

$formAction = bl_article_list_block_form_action();
$scrollAnchor = bl_article_list_block_scroll_anchor($block);

// Posts per page
$postsPerPage = $queryLimit['posts_per_page'];
$paged = $queryLimit['paged'];

$queryArgs = [
    'post_type'      => $postType,
    'posts_per_page' => $postsPerPage,
    'orderby'        => $orderBy,
    'order'          => $orderDirection,
    'paged'          => $paged,
];

$taxQuery = bl_article_list_build_tax_query($taxonomy, $selectedTermId);
if ($taxQuery !== []) {
    $queryArgs['tax_query'] = $taxQuery;
}

$query = new WP_Query($queryArgs);
$posts = $query->posts;

$paginationArgs = [];
if ($usesPagination && $query->max_num_pages > 1) {
    $paginationArgs = [
        'pagination_base_url' => $formAction,
        'add_args'            => bl_article_list_active_filter_query_args($taxonomy, $selectedTermId, 'block'),
    ];
    if ($scrollAnchor !== '') {
        $paginationArgs['scroll_anchor'] = $scrollAnchor;
    }
}
?>

<div class="<?= implode(' ', $classNames) ?>">
    <div class="article-list__scroll-anchor"<?= $scrollAnchor !== '' ? ' id="' . esc_attr($scrollAnchor) . '"' : '' ?>></div>
    <?php if ($hasCategoryFilters && $taxonomy !== '') { ?>
        <?php bl_render_template('article-list-filter', [
            'taxonomy'         => $taxonomy,
            'selected_term_id' => $selectedTermId,
            'form_action'      => $formAction,
            'scroll_anchor'    => $scrollAnchor,
            'filter_context'   => 'block',
        ]); ?>
    <?php } ?>

    <?php if (!empty($posts)) { ?>
        <div class="article-list__container">
            <div class="article-list__items -design-<?= esc_attr($design) ?>">
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
    <?php } else { ?>
        <div class="article-list__empty"><?= esc_html__('No posts found.', 'baselayer') ?></div>
    <?php } ?>

    <?php if ($paginationArgs !== []) { ?>
        <?php bl_render_pagination_for_query($query, [
            'aria_label'      => __('Articles pagination', 'baselayer'),
            'nav_class'       => 'article-list__pagination',
            'pagination_args' => $paginationArgs,
        ]); ?>
    <?php } ?>
</div>
