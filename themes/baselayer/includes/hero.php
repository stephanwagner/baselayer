<?php

defined('ABSPATH') || exit;

/**
 * Whether the page hero is enabled for a post.
 */
function bl_hero_is_enabled(?int $post_id = null): bool
{
	$post_id = $post_id ?? (int) get_queried_object_id();
	if ($post_id <= 0 || !function_exists('get_field')) {
		return false;
	}

	return (bool) get_field('hero_enabled', $post_id);
}

/**
 * URL of the Contact page (install slug contact / kontakt), or ''.
 */
function bl_hero_contact_page_url(): string
{
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
		$image_id = isset($row['image']) ? (int) $row['image'] : 0;
	} elseif ($background === 'video') {
		$video_id = isset($row['video']) ? (int) $row['video'] : 0;
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
		$text_html = $custom_text;
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
			$link = is_array($link_row) && isset($link_row['link']) && is_array($link_row['link'])
				? $link_row['link']
				: null;
			if ($link === null) {
				continue;
			}
			$url = isset($link['url']) ? (string) $link['url'] : '';
			if ($url === '') {
				continue;
			}
			$links[] = [
				'url' => $url,
				'title' => isset($link['title']) ? (string) $link['title'] : '',
				'target' => isset($link['target']) ? (string) $link['target'] : '',
			];
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
	if ($post_id <= 0 || !function_exists('get_field') || !bl_hero_is_enabled($post_id)) {
		return null;
	}

	$rows = get_field('hero_slides', $post_id);
	if (!is_array($rows) || $rows === []) {
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
