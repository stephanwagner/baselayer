<?php

defined('ABSPATH') || exit;

/**
 * Admin menu: custom Blocks screens (no CPT).
 */
function bl_blocks_register_admin_menu(): void
{
	if (!bl_blocks_user_can_manage()) {
		return;
	}

	add_menu_page(
		__('Blocks', 'baselayer-blocks'),
		__('Blocks', 'baselayer-blocks'),
		'manage_options',
		'bl-blocks',
		'bl_blocks_render_admin_page',
		'dashicons-block-default',
		81
	);
}
add_action('admin_menu', 'bl_blocks_register_admin_menu');

/**
 * Route list vs edit.
 */
function bl_blocks_render_admin_page(): void
{
	if (!bl_blocks_user_can_manage()) {
		wp_die(esc_html__('You do not have permission to manage blocks.', 'baselayer-blocks'), 403);
	}

	$action = isset($_GET['action']) ? sanitize_key((string) wp_unslash($_GET['action'])) : 'list';
	$id = isset($_GET['id']) ? (int) $_GET['id'] : 0;

	if ($action === 'edit' || $action === 'new') {
		bl_blocks_render_edit_page($action === 'new' ? 0 : $id);

		return;
	}

	bl_blocks_render_list_page();
}

/**
 * Flash notices after redirect.
 */
function bl_blocks_admin_notices(): void
{
	$screen = function_exists('get_current_screen') ? get_current_screen() : null;
	if (!$screen || $screen->id !== 'toplevel_page_bl-blocks') {
		return;
	}

	$notice = get_transient('bl_blocks_admin_notice');
	if (!is_array($notice) || empty($notice['message'])) {
		return;
	}
	delete_transient('bl_blocks_admin_notice');
	$type = sanitize_key((string) ($notice['type'] ?? 'success'));
	if (!in_array($type, ['success', 'error', 'warning', 'info'], true)) {
		$type = 'success';
	}
	printf(
		'<div class="notice notice-%1$s is-dismissible"><p>%2$s</p></div>',
		esc_attr($type),
		esc_html((string) $notice['message'])
	);
}
add_action('admin_notices', 'bl_blocks_admin_notices');

/**
 * Blocks list (or empty state).
 */
