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
 * Language key for bundled blocks catalog JSON (e.g. de_CH → de, en_US → en).
 *
 * Uses the site language (not the current admin user’s locale).
 * Falls back to "en" when no matching language file exists.
 */
function bl_blocks_catalog_locale_key(): string
{
	$locale = get_option('WPLANG', '');
	if (!is_string($locale) || $locale === '') {
		$locale = function_exists('get_locale') ? (string) get_locale() : 'en_US';
	}

	$locale = strtolower(str_replace('-', '_', $locale));
	if ($locale === '') {
		return 'en';
	}

	$parts = explode('_', $locale);
	$lang = $parts[0] !== '' ? $parts[0] : 'en';

	return preg_match('/^[a-z]{2}$/', $lang) === 1 ? $lang : 'en';
}

/**
 * Absolute path to the theme blocks catalog JSON for the site language.
 *
 * Prefers import-blocks-{lang}.json (e.g. -de, -en), then -en, then legacy
 * import-blocks.json. Searches child theme, then parent theme, then the
 * package accordion starter.
 */
function bl_blocks_catalog_import_path(): string
{
	$lang = bl_blocks_catalog_locale_key();
	$filenames = [
		'import-blocks-' . $lang . '.json',
		'import-blocks-en.json',
		'import-blocks.json',
	];

	foreach ([get_stylesheet_directory(), get_template_directory()] as $base) {
		$dir = trailingslashit($base) . 'blocks/';
		foreach ($filenames as $file) {
			$path = $dir . $file;
			if (is_readable($path)) {
				return $path;
			}
		}
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
 * Allowed export type keys for Settings → Export.
 *
 * @return list<string>
 */
function bl_blocks_export_type_keys(): array
{
	return array_merge(['all', 'block_options'], bl_blocks_definition_types());
}

/**
 * Export payload for one definition post.
 *
 * Block definitions include live Block Options items (fields + options belong together).
 *
 * @return array<string, mixed>|null
 */
function bl_blocks_export_definition_payload(WP_Post $post): ?array
{
	$type = bl_blocks_get_definition_type((int) $post->ID);
	$config = bl_blocks_get_config((int) $post->ID);
	$settings = $config['settings'];
	$settings['slug'] = bl_blocks_definition_slug((int) $post->ID, $settings);

	$payload = [
		'type'     => $type,
		'title'    => $post->post_title !== '' ? $post->post_title : $settings['slug'],
		'fields'   => $config['fields'],
		'settings' => $settings,
	];

	if (
		$type === 'block'
		&& function_exists('bl_block_options_get_block_items')
		&& function_exists('bl_blocks_gutenberg_name')
	) {
		$slug = (string) ($settings['slug'] ?? '');
		$block_name = $slug !== '' ? bl_blocks_gutenberg_name($slug) : '';
		$payload['block_options'] = [
			'items' => $block_name !== '' ? bl_block_options_get_block_items($block_name) : [],
		];
	}

	return $payload;
}

/**
 * Collect definition export items (not the full Block Options store).
 *
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
 * Full Block Options store payload for export (presets + all assigned blocks).
 *
 * @return array{version: int, presets: array<string, mixed>, blocks: array<string, mixed>}
 */
function bl_blocks_export_block_options_store(): array
{
	if (!function_exists('bl_block_options_get_store')) {
		return [
			'version' => 1,
			'presets' => [],
			'blocks'  => [],
		];
	}

	return bl_block_options_get_store();
}

/**
 * Build download payload for an export type.
 *
 * - all → envelope { version, definitions, block_options }
 * - block_options → store only
 * - block|page_settings|site_settings → definition list
 *
 * @return array<string, mixed>|list<array<string, mixed>>
 */
function bl_blocks_build_export_payload(string $type)
{
	if ($type === 'block_options') {
		return bl_blocks_export_block_options_store();
	}

	if ($type === 'all') {
		return [
			'version'        => 1,
			'definitions'    => bl_blocks_collect_export_items('all'),
			'block_options'  => bl_blocks_export_block_options_store(),
		];
	}

	return bl_blocks_collect_export_items($type);
}

/**
 * Whether an array is a list (PHP 8.0-safe; array_is_list is 8.1+).
 *
 * @param array<mixed> $data
 */
function bl_blocks_array_is_list(array $data): bool
{
	if (function_exists('array_is_list')) {
		return array_is_list($data);
	}

	if ($data === []) {
		return true;
	}

	return array_keys($data) === range(0, count($data) - 1);
}

/**
 * Whether decoded JSON looks like a Block Options store (not a definition / envelope).
 *
 * @param array<string, mixed> $data
 */
function bl_blocks_import_is_block_options_store(array $data): bool
{
	if (bl_blocks_array_is_list($data)) {
		return false;
	}
	if (isset($data['definitions']) || isset($data['type']) || isset($data['fields'])) {
		return false;
	}
	if (isset($data['settings']) && is_array($data['settings']) && isset($data['settings']['slug'])) {
		return false;
	}

	return isset($data['presets']) || isset($data['blocks']);
}

/**
 * Import a list of definition items.
 *
 * @param list<mixed> $items
 * @return array{created: int, updated: int, errors: int}
 */
function bl_blocks_import_definition_items(array $items): array
{
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

	if (
		$type === 'block'
		&& isset($item['block_options'])
		&& is_array($item['block_options'])
		&& function_exists('bl_block_options_apply_from_block_definition')
	) {
		bl_block_options_apply_from_block_definition($slug, $item['block_options']);
	}

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
 * Import definitions and/or Block Options from a JSON string.
 *
 * Accepts:
 * - All envelope: { definitions, block_options }
 * - Store-only: { version?, presets, blocks }
 * - Legacy: definition list or single definition object
 *
 * @return array{created: int, updated: int, errors: int, options_presets: int, options_blocks: int}
 */
function bl_blocks_import_json_string(string $raw): array
{
	$empty = [
		'created'         => 0,
		'updated'         => 0,
		'errors'          => 1,
		'options_presets' => 0,
		'options_blocks'  => 0,
	];

	$data = json_decode($raw, true);
	if (!is_array($data)) {
		return $empty;
	}

	$created = 0;
	$updated = 0;
	$errors = 0;
	$options_presets = 0;
	$options_blocks = 0;

	$merge_options = static function ($store) use (&$options_presets, &$options_blocks): void {
		if (!is_array($store) || !function_exists('bl_block_options_merge_store')) {
			return;
		}
		$result = bl_block_options_merge_store($store);
		$options_presets += (int) ($result['presets'] ?? 0);
		$options_blocks += (int) ($result['blocks'] ?? 0);
	};

	// Envelope from Export → All.
	if (!bl_blocks_array_is_list($data) && isset($data['definitions']) && is_array($data['definitions'])) {
		$def_result = bl_blocks_import_definition_items($data['definitions']);
		$created = $def_result['created'];
		$updated = $def_result['updated'];
		$errors = $def_result['errors'];
		if (isset($data['block_options']) && is_array($data['block_options'])) {
			$merge_options($data['block_options']);
		}

		return compact('created', 'updated', 'errors', 'options_presets', 'options_blocks');
	}

	// Full Block Options store only.
	if (bl_blocks_import_is_block_options_store($data)) {
		$merge_options($data);

		return compact('created', 'updated', 'errors', 'options_presets', 'options_blocks');
	}

	// Legacy: single definition or list.
	$items = isset($data['settings']) || isset($data['fields']) || isset($data['type'])
		? [$data]
		: $data;
	if (!is_array($items)) {
		return $empty;
	}

	$def_result = bl_blocks_import_definition_items($items);

	return [
		'created'         => $def_result['created'],
		'updated'         => $def_result['updated'],
		'errors'          => $def_result['errors'],
		'options_presets' => 0,
		'options_blocks'  => 0,
	];
}

/**
 * Persist an import result notice and redirect back to Settings → Import / Export.
 *
 * @param array{created?: int, updated?: int, errors?: int, options_presets?: int, options_blocks?: int} $result
 */
function bl_blocks_redirect_import_result(array $result, string $error_text = ''): void
{
	$created = (int) ($result['created'] ?? 0);
	$updated = (int) ($result['updated'] ?? 0);
	$errors = (int) ($result['errors'] ?? 0);
	$options_presets = (int) ($result['options_presets'] ?? 0);
	$options_blocks = (int) ($result['options_blocks'] ?? 0);
	$defs = $created + $updated;
	$options = $options_presets + $options_blocks;

	if ($error_text !== '') {
		$notice = ['type' => 'error', 'text' => $error_text];
	} else {
		$parts = [];
		if ($defs > 0 || ($errors > 0 && $options === 0)) {
			$parts[] = sprintf(
				/* translators: 1: created count, 2: updated count, 3: error count */
				__('Definitions: %1$d created, %2$d updated, %3$d errors.', 'baselayer-blocks'),
				$created,
				$updated,
				$errors
			);
		}
		if ($options > 0) {
			$parts[] = sprintf(
				/* translators: 1: preset count, 2: block assignment count */
				__('Block options: %1$d presets, %2$d blocks merged.', 'baselayer-blocks'),
				$options_presets,
				$options_blocks
			);
		}

		if ($parts === [] && $errors > 0) {
			$notice = [
				'type' => 'error',
				'text' => __('Import failed.', 'baselayer-blocks'),
			];
		} else {
			$notice = [
				'type' => 'success',
				'text' => $parts !== []
					? implode(' ', $parts)
					: __('Import finished.', 'baselayer-blocks'),
			];
		}
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
		if (!in_array($type, bl_blocks_export_type_keys(), true)) {
			$type = 'all';
		}
		$payload = bl_blocks_build_export_payload($type);
		$filename = $type === 'block_options'
			? 'baselayer-block-options-' . gmdate('Ymd-His') . '.json'
			: 'baselayer-blocks-' . $type . '-' . gmdate('Ymd-His') . '.json';
		nocache_headers();
		header('Content-Type: application/json; charset=utf-8');
		header('Content-Disposition: attachment; filename="' . $filename . '"');
		echo wp_json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
		exit;
	}

	if (isset($_POST['bl_blocks_import']) && check_admin_referer('bl_blocks_import', 'bl_blocks_import_nonce')) {
		if (empty($_FILES['bl_blocks_import_file']['tmp_name'])) {
			bl_blocks_redirect_import_result(
				['created' => 0, 'updated' => 0, 'errors' => 1, 'options_presets' => 0, 'options_blocks' => 0],
				__('No file uploaded.', 'baselayer-blocks')
			);
		}

		// phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- binary upload read then JSON-decoded
		$raw = file_get_contents((string) $_FILES['bl_blocks_import_file']['tmp_name']);
		if (!is_string($raw)) {
			bl_blocks_redirect_import_result(
				['created' => 0, 'updated' => 0, 'errors' => 1, 'options_presets' => 0, 'options_blocks' => 0],
				__('Invalid JSON file.', 'baselayer-blocks')
			);
		}
		$result = bl_blocks_import_json_string($raw);
		$defs = (int) ($result['created'] ?? 0) + (int) ($result['updated'] ?? 0);
		$options = (int) ($result['options_presets'] ?? 0) + (int) ($result['options_blocks'] ?? 0);
		if ($defs === 0 && $options === 0 && (int) ($result['errors'] ?? 0) > 0) {
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
	if (function_exists('bl_blocks_enqueue_script')) {
		bl_blocks_enqueue_script('bl-blocks-settings', 'blocks-settings', [], true);
		wp_localize_script('bl-blocks-settings', 'blBlocksSettings', [
			'i18n' => [
				'importOverwriteTitle'   => __('Import definitions?', 'baselayer-blocks'),
				'importOverwriteMessage' => __('Importing will create or update matching definitions by type and slug, and may merge block options into the live store. This cannot be undone.', 'baselayer-blocks'),
				'importOverwriteConfirm' => __('Import and overwrite', 'baselayer-blocks'),
				'cancel'                 => __('Cancel', 'baselayer-blocks'),
			],
		]);
	}
}
add_action('admin_enqueue_scripts', 'bl_blocks_enqueue_settings_assets');

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

		<div class="bl-forms-builder bl-blocks-settings-shell bl-admin-form">
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
							<p class="description"><?php echo esc_html__('All downloads definitions plus the full Block Options store (presets, core, Baselayer, and ACF). Block options exports the store only. Blocks include each block’s options alongside its fields.', 'baselayer-blocks'); ?></p>
							<form method="post" action="<?php echo esc_url(bl_blocks_settings_url('import-export')); ?>" class="bl-blocks-settings__form">
								<?php wp_nonce_field('bl_blocks_export', 'bl_blocks_export_nonce'); ?>
								<label class="screen-reader-text" for="bl_blocks_export_type"><?php echo esc_html__('Type', 'baselayer-blocks'); ?></label>
								<div class="bl-blocks-settings__row">
									<select name="bl_blocks_export_type" id="bl_blocks_export_type" class="bl-blocks-settings__select">
										<option value="all"><?php echo esc_html__('All', 'baselayer-blocks'); ?></option>
										<option value="block"><?php echo esc_html__('Blocks', 'baselayer-blocks'); ?></option>
										<option value="page_settings"><?php echo esc_html__('Content Fields', 'baselayer-blocks'); ?></option>
										<option value="site_settings"><?php echo esc_html__('Website Fields', 'baselayer-blocks'); ?></option>
										<option value="block_options"><?php echo esc_html__('Block options', 'baselayer-blocks'); ?></option>
									</select>
									<?php submit_button(__('Download JSON', 'baselayer-blocks'), 'primary bl-button', 'bl_blocks_export', false); ?>
								</div>
							</form>
						</section>

						<section class="bl-blocks-settings__panel">
							<h2><?php echo esc_html__('Import', 'baselayer-blocks'); ?></h2>
							<p class="description"><?php echo esc_html__('Upload an All envelope, a definition list, or a Block options store JSON. Definitions match by type and slug (update in place). Block options merge into the live store.', 'baselayer-blocks'); ?></p>
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
