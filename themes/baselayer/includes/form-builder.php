<?php

defined('ABSPATH') || exit;

const BL_FORM_BUILDER_HANDLE = 'baselayer-form-builder-admin';
const BL_FORM_BUILDER_ASSET = 'form-builder-admin';

/**
 * Resolve form-builder kit asset: theme build first, then optional vendor paths.
 *
 * @param 'css'|'js'               $kind
 * @param array{vendor_dir?: string, vendor_url?: string} $args
 * @return array{uri: string, path: string, ver: string}|null
 */
function bl_form_builder_resolve_asset(string $kind, array $args = []): ?array
{
	$kind = $kind === 'css' ? 'css' : 'js';

	if (function_exists('bl_resolve_built_asset')) {
		$theme = bl_resolve_built_asset(BL_FORM_BUILDER_ASSET, $kind);
		if (is_array($theme)) {
			return [
				'uri' => $theme['uri'],
				'path' => $theme['path'],
				'ver' => $theme['ver'],
			];
		}
	}

	$vendor_dir = isset($args['vendor_dir']) ? (string) $args['vendor_dir'] : '';
	$vendor_url = isset($args['vendor_url']) ? (string) $args['vendor_url'] : '';
	if ($vendor_dir === '' || $vendor_url === '') {
		return null;
	}

	$debug = function_exists('bl_is_debug') && bl_is_debug();
	$name = BL_FORM_BUILDER_ASSET;
	$candidates = $debug
		? [$name . '.' . $kind, $name . '.min.' . $kind]
		: [$name . '.min.' . $kind, $name . '.' . $kind];

	foreach ($candidates as $file) {
		$path = trailingslashit($vendor_dir) . $file;
		if (is_readable($path)) {
			return [
				'uri' => trailingslashit($vendor_url) . $file,
				'path' => $path,
				'ver' => $debug ? (string) time() : (string) filemtime($path),
			];
		}
	}

	return null;
}

/**
 * Enqueue isolatable form-builder kit (JS + CSS). Theme first, vendor fallback.
 *
 * @param array{vendor_dir?: string, vendor_url?: string, deps?: string[]} $args
 * @return string Script/style handle (empty string if nothing enqueued).
 */
function bl_form_builder_enqueue_kit(array $args = []): string
{
	$handle = BL_FORM_BUILDER_HANDLE;
	$enqueued = false;
	$deps = isset($args['deps']) && is_array($args['deps']) ? $args['deps'] : [];

	$css = bl_form_builder_resolve_asset('css', $args);
	if (is_array($css)) {
		wp_enqueue_style($handle, $css['uri'], $deps, $css['ver']);
		$enqueued = true;
	}

	$js = bl_form_builder_resolve_asset('js', $args);
	if (is_array($js)) {
		wp_enqueue_script($handle, $js['uri'], $deps, $js['ver'], true);
		$enqueued = true;
	}

	return $enqueued ? $handle : '';
}

/**
 * Sanitize page-field noun overrides. Empty values are omitted so the UI
 * falls back to the translated Page / Pages defaults.
 *
 * @param mixed $singular
 * @param mixed $plural
 * @return array{text_singular?: string, text_plural?: string}
 */
function bl_page_picker_sanitize_nouns($singular, $plural): array
{
	$out = [];
	$s = sanitize_text_field(trim((string) $singular));
	$p = sanitize_text_field(trim((string) $plural));
	if ($s !== '') {
		$out['text_singular'] = $s;
	}
	if ($p !== '') {
		$out['text_plural'] = $p;
	}

	return $out;
}

/**
 * i18n strings for page-picker field nouns and interpolated picker copy.
 *
 * @param string $domain Text domain (baselayer-forms or baselayer-blocks).
 * @return array<string, string>
 */
