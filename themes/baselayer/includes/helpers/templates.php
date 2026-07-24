<?php

defined('ABSPATH') || exit;

/**
 * Load a PHP template from the theme `templates/` directory with scoped variables.
 * Child theme templates override the parent when present.
 *
 * @param string $template Relative path under `templates/`, e.g. `pagination` or `article-preview`.
 * @param array<string, mixed> $data Variables extracted into the template scope (EXTR_SKIP).
 */
function bl_render_template(string $template, array $data = []): void
{
	$template = str_replace("\0", '', $template);
	$template = ltrim(str_replace('\\', '/', $template), '/');
	if ($template === '' || str_contains($template, '..')) {
		return;
	}

	$relative = 'templates/' . $template . '.php';
	$candidates = [];

	if (is_child_theme()) {
		$candidates[] = [
			'path' => trailingslashit(get_stylesheet_directory()) . $relative,
			'base' => trailingslashit(get_stylesheet_directory()) . 'templates/',
		];
	}

	$candidates[] = [
		'path' => trailingslashit(get_template_directory()) . $relative,
		'base' => trailingslashit(get_template_directory()) . 'templates/',
	];

	$path = null;

	foreach ($candidates as $candidate) {
		$file = $candidate['path'];
		$base = $candidate['base'];

		if (!is_file($file) || !is_readable($file)) {
			continue;
		}

		$real_base = realpath($base);
		$real_file = realpath($file);
		if ($real_base === false || $real_file === false) {
			continue;
		}

		$real_base = wp_normalize_path($real_base) . '/';
		$real_file = wp_normalize_path($real_file);
		if (!str_starts_with($real_file, $real_base)) {
			continue;
		}

		$path = $file;
		break;
	}

	if ($path === null) {
		return;
	}

	extract($data, EXTR_SKIP);
	include $path;
}

/**
 * Full argument list for {@see paginate_links()} from any {@see WP_Query} (main loop or custom query).
 * Theme defaults and URL/total/current live here only — override keys via `$overrides` when rendering the template.
 *
 * @param array<string, mixed> $overrides Merged last (e.g. from `templates/pagination.php` as `pagination_args`).
 * @return array<string, mixed>
 */
function bl_paginate_links_args_for_wp_query(\WP_Query $query, array $overrides = []): array
{
	$total = max(1, (int) $query->max_num_pages);
	$paged_from_query = (int) $query->get('paged');
	$current = max(1, $paged_from_query, (int) get_query_var('paged'), (int) get_query_var('page'));
	if ($current > $total) {
		$current = $total;
	}

	$pagination_base_url = '';
	if (isset($overrides['pagination_base_url']) && is_string($overrides['pagination_base_url'])) {
		$pagination_base_url = $overrides['pagination_base_url'];
		unset($overrides['pagination_base_url']);
	}

	if ($pagination_base_url !== '') {
		$pagination_base_url = trailingslashit((string) strtok($pagination_base_url, '#?'));
		global $wp_rewrite;
		if ($wp_rewrite instanceof \WP_Rewrite && $wp_rewrite->using_permalinks()) {
			$base = user_trailingslashit($pagination_base_url . '%_%', 'pagination');
			$format = user_trailingslashit($wp_rewrite->pagination_base . '/%#%', 'pagination');
		} else {
			$base = $pagination_base_url . '%_%';
			$format = '?page=%#%';
		}
	} else {
		$big = 999999999;
		$base = str_replace((string) $big, '%#%', esc_url(get_pagenum_link($big, false)));
		$format = '';
	}

	return array_merge(
		[
			'base'      => $base,
			'format'    => $format,
			'total'     => $total,
			'current'   => $current,
			'mid_size'  => 1,
			'end_size'  => 1,
			'prev_text' => bl_pagination_nav_link_text('prev'),
			'next_text' => bl_pagination_nav_link_text('next'),
			'type'      => 'list',
		],
		$overrides
	);
}

/**
 * Accessible prev/next label for {@see paginate_links()}: visible icon, text for screen readers.
 *
 * @param 'prev'|'next' $direction
 */
function bl_pagination_nav_link_text(string $direction): string
{
	$label = $direction === 'prev'
		? __('Previous page', 'baselayer')
		: __('Next page', 'baselayer');

	return sprintf(
		'<span class="screen-reader-text">%s</span><span class="pagination__icon" aria-hidden="true">%s</span>',
		esc_html($label),
		bl_pagination_icon_svg($direction)
	);
}

