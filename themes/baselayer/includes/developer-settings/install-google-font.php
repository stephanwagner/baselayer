<?php

defined('ABSPATH') || exit;

const BL_GOOGLE_FONT_METADATA_TRANSIENT = 'bl_google_fonts_metadata_v2';
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
 * Compare catalog items by Google popularity (lower = more popular).
 */
function bl_google_font_compare_popularity(array $a, array $b): int
{
	$pa = isset($a['popularity']) ? (int) $a['popularity'] : PHP_INT_MAX;
	$pb = isset($b['popularity']) ? (int) $b['popularity'] : PHP_INT_MAX;
	if ($pa === $pb) {
		return strcasecmp((string) ($a['family'] ?? ''), (string) ($b['family'] ?? ''));
	}
	return $pa <=> $pb;
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
 * @return array{family: string, category: string, popularity: int}[]|WP_Error
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
			'popularity' => isset($row['popularity']) ? (int) $row['popularity'] : PHP_INT_MAX,
		];
	}

	usort($items, 'bl_google_font_compare_popularity');

	set_transient(BL_GOOGLE_FONT_METADATA_TRANSIENT, ['items' => $items], BL_GOOGLE_FONT_METADATA_TTL);

	return $items;
}

/**
 * @param array{family: string, category: string, popularity?: int}[] $items
 * @return array{family: string, category: string, popularity?: int}[]
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

	usort($starts, 'bl_google_font_compare_popularity');
	usort($contains, 'bl_google_font_compare_popularity');

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
 * Relative @use snippet for src/scss/_fonts.scss.
 */
function bl_google_font_use_snippet(string $slug): string
{
	return "@use '../../fonts/{$slug}/{$slug}';";
}

/**
 * Path to the theme fonts index partial.
 */
function bl_google_font_fonts_scss_path(array $target): string
{
	return $target['dir'] . 'src/scss/_fonts.scss';
}

/**
 * Legacy path used before fonts index moved to src/scss/_fonts.scss.
 */
function bl_google_font_legacy_fonts_scss_path(array $target): string
{
	return $target['dir'] . 'src/scss/fonts/_fonts.scss';
}

/**
 * Rewrite legacy ../../../fonts/ @use paths to ../../fonts/ for src/scss/_fonts.scss.
 */
function bl_google_font_normalize_fonts_scss(string $contents): string
{
	return (string) preg_replace(
		"/@use\\s+(['\"])\\.\\.\\/\\.\\.\\/\\.\\.\\/fonts\\//",
		'@use $1../../fonts/',
		$contents
	);
}

/**
 * Ensure child theme main/admin SCSS forward the local fonts index.
 */
function bl_google_font_ensure_child_fonts_forward(array $target): ?WP_Error
{
	if (empty($target['is_child'])) {
		return null;
	}

	$forward = "@forward 'fonts';";
	$marker = "\n// Child theme fonts (Developer → Tools → Install Google Font)\n{$forward}\n";
	$files = [
		$target['dir'] . 'src/scss/main.scss',
		$target['dir'] . 'src/scss/admin.scss',
	];

	foreach ($files as $path) {
		if (!is_readable($path)) {
			continue;
		}
		$contents = (string) file_get_contents($path);
		if ($contents === '') {
			continue;
		}

		$original = $contents;

		// Migrate legacy nested forward.
		$contents = str_replace(
			["@forward 'fonts/fonts';", '@forward "fonts/fonts";'],
			$forward,
			$contents
		);

		$has_forward = (bool) preg_match("/@forward\\s+['\"]fonts['\"]\\s*;/", $contents);
		if (!$has_forward) {
			// Prefer inserting after the child config forward.
			if (preg_match("/@forward\\s+['\"]config['\"]\\s*;/", $contents, $m, PREG_OFFSET_CAPTURE)) {
				$at = (int) $m[0][1] + strlen($m[0][0]);
				$contents = substr($contents, 0, $at) . $marker . substr($contents, $at);
			} else {
				$contents = $marker . $contents;
			}
		}

		if ($contents === $original) {
			continue;
		}

		if (file_put_contents($path, $contents) === false) {
			return new WP_Error(
				'bl_google_font_forward',
				sprintf(
					/* translators: %s: relative SCSS path */
					__('Could not update %s to load theme fonts.', 'baselayer'),
					str_replace($target['dir'], '', $path)
				)
			);
		}
	}

	return null;
}

/**
 * Create or append a font @use in src/scss/_fonts.scss.
 *
 * @return true|WP_Error
 */
