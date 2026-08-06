<?php

/**
 * Social media links from Website settings (ACF options or Baselayer site_settings).
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
 * Channels repeater rows for the current storage backend.
 *
 * Prefers the unified `channels` schema; falls back to legacy channel_1…6 + custom_channels.
 *
 * @return list<array<string, mixed>>
 */
function bl_social_media_channel_rows(): array
{
	if (function_exists('bl_website_uses_acf') && bl_website_uses_acf()) {
		if (!function_exists('get_field')) {
			return [];
		}

		$channels = get_field('channels', 'option');
		if (is_array($channels) && $channels !== []) {
			return array_values(array_filter($channels, 'is_array'));
		}

		return bl_social_media_legacy_rows_from_sources(
			get_field('social_media', 'option'),
			get_field('custom_channels', 'option')
		);
	}

	$values = function_exists('bl_website_site_values') ? bl_website_site_values('social-media') : [];
	$channels = isset($values['channels']) && is_array($values['channels']) ? $values['channels'] : [];
	if ($channels !== []) {
		return array_values(array_filter($channels, 'is_array'));
	}

	$custom = isset($values['custom_channels']) && is_array($values['custom_channels'])
		? $values['custom_channels']
		: [];

	return bl_social_media_legacy_rows_from_sources($values, $custom);
}

/**
 * Convert legacy preset slots + custom repeater into unified channel rows.
 *
 * @param mixed $social
 * @param mixed $custom
 * @return list<array<string, mixed>>
 */
function bl_social_media_legacy_rows_from_sources($social, $custom): array
{
	$social = is_array($social) ? $social : [];
	$custom = is_array($custom) ? $custom : [];
	$rows = [];

	for ($i = 1; $i <= 6; $i++) {
		$url = trim((string) ($social['url_' . $i] ?? ''));
		$channel = sanitize_key((string) ($social['channel_' . $i] ?? ''));
		if ($url === '' || $channel === '') {
			continue;
		}
		$rows[] = [
			'channel' => $channel,
			'url' => $url,
		];
	}

	foreach ($custom as $row) {
		if (!is_array($row)) {
			continue;
		}
		$icon_type = (string) ($row['icon_type'] ?? 'classname');
		if ($icon_type === 'classname') {
			$icon_type = 'icon';
		}
		$rows[] = [
			'channel' => 'custom',
			'platform' => '',
			'icon_type' => $icon_type,
			'icon' => (string) ($row['classname'] ?? $row['icon'] ?? ''),
			'svg_code' => (string) ($row['svg_code'] ?? ''),
			'url' => (string) ($row['url'] ?? ''),
		];
	}

	return $rows;
}

/**
 * Collect social links from the channels repeater (or legacy fallback).
 *
 * @return list<array{url: string, label: string, icon_class?: string, svg?: string}>
 */
function bl_get_social_media_links(): array
{
	$links = [];
	$labels = bl_social_media_channel_labels();

	foreach (bl_social_media_channel_rows() as $row) {
		$url = trim((string) ($row['url'] ?? ''));
		if ($url === '') {
			continue;
		}

		$channel = sanitize_key((string) ($row['channel'] ?? $row['channel_2'] ?? ''));
		if ($channel !== '' && $channel !== 'custom' && isset($labels[$channel])) {
			$links[] = [
				'url' => $url,
				'label' => $labels[$channel],
				'icon_class' => '-icon-' . $channel,
			];
			continue;
		}

		if ($channel !== 'custom' && $channel !== '') {
			continue;
		}

		$platform = trim((string) ($row['platform'] ?? ''));
		$label = $platform !== '' ? $platform : bl_social_media_label_from_url($url);
		$icon_type = (string) ($row['icon_type'] ?? 'icon');

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

		$icon_raw = (string) ($row['icon'] ?? $row['classname'] ?? $row['fjwd70dk8'] ?? '');
		$icon_class = bl_social_media_normalize_icon_class($icon_raw);
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
