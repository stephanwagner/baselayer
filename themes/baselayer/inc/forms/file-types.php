<?php

/**
 * File upload extension → MIME map and preview badge colors.
 *
 * Adjust colors / labels here (or via the `bl_forms_file_type_styles` filter).
 */

defined('ABSPATH') || exit;

/**
 * Default allowed extensions for Image Upload fields.
 *
 * @return list<string>
 */
function bl_forms_default_image_extensions(): array
{
	return ['jpg', 'jpeg', 'png', 'webp', 'gif', 'heic'];
}

/**
 * Normalize a free-form extensions list (string or array) to lowercase tokens.
 *
 * @param mixed $raw
 * @return list<string>
 */
function bl_forms_sanitize_extensions($raw): array
{
	if (is_array($raw)) {
		$parts = $raw;
	} else {
		$parts = preg_split('/[\s,;]+/', (string) $raw) ?: [];
	}

	$out = [];
	foreach ($parts as $part) {
		$ext = strtolower(ltrim(trim((string) $part), '.'));
		if ($ext === '' || !preg_match('/^[a-z0-9]{1,12}$/', $ext)) {
			continue;
		}
		$out[$ext] = $ext;
	}

	return array_values($out);
}

/**
 * Allowed extensions for a file/image field (empty = no extra restriction).
 *
 * @param array<string, mixed> $field
 * @return list<string>
 */
function bl_forms_field_extensions(array $field): array
{
	$type = (string) ($field['type'] ?? '');
	if (!array_key_exists('extensions', $field) && $type === 'image') {
		return bl_forms_default_image_extensions();
	}

	return bl_forms_sanitize_extensions($field['extensions'] ?? '');
}

/**
 * HTML accept attribute from an extensions list.
 *
 * @param list<string> $extensions
 */
function bl_forms_accept_from_extensions(array $extensions): string
{
	if ($extensions === []) {
		return '';
	}

	$parts = [];
	foreach ($extensions as $ext) {
		$parts[] = '.' . $ext;
	}

	return implode(',', $parts);
}

/**
 * Extension → MIME types used for WordPress upload overrides.
 *
 * Keys may use `|` for aliases (WordPress mime map style).
 *
 * @return array<string, string>
 */
function bl_forms_extension_mime_map(): array
{
	$map = [
		'jpg|jpeg|jpe' => 'image/jpeg',
		'png'          => 'image/png',
		'gif'          => 'image/gif',
		'webp'         => 'image/webp',
		'heic'         => 'image/heic',
		'heif'         => 'image/heif',
		'avif'         => 'image/avif',
		'svg'          => 'image/svg+xml',
		'pdf'          => 'application/pdf',
		'doc'          => 'application/msword',
		'docx'         => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
		'xls'          => 'application/vnd.ms-excel',
		'xlsx'         => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
		'csv'          => 'text/csv',
		'ppt'          => 'application/vnd.ms-powerpoint',
		'pptx'         => 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
		'txt'          => 'text/plain',
		'rtf'          => 'application/rtf',
		'md'           => 'text/markdown',
		'zip'          => 'application/zip',
		'rar'          => 'application/vnd.rar',
		'7z'           => 'application/x-7z-compressed',
		'gz'           => 'application/gzip',
		'tar'          => 'application/x-tar',
		'mp3'          => 'audio/mpeg',
		'wav'          => 'audio/wav',
		'ogg'          => 'audio/ogg',
		'mp4'          => 'video/mp4',
		'mov'          => 'video/quicktime',
		'webm'         => 'video/webm',
		'json'         => 'application/json',
		'xml'          => 'application/xml',
		'html|htm'     => 'text/html',
	];

	/**
	 * Filter the extension → MIME map used for upload validation.
	 *
	 * @param array<string, string> $map
	 */
	return apply_filters('bl_forms_extension_mime_map', $map);
}

/**
 * Build a WordPress `mimes` override array for the given extensions.
 *
 * @param list<string> $extensions
 * @return array<string, string>|null Null when unrestricted.
 */
function bl_forms_mimes_for_extensions(array $extensions): ?array
{
	if ($extensions === []) {
		return null;
	}

	$wanted = array_fill_keys($extensions, true);
	$mimes = [];

	foreach (bl_forms_extension_mime_map() as $key => $mime) {
		$aliases = explode('|', (string) $key);
		$matched = [];
		foreach ($aliases as $alias) {
			$alias = strtolower(trim($alias));
			if ($alias !== '' && isset($wanted[$alias])) {
				$matched[] = $alias;
			}
		}
		if ($matched !== []) {
			$mimes[implode('|', $matched)] = $mime;
		}
	}

	// Unknown extensions: still list them with a generic binary type so WP can reject properly.
	foreach ($extensions as $ext) {
		$found = false;
		foreach (array_keys($mimes) as $key) {
			if (in_array($ext, explode('|', (string) $key), true)) {
				$found = true;
				break;
			}
		}
		if (!$found) {
			$mimes[$ext] = 'application/octet-stream';
		}
	}

	return $mimes !== [] ? $mimes : null;
}

/**
 * Whether a filename matches the allowed extensions list.
 *
 * @param list<string> $extensions Empty = allow any.
 */
function bl_forms_extension_allowed(string $filename, array $extensions): bool
{
	if ($extensions === []) {
		return true;
	}

	$ext = strtolower(pathinfo($filename, PATHINFO_EXTENSION));

	return $ext !== '' && in_array($ext, $extensions, true);
}

