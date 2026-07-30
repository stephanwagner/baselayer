<?php

defined('ABSPATH') || exit;

/**
 * Whether the current user may edit editorial rights on a profile.
 */
function bl_editorial_current_user_can_edit_profile_rights(): bool
{
	return current_user_can('edit_users') && current_user_can('manage_options');
}

/**
 * Render editorial rights on user profile (editors only).
 *
 * @param WP_User $user
 */
function bl_editorial_render_user_profile_fields(WP_User $user): void
{
	if (!bl_editorial_current_user_can_edit_profile_rights()) {
		return;
	}

	if (!bl_editorial_user_is_editor((int) $user->ID)) {
		return;
	}

	$rights = bl_editorial_get_user_rights((int) $user->ID);
	$has_custom = $rights !== null;
	if ($rights === null) {
		$rights = bl_editorial_get_settings()['defaults'];
	}

	$settings_url = bl_editorial_loaded_as_plugin()
		? admin_url('options-general.php?page=bl-editorial-settings')
		: (function_exists('bl_developer_settings_page_slug')
			? admin_url('options-general.php?page=' . bl_developer_settings_page_slug('editorial'))
			: '');
	?>
	<hr class="bl-editorial-profile-hr" style="margin-top: 24px;">
	<h2><?= esc_html__('Editorial rights', 'baselayer-editorial') ?></h2>
	<p class="description">
		<?= esc_html__('Restrict what this editor can access. When restrictions are off, they behave like a normal WordPress editor.', 'baselayer-editorial') ?>
		<?php if ($settings_url !== '') : ?>
			<a href="<?= esc_url($settings_url) ?>"><?= esc_html__('Site defaults & approval email', 'baselayer-editorial') ?></a>
		<?php endif; ?>
	</p>

	<?php wp_nonce_field('bl_editorial_save_user_rights', 'bl_editorial_user_rights_nonce'); ?>

	<table class="form-table" role="presentation">
		<tr>
			<th scope="row"><?= esc_html__('Restrictions', 'baselayer-editorial') ?></th>
			<td>
				<label for="bl-editorial-enable-rights">
					<input
						type="checkbox"
						name="bl_editorial_enable_rights"
						id="bl-editorial-enable-rights"
						value="1"
						class="bl-editorial-enable-restrictions"
						data-bl-editorial-fields="bl-editorial-rights-fields"
						data-bl-editorial-has-saved="<?= $has_custom ? '1' : '0' ?>"
						<?= checked($has_custom, true, false) ?>
					>
					<?= esc_html__('Enable restrictions for this editor', 'baselayer-editorial') ?>
				</label>
				<p class="description"><?= esc_html__('Limit which content this editor can access, how they publish, and what they see in the media library.', 'baselayer-editorial') ?></p>
			</td>
		</tr>
	</table>

	<div id="bl-editorial-rights-fields" class="bl-editorial-restrictions-fields" <?= $has_custom ? '' : 'hidden' ?>>
		<?php bl_editorial_render_rights_fields($rights, 'bl_editorial_rights', ['id_prefix' => 'bl-editorial-user']); ?>
		<p>
			<button type="button" class="button bl-editorial-apply-defaults">
				<?= esc_html__('Reset to site defaults', 'baselayer-editorial') ?>
			</button>
		</p>
		<script type="application/json" id="bl-editorial-site-defaults"><?= wp_json_encode(bl_editorial_get_settings()['defaults']) ?></script>
	</div>
	<?php
}
add_action('show_user_profile', 'bl_editorial_render_user_profile_fields');
add_action('edit_user_profile', 'bl_editorial_render_user_profile_fields');

/**
 * Save editorial rights from the user profile.
 *
 * @param int $user_id
 */
function bl_editorial_save_user_profile_fields(int $user_id): void
{
	if (!bl_editorial_current_user_can_edit_profile_rights()) {
		return;
	}

	if (!bl_editorial_user_is_editor($user_id)) {
		return;
	}

	if (empty($_POST['bl_editorial_user_rights_nonce']) || !wp_verify_nonce((string) $_POST['bl_editorial_user_rights_nonce'], 'bl_editorial_save_user_rights')) {
		return;
	}

	$enabled = !empty($_POST['bl_editorial_enable_rights']);
	if (!$enabled) {
		// Do not persist rights while disabled — next enable starts from site defaults.
		bl_editorial_clear_user_rights($user_id);
		return;
	}

	$raw = isset($_POST['bl_editorial_rights']) && is_array($_POST['bl_editorial_rights'])
		? wp_unslash($_POST['bl_editorial_rights'])
		: [];

	bl_editorial_set_user_rights($user_id, $raw);
}
add_action('personal_options_update', 'bl_editorial_save_user_profile_fields');
add_action('edit_user_profile_update', 'bl_editorial_save_user_profile_fields');
