<?php

defined('ABSPATH') || exit;

/**
 * Website (Site Settings) admin page.
 */
function bl_blocks_render_website_page(): void
{
	if (!bl_blocks_user_can_manage()) {
		wp_die(esc_html__('You do not have permission to manage site settings.', 'baselayer-blocks'), 403);
	}

	$definitions = bl_blocks_query_definitions('site_settings', true);

	if (isset($_POST['bl_blocks_website_nonce'])
		&& wp_verify_nonce((string) $_POST['bl_blocks_website_nonce'], 'bl_blocks_save_website')
		&& isset($_POST['bl_blocks_definition_id'])
	) {
		$def_id = (int) $_POST['bl_blocks_definition_id'];
		$post = get_post($def_id);
		if ($post instanceof WP_Post && $post->post_type === BL_BLOCK_POST_TYPE
			&& $post->post_status === 'publish'
			&& bl_blocks_get_definition_type($def_id) === 'site_settings'
		) {
			$config = bl_blocks_get_config($def_id);
			if (empty($config['settings']['active'])) {
				$config = null;
			}
		} else {
			$config = null;
		}
		if ($config !== null) {
			$slug = bl_blocks_definition_slug($def_id, $config['settings']);
			$raw = isset($_POST['bl_blocks_values']) && is_array($_POST['bl_blocks_values'])
				? wp_unslash($_POST['bl_blocks_values'])
				: [];
			$values = bl_blocks_sanitize_values($config['fields'], $raw);
			update_option(bl_blocks_site_option_key($slug), $values, false);
			echo '<div class="notice notice-success is-dismissible"><p>'
				. esc_html__('Settings saved.', 'baselayer-blocks')
				. '</p></div>';
		}
	}

	$active = isset($_GET['tab']) ? (int) $_GET['tab'] : 0;
	if ($active <= 0 && $definitions !== []) {
		$active = (int) $definitions[0]->ID;
	}
	$valid_ids = array_map(static fn(WP_Post $p) => (int) $p->ID, $definitions);
	if (!in_array($active, $valid_ids, true) && $definitions !== []) {
		$active = (int) $definitions[0]->ID;
	}

	echo '<div class="wrap bl-blocks-website">';
	echo '<h1>' . esc_html__('Website', 'baselayer-blocks') . '</h1>';

	if ($definitions === []) {
		echo '<p>' . esc_html__('No active website settings yet. Create one under Website Fields.', 'baselayer-blocks') . '</p>';
		echo '<p><a class="button button-primary" href="' . esc_url(admin_url('post-new.php?post_type=' . BL_BLOCK_POST_TYPE . '&bl_block_type=site_settings')) . '">';
		echo esc_html__('Add fields', 'baselayer-blocks');
		echo '</a></p></div>';

		return;
	}

	$show_tabs = count($definitions) > 1;
	echo '<div class="bl-blocks-website__layout' . ($show_tabs ? '' : ' bl-blocks-website__layout--single') . '">';

	if ($show_tabs) {
		echo '<nav class="bl-blocks-website__tabs" aria-label="' . esc_attr__('Website', 'baselayer-blocks') . '">';
		echo '<ul>';
		foreach ($definitions as $def) {
			$config = bl_blocks_get_config((int) $def->ID);
			$label = (string) ($config['settings']['menu_label'] ?? '');
			if ($label === '') {
				$label = $def->post_title !== '' ? $def->post_title : __('Untitled', 'baselayer-blocks');
			}
			$url = add_query_arg(
				[
					'page' => 'bl-blocks-website',
					'tab'  => (int) $def->ID,
				],
				admin_url('admin.php')
			);
			$is_active = (int) $def->ID === $active;
			printf(
				'<li><a class="%s" href="%s">%s</a></li>',
				$is_active ? 'is-active' : '',
				esc_url($url),
				esc_html($label)
			);
		}
		echo '</ul></nav>';
	}

	echo '<div class="bl-blocks-website__main">';
	$current = get_post($active);
	if ($current instanceof WP_Post) {
		$config = bl_blocks_get_config((int) $current->ID);
		$slug = bl_blocks_definition_slug((int) $current->ID, $config['settings']);
		$values = get_option(bl_blocks_site_option_key($slug), []);
		if (!is_array($values)) {
			$values = [];
		}
		$title = (string) ($config['settings']['menu_label'] ?? '');
		if ($title === '') {
			$title = $current->post_title !== '' ? $current->post_title : __('Settings', 'baselayer-blocks');
		}
		echo '<h2 class="bl-blocks-website__title">' . esc_html($title) . '</h2>';
		if (!empty($config['settings']['description'])) {
			echo '<p class="description">' . esc_html((string) $config['settings']['description']) . '</p>';
		}
		echo '<form method="post" action="">';
		wp_nonce_field('bl_blocks_save_website', 'bl_blocks_website_nonce');
		echo '<input type="hidden" name="bl_blocks_definition_id" value="' . esc_attr((string) $current->ID) . '">';
		// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped inside renderer.
		echo bl_blocks_render_admin_fields($config['fields'], $values);
		echo '<p class="submit"><button type="submit" class="button button-primary">' . esc_html__('Save Changes', 'baselayer-blocks') . '</button></p>';
		echo '</form>';
	}
	echo '</div></div></div>';
}

/**
 * Enqueue Website page styles.
 *
 * @param string $hook
 */
function bl_blocks_enqueue_website_assets(string $hook): void
{
	$is_website = $hook === 'toplevel_page_bl-blocks-website'
		|| (isset($_GET['page']) && $_GET['page'] === 'bl-blocks-website');
	if (!$is_website) {
		return;
	}
	if (!bl_blocks_user_can_manage()) {
		return;
	}
	wp_enqueue_media();
	bl_blocks_enqueue_field_ui_assets();
	bl_blocks_enqueue_style('bl-blocks-admin', 'blocks-admin');
}
add_action('admin_enqueue_scripts', 'bl_blocks_enqueue_website_assets');
