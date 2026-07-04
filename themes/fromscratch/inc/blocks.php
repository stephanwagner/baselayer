<?php

// Images

add_action('init', function () {

    register_block_style('core/image', [
        'name'  => 'framed',
        'label' => __('Framed', 'fromscratch'),
    ]);

    register_block_style('core/image', [
        'name'  => 'round',
        'label' => __('Round', 'fromscratch'),
    ]);

    register_block_style('core/image', [
        'name'  => 'sharp',
        'label' => __('Sharp', 'fromscratch'),
    ]);
}, 100);

// Buttons

add_filter('register_block_type_args', function ($args, $block_type) {
    if ($block_type === 'core/button') {
        foreach (['border', '__experimentalBorder'] as $key) {
            if (isset($args['supports'][$key])) {
                $args['supports'][$key]['radius'] = false;
            }
        }
    }
    return $args;
}, 10, 2);