function bl_blocks_render_list_page(): void
{
	$blocks = bl_blocks_list();
	$new_url = admin_url('admin.php?page=bl-blocks&action=new');
	?>
	<div class="wrap bl-blocks-admin">
		<h1 class="wp-heading-inline"><?= esc_html__('Blocks', 'baselayer-blocks') ?></h1>
		<?php if ($blocks !== []) : ?>
			<a href="<?= esc_url($new_url) ?>" class="page-title-action"><?= esc_html__('Add New', 'baselayer-blocks') ?></a>
		<?php endif; ?>
		<hr class="wp-header-end">

		<?php if ($blocks === []) : ?>
			<div class="bl-blocks-empty" style="max-width: 520px; margin-top: 24px;">
				<p><?= esc_html__("You haven't created any blocks yet.", 'baselayer-blocks') ?></p>
				<p>
					<a href="<?= esc_url($new_url) ?>" class="button button-primary">
						<?= esc_html__('Create your first block', 'baselayer-blocks') ?>
					</a>
				</p>
			</div>
		<?php else : ?>
			<table class="wp-list-table widefat fixed striped" style="margin-top: 12px;">
				<thead>
					<tr>
						<th scope="col"><?= esc_html__('Title', 'baselayer-blocks') ?></th>
					</tr>
				</thead>
				<tbody>
					<?php foreach ($blocks as $block) : ?>
						<?php $edit = admin_url('admin.php?page=bl-blocks&action=edit&id=' . (int) $block['id']); ?>
						<tr>
							<td>
								<strong>
									<a href="<?= esc_url($edit) ?>">
										<?= esc_html($block['title'] !== '' ? $block['title'] : __('(no title)', 'baselayer-blocks')) ?>
									</a>
								</strong>
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
 * New / edit block: title + Save, Block creator TODO.
 */
function bl_blocks_render_edit_page(int $id): void
{
	$is_new = $id <= 0;
	$block = $is_new ? null : bl_blocks_get($id);
	if (!$is_new && $block === null) {
		echo '<div class="wrap"><div class="notice notice-error"><p>'
			. esc_html__('Block not found.', 'baselayer-blocks')
			. '</p></div></div>';

		return;
	}

	$title = $block['title'] ?? '';
	$list_url = admin_url('admin.php?page=bl-blocks');
	?>
	<div class="wrap bl-blocks-admin bl-blocks-edit">
		<h1><?= esc_html($is_new ? __('Add Block', 'baselayer-blocks') : __('Edit Block', 'baselayer-blocks')) ?></h1>
		<p><a href="<?= esc_url($list_url) ?>">&larr; <?= esc_html__('Blocks', 'baselayer-blocks') ?></a></p>

		<form method="post" action="<?= esc_url(admin_url('admin-post.php')) ?>" class="bl-blocks-edit-form">
			<input type="hidden" name="action" value="bl_blocks_save">
			<input type="hidden" name="block_id" value="<?= esc_attr((string) $id) ?>">
			<?php wp_nonce_field('bl_blocks_save', 'bl_blocks_save_nonce'); ?>

			<div class="bl-blocks-edit__title-row" style="display: flex; gap: 8px; align-items: center; margin: 16px 0;">
				<label class="screen-reader-text" for="bl-blocks-title"><?= esc_html__('Title', 'baselayer-blocks') ?></label>
				<input
					type="text"
					name="title"
					id="bl-blocks-title"
					class="large-text"
					value="<?= esc_attr($title) ?>"
					placeholder="<?= esc_attr__('Add title', 'baselayer-blocks') ?>"
					required
					style="flex: 1; font-size: 1.5em; padding: 6px 10px; height: auto;"
				>
				<button type="submit" class="button button-primary button-large">
					<?= esc_html__('Save', 'baselayer-blocks') ?>
				</button>
			</div>

			<div class="notice notice-info inline" style="margin: 16px 0 0; padding: 12px 16px;">
				<p style="margin: 0;">
					<strong><?= esc_html__('Block creator', 'baselayer-blocks') ?></strong>
					— <?= esc_html__('Coming soon. The field builder will live here.', 'baselayer-blocks') ?>
				</p>
			</div>
		</form>
	</div>
	<?php
}

/**
 * admin-post.php?action=bl_blocks_save
 */
function bl_blocks_handle_save(): void
{
	if (!bl_blocks_user_can_manage()) {
		wp_die(esc_html__('You do not have permission to manage blocks.', 'baselayer-blocks'), 403);
	}
	check_admin_referer('bl_blocks_save', 'bl_blocks_save_nonce');

	$id = isset($_POST['block_id']) ? (int) $_POST['block_id'] : 0;
	$title = isset($_POST['title']) ? sanitize_text_field(wp_unslash((string) $_POST['title'])) : '';

	$result = bl_blocks_save([
		'id' => $id,
		'title' => $title,
		'status' => 'draft',
	]);

	if (is_wp_error($result)) {
		set_transient('bl_blocks_admin_notice', [
			'type' => 'error',
			'message' => $result->get_error_message(),
		], 30);
		$url = $id > 0
			? admin_url('admin.php?page=bl-blocks&action=edit&id=' . $id)
			: admin_url('admin.php?page=bl-blocks&action=new');
		wp_safe_redirect($url);
		exit;
	}

	set_transient('bl_blocks_admin_notice', [
		'type' => 'success',
		'message' => __('Block saved.', 'baselayer-blocks'),
	], 30);
	wp_safe_redirect(admin_url('admin.php?page=bl-blocks&action=edit&id=' . (int) $result));
	exit;
}
add_action('admin_post_bl_blocks_save', 'bl_blocks_handle_save');
