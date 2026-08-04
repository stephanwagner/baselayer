<?php

defined('ABSPATH') || exit;

const BL_BLOCKS_SETTINGS_PAGE = 'bl-blocks-settings';

/**
 * Settings tabs (slug => label). Import / Export now; License later.
 *
 * @return array<string, string>
 */
function bl_blocks_settings_tabs(): array
{
	return [
		'import-export' => __('Import / Export', 'baselayer-blocks'),
	];
}

/**
 * Current Settings tab slug.
 */
function bl_blocks_settings_current_tab(): string
{
	$tabs = bl_blocks_settings_tabs();
	$tab = isset($_GET['tab']) ? sanitize_key((string) wp_unslash($_GET['tab'])) : '';
	if ($tab === '' || !isset($tabs[$tab])) {
		return array_key_first($tabs) ?: 'import-export';
	}

	return $tab;
}

/**
 * Settings page URL for a tab.
 */
function bl_blocks_settings_url(string $tab = ''): string
{
	$args = ['page' => BL_BLOCKS_SETTINGS_PAGE];
	if ($tab !== '') {
		$args['tab'] = $tab;
	}

	return add_query_arg($args, admin_url('admin.php'));
}

/**
 * Register Blocks → Settings admin page.
 */
function bl_blocks_register_settings_page(): void
{
	if (!bl_blocks_user_can_manage()) {
		return;
	}

	add_submenu_page(
		'bl-blocks',
		__('Settings', 'baselayer-blocks'),
		__('Settings', 'baselayer-blocks'),
		'manage_options',
		BL_BLOCKS_SETTINGS_PAGE,
		'bl_blocks_render_settings_page'
	);
}
add_action('admin_menu', 'bl_blocks_register_settings_page', 20);

/**
 * Absolute path to the theme blocks catalog JSON (child → parent → legacy package starter).
 */
function bl_blocks_catalog_import_path(): string
{
	$relative = 'blocks/blocks-import.json';
	$child = trailingslashit(get_stylesheet_directory()) . $relative;
	if (is_readable($child)) {
		return $child;
	}

	$parent = trailingslashit(get_template_directory()) . $relative;
	if (is_readable($parent)) {
		return $parent;
	}

	$legacy = bl_blocks_path('import/accordion.json');
	return is_readable($legacy) ? $legacy : '';
}

/**
 * Display path for the catalog (theme-relative when under a theme directory).
 */
function bl_blocks_catalog_import_display_path(string $path): string
{
	foreach ([get_stylesheet_directory(), get_template_directory()] as $base) {
		$base = trailingslashit($base);
		if ($path !== '' && strpos($path, $base) === 0) {
			return substr($path, strlen($base));
		}
	}

	$pkg = trailingslashit(bl_blocks_path(''));
	if ($path !== '' && strpos($path, $pkg) === 0) {
		return 'packages/baselayer-blocks/' . substr($path, strlen($pkg));
	}

	return $path;
}

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
 * Import definitions from a JSON string (single object or list).
 *
 * @return array{created: int, updated: int, errors: int}
 */
function bl_blocks_import_json_string(string $raw): array
{
	$data = json_decode($raw, true);
	if (!is_array($data)) {
		return ['created' => 0, 'updated' => 0, 'errors' => 1];
	}

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

	return compact('created', 'updated', 'errors');
}

/**
 * Persist an import result notice and redirect back to Settings → Import / Export.
 *
 * @param array{created: int, updated: int, errors: int} $result
 */
function bl_blocks_redirect_import_result(array $result, string $error_text = ''): void
{
	$created = (int) ($result['created'] ?? 0);
	$updated = (int) ($result['updated'] ?? 0);
	$errors = (int) ($result['errors'] ?? 0);

	if ($error_text !== '') {
		$notice = ['type' => 'error', 'text' => $error_text];
	} else {
		$notice = [
			'type' => $errors > 0 && ($created + $updated) === 0 ? 'error' : 'success',
			'text' => sprintf(
				/* translators: 1: created count, 2: updated count, 3: error count */
				__('Import finished: %1$d created, %2$d updated, %3$d errors.', 'baselayer-blocks'),
				$created,
				$updated,
				$errors
			),
		];
	}

	set_transient('bl_blocks_import_notice_' . get_current_user_id(), $notice, 60);
	wp_safe_redirect(bl_blocks_settings_url('import-export'));
	exit;
}

