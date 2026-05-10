<?php

// Image styles

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