function bl_google_font_register_in_fonts_scss(string $family, string $slug, array $target)
{
	$scss_path = bl_google_font_fonts_scss_path($target);
	$legacy_path = bl_google_font_legacy_fonts_scss_path($target);
	$dir = dirname($scss_path);
	if (!wp_mkdir_p($dir)) {
		return new WP_Error('bl_google_font_mkdir', __('Could not create the fonts SCSS directory.', 'baselayer'));
	}

	$forward_error = bl_google_font_ensure_child_fonts_forward($target);
	if (is_wp_error($forward_error)) {
		return $forward_error;
	}

	$existing = is_readable($scss_path) ? (string) file_get_contents($scss_path) : '';
	if ($existing === '' && is_readable($legacy_path)) {
		$existing = bl_google_font_normalize_fonts_scss((string) file_get_contents($legacy_path));
	} elseif ($existing !== '') {
		$existing = bl_google_font_normalize_fonts_scss($existing);
	}

	$use = bl_google_font_use_snippet($slug);
	$legacy_use = "@use '../../../fonts/{$slug}/{$slug}';";

	// Already active (new or leftover legacy path).
	if (
		preg_match('/^\s*' . preg_quote($use, '/') . '\s*$/m', $existing)
		|| preg_match('/^\s*' . preg_quote($legacy_use, '/') . '\s*$/m', $existing)
	) {
		$existing = str_replace($legacy_use, $use, $existing);
		if (file_put_contents($scss_path, $existing) === false) {
			return new WP_Error('bl_google_font_write', __('Could not update the fonts SCSS file.', 'baselayer'));
		}
		if ($legacy_path !== $scss_path && is_file($legacy_path)) {
			@unlink($legacy_path);
		}
		return true;
	}

	// Commented out — uncomment in place (new or legacy path form).
	foreach ([$use, $legacy_use] as $candidate) {
		$commented = '// ' . $candidate;
		if (str_contains($existing, $commented)) {
			$updated = str_replace($commented, $use, $existing);
			$updated = str_replace($legacy_use, $use, $updated);
			if (file_put_contents($scss_path, $updated) === false) {
				return new WP_Error('bl_google_font_write', __('Could not update the fonts SCSS file.', 'baselayer'));
			}
			if ($legacy_path !== $scss_path && is_file($legacy_path)) {
				@unlink($legacy_path);
			}
			return true;
		}
	}

	if ($existing === '') {
		$existing = "/* Theme fonts — managed via Developer → Tools → Install Google Font */\n";
	}

	$block = "\n// " . $family . "\n" . $use . "\n";
	if (!str_ends_with($existing, "\n")) {
		$existing .= "\n";
	}
	if (file_put_contents($scss_path, $existing . $block) === false) {
		return new WP_Error('bl_google_font_write', __('Could not update the fonts SCSS file.', 'baselayer'));
	}
	if ($legacy_path !== $scss_path && is_file($legacy_path)) {
		@unlink($legacy_path);
	}

	return true;
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

	$registered = bl_google_font_register_in_fonts_scss($family, $slug, $target);
	if (is_wp_error($registered)) {
		return $registered;
	}

	$use = bl_google_font_use_snippet($slug);
	$import_hint = __('Fonts were added to src/scss/_fonts.scss. Rebuild your theme CSS to apply them.', 'baselayer');

	return [
		'family' => $family,
		'slug' => $slug,
		'version' => $version,
		'target' => $target['label'],
		'is_child' => $target['is_child'],
		'files' => count($files),
		'scss' => 'fonts/' . $slug . '/_' . $slug . '.scss',
		'fonts_index' => 'src/scss/_fonts.scss',
		'use' => $use,
		'import_hint' => $import_hint,
		'preview_css' => $css,
	];
}

/**
 * Install up to 3 Google Font families.
 *
 * @param string[] $families
 * @return array<string, mixed>|WP_Error
 */
function bl_google_font_install_many(array $families)
{
	$normalized = [];
	foreach ($families as $family) {
		$family = trim(wp_strip_all_tags((string) $family));
		if ($family === '') {
			continue;
		}
		$normalized[$family] = $family;
	}
	$normalized = array_values($normalized);

	if ($normalized === []) {
		return new WP_Error('bl_google_font_family', __('Choose a font family.', 'baselayer'));
	}
	if (count($normalized) > 3) {
		return new WP_Error('bl_google_font_limit', __('You can install at most 3 fonts at a time.', 'baselayer'));
	}

	$installed = [];
	$uses = [];
	$files_total = 0;
	$target_label = '';
	$is_child = false;
	$import_hint = '';

	foreach ($normalized as $family) {
		$result = bl_google_font_install($family);
		if (is_wp_error($result)) {
			return new WP_Error(
				$result->get_error_code(),
				sprintf(
					/* translators: 1: font family name, 2: error message */
					__('Could not install %1$s: %2$s', 'baselayer'),
					$family,
					$result->get_error_message()
				)
			);
		}
		$installed[] = $result;
		$uses[] = (string) ($result['use'] ?? '');
		$files_total += (int) ($result['files'] ?? 0);
		$target_label = (string) ($result['target'] ?? $target_label);
		$is_child = !empty($result['is_child']);
		$import_hint = (string) ($result['import_hint'] ?? $import_hint);
	}

	$count = count($installed);
	$title = $count === 1
		? __('Font installed.', 'baselayer')
		: sprintf(
			/* translators: %d: number of fonts installed */
			_n('%d font installed.', '%d fonts installed.', $count, 'baselayer'),
			$count
		);

	return [
		'count' => $count,
		'title' => $title,
		'installed' => $installed,
		'families' => array_values(array_map(static fn($row) => (string) ($row['family'] ?? ''), $installed)),
		'files' => $files_total,
		'target' => $target_label,
		'is_child' => $is_child,
		'use' => implode("\n", array_filter($uses)),
		'import_hint' => $import_hint,
	];
}