/**
 * Chevron SVG for pagination prev/next (matches ACF slider controls).
 *
 * @param 'prev'|'next' $direction
 */
function bl_pagination_icon_svg(string $direction): string
{
	$paths = [
		'prev' => 'm287.46-450 131.69 131.69q8.93 8.93 8.81 20.89-.11 11.96-8.81 21.27-9.3 9.3-21.38 9.61-12.08.31-21.38-9L197.23-454.69q-10.84-10.85-10.84-25.31 0-14.46 10.84-25.31l179.16-179.15q8.92-8.92 21.19-8.81 12.27.12 21.57 9.42 8.7 9.31 9 21.08.31 11.77-9 21.08L287.46-510h470.62q12.77 0 21.38 8.62 8.62 8.61 8.62 21.38t-8.62 21.38q-8.61 8.62-21.38 8.62H287.46Z',
		'next' => 'M664.46-450H210q-12.77 0-21.38-8.62Q180-467.23 180-480t8.62-21.38Q197.23-510 210-510h454.46L532.77-641.69q-8.92-8.93-8.81-20.89.12-11.96 8.81-21.27 9.31-9.3 21.38-9.61 12.08-.31 21.39 9l179.15 179.15q5.62 5.62 7.92 11.85 2.31 6.23 2.31 13.46t-2.31 13.46q-2.3 6.23-7.92 11.85L575.54-275.54q-8.93 8.92-21.19 8.81-12.27-.12-21.58-9.42-8.69-9.31-9-21.08-.31-11.77 9-21.08L664.46-450Z',
	];

	if (!isset($paths[$direction])) {
		return '';
	}

	return sprintf(
		'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 -960 960 960" fill="currentColor" focusable="false"><path d="%s"/></svg>',
		esc_attr($paths[$direction])
	);
}

/**
 * {@see paginate_links()} markup with theme BEM classes ({@see bl_paginate_links_apply_theme_classes()}).
 *
 * @param array<string, mixed> $args Same as {@see paginate_links()}; `type` is forced to `list`.
 */
function bl_paginate_links_html(array $args): string
{
	$scroll_anchor = '';
	if (isset($args['scroll_anchor']) && is_string($args['scroll_anchor'])) {
		$scroll_anchor = sanitize_html_class($args['scroll_anchor']);
		unset($args['scroll_anchor']);
	}

	$args['type'] = 'list';
	$html = paginate_links($args);
	if (!is_string($html) || $html === '') {
		return '';
	}

	$html = bl_paginate_links_apply_theme_classes($html);

	if ($scroll_anchor !== '') {
		$html = bl_paginate_links_append_scroll_anchor($html, $scroll_anchor);
	}

	return $html;
}

/**
 * Add `#anchor` to each pagination link href.
 */
function bl_paginate_links_append_scroll_anchor(string $html, string $anchor_id): string
{
	$anchor_id = sanitize_html_class($anchor_id);
	if ($anchor_id === '' || $html === '') {
		return $html;
	}

	$fragment = '#' . $anchor_id;

	return (string) preg_replace_callback(
		'/href=(["\'])([^"\']+)\1/',
		static function (array $matches) use ($fragment): string {
			$quote = $matches[1];
			$url = (string) strtok($matches[2], '#');

			return 'href=' . $quote . $url . $fragment . $quote;
		},
		$html
	);
}

/**
 * Replace core `page-numbers` classes with `pagination__*` so archive and blocks share one stylesheet.
 */
function bl_paginate_links_apply_theme_classes(string $html): string
{
	$html = preg_replace('/<ul class=[\'"]page-numbers[\'"]>/', '<ul class="pagination__items">', $html, 1) ?? $html;
	$html = str_replace('<li>', '<li class="pagination__item">', $html);

	$replacements = [
		'page-numbers dots'     => 'pagination__ellipsis',
		'page-numbers current'  => 'pagination__link -current',
		'next page-numbers'     => 'pagination__link -next',
		'prev page-numbers'     => 'pagination__link -prev',
		'page-numbers'          => 'pagination__link',
	];

	return str_replace(array_keys($replacements), array_values($replacements), $html);
}

/**
 * Render `templates/pagination.php` for a custom {@see WP_Query} (same template as the main loop; pass `query`).
 *
 * Optional `$data` keys: `aria_label`, `nav_class`, `pagination_args` (merged into {@see bl_paginate_links_args_for_wp_query()}).
 */
function bl_render_pagination_for_query(\WP_Query $query, array $data = []): void
{
	bl_render_template('pagination', array_merge(['query' => $query], $data));
}
