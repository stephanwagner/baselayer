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
 * Find the default Sample Page WordPress creates on install (kept for the main menu).
 */
function fs_install_find_sample_page(): int
{
	foreach (['sample-page', 'beispiel-seite'] as $slug) {
		$page = get_page_by_path($slug, OBJECT, 'page');
		if ($page instanceof WP_Post) {
			return (int) $page->ID;
		}
	}

	return 0;
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
			'key'     => 'sample',
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

	$sample_id = fs_install_find_sample_page();
	if ($sample_id > 0) {
		$page_ids['sample'] = $sample_id;
	}

	fs_install_assign_menus($page_ids);

	return $page_ids;
}

/**
 * Content-type install flags from the installer form.
 *
 * @return array{post: bool, example: bool, event: bool, post_examples: bool, example_examples: bool, event_examples: bool}
 */
function fs_install_content_flags_from_request(): array
{
	$content = isset($_POST['install']['content']) && is_array($_POST['install']['content'])
		? $_POST['install']['content']
		: [];

	$post = !empty($content['post']);
	$example = !empty($content['example']);
	$event = !empty($content['event']);

	return [
		'post'             => $post,
		'example'          => $example,
		'event'            => $event,
		'post_examples'    => $post && !empty($content['post_examples']),
		'example_examples' => $example && !empty($content['example_examples']),
		'event_examples'   => $event && !empty($content['event_examples']),
	];
}

/**
 * Map CPT / post slug → content-types filename.
 *
 * @return array<string, string>
 */
function fs_install_content_type_file_map(): array
{
	return [
		'post'    => 'post.php',
		'example' => 'project.php',
		'event'   => 'event.php',
	];
}

/**
 * Set `enabled` in content-type PHP files under $dir.
 *
 * @param array<string, bool> $enabled_by_slug Keys: post, example, event.
 */
function fs_install_apply_content_type_enabled(string $dir, array $enabled_by_slug): void
{
	$dir = trailingslashit($dir);
	$map = fs_install_content_type_file_map();

	foreach ($map as $slug => $filename) {
		$path = $dir . $filename;
		if (!is_readable($path) || !is_writable($path)) {
			continue;
		}

		$enabled = !empty($enabled_by_slug[$slug]);
		$raw = file_get_contents($path);
		if ($raw === false || $raw === '') {
			continue;
		}

		$updated = preg_replace(
			"/('enabled'\\s*=>\\s*)(true|false)/",
			'${1}' . ($enabled ? 'true' : 'false'),
			$raw,
			1
		);

		if (!is_string($updated) || $updated === '') {
			continue;
		}

		file_put_contents($path, $updated);
	}
}

/**
 * Sample title/body list for demo posts.
 *
 * @return list<array{title: string, content: string, excerpt: string}>
 */
function fs_install_sample_texts(): array
{
	$path = __DIR__ . '/install-sample-texts.php';
	if (!is_readable($path)) {
		return [];
	}

	$items = require $path;

	return is_array($items) ? array_values($items) : [];
}

/**
 * Block editor markup for a sample post body.
 */
function fs_install_sample_post_content(string $content): string
{
	$paragraphs = preg_split("/\n\n+/", trim($content)) ?: [];
	$blocks = [];

	foreach ($paragraphs as $paragraph) {
		$paragraph = trim($paragraph);
		if ($paragraph === '') {
			continue;
		}
		$text = esc_html($paragraph);
		$blocks[] = "<!-- wp:paragraph -->\n<p>{$text}</p>\n<!-- /wp:paragraph -->";
	}

	return implode("\n\n", $blocks);
}

/**
 * Event date pairs for the six sample events (Y-m-d, optional H:i times).
 *
 * @return list<array{start: string, end: string, start_time?: string, end_time?: string}>
 */
function fs_install_sample_event_dates(): array
{
	$today = new DateTimeImmutable('today', wp_timezone());

	return [
		// Fully past.
		[
			'start' => $today->modify('-10 days')->format('Y-m-d'),
			'end'   => $today->modify('-3 days')->format('Y-m-d'),
		],
		// Started yesterday, ends in a few days.
		[
			'start' => $today->modify('-1 day')->format('Y-m-d'),
			'end'   => $today->modify('+5 days')->format('Y-m-d'),
		],
		// Near future (same day with times).
		[
			'start'      => $today->modify('+3 days')->format('Y-m-d'),
			'end'        => $today->modify('+3 days')->format('Y-m-d'),
			'start_time' => '09:30',
			'end_time'   => '12:00',
		],
		// A couple of weeks out (multi-day with times).
		[
			'start'      => $today->modify('+14 days')->format('Y-m-d'),
			'end'        => $today->modify('+15 days')->format('Y-m-d'),
			'start_time' => '14:00',
			'end_time'   => '17:30',
		],
		// About a month out.
		[
			'start' => $today->modify('+30 days')->format('Y-m-d'),
			'end'   => $today->modify('+32 days')->format('Y-m-d'),
		],
		// Far future (~3 months).
		[
			'start' => $today->modify('+90 days')->format('Y-m-d'),
			'end'   => $today->modify('+90 days')->format('Y-m-d'),
		],
	];
}

