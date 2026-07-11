<?php

// Class names
$classNames = ['fs-wp-block'];

// ID for specific styling
$classNames[] = $block['id'];

// Add class provided via class_field in WP backend
if (!empty($block['className'])) {
    $classNames[] = $block['className'];
}

// Add wrapper class
$classNames[] = 'article-list__wrapper';
$classNames[] = '-block';

// Add margin class
$classNames[] = '-content-margin-m';

// Fields (block JSON data fallback — get_field alone can miss saved block attrs)
$postType = fs_acf_block_field($block, 'post-type');
$postTaxonomy = fs_acf_block_field($block, 'post-taxonomy');
$hasCategoryFilters = (bool) fs_acf_block_field($block, 'has-category-filters');
$queryLimit = fs_article_list_block_query_limit($block);
$usesPagination = $queryLimit['uses_pagination'];
$sortBy = fs_acf_block_field($block, 'sort-by');
$sortDirection = fs_acf_block_field($block, 'sort-direction');
$design = fs_acf_block_field($block, 'design');

if (!is_string($postType) || $postType === '') {
    return;
}

$postTaxonomyTerm = fs_article_list_post_taxonomy_term($postType, $postTaxonomy);
$taxonomy = fs_cpt_filter_taxonomy($postType);
if ($postTaxonomyTerm !== null) {
    $taxonomy = $postTaxonomyTerm['taxonomy'];
}
$editorDefaultTermId = $postTaxonomyTerm['term_id'] ?? 0;
$selectedTermId = $taxonomy !== ''
    ? fs_article_list_selected_term_id($taxonomy, $editorDefaultTermId, 'block')
    : 0;

if ($hasCategoryFilters && $taxonomy === '') {
    $hasCategoryFilters = false;
}

$formAction = fs_article_list_block_form_action();
$scrollAnchor = fs_article_list_block_scroll_anchor($block);

// Posts per page
$postsPerPage = $queryLimit['posts_per_page'];
$paged = $queryLimit['paged'];

$queryArgs = [
    'post_type'      => $postType,
    'posts_per_page' => $postsPerPage,
    'orderby'        => $sortBy,
    'order'          => $sortDirection,
    'paged'          => $paged,
];

$taxQuery = fs_article_list_build_tax_query($taxonomy, $selectedTermId);
if ($taxQuery !== []) {
    $queryArgs['tax_query'] = $taxQuery;
}

$query = new WP_Query($queryArgs);
$posts = $query->posts;

$paginationArgs = [];
if ($usesPagination && $query->max_num_pages > 1) {
    $paginationArgs = [
        'pagination_base_url' => $formAction,
        'add_args'            => fs_article_list_active_filter_query_args($taxonomy, $selectedTermId, 'block'),
    ];
    if ($scrollAnchor !== '') {
        $paginationArgs['scroll_anchor'] = $scrollAnchor;
    }
}
?>

<div class="<?= implode(' ', $classNames) ?>">
    <div class="article-list__scroll-anchor"<?= $scrollAnchor !== '' ? ' id="' . esc_attr($scrollAnchor) . '"' : '' ?>></div>
    <?php if ($hasCategoryFilters && $taxonomy !== '') { ?>
        <?php fs_render_template('article-list-filter', [
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
                    fs_render_template('article-preview');
                }
                wp_reset_postdata();
                ?>
            </div>
        </div>
    <?php } else { ?>
        <div class="article-list__empty"><?= esc_html__('No posts found.', 'fromscratch') ?></div>
    <?php } ?>

    <?php if ($paginationArgs !== []) { ?>
        <?php fs_render_pagination_for_query($query, [
            'aria_label'      => __('Articles pagination', 'fromscratch'),
            'nav_class'       => 'article-list__pagination',
            'pagination_args' => $paginationArgs,
        ]); ?>
    <?php } ?>
</div>
