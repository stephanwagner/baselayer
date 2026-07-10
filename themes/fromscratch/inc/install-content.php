<?php

defined('ABSPATH') || exit;

const FS_INSTALL_MEDIA_META_KEY = '_fs_install_media_key';

/**
 * Site locale key for install page titles/slugs (from WordPress site language).
 *
 * @return 'en'|'de'
 */
function fs_install_site_locale_key(): string
{
	$locale = get_option('WPLANG', '');
	if (!is_string($locale) || $locale === '') {
		$locale = function_exists('get_locale') ? get_locale() : 'en_US';
	}

	return str_starts_with($locale, 'de') ? 'de' : 'en';
}

/**
 * EN/DE page definitions keyed by locale.
 *
 * @return array<string, array<string, array{title: string, slug: string}>>
 */
function fs_install_page_definitions(): array
{
	return [
		'homepage' => [
			'en' => ['title' => 'Home', 'slug' => 'home'],
			'de' => ['title' => 'Startseite', 'slug' => 'startseite'],
		],
		'blocks' => [
			'en' => ['title' => 'Blocks', 'slug' => 'blocks'],
			'de' => ['title' => 'Blöcke', 'slug' => 'bloecke'],
		],
		'contact' => [
			'en' => ['title' => 'Contact', 'slug' => 'contact'],
			'de' => ['title' => 'Kontakt', 'slug' => 'kontakt'],
		],
		'privacy' => [
			'en' => ['title' => 'Privacy Policy', 'slug' => 'privacy-policy'],
			'de' => ['title' => 'Datenschutz', 'slug' => 'datenschutz'],
		],
		'imprint' => [
			'en' => ['title' => 'Imprint', 'slug' => 'imprint'],
			'de' => ['title' => 'Impressum', 'slug' => 'impressum'],
		],
	];
}

/**
 * Page definitions for the site locale (single language).
 *
 * @return array<string, array{title: string, slug: string}>
 */
function fs_install_page_manifest(): array
{
	$locale_key = fs_install_site_locale_key();
	$definitions = fs_install_page_definitions();
	$manifest = [];

	foreach ($definitions as $key => $translations) {
		if (isset($translations[$locale_key])) {
			$manifest[$key] = $translations[$locale_key];
		}
	}

	return $manifest;
}

/**
 * Remove default WordPress sample content (posts, comments).
 */
function fs_install_cleanup_default_content(): void
{
	$hello_post = get_page_by_path('hello-world', OBJECT, 'post');
	if ($hello_post) {
		wp_delete_post((int) $hello_post->ID, true);
	}

	$comments = get_comments(['number' => -1]);
	foreach ($comments as $comment) {
		wp_delete_comment((int) $comment->comment_ID, true);
	}
}

/**
 * Delete WordPress default privacy policy page before creating the theme privacy page.
 */
function fs_install_delete_default_wp_pages(): void
{
	$privacy_id = (int) get_option('wp_page_for_privacy_policy');
	if ($privacy_id > 0) {
		wp_delete_post($privacy_id, true);
		update_option('wp_page_for_privacy_policy', 0);
	}
}

/**
 * Sample media bundled with the theme for install seeding.
 *
 * Array keys double as tokens for install-pages/*.html:
 * {{media:KEY:url}} (attachment URL) and {{media:KEY:id}} (attachment ID),
 * replaced on install by fs_install_replace_page_placeholders().
 * 
 * {{media:sample-image-1:id}}
 * {{media:sample-image-1:url}}
 *
 * The `caption` is stored as the attachment caption (post_excerpt), which shows
 * as the image undertitle in galleries and captioned image blocks.
 *
 * @return array<string, array{file: string, title: string, caption: string}>
 */
function fs_install_media_manifest(): array
{
	$base = __DIR__ . '/install-media';

	return [
		'sample-image-1' => [
			'file'    => $base . '/sample-image-1.webp',
			'title'   => 'Sunlit Landscape',
			'caption' => 'Evening glow across the hills',
		],
		'sample-image-2' => [
			'file'    => $base . '/sample-image-2.webp',
			'title'   => 'Open Horizon',
			'caption' => 'Mountain scenery framed by green trees',
		],
		'sample-image-3' => [
			'file'    => $base . '/sample-image-3.webp',
			'title'   => 'Quiet Scenery',
			'caption' => 'A calm lake bathed in autumn sunlight',
		],
		'sample-image-4' => [
			'file'    => $base . '/sample-image-4.webp',
			'title'   => 'Wide Vista',
			'caption' => 'Lake at the foot of a small mountain range',
		],
		'sample-image-5' => [
			'file'    => $base . '/sample-image-5.webp',
			'title'   => 'Autumn Forest',
			'caption' => 'Last light on the peaks above the forest',
		],
		'sample-video-1' => [
			'file'    => $base . '/sample-video-1.mp4',
			'title'   => 'Sample Motion Clip',
			'caption' => 'A short sample video for testing and placeholder content',
		],
	];
}

