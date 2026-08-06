<?php

defined('ABSPATH') || exit;

const BL_GOOGLE_FONT_METADATA_TRANSIENT = 'bl_google_fonts_metadata_v1';
const BL_GOOGLE_FONT_METADATA_TTL = DAY_IN_SECONDS;
const BL_GOOGLE_FONT_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

/**
 * Whether the current user may install Google Fonts (Developer → Tools).
 */
function bl_google_font_can_manage(): bool
{
	return current_user_can('manage_options')
		&& function_exists('bl_is_developer_user')
		&& bl_is_developer_user((int) get_current_user_id());
}

/**
 * Install target: active child theme, otherwise parent.
 *
 * @return array{is_child: bool, slug: string, dir: string, uri_path: string, label: string}
 */
function bl_google_font_install_target(): array
{
	if (is_child_theme()) {
		$slug = get_stylesheet();
		$dir = trailingslashit(get_stylesheet_directory());
		$uri = (string) wp_parse_url(get_stylesheet_directory_uri(), PHP_URL_PATH);
		return [
			'is_child' => true,
			'slug' => $slug,
			'dir' => $dir,
			'uri_path' => untrailingslashit($uri !== null && $uri !== '' ? $uri : '/wp-content/themes/' . $slug),
			'label' => sprintf(
				/* translators: %s: child theme stylesheet slug */
				__('Child theme (%s)', 'baselayer'),
				$slug
			),
		];
	}

	$slug = get_template();
	$dir = trailingslashit(get_template_directory());
	$uri = (string) wp_parse_url(get_template_directory_uri(), PHP_URL_PATH);
	return [
		'is_child' => false,
		'slug' => $slug,
		'dir' => $dir,
		'uri_path' => untrailingslashit($uri !== null && $uri !== '' ? $uri : '/wp-content/themes/' . $slug),
		'label' => sprintf(
			/* translators: %s: parent theme template slug */
			__('Parent theme (%s)', 'baselayer'),
			$slug
		),
	];
}

/**
 * Slugify a Google Font family name (Roboto Flex → robotoflex).
 */
function bl_google_font_family_slug(string $family): string
{
	$slug = strtolower($family);
	$slug = preg_replace('/[^a-z0-9]+/', '', $slug) ?? '';
	return $slug !== '' ? $slug : 'font';
}

/**
 * @return array{family: string, category: string}[]|WP_Error
 */
function bl_google_font_fetch_metadata()
{
	$cached = get_transient(BL_GOOGLE_FONT_METADATA_TRANSIENT);
	if (is_array($cached) && isset($cached['items']) && is_array($cached['items'])) {
		return $cached['items'];
	}

	$response = wp_remote_get(
		'https://fonts.google.com/metadata/fonts',
		[
			'timeout' => 20,
			'headers' => [
				'User-Agent' => BL_GOOGLE_FONT_UA,
				'Accept' => 'application/json',
			],
		]
	);

	if (is_wp_error($response)) {
		return $response;
	}

	$code = (int) wp_remote_retrieve_response_code($response);
	$body = (string) wp_remote_retrieve_body($response);
	if ($code < 200 || $code >= 300 || $body === '') {
		return new WP_Error('bl_google_font_meta', __('Could not load the Google Fonts catalog.', 'baselayer'));
	}

	// Google prefixes JSON with a XSS guard.
	$body = preg_replace('/^\)\]\}\'\s*/', '', $body) ?? $body;
	$data = json_decode($body, true);
	if (!is_array($data) || empty($data['familyMetadataList']) || !is_array($data['familyMetadataList'])) {
		return new WP_Error('bl_google_font_meta', __('Could not parse the Google Fonts catalog.', 'baselayer'));
	}

	$items = [];
	foreach ($data['familyMetadataList'] as $row) {
		if (!is_array($row) || empty($row['family']) || !is_string($row['family'])) {
			continue;
		}
		$items[] = [
			'family' => $row['family'],
			'category' => isset($row['category']) && is_string($row['category']) ? $row['category'] : '',
		];
	}

	usort(
		$items,
		static function (array $a, array $b): int {
			return strcasecmp($a['family'], $b['family']);
		}
	);

	set_transient(BL_GOOGLE_FONT_METADATA_TRANSIENT, ['items' => $items], BL_GOOGLE_FONT_METADATA_TTL);

	return $items;
}

