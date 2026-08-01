<?php

defined('ABSPATH') || exit;

/**
 * Register page-settings meta for REST (block editor).
 */
function bl_blocks_register_page_meta(): void
{
	$definitions = bl_blocks_query_definitions('page_settings', false);
	foreach ($definitions as $post) {
		$meta_key = bl_blocks_page_meta_key((int) $post->ID);
		register_post_meta('', $meta_key, [
			'type'              => 'object',
			'single'            => true,
			'show_in_rest'      => [
				'schema' => [
					'type'                 => 'object',
					'additionalProperties' => true,
				],
			],
			'auth_callback'     => static function (): bool {
				return current_user_can('edit_posts');
			},
			'sanitize_callback' => static function ($value) use ($post) {
				$config = bl_blocks_get_config((int) $post->ID);

				return bl_blocks_sanitize_values($config['fields'], is_array($value) ? $value : []);
			},
		]);
	}
}
add_action('init', 'bl_blocks_register_page_meta', 20);

/**
 * Active page_settings definitions assigned to a post type.
 *
 * @return list<array{id: int, title: string, fields: list<array>, metaKey: string, description: string}>
 */
function bl_blocks_page_definitions_for_post_type(string $post_type): array
{
	$out = [];
	foreach (bl_blocks_query_definitions('page_settings', true) as $post) {
		$config = bl_blocks_get_config((int) $post->ID);
		$types = $config['settings']['post_types'] ?? [];
		if (!is_array($types) || !in_array($post_type, $types, true)) {
			continue;
		}
		$out[] = [
			'id'          => (int) $post->ID,
			'title'       => $post->post_title !== '' ? $post->post_title : __('Page Settings', 'baselayer-blocks'),
			'description' => (string) ($config['settings']['description'] ?? ''),
			'fields'      => $config['fields'],
			'metaKey'     => bl_blocks_page_meta_key((int) $post->ID),
		];
	}

	return $out;
}

/**
 * Enqueue editor script for page settings panels.
 *
 * @param string $hook
 */
function bl_blocks_enqueue_page_editor(string $hook): void
{
	if (!in_array($hook, ['post.php', 'post-new.php'], true)) {
		return;
	}
	$screen = function_exists('get_current_screen') ? get_current_screen() : null;
	if (!$screen || !$screen->is_block_editor()) {
		return;
	}
	if ($screen->post_type === BL_BLOCK_POST_TYPE) {
		return;
	}

	$defs = bl_blocks_page_definitions_for_post_type($screen->post_type);
	if ($defs === []) {
		return;
	}

	$asset = bl_blocks_resolve_asset('blocks-editor', 'js');
	if ($asset === null) {
		return;
	}

	wp_enqueue_script(
		'bl-blocks-editor',
		$asset['uri'],
		['wp-plugins', 'wp-edit-post', 'wp-element', 'wp-components', 'wp-data', 'wp-i18n', 'wp-block-editor', 'wp-blocks', 'wp-compose', 'wp-api-fetch'],
		$asset['ver'],
		true
	);
	bl_blocks_enqueue_style('bl-blocks-editor', 'blocks-editor');

	wp_localize_script('bl-blocks-editor', 'blBlocksEditor', [
		'blocks'       => function_exists('bl_blocks_active_block_payloads') ? bl_blocks_active_block_payloads() : [],
		'renderPath'   => 'baselayer-blocks/v1/render',
		'pagesRestUrl' => esc_url_raw(rest_url('wp/v2/pages')),
		'restNonce'    => wp_create_nonce('wp_rest'),
		'i18n'         => [
			'edit'                   => __('Edit fields', 'baselayer-blocks'),
			'save'                   => __('Apply', 'baselayer-blocks'),
			'cancel'                 => __('Cancel', 'baselayer-blocks'),
			'panelTitle'             => __('Block fields', 'baselayer-blocks'),
			'preview'                => __('Edit fields to configure this block.', 'baselayer-blocks'),
			'previewError'           => __('Error loading preview: %s', 'baselayer-blocks'),
			'previewEmpty'           => __('Block rendered as empty.', 'baselayer-blocks'),
			'templateMissing'        => __('Template missing.', 'baselayer-blocks'),
			'addRow'                => __('Add row', 'baselayer-blocks'),
			'removeRow'              => __('Remove row', 'baselayer-blocks'),
			'rowLabel'               => __('Row %d', 'baselayer-blocks'),
			'close'                  => __('Close', 'baselayer-blocks'),
			'choosePage'             => __('Choose page', 'baselayer-blocks'),
			'choosePages'            => __('Choose pages', 'baselayer-blocks'),
			'changePage'             => __('Change page', 'baselayer-blocks'),
			'changePages'            => __('Change pages', 'baselayer-blocks'),
			'clearPage'              => __('Clear', 'baselayer-blocks'),
			'choosePageHelp'         => __('Select a page.', 'baselayer-blocks'),
			'choosePagesHelp'        => __('Select one or more pages.', 'baselayer-blocks'),
			'selectedPage'           => __('Selected page', 'baselayer-blocks'),
			'pagePickerTitle'        => __('Select a page', 'baselayer-blocks'),
			'pagePickerTitleMulti'   => __('Select pages', 'baselayer-blocks'),
			'pagePickerSearch'       => __('Search pages…', 'baselayer-blocks'),
			'pagePickerEmpty'        => __('No pages found.', 'baselayer-blocks'),
			'pagePickerLoading'      => __('Loading…', 'baselayer-blocks'),
			'selectPage'             => __('Select', 'baselayer-blocks'),
			'linkTypePage'           => __('Page', 'baselayer-blocks'),
			'linkTypeUrl'            => __('URL', 'baselayer-blocks'),
			'linkTypeEmail'          => __('Email', 'baselayer-blocks'),
			'linkTypePhone'          => __('Phone', 'baselayer-blocks'),
			'linkTypeLabel'          => __('Type', 'baselayer-blocks'),
			'linkDestPage'           => __('Page', 'baselayer-blocks'),
			'linkDestUrl'            => __('URL', 'baselayer-blocks'),
			'linkDestEmail'          => __('Email address', 'baselayer-blocks'),
			'linkDestPhone'          => __('Phone number', 'baselayer-blocks'),
			'linkText'               => __('Link text', 'baselayer-blocks'),
			'linkOpenNewTab'         => __('Open in new tab', 'baselayer-blocks'),
		],
	]);

	$post_id = isset($_GET['post']) ? (int) $_GET['post'] : 0;
	$payload = [];
	foreach ($defs as $def) {
		$values = [];
		if ($post_id > 0) {
			$raw = get_post_meta($post_id, $def['metaKey'], true);
			$values = is_array($raw) ? $raw : [];
		}
		$payload[] = array_merge($def, ['values' => $values]);
	}

	wp_localize_script('bl-blocks-editor', 'blBlocksPage', [
		'definitions' => $payload,
		'i18n'        => [
			'edit'        => __('Edit', 'baselayer-blocks'),
			'save'        => __('Update', 'baselayer-blocks'),
			'cancel'      => __('Cancel', 'baselayer-blocks'),
			'panelTitle'  => __('Page Settings', 'baselayer-blocks'),
			'openFields'  => __('Edit fields', 'baselayer-blocks'),
		],
	]);
}
add_action('admin_enqueue_scripts', 'bl_blocks_enqueue_page_editor');
