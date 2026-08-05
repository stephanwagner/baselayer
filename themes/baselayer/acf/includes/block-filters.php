<?php

// Field post type

global $bl_selected_article_list_post_type;

/**
 * Ensure repeater/group sub fields have ACF runtime keys (`_name`, `_valid`).
 *
 * When sub fields are stored embedded on the parent (no child acf-field posts),
 * load_field keeps the raw export shape and format_value warns on missing `_name`,
 * so template keys like `number` never appear.
 *
 * @param array<string, mixed> $field
 * @return array<string, mixed>
 */
function bl_acf_ensure_sub_field_runtime_keys($field)
{
	if (!is_array($field) || empty($field['sub_fields']) || !is_array($field['sub_fields'])) {
		return $field;
	}

	if (!function_exists('acf_get_valid_field')) {
		return $field;
	}

	foreach ($field['sub_fields'] as $index => $sub_field) {
		if (!is_array($sub_field)) {
			continue;
		}
		$field['sub_fields'][$index] = acf_get_valid_field($sub_field);
	}

	return $field;
}

add_filter('acf/load_field/type=repeater', 'bl_acf_ensure_sub_field_runtime_keys', 20);
add_filter('acf/load_field/type=group', 'bl_acf_ensure_sub_field_runtime_keys', 20);

add_filter('acf/load_field/name=post_type', function ($field) {

    $field['choices'] = [];

    $slugs = function_exists('bl_article_list_available_post_types')
        ? bl_article_list_available_post_types()
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

    global $bl_selected_article_list_post_type;

    $bl_selected_article_list_post_type = $field['value'];

    if (!$bl_selected_article_list_post_type && !empty($field['default_value'])) {
        $bl_selected_article_list_post_type = $field['default_value'];
    }

    if (!$bl_selected_article_list_post_type && sizeof($field['choices']) > 0) {
        $bl_selected_article_list_post_type = array_keys($field['choices'])[0];
    }

    return $field;
});


// Field post taxonomy

add_filter('acf/prepare_field/name=post_taxonomy', function ($field) {

    global $bl_selected_article_list_post_type;

    if (!$bl_selected_article_list_post_type) {
        return false;
    }

    $taxonomy = bl_cpt_filter_taxonomy($bl_selected_article_list_post_type);

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