/**
 * Redirect legacy Import / Export slug to Settings.
 */
function bl_blocks_redirect_legacy_import_export_page(): void
{
	if (!is_admin()) {
		return;
	}
	// phpcs:ignore WordPress.Security.NonceVerification.Recommended
	$page = isset($_GET['page']) ? sanitize_key((string) wp_unslash($_GET['page'])) : '';
	if ($page !== 'bl-blocks-import-export') {
		return;
	}
	wp_safe_redirect(bl_blocks_settings_url('import-export'));
	exit;
}
add_action('admin_init', 'bl_blocks_redirect_legacy_import_export_page', 1);

/**
 * Handle export download / import upload before headers are sent.
 */
function bl_blocks_handle_settings_actions(): void
{
	if (!is_admin() || !bl_blocks_user_can_manage()) {
		return;
	}
	// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- verified below
	$page = isset($_GET['page']) ? sanitize_key((string) wp_unslash($_GET['page'])) : '';
	if ($page !== BL_BLOCKS_SETTINGS_PAGE) {
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
			bl_blocks_redirect_import_result(
				['created' => 0, 'updated' => 0, 'errors' => 1],
				__('No file uploaded.', 'baselayer-blocks')
			);
		}

		// phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- binary upload read then JSON-decoded
		$raw = file_get_contents((string) $_FILES['bl_blocks_import_file']['tmp_name']);
		if (!is_string($raw)) {
			bl_blocks_redirect_import_result(
				['created' => 0, 'updated' => 0, 'errors' => 1],
				__('Invalid JSON file.', 'baselayer-blocks')
			);
		}
		$result = bl_blocks_import_json_string($raw);
		if ($result['created'] + $result['updated'] === 0 && $result['errors'] > 0) {
			bl_blocks_redirect_import_result($result, __('Invalid JSON file.', 'baselayer-blocks'));
		}
		bl_blocks_redirect_import_result($result);
	}
}
add_action('admin_init', 'bl_blocks_handle_settings_actions');

/**
 * Enqueue Blocks → Settings assets.
 */
function bl_blocks_enqueue_settings_assets(string $hook): void
{
	if ($hook !== 'blocks_page_' . BL_BLOCKS_SETTINGS_PAGE && $hook !== 'toplevel_page_' . BL_BLOCKS_SETTINGS_PAGE) {
		// Hook varies; also match by query.
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$page = isset($_GET['page']) ? sanitize_key((string) wp_unslash($_GET['page'])) : '';
		if ($page !== BL_BLOCKS_SETTINGS_PAGE) {
			return;
		}
	}
	if (!bl_blocks_user_can_manage()) {
		return;
	}

	if (function_exists('bl_blocks_enqueue_style')) {
		bl_blocks_enqueue_style('bl-blocks-admin', 'blocks-admin');
	}
}
add_action('admin_enqueue_scripts', 'bl_blocks_enqueue_settings_assets');

/**
 * File-name label for the Settings import picker (footer so the input exists).
 */
function bl_blocks_settings_import_file_script(): void
{
	// phpcs:ignore WordPress.Security.NonceVerification.Recommended
	$page = isset($_GET['page']) ? sanitize_key((string) wp_unslash($_GET['page'])) : '';
	if ($page !== BL_BLOCKS_SETTINGS_PAGE || !bl_blocks_user_can_manage()) {
		return;
	}
	?>
	<script>
	(function () {
		var input = document.getElementById('bl_blocks_import_file');
		if (!input) return;
		var nameEl = input.parentElement && input.parentElement.querySelector('.bl-blocks-settings__file-name');
		if (!nameEl) return;
		input.addEventListener('change', function () {
			var empty = nameEl.getAttribute('data-empty') || '';
			nameEl.textContent = (input.files && input.files[0] && input.files[0].name) || empty;
		});
	})();
	</script>
	<?php
}
add_action('admin_footer', 'bl_blocks_settings_import_file_script');

/**
 * Render Blocks → Settings screen.
 */