function bl_page_picker_field_i18n(string $domain): array
{
	return [
		'pageNounSingular' => __('Page', $domain),
		'pageNounPlural'   => __('Pages', $domain),
		'textSingular'     => __('Text singular', $domain),
		'textPlural'       => __('Text plural', $domain),
		/* translators: %s: singular or plural noun, e.g. Page or Pages */
		'chooseNoun'       => __('Choose %s', $domain),
		/* translators: %s: singular or plural noun, e.g. Page or Pages */
		'changeNoun'       => __('Change %s', $domain),
		/* translators: %s: plural noun, e.g. Pages */
		'selectNoun'       => __('Select %s', $domain),
		/* translators: %s: singular noun, e.g. Page */
		'selectANoun'      => __('Select a %s', $domain),
		/* translators: %s: plural noun, e.g. Pages */
		'selectNounsHelp'  => __('Select one or more %s.', $domain),
		'searchNouns'      => __('Search…', $domain),
		/* translators: %s: plural noun, e.g. Pages */
		'noNounsFound'     => __('No %s found.', $domain),
		'pageOrder'           => __('Order', $domain),
		'pageOrderAutomatic'  => __('Automatic', $domain),
		'pageOrderTitle'      => __('Title', $domain),
		'pageOrderMenuOrder'  => __('Menu Order', $domain),
		'pageOrderCreated'    => __('Created', $domain),
		'pageOrderModified'   => __('Last edited', $domain),
		'pageOrderHelp'       => __('Automatic uses the post type’s own order.', $domain),
		'pageAllowReorder'    => __('Allow reorder', $domain),
	];
}

/**
 * Allowed page-field orderby keys.
 *
 * @return list<string>
 */
function bl_page_picker_orderby_choices(): array
{
	return ['automatic', 'title', 'menu_order', 'date', 'modified'];
}

/**
 * Sanitize a page-field orderby value. Invalid / empty → automatic.
 *
 * @param mixed $raw
 */
function bl_page_picker_sanitize_orderby($raw): string
{
	$key = sanitize_key((string) $raw);
	$allowed = bl_page_picker_orderby_choices();

	return in_array($key, $allowed, true) ? $key : 'automatic';
}

/**
 * Implied sort direction for a resolved (non-automatic) orderby.
 */
function bl_page_picker_default_order(string $orderby): string
{
	return in_array($orderby, ['date', 'modified'], true) ? 'DESC' : 'ASC';
}

/**
 * CPT archive/admin order for Automatic picker sorting.
 * Types without a content-type query fall back to last-edited, newest first.
 *
 * @return array{orderby: string, order: string}
 */
function bl_page_picker_cpt_order(string $post_type): array
{
	$fallback = [
		'orderby' => 'modified',
		'order'   => 'DESC',
	];
	if ($post_type === '' || !function_exists('bl_content_type_query') || !function_exists('bl_config_cpt')) {
		return $fallback;
	}
	if (!is_array(bl_config_cpt($post_type))) {
		return $fallback;
	}

	$query = bl_content_type_query($post_type);
	$has_order = !empty($query['menu_order']);
	$raw_orderby = isset($query['orderby']) && is_string($query['orderby'])
		? strtolower(trim($query['orderby']))
		: '';
	if ($raw_orderby === 'publish_date' || $raw_orderby === 'published') {
		$raw_orderby = 'date';
	}
	$allowed = ['date', 'title', 'menu_order', 'modified'];
	if ($raw_orderby !== '' && in_array($raw_orderby, $allowed, true)) {
		$orderby = $raw_orderby;
	} elseif ($has_order) {
		$orderby = 'menu_order';
	} else {
		return $fallback;
	}

	$raw_order = isset($query['order']) && is_string($query['order'])
		? strtoupper(trim($query['order']))
		: '';
	if ($raw_order !== 'ASC' && $raw_order !== 'DESC') {
		$raw_order = bl_page_picker_default_order($orderby);
	}

	if ($orderby === 'menu_order' && !post_type_supports($post_type, 'page-attributes')) {
		return [
			'orderby' => 'title',
			'order'   => 'ASC',
		];
	}

	return [
		'orderby' => $orderby,
		'order'   => $raw_order,
	];
}

/**
 * Resolve REST / WP_Query order for one post type given the field orderby.
 *
 * @return array{orderby: string, order: string}
 */
function bl_page_picker_resolve_order(string $field_orderby, string $post_type): array
{
	$field_orderby = bl_page_picker_sanitize_orderby($field_orderby);
	if ($field_orderby === 'automatic') {
		return bl_page_picker_cpt_order($post_type);
	}

	$orderby = $field_orderby;
	$order = bl_page_picker_default_order($orderby);
	if ($orderby === 'menu_order' && $post_type !== '' && !post_type_supports($post_type, 'page-attributes')) {
		return [
			'orderby' => 'title',
			'order'   => 'ASC',
		];
	}

	return [
		'orderby' => $orderby,
		'order'   => $order,
	];
}

/**
 * Sort selected post IDs when Allow reorder is off (same order as the picker / CPT).
 *
 * @param list<int>            $ids
 * @param array<string, mixed> $field
 * @return list<int>
 */
