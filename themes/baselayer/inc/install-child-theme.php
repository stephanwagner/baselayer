<?php

defined('ABSPATH') || exit;

/**
 * Whether the installer should create and activate a child theme.
 */
function bl_install_should_create_child_theme(): bool
{
	return !empty($_POST['install']['create_child_theme']);
}

/**
 * Sanitize a theme slug for child theme creation.
 * Reserved parent slug “baselayer” becomes “baselayer-child”.
 */
function bl_install_sanitize_theme_slug(string $slug): string
{
	$slug = strtolower(sanitize_title($slug));
	if ($slug === 'baselayer') {
		return 'baselayer-child';
	}
	return $slug;
}

/**
 * Absolute path to the child theme template directory shipped with the parent.
 */
function bl_install_child_theme_templates_dir(): string
{
	return __DIR__ . '/child-theme-templates';
}

/**
 * Create a thin FromScratch child theme and return its directory slug, or WP_Error.
 *
 * @param array{name: string, slug: string, description: string, author: string, author_uri: string} $theme
 * @return string|WP_Error Child theme stylesheet slug on success.
 */
function bl_install_create_child_theme(array $theme)
{
	$slug = bl_install_sanitize_theme_slug((string) ($theme['slug'] ?? ''));
	$name = trim((string) ($theme['name'] ?? ''));
	$description = trim((string) ($theme['description'] ?? ''));
	$author = trim((string) ($theme['author'] ?? ''));
	$author_uri = trim((string) ($theme['author_uri'] ?? ''));

	if ($slug === '' || !preg_match('/^[a-z][a-z0-9-]*$/', $slug)) {
		return new WP_Error('bl_child_slug', __('Invalid child theme slug.', 'baselayer'));
	}

	if ($name === '') {
		return new WP_Error('bl_child_name', __('Theme name is required.', 'baselayer'));
	}

	$templates_dir = bl_install_child_theme_templates_dir();
	if (!is_dir($templates_dir)) {
		return new WP_Error('bl_child_templates', __('Child theme templates are missing from the parent theme.', 'baselayer'));
	}

	$themes_dir = WP_CONTENT_DIR . '/themes';
	$child_dir = $themes_dir . '/' . $slug;

	if (is_dir($child_dir)) {
		return new WP_Error('bl_child_exists', __('A theme or folder with that name already exists. Choose a different theme slug.', 'baselayer'));
	}

	if (!wp_mkdir_p($child_dir)) {
		return new WP_Error('bl_child_mkdir', __('Could not create the child theme folder.', 'baselayer'));
	}

	$content_path = (string) (wp_parse_url(content_url(), PHP_URL_PATH) ?: '/wp-content');
	$content_path = untrailingslashit($content_path);

	$tokens = [
		'{{name}}' => $name,
		'{{slug}}' => $slug,
		'{{description}}' => $description,
		'{{author}}' => $author,
		'{{author_uri}}' => $author_uri,
		'{{child_theme_path}}' => $content_path . '/themes/' . $slug,
	];

	$copied = bl_install_copy_child_theme_templates($templates_dir, $child_dir, $tokens);
	if (is_wp_error($copied)) {
		return $copied;
	}

	$content_types = bl_install_copy_child_content_types($child_dir);
	if (is_wp_error($content_types)) {
		return $content_types;
	}

	return $slug;
}

/**
 * Copy parent config/content-types/*.php into the new child theme.
 *
 * @return true|WP_Error
 */
function bl_install_copy_child_content_types(string $child_dir)
{
	$source_dir = dirname(__DIR__) . '/config/content-types';
	if (!is_dir($source_dir)) {
		return new WP_Error('bl_child_content_types', __('Parent content-types config is missing.', 'baselayer'));
	}

	$dest_dir = trailingslashit($child_dir) . 'config/content-types';
	if (!is_dir($dest_dir) && !wp_mkdir_p($dest_dir)) {
		return new WP_Error('bl_child_mkdir', __('Could not create child theme directories.', 'baselayer'));
	}

	$files = glob($source_dir . '/*.php') ?: [];
	foreach ($files as $file) {
		$target = $dest_dir . '/' . basename($file);
		if (!copy($file, $target)) {
			return new WP_Error('bl_child_write', __('Could not write child theme files.', 'baselayer'));
		}
	}

	return true;
}

/**
 * Recursively copy child theme templates into the new theme directory.
 *
 * @param array<string, string> $tokens
 * @return true|WP_Error
 */
function bl_install_copy_child_theme_templates(string $source_dir, string $dest_dir, array $tokens)
{
	$iterator = new RecursiveIteratorIterator(
		new RecursiveDirectoryIterator($source_dir, FilesystemIterator::SKIP_DOTS),
		RecursiveIteratorIterator::SELF_FIRST
	);

	$text_extensions = [
		'css' => true,
		'js' => true,
		'json' => true,
		'md' => true,
		'mjs' => true,
		'php' => true,
		'scss' => true,
		'txt' => true,
		'gitignore' => true,
	];

	/** @var SplFileInfo $item */
	foreach ($iterator as $item) {
		$relative = substr($item->getPathname(), strlen($source_dir) + 1);
		$relative = str_replace('\\', '/', $relative);
		$target = $dest_dir . '/' . $relative;

		if ($item->isDir()) {
			if (!is_dir($target) && !wp_mkdir_p($target)) {
				return new WP_Error('bl_child_mkdir', __('Could not create child theme directories.', 'baselayer'));
			}
			continue;
		}

		$dir = dirname($target);
		if (!is_dir($dir) && !wp_mkdir_p($dir)) {
			return new WP_Error('bl_child_mkdir', __('Could not create child theme directories.', 'baselayer'));
		}

		$extension = strtolower(pathinfo($relative, PATHINFO_EXTENSION));
		$basename = basename($relative);
		$is_text = isset($text_extensions[$extension])
			|| $basename === '.gitignore'
			|| $basename === 'gitignore';

		if ($is_text) {
			$contents = file_get_contents($item->getPathname());
			if ($contents === false) {
				return new WP_Error('bl_child_read', __('Could not read child theme template files.', 'baselayer'));
			}
			$contents = strtr($contents, $tokens);
			if (file_put_contents($target, $contents) === false) {
				return new WP_Error('bl_child_write', __('Could not write child theme files.', 'baselayer'));
			}
			continue;
		}

		if (!copy($item->getPathname(), $target)) {
			return new WP_Error('bl_child_write', __('Could not write child theme files.', 'baselayer'));
		}
	}

	return true;
}
