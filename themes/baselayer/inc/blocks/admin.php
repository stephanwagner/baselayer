<?php

defined('ABSPATH') || exit;

/**
 * Register Blocks admin menu and submenus when Block Creator feature is enabled.
 */
function bl_block_creator_register_admin_menu(): void
{
	if (!bl_block_creator_enabled() || !current_user_can('manage_options')) {
		return;
	}

	add_menu_page(
		__('Blocks', 'baselayer'),
		__('Blocks', 'baselayer'),
		'manage_options',
		'bl-blocks',
		'bl_blocks_render_library_page',
		'dashicons-block-default',
		81
	);

	add_submenu_page(
		'bl-blocks',
		__('Blocks', 'baselayer'),
		__('Blocks', 'baselayer'),
		'manage_options',
		'bl-blocks',
		'bl_blocks_render_library_page'
	);

	add_submenu_page(
		'bl-blocks',
		__('Block options', 'baselayer'),
		__('Block options', 'baselayer'),
		'manage_options',
		'bl-blocks-options',
		'bl_blocks_render_options_page'
	);

	add_submenu_page(
		'bl-blocks',
		__('Variables', 'baselayer'),
		__('Variables', 'baselayer'),
		'manage_options',
		'bl-blocks-variables',
		'bl_blocks_render_variables_page'
	);

	add_submenu_page(
		'bl-blocks',
		__('Menus', 'baselayer'),
		__('Menus', 'baselayer'),
		'manage_options',
		'bl-blocks-menus',
		'bl_blocks_render_menus_page'
	);

	add_submenu_page(
		'bl-blocks',
		__('UI Dev', 'baselayer'),
		__('UI Dev', 'baselayer'),
		'manage_options',
		'bl-blocks-ui-dev',
		'bl_blocks_render_ui_dev_page'
	);
}
add_action('admin_menu', 'bl_block_creator_register_admin_menu');

/**
 * Shared under-construction admin screen.
 */
function bl_blocks_render_under_construction(string $title, string $description = ''): void
{
	if (!bl_block_creator_enabled() || !current_user_can('manage_options')) {
		wp_die(esc_html__('You do not have sufficient permissions to access this page.', 'baselayer'));
	}
	?>
	<div class="wrap">
		<h1><?= esc_html($title) ?></h1>
		<?php if ($description !== '') : ?>
			<p class="description"><?= esc_html($description) ?></p>
		<?php endif; ?>
		<div class="notice notice-info inline" style="margin-top: 16px;">
			<p><strong><?= esc_html__('Under construction.', 'baselayer') ?></strong>
				<?= esc_html__('This section is not available yet.', 'baselayer') ?></p>
		</div>
	</div>
	<?php
}

/**
 * Handle Blocks library form posts.
 */