/**
 * @param array{family: string, category: string}[] $items
 * @return array{family: string, category: string}[]
 */
function bl_google_font_search_items(array $items, string $query, int $limit = 40): array
{
	$query = trim($query);
	if ($query === '') {
		return array_slice($items, 0, $limit);
	}

	$needle = strtolower($query);
	$starts = [];
	$contains = [];
	foreach ($items as $item) {
		$name = strtolower($item['family']);
		if (str_starts_with($name, $needle)) {
			$starts[] = $item;
		} elseif (str_contains($name, $needle)) {
			$contains[] = $item;
		}
	}

	return array_slice(array_merge($starts, $contains), 0, $limit);
}

/**
 * Fetch Google Fonts CSS2 for a family (woff2).
 *
 * @return string|WP_Error
 */
function bl_google_font_fetch_css(string $family)
{
	$family = trim($family);
	if ($family === '') {
		return new WP_Error('bl_google_font_family', __('Choose a font family.', 'baselayer'));
	}

	$encoded = rawurlencode($family);
	$urls = [
		'https://fonts.googleapis.com/css2?family=' . $encoded . ':ital,wght@0,100..900;1,100..900&display=block',
		'https://fonts.googleapis.com/css2?family=' . $encoded . ':wght@100..900&display=block',
		'https://fonts.googleapis.com/css2?family=' . $encoded . '&display=block',
	];

	$last_error = null;
	foreach ($urls as $url) {
		$response = wp_remote_get(
			$url,
			[
				'timeout' => 20,
				'headers' => [
					'User-Agent' => BL_GOOGLE_FONT_UA,
					'Accept' => 'text/css,*/*;q=0.1',
				],
			]
		);
		if (is_wp_error($response)) {
			$last_error = $response;
			continue;
		}
		$code = (int) wp_remote_retrieve_response_code($response);
		$body = (string) wp_remote_retrieve_body($response);
		if ($code >= 200 && $code < 300 && $body !== '' && str_contains($body, '@font-face')) {
			return $body;
		}
		$last_error = new WP_Error('bl_google_font_css', __('Google did not return font CSS for this family.', 'baselayer'));
	}

	return $last_error instanceof WP_Error
		? $last_error
		: new WP_Error('bl_google_font_css', __('Could not download Google Fonts CSS.', 'baselayer'));
}

/**
 * Whether a URL is an allowed Google font asset.
 */
function bl_google_font_is_allowed_asset_url(string $url): bool
{
	$parts = wp_parse_url($url);
	if (!is_array($parts) || empty($parts['scheme']) || empty($parts['host']) || empty($parts['path'])) {
		return false;
	}
	if (!in_array(strtolower((string) $parts['scheme']), ['https', 'http'], true)) {
		return false;
	}
	$host = strtolower((string) $parts['host']);
	$allowed = [
		'fonts.gstatic.com',
		'fonts.googleapis.com',
	];
	return in_array($host, $allowed, true);
}

/**
 * Extract unique font file URLs from Google CSS.
 *
 * @return string[]
 */
function bl_google_font_extract_urls(string $css): array
{
	$urls = [];
	if (preg_match_all('/url\((["\']?)([^)\'"\s]+)\1\)/i', $css, $matches)) {
		foreach ($matches[2] as $url) {
			$url = trim((string) $url);
			if ($url === '' || !bl_google_font_is_allowed_asset_url($url)) {
				continue;
			}
			$urls[$url] = $url;
		}
	}
	return array_values($urls);
}

