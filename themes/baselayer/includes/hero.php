<?php

defined('ABSPATH') || exit;

/**
 * Hero page_settings definition post ID (slug `hero`), or 0.
 */
function bl_hero_page_settings_definition_id(): int
{
	static $cached = null;
	if ($cached !== null) {
		return $cached;
	}

	$cached = 0;
	if (!function_exists('bl_blocks_query_definitions') || !function_exists('bl_blocks_definition_slug')) {
		return 0;
	}

	foreach (bl_blocks_query_definitions('page_settings', true) as $post) {
		if (!$post instanceof WP_Post) {
			continue;
		}
		if (bl_blocks_definition_slug((int) $post->ID) === 'hero') {
			$cached = (int) $post->ID;
			break;
		}
	}

	return $cached;
}

/**
 * Baselayer Hero Content Fields values for a post.
 *
 * @return array<string, mixed>
 */
function bl_hero_baselayer_values(int $post_id): array
{
	$def_id = bl_hero_page_settings_definition_id();
	if ($def_id <= 0 || $post_id <= 0 || !function_exists('bl_blocks_page_meta_key')) {
		return [];
	}

	$raw = get_post_meta($post_id, bl_blocks_page_meta_key($def_id), true);

	return is_array($raw) ? $raw : [];
}

/**
 * Whether Hero should use ACF field storage for this request.
 */
function bl_hero_uses_acf(): bool
{
	if (function_exists('bl_theme_blocks_system')) {
		return bl_theme_blocks_system() === 'acf';
	}

	return function_exists('get_field');
}

/**
 * Whether a stored toggle/checkbox value is on.
 *
 * @param mixed $value
 */
function bl_hero_truthy($value): bool
{
	if (is_bool($value)) {
		return $value;
	}
	if (is_int($value) || is_float($value)) {
		return (int) $value !== 0;
	}
	if (is_string($value)) {
		$v = strtolower(trim($value));

		return $v !== '' && $v !== '0' && $v !== 'false' && $v !== 'off' && $v !== 'no';
	}

	return !empty($value);
}

/**
 * Attachment ID from a Baselayer/ACF media field value.
 *
 * @param mixed $value
 */
function bl_hero_attachment_id($value): int
{
	if (is_numeric($value)) {
		return (int) $value;
	}
	if (is_array($value)) {
		if (isset($value['id']) && is_numeric($value['id'])) {
			return (int) $value['id'];
		}
		if (isset($value[0]) && is_numeric($value[0])) {
			return (int) $value[0];
		}
	}

	return 0;
}

/**
 * Normalize a link field value to url/title/target.
 *
 * @param mixed $link
 * @return array{url: string, title: string, target: string}|null
 */
function bl_hero_normalize_link($link): ?array
{
	if (!is_array($link)) {
		return null;
	}

	$url = isset($link['url']) ? (string) $link['url'] : '';
	if ($url === '' && !empty($link['page_id']) && is_numeric($link['page_id'])) {
		$permalink = get_permalink((int) $link['page_id']);
		$url = is_string($permalink) ? $permalink : '';
	}
	if ($url === '') {
		return null;
	}

	return [
		'url' => $url,
		'title' => isset($link['title']) ? (string) $link['title'] : '',
		'target' => isset($link['target']) ? (string) $link['target'] : '',
	];
}

/**
 * Whether the page hero is enabled for a post.
 */
function bl_hero_is_enabled(?int $post_id = null): bool
{
	$post_id = $post_id ?? (int) get_queried_object_id();
	if ($post_id <= 0) {
		return false;
	}
	if (post_password_required($post_id)) {
		return false;
	}

	if (bl_hero_uses_acf()) {
		if (!function_exists('get_field')) {
			return false;
		}

		return bl_hero_truthy(get_field('hero_enabled', $post_id));
	}

	$values = bl_hero_baselayer_values($post_id);

	return bl_hero_truthy($values['hero_enabled'] ?? null);
}

/**
 * URL of the Contact page (Theme setting, then install slug fallback), or ''.
 */
function bl_hero_contact_page_url(): string
{
	$contact_id = (int) get_option('baselayer_page_for_contact', 0);
	if ($contact_id > 0) {
		$page = get_post($contact_id);
		if ($page instanceof WP_Post && $page->post_type === 'page' && $page->post_status === 'publish') {
			$url = get_permalink($page);
			if (is_string($url) && $url !== '') {
				return $url;
			}
		}
	}

	$slugs = apply_filters('bl_hero_contact_page_slugs', ['contact', 'kontakt']);
	if (!is_array($slugs)) {
		$slugs = ['contact', 'kontakt'];
	}

	foreach ($slugs as $slug) {
		if (!is_string($slug) || $slug === '') {
			continue;
		}
		$page = get_page_by_path($slug, OBJECT, 'page');
		if ($page instanceof WP_Post) {
			$url = get_permalink($page);
			if (is_string($url) && $url !== '') {
				return $url;
			}
		}
	}

	return (string) apply_filters('bl_hero_contact_page_url', '');
}