/**
 * Find an existing install media attachment by stable key.
 */
function fs_install_find_media_by_key(string $key): int
{
	if ($key === '') {
		return 0;
	}

	$posts = get_posts([
		'post_type'      => 'attachment',
		'post_status'    => 'inherit',
		'posts_per_page' => 1,
		'fields'         => 'ids',
		'meta_key'       => FS_INSTALL_MEDIA_META_KEY,
		'meta_value'     => $key,
	]);

	if (!is_array($posts) || empty($posts[0])) {
		return 0;
	}

	return (int) $posts[0];
}

/**
 * Copy a bundled file into uploads and register it as an attachment.
 *
 * @param array{file: string, title: string, caption: string} $item
 */
function fs_install_import_media_file(string $key, array $item): int
{
	$source = $item['file'];
	if (!is_readable($source)) {
		return 0;
	}

	if (!function_exists('wp_handle_upload')) {
		require_once ABSPATH . 'wp-admin/includes/file.php';
	}
	if (!function_exists('wp_generate_attachment_metadata')) {
		require_once ABSPATH . 'wp-admin/includes/image.php';
	}
	if (!function_exists('wp_read_video_metadata')) {
		require_once ABSPATH . 'wp-admin/includes/media.php';
	}

	$upload_dir = wp_upload_dir();
	if (!empty($upload_dir['error'])) {
		return 0;
	}

	$filename = basename($source);
	$destination = $upload_dir['path'] . '/' . wp_unique_filename($upload_dir['path'], $filename);

	if (!copy($source, $destination)) {
		return 0;
	}

	$filetype = wp_check_filetype($destination, null);

	$attachment_id = wp_insert_attachment([
		'post_mime_type' => $filetype['type'] ?? '',
		'post_title'     => $item['title'],
		'post_excerpt'   => $item['caption'],
		'post_status'    => 'inherit',
	], $destination);

	if (is_wp_error($attachment_id) || $attachment_id <= 0) {
		return 0;
	}

	update_post_meta($attachment_id, FS_INSTALL_MEDIA_META_KEY, $key);

	$metadata = wp_generate_attachment_metadata($attachment_id, $destination);
	if (is_array($metadata)) {
		wp_update_attachment_metadata($attachment_id, $metadata);
	}

	return (int) $attachment_id;
}

/**
 * Import bundled sample media into the WordPress media library.
 *
 * @return array<string, array{id: int, url: string}>
 */
function fs_install_import_media(): array
{
	$media = [];

	foreach (fs_install_media_manifest() as $key => $item) {
		$attachment_id = fs_install_find_media_by_key($key);
		if ($attachment_id <= 0) {
			$attachment_id = fs_install_import_media_file($key, $item);
		}

		if ($attachment_id <= 0) {
			continue;
		}

		$url = wp_get_attachment_url($attachment_id);
		if (!is_string($url) || $url === '') {
			continue;
		}

		$media[$key] = [
			'id'  => $attachment_id,
			'url' => $url,
		];
	}

	return $media;
}

/**
 * @return string Block editor markup for a placeholder page.
 */
function fs_install_page_content(string $title): string
{
	$heading = esc_html($title);

	return <<<HTML
<!-- wp:heading {"level":1} -->
<h1>{$heading}</h1>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
<!-- /wp:paragraph -->
HTML;
}

/**
 * Path to exported block HTML for an install page key (e.g. homepage → install-pages/homepage.html).
 */
function fs_install_page_html_path(string $page_key): string
{
	return __DIR__ . '/install-pages/' . $page_key . '.html';
}

/**
 * Replace dynamic placeholders in install page HTML.
 *
 * @param array<string, array{title: string, slug: string}> $manifest
 * @param array<string, array{id: int, url: string}>       $media
 */
function fs_install_replace_page_placeholders(string $html, array $manifest, array $media = []): string
{
	$blocks_slug = $manifest['blocks']['slug'] ?? 'blocks';
	$replacements = [
		'{{blocks_url}}' => home_url(user_trailingslashit($blocks_slug)),
		'{{home_url}}'   => home_url('/'),
	];

	foreach ($media as $key => $item) {
		if (!is_string($key) || $key === '' || !is_array($item)) {
			continue;
		}

		$id = (int) ($item['id'] ?? 0);
		$url = (string) ($item['url'] ?? '');

		if ($id > 0) {
			$replacements['{{media:' . $key . ':id}}'] = (string) $id;
		}
		if ($url !== '') {
			$replacements['{{media:' . $key . ':url}}'] = $url;
		}
	}

	return str_replace(array_keys($replacements), array_values($replacements), $html);
}

/**
 * Load block editor markup from install-pages/{key}.html when present.
 *
 * @param array<string, array{title: string, slug: string}> $manifest Full locale manifest.
 * @param array<string, array{id: int, url: string}>       $media    Imported install media.
 */
