<?php

defined('ABSPATH') || exit;

/**
 * Register Blocks → Import / Export admin page.
 */
function bl_blocks_register_import_export_page(): void
{
	if (!bl_blocks_user_can_manage()) {
		return;
	}

	add_submenu_page(
		'bl-blocks',
		__('Import / Export', 'baselayer-blocks'),
		__('Import / Export', 'baselayer-blocks'),
		'manage_options',
		'bl-blocks-import-export',
		'bl_blocks_render_import_export_page'
	);
}
add_action('admin_menu', 'bl_blocks_register_import_export_page', 20);

/**
 * Export payload for one definition post.
 *
 * @return array{type: string, title: string, fields: list<array<string, mixed>>, settings: array<string, mixed>}|null
 */
function bl_blocks_export_definition_payload(WP_Post $post): ?array
{
	$type = bl_blocks_get_definition_type((int) $post->ID);
	$config = bl_blocks_get_config((int) $post->ID);
	$settings = $config['settings'];
	$settings['slug'] = bl_blocks_definition_slug((int) $post->ID, $settings);

	return [
		'type'     => $type,
		'title'    => $post->post_title !== '' ? $post->post_title : $settings['slug'],
		'fields'   => $config['fields'],
		'settings' => $settings,
	];
}

/**
 * @param string $type all|block|page_settings|site_settings
 * @return list<array<string, mixed>>
 */
function bl_blocks_collect_export_items(string $type): array
{
	$types = $type === 'all'
		? bl_blocks_definition_types()
		: [bl_blocks_sanitize_definition_type($type)];

	$items = [];
	foreach ($types as $def_type) {
		foreach (bl_blocks_query_definitions($def_type, false) as $post) {
			$payload = bl_blocks_export_definition_payload($post);
			if ($payload !== null) {
				$items[] = $payload;
			}
		}
	}

	return $items;
}

/**
 * Create or update a definition from an import item (matched by type + slug).
 *
 * @param array<string, mixed> $item
 * @return array{ok: bool, action: string, id: int, message: string}
 */
function bl_blocks_import_definition_item(array $item): array
{
	$type = bl_blocks_sanitize_definition_type($item['type'] ?? 'block');
	$config = bl_blocks_sanitize_config(
		[
			'fields'   => $item['fields'] ?? [],
			'settings' => $item['settings'] ?? [],
		],
		$type
	);
	$slug = sanitize_key((string) ($config['settings']['slug'] ?? ''));
	if ($slug === '') {
		return [
			'ok'      => false,
			'action'  => 'skip',
			'id'      => 0,
			'message' => __('Skipped item without a slug.', 'baselayer-blocks'),
		];
	}
	$config['settings']['slug'] = $slug;

	$title = sanitize_text_field((string) ($item['title'] ?? $slug));
	if ($title === '') {
		$title = $slug;
	}

	$existing_id = 0;
	foreach (bl_blocks_query_definitions($type, false) as $post) {
		$existing_slug = bl_blocks_definition_slug((int) $post->ID);
		if ($existing_slug === $slug) {
			$existing_id = (int) $post->ID;
			break;
		}
	}

	$postarr = [
		'post_title'  => $title,
		'post_status' => 'publish',
		'post_type'   => BL_BLOCK_POST_TYPE,
	];

	if ($existing_id > 0) {
		$postarr['ID'] = $existing_id;
		$post_id = wp_update_post($postarr, true);
		$action = 'updated';
	} else {
		$post_id = wp_insert_post($postarr, true);
		$action = 'created';
	}

	if (is_wp_error($post_id)) {
		return [
			'ok'      => false,
			'action'  => 'error',
			'id'      => 0,
			'message' => $post_id->get_error_message(),
		];
	}

	$post_id = (int) $post_id;
	update_post_meta($post_id, BL_BLOCK_TYPE_META, $type);
	update_post_meta($post_id, BL_BLOCK_CONFIG_META, $config);

	return [
		'ok'      => true,
		'action'  => $action,
		'id'      => $post_id,
		'message' => sprintf(
			/* translators: 1: definition title, 2: slug */
			__('%1$s (%2$s)', 'baselayer-blocks'),
			$title,
			$slug
		),
	];
}

/**
 * Handle export download / import upload before headers are sent.
 */
