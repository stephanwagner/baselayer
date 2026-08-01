<?php

defined('ABSPATH') || exit;

/**
 * Definition editor chrome on bl_block edit screens.
 *
 * @param string       $post_type
 * @param WP_Post|null $post
 */
function bl_blocks_admin_meta_boxes($post_type = '', $post = null): void
{
	remove_meta_box('slugdiv', BL_BLOCK_POST_TYPE, 'normal');

	if (!bl_blocks_user_can_manage()) {
		return;
	}
	if ($post_type !== BL_BLOCK_POST_TYPE || !($post instanceof WP_Post)) {
		return;
	}
	if ($post->post_status === 'auto-draft') {
		return;
	}
	if (bl_blocks_get_definition_type((int) $post->ID) !== 'block') {
		return;
	}

	add_meta_box(
		'bl_blocks_template',
		__('Template', 'baselayer-blocks'),
		'bl_blocks_render_template_metabox',
		BL_BLOCK_POST_TYPE,
		'side',
		'low'
	);
}
add_action('add_meta_boxes', 'bl_blocks_admin_meta_boxes', 10, 2);

/**
 * Side panel: theme PHP template path status for this block.
 */
function bl_blocks_render_template_metabox(WP_Post $post): void
{
	$config = bl_blocks_get_config((int) $post->ID);
	$slug = bl_blocks_definition_slug((int) $post->ID, $config['settings']);
	$name = bl_blocks_gutenberg_name($slug);
	$info = bl_blocks_template_info($slug);

	echo '<div class="bl-blocks-template-metabox">';
	echo '<p class="bl-blocks-template-metabox__name"><code>' . esc_html($name) . '</code></p>';

	if ($info['exists']) {
		echo '<p class="bl-blocks-template-metabox__status is-found">';
		echo esc_html__('Template found.', 'baselayer-blocks');
		echo '</p>';
		echo '<p class="description">' . esc_html__('Loaded from:', 'baselayer-blocks') . '</p>';
		echo '<p class="bl-blocks-template-metabox__path"><code>' . esc_html($info['display_path']) . '</code></p>';
	} else {
		echo '<p class="bl-blocks-template-metabox__status is-missing">';
		echo esc_html__('Template missing.', 'baselayer-blocks');
		echo '</p>';
		echo '<p class="description">';
		echo esc_html__('Create this PHP file in your theme (child theme preferred):', 'baselayer-blocks');
		echo '</p>';
		echo '<p class="bl-blocks-template-metabox__path"><code>' . esc_html($info['create_path']) . '</code></p>';
		echo '<p class="description">';
		echo esc_html__('Available in the template: $values, $fields, $block, $attributes.', 'baselayer-blocks');
		echo '</p>';
	}

	echo '</div>';
}

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
	$form_builder_deps = $builder_handle ? [$builder_handle] : [];
	$form_builder_handle = bl_blocks_enqueue_form_builder_kit($form_builder_deps);

	$style_deps = [];
	if ($form_builder_handle) {
		$style_deps[] = $form_builder_handle;
	} elseif ($builder_handle) {
		$style_deps[] = $builder_handle;
	}
	bl_blocks_enqueue_style('bl-blocks-admin', 'blocks-admin', $style_deps);

	$deps = [];
	if ($form_builder_handle) {
		$deps[] = $form_builder_handle;
	} elseif ($builder_handle) {
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
		'repeater'     => __('Repeater', 'baselayer-blocks'),
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
		'repeaterType'             => __('Repeater', 'baselayer-blocks'),
		'repeaterLabel'            => __('Repeater label', 'baselayer-blocks'),
		'repeaterLabelPlaceholder' => __('Repeater label', 'baselayer-blocks'),
		'repeaterMinRows'          => __('Min rows', 'baselayer-blocks'),
		'repeaterMaxRows'          => __('Max rows (0 = unlimited)', 'baselayer-blocks'),
		'repeaterMaxRowsShort'     => __('Max', 'baselayer-blocks'),
		'repeaterButtonLabel'      => __('Add button label', 'baselayer-blocks'),
		'repeaterEmpty'            => __('Drop fields or a nested repeater here', 'baselayer-blocks'),
		'repeaterEmptyMaxDepth'    => __('Drop fields here (nested repeater not allowed at this depth)', 'baselayer-blocks'),
		'addRow'                  => __('Add row', 'baselayer-blocks'),
		'name'                     => __('Field name', 'baselayer-blocks'),
		'nameHelp'                 => __('Internal field key used when saving values.', 'baselayer-blocks'),
		'layoutSettingsTitle'      => __('Settings', 'baselayer-blocks'),
		'layoutDesignTitle'        => __('Design', 'baselayer-blocks'),
		'layoutDesignStyle'        => __('Style', 'baselayer-blocks'),
		'fieldTabSettings'         => __('Settings', 'baselayer-blocks'),
		'fieldTabLogic'            => __('Logic', 'baselayer-blocks'),
		'sectionDesignStandard'    => __('Standard', 'baselayer-blocks'),
		'sectionDesignOutline'     => __('Outline', 'baselayer-blocks'),
		'sectionDesignCard'        => __('Card', 'baselayer-blocks'),
		'sectionHideTitle'         => __('Hide title', 'baselayer-blocks'),
		'sectionLabelPlaceholder'  => __('Title', 'baselayer-blocks'),
		'sectionLabelPlaceholderHidden' => __('Name', 'baselayer-blocks'),
		'cssClass'                 => __('CSS class', 'baselayer-blocks'),
		'cssClassPlaceholder'      => __('e.g. my-field', 'baselayer-blocks'),
		'cssClassHelp'             => __('Optional class names added to this field’s wrapper.', 'baselayer-blocks'),
		'cancel'                   => __('Cancel', 'baselayer-blocks'),
		'apply'                    => __('Apply', 'baselayer-blocks'),
		'logicEnable'              => __('Conditional logic', 'baselayer-blocks'),
		'logicHelp'                => __('Show this field only when the conditions below are met.', 'baselayer-blocks'),
		'logicHelpContainer'       => __('Show this block only when the conditions below are met.', 'baselayer-blocks'),
		'logicHelpSection'         => __('Show this section only when the conditions below are met.', 'baselayer-blocks'),
		'logicHelpColumn'          => __('Show this column only when the conditions below are met.', 'baselayer-blocks'),
		'logicHelpRepeater'        => __('Show this repeater only when the conditions below are met.', 'baselayer-blocks'),
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
