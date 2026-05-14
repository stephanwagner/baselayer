<?php

defined('ABSPATH') || exit;

$aria_label = isset($aria_label) && is_string($aria_label) ? $aria_label : __('Posts pagination', 'fromscratch');
$nav_class = isset($nav_class) && is_string($nav_class) ? $nav_class : 'archive__pagination';

if (!isset($query) || !$query instanceof \WP_Query) {
	global $wp_query;
	$query = $wp_query instanceof \WP_Query ? $wp_query : null;
}

if (!$query instanceof \WP_Query) {
	return;
}

$total = max(1, (int) $query->max_num_pages);
if ($total <= 1) {
	return;
}

$overrides = isset($pagination_args) && is_array($pagination_args) ? $pagination_args : [];
$args = fs_paginate_links_args_for_wp_query($query, $overrides);
$links = paginate_links($args);
if (!is_string($links) || $links === '') {
	return;
}
?>
<nav class="<?php echo esc_attr($nav_class); ?>" aria-label="<?php echo esc_attr($aria_label); ?>">
	<?php
	// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- markup from core paginate_links().
	echo $links;
	?>
</nav>