function bl_blocks_handle_library_post(): void
{
	if (!bl_block_creator_enabled() || !current_user_can('manage_options')) {
		return;
	}

	if (empty($_POST['bl_blocks_action']) || empty($_POST['_wpnonce'])) {
		return;
	}

	if (!wp_verify_nonce(sanitize_text_field(wp_unslash((string) $_POST['_wpnonce'])), 'bl_blocks_save')) {
		return;
	}

	$action = sanitize_key((string) $_POST['bl_blocks_action']);

	if ($action === 'delete') {
		$slug = sanitize_key((string) ($_POST['slug'] ?? ''));
		if ($slug !== '') {
			bl_block_creator_delete_block($slug);
			set_transient('bl_blocks_notice', [
				'type' => 'success',
				'message' => __('Block deleted.', 'baselayer'),
			], 30);
		}
		wp_safe_redirect(admin_url('admin.php?page=bl-blocks'));
		exit;
	}

	if ($action === 'save') {
		$title = sanitize_text_field(wp_unslash((string) ($_POST['title'] ?? '')));
		$slug = sanitize_key(wp_unslash((string) ($_POST['slug'] ?? '')));
		$previous = sanitize_key(wp_unslash((string) ($_POST['previous_slug'] ?? '')));
		$fields_json = wp_unslash((string) ($_POST['fields_json'] ?? '[]'));
		$fields = json_decode($fields_json, true);
		if (!is_array($fields)) {
			$fields = [];
		}
		$options_stack_json = wp_unslash((string) ($_POST['options_stack_json'] ?? '[]'));
		$options_stack = json_decode($options_stack_json, true);
		if (!is_array($options_stack)) {
			$options_stack = [];
		}

		if ($title === '' || $slug === '') {
			set_transient('bl_blocks_notice', [
				'type' => 'error',
				'message' => __('Name and slug are required.', 'baselayer'),
			], 30);
			$url = $previous !== ''
				? admin_url('admin.php?page=bl-blocks&action=edit&block=' . rawurlencode($previous))
				: admin_url('admin.php?page=bl-blocks&action=new');
			wp_safe_redirect($url);
			exit;
		}

		$ok = bl_block_creator_save_block([
			'title' => $title,
			'slug' => $slug,
			'fields' => $fields,
			'options_stack' => $options_stack,
		], $previous);

		set_transient('bl_blocks_notice', [
			'type' => $ok ? 'success' : 'error',
			'message' => $ok ? __('Block saved.', 'baselayer') : __('Could not save block.', 'baselayer'),
		], 30);

		wp_safe_redirect(admin_url('admin.php?page=bl-blocks&action=edit&block=' . rawurlencode($slug)));
		exit;
	}
}
add_action('admin_init', 'bl_blocks_handle_library_post');

/**
 * Blocks library — list or edit custom blocks.
 */
function bl_blocks_render_library_page(): void
{
	if (!bl_block_creator_enabled() || !current_user_can('manage_options')) {
		wp_die(esc_html__('You do not have sufficient permissions to access this page.', 'baselayer'));
	}

	$action = isset($_GET['action']) ? sanitize_key((string) wp_unslash($_GET['action'])) : '';
	if ($action === 'new' || $action === 'edit') {
		bl_blocks_render_block_edit_page($action === 'new' ? '' : sanitize_key((string) ($_GET['block'] ?? '')));
		return;
	}

	$notice = get_transient('bl_blocks_notice');
	if ($notice !== false) {
		delete_transient('bl_blocks_notice');
	}

	$blocks = bl_block_creator_get_blocks();
	?>
	<div class="wrap">
		<h1 class="wp-heading-inline"><?= esc_html__('Blocks', 'baselayer') ?></h1>
		<a href="<?= esc_url(admin_url('admin.php?page=bl-blocks&action=new')) ?>" class="page-title-action"><?= esc_html__('Add New', 'baselayer') ?></a>
		<hr class="wp-header-end">

		<p class="description"><?= esc_html__('Create custom Gutenberg blocks. Proof of concept — fields are edited in the sidebar.', 'baselayer') ?></p>

		<?php if (is_array($notice) && !empty($notice['message'])) : ?>
			<div class="notice notice-<?= esc_attr((string) ($notice['type'] ?? 'success')) ?> is-dismissible">
				<p><?= esc_html((string) $notice['message']) ?></p>
			</div>
		<?php endif; ?>

		<?php if ($blocks === []) : ?>
			<p><?= esc_html__('No custom blocks yet.', 'baselayer') ?></p>
		<?php else : ?>
			<table class="widefat striped" style="max-width: 720px; margin-top: 12px;">
				<thead>
					<tr>
						<th><?= esc_html__('Name', 'baselayer') ?></th>
						<th><?= esc_html__('Slug', 'baselayer') ?></th>
						<th><?= esc_html__('Fields', 'baselayer') ?></th>
						<th><?= esc_html__('Options', 'baselayer') ?></th>
						<th></th>
					</tr>
				</thead>
				<tbody>
					<?php foreach ($blocks as $block) : ?>
						<tr>
							<td>
								<a href="<?= esc_url(admin_url('admin.php?page=bl-blocks&action=edit&block=' . rawurlencode($block['slug']))) ?>">
									<strong><?= esc_html($block['title']) ?></strong>
								</a>
							</td>
							<td><code>baselayer/<?= esc_html($block['slug']) ?></code></td>
							<td><?= esc_html((string) count($block['fields'])) ?></td>
							<td><?= esc_html((string) count($block['options'] ?? [])) ?></td>
							<td>
								<form method="post" style="display:inline;" onsubmit="return confirm('<?= esc_js(__('Delete this block?', 'baselayer')) ?>');">
									<?php wp_nonce_field('bl_blocks_save'); ?>
									<input type="hidden" name="bl_blocks_action" value="delete">
									<input type="hidden" name="slug" value="<?= esc_attr($block['slug']) ?>">
									<button type="submit" class="button-link-delete"><?= esc_html__('Delete', 'baselayer') ?></button>
								</form>
							</td>
						</tr>
					<?php endforeach; ?>
				</tbody>
			</table>
		<?php endif; ?>
	</div>
	<?php
}

