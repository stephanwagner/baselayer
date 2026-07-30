<?php

defined('ABSPATH') || exit;

/**
 * Shared form fields for editorial rights (settings defaults or user profile).
 *
 * @param array  $rights  Sanitized rights array.
 * @param string $name    Base input name, e.g. bl_editorial_defaults or bl_editorial_rights.
 * @param array{
 *   show_pages?: bool,
 *   id_prefix?: string
 * } $args
 */
function bl_editorial_render_rights_fields(array $rights, string $name, array $args = []): void
{
	$show_pages = !array_key_exists('show_pages', $args) || !empty($args['show_pages']);
	$id_prefix = isset($args['id_prefix']) ? (string) $args['id_prefix'] : sanitize_html_class($name);
	$types = bl_editorial_restrictable_post_types();
	$selected_types = $rights['post_types'] ?? [];
	$page_access = $rights['page_access'] ?? 'all';
	$page_ids = array_map('intval', $rights['allowed_page_ids'] ?? []);
	?>
	<table class="form-table bl-editorial-rights" role="presentation" data-bl-editorial-rights>
		<tr>
			<th scope="row"><?= esc_html__('Can edit', 'baselayer-editorial') ?></th>
			<td>
				<fieldset>
					<?php foreach ($types as $slug => $object) :
						$label = $object->labels->name ?? $slug;
						$input_id = $id_prefix . '-type-' . $slug;
						?>
						<label for="<?= esc_attr($input_id) ?>" style="display:block;margin:0 0 6px;">
							<input
								type="checkbox"
								name="<?= esc_attr($name) ?>[post_types][]"
								id="<?= esc_attr($input_id) ?>"
								value="<?= esc_attr($slug) ?>"
								class="bl-editorial-post-type"
								<?= checked(in_array($slug, $selected_types, true), true, false) ?>
							>
							<?= esc_html($label) ?>
						</label>
					<?php endforeach; ?>
				</fieldset>
				<p class="description" style="margin-top:10px;">
					<label for="<?= esc_attr($id_prefix) ?>-own">
						<input
							type="checkbox"
							name="<?= esc_attr($name) ?>[own_posts_only]"
							id="<?= esc_attr($id_prefix) ?>-own"
							value="1"
							<?= checked(!empty($rights['own_posts_only']), true, false) ?>
						>
						<?= esc_html__('Can only edit own posts', 'baselayer-editorial') ?>
					</label>
				</p>
			</td>
		</tr>
		<tr>
			<th scope="row"><?= esc_html__('Publishing', 'baselayer-editorial') ?></th>
			<td>
				<fieldset>
					<label style="display:block;margin:0 0 6px;">
						<input
							type="radio"
							name="<?= esc_attr($name) ?>[publish_mode]"
							value="direct"
							<?= checked(($rights['publish_mode'] ?? 'direct') === 'direct', true, false) ?>
						>
						<?= esc_html__('Publish directly', 'baselayer-editorial') ?>
					</label>
					<label style="display:block;margin:0 0 6px;">
						<input
							type="radio"
							name="<?= esc_attr($name) ?>[publish_mode]"
							value="approval"
							<?= checked(($rights['publish_mode'] ?? '') === 'approval', true, false) ?>
						>
						<?= esc_html__('Require approval', 'baselayer-editorial') ?>
					</label>
				</fieldset>
				<p class="description"><?= esc_html__('When approval is required, editors can save drafts and submit for review. Content stays pending until an administrator publishes it.', 'baselayer-editorial') ?></p>
			</td>
		</tr>
		<?php if ($show_pages) : ?>
		<tr class="bl-editorial-page-access-row">
			<th scope="row"><?= esc_html__('Page access', 'baselayer-editorial') ?></th>
			<td>
				<fieldset>
					<label style="display:block;margin:0 0 6px;">
						<input
							type="radio"
							name="<?= esc_attr($name) ?>[page_access]"
							value="all"
							class="bl-editorial-page-access"
							<?= checked($page_access === 'all', true, false) ?>
						>
						<?= esc_html__('All pages', 'baselayer-editorial') ?>
					</label>
					<label style="display:block;margin:0 0 10px;">
						<input
							type="radio"
							name="<?= esc_attr($name) ?>[page_access]"
							value="selected"
							class="bl-editorial-page-access"
							<?= checked($page_access === 'selected', true, false) ?>
						>
						<?= esc_html__('Selected pages…', 'baselayer-editorial') ?>
					</label>
				</fieldset>
				<div class="bl-editorial-page-picker-wrap" <?= $page_access === 'selected' ? '' : 'hidden' ?>>
					<button type="button" class="button bl-editorial-pick-pages">
						<?= esc_html__('Choose pages', 'baselayer-editorial') ?>
					</button>
					<ul class="bl-editorial-selected-pages" data-empty="<?= esc_attr__('No pages selected.', 'baselayer-editorial') ?>">
						<?php
						foreach ($page_ids as $page_id) {
							$title = get_the_title($page_id);
							if ($title === '') {
								$title = sprintf('#%d', $page_id);
							}
							?>
							<li data-id="<?= (int) $page_id ?>">
								<input type="hidden" name="<?= esc_attr($name) ?>[allowed_page_ids][]" value="<?= (int) $page_id ?>">
								<span class="bl-editorial-selected-pages__title"><?= esc_html($title) ?></span>
								<button type="button" class="button-link bl-editorial-remove-page" aria-label="<?= esc_attr__('Remove', 'baselayer-editorial') ?>">&times;</button>
							</li>
							<?php
						}
						?>
					</ul>
				</div>
			</td>
		</tr>
		<?php endif; ?>
		<tr>
			<th scope="row"><?= esc_html__('Media', 'baselayer-editorial') ?></th>
			<td>
				<label for="<?= esc_attr($id_prefix) ?>-media">
					<input
						type="checkbox"
						name="<?= esc_attr($name) ?>[media_own_only]"
						id="<?= esc_attr($id_prefix) ?>-media"
						value="1"
						<?= checked(!empty($rights['media_own_only']), true, false) ?>
					>
					<?= esc_html__('Only show own uploads', 'baselayer-editorial') ?>
				</label>
				<p class="description"><?= esc_html__('Keeps the media library focused on files this editor uploaded.', 'baselayer-editorial') ?></p>
			</td>
		</tr>
	</table>
	<?php
}