/**
 * Detect version folder from a gstatic URL path (.../v48/...).
 */
function bl_google_font_detect_version(array $urls): string
{
	foreach ($urls as $url) {
		$path = (string) (wp_parse_url($url, PHP_URL_PATH) ?? '');
		if (preg_match('#/(v\d+)/#', $path, $m)) {
			return $m[1];
		}
	}
	return 'v1';
}

/**
 * Download a remote font file into $dest_path.
 *
 * @return true|WP_Error
 */
function bl_google_font_download_file(string $url, string $dest_path)
{
	$response = wp_remote_get(
		$url,
		[
			'timeout' => 60,
			'headers' => [
				'User-Agent' => BL_GOOGLE_FONT_UA,
			],
		]
	);
	if (is_wp_error($response)) {
		return $response;
	}
	$code = (int) wp_remote_retrieve_response_code($response);
	$body = wp_remote_retrieve_body($response);
	if ($code < 200 || $code >= 300 || !is_string($body) || $body === '') {
		return new WP_Error('bl_google_font_download', __('Could not download a font file.', 'baselayer'));
	}

	$dir = dirname($dest_path);
	if (!wp_mkdir_p($dir)) {
		return new WP_Error('bl_google_font_mkdir', __('Could not create the font directory.', 'baselayer'));
	}

	$written = file_put_contents($dest_path, $body);
	if ($written === false) {
		return new WP_Error('bl_google_font_write', __('Could not write a font file.', 'baselayer'));
	}

	return true;
}

/**
 * Convert Google CSS into a Baselayer-style SCSS partial.
 */
function bl_google_font_css_to_scss(string $css, string $font_path_uri, array $url_to_filename): string
{
	$out = $css;
	foreach ($url_to_filename as $url => $filename) {
		$out = str_replace($url, '#{$font-path}/' . $filename, $out);
		$out = str_replace('url(' . $url . ')', 'url(#{$font-path}/' . $filename . ')', $out);
		$out = str_replace("url('" . $url . "')", 'url(#{$font-path}/' . $filename . ')', $out);
		$out = str_replace('url("' . $url . '")', 'url(#{$font-path}/' . $filename . ')', $out);
	}

	// Normalize remaining url("...") quoting around our Sass interpolation.
	$out = preg_replace('/url\((["\'])(#\{\$font-path\}\/[^)\'"]+)\1\)/', 'url($2)', $out) ?? $out;

	$header = "/* Generated by BaseLayer — Install Google Font */\n";
	$header .= "\$font-path: '{$font_path_uri}';\n\n";

	return $header . trim($out) . "\n";
}

/**
 * Relative @use snippet for the installed partial.
 */
function bl_google_font_use_snippet(bool $is_child, string $slug): string
{
	if ($is_child) {
		return "@use '../../fonts/{$slug}/{$slug}';";
	}
	return "@use '../../../fonts/{$slug}/{$slug}';";
}

/**
 * Install a Google Font family into the child (or parent) theme.
 *
 * @return array<string, mixed>|WP_Error
 */
