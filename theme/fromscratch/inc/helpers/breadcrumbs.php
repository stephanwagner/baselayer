<?php
function fs_breadcrumbs(array $args = []): string
{
    $defaults = [
        'home_label' => __('Home', 'fromscratch'),
        'home_url'   => home_url('/'),
        'separator'  => '›'
    ];

    $args = wp_parse_args($args, $defaults);

    // `separator_html` is the separator content only; output between items as `<li class="fs-breadcrumbs__separator">`.
    if (! array_key_exists('separator_html', $args)) {
        $args['separator_html'] = esc_html($args['separator']);
    }

    if (is_front_page()) {
        return '';
    }

    if (is_404()) {
        return '';
    }

    $items = [];

    // Home
    $items[] = [
        'label' => $args['home_label'],
        'url'   => $args['home_url'],
    ];

    // Pages (hierarchical)
    if (is_page()) {
        global $post;

        $parents = array_reverse(get_post_ancestors($post));
        foreach ($parents as $parent_id) {
            $items[] = [
                'label' => get_the_title($parent_id),
                'url'   => get_permalink($parent_id),
            ];
        }

        $items[] = [
            'label' => get_the_title(),
            'url'   => null,
        ];
    }

    // Posts
    elseif (is_single()) {
        $post_type = get_post_type();

        // Blog archive (config) or legacy Posts page.
        if ($post_type === 'post') {
            if (function_exists('fs_post_type_has_config_archive') && fs_post_type_has_config_archive('post')) {
                $label = function_exists('fs_cpt_archive_label') ? fs_cpt_archive_label('post') : '';
                $archive_url = get_post_type_archive_link('post');
                if ($label !== '' && is_string($archive_url) && $archive_url !== '') {
                    $items[] = [
                        'label' => $label,
                        'url'   => $archive_url,
                    ];
                }
            } else {
                $blog_id = get_option('page_for_posts');

                if ($blog_id) {
                    $items[] = [
                        'label' => get_the_title($blog_id),
                        'url'   => get_permalink($blog_id),
                    ];
                }
            }
        }

        // CPT archive
        elseif ($post_type !== 'page') {
            $obj = get_post_type_object($post_type);

            if ($obj && ! empty($obj->has_archive)) {
                $label = function_exists('fs_cpt_archive_label') ? fs_cpt_archive_label($post_type) : (string) $obj->labels->name;
                if ($label !== '') {
                    $items[] = [
                        'label' => $label,
                        'url'   => get_post_type_archive_link($post_type),
                    ];
                }
            }
        }

        // Hierarchical CPT (and any hierarchical singular): parent chain like pages.
        global $post;
        $singular = ($post instanceof \WP_Post) ? $post : get_queried_object();
        if ($singular instanceof \WP_Post && is_post_type_hierarchical($singular->post_type)) {
            $parents = array_reverse(get_post_ancestors($singular));
            foreach ($parents as $parent_id) {
                $items[] = [
                    'label' => get_the_title($parent_id),
                    'url'   => get_permalink($parent_id),
                ];
            }
        }

        $items[] = [
            'label' => get_the_title(),
            'url'   => null,
        ];
    }

    // Blog posts index (static front page + separate posts page)
    elseif (is_home()) {
        $blog_id = (int) get_option('page_for_posts');

        if ($blog_id) {
            $items[] = [
                'label' => get_the_title($blog_id),
                'url'   => null,
            ];
        }
    }

    // Search results
    elseif (is_search()) {
        $items[] = [
            'label' => __('Search results', 'fromscratch'),
            'url' => null,
        ];
    }

    // Archive
    elseif (is_archive()) {
        $label = '';
        if (is_post_type_archive()) {
            $pto = get_queried_object();
            if ($pto instanceof \WP_Post_Type && function_exists('fs_cpt_archive_label')) {
                $label = fs_cpt_archive_label($pto->name);
            }
        }
        if ($label === '') {
            add_filter('get_the_archive_title_prefix', '__return_empty_string', 99);
            $label = wp_strip_all_tags(get_the_archive_title());
            remove_filter('get_the_archive_title_prefix', '__return_empty_string', 99);
        }

        $items[] = [
            'label' => $label,
            'url'   => null,
        ];
    }

    // Unsupported context would only output "Home" — omit rather than mislead.
    if (count($items) < 2) {
        return '';
    }

    // Build HTML
    $nav_label = esc_attr__('Breadcrumb', 'fromscratch');

    $html = '<nav class="fs-breadcrumbs__container" aria-label="' . $nav_label . '">';
    $html .= '<ol class="fs-breadcrumbs__list">';

    $last_index = count($items) - 1;

    foreach ($items as $index => $item) {
        $html .= '<li class="fs-breadcrumbs__item">';

        if ($item['url']) {
            $html .= '<a class="fs-breadcrumbs__item-link" href="' . esc_url($item['url']) . '">'
                . esc_html($item['label']) . '</a>';
        } else {
            $current = ($index === $last_index) ? ' aria-current="page"' : '';
            $html .= '<span class="fs-breadcrumbs__item-label"' . $current . '>' . esc_html($item['label']) . '</span>';
        }

        $html .= '</li>';

        if ($index < $last_index) {
            $html .= '<li class="fs-breadcrumbs__separator" aria-hidden="true">'
                . $args['separator_html']
                . '</li>';
        }
    }

    $html .= '</ol></nav>';

    return $html;
}