/**
 * New / edit block form with Field builder.
 */
function bl_blocks_render_block_edit_page(string $slug): void
{
	$is_new = $slug === '';
	$block = $is_new ? null : bl_block_creator_get_block($slug);
	if (!$is_new && $block === null) {
		wp_die(esc_html__('Block not found.', 'baselayer'));
	}

	$notice = get_transient('bl_blocks_notice');
	if ($notice !== false) {
		delete_transient('bl_blocks_notice');
	}

	$title = $block['title'] ?? '';
	$slug_value = $block['slug'] ?? '';
	$fields = $block['fields'] ?? [];
	$options_stack = $block['options_stack'] ?? [];
	$fields_json = wp_json_encode($fields, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
	if (!is_string($fields_json)) {
		$fields_json = '[]';
	}
	$options_stack_json = wp_json_encode($options_stack, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
	if (!is_string($options_stack_json)) {
		$options_stack_json = '[]';
	}
	?>
	<div class="wrap">
		<h1><?= esc_html($is_new ? __('Add New Block', 'baselayer') : __('Edit Block', 'baselayer')) ?></h1>
		<p><a href="<?= esc_url(admin_url('admin.php?page=bl-blocks')) ?>">&larr; <?= esc_html__('Back to Blocks', 'baselayer') ?></a></p>

		<?php if (is_array($notice) && !empty($notice['message'])) : ?>
			<div class="notice notice-<?= esc_attr((string) ($notice['type'] ?? 'success')) ?> is-dismissible">
				<p><?= esc_html((string) $notice['message']) ?></p>
			</div>
		<?php endif; ?>

		<form method="post" id="bl-block-edit-form" class="bl-block-edit-form">
			<?php wp_nonce_field('bl_blocks_save'); ?>
			<input type="hidden" name="bl_blocks_action" value="save">
			<input type="hidden" name="previous_slug" value="<?= esc_attr($slug_value) ?>">
			<input type="hidden" name="fields_json" id="bl-block-fields-json" value="<?= esc_attr($fields_json) ?>">
			<input type="hidden" name="options_stack_json" id="bl-block-options-stack-json" value="<?= esc_attr($options_stack_json) ?>">

			<table class="form-table" role="presentation" style="max-width: 720px;">
				<tr>
					<th scope="row"><label for="bl-block-title"><?= esc_html__('Name', 'baselayer') ?></label></th>
					<td>
						<input type="text" class="regular-text" name="title" id="bl-block-title" value="<?= esc_attr($title) ?>" required>
					</td>
				</tr>
				<tr>
					<th scope="row"><label for="bl-block-slug"><?= esc_html__('Slug', 'baselayer') ?></label></th>
					<td>
						<input type="text" class="regular-text" name="slug" id="bl-block-slug" value="<?= esc_attr($slug_value) ?>" required pattern="[a-z0-9_\-]+">
						<p class="description"><?= esc_html__('Block name will be baselayer/{slug}.', 'baselayer') ?></p>
					</td>
				</tr>
			</table>

			<h2><?= esc_html__('Fields', 'baselayer') ?></h2>
			<p class="description"><?= esc_html__('Content controls in the block sidebar.', 'baselayer') ?></p>
			<div id="bl-field-builder" class="bl-field-builder-ui-dev__mount" style="max-width: 880px;"></div>

			<h2><?= esc_html__('Options', 'baselayer') ?></h2>
			<p class="description"><?= esc_html__('Shared presets and custom options in one list. Drag to set order. Visibility (hide) is always available.', 'baselayer') ?></p>
			<div id="bl-options-stack" class="bl-field-builder-ui-dev__mount" style="max-width: 880px;"></div>

			<p class="submit">
				<?php submit_button($is_new ? __('Create block', 'baselayer') : __('Save block', 'baselayer'), 'primary', 'submit', false); ?>
			</p>
		</form>
	</div>
	<?php
}

/**
 * Block options — sidebar options presets and assignments.
 */
function bl_blocks_render_options_page(): void
{
	bl_blocks_render_under_construction(
		__('Block options', 'baselayer'),
		__('Assign sidebar options to core and custom blocks.', 'baselayer')
	);
}

/**
 * Variables — page and block values.
 */
function bl_blocks_render_variables_page(): void
{
	bl_blocks_render_under_construction(
		__('Variables', 'baselayer'),
		__('Assign variables to pages and blocks.', 'baselayer')
	);
}

/**
 * Menus — menu item options.
 */
function bl_blocks_render_menus_page(): void
{
	bl_blocks_render_under_construction(
		__('Menus', 'baselayer'),
		__('Assign options to menu items.', 'baselayer')
	);
}

/**
 * UI Dev — Field builder sandbox.
 */
function bl_blocks_render_ui_dev_page(): void
{
	if (!bl_block_creator_enabled() || !current_user_can('manage_options')) {
		wp_die(esc_html__('You do not have sufficient permissions to access this page.', 'baselayer'));
	}
	?>
	<div class="wrap">
		<h1><?= esc_html__('UI Dev', 'baselayer') ?></h1>
		<p class="description">
			<?= esc_html__('Work-in-progress Field builder sandbox. Use Inspect output to review the serialized schema.', 'baselayer') ?>
		</p>

		<div class="bl-field-builder-ui-dev">
			<div id="bl-field-builder" class="bl-field-builder-ui-dev__mount"></div>

			<p class="bl-field-builder-ui-dev__actions">
				<button type="button" class="button button-primary" id="bl-field-builder-inspect">
					<?= esc_html__('Inspect output', 'baselayer') ?>
				</button>
			</p>

			<label for="bl-field-builder-output" class="screen-reader-text"><?= esc_html__('Field builder output', 'baselayer') ?></label>
			<textarea id="bl-field-builder-output" class="large-text code bl-field-builder-ui-dev__output" rows="16" readonly placeholder="<?= esc_attr__('Click Inspect output to dump the current field schema as JSON.', 'baselayer') ?>"></textarea>
		</div>
	</div>
	<?php
}

/**
 * Resolve built field-builder admin script path.
 *
 * @return array{rel: string, path: string, uri: string, ver: string}|null
 */
function bl_blocks_field_builder_script(): ?array
{
	$min = function_exists('bl_is_debug') && bl_is_debug() ? '' : '.min';
	$rel = '/assets/js/field-builder-admin' . $min . '.js';
	$path = get_template_directory() . $rel;
	if (!is_readable($path)) {
		$rel = '/assets/js/field-builder-admin.js';
		$path = get_template_directory() . $rel;
	}
	if (!is_readable($path)) {
		return null;
	}

	return [
		'rel' => $rel,
		'path' => $path,
		'uri' => get_template_directory_uri() . $rel,
		'ver' => (string) filemtime($path),
	];
}

/**
 * Enqueue Field builder on Blocks edit + UI Dev.
 *
 * @param string $hook_suffix
 */
function bl_blocks_enqueue_field_builder_assets(string $hook_suffix): void
{
	if (!bl_block_creator_enabled() || !current_user_can('manage_options')) {
		return;
	}

	$page = isset($_GET['page']) ? sanitize_key((string) wp_unslash($_GET['page'])) : '';
	$action = isset($_GET['action']) ? sanitize_key((string) wp_unslash($_GET['action'])) : '';

	$is_ui_dev = $page === 'bl-blocks-ui-dev';
	$is_block_edit = $page === 'bl-blocks' && ($action === 'new' || $action === 'edit');
	if (!$is_ui_dev && !$is_block_edit) {
		return;
	}

	$script = bl_blocks_field_builder_script();
	if ($script === null) {
		return;
	}

	$handle = 'baselayer-field-builder-admin';
	wp_enqueue_script($handle, $script['uri'], [], $script['ver'], true);

	$i18n = [
		'addField' => __('Add field', 'baselayer'),
		'empty' => __('No fields yet. Add a field to get started.', 'baselayer'),
		'initialFields' => [],
	];

	if ($is_ui_dev) {
		wp_localize_script($handle, 'blFieldBuilderUiDev', $i18n);
	}

	if ($is_block_edit) {
		$preset_choices = function_exists('bl_block_options_preset_choices')
			? bl_block_options_preset_choices()
			: [];
		$presets_for_js = [];
		foreach ($preset_choices as $slug => $label) {
			$presets_for_js[] = [
				'slug' => $slug,
				'label' => $label,
			];
		}
		wp_localize_script($handle, 'blFieldBuilderBlocksAdmin', array_merge($i18n, [
			'addOption' => __('Add option', 'baselayer'),
			'emptyOptionsStack' => __('No options yet. Add a preset or a custom option.', 'baselayer'),
			'initialOptionsStack' => [],
			'presets' => $presets_for_js,
			'addPreset' => __('Add preset', 'baselayer'),
			'removePreset' => __('Remove', 'baselayer'),
			'presetBadge' => __('Preset', 'baselayer'),
		]));
	}
}
add_action('admin_enqueue_scripts', 'bl_blocks_enqueue_field_builder_assets');

/**
 * Sanitize and save UI overlay config (for upcoming Block options UI).
 *
 * @param mixed $value
 * @return array<string, mixed>
 */
function bl_block_creator_sanitize_ui_config($value): array
{
	if (!is_array($value)) {
		return [];
	}

	$out = [
		'presets' => [],
		'assignments' => [],
		'blocks' => [],
	];

	if (isset($value['presets']) && is_array($value['presets'])) {
		foreach ($value['presets'] as $slug => $preset) {
			$slug = sanitize_key((string) $slug);
			if ($slug === '' || !is_array($preset)) {
				continue;
			}
			$controls = $preset['controls'] ?? [];
			if (!is_array($controls)) {
				$controls = [];
			}
			$out['presets'][$slug] = [
				'label' => sanitize_text_field((string) ($preset['label'] ?? $slug)),
				'controls' => array_values(array_filter($controls, 'is_array')),
			];
		}
	}

	if (isset($value['assignments']) && is_array($value['assignments'])) {
		foreach ($value['assignments'] as $assignment) {
			if (!is_array($assignment)) {
				continue;
			}
			$preset = sanitize_key((string) ($assignment['preset'] ?? ''));
			if ($preset === '') {
				continue;
			}
			$blocks = $assignment['blocks'] ?? [];
			if ($blocks === 'all' || $blocks === '*') {
				$blocks_out = 'all';
			} elseif (is_string($blocks)) {
				$blocks_out = array_values(array_filter(array_map('trim', explode(',', $blocks))));
			} elseif (is_array($blocks)) {
				$blocks_out = array_values(array_filter(array_map('strval', $blocks)));
			} else {
				$blocks_out = [];
			}
			$row = [
				'preset' => $preset,
				'blocks' => $blocks_out,
				'target' => 'block_option',
			];
			if (isset($assignment['exclude']) && is_array($assignment['exclude'])) {
				$row['exclude'] = array_values(array_filter(array_map('strval', $assignment['exclude'])));
			}
			$out['assignments'][] = $row;
		}
	}

	if (isset($value['blocks']) && is_array($value['blocks'])) {
		foreach ($value['blocks'] as $name => $extra) {
			$name = (string) $name;
			if ($name === '' || !is_array($extra)) {
				continue;
			}
			$controls = $extra['controls'] ?? [];
			if (!is_array($controls)) {
				$controls = [];
			}
			$out['blocks'][$name] = [
				'controls' => array_values(array_filter($controls, 'is_array')),
			];
		}
	}

	return $out;
}
