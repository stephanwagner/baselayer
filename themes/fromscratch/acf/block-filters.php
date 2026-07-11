<?php

// Field post type

global $fs_selected_article_list_post_type;

add_filter('acf/load_field/name=post_type', function ($field) {

    $field['choices'] = [];

    $slugs = function_exists('fs_article_list_available_post_types')
        ? fs_article_list_available_post_types()
        : [];

    foreach ($slugs as $slug) {
        $post_type = get_post_type_object($slug);
        if (!$post_type instanceof WP_Post_Type) {
            continue;
        }

        $field['choices'][$post_type->name] = $post_type->labels->name;
    }

    return $field;
});

add_filter('acf/prepare_field/name=post_type', function ($field) {

    global $fs_selected_article_list_post_type;

    $fs_selected_article_list_post_type = $field['value'];

    if (!$fs_selected_article_list_post_type && !empty($field['default_value'])) {
        $fs_selected_article_list_post_type = $field['default_value'];
    }

    if (!$fs_selected_article_list_post_type && sizeof($field['choices']) > 0) {
        $fs_selected_article_list_post_type = array_keys($field['choices'])[0];
    }

    return $field;
});


// Field post taxonomy

add_filter('acf/prepare_field/name=post_taxonomy', function ($field) {

    global $fs_selected_article_list_post_type;

    if (!$fs_selected_article_list_post_type) {
        return false;
    }

    $taxonomy = fs_cpt_filter_taxonomy($fs_selected_article_list_post_type);

    if ($taxonomy === '') {
        return false;
    }

    $terms = get_terms([
        'taxonomy'   => $taxonomy,
        'hide_empty' => false,
    ]);

    if (is_wp_error($terms) || $terms === []) {
        $field['choices'] = [];
        return $field;
    }

    $field['choices'] = [];

    foreach ($terms as $term) {
        $field['choices'][$term->term_id] = $term->name;
    }

    return $field;
});