/**
 * Whether a sample post for this type/index already exists.
 */
function fs_install_sample_post_exists(string $post_type, int $index): bool
{
	$q = new WP_Query([
		'post_type'      => $post_type,
		'post_status'    => 'any',
		'posts_per_page' => 1,
		'fields'         => 'ids',
		'meta_query'     => [
			[
				'key'   => '_fs_install_sample',
				'value' => $post_type . ':' . $index,
			],
		],
		'no_found_rows'  => true,
	]);

	return $q->have_posts();
}

/**
 * Create up to six sample items for an enabled content type.
 *
 * @param array<string, array{id: int, url: string}> $media
 * @return list<int> Created post IDs.
 */
function fs_install_seed_samples_for_type(string $post_type, array $media): array
{
	if ($post_type === '' || ($post_type !== 'post' && !post_type_exists($post_type))) {
		return [];
	}

	$texts = fs_install_sample_texts();
	if ($texts === []) {
		return [];
	}

	$image_keys = [
		'sample-image-1',
		'sample-image-2',
		'sample-image-3',
		'sample-image-4',
		'sample-image-5',
	];
	$event_dates = $post_type === 'event' ? fs_install_sample_event_dates() : [];
	$created = [];

	foreach ($texts as $index => $item) {
		if (!is_array($item) || fs_install_sample_post_exists($post_type, $index)) {
			continue;
		}

		$title = isset($item['title']) && is_string($item['title']) ? $item['title'] : '';
		$body = isset($item['content']) && is_string($item['content']) ? $item['content'] : '';
		$excerpt = isset($item['excerpt']) && is_string($item['excerpt']) ? $item['excerpt'] : '';
		if ($title === '') {
			continue;
		}

		$post_id = wp_insert_post([
			'post_type'    => $post_type,
			'post_status'  => 'publish',
			'post_title'   => $title,
			'post_content' => fs_install_sample_post_content($body),
			'post_excerpt' => $excerpt,
		], true);

		if (is_wp_error($post_id) || $post_id <= 0) {
			continue;
		}

		update_post_meta((int) $post_id, '_fs_install_sample', $post_type . ':' . $index);

		if (isset($image_keys[$index], $media[$image_keys[$index]]['id'])) {
			set_post_thumbnail((int) $post_id, (int) $media[$image_keys[$index]]['id']);
		}

		if ($post_type === 'event' && isset($event_dates[$index])) {
			$schedule = $event_dates[$index];
			update_post_meta((int) $post_id, FS_EVENT_META_START_DATE, $schedule['start']);
			update_post_meta((int) $post_id, FS_EVENT_META_END_DATE, $schedule['end']);
			if (!empty($schedule['start_time'])) {
				update_post_meta((int) $post_id, FS_EVENT_META_START_TIME, $schedule['start_time']);
			}
			if (!empty($schedule['end_time'])) {
				update_post_meta((int) $post_id, FS_EVENT_META_END_TIME, $schedule['end_time']);
			}
			if (function_exists('fs_event_save_timestamps')) {
				fs_event_save_timestamps((int) $post_id);
			}
		}

		$created[] = (int) $post_id;
	}

	return $created;
}

/**
 * Seed example posts / CPT items based on installer Content checkboxes.
 *
 * @param array{post?: bool, example?: bool, event?: bool, post_examples?: bool, example_examples?: bool, event_examples?: bool} $flags
 * @return array<string, list<int>>
 */
function fs_install_seed_content_type_examples(array $flags): array
{
	$media = fs_install_import_media();
	$result = [];

	$map = [
		'post'    => !empty($flags['post']) && !empty($flags['post_examples']),
		'example' => !empty($flags['example']) && !empty($flags['example_examples']),
		'event'   => !empty($flags['event']) && !empty($flags['event_examples']),
	];

	foreach ($map as $post_type => $should_seed) {
		if (!$should_seed) {
			continue;
		}
		$result[$post_type] = fs_install_seed_samples_for_type($post_type, $media);
	}

	return $result;
}