function bl_blocks_render_settings_page(): void
{
	if (!bl_blocks_user_can_manage()) {
		wp_die(esc_html__('You do not have permission to manage Blocks.', 'baselayer-blocks'));
	}

	$tabs = bl_blocks_settings_tabs();
	$tab = bl_blocks_settings_current_tab();

	$notice_key = 'bl_blocks_import_notice_' . get_current_user_id();
	$notice = get_transient($notice_key);
	if (is_array($notice)) {
		delete_transient($notice_key);
	}

	$choose_file = __('Choose file', 'baselayer-blocks');
	$no_file = __('No file chosen', 'baselayer-blocks');
	?>
	<div class="wrap bl-blocks-settings">
		<h1><?php echo esc_html__('Settings', 'baselayer-blocks'); ?></h1>

		<?php if (is_array($notice) && !empty($notice['text'])) : ?>
			<div class="notice notice-<?php echo esc_attr((string) ($notice['type'] ?? 'info')); ?> is-dismissible">
				<p><?php echo esc_html((string) $notice['text']); ?></p>
			</div>
		<?php endif; ?>

		<div class="bl-forms-builder bl-blocks-settings-shell bl-form">
			<nav class="bl-forms-builder__tabs" role="tablist" aria-label="<?php echo esc_attr__('Blocks settings sections', 'baselayer-blocks'); ?>">
				<?php foreach ($tabs as $slug => $label) : ?>
					<a
						href="<?php echo esc_url(bl_blocks_settings_url($slug)); ?>"
						class="bl-forms-builder__tab<?php echo $tab === $slug ? ' is-active' : ''; ?>"
						role="tab"
						aria-selected="<?php echo $tab === $slug ? 'true' : 'false'; ?>"
					><?php echo esc_html($label); ?></a>
				<?php endforeach; ?>
			</nav>

			<div class="bl-forms-builder__panels">
				<?php if ($tab === 'import-export') : ?>
					<div class="bl-blocks-settings__columns">
						<section class="bl-blocks-settings__panel">
							<h2><?php echo esc_html__('Export', 'baselayer-blocks'); ?></h2>
							<p class="description"><?php echo esc_html__('Download definitions as JSON. Re-import matches by type and slug: the same slug updates in place, never duplicates.', 'baselayer-blocks'); ?></p>
							<form method="post" action="<?php echo esc_url(bl_blocks_settings_url('import-export')); ?>" class="bl-blocks-settings__form">
								<?php wp_nonce_field('bl_blocks_export', 'bl_blocks_export_nonce'); ?>
								<label class="screen-reader-text" for="bl_blocks_export_type"><?php echo esc_html__('Type', 'baselayer-blocks'); ?></label>
								<div class="bl-blocks-settings__row">
									<select name="bl_blocks_export_type" id="bl_blocks_export_type" class="bl-blocks-settings__select">
										<option value="all"><?php echo esc_html__('All', 'baselayer-blocks'); ?></option>
										<option value="block"><?php echo esc_html__('Blocks', 'baselayer-blocks'); ?></option>
										<option value="page_settings"><?php echo esc_html__('Content Fields', 'baselayer-blocks'); ?></option>
										<option value="site_settings"><?php echo esc_html__('Website Fields', 'baselayer-blocks'); ?></option>
									</select>
									<?php submit_button(__('Download JSON', 'baselayer-blocks'), 'primary bl-button', 'bl_blocks_export', false); ?>
								</div>
							</form>
						</section>

						<section class="bl-blocks-settings__panel">
							<h2><?php echo esc_html__('Import', 'baselayer-blocks'); ?></h2>
							<p class="description"><?php echo esc_html__('Upload a JSON export. Existing definitions with the same type and slug are updated.', 'baselayer-blocks'); ?></p>
							<form method="post" enctype="multipart/form-data" action="<?php echo esc_url(bl_blocks_settings_url('import-export')); ?>" class="bl-blocks-settings__form">
								<?php wp_nonce_field('bl_blocks_import', 'bl_blocks_import_nonce'); ?>
								<div class="bl-blocks-settings__row">
									<label class="bl-blocks-settings__file">
										<input
											type="file"
											name="bl_blocks_import_file"
											id="bl_blocks_import_file"
											class="bl-blocks-settings__file-input"
											accept="application/json,.json"
											required
										>
										<span class="button bl-button bl-blocks-settings__file-btn"><?php echo esc_html($choose_file); ?></span>
										<span class="bl-blocks-settings__file-name" data-empty="<?php echo esc_attr($no_file); ?>"><?php echo esc_html($no_file); ?></span>
									</label>
									<?php submit_button(__('Import', 'baselayer-blocks'), 'primary bl-button', 'bl_blocks_import', false); ?>
								</div>
							</form>
						</section>
					</div>
				<?php endif; ?>
			</div>
		</div>
	</div>
	<?php
}
