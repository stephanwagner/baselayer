<?php

/**
 * Social media links from Theme Settings (ACF options).
 */

defined('ABSPATH') || exit;

/**
 * Labels for preset social_media channel dropdown values.
 *
 * @return array<string, string>
 */
function bl_social_media_channel_labels(): array
{
	return [
		'facebook' => 'Facebook',
		'instagram' => 'Instagram',
		'youtube' => 'YouTube',
		'linkedin' => 'LinkedIn',
		'x' => 'X (Twitter)',
		'tiktok' => 'TikTok',
	];
}

/**
 * Normalize an icon class to `-icon-{name}`.
 */
function bl_social_media_normalize_icon_class(string $classname): string
{
	$classname = trim($classname);
	if ($classname === '') {
		return '';
	}

	// Allow pasting full class lists; take the first -icon-* token if present.
	if (preg_match('/(?:^|\s)(-icon-[A-Za-z0-9_-]+)(?:\s|$)/', $classname, $m)) {
		return $m[1];
	}

	$classname = ltrim($classname, '.');
	if (str_starts_with($classname, '-icon-')) {
		return $classname;
	}
	if (str_starts_with($classname, 'icon-')) {
		return '-' . $classname;
	}

	return '-icon-' . $classname;
}

/**
 * Human-readable name from a URL host for custom channel aria-labels.
 */
function bl_social_media_label_from_url(string $url): string
{
	$host = wp_parse_url($url, PHP_URL_HOST);
	if (!is_string($host) || $host === '') {
		return __('Social media', 'baselayer');
	}
	$host = preg_replace('/^www\./i', '', $host) ?? $host;
	return $host !== '' ? $host : __('Social media', 'baselayer');
}

/**
 * Collect social links from preset channels + custom repeater.
 *
 * @return list<array{url: string, label: string, icon_class?: string, svg?: string}>
 */
function bl_get_social_media_links(): array
{
	if (!function_exists('get_field')) {
		return [];
	}

	$links = [];
	$labels = bl_social_media_channel_labels();
	$social = get_field('social_media', 'option');
	$social = is_array($social) ? $social : [];

	for ($i = 1; $i <= 6; $i++) {
		$url = trim((string) ($social['url_' . $i] ?? ''));
		if ($url === '') {
			continue;
		}
		$channel = sanitize_key((string) ($social['channel_' . $i] ?? ''));
		if ($channel === '' || !isset($labels[$channel])) {
			continue;
		}
		$links[] = [
			'url' => $url,
			'label' => $labels[$channel],
			'icon_class' => '-icon-' . $channel,
		];
	}

	$custom = get_field('custom_channels', 'option');
	if (!is_array($custom)) {
		return $links;
	}

	foreach ($custom as $row) {
		if (!is_array($row)) {
			continue;
		}
		$url = trim((string) ($row['url'] ?? ''));
		if ($url === '') {
			continue;
		}

		$icon_type = (string) ($row['icon_type'] ?? 'classname');
		$label = bl_social_media_label_from_url($url);

		if ($icon_type === 'code') {
			$raw_svg = trim((string) ($row['svg_code'] ?? ''));
			if ($raw_svg === '' || !function_exists('bl_svg_sanitize')) {
				continue;
			}
			$svg = bl_svg_sanitize($raw_svg);
			if ($svg === '') {
				continue;
			}
			$links[] = [
				'url' => $url,
				'label' => $label,
				'svg' => $svg,
			];
			continue;
		}

		$icon_class = bl_social_media_normalize_icon_class((string) ($row['classname'] ?? ''));
		if ($icon_class === '') {
			continue;
		}
		$links[] = [
			'url' => $url,
			'label' => $label,
			'icon_class' => $icon_class,
		];
	}

	return $links;
}

/**
 * Aria-label: "Link to %s" with channel name or custom host.
 */
function bl_social_media_link_aria_label(string $label): string
{
	$label = trim($label);
	if ($label === '') {
		$label = __('Social media', 'baselayer');
	}

	return sprintf(
		/* translators: %s: social network name or site host */
		__('Link to %s', 'baselayer'),
		$label
	);
}