function fs_install_page_html_content(string $page_key, array $manifest, array $media = []): ?string
{
	$path = fs_install_page_html_path($page_key);
	if (!is_readable($path)) {
		return null;
	}

	$html = file_get_contents($path);
	if (!is_string($html) || trim($html) === '') {
		return null;
	}

	return fs_install_replace_page_placeholders($html, $manifest, $media);
}

/**
 * Block editor markup for install pages (HTML file or placeholder).
 *
 * @param array<string, array{title: string, slug: string}> $manifest Full locale manifest.
 * @param array<string, array{id: int, url: string}>       $media    Imported install media.
 */
function fs_install_page_post_content(string $page_key, array $manifest, array $media = []): string
{
	$html = fs_install_page_html_content($page_key, $manifest, $media);
	if ($html !== null) {
		return $html;
	}

	$title = $manifest[$page_key]['title'] ?? $page_key;

	return fs_install_page_content($title);
}

/**
 * Create manifest pages for the site locale.
 *
 * @param array<string, array{id: int, url: string}> $media Imported install media.
 *
 * @return array<string, int> Page keys mapped to post IDs.
 */
function fs_install_create_pages(array $media = []): array
{
	$manifest = fs_install_page_manifest();
	$page_ids = [];

	foreach ($manifest as $key => $def) {
		$post_id = wp_insert_post([
			'post_type'    => 'page',
			'post_status'  => 'publish',
			'post_title'   => $def['title'],
			'post_name'    => $def['slug'],
			'post_content' => fs_install_page_post_content($key, $manifest, $media),
		], true);

		if (is_wp_error($post_id) || !$post_id) {
			continue;
		}

		$page_ids[$key] = (int) $post_id;
	}

	if (!empty($page_ids['homepage'])) {
		$homepage_id = (int) $page_ids['homepage'];
		$title_meta = defined('FS_SHOW_PAGE_TITLE_META') ? FS_SHOW_PAGE_TITLE_META : '_fs_show_page_title';
		update_post_meta($homepage_id, $title_meta, false);

		update_option('show_on_front', 'page');
		update_option('page_on_front', $homepage_id);
		update_option('page_for_posts', 0);
	}

	if (!empty($page_ids['privacy'])) {
		update_option('wp_page_for_privacy_policy', (int) $page_ids['privacy']);
	}

	return $page_ids;
}

/**
 * Remove all items from a nav menu.
 */
function fs_install_reset_menu(int $menu_id): void
{
	$items = wp_get_nav_menu_items($menu_id);
	if (!is_array($items)) {
		return;
	}

	foreach ($items as $item) {
		if (!empty($item->ID)) {
			wp_delete_post((int) $item->ID, true);
		}
	}
}

/**
 * Build main and footer menus from page IDs.
 *
 * @param array<string, int> $page_ids Keys from fs_install_create_pages().
 */
function fs_install_assign_menus(array $page_ids): void
{
	$menu_plan = [
		[
			'key'     => 'homepage',
			'menu'    => 'main_menu',
			'options' => [],
		],
		[
			'key'     => 'blocks',
			'menu'    => 'main_menu',
			'options' => [],
		],
		[
			'key'     => 'contact',
			'menu'    => 'main_menu',
			'options' => ['highlight' => true],
		],
		[
			'key'     => 'imprint',
			'menu'    => 'footer_menu',
			'options' => [],
		],
		[
			'key'     => 'privacy',
			'menu'    => 'footer_menu',
			'options' => [],
		],
	];

	$reset_menus = [];

	foreach ($menu_plan as $item) {
		$key = $item['key'];
		if (empty($page_ids[$key])) {
			continue;
		}

		$menu_id = fs_get_or_create_menu_id($item['menu']);
		if (!$menu_id) {
			continue;
		}

		if (!isset($reset_menus[$menu_id])) {
			fs_install_reset_menu($menu_id);
			$reset_menus[$menu_id] = true;
		}

		$item_id = wp_update_nav_menu_item($menu_id, 0, [
			'menu-item-object-id' => (int) $page_ids[$key],
			'menu-item-object'    => 'page',
			'menu-item-type'      => 'post_type',
			'menu-item-status'    => 'publish',
		]);

		if (!$item_id || is_wp_error($item_id)) {
			continue;
		}

		if (!empty($item['options']) && is_array($item['options']) && function_exists('fs_menu_item_option_meta_key')) {
			foreach ($item['options'] as $option_id => $enabled) {
				if (!$enabled || !is_string($option_id) || $option_id === '') {
					continue;
				}
				update_post_meta((int) $item_id, fs_menu_item_option_meta_key($option_id), '1');
			}
		}
	}
}

/**
 * Seed standard pages, reading options, and menus during install.
 *
 * @return array<string, int> Page IDs keyed by manifest key.
 */
function fs_install_seed_content(): array
{
	fs_install_cleanup_default_content();
	fs_install_delete_default_wp_pages();

	$media = fs_install_import_media();
	$page_ids = fs_install_create_pages($media);
	fs_install_assign_menus($page_ids);

	return $page_ids;
}
