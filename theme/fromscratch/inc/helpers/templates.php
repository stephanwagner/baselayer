<?php

defined('ABSPATH') || exit;

/**
 * Load a PHP template from the theme `templates/` directory with scoped variables.
 *
 * @param string $template Relative path under `templates/`, e.g. `pagination.php` or `post-preview.php`.
 * @param array<string, mixed> $data Variables extracted into the template scope (EXTR_SKIP).
 */
function fs_render_template(string $template, array $data = []): void
{
	$template = str_replace("\0", '', $template);
	$template = ltrim(str_replace('\\', '/', $template), '/');
	if ($template === '' || str_contains($template, '..')) {
		return;
	}

	$base = trailingslashit(get_template_directory()) . 'templates/';
	$path = $base . $template . '.php';

	if (!is_file($path) || !is_readable($path)) {
		return;
	}

	$real_base = realpath($base);
	$real_file = realpath($path);
	if ($real_base === false || $real_file === false) {
		return;
	}

	$real_base = wp_normalize_path($real_base) . '/';
	$real_file = wp_normalize_path($real_file);
	if (!str_starts_with($real_file, $real_base)) {
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
function fs_paginate_links_args_for_wp_query(\WP_Query $query, array $overrides = []): array
{
	$total = max(1, (int) $query->max_num_pages);
	$paged_from_query = (int) $query->get('paged');
	$current = max(1, $paged_from_query, (int) get_query_var('paged'), (int) get_query_var('page'));
	if ($current > $total) {
		$current = $total;
	}

	$big = 999999999;
	$base = str_replace((string) $big, '%#%', esc_url(get_pagenum_link($big, false)));

	return array_merge(
		[
			'base'      => $base,
			'format'    => '',
			'total'     => $total,
			'current'   => $current,
			'mid_size'  => 0, // TODO from config
			'end_size'  => 1,
			'prev_text' => __('Previous', 'fromscratch'),
			'next_text' => __('Next', 'fromscratch'),
			'type'      => 'list',
		],
		$overrides
	);
}

/**
 * {@see paginate_links()} markup with theme BEM classes ({@see fs_paginate_links_apply_theme_classes()}).
 *
 * @param array<string, mixed> $args Same as {@see paginate_links()}; `type` is forced to `list`.
 */
function fs_paginate_links_html(array $args): string
{
	$args['type'] = 'list';
	$html = paginate_links($args);
	if (!is_string($html) || $html === '') {
		return '';
	}

	return fs_paginate_links_apply_theme_classes($html);
}

/**
 * Replace core `page-numbers` classes with `pagination__*` so archive and blocks share one stylesheet.
 */
function fs_paginate_links_apply_theme_classes(string $html): string
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
 * Optional `$data` keys: `aria_label`, `nav_class`, `pagination_args` (merged into {@see fs_paginate_links_args_for_wp_query()}).
 */
function fs_render_pagination_for_query(\WP_Query $query, array $data = []): void
{
	fs_render_template('pagination', array_merge(['query' => $query], $data));
}