/**
 * Register settings screen (Settings menu standalone, Developer tab in theme).
 */
function bl_editorial_register_settings_page(): void
{
	if (!bl_editorial_user_can_manage_settings()) {
		return;
	}

	if (bl_editorial_loaded_as_plugin()) {
		add_options_page(
			__('Editorial', 'baselayer-editorial'),
			__('Editorial', 'baselayer-editorial'),
			'manage_options',
			'bl-editorial-settings',
			'bl_editorial_render_settings_page'
		);
		return;
	}

	if (!function_exists('bl_developer_settings_page_slug') || !function_exists('bl_developer_tab_position')) {
		return;
	}

	$tabs = function_exists('bl_developer_settings_available_tabs')
		? bl_developer_settings_available_tabs()
		: [];
	if (!isset($tabs['editorial'])) {
		return;
	}

	$slug = bl_developer_settings_page_slug('editorial');
	$label = $tabs['editorial']['label'] ?? 'Editorial';

	add_submenu_page(
		'options-general.php',
		__('Developer settings', 'baselayer') . ' – ' . $label,
		sprintf(__('Developer › %s', 'baselayer'), $label),
		'manage_options',
		$slug,
		'bl_editorial_render_settings_page',
		bl_developer_tab_position('editorial')
	);
}
add_action('admin_menu', 'bl_editorial_register_settings_page', 20);

/**
 * Handle settings save.
 */
function bl_editorial_handle_settings_save(): void
{
	if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
		return;
	}

	$page = isset($_GET['page']) ? sanitize_key((string) $_GET['page']) : '';
	$allowed_pages = ['bl-editorial-settings'];
	if (function_exists('bl_developer_settings_page_slug')) {
		$allowed_pages[] = bl_developer_settings_page_slug('editorial');
	}
	if (!in_array($page, $allowed_pages, true)) {
		return;
	}

	if (!bl_editorial_user_can_manage_settings()) {
		return;
	}

	if (empty($_POST['bl_editorial_settings_nonce']) || !wp_verify_nonce((string) $_POST['bl_editorial_settings_nonce'], 'bl_editorial_save_settings')) {
		return;
	}

	$raw = isset($_POST['bl_editorial_settings']) && is_array($_POST['bl_editorial_settings'])
		? wp_unslash($_POST['bl_editorial_settings'])
		: [];
	$defaults_raw = isset($_POST['bl_editorial_defaults']) && is_array($_POST['bl_editorial_defaults'])
		? wp_unslash($_POST['bl_editorial_defaults'])
		: [];

	bl_editorial_update_settings([
		'approval_recipients' => $raw['approval_recipients'] ?? '',
		'approval_subject'    => $raw['approval_subject'] ?? '',
		'defaults'            => $defaults_raw,
	]);

	set_transient('bl_editorial_settings_saved', '1', 30);

	wp_safe_redirect(admin_url('options-general.php?page=' . $page));
	exit;
}
add_action('admin_init', 'bl_editorial_handle_settings_save', 1);

