<?php

defined('ABSPATH') || exit;

/**
 * Category filter for article-list blocks (ACF) and CPT archives (config).
 */

/**
 * Post types the article-list block may query (theme types minus page).
 *
 * @return list<string>
 */
function bl_article_list_available_post_types(): array
{
	$types = function_exists('bl_theme_post_types') ? bl_theme_post_types() : [];
	$out = [];

	foreach ($types as $slug) {
		if (!is_string($slug) || $slug === '' || $slug === 'page') {
			continue;
		}
		if (!post_type_exists($slug)) {
			continue;
		}
		$out[] = $slug;
	}

	return array_values(array_unique($out));
}

/**
 * Whether a post type is available for article-list blocks.
 */
function bl_article_list_post_type_is_available(string $post_type): bool
{
	return $post_type !== '' && in_array($post_type, bl_article_list_available_post_types(), true);
}

/**
 * Resolve a block post_type value to an available type, or '' when none apply.
 *
 * Explicit but disabled types (e.g. `post` with `enabled` => false) return '' so the block stays hidden.
 */
function bl_article_list_resolve_post_type($post_type): string
{
	$available = bl_article_list_available_post_types();
	if ($available === []) {
		return '';
	}

	if (is_string($post_type) && $post_type !== '') {
		return in_array($post_type, $available, true) ? $post_type : '';
	}

	if (in_array('post', $available, true)) {
		return 'post';
	}

	return $available[0];
}

/**
 * HTML id for an ACF article-list block instance.
 *
 * @param array<string, mixed> $block ACF block array.
 */
function bl_article_list_block_scroll_anchor(array $block): string
{
	if (empty($block['id']) || !is_string($block['id'])) {
		return '';
	}

	return sanitize_html_class(substr(md5($block['id']), 0, 6));
}

/**
 * Append a URL fragment so navigation scrolls to the list block.
 */
function bl_article_list_url_with_anchor(string $url, string $anchor_id): string
{
	$anchor_id = sanitize_html_class($anchor_id);
	if ($anchor_id === '' || $url === '') {
		return $url;
	}

	$url = (string) strtok($url, '#');

	return $url . '#' . $anchor_id;
}

/**
 * Permalink of the page/post that contains the article-list block.
 */
function bl_article_list_block_form_action(): string
{
	global $post;

	if ($post instanceof \WP_Post) {
		$permalink = get_permalink($post);
		if (is_string($permalink) && $permalink !== '') {
			return $permalink;
		}
	}

	$queried_id = get_queried_object_id();
	if ($queried_id > 0) {
		$permalink = get_permalink($queried_id);
		if (is_string($permalink) && $permalink !== '') {
			return $permalink;
		}
	}

	return home_url('/');
}

/**
 * Whether the CPT archive should show a category filter (`archive.category_filter`).
 */
function bl_archive_has_category_filter(?string $post_type = null): bool
{
	if ($post_type === null || $post_type === '') {
		$post_type = function_exists('bl_archive_current_post_type') ? bl_archive_current_post_type() : '';
	}
	if ($post_type === '') {
		return false;
	}

	$archive = bl_content_type_archive($post_type);
	if (empty($archive['category_filter'])) {
		return false;
	}

	return bl_cpt_filter_taxonomy($post_type) !== '';
}

/**
 * Taxonomy used for listing filters: `archive.filter_taxonomy` or first taxonomy on the CPT.
 */
function bl_cpt_filter_taxonomy(string $post_type): string
{
	if ($post_type === '') {
		return '';
	}

	$archive = bl_content_type_archive($post_type);
	if (!empty($archive['filter_taxonomy']) && is_string($archive['filter_taxonomy'])) {
		$tax = sanitize_key($archive['filter_taxonomy']);
		if ($tax !== '' && taxonomy_exists($tax)) {
			return $tax;
		}
	}

	$cfg = bl_config_cpt($post_type);
	if (!is_array($cfg)) {
		return '';
	}

	if (function_exists('bl_content_type_uses_wp_categories') && bl_content_type_uses_wp_categories($cfg)) {
		return 'category';
	}

	if (!isset($cfg['taxonomies']) || !is_array($cfg['taxonomies'])) {
		return '';
	}

	foreach ($cfg['taxonomies'] as $key => $value) {
		if (is_string($key) && $key !== '' && taxonomy_exists($key)) {
			return sanitize_key($key);
		}
		if (is_int($key) && is_string($value) && taxonomy_exists($value)) {
			return sanitize_key($value);
		}
	}

	return '';
}

