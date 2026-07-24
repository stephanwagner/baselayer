<?php

defined('ABSPATH') || exit;

/**
 * Absolute filesystem path to a package icon SVG.
 */
function bl_forms_icon_path(string $icon_name): string
{
	$icon_name = sanitize_file_name($icon_name);
	$icon_name = preg_replace('/\.svg$/i', '', $icon_name) ?: '';

	return bl_forms_path('assets/icons/' . $icon_name . '.svg');
}

/**
 * Inline SVG markup from a package icon file.
 *
 * @param array<string, string|int|float|bool> $attributes
 */
function bl_forms_svg_code(string $icon_name, array $attributes = []): string
{
	$path = bl_forms_icon_path($icon_name);
	if (!is_readable($path)) {
		return '';
	}

	$svg = (string) file_get_contents($path);
	if ($svg === '' || stripos($svg, '<svg') === false) {
		return '';
	}

	if ($attributes !== []) {
		$attr_html = '';
		foreach ($attributes as $name => $value) {
			$name = trim((string) $name);
			if ($name === '') {
				continue;
			}
			$attr_html .= ' ' . $name . '="' . esc_attr((string) $value) . '"';
		}
		if ($attr_html !== '') {
			$svg = (string) preg_replace('/<svg\b([^>]*)>/i', '<svg$1' . $attr_html . '>', $svg, 1);
		}
	}

	return $svg;
}

/**
 * Convert inline SVG to a data URI suitable for CPT menu_icon.
 */
function bl_forms_svg_to_menu_icon(string $svg): string
{
	$fill = '#f3f1f1';
	$svg = preg_replace('/\sfill="[^"]*"/i', ' fill="' . $fill . '"', $svg);
	if (is_string($svg) && stripos($svg, '<svg') !== false && stripos($svg, ' fill=') === false) {
		$svg = preg_replace('/<svg\b/i', '<svg fill="' . $fill . '"', $svg, 1);
	}
	if (!is_string($svg) || $svg === '') {
		return 'dashicons-feedback';
	}

	return 'data:image/svg+xml;base64,' . base64_encode($svg);
}
