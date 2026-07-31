<?php

defined('ABSPATH') || exit;

/**
 * Definition editor chrome on bl_block edit screens.
 */
function bl_blocks_admin_meta_boxes(): void
{
	remove_meta_box('slugdiv', BL_BLOCK_POST_TYPE, 'normal');
}
add_action('add_meta_boxes', 'bl_blocks_admin_meta_boxes');

/**
 * Builder shell below the title.
 */
function bl_blocks_render_builder_after_title(WP_Post $post): void
{
	if ($post->post_type !== BL_BLOCK_POST_TYPE) {
		return;
	}

	$type = bl_blocks_get_definition_type((int) $post->ID);
	if ($post->post_status === 'auto-draft' && isset($_GET['bl_block_type'])) {
		$type = bl_blocks_sanitize_definition_type(wp_unslash((string) $_GET['bl_block_type']));
	} elseif (isset($_GET['bl_block_type']) && get_post_meta((int) $post->ID, BL_BLOCK_TYPE_META, true) === '') {
		$type = bl_blocks_sanitize_definition_type(wp_unslash((string) $_GET['bl_block_type']));
	}

	$config = bl_blocks_get_config((int) $post->ID);
	$config['settings'] = bl_blocks_sanitize_settings($config['settings'], $type);

	// New site settings: order = existing tabs + 1.
	if ($type === 'site_settings') {
		$saved = get_post_meta((int) $post->ID, BL_BLOCK_CONFIG_META, true);
		if (!is_array($saved)) {
			$config['settings']['menu_order'] = bl_blocks_next_site_settings_order((int) $post->ID);
		}
	}

	wp_nonce_field('bl_blocks_save_config', 'bl_blocks_config_nonce');
	?>
	<input type="hidden" name="bl_block_type" value="<?= esc_attr($type) ?>">
	<?php
	// id matches Forms modules (readConfig/writeConfig); name is Blocks save_post.
	?>
	<input type="hidden" name="bl_blocks_config_json" id="bl-forms-config-json" value="<?= esc_attr(wp_json_encode($config)) ?>">
	<div
		id="bl-blocks-builder"
		class="bl-forms-builder bl-blocks-builder"
		data-bl-blocks-builder
		data-bl-block-type="<?= esc_attr($type) ?>"
	>
		<div class="bl-forms-builder__skeleton" aria-hidden="true">
			<div class="bl-forms-builder__skeleton-tabs">
				<span class="bl-forms-builder__skeleton-tab"></span>
				<span class="bl-forms-builder__skeleton-tab"></span>
			</div>
			<div class="bl-forms-builder__skeleton-body"></div>
		</div>
	</div>
	<?php
}
add_action('edit_form_after_title', 'bl_blocks_render_builder_after_title');

/**
 * Enqueue definition editor assets.
 *
 * @param string $hook
 */