/**
 * Resolve one hero slide row into template data.
 *
 * @param array<string, mixed> $row
 * @return array{
 *   background: 'featured'|'image'|'video',
 *   image_id: int,
 *   video_url: string,
 *   title_html: string,
 *   text_html: string,
 *   links: list<array{url: string, title: string, target: string}>
 * }
 */
function bl_hero_resolve_slide(array $row, int $post_id): array
{
	$background = isset($row['background']) ? (string) $row['background'] : 'featured';
	if (!in_array($background, ['featured', 'image', 'video'], true)) {
		$background = 'featured';
	}

	$image_id = 0;
	$video_url = '';

	if ($background === 'featured') {
		$image_id = (int) get_post_thumbnail_id($post_id);
	} elseif ($background === 'image') {
		$image_id = bl_hero_attachment_id($row['image'] ?? 0);
	} elseif ($background === 'video') {
		$video_id = bl_hero_attachment_id($row['video'] ?? 0);
		if ($video_id > 0) {
			$url = wp_get_attachment_url($video_id);
			$video_url = is_string($url) ? $url : '';
		}
	}

	$page_title = get_the_title($post_id);

	$title_source = isset($row['title_source']) ? (string) $row['title_source'] : 'none';
	$title_html = '';
	if ($title_source === 'page_title') {
		$title_html = esc_html($page_title);
	} elseif ($title_source === 'custom') {
		$custom_title = isset($row['title']) ? (string) $row['title'] : '';
		$title_html = $custom_title;
	}

	$text_source = isset($row['text_source']) ? (string) $row['text_source'] : 'none';
	$text_html = '';
	if ($text_source === 'excerpt') {
		$excerpt = get_the_excerpt($post_id);
		$excerpt = is_string($excerpt) ? trim($excerpt) : '';
		if ($excerpt !== '') {
			$text_html = wpautop(esc_html($excerpt));
		}
	} elseif ($text_source === 'custom') {
		$custom_text = isset($row['text']) ? (string) $row['text'] : '';
		// Textarea stores plain text; wrap for front-end (ACF uses new_lines=wpautop).
		if ($custom_text !== '' && !preg_match('/<[a-z][\s\S]*>/i', $custom_text)) {
			$text_html = wpautop(esc_html($custom_text));
		} else {
			$text_html = $custom_text;
		}
	}

	$links_source = isset($row['links_source']) ? (string) $row['links_source'] : 'none';
	$links = [];

	if ($links_source === 'contact') {
		$contact_url = bl_hero_contact_page_url();
		if ($contact_url !== '') {
			$links[] = [
				'url' => $contact_url,
				'title' => __('Contact', 'baselayer'),
				'target' => '',
			];
		}
	} elseif ($links_source === 'custom') {
		$rows = isset($row['links']) && is_array($row['links']) ? $row['links'] : [];
		foreach ($rows as $link_row) {
			$raw_link = null;
			if (is_array($link_row) && isset($link_row['link']) && is_array($link_row['link'])) {
				$raw_link = $link_row['link'];
			} elseif (is_array($link_row) && isset($link_row['url'])) {
				$raw_link = $link_row;
			}
			$normalized = bl_hero_normalize_link($raw_link);
			if ($normalized === null) {
				continue;
			}
			$links[] = $normalized;
		}
	}

	return [
		'background' => $background,
		'image_id' => $image_id,
		'video_url' => $video_url,
		'title_html' => $title_html,
		'text_html' => $text_html,
		'links' => $links,
	];
}

/**
 * Hero slide rows for a post (ACF or Baselayer Content Fields).
 *
 * @return list<array<string, mixed>>
 */
function bl_hero_slide_rows(int $post_id): array
{
	if (bl_hero_uses_acf()) {
		if (!function_exists('get_field')) {
			return [];
		}
		$rows = get_field('hero_slides', $post_id);

		return is_array($rows) ? $rows : [];
	}

	$values = bl_hero_baselayer_values($post_id);
	$rows = $values['hero_slides'] ?? [];

	return is_array($rows) ? $rows : [];
}

/**
 * Resolve hero fields into template context, or null when disabled / empty.
 *
 * @return array{
 *   post_id: int,
 *   is_slider: bool,
 *   slides: list<array{
 *     background: 'featured'|'image'|'video',
 *     image_id: int,
 *     video_url: string,
 *     title_html: string,
 *     text_html: string,
 *     links: list<array{url: string, title: string, target: string}>
 *   }>
 * }|null
 */
function bl_hero_get_context(?int $post_id = null): ?array
{
	$post_id = $post_id ?? (int) get_queried_object_id();
	if ($post_id <= 0 || !bl_hero_is_enabled($post_id)) {
		return null;
	}

	$rows = bl_hero_slide_rows($post_id);
	if ($rows === []) {
		return null;
	}

	$slides = [];
	foreach ($rows as $row) {
		if (!is_array($row)) {
			continue;
		}
		$slides[] = bl_hero_resolve_slide($row, $post_id);
	}

	if ($slides === []) {
		return null;
	}

	return [
		'post_id' => $post_id,
		'is_slider' => count($slides) > 1,
		'slides' => $slides,
	];
}
