<?php

defined('ABSPATH') || exit;

const BL_INSTALL_MEDIA_META_KEY = '_bl_install_media_key';

/**
 * Site locale key for install page titles/slugs (from WordPress site language).
 *
 * @return 'en'|'de'
 */
function bl_install_site_locale_key(): string
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
function bl_install_page_definitions(): array
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
function bl_install_page_manifest(): array
{
	$locale_key = bl_install_site_locale_key();
	$definitions = bl_install_page_definitions();
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
function bl_install_cleanup_default_content(): void
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
function bl_install_delete_default_wp_pages(): void
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
function bl_install_find_sample_page(): int
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
 * Array keys double as tokens for pages/*.html:
 * {{media:KEY:url}} (attachment URL) and {{media:KEY:id}} (attachment ID),
 * replaced on install by bl_install_replace_page_placeholders().
 * 
 * {{media:sample-image-1:id}}
 * {{media:sample-image-1:url}}
 *
 * The `caption` is stored as the attachment caption (post_excerpt), which shows
 * as the image undertitle in galleries and captioned image blocks.
 * The `description` is stored as the attachment description (post_content), e.g. credit.
 *
 * @return array<string, array{file: string, title: string, caption: string, description?: string}>
 */
function bl_install_media_manifest(): array
{
	$base = __DIR__ . '/media';

	return [
		'sample-image-1' => [
			'file'    => $base . '/sample-image-1.webp',
			'title'   => 'Morning Mist',
			'caption' => 'Foggy peaks in the early morning light',
			'description' => 'By Sam Ferrara (@samferrara) on Unsplash',
		],
		'sample-image-2' => [
			'file'    => $base . '/sample-image-2.webp',
			'title'   => 'Open Horizon',
			'caption' => 'Mountain scenery framed by green trees',
			'description' => 'By Kalen Emsley (@kalenemsley) on Unsplash',
		],
		'sample-image-3' => [
			'file'    => $base . '/sample-image-3.webp',
			'title'   => 'Quiet Scenery',
			'caption' => 'A calm lake bathed in autumn sunlight',
			'description' => 'By Kuno Schweizer (@kunosch) on Unsplash',
		],
		'sample-image-4' => [
			'file'    => $base . '/sample-image-4.webp',
			'title'   => 'Wide Vista',
			'caption' => 'Lake at the foot of a small mountain range',
			'description' => 'By Andreas Sjövall (@andreassjovall) on Unsplash',
		],
		'sample-image-5' => [
			'file'    => $base . '/sample-image-5.webp',
			'title'   => 'Verdant Dusk',
			'caption' => 'Rolling green hills catching the last of the sunset',
			'description' => 'By v2osk (@v2osk) on Unsplash',
		],
		'sample-image-6' => [
			'file'    => $base . '/sample-image-6.webp',
			'title'   => 'Sunlit Landscape',
			'caption' => 'Evening glow across the hills',
			'description' => 'By Dawid Zawiła (@davealmine) on Unsplash',
		],
		'sample-image-7' => [
			'file'    => $base . '/sample-image-7.webp',
			'title'   => 'Evening Range',
			'caption' => 'A mountain range in the evening',
			'description' => 'By Fabrizio Lunardi (@methariorn) on Unsplash',
		],
		'sample-image-8' => [
			'file'    => $base . '/sample-image-8.webp',
			'title'   => 'Autumn Forest',
			'caption' => 'Last light on the peaks above the forest',
			'description' => 'By eberhard grossgasteiger (@eberhardgross) on pexels',
		],
		'sample-video-1' => [
			'file'    => $base . '/sample-video-1.mp4',
			'title'   => 'Snowy Hills',
			'caption' => 'Slow camera move across snowy hills',
			'description' => 'By Julien Goettelmann (@julien-goettelmann-44396125) on pexels',
		],
		'sample-video-2' => [
			'file'    => $base . '/sample-video-2.mp4',
			'title'   => 'Cloud Timelapse',
			'caption' => 'Timelapse of a mountain view with moving clouds',
			'description' => 'By Alex Moliski (@alexmoliski) on pexels',
		],
	];
}

/**
 * Find an existing install media attachment by stable key.
 */
function bl_install_find_media_by_key(string $key): int
{
	if ($key === '') {
		return 0;
	}

	$posts = get_posts([
		'post_type'      => 'attachment',
		'post_status'    => 'inherit',
		'posts_per_page' => 1,
		'fields'         => 'ids',
		'meta_key'       => BL_INSTALL_MEDIA_META_KEY,
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
 * @param array{file: string, title: string, caption: string, description?: string} $item
 */
function bl_install_import_media_file(string $key, array $item): int
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
	$description = isset($item['description']) && is_string($item['description'])
		? $item['description']
		: '';

	$attachment_id = wp_insert_attachment([
		'post_mime_type' => $filetype['type'] ?? '',
		'post_title'     => $item['title'],
		'post_excerpt'   => $item['caption'],
		'post_content'   => $description,
		'post_status'    => 'inherit',
	], $destination);

	if (is_wp_error($attachment_id) || $attachment_id <= 0) {
		return 0;
	}

	update_post_meta($attachment_id, BL_INSTALL_MEDIA_META_KEY, $key);

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
function bl_install_import_media(): array
{
	$media = [];

	foreach (bl_install_media_manifest() as $key => $item) {
		$attachment_id = bl_install_find_media_by_key($key);
		if ($attachment_id <= 0) {
			$attachment_id = bl_install_import_media_file($key, $item);
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
function bl_install_page_content(string $title): string
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
 * Path to exported block HTML for an install page key (e.g. homepage → pages/homepage.html).
 */
function bl_install_page_html_path(string $page_key): string
{
	return __DIR__ . '/pages/' . $page_key . '.html';
}

/**
 * Replace dynamic placeholders in install page HTML.
 *
 * @param array<string, array{title: string, slug: string}> $manifest
 * @param array<string, array{id: int, url: string}>       $media
 */
function bl_install_replace_page_placeholders(string $html, array $manifest, array $media = []): string
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
 * Load block editor markup from pages/{key}.html when present.
 *
 * @param array<string, array{title: string, slug: string}> $manifest Full locale manifest.
 * @param array<string, array{id: int, url: string}>       $media    Imported install media.
 */
function bl_install_page_html_content(string $page_key, array $manifest, array $media = []): ?string
{
	$path = bl_install_page_html_path($page_key);
	if (!is_readable($path)) {
		return null;
	}

	$html = file_get_contents($path);
	if (!is_string($html) || trim($html) === '') {
		return null;
	}

	return bl_install_replace_page_placeholders($html, $manifest, $media);
}

/**
 * Block editor markup for install pages (HTML file or placeholder).
 *
 * @param array<string, array{title: string, slug: string}> $manifest Full locale manifest.
 * @param array<string, array{id: int, url: string}>       $media    Imported install media.
 */
function bl_install_page_post_content(string $page_key, array $manifest, array $media = []): string
{
	$html = bl_install_page_html_content($page_key, $manifest, $media);
	if ($html !== null) {
		return $html;
	}

	$title = $manifest[$page_key]['title'] ?? $page_key;

	return bl_install_page_content($title);
}

/**
 * Create manifest pages for the site locale.
 *
 * @param array<string, array{id: int, url: string}> $media Imported install media.
 *
 * @return array<string, int> Page keys mapped to post IDs.
 */
function bl_install_create_pages(array $media = []): array
{
	$manifest = bl_install_page_manifest();
	$page_ids = [];

	foreach ($manifest as $key => $def) {
		$post_id = wp_insert_post([
			'post_type'    => 'page',
			'post_status'  => 'publish',
			'post_title'   => $def['title'],
			'post_name'    => $def['slug'],
			'post_content' => bl_install_page_post_content($key, $manifest, $media),
		], true);

		if (is_wp_error($post_id) || !$post_id) {
			continue;
		}

		$page_ids[$key] = (int) $post_id;
	}

	if (!empty($page_ids['homepage'])) {
		$homepage_id = (int) $page_ids['homepage'];
		$title_meta = defined('BL_SHOW_PAGE_TITLE_META') ? BL_SHOW_PAGE_TITLE_META : '_bl_show_page_title';
		update_post_meta($homepage_id, $title_meta, false);

		update_option('show_on_front', 'page');
		update_option('page_on_front', $homepage_id);
		update_option('page_for_posts', 0);
	}

	update_option('posts_per_page', 20);

	if (!empty($page_ids['privacy'])) {
		update_option('wp_page_for_privacy_policy', (int) $page_ids['privacy']);
	}

	return $page_ids;
}

/**
 * Remove all items from a nav menu.
 */
function bl_install_reset_menu(int $menu_id): void
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
 * Apply menu item options (e.g. highlight) to a nav menu item.
 *
 * @param array<string, bool> $options
 */
function bl_install_apply_menu_item_options(int $item_id, array $options): void
{
	if ($item_id <= 0 || $options === [] || !function_exists('bl_menu_item_option_meta_key')) {
		return;
	}

	foreach ($options as $option_id => $enabled) {
		if (!$enabled || !is_string($option_id) || $option_id === '') {
			continue;
		}
		update_post_meta($item_id, bl_menu_item_option_meta_key($option_id), '1');
	}
}

/**
 * Add a page link to a nav menu.
 *
 * @param array<string, bool> $options
 */
function bl_install_add_menu_page_item(int $menu_id, int $page_id, array $options = []): void
{
	if ($menu_id <= 0 || $page_id <= 0) {
		return;
	}

	$item_id = wp_update_nav_menu_item($menu_id, 0, [
		'menu-item-object-id' => $page_id,
		'menu-item-object'    => 'page',
		'menu-item-type'      => 'post_type',
		'menu-item-status'    => 'publish',
	]);

	if (!$item_id || is_wp_error($item_id)) {
		return;
	}

	bl_install_apply_menu_item_options((int) $item_id, $options);
}

/**
 * Default archive URL slugs when config is unavailable mid-install.
 *
 * @return array<string, string>
 */
function bl_install_archive_slug_defaults(): array
{
	return [
		'post'     => 'blog',
		'projects' => 'projects',
		'event'    => 'events',
	];
}

/**
 * Resolve an archive URL for install menus (config-first, works before CPT objects settle).
 *
 * @param bool $trusted When true (installer checkbox enabled), never skip for config lag; use defaults.
 */
function bl_install_archive_url(string $post_type, bool $trusted = false): string
{
	if ($post_type === '') {
		return '';
	}

	$defaults = bl_install_archive_slug_defaults();
	$enabled = function_exists('bl_content_type_enabled') && bl_content_type_enabled($post_type);

	if (!$trusted && !$enabled) {
		return '';
	}

	$slug = '';

	// Prefer live post archive helper when it already resolves.
	if ($post_type === 'post' && function_exists('bl_post_archive_slug')) {
		$slug = bl_post_archive_slug();
	}

	if ($slug === '' && function_exists('bl_content_type_archive')) {
		$archive = bl_content_type_archive($post_type);
		if (isset($archive['slug']) && is_string($archive['slug']) && $archive['slug'] !== '') {
			$slug = sanitize_title($archive['slug']);
		}
	}

	if ($slug === '' && isset($defaults[$post_type])) {
		$slug = $defaults[$post_type];
	}

	if ($slug === '') {
		$slug = sanitize_title($post_type);
	}

	if ($slug === '') {
		return '';
	}

	// Prefer get_post_type_archive_link when the type is registered.
	$link = get_post_type_archive_link($post_type);
	if (is_string($link) && $link !== '') {
		// For built-in posts, core may return home; only keep it when it matches our archive slug.
		if ($post_type !== 'post') {
			return $link;
		}
		$path = (string) (wp_parse_url($link, PHP_URL_PATH) ?? '');
		if ($path !== '' && trim($path, '/') === $slug) {
			return $link;
		}
	}

	return home_url(user_trailingslashit($slug, 'post_type_archive'));
}

/**
 * Resolve archive menu title for install.
 */
function bl_install_archive_title(string $post_type): string
{
	$title = function_exists('bl_cpt_archive_menu_label')
		? bl_cpt_archive_menu_label($post_type)
		: '';
	if ($title !== '') {
		return $title;
	}

	if (function_exists('bl_content_type_archive')) {
		$archive = bl_content_type_archive($post_type);
		$texts = isset($archive['texts']) && is_array($archive['texts']) ? $archive['texts'] : [];
		if (isset($texts['heading']) && is_string($texts['heading']) && $texts['heading'] !== '') {
			return $texts['heading'];
		}
	}

	$obj = get_post_type_object($post_type);
	if ($obj instanceof \WP_Post_Type && isset($obj->labels->name) && is_string($obj->labels->name) && $obj->labels->name !== '') {
		return $obj->labels->name;
	}

	$fallback = [
		'post'     => 'Blog',
		'projects' => 'Projects',
		'event'    => 'Events',
	];

	return $fallback[$post_type] ?? ucfirst($post_type);
}

/**
 * Add a post type archive link to a nav menu.
 *
 * Uses a custom link: built-in `post` is unreliable as `post_type_archive`.
 *
 * @param bool $trusted Installer enabled this type; use defaults if config lags.
 */
function bl_install_add_menu_archive_item(int $menu_id, string $post_type, bool $trusted = false): void
{
	if ($menu_id <= 0 || $post_type === '') {
		return;
	}

	$url = bl_install_archive_url($post_type, $trusted);
	if ($url === '') {
		return;
	}

	$title = bl_install_archive_title($post_type);

	$item_id = wp_update_nav_menu_item($menu_id, 0, [
		'menu-item-type'   => 'custom',
		'menu-item-title'  => $title,
		'menu-item-url'    => $url,
		'menu-item-status' => 'publish',
	]);

	if (!$item_id || is_wp_error($item_id)) {
		return;
	}
}

/**
 * Build main and footer menus from page IDs and enabled content types.
 *
 * When any of Blog / Projects / Events are enabled, homepage and sample page
 * are omitted from the main menu and replaced with archive links.
 *
 * @param array<string, int> $page_ids Keys from bl_install_create_pages().
 * @param array{post?: bool, projects?: bool, event?: bool} $content_flags
 */
function bl_install_assign_menus(array $page_ids, array $content_flags = []): void
{
	$archive_types = [];
	foreach (['post', 'projects', 'event'] as $post_type) {
		if (!empty($content_flags[$post_type])) {
			$archive_types[] = $post_type;
		}
	}

	$use_archives = $archive_types !== [];

	$main_menu_id = bl_get_or_create_menu_id('main_menu');
	$footer_menu_id = bl_get_or_create_menu_id('footer_menu');

	if ($main_menu_id) {
		bl_install_reset_menu($main_menu_id);

		if ($use_archives) {
			foreach ($archive_types as $post_type) {
				bl_install_add_menu_archive_item($main_menu_id, $post_type, true);
			}
		} else {
			if (!empty($page_ids['homepage'])) {
				bl_install_add_menu_page_item($main_menu_id, (int) $page_ids['homepage']);
			}
			if (!empty($page_ids['sample'])) {
				bl_install_add_menu_page_item($main_menu_id, (int) $page_ids['sample']);
			}
		}

		if (!empty($page_ids['blocks'])) {
			bl_install_add_menu_page_item($main_menu_id, (int) $page_ids['blocks']);
		}
		if (!empty($page_ids['contact'])) {
			bl_install_add_menu_page_item($main_menu_id, (int) $page_ids['contact'], ['highlight' => true]);
		}
	}

	if ($footer_menu_id) {
		bl_install_reset_menu($footer_menu_id);

		if (!empty($page_ids['imprint'])) {
			bl_install_add_menu_page_item($footer_menu_id, (int) $page_ids['imprint']);
		}
		if (!empty($page_ids['privacy'])) {
			bl_install_add_menu_page_item($footer_menu_id, (int) $page_ids['privacy']);
		}
	}
}

/**
 * Seed standard pages and reading options during install.
 * Menus are assigned later via {@see bl_install_assign_menus()} after CPTs are registered.
 *
 * @return array<string, int> Page IDs keyed by manifest key.
 */
function bl_install_seed_content(): array
{
	bl_install_cleanup_default_content();
	bl_install_delete_default_wp_pages();

	$media = bl_install_import_media();
	$page_ids = bl_install_create_pages($media);

	$sample_id = bl_install_find_sample_page();
	if ($sample_id > 0) {
		$page_ids['sample'] = $sample_id;
	}

	return $page_ids;
}

/**
 * Content-type install flags from the installer form.
 *
 * @return array{seed_mode: string, post: bool, projects: bool, event: bool, post_examples: bool, projects_examples: bool, event_examples: bool}
 */
function bl_install_content_flags_from_request(): array
{
	$content = isset($_POST['install']['content']) && is_array($_POST['install']['content'])
		? $_POST['install']['content']
		: [];

	$seed_mode = (($content['seed_mode'] ?? '') === 'test') ? 'test' : 'sample';

	if ($seed_mode === 'test') {
		return [
			'seed_mode'         => 'test',
			'post'              => true,
			'projects'          => true,
			'event'             => true,
			'post_examples'     => true,
			'projects_examples' => true,
			'event_examples'    => true,
		];
	}

	$post = !empty($content['post']);
	$projects = !empty($content['projects']);
	$event = !empty($content['event']);

	return [
		'seed_mode'         => 'sample',
		'post'              => $post,
		'projects'          => $projects,
		'event'             => $event,
		'post_examples'     => $post && !empty($content['post_examples']),
		'projects_examples' => $projects && !empty($content['projects_examples']),
		'event_examples'    => $event && !empty($content['event_examples']),
	];
}

/**
 * Map CPT / post slug → content-types filename.
 *
 * @return array<string, string>
 */
function bl_install_content_type_file_map(): array
{
	return [
		'post'     => 'post.php',
		'projects' => 'project.php',
		'event'    => 'event.php',
	];
}

/**
 * Absolute path to a theme’s config/content-types directory.
 */
function bl_install_content_types_dir_for_theme(string $theme_slug = ''): string
{
	if ($theme_slug === '') {
		$theme_slug = get_stylesheet();
	}

	$root = function_exists('get_theme_root')
		? trailingslashit((string) get_theme_root($theme_slug))
		: trailingslashit(WP_CONTENT_DIR) . 'themes/';

	return $root . $theme_slug . '/config/content-types';
}

/**
 * Reset content-type cache and register CPTs / taxonomies / event hooks for this request.
 * Safe to call after switch_theme() during install.
 */
function bl_install_bootstrap_content_types(): void
{
	if (function_exists('bl_reset_content_types_cache')) {
		bl_reset_content_types_cache();
	}
	if (function_exists('bl_register_cpts')) {
		bl_register_cpts();
	}
	if (function_exists('bl_register_cpt_taxonomies')) {
		bl_register_cpt_taxonomies();
	}
	if (function_exists('bl_event_register_post_type_hooks')) {
		bl_event_register_post_type_hooks();
	}
	if (function_exists('bl_post_apply_labels_from_config')) {
		bl_post_apply_labels_from_config();
	}
	if (function_exists('bl_post_archive_register_rewrites')) {
		bl_post_archive_register_rewrites();
	}

	if (function_exists('bl_post_archive_slug')) {
		$post_archive_slug = bl_post_archive_slug();
		$post_type_obj = get_post_type_object('post');
		if ($post_archive_slug !== '' && $post_type_obj instanceof \WP_Post_Type) {
			$post_type_obj->has_archive = $post_archive_slug;
		}
	}
}

/**
 * Set `enabled` in content-type PHP files under $dir.
 *
 * @param array<string, bool> $enabled_by_slug Keys: post, projects, event.
 */
function bl_install_apply_content_type_enabled(string $dir, array $enabled_by_slug): void
{
	$dir = trailingslashit($dir);
	$map = bl_install_content_type_file_map();

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

		if (function_exists('opcache_invalidate')) {
			opcache_invalidate($path, true);
		}
	}
}

/**
 * Sample title/block list for demo posts.
 *
 * @return list<array{title: string, excerpt?: string, blocks?: list<array<string, mixed>>, content?: string}>
 */
function bl_install_sample_texts(): array
{
	$path = __DIR__ . '/sample-texts.php';
	if (!is_readable($path)) {
		return [];
	}

	$items = require $path;

	return is_array($items) ? array_values($items) : [];
}

/**
 * Render typed sample blocks to block editor markup.
 *
 * Supported types: paragraph. Add more cases as sample-texts.php grows.
 *
 * @param list<array{type?: string, content?: string}> $blocks
 */
function bl_install_render_sample_blocks(array $blocks): string
{
	$out = [];

	foreach ($blocks as $block) {
		if (!is_array($block)) {
			continue;
		}

		$type = isset($block['type']) && is_string($block['type']) ? $block['type'] : '';
		$content = isset($block['content']) && is_string($block['content']) ? trim($block['content']) : '';

		if ($type === 'paragraph') {
			if ($content === '') {
				continue;
			}
			$text = esc_html($content);
			$out[] = "<!-- wp:paragraph -->\n<p>{$text}</p>\n<!-- /wp:paragraph -->";
			continue;
		}
	}

	return implode("\n\n", $out);
}

/**
 * Block editor markup for a sample/testdata item.
 *
 * Prefers typed `blocks`; falls back to plain `content` (blank-line paragraphs).
 *
 * @param array{blocks?: list<array<string, mixed>>, content?: string} $item
 */
function bl_install_sample_item_content(array $item): string
{
	if (isset($item['blocks']) && is_array($item['blocks'])) {
		return bl_install_render_sample_blocks($item['blocks']);
	}

	$body = isset($item['content']) && is_string($item['content']) ? $item['content'] : '';

	return bl_install_sample_post_content($body);
}

/**
 * Block editor markup from plain text (blank-line separated paragraphs).
 */
function bl_install_sample_post_content(string $content): string
{
	$paragraphs = preg_split("/\n\n+/", trim($content)) ?: [];
	$blocks = [];

	foreach ($paragraphs as $paragraph) {
		$paragraph = trim($paragraph);
		if ($paragraph === '') {
			continue;
		}
		$blocks[] = [
			'type'    => 'paragraph',
			'content' => $paragraph,
		];
	}

	return bl_install_render_sample_blocks($blocks);
}

/**
 * Event date pairs for sample events (Y-m-d, optional H:i times).
 * Keep in sync with sample-texts.php item count.
 *
 * @return list<array{start: string, end: string, start_time?: string, end_time?: string}>
 */
function bl_install_sample_event_dates(): array
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
		// Mid-range future (all day).
		[
			'start' => $today->modify('+45 days')->format('Y-m-d'),
			'end'   => $today->modify('+45 days')->format('Y-m-d'),
		],
		// Evening session ~2 months out.
		[
			'start'      => $today->modify('+60 days')->format('Y-m-d'),
			'end'        => $today->modify('+60 days')->format('Y-m-d'),
			'start_time' => '18:00',
			'end_time'   => '20:30',
		],
		// Past weekend workshop.
		[
			'start'      => $today->modify('-21 days')->format('Y-m-d'),
			'end'        => $today->modify('-20 days')->format('Y-m-d'),
			'start_time' => '10:00',
			'end_time'   => '16:00',
		],
		// Far future multi-day.
		[
			'start' => $today->modify('+120 days')->format('Y-m-d'),
			'end'   => $today->modify('+122 days')->format('Y-m-d'),
		],
	];
}

/**
 * Whether a sample post for this type/index already exists.
 */
function bl_install_sample_post_exists(string $post_type, int $index): bool
{
	$q = new WP_Query([
		'post_type'      => $post_type,
		'post_status'    => 'any',
		'posts_per_page' => 1,
		'fields'         => 'ids',
		'meta_query'     => [
			[
				'key'   => '_bl_install_sample',
				'value' => $post_type . ':' . $index,
			],
		],
		'no_found_rows'  => true,
	]);

	return $q->have_posts();
}

/**
 * Create sample items for an enabled content type (one per sample-texts.php entry).
 *
 * @param array<string, array{id: int, url: string}> $media
 * @return list<int> Created post IDs.
 */
function bl_install_seed_samples_for_type(string $post_type, array $media): array
{
	if ($post_type === '' || ($post_type !== 'post' && !post_type_exists($post_type))) {
		return [];
	}

	$texts = bl_install_sample_texts();
	if ($texts === []) {
		return [];
	}

	$image_keys = [
		'sample-image-1',
		'sample-image-2',
		'sample-image-3',
		'sample-image-4',
		'sample-image-5',
		'sample-image-1',
		'sample-image-2',
		'sample-image-3',
		'sample-image-4',
		'sample-image-5',
	];
	$event_dates = $post_type === 'event' ? bl_install_sample_event_dates() : [];
	$created = [];

	foreach ($texts as $index => $item) {
		if (!is_array($item) || bl_install_sample_post_exists($post_type, $index)) {
			continue;
		}

		$title = isset($item['title']) && is_string($item['title']) ? $item['title'] : '';
		$excerpt = isset($item['excerpt']) && is_string($item['excerpt']) ? $item['excerpt'] : '';
		if ($title === '') {
			continue;
		}

		$post_id = wp_insert_post([
			'post_type'    => $post_type,
			'post_status'  => 'publish',
			'post_title'   => $title,
			'post_content' => bl_install_sample_item_content($item),
			'post_excerpt' => $excerpt,
		], true);

		if (is_wp_error($post_id) || $post_id <= 0) {
			continue;
		}

		update_post_meta((int) $post_id, '_bl_install_sample', $post_type . ':' . $index);

		if (isset($image_keys[$index], $media[$image_keys[$index]]['id'])) {
			set_post_thumbnail((int) $post_id, (int) $media[$image_keys[$index]]['id']);
		}

		if ($post_type === 'event' && isset($event_dates[$index])) {
			$schedule = $event_dates[$index];
			update_post_meta((int) $post_id, BL_EVENT_META_START_DATE, $schedule['start']);
			update_post_meta((int) $post_id, BL_EVENT_META_END_DATE, $schedule['end']);
			if (!empty($schedule['start_time'])) {
				update_post_meta((int) $post_id, BL_EVENT_META_START_TIME, $schedule['start_time']);
			}
			if (!empty($schedule['end_time'])) {
				update_post_meta((int) $post_id, BL_EVENT_META_END_TIME, $schedule['end_time']);
			}
			if (function_exists('bl_event_save_timestamps')) {
				bl_event_save_timestamps((int) $post_id);
			}
		}

		$created[] = (int) $post_id;
	}

	return $created;
}

/**
 * Seed example posts / CPT items based on installer Content checkboxes.
 *
 * @param array{post?: bool, projects?: bool, event?: bool, post_examples?: bool, projects_examples?: bool, event_examples?: bool} $flags
 * @return array<string, list<int>>
 */
function bl_install_seed_content_type_examples(array $flags): array
{
	$media = bl_install_import_media();
	$result = [];

	$map = [
		'post'     => !empty($flags['post']) && !empty($flags['post_examples']),
		'projects' => !empty($flags['projects']) && !empty($flags['projects_examples']),
		'event'    => !empty($flags['event']) && !empty($flags['event_examples']),
	];

	foreach ($map as $post_type => $should_seed) {
		if (!$should_seed) {
			continue;
		}
		$result[$post_type] = bl_install_seed_samples_for_type($post_type, $media);
	}

	return $result;
}

/**
 * Load installer testdata config.
 *
 * @return array{notice?: list<string>, posts?: list<array<string, mixed>>, projects?: list<array<string, mixed>>, events?: list<array<string, mixed>>}
 */
function bl_install_testdata_config(): array
{
	$path = __DIR__ . '/testdata.php';
	if (!is_readable($path)) {
		return [];
	}

	$data = include $path;
	return is_array($data) ? $data : [];
}

/**
 * Human-readable notice lines for the install Test data radio.
 *
 * @return list<string>
 */
function bl_install_testdata_notice_lines(): array
{
	$config = bl_install_testdata_config();
	$notice = $config['notice'] ?? [];
	if (!is_array($notice)) {
		return [];
	}

	$lines = [];
	foreach ($notice as $line) {
		if (is_string($line) && $line !== '') {
			$lines[] = $line;
		}
	}

	return $lines;
}

/**
 * Resolve a relative date offset (e.g. "+3 days") to Y-m-d in the site timezone.
 */
function bl_install_testdata_resolve_date(string $offset): string
{
	$tz = wp_timezone();
	$base = new DateTimeImmutable('today', $tz);
	$offset = trim($offset);
	if ($offset === '' || $offset === '0 days' || $offset === '+0 days') {
		return $base->format('Y-m-d');
	}

	$resolved = $base->modify($offset);
	if (!$resolved instanceof DateTimeImmutable) {
		return $base->format('Y-m-d');
	}

	return $resolved->format('Y-m-d');
}

/**
 * Whether a testdata item for this type/index was already seeded.
 */
function bl_install_testdata_item_exists(string $post_type, int $index): bool
{
	$q = new WP_Query([
		'post_type'      => $post_type,
		'post_status'    => 'any',
		'posts_per_page' => 1,
		'fields'         => 'ids',
		'meta_query'     => [
			[
				'key'   => '_bl_install_testdata',
				'value' => $post_type . ':' . $index,
			],
		],
		'no_found_rows'  => true,
	]);

	return $q->have_posts();
}

/**
 * Seed one generic post/project from testdata config.
 *
 * @param array<string, mixed> $item
 * @param array<string, array{id: int, url: string}> $media
 */
function bl_install_seed_testdata_post_item(string $post_type, int $index, array $item, array $media): int
{
	if (bl_install_testdata_item_exists($post_type, $index)) {
		return 0;
	}

	$title = isset($item['title']) && is_string($item['title']) ? $item['title'] : '';
	if ($title === '') {
		return 0;
	}

	$excerpt = isset($item['excerpt']) && is_string($item['excerpt']) ? $item['excerpt'] : '';
	$status = isset($item['post_status']) && is_string($item['post_status']) ? $item['post_status'] : 'publish';

	$post_id = wp_insert_post([
		'post_type'    => $post_type,
		'post_status'  => $status,
		'post_title'   => $title,
		'post_content' => bl_install_sample_item_content($item),
		'post_excerpt' => $excerpt,
	], true);

	if (is_wp_error($post_id) || $post_id <= 0) {
		return 0;
	}

	update_post_meta((int) $post_id, '_bl_install_testdata', $post_type . ':' . $index);

	$featured = $item['featured_image'] ?? false;
	if (is_string($featured) && $featured !== '' && isset($media[$featured]['id'])) {
		set_post_thumbnail((int) $post_id, (int) $media[$featured]['id']);
	}

	return (int) $post_id;
}

/**
 * Seed one event from testdata config.
 *
 * @param array<string, mixed> $item
 * @param array<string, array{id: int, url: string}> $media
 */
function bl_install_seed_testdata_event_item(int $index, array $item, array $media): int
{
	if (bl_install_testdata_item_exists('event', $index)) {
		return 0;
	}

	if (!post_type_exists('event')) {
		return 0;
	}

	$title = isset($item['title']) && is_string($item['title']) ? $item['title'] : '';
	if ($title === '') {
		return 0;
	}

	$excerpt = isset($item['excerpt']) && is_string($item['excerpt']) ? $item['excerpt'] : '';
	$start_offset = isset($item['start']) && is_string($item['start']) ? $item['start'] : '0 days';
	$end_offset = isset($item['end']) && is_string($item['end']) ? $item['end'] : $start_offset;
	$start_date = bl_install_testdata_resolve_date($start_offset);
	$end_date = bl_install_testdata_resolve_date($end_offset);

	$post_id = wp_insert_post([
		'post_type'    => 'event',
		'post_status'  => 'publish',
		'post_title'   => $title,
		'post_content' => bl_install_sample_item_content($item),
		'post_excerpt' => $excerpt,
	], true);

	if (is_wp_error($post_id) || $post_id <= 0) {
		return 0;
	}

	$post_id = (int) $post_id;
	update_post_meta($post_id, '_bl_install_testdata', 'event:' . $index);

	if (defined('BL_EVENT_META_START_DATE')) {
		update_post_meta($post_id, BL_EVENT_META_START_DATE, $start_date);
		update_post_meta($post_id, BL_EVENT_META_END_DATE, $end_date);
		if (!empty($item['start_time']) && is_string($item['start_time'])) {
			update_post_meta($post_id, BL_EVENT_META_START_TIME, $item['start_time']);
		}
		if (!empty($item['end_time']) && is_string($item['end_time'])) {
			update_post_meta($post_id, BL_EVENT_META_END_TIME, $item['end_time']);
		}
		if (function_exists('bl_event_recalculate_timestamps')) {
			bl_event_recalculate_timestamps($post_id);
		}
	}

	$featured = $item['featured_image'] ?? false;
	if (is_string($featured) && $featured !== '' && isset($media[$featured]['id'])) {
		set_post_thumbnail($post_id, (int) $media[$featured]['id']);
	}

	if (!empty($item['status']) && is_string($item['status']) && defined('BL_EVENT_META_STATUS')) {
		update_post_meta($post_id, BL_EVENT_META_STATUS, $item['status']);
	}

	if (!empty($item['recurrence']) && is_array($item['recurrence']) && defined('BL_EVENT_META_RECURRENCE')) {
		update_post_meta($post_id, BL_EVENT_META_RECURRENCE, wp_json_encode($item['recurrence']));
		if (function_exists('bl_event_sync_series')) {
			bl_event_sync_series($post_id);
		}
		if (!empty($item['soft_delete_occurrence']) && function_exists('bl_event_soft_delete_occurrence')) {
			$children = get_posts([
				'post_type'      => 'event',
				'post_parent'    => $post_id,
				'post_status'    => 'publish',
				'posts_per_page' => 1,
				'orderby'        => 'date',
				'order'          => 'ASC',
				'fields'         => 'ids',
			]);
			if (!empty($children[0])) {
				bl_event_soft_delete_occurrence((int) $children[0]);
			}
		}
	}

	if (!empty($item['trash'])) {
		wp_trash_post($post_id);
	}

	return $post_id;
}

/**
 * Seed bulk test data (posts, projects, events) from testdata.php.
 *
 * @param array{post?: bool, projects?: bool, event?: bool} $flags
 * @return array<string, list<int>>
 */
function bl_install_seed_testdata(array $flags): array
{
	$config = bl_install_testdata_config();
	if ($config === []) {
		return [];
	}

	$media = bl_install_import_media();
	$result = [];

	if (!empty($flags['post']) && !empty($config['posts']) && is_array($config['posts'])) {
		$ids = [];
		foreach (array_values($config['posts']) as $index => $item) {
			if (!is_array($item)) {
				continue;
			}
			$id = bl_install_seed_testdata_post_item('post', (int) $index, $item, $media);
			if ($id > 0) {
				$ids[] = $id;
			}
		}
		$result['post'] = $ids;
	}

	if (!empty($flags['projects']) && !empty($config['projects']) && is_array($config['projects']) && post_type_exists('projects')) {
		$ids = [];
		foreach (array_values($config['projects']) as $index => $item) {
			if (!is_array($item)) {
				continue;
			}
			$id = bl_install_seed_testdata_post_item('projects', (int) $index, $item, $media);
			if ($id > 0) {
				$ids[] = $id;
			}
		}
		$result['projects'] = $ids;
	}

	if (!empty($flags['event']) && !empty($config['events']) && is_array($config['events']) && post_type_exists('event')) {
		$ids = [];
		foreach (array_values($config['events']) as $index => $item) {
			if (!is_array($item)) {
				continue;
			}
			$id = bl_install_seed_testdata_event_item((int) $index, $item, $media);
			if ($id > 0) {
				$ids[] = $id;
			}
		}
		$result['event'] = $ids;
	}

	return $result;
}