function bl_blocks_enqueue_definition_editor(string $hook): void
{
	if (!in_array($hook, ['post.php', 'post-new.php'], true)) {
		return;
	}
	$screen = function_exists('get_current_screen') ? get_current_screen() : null;
	if (!$screen || $screen->post_type !== BL_BLOCK_POST_TYPE) {
		return;
	}
	if (!bl_blocks_user_can_manage()) {
		return;
	}

	$type = bl_blocks_current_list_type();
	$post_id = isset($_GET['post']) ? (int) $_GET['post'] : 0;
	if ($post_id > 0) {
		$type = bl_blocks_get_definition_type($post_id);
	} elseif (isset($_GET['bl_block_type'])) {
		$type = bl_blocks_sanitize_definition_type(wp_unslash((string) $_GET['bl_block_type']));
	}

	$builder_handle = bl_blocks_enqueue_canvas_builder_kit();

	// Reuse Forms admin chrome when the asset exists (always on disk in theme packages).
	$forms_admin_css = null;
	if (function_exists('bl_forms_resolve_asset')) {
		$forms_admin_css = bl_forms_resolve_asset('forms-admin', 'css');
	} else {
		$forms_css_path = dirname(BL_BLOCKS_PATH) . '/baselayer-forms/assets/css/forms-admin.min.css';
		$forms_css_alt = dirname(BL_BLOCKS_PATH) . '/baselayer-forms/assets/css/forms-admin.css';
		$path = is_readable($forms_css_path) ? $forms_css_path : (is_readable($forms_css_alt) ? $forms_css_alt : '');
		if ($path !== '') {
			$uri = str_replace(BL_BLOCKS_PATH, bl_blocks_base_url(), $path);
			// Prefer package URL helper for forms when available.
			if (function_exists('bl_forms_url')) {
				$file = basename($path);
				$uri = bl_forms_url('assets/css/' . $file);
			} else {
				$uri = bl_blocks_url('../baselayer-forms/assets/css/' . basename($path));
			}
			$forms_admin_css = [
				'uri' => $uri,
				'ver' => (string) filemtime($path),
			];
		}
	}
	if (is_array($forms_admin_css) && isset($forms_admin_css['uri'])) {
		wp_enqueue_style(
			'bl-forms-admin',
			$forms_admin_css['uri'],
			$builder_handle ? [$builder_handle] : [],
			$forms_admin_css['ver'] ?? BL_BLOCKS_VERSION
		);
	}

	bl_blocks_enqueue_style(
		'bl-blocks-admin',
		'blocks-admin',
		wp_style_is('bl-forms-admin', 'enqueued') ? ['bl-forms-admin'] : ($builder_handle ? [$builder_handle] : [])
	);

	$deps = [];
	if ($builder_handle) {
		$deps[] = $builder_handle;
	}
	bl_blocks_enqueue_script('bl-blocks-admin', 'blocks-admin', $deps, true);

	$has_icon_picker = function_exists('bl_icons_localize_payload')
		&& function_exists('bl_enqueue_theme_icons_style');
	if ($has_icon_picker) {
		if (function_exists('bl_load_icons_textdomain')) {
			bl_load_icons_textdomain();
		}
		bl_enqueue_theme_icons_style(['bl-blocks-admin']);
		wp_localize_script('bl-blocks-admin', 'baselayerIcons', bl_icons_localize_payload());
	}

	wp_add_inline_script(
		'postbox',
		"jQuery(function($){
			function blBlocksDisableMetaBoxSort() {
				$('.meta-box-sortables').each(function(){
					var \$el = $(this);
					if (\$el.data('ui-sortable')) {
						\$el.sortable('destroy');
					}
				});
				$('.postbox .hndle, .postbox .handlediv').css('cursor', 'default');
			}
			blBlocksDisableMetaBoxSort();
			setTimeout(blBlocksDisableMetaBoxSort, 0);
		});"
	);

	$post_types = [];
	foreach (get_post_types(['public' => true], 'objects') as $pt) {
		// Media library has no page-settings UI.
		if ($pt->name === 'attachment') {
			continue;
		}
		$post_types[] = [
			'value' => $pt->name,
			'label' => $pt->labels->singular_name ?: $pt->name,
		];
	}

	$icons = bl_blocks_palette_icons();
	$type_labels = [
		'text'         => __('Text', 'baselayer-blocks'),
		'textarea'     => __('Textarea', 'baselayer-blocks'),
		'email'        => __('Email', 'baselayer-blocks'),
		'phone'        => __('Phone', 'baselayer-blocks'),
		'url'          => __('URL', 'baselayer-blocks'),
		'number'       => __('Number', 'baselayer-blocks'),
		'checkboxes'   => __('Checkboxes', 'baselayer-blocks'),
		'radio'        => __('Radio', 'baselayer-blocks'),
		'select'       => __('Select', 'baselayer-blocks'),
		'toggle'       => __('Toggle', 'baselayer-blocks'),
		'button_group' => __('Button group', 'baselayer-blocks'),
		'date'         => __('Date', 'baselayer-blocks'),
		'time'         => __('Time', 'baselayer-blocks'),
		'datetime'     => __('Date & time', 'baselayer-blocks'),
		'file'         => __('File', 'baselayer-blocks'),
		'image'        => __('Image', 'baselayer-blocks'),
		'heading'      => __('Heading', 'baselayer-blocks'),
		'text_block'   => __('Text block', 'baselayer-blocks'),
		'html'         => __('HTML', 'baselayer-blocks'),
		'divider'      => __('Divider', 'baselayer-blocks'),
		'spacer'       => __('Spacer', 'baselayer-blocks'),
		'column'       => __('Column', 'baselayer-blocks'),
		'section'      => __('Section', 'baselayer-blocks'),
		'hidden'       => __('Hidden', 'baselayer-blocks'),
	];

	$i18n = [
		'tabFields'                => __('Fields', 'baselayer-blocks'),
		'tabSettings'              => __('Settings', 'baselayer-blocks'),
		'canvasHeading'            => __('Fields', 'baselayer-blocks'),
		'empty'                    => __('Drag a field here.', 'baselayer-blocks'),
		'settingsActive'           => __('Active', 'baselayer-blocks'),
		'settingsSlug'             => __('Slug', 'baselayer-blocks'),
		'settingsSlugHelp'         => __('Internal key used in code and storage. Lowercase letters, numbers, and hyphens.', 'baselayer-blocks'),
		'settingsDescription'      => __('Description', 'baselayer-blocks'),
		'blockTitle'               => __('Block title', 'baselayer-blocks'),
		'blockIcon'                => __('Block icon', 'baselayer-blocks'),
		'blockIconChoose'          => __('Choose icon', 'baselayer-blocks'),
		'blockIconSvg'             => __('SVG code', 'baselayer-blocks'),
		'blockIconSvgToggle'       => __('SVG code', 'baselayer-blocks'),
		'blockIconClear'           => __('Clear', 'baselayer-blocks'),
		'blockIconEmpty'           => __('No icon selected', 'baselayer-blocks'),
		'blockIconMaterialHelp'    => __('Browse Material Icons (Rounded), copy SVG, and paste here: ', 'baselayer-blocks'),
		'blockIconMaterialLink'    => __('fonts.google.com/icons', 'baselayer-blocks'),
		'blockCategory'            => __('Block category', 'baselayer-blocks'),
		'blockKeywords'            => __('Keywords', 'baselayer-blocks'),
		'blockKeywordsHelp'        => __('Comma-separated search keywords for the block inserter.', 'baselayer-blocks'),
		'postTypes'                => __('Post types', 'baselayer-blocks'),
		'postTypesHelp'            => __('Show these page settings on the selected post types.', 'baselayer-blocks'),
		'menuLabel'                => __('Tab label', 'baselayer-blocks'),
		'menuLabelHelp'            => __('Label in the Website settings sidebar. Defaults to the title.', 'baselayer-blocks'),
		'menuOrder'                => __('Order', 'baselayer-blocks'),
		'fullscreenEnter'          => __('Fullscreen', 'baselayer-blocks'),
		'fullscreenExit'           => __('Exit fullscreen', 'baselayer-blocks'),
		'paletteSectionPopular'    => __('Popular', 'baselayer-blocks'),
		'paletteSectionInput'      => __('Input', 'baselayer-blocks'),
		'paletteSectionChoice'     => __('Choice', 'baselayer-blocks'),
		'paletteSectionDatetime'   => __('Date & time', 'baselayer-blocks'),
		'paletteSectionFiles'      => __('Uploads', 'baselayer-blocks'),
		'paletteSectionLayout'     => __('Layout', 'baselayer-blocks'),
		'paletteSectionContent'    => __('Content', 'baselayer-blocks'),
		'paletteSectionAdvanced'   => __('Advanced', 'baselayer-blocks'),
		'types'                    => $type_labels,
	];

	wp_localize_script('bl-blocks-admin', 'blBlocksAdmin', [
		'type'             => $type,
		'postTypes'        => $post_types,
		'blockCategories'  => bl_blocks_block_category_choices(),
		'hasIconPicker'    => $has_icon_picker,
		'icons'            => $icons,
		'i18n'             => $i18n,
	]);
	// Forms field-card modules read window.blFormsAdmin.
	wp_add_inline_script(
		'bl-blocks-admin',
		'window.blFormsAdmin = window.blFormsAdmin || ' . wp_json_encode([
			'icons' => $icons,
			'i18n'  => $i18n,
		]) . ';',
		'before'
	);
}
add_action('admin_enqueue_scripts', 'bl_blocks_enqueue_definition_editor');