/**
 * Preview badge styles keyed by extension (familiar brand-ish colors).
 *
 * Each entry: bg, fg, optional label (defaults to uppercase extension).
 *
 * @return array<string, array{bg:string,fg:string,label?:string}>
 */
function bl_forms_file_type_styles(): array
{
	$styles = [
		// Documents
		'pdf'  => ['bg' => '#E5252A', 'fg' => '#FFFFFF', 'label' => 'PDF'],
		'doc'  => ['bg' => '#2B579A', 'fg' => '#FFFFFF', 'label' => 'DOC'],
		'docx' => ['bg' => '#2B579A', 'fg' => '#FFFFFF', 'label' => 'DOCX'],
		'rtf'  => ['bg' => '#2B579A', 'fg' => '#FFFFFF'],
		'txt'  => ['bg' => '#6B7280', 'fg' => '#FFFFFF', 'label' => 'TXT'],
		'md'   => ['bg' => '#6B7280', 'fg' => '#FFFFFF', 'label' => 'MD'],

		// Spreadsheets
		'xls'  => ['bg' => '#217346', 'fg' => '#FFFFFF', 'label' => 'XLS'],
		'xlsx' => ['bg' => '#217346', 'fg' => '#FFFFFF', 'label' => 'XLSX'],
		'csv'  => ['bg' => '#217346', 'fg' => '#FFFFFF', 'label' => 'CSV'],

		// Presentations
		'ppt'  => ['bg' => '#C43E1C', 'fg' => '#FFFFFF', 'label' => 'PPT'],
		'pptx' => ['bg' => '#C43E1C', 'fg' => '#FFFFFF', 'label' => 'PPTX'],

		// Archives
		'zip'  => ['bg' => '#EAB308', 'fg' => '#1F2937', 'label' => 'ZIP'],
		'rar'  => ['bg' => '#EAB308', 'fg' => '#1F2937', 'label' => 'RAR'],
		'7z'   => ['bg' => '#EAB308', 'fg' => '#1F2937', 'label' => '7Z'],
		'gz'   => ['bg' => '#EAB308', 'fg' => '#1F2937', 'label' => 'GZ'],
		'tar'  => ['bg' => '#EAB308', 'fg' => '#1F2937', 'label' => 'TAR'],

		// Media
		'mp3'  => ['bg' => '#8B5CF6', 'fg' => '#FFFFFF', 'label' => 'MP3'],
		'wav'  => ['bg' => '#8B5CF6', 'fg' => '#FFFFFF'],
		'ogg'  => ['bg' => '#8B5CF6', 'fg' => '#FFFFFF'],
		'mp4'  => ['bg' => '#0EA5E9', 'fg' => '#FFFFFF', 'label' => 'MP4'],
		'mov'  => ['bg' => '#0EA5E9', 'fg' => '#FFFFFF', 'label' => 'MOV'],
		'webm' => ['bg' => '#0EA5E9', 'fg' => '#FFFFFF'],

		// Images (used when preview is file-style fallback)
		'jpg'  => ['bg' => '#EC4899', 'fg' => '#FFFFFF', 'label' => 'JPG'],
		'jpeg' => ['bg' => '#EC4899', 'fg' => '#FFFFFF', 'label' => 'JPEG'],
		'png'  => ['bg' => '#EC4899', 'fg' => '#FFFFFF', 'label' => 'PNG'],
		'gif'  => ['bg' => '#EC4899', 'fg' => '#FFFFFF', 'label' => 'GIF'],
		'webp' => ['bg' => '#EC4899', 'fg' => '#FFFFFF', 'label' => 'WEBP'],
		'heic' => ['bg' => '#EC4899', 'fg' => '#FFFFFF', 'label' => 'HEIC'],
		'svg'  => ['bg' => '#EC4899', 'fg' => '#FFFFFF', 'label' => 'SVG'],

		// Code / data
		'json' => ['bg' => '#F59E0B', 'fg' => '#1F2937', 'label' => 'JSON'],
		'xml'  => ['bg' => '#F59E0B', 'fg' => '#1F2937', 'label' => 'XML'],
		'html' => ['bg' => '#F59E0B', 'fg' => '#1F2937', 'label' => 'HTML'],
		'htm'  => ['bg' => '#F59E0B', 'fg' => '#1F2937', 'label' => 'HTM'],

		// Fallback
		'default' => ['bg' => '#6B7280', 'fg' => '#FFFFFF'],
	];

	/**
	 * Filter file preview badge colors / labels.
	 *
	 * @param array<string, array{bg:string,fg:string,label?:string}> $styles
	 */
	return apply_filters('bl_forms_file_type_styles', $styles);
}

/**
 * Resolve badge style for one extension.
 *
 * @return array{bg:string,fg:string,label:string}
 */
function bl_forms_file_type_style(string $extension): array
{
	$extension = strtolower(ltrim($extension, '.'));
	$styles = bl_forms_file_type_styles();
	$style = $styles[$extension] ?? $styles['default'] ?? ['bg' => '#6B7280', 'fg' => '#FFFFFF'];
	$label = isset($style['label']) && is_string($style['label']) && $style['label'] !== ''
		? $style['label']
		: strtoupper($extension !== '' ? $extension : 'FILE');

	return [
		'bg'    => (string) ($style['bg'] ?? '#6B7280'),
		'fg'    => (string) ($style['fg'] ?? '#FFFFFF'),
		'label' => $label,
	];
}