/**
 * Query var for filter URLs. Block: `block_project_category`; archive: taxonomy query var.
 *
 * @param 'block'|'archive' $context
 */
function bl_article_list_filter_query_var(string $taxonomy, string $context = 'archive'): string
{
	if ($taxonomy === '' || !taxonomy_exists($taxonomy)) {
		return '';
	}

	if ($context === 'block') {
		return 'block_' . sanitize_key($taxonomy);
	}

	$tax = get_taxonomy($taxonomy);
	if (!$tax instanceof \WP_Taxonomy) {
		return $taxonomy;
	}

	$query_var = $tax->query_var;
	if (is_string($query_var) && $query_var !== '') {
		return $query_var;
	}

	return $taxonomy;
}

/**
 * Term ID from the current request for a taxonomy, or 0 when unset / invalid.
 *
 * @param 'block'|'archive' $context
 */
function bl_article_list_filter_term_id_from_request(string $taxonomy, string $context = 'archive'): int
{
	$query_var = bl_article_list_filter_query_var($taxonomy, $context);
	if ($query_var === '') {
		return 0;
	}

	// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- public filter URLs.
	$raw = isset($_GET[$query_var]) ? wp_unslash($_GET[$query_var]) : '';
	if (!is_string($raw) || $raw === '') {
		return 0;
	}

	$raw = sanitize_text_field($raw);
	if ($raw === '') {
		return 0;
	}

	if (ctype_digit($raw)) {
		$term = get_term((int) $raw, $taxonomy);
	} else {
		$term = get_term_by('slug', $raw, $taxonomy);
	}

	if (!$term instanceof \WP_Term || is_wp_error($term)) {
		return 0;
	}

	return (int) $term->term_id;
}

/**
 * Posts-per-page + pagination state from block limit fields (matches original block logic).
 *
 * @param array<string, mixed> $block
 * @return array{posts_per_page: int, paged: int, uses_pagination: bool}
 */
function bl_article_list_block_query_limit(array $block): array
{
	$has_limit = bl_acf_block_field($block, 'has_limit');
	$limit_type = bl_acf_block_field_choice_value(bl_acf_block_field($block, 'limit_type'));
	$limit = bl_acf_block_field($block, 'limit');

	$posts_per_page = -1;
	$paged = 1;
	$uses_pagination = false;

	// Backward compatible: if `has_limit` is true and `limit` is set but `limit_type`
	// is missing (older field group), treat it as pagination.
	$has_limit_bool = filter_var($has_limit, FILTER_VALIDATE_BOOLEAN) || $has_limit === '1' || $has_limit === 1;
	if (!$has_limit_bool) {
		return [
			'posts_per_page'  => $posts_per_page,
			'paged'           => $paged,
			'uses_pagination' => $uses_pagination,
		];
	}

	if ($limit_type === '') {
		$limit_type = 'pagination';
	}

	$posts_per_page = is_numeric($limit) ? (int) $limit : 0;

	if ($limit_type === 'limit') {
		return [
			'posts_per_page'  => $posts_per_page > 0 ? $posts_per_page : -1,
			'paged'           => 1,
			'uses_pagination' => false,
		];
	}

	$uses_pagination = true;
	$paged = max(1, (int) get_query_var('paged'), (int) get_query_var('page'));

	return [
		'posts_per_page'  => $posts_per_page,
		'paged'           => $paged,
		'uses_pagination' => $uses_pagination,
	];
}

/**
 * Resolve the block editor `post_taxonomy` field to a term (manually populated select).
 *
 * @return array{term_id: int, taxonomy: string}|null
 */
function bl_article_list_post_taxonomy_term(string $post_type, $field_value): ?array
{
	if ($post_type === '' || $field_value === null || $field_value === '' || $field_value === false) {
		return null;
	}

	$term = null;
	$filter_taxonomy = bl_cpt_filter_taxonomy($post_type);

	if ($field_value instanceof \WP_Term) {
		$term = $field_value;
	} elseif (is_array($field_value)) {
		if (!empty($field_value['term_id'])) {
			$tax = isset($field_value['taxonomy']) && is_string($field_value['taxonomy'])
				? $field_value['taxonomy']
				: $filter_taxonomy;
			$term = $tax !== '' ? get_term((int) $field_value['term_id'], $tax) : get_term((int) $field_value['term_id']);
		}
	} elseif (is_numeric($field_value)) {
		$term_id = (int) $field_value;
		if ($term_id > 0) {
			if ($filter_taxonomy !== '') {
				$term = get_term($term_id, $filter_taxonomy);
			}
			if (!$term instanceof \WP_Term || is_wp_error($term)) {
				$term = get_term($term_id);
			}
		}
	} elseif (is_string($field_value) && $field_value !== '') {
		if ($filter_taxonomy !== '') {
			$term = get_term_by('slug', $field_value, $filter_taxonomy);
			if (!$term) {
				$term = get_term_by('name', $field_value, $filter_taxonomy);
			}
		}
		if ((!$term instanceof \WP_Term || is_wp_error($term)) && ctype_digit($field_value)) {
			$term = get_term((int) $field_value);
		}
	}

	if (!$term instanceof \WP_Term || is_wp_error($term)) {
		return null;
	}

	if (!is_object_in_taxonomy($post_type, $term->taxonomy)) {
		return null;
	}

	return [
		'term_id'  => (int) $term->term_id,
		'taxonomy' => $term->taxonomy,
	];
}

