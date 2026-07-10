<?php

defined('ABSPATH') || exit;

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

        if (! isset($args['supports']['typography'])) {
            $args['supports']['typography'] = [];
        }
        $args['supports']['typography']['fontSize'] = false;
    }
    return $args;
}, 10, 2);

/**
 * Disable fit text on text blocks (not configurable via theme.json).
 */
add_filter('block_type_metadata', function (array $metadata): array {
    if (!function_exists('fs_config')) {
        return $metadata;
    }

    $options = fs_config('typography_options');
    if (!is_array($options) || !array_key_exists('fit_text', $options) || $options['fit_text']) {
        return $metadata;
    }

    $blocks = ['core/paragraph', 'core/heading'];
    if (!in_array($metadata['name'] ?? '', $blocks, true)) {
        return $metadata;
    }

    if (!isset($metadata['supports']['typography']) || !is_array($metadata['supports']['typography'])) {
        $metadata['supports']['typography'] = [];
    }

    $metadata['supports']['typography']['fitText'] = false;

    return $metadata;
}, 10, 1);

/**
 * Limit video and image alignment to wide, full, and center.
 */
add_filter('block_type_metadata', function (array $metadata): array {
    if (!in_array($metadata['name'] ?? '', ['core/video', 'core/image', 'core/cover', 'core/pullquote'], true)) {
        return $metadata;
    }

    $metadata['supports']['align'] = ['wide', 'full', 'center'];

    return $metadata;
}, 10, 1);

/**
 * Disable layout-adjacent inspector panels on the cover block.
 */
add_filter('block_type_metadata', function (array $metadata): array {
    if (($metadata['name'] ?? '') !== 'core/cover') {
        return $metadata;
    }

    $metadata['supports']['shadow'] = false;

    if (isset($metadata['supports']['dimensions'])) {
        $metadata['supports']['dimensions'] = false;
    }

    return $metadata;
}, 10, 1);

/**
 * Convert constrained group layout to default before render.
 * Clearing layout lets core fall back to constrained when the theme defines contentSize.
 */
add_filter('render_block_data', function (array $block): array {
    if (($block['blockName'] ?? '') !== 'core/group') {
        return $block;
    }

    $layout = $block['attrs']['layout'] ?? null;
    if (is_array($layout) && ($layout['type'] ?? '') === 'constrained') {
        $block['attrs']['layout'] = ['type' => 'default'];
    }

    return $block;
}, 10, 1);

/**
 * Safety net: strip constrained layout classes from group markup if they still appear.
 */
add_filter('render_block', function (string $content, array $block): string {
    if (($block['blockName'] ?? '') !== 'core/group' || $content === '') {
        return $content;
    }

    if (
        strpos($content, 'is-layout-constrained') === false
        && strpos($content, 'wp-block-group-is-layout-constrained') === false
    ) {
        return $content;
    }

    $content = preg_replace('/\s*wp-block-group-is-layout-constrained\b/', '', $content) ?? $content;
    $content = preg_replace('/\s*is-layout-constrained\b/', '', $content) ?? $content;

    return $content;
}, 10, 2);

/**
 * Icon-only buttons: add front-end class and ensure link markup is non-empty.
 */
add_filter('render_block', function ($content, $block) {
    if (($block['blockName'] ?? '') !== 'core/button') {
        return $content;
    }

    if ($content === '') {
        return $content;
    }

    $attrs = $block['attrs'] ?? [];
    $button_icon = $attrs['buttonIcon'] ?? '';

    $visible_text = fs_button_visible_label($attrs['text'] ?? '');

    if ($visible_text === '' && preg_match('/<a\b[^>]*\bwp-block-button__link\b[^>]*>(.*?)<\/a>/s', $content, $matches)) {
        $visible_text = fs_button_visible_label($matches[1]);
    }

    $has_icon = $button_icon !== '' || strpos($content, '-has-icon') !== false;

    if (! $has_icon) {
        return $content;
    }

    if ($visible_text !== '') {
        return $content;
    }

    if ($button_icon !== '' && strpos($content, '-has-icon') === false) {
        $extra_classes = '-has-icon ' . $button_icon;
        $content = preg_replace(
            '/(class="[^"]*\bwp-block-button\b[^"]*)"/',
            '$1 ' . $extra_classes . '"',
            $content,
            1
        );
    }

    if (strpos($content, '-icon-only') === false) {
        $content = preg_replace(
            '/(class="[^"]*\bwp-block-button\b[^"]*)"/',
            '$1 -icon-only"',
            $content,
            1
        );
    }

    // Empty anchors collapse in some cases; zero-width space keeps the link in the layout tree.
    if (preg_match('/<a\b[^>]*\bwp-block-button__link\b[^>]*>\s*<\/a>/', $content)) {
        $content = preg_replace(
            '/(<a\b[^>]*\bwp-block-button__link\b[^>]*>)\s*(<\/a>)/',
            '$1&#8203;$2',
            $content,
            1
        );
    }

    return $content;
}, 10, 2);

/**
 * Strip icon-only placeholder characters from button label text.
 */
function fs_button_visible_label(string $text): string
{
    $text = strip_tags($text);
    $text = str_replace(["\xE2\x80\x8B", '&#8203;'], '', $text);

    return trim($text);
}
