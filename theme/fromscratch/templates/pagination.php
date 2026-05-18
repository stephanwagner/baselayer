<?php

defined('ABSPATH') || exit;

$aria_label = isset($aria_label) && is_string($aria_label) ? $aria_label : __('Posts pagination', 'fromscratch');
$nav_class = isset($nav_class) && is_string($nav_class) ? $nav_class : '';

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
$links = fs_paginate_links_html($args);
if ($links === '') {
	return;
}

$nav_classes = array_filter(array_unique(array_merge(['pagination__wrapper'], preg_split('/\s+/', trim($nav_class), -1, PREG_SPLIT_NO_EMPTY) ?: [])));
?>
<nav class="<?php echo esc_attr(implode(' ', $nav_classes)); ?>" aria-label="<?php echo esc_attr($aria_label); ?>">
	<div class="pagination__container">
		<?php
		// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- classes normalized in fs_paginate_links_apply_theme_classes().
		echo $links;
		?>
	</div>
</nav>