/**
 * Selected term: URL filter wins (including explicit “all”), else block field default.
 *
 * @param 'block'|'archive' $context
 */
function bl_article_list_selected_term_id(string $taxonomy, int $editor_default_term_id = 0, string $context = 'archive'): int
{
	$query_var = bl_article_list_filter_query_var($taxonomy, $context);
	if ($query_var !== '') {
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- public filter URLs.
		if (array_key_exists($query_var, $_GET)) {
			return bl_article_list_filter_term_id_from_request($taxonomy, $context);
		}
	}

	if ($editor_default_term_id > 0) {
		$term = get_term($editor_default_term_id, $taxonomy);
		if ($term instanceof \WP_Term && !is_wp_error($term)) {
			return (int) $term->term_id;
		}
	}

	return 0;
}

/**
 * @return \WP_Term[]
 */
function bl_article_list_filter_terms(string $taxonomy): array
{
	if ($taxonomy === '' || !taxonomy_exists($taxonomy)) {
		return [];
	}

	$terms = get_terms([
		'taxonomy'   => $taxonomy,
		'hide_empty' => false,
		'orderby'    => 'name',
		'order'      => 'ASC',
	]);

	if (!is_array($terms)) {
		return [];
	}

	return array_values(array_filter($terms, static fn($term): bool => $term instanceof \WP_Term));
}

/**
 * @return array<int, array<string, mixed>>
 */
function bl_article_list_build_tax_query(string $taxonomy, int $term_id): array
{
	if ($taxonomy === '' || $term_id <= 0) {
		return [];
	}

	$term = get_term($term_id, $taxonomy);
	if (!$term instanceof \WP_Term || is_wp_error($term)) {
		return [];
	}

	return [
		[
			'taxonomy' => $taxonomy,
			'field'    => 'term_id',
			'terms'    => [$term_id],
		],
	];
}

/**
 * Query args to preserve the active filter in pagination links.
 *
 * @return array<string, string>
 * @param 'block'|'archive' $context
 */
function bl_article_list_active_filter_query_args(string $taxonomy, int $term_id = 0, string $context = 'archive'): array
{
	if ($taxonomy === '') {
		return [];
	}

	if ($term_id <= 0) {
		$term_id = bl_article_list_filter_term_id_from_request($taxonomy, $context);
	}
	if ($term_id <= 0) {
		return [];
	}

	$term = get_term($term_id, $taxonomy);
	if (!$term instanceof \WP_Term || is_wp_error($term)) {
		return [];
	}

	$query_var = bl_article_list_filter_query_var($taxonomy, $context);
	if ($query_var === '') {
		return [];
	}

	return [$query_var => $term->slug];
}

/**
 * CPT archive main query: apply category filter from URL.
 */
function bl_archive_apply_category_filter(\WP_Query $query): void
{
	if (is_admin() || !$query->is_main_query() || !$query->is_post_type_archive()) {
		return;
	}

	$pt = $query->get('post_type');
	if (is_array($pt)) {
		$pt = (string) reset($pt);
	}
	if (!is_string($pt) || $pt === '') {
		return;
	}

	if ($pt === 'post' && function_exists('bl_post_type_has_config_archive') && !bl_post_type_has_config_archive('post')) {
		return;
	}

	if (!bl_archive_has_category_filter($pt)) {
		return;
	}

	$taxonomy = bl_cpt_filter_taxonomy($pt);
	$term_id = bl_article_list_filter_term_id_from_request($taxonomy, 'archive');
	if ($term_id <= 0) {
		return;
	}

	$tax_query = bl_article_list_build_tax_query($taxonomy, $term_id);
	if ($tax_query === []) {
		return;
	}

	$query->set('tax_query', $tax_query);
}

add_action('pre_get_posts', 'bl_archive_apply_category_filter', 18);