const BL_GOOGLE_FONT_LINK_NOTE_OPTION = 'bl_google_font_link_note';

/**
 * @return array{title: string, import_hint: string, use: string, families: string[]}|null
 */
function bl_google_font_get_link_note(): ?array
{
	$note = get_option(BL_GOOGLE_FONT_LINK_NOTE_OPTION, null);
	if (!is_array($note) || empty($note['use']) || !is_string($note['use'])) {
		return null;
	}
	return [
		'title' => isset($note['title']) && is_string($note['title']) ? $note['title'] : '',
		'import_hint' => isset($note['import_hint']) && is_string($note['import_hint']) ? $note['import_hint'] : '',
		'use' => $note['use'],
		'families' => isset($note['families']) && is_array($note['families'])
			? array_values(array_map('strval', $note['families']))
			: [],
	];
}

/**
 * Persist post-install @use hint on the Tools page until dismissed.
 *
 * @param array{title?: string, import_hint?: string, use?: string, families?: string[]} $note
 */
function bl_google_font_save_link_note(array $note): void
{
	$use = isset($note['use']) ? trim((string) $note['use']) : '';
	if ($use === '') {
		return;
	}

	$existing = bl_google_font_get_link_note();
	$uses = [];
	if ($existing && $existing['use'] !== '') {
		foreach (preg_split('/\R/', $existing['use']) ?: [] as $line) {
			$line = trim((string) $line);
			if ($line !== '') {
				$uses[$line] = $line;
			}
		}
	}
	foreach (preg_split('/\R/', $use) ?: [] as $line) {
		$line = trim((string) $line);
		if ($line !== '') {
			$uses[$line] = $line;
		}
	}

	$families = [];
	if ($existing && !empty($existing['families'])) {
		foreach ($existing['families'] as $family) {
			$family = trim((string) $family);
			if ($family !== '') {
				$families[$family] = $family;
			}
		}
	}
	if (!empty($note['families']) && is_array($note['families'])) {
		foreach ($note['families'] as $family) {
			$family = trim((string) $family);
			if ($family !== '') {
				$families[$family] = $family;
			}
		}
	}

	$count = count($families);
	$title = $count > 1
		? sprintf(
			/* translators: %d: number of fonts installed */
			_n('%d font installed.', '%d fonts installed.', $count, 'baselayer'),
			$count
		)
		: (isset($note['title']) && is_string($note['title']) && $note['title'] !== ''
			? $note['title']
			: __('Font installed.', 'baselayer'));

	$hint = isset($note['import_hint']) && is_string($note['import_hint']) && $note['import_hint'] !== ''
		? $note['import_hint']
		: ($existing['import_hint'] ?? '');

	update_option(
		BL_GOOGLE_FONT_LINK_NOTE_OPTION,
		[
			'title' => $title,
			'import_hint' => $hint,
			'use' => implode("\n", array_values($uses)),
			'families' => array_values($families),
		],
		false
	);
}

function bl_google_font_clear_link_note(): void
{
	delete_option(BL_GOOGLE_FONT_LINK_NOTE_OPTION);
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

	$families = [];
	if (isset($_POST['families'])) {
		$raw = wp_unslash($_POST['families']);
		if (is_string($raw)) {
			$decoded = json_decode($raw, true);
			$raw = is_array($decoded) ? $decoded : [];
		}
		if (is_array($raw)) {
			$families = array_map('strval', $raw);
		}
	} elseif (isset($_POST['family'])) {
		$families = [sanitize_text_field(wp_unslash((string) $_POST['family']))];
	}

	$result = bl_google_font_install_many($families);
	if (is_wp_error($result)) {
		wp_send_json_error(['message' => $result->get_error_message()], 500);
	}

	bl_google_font_save_link_note($result);
	$note = bl_google_font_get_link_note();
	if ($note) {
		$result['title'] = $note['title'];
		$result['import_hint'] = $note['import_hint'];
		$result['use'] = $note['use'];
		$result['families'] = $note['families'];
	}

	wp_send_json_success($result);
});

add_action('wp_ajax_bl_google_font_dismiss_link_note', function (): void {
	if (!bl_google_font_can_manage()) {
		wp_send_json_error(['message' => __('You do not have permission to install fonts.', 'baselayer')], 403);
	}
	check_ajax_referer('bl_google_font', 'nonce');
	bl_google_font_clear_link_note();
	wp_send_json_success(['dismissed' => true]);
});