function bl_page_picker_sort_ids(array $ids, array $field): array
{
	$ids = array_values(array_filter(array_map('absint', $ids)));
	if (count($ids) < 2) {
		return $ids;
	}

	$allowed_types = function_exists('bl_page_picker_sanitize_post_types')
		? bl_page_picker_sanitize_post_types($field['post_types'] ?? null)
		: ['page'];
	if ($allowed_types === []) {
		$allowed_types = ['page'];
	}

	$field_orderby = bl_page_picker_sanitize_orderby($field['orderby'] ?? 'automatic');
	if ($field_orderby === 'automatic') {
		if (count($allowed_types) === 1) {
			$resolved = bl_page_picker_resolve_order('automatic', $allowed_types[0]);
			$orderby = $resolved['orderby'];
			$order = $resolved['order'];
		} else {
			$orderby = 'modified';
			$order = 'DESC';
		}
	} else {
		$orderby = $field_orderby;
		$order = bl_page_picker_default_order($orderby);
		if ($orderby === 'menu_order') {
			$supports = false;
			foreach ($allowed_types as $pt) {
				if (post_type_supports($pt, 'page-attributes')) {
					$supports = true;
					break;
				}
			}
			if (!$supports) {
				$orderby = 'title';
				$order = 'ASC';
			}
		}
	}

	$query_args = [
		'post_type'           => $allowed_types,
		'post__in'            => $ids,
		'posts_per_page'      => count($ids),
		'post_status'         => 'any',
		'ignore_sticky_posts' => true,
		'no_found_rows'       => true,
		'suppress_filters'    => false,
	];
	if ($orderby === 'menu_order') {
		$query_args['orderby'] = ['menu_order' => $order, 'date' => 'DESC'];
	} else {
		$query_args['orderby'] = $orderby;
		$query_args['order'] = $order;
	}

	$query = new WP_Query($query_args);
	$sorted = [];
	foreach ($query->posts as $post) {
		if ($post instanceof WP_Post) {
			$sorted[] = (int) $post->ID;
		}
	}
	$missing = array_values(array_diff($ids, $sorted));

	return array_values(array_merge($sorted, $missing));
}

/**
 * Public REST-enabled post types for the shared page picker (excludes attachment).
 *
 * @return list<array{value: string, label: string, restBase: string, orderby: string, order: string, supportsMenuOrder: bool}>
 */
function bl_page_picker_post_types(): array
{
	$out = [];
	foreach (get_post_types(['public' => true, 'show_in_rest' => true], 'objects') as $pt) {
		if (!$pt instanceof WP_Post_Type || $pt->name === 'attachment') {
			continue;
		}
		$rest_base = is_string($pt->rest_base) && $pt->rest_base !== ''
			? $pt->rest_base
			: $pt->name;
		$resolved = bl_page_picker_cpt_order($pt->name);
		$out[] = [
			'value'              => $pt->name,
			'label'              => (string) ($pt->labels->name ?: $pt->name),
			'restBase'           => $rest_base,
			'orderby'            => $resolved['orderby'],
			'order'              => $resolved['order'],
			'supportsMenuOrder'  => post_type_supports($pt->name, 'page-attributes'),
		];
	}

	return $out;
}

/**
 * Sanitize a page-field post_types list. Empty / invalid → all known picker types.
 *
 * @param mixed $raw
 * @return list<string>
 */
function bl_page_picker_sanitize_post_types($raw): array
{
	$catalog = bl_page_picker_post_types();
	$allowed = array_values(array_map(static fn ($row) => $row['value'], $catalog));
	if ($allowed === []) {
		return ['page'];
	}

	$types = [];
	if (is_array($raw)) {
		foreach ($raw as $item) {
			$key = sanitize_key((string) $item);
			if ($key !== '' && in_array($key, $allowed, true) && !in_array($key, $types, true)) {
				$types[] = $key;
			}
		}
	}

	return $types === [] ? $allowed : $types;
}

/**
 * Keep only post IDs whose post_type is in $allowed_types.
 *
 * @param list<int>    $ids
 * @param list<string> $allowed_types
 * @return list<int>
 */
function bl_page_picker_filter_post_ids(array $ids, array $allowed_types): array
{
	if ($allowed_types === []) {
		return [];
	}
	$out = [];
	foreach ($ids as $id) {
		$n = absint($id);
		if ($n <= 0) {
			continue;
		}
		$type = get_post_type($n);
		if (is_string($type) && in_array($type, $allowed_types, true)) {
			$out[] = $n;
		}
	}

	return array_values(array_unique($out));
}