function bl_blocks_handle_import_export_actions(): void
{
	if (!is_admin() || !bl_blocks_user_can_manage()) {
		return;
	}
	// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- verified below
	$page = isset($_GET['page']) ? sanitize_key((string) wp_unslash($_GET['page'])) : '';
	if ($page !== 'bl-blocks-import-export') {
		return;
	}

	if (isset($_POST['bl_blocks_export']) && check_admin_referer('bl_blocks_export', 'bl_blocks_export_nonce')) {
		$type = sanitize_key((string) wp_unslash($_POST['bl_blocks_export_type'] ?? 'all'));
		if (!in_array($type, array_merge(['all'], bl_blocks_definition_types()), true)) {
			$type = 'all';
		}
		$items = bl_blocks_collect_export_items($type);
		$filename = 'baselayer-blocks-' . $type . '-' . gmdate('Ymd-His') . '.json';
		nocache_headers();
		header('Content-Type: application/json; charset=utf-8');
		header('Content-Disposition: attachment; filename="' . $filename . '"');
		echo wp_json_encode($items, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
		exit;
	}

	if (isset($_POST['bl_blocks_import']) && check_admin_referer('bl_blocks_import', 'bl_blocks_import_nonce')) {
		if (empty($_FILES['bl_blocks_import_file']['tmp_name'])) {
			set_transient(
				'bl_blocks_import_notice_' . get_current_user_id(),
				['type' => 'error', 'text' => __('No file uploaded.', 'baselayer-blocks')],
				60
			);
			wp_safe_redirect(admin_url('admin.php?page=bl-blocks-import-export'));
			exit;
		}

		// phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- binary upload read then JSON-decoded
		$raw = file_get_contents((string) $_FILES['bl_blocks_import_file']['tmp_name']);
		$data = is_string($raw) ? json_decode($raw, true) : null;
		if (!is_array($data)) {
			set_transient(
				'bl_blocks_import_notice_' . get_current_user_id(),
				['type' => 'error', 'text' => __('Invalid JSON file.', 'baselayer-blocks')],
				60
			);
			wp_safe_redirect(admin_url('admin.php?page=bl-blocks-import-export'));
			exit;
		}

		// Allow a single object or a list.
		$items = isset($data['settings']) || isset($data['fields']) ? [$data] : $data;
		$created = 0;
		$updated = 0;
		$errors = 0;

		foreach ($items as $item) {
			if (!is_array($item)) {
				$errors++;
				continue;
			}
			$result = bl_blocks_import_definition_item($item);
			if (!$result['ok']) {
				$errors++;
				continue;
			}
			if ($result['action'] === 'created') {
				$created++;
			} else {
				$updated++;
			}
		}

		set_transient(
			'bl_blocks_import_notice_' . get_current_user_id(),
			[
				'type' => $errors > 0 && ($created + $updated) === 0 ? 'error' : 'success',
				'text' => sprintf(
					/* translators: 1: created count, 2: updated count, 3: error count */
					__('Import finished: %1$d created, %2$d updated, %3$d errors.', 'baselayer-blocks'),
					$created,
					$updated,
					$errors
				),
			],
			60
		);
		wp_safe_redirect(admin_url('admin.php?page=bl-blocks-import-export'));
		exit;
	}
}
add_action('admin_init', 'bl_blocks_handle_import_export_actions');

/**
 * Render Import / Export screen.
 */
function bl_blocks_render_import_export_page(): void
{
	if (!bl_blocks_user_can_manage()) {
		wp_die(esc_html__('You do not have permission to manage Blocks.', 'baselayer-blocks'));
	}

	$notice_key = 'bl_blocks_import_notice_' . get_current_user_id();
	$notice = get_transient($notice_key);
	if (is_array($notice)) {
		delete_transient($notice_key);
	}

	$bundled = bl_blocks_path('import/accordion.json');
	?>
	<div class="wrap">
		<h1><?php echo esc_html__('Import / Export', 'baselayer-blocks'); ?></h1>

		<?php if (is_array($notice) && !empty($notice['text'])) : ?>
			<div class="notice notice-<?php echo esc_attr((string) ($notice['type'] ?? 'info')); ?> is-dismissible">
				<p><?php echo esc_html((string) $notice['text']); ?></p>
			</div>
		<?php endif; ?>

		<div class="card" style="max-width: 720px; padding: 1em 1.5em; margin-top: 1.5em;">
			<h2><?php echo esc_html__('Export', 'baselayer-blocks'); ?></h2>
			<p><?php echo esc_html__('Download definitions as JSON. Matched later by type and slug.', 'baselayer-blocks'); ?></p>
			<form method="post">
				<?php wp_nonce_field('bl_blocks_export', 'bl_blocks_export_nonce'); ?>
				<p>
					<label for="bl_blocks_export_type"><strong><?php echo esc_html__('Type', 'baselayer-blocks'); ?></strong></label><br>
					<select name="bl_blocks_export_type" id="bl_blocks_export_type">
						<option value="all"><?php echo esc_html__('All', 'baselayer-blocks'); ?></option>
						<option value="block"><?php echo esc_html__('Blocks', 'baselayer-blocks'); ?></option>
						<option value="page_settings"><?php echo esc_html__('Content fields', 'baselayer-blocks'); ?></option>
						<option value="site_settings"><?php echo esc_html__('Website', 'baselayer-blocks'); ?></option>
					</select>
				</p>
				<?php submit_button(__('Download JSON', 'baselayer-blocks'), 'primary', 'bl_blocks_export', false); ?>
			</form>
		</div>

		<div class="card" style="max-width: 720px; padding: 1em 1.5em; margin-top: 1.5em;">
			<h2><?php echo esc_html__('Import', 'baselayer-blocks'); ?></h2>
			<p><?php echo esc_html__('Upload a JSON export. Existing definitions with the same type and slug are updated.', 'baselayer-blocks'); ?></p>
			<form method="post" enctype="multipart/form-data">
				<?php wp_nonce_field('bl_blocks_import', 'bl_blocks_import_nonce'); ?>
				<p>
					<input type="file" name="bl_blocks_import_file" accept="application/json,.json" required>
				</p>
				<?php submit_button(__('Import JSON', 'baselayer-blocks'), 'primary', 'bl_blocks_import', false); ?>
			</form>
			<?php if (is_readable($bundled)) : ?>
				<p class="description" style="margin-top: 1em;">
					<?php
					echo esc_html__(
						'Bundled starter: packages/baselayer-blocks/import/accordion.json (Accordion block with InnerBlocks).',
						'baselayer-blocks'
					);
					?>
				</p>
			<?php endif; ?>
		</div>
	</div>
	<?php
}
