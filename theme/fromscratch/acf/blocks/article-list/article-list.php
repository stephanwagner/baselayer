<?php

// Class names
$classNames = ['fs-wp-block'];

// ID for specific styling
$classNames[] = $block['id'];

// Add class provided via class_field in WP Backend
if (!empty($block['className'])) {
    $classNames[] = $block['className'];
}

// Add wrapper class
$classNames[] = 'article-list__wrapper';

// Add margin class
$classNames[] = '-content-margin-m';

// Fields
$postType = get_field('post-type');
$postTaxonomy = get_field('post-taxonomy');
$hasCategoryFilters = (bool) get_field('has-category-filters');
$hasLimit = get_field('has-limit');
$limitType = get_field('limit-type');
$limit = get_field('limit');
$sortBy = get_field('sort-by');
$sortDirection = get_field('sort-direction');
$design = get_field('design');

if (!is_string($postType) || $postType === '') {
    return;
}

$taxonomy = '';
$selectedTermId = 0;
if ($hasCategoryFilters) {
    $taxonomy = fs_cpt_filter_taxonomy($postType);
    if ($taxonomy !== '') {
        $editorDefaultTermId = is_numeric($postTaxonomy) ? (int) $postTaxonomy : 0;
        $selectedTermId = fs_article_list_selected_term_id($taxonomy, $editorDefaultTermId);
    } else {
        $hasCategoryFilters = false;
    }
}

// Posts per page
$postsPerPage = -1;
$paged = 1;
if ($hasLimit && $limitType === 'pagination') {
    $postsPerPage = (int) $limit;
    $paged = max(1, (int) get_query_var('paged'), (int) get_query_var('page'));
}

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

$filterPaginationArgs = $taxonomy !== ''
    ? ['add_args' => fs_article_list_active_filter_query_args($taxonomy, $selectedTermId)]
    : [];

$formAction = is_singular() ? (string) get_permalink() : '';
?>

<div class="<?= implode(' ', $classNames) ?>">
    <?php if ($hasCategoryFilters && $taxonomy !== '') { ?>
        <?php fs_render_template('article-list-filter', [
            'taxonomy'         => $taxonomy,
            'selected_term_id' => $selectedTermId,
            'form_action'      => $formAction,
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
            <?php
            if ($hasLimit && $limitType === 'pagination' && $query->max_num_pages > 1) {
                fs_render_pagination_for_query($query, [
                    'aria_label'       => __('Articles pagination', 'fromscratch'),
                    'nav_class'        => 'article-list__pagination',
                    'pagination_args'  => $filterPaginationArgs,
                ]);
            }
            ?>
        </div>
    <?php } else { ?>
        <div class="article-list__empty"><?= esc_html__('No posts found.', 'fromscratch') ?></div>
    <?php } ?>
</div>