function bl_google_font_install(string $family)
{
	$family = trim(wp_strip_all_tags($family));
	if ($family === '') {
		return new WP_Error('bl_google_font_family', __('Choose a font family.', 'baselayer'));
	}

	$css = bl_google_font_fetch_css($family);
	if (is_wp_error($css)) {
		return $css;
	}

	$urls = bl_google_font_extract_urls($css);
	if ($urls === []) {
		return new WP_Error('bl_google_font_urls', __('No font files were found in the Google CSS.', 'baselayer'));
	}

	$target = bl_google_font_install_target();
	$slug = bl_google_font_family_slug($family);
	$version = bl_google_font_detect_version($urls);
	$fonts_root = $target['dir'] . 'fonts/' . $slug . '/';
	$version_dir = $fonts_root . $version . '/';

	if (!wp_mkdir_p($version_dir)) {
		return new WP_Error('bl_google_font_mkdir', __('Could not create the font directory.', 'baselayer'));
	}

	$url_to_filename = [];
	$files = [];
	foreach ($urls as $url) {
		$path = (string) (wp_parse_url($url, PHP_URL_PATH) ?? '');
		$filename = basename($path);
		$filename = sanitize_file_name($filename);
		if ($filename === '' || !preg_match('/\.woff2$/i', $filename)) {
			// Keep original extension if present; still allow woff/ttf from Google rarely.
			$ext = pathinfo($path, PATHINFO_EXTENSION);
			$filename = sanitize_file_name(pathinfo($path, PATHINFO_FILENAME) . ($ext !== '' ? '.' . $ext : '.woff2'));
		}
		if ($filename === '' || str_contains($filename, '..')) {
			return new WP_Error('bl_google_font_name', __('Invalid font file name from Google.', 'baselayer'));
		}

		// Avoid collisions if two URLs share a basename (unlikely).
		$dest_name = $filename;
		$i = 2;
		while (isset($files[$dest_name]) && $files[$dest_name] !== $url) {
			$dest_name = pathinfo($filename, PATHINFO_FILENAME) . '-' . $i . '.' . pathinfo($filename, PATHINFO_EXTENSION);
			$i++;
		}

		$dest = $version_dir . $dest_name;
		$result = bl_google_font_download_file($url, $dest);
		if (is_wp_error($result)) {
			return $result;
		}

		$url_to_filename[$url] = $dest_name;
		$files[$dest_name] = $url;
	}

	$font_path_uri = $target['uri_path'] . '/fonts/' . $slug . '/' . $version;
	$scss = bl_google_font_css_to_scss($css, $font_path_uri, $url_to_filename);
	$scss_path = $fonts_root . '_' . $slug . '.scss';
	if (file_put_contents($scss_path, $scss) === false) {
		return new WP_Error('bl_google_font_write', __('Could not write the font SCSS file.', 'baselayer'));
	}

	$use = bl_google_font_use_snippet($target['is_child'], $slug);
	$import_hint = $target['is_child']
		? __('Add this to your child theme src/scss/main.scss (above the parent @forward), then rebuild CSS.', 'baselayer')
		: __('Add this to themes/baselayer/src/scss/fonts/_fonts.scss, then rebuild CSS.', 'baselayer');

	return [
		'family' => $family,
		'slug' => $slug,
		'version' => $version,
		'target' => $target['label'],
		'is_child' => $target['is_child'],
		'files' => count($files),
		'scss' => 'fonts/' . $slug . '/_' . $slug . '.scss',
		'use' => $use,
		'import_hint' => $import_hint,
		'preview_css' => $css,
	];
}

add_action('wp_ajax_bl_google_font_search', function (): void {
	if (!bl_google_font_can_manage()) {
		wp_send_json_error(['message' => __('You do not have permission to install fonts.', 'baselayer')], 403);
	}
	check_ajax_referer('bl_google_font', 'nonce');

	$items = bl_google_font_fetch_metadata();
	if (is_wp_error($items)) {
		wp_send_json_error(['message' => $items->get_error_message()], 500);
	}

	$query = isset($_POST['q']) ? sanitize_text_field(wp_unslash((string) $_POST['q'])) : '';
	$results = bl_google_font_search_items($items, $query, 40);
	wp_send_json_success(['items' => $results]);
});

add_action('wp_ajax_bl_google_font_install', function (): void {
	if (!bl_google_font_can_manage()) {
		wp_send_json_error(['message' => __('You do not have permission to install fonts.', 'baselayer')], 403);
	}
	check_ajax_referer('bl_google_font', 'nonce');

	$family = isset($_POST['family']) ? sanitize_text_field(wp_unslash((string) $_POST['family'])) : '';
	$result = bl_google_font_install($family);
	if (is_wp_error($result)) {
		wp_send_json_error(['message' => $result->get_error_message()], 500);
	}
	wp_send_json_success($result);
});