/**
 * Render settings page (standalone or Developer tab).
 */
function bl_editorial_render_settings_page(): void
{
	if (!bl_editorial_user_can_manage_settings()) {
		wp_die(esc_html__('You do not have permission to manage editorial settings.', 'baselayer-editorial'));
	}

	$settings = bl_editorial_get_settings();
	$saved = get_transient('bl_editorial_settings_saved');
	if ($saved !== false) {
		delete_transient('bl_editorial_settings_saved');
	}

	$is_developer_tab = !bl_editorial_loaded_as_plugin()
		&& function_exists('bl_developer_settings_render_nav');
	?>
	<div class="wrap">
		<?php
		if ($is_developer_tab && function_exists('bl_developer_settings_screen_heading')) {
			bl_developer_settings_screen_heading();
		} else {
			echo '<h1>' . esc_html__('Editorial', 'baselayer-editorial') . '</h1>';
		}

		if ($saved) {
			echo '<div class="notice notice-success is-dismissible"><p>' . esc_html__('Settings saved.', 'baselayer-editorial') . '</p></div>';
		}

		if ($is_developer_tab) {
			bl_developer_settings_render_nav();
		}
		?>

		<form method="post" action="">
			<?php wp_nonce_field('bl_editorial_save_settings', 'bl_editorial_settings_nonce'); ?>

			<h2><?= esc_html__('Approval email', 'baselayer-editorial') ?></h2>
			<p class="description"><?= esc_html__('Sent when an editor submits content for approval. Leave recipients empty to use the site admin email.', 'baselayer-editorial') ?></p>
			<table class="form-table" role="presentation">
				<tr>
					<th scope="row"><label for="bl-editorial-recipients"><?= esc_html__('Recipients', 'baselayer-editorial') ?></label></th>
					<td>
						<textarea
							name="bl_editorial_settings[approval_recipients]"
							id="bl-editorial-recipients"
							class="large-text"
							rows="3"
							placeholder="<?= esc_attr__('editor@example.com, ops@example.com', 'baselayer-editorial') ?>"
						><?= esc_textarea($settings['approval_recipients']) ?></textarea>
						<p class="description"><?= esc_html__('Comma or newline separated email addresses.', 'baselayer-editorial') ?></p>
					</td>
				</tr>
				<tr>
					<th scope="row"><label for="bl-editorial-subject"><?= esc_html__('Subject', 'baselayer-editorial') ?></label></th>
					<td>
						<input
							type="text"
							name="bl_editorial_settings[approval_subject]"
							id="bl-editorial-subject"
							class="regular-text"
							value="<?= esc_attr($settings['approval_subject']) ?>"
							placeholder="<?= esc_attr__('[{site_name}] Approval requested: {title}', 'baselayer-editorial') ?>"
						>
						<p class="description"><?= esc_html__('Optional. Placeholders: {site_name}, {title}, {author}, {type}.', 'baselayer-editorial') ?></p>
					</td>
				</tr>
			</table>

			<h2><?= esc_html__('Defaults for new editors', 'baselayer-editorial') ?></h2>
			<p class="description"><?= esc_html__('Applied when a new editor account is created (or when a user becomes an editor). Existing editors keep their own settings until changed on their profile.', 'baselayer-editorial') ?></p>
			<?php bl_editorial_render_rights_fields($settings['defaults'], 'bl_editorial_defaults', ['id_prefix' => 'bl-editorial-defaults']); ?>

			<?php submit_button(__('Save settings', 'baselayer-editorial')); ?>
		</form>
	</div>
	<?php
}
