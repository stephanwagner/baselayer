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
		__('Block', 'baselayer-blocks'),
		'bl_blocks_render_template_metabox',
		BL_BLOCK_POST_TYPE,
		'side',
		'low'
	);
}
add_action('add_meta_boxes', 'bl_blocks_admin_meta_boxes', 10, 2);

/**
 * Side panel: block ID + theme PHP template status / starter actions.
 */
function bl_blocks_render_template_metabox(WP_Post $post): void
{
	$config = bl_blocks_get_config((int) $post->ID);
	$slug = bl_blocks_definition_slug((int) $post->ID, $config['settings']);
	$name = bl_blocks_gutenberg_name($slug);
	$info = bl_blocks_template_info($slug);
	$path_id = 'bl-blocks-template-path-' . (int) $post->ID;
	$filename = basename($info['relative']);

	echo '<div class="bl-blocks-template-metabox" data-bl-blocks-template-metabox data-post-id="' . esc_attr((string) (int) $post->ID) . '">';

	echo '<p class="bl-blocks-template-metabox__label"><label for="bl-blocks-block-id">' . esc_html__('Block ID:', 'baselayer-blocks') . '</label></p>';
	echo '<p class="bl-blocks-template-metabox__id"><code id="bl-blocks-block-id">' . esc_html($name) . '</code></p>';

	if ($info['exists']) {
		echo '<p class="bl-blocks-template-metabox__label"><label for="' . esc_attr($path_id) . '">' . esc_html__('Template', 'baselayer-blocks') . '</label></p>';
		echo '<p class="bl-blocks-template-metabox__path"><code id="' . esc_attr($path_id) . '">' . esc_html($info['display_path']) . '</code></p>';
		echo '<p class="bl-blocks-template-metabox__actions">';
		echo '<button type="button" class="button bl-button-small" data-bl-blocks-preview-starter>';
		echo esc_html__('Preview starter template', 'baselayer-blocks');
		echo '</button>';
		echo '</p>';
	} else {
		echo '<div class="bl-blocks-template-metabox__notice" role="status">';
		echo esc_html__('No template found', 'baselayer-blocks');
		echo '</div>';

		echo '<p class="bl-blocks-template-metabox__label"><label>' . esc_html__('Create this file:', 'baselayer-blocks') . '</label></p>';
		echo '<div class="bl-blocks-template-metabox__path-row">';
		echo '<code class="bl-blocks-template-metabox__path-code">' . esc_html($info['create_path']) . '</code>';
		echo '<span id="' . esc_attr($path_id) . '" class="screen-reader-text">' . esc_html($filename) . '</span>';
		echo '<button type="button" class="button bl-button-small -icon-only" data-bl-copy-from-source="' . esc_attr($path_id) . '" title="' . esc_attr__('Copy filename', 'baselayer-blocks') . '" aria-label="' . esc_attr__('Copy filename', 'baselayer-blocks') . '">';
		echo '<span class="bl-icon -icon-copy" aria-hidden="true"></span>';
		echo '</button>';
		echo '</div>';

		echo '<p class="bl-blocks-template-metabox__actions">';
		echo '<button type="button" class="button button-primary bl-button-small" data-bl-blocks-generate-starter>';
		echo esc_html__('Generate starter template', 'baselayer-blocks');
		echo '</button>';
		echo '<button type="button" class="button bl-button-small -icon-only" data-bl-blocks-preview-starter title="' . esc_attr__('Preview starter template', 'baselayer-blocks') . '" aria-label="' . esc_attr__('Preview starter template', 'baselayer-blocks') . '">';
		echo '<span class="bl-icon -icon-preview" aria-hidden="true"></span>';
		echo '</button>';
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

	wp_enqueue_media();

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

	$deps = ['wp-api-fetch'];
	if ($form_builder_handle) {
		$deps[] = $form_builder_handle;
	} elseif ($builder_handle) {
		$deps[] = $builder_handle;
	}
	bl_blocks_enqueue_script('bl-blocks-admin', 'blocks-admin', $deps, true);

	$has_icon_picker = function_exists('bl_icons_localize_payload')
		&& function_exists('bl_enqueue_theme_icons_style');
	if (function_exists('bl_enqueue_theme_icons_style')) {
		if (function_exists('bl_load_icons_textdomain')) {
			bl_load_icons_textdomain();
		}
		bl_enqueue_theme_icons_style(['bl-blocks-admin']);
	}
	if ($has_icon_picker) {
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
		'tab'          => __('Tab', 'baselayer-blocks'),
		'repeater'     => __('Repeater', 'baselayer-blocks'),
		'hidden'       => __('Hidden', 'baselayer-blocks'),
		'page'         => __('Page', 'baselayer-blocks'),
		'link'         => __('Link', 'baselayer-blocks'),
	];

	$i18n = [
		'tabFields'                => __('Fields', 'baselayer-blocks'),
		'tabSettings'              => __('Settings', 'baselayer-blocks'),
		'canvasHeading'            => __('Fields', 'baselayer-blocks'),
		'empty'                    => __('Drag a field here.', 'baselayer-blocks'),
		'settingsActive'           => __('Active', 'baselayer-blocks'),
		'settingsSidebarEditing'   => __('Allow editing directly in sidebar', 'baselayer-blocks'),
		'settingsSlug'             => __('Slug', 'baselayer-blocks'),
		'settingsSlugHelp'         => __('Internal key used in code and storage. Lowercase letters, numbers, and hyphens.', 'baselayer-blocks'),
		'settingsDescription'      => __('Description', 'baselayer-blocks'),
		'blockIcon'                => __('Block icon', 'baselayer-blocks'),
		'blockIconChoose'          => __('Choose icon', 'baselayer-blocks'),
		'blockIconSvg'             => __('SVG code', 'baselayer-blocks'),
		'blockIconSvgToggle'       => __('SVG code', 'baselayer-blocks'),
		'blockIconClear'           => __('Clear', 'baselayer-blocks'),
		'blockIconEmpty'           => __('No icon selected', 'baselayer-blocks'),
		'blockIconMaterialHelp'    => __('Browse Material Icons, copy SVG, and paste here: ', 'baselayer-blocks'),
		'blockIconMaterialLink'    => __('fonts.google.com/icons', 'baselayer-blocks'),
		'blockCategory'            => __('Block category', 'baselayer-blocks'),
		'blockKeywords'            => __('Keywords', 'baselayer-blocks'),
		'blockKeywordsHelp'        => __('Comma-separated search keywords for the block inserter.', 'baselayer-blocks'),
		'postTypes'                => __('Post types', 'baselayer-blocks'),
		'postTypesHelp'            => __('Show these content fields on the selected post types.', 'baselayer-blocks'),
		'menuLabel'                => __('Tab label', 'baselayer-blocks'),
		'menuLabelHelp'            => __('Label in the Website sidebar. Defaults to the title.', 'baselayer-blocks'),
		'menuOrder'                => __('Order', 'baselayer-blocks'),
		'fullscreenEnter'          => __('Fullscreen', 'baselayer-blocks'),
		'fullscreenExit'           => __('Exit fullscreen', 'baselayer-blocks'),
		'paletteSectionPopular'    => __('Popular', 'baselayer-blocks'),
		'paletteSectionInput'      => __('Input', 'baselayer-blocks'),
		'paletteSectionChoice'     => __('Choice', 'baselayer-blocks'),
		'paletteSectionDatetime'   => __('Date & time', 'baselayer-blocks'),
		'paletteSectionFiles'      => __('Uploads', 'baselayer-blocks'),
		'paletteSectionMedia'      => __('Media', 'baselayer-blocks'),
		'paletteSectionLayout'     => __('Layout', 'baselayer-blocks'),
		'paletteSectionContent'    => __('Content', 'baselayer-blocks'),
		'paletteSectionAdvanced'   => __('Advanced', 'baselayer-blocks'),
		'paletteSectionRelations'  => __('Relations', 'baselayer-blocks'),
		'repeaterType'             => __('Repeater', 'baselayer-blocks'),
		'repeaterLabel'            => __('Repeater label', 'baselayer-blocks'),
		'repeaterLabelPlaceholder' => __('Repeater label', 'baselayer-blocks'),
		'repeaterMinRows'          => __('Min rows', 'baselayer-blocks'),
		'repeaterMaxRows'          => __('Max rows', 'baselayer-blocks'),
		'repeaterMaxRowsHelp'      => __('0 = unlimited', 'baselayer-blocks'),
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

		'addOption'               => __('Add option', 'baselayer-blocks'),
		'allowMultiple'           => __('Allow multiple', 'baselayer-blocks'),
		'allowMultipleFiles'      => __('Allow multiple files', 'baselayer-blocks'),
		'allowMultipleMedia'      => __('Allow multiple', 'baselayer-blocks'),
		'maxMediaItems'           => __('Maximum items', 'baselayer-blocks'),
		'maxMediaHelp'            => __('Maximum number of items that can be selected from the media library.', 'baselayer-blocks'),
		'pageMultiple'            => __('Allow multiple pages', 'baselayer-blocks'),
		'linkAllowedTypes'        => __('Allowed types', 'baselayer-blocks'),
		'linkAllowTarget'         => __('Allow editor to set target', 'baselayer-blocks'),
		'linkTypePage'            => __('Page', 'baselayer-blocks'),
		'linkTypeUrl'             => __('URL', 'baselayer-blocks'),
		'linkTypeEmail'           => __('Email', 'baselayer-blocks'),
		'linkTypePhone'           => __('Phone', 'baselayer-blocks'),
		'linkTypeLabel'           => __('Type', 'baselayer-blocks'),
		'linkDestPage'            => __('Page', 'baselayer-blocks'),
		'linkDestUrl'             => __('URL', 'baselayer-blocks'),
		'linkDestEmail'           => __('Email address', 'baselayer-blocks'),
		'linkDestPhone'           => __('Phone number', 'baselayer-blocks'),
		'linkText'                => __('Link text', 'baselayer-blocks'),
		'linkOpenNewTab'          => __('Open in new tab', 'baselayer-blocks'),
		'allowedExtensions'       => __('Allowed extensions', 'baselayer-blocks'),
		'allowedExtensionsHelp'   => __('Comma-separated list without dots, e.g. pdf, docx, xlsx. Leave empty to allow all WordPress-permitted types.', 'baselayer-blocks'),
		'autocomplete'            => __('Autocomplete', 'baselayer-blocks'),
		'autocompleteAutomatic'   => __('Automatic', 'baselayer-blocks'),
		'autocompleteOff'         => __('Off', 'baselayer-blocks'),
		'boundCurrentHour'        => __('Current hour', 'baselayer-blocks'),
		'boundDays'               => __('days', 'baselayer-blocks'),
		'boundFixedDate'          => __('Fixed date', 'baselayer-blocks'),
		'boundFixedDatetime'      => __('Fixed date & time', 'baselayer-blocks'),
		'boundFixedTime'          => __('Fixed time', 'baselayer-blocks'),
		'boundMinutes'            => __('minutes', 'baselayer-blocks'),
		'boundNone'               => __('No limit', 'baselayer-blocks'),
		'boundNow'                => __('Now', 'baselayer-blocks'),
		'boundNowOffset'          => __('Minutes relative to now', 'baselayer-blocks'),
		'boundNowPlus'            => __('Now ±', 'baselayer-blocks'),
		'boundToday'              => __('Today', 'baselayer-blocks'),
		'boundTodayOffset'        => __('Days relative to today', 'baselayer-blocks'),
		'boundTodayPlus'          => __('Today ±', 'baselayer-blocks'),
		'buttonGroupMultiple'     => __('Allow multiple selection', 'baselayer-blocks'),
		'captchaHelp'             => __('Uses the CAPTCHA keys from Forms → Settings.', 'baselayer-blocks'),
		'captchaNotConfigured'    => __('CAPTCHA keys are not configured yet. Add them under Forms → Settings.', 'baselayer-blocks'),
		'captchaOpenSettings'     => __('Open settings', 'baselayer-blocks'),
		'checkboxText'            => __('Checkbox text', 'baselayer-blocks'),
		'checkboxTextHelp'        => __('Markdown is supported, e.g. <b>**Bold**</b>, <i>*Italic*</i>, and <span style="white-space: nowrap">[Link](...)</span>. For the target you can use a URL (/agb), a WordPress page (page:123), or a standard page such as page:privacy.', 'baselayer-blocks'),
		'choices'                 => __('Choices', 'baselayer-blocks'),
		'collapseField'           => __('Collapse field', 'baselayer-blocks'),
		'columnEmpty'             => __('Drop fields here', 'baselayer-blocks'),
		'columnType'              => __('Columns', 'baselayer-blocks'),
		'columnWidthTitle'        => __('Column width', 'baselayer-blocks'),
		'content'                 => __('Content', 'baselayer-blocks'),
		'dateRelation'            => __('Relation', 'baselayer-blocks'),
		'dateRelationAfter'       => __('Must be after', 'baselayer-blocks'),
		'dateRelationBefore'      => __('Must be before', 'baselayer-blocks'),
		'dateRelationNone'        => __('No relation', 'baselayer-blocks'),
		'dateRelationSelect'      => __('Select field', 'baselayer-blocks'),
		'defaultChecked'          => __('Checked by default', 'baselayer-blocks'),
		'defaultNone'             => __('None', 'baselayer-blocks'),
		'defaultValue'            => __('Default value', 'baselayer-blocks'),
		'defaultValueOptionsHelp' => __('Use option slugs from the list above. For multiple values, separate with commas (e.g. option-1, option-2).', 'baselayer-blocks'),
		'delete'                  => __('Delete', 'baselayer-blocks'),
		'description'             => __('Description', 'baselayer-blocks'),
		'disabled'                => __('Disabled', 'baselayer-blocks'),
		'dividerMargin'           => __('Margin', 'baselayer-blocks'),
		'dividerMarginCustomPlaceholder' => __('e.g. 24px or 2rem', 'baselayer-blocks'),
		'dragField'               => __('Drag to reorder', 'baselayer-blocks'),
		'duplicate'               => __('Duplicate', 'baselayer-blocks'),
		'collapseGroup'           => __('Collapse', 'baselayer-blocks'),
		'expandGroup'             => __('Expand', 'baselayer-blocks'),
		'expandField'             => __('Expand field', 'baselayer-blocks'),
		'fieldActivateTitle'      => __('Show on the frontend', 'baselayer-blocks'),
		'fieldActive'             => __('Active', 'baselayer-blocks'),
		'fieldMaxSize'            => __('Maximum file size', 'baselayer-blocks'),
		'fieldMaxSizeHelp'        => __('Leave empty to use the global default (%s).', 'baselayer-blocks'),
		'fieldMaxSizeHelpEmpty'   => __('Leave empty to use the global default.', 'baselayer-blocks'),
		'fieldTabAdvanced'        => __('Advanced', 'baselayer-blocks'),
		'fieldTabAppearance'      => __('Appearance', 'baselayer-blocks'),
		'fieldTabGeneral'         => __('General', 'baselayer-blocks'),
		'headingLevel'            => __('Level', 'baselayer-blocks'),
		'hideLabel'               => __('Hide', 'baselayer-blocks'),
		'honeypotHelp'            => __('Hidden from visitors. If filled, the submission is treated as spam.', 'baselayer-blocks'),
		'htmlContent'             => __('HTML', 'baselayer-blocks'),
		'label'                   => __('Label', 'baselayer-blocks'),
		'layout'                  => __('Layout', 'baselayer-blocks'),
		'layoutHorizontal'        => __('Horizontal', 'baselayer-blocks'),
		'layoutVertical'          => __('Vertical', 'baselayer-blocks'),
		'logicAddGroup'           => __('Add rule group', 'baselayer-blocks'),
		'logicAddRule'            => __('Add rule', 'baselayer-blocks'),
		'logicAnd'                => __('and', 'baselayer-blocks'),
		'logicField'              => __('Field', 'baselayer-blocks'),
		'logicMissingField'       => __('Missing field', 'baselayer-blocks'),
		'logicNoFields'           => __('No fields available', 'baselayer-blocks'),
		'logicOpChecked'          => __('Checked', 'baselayer-blocks'),
		'logicOpContains'         => __('Contains', 'baselayer-blocks'),
		'logicOpEmpty'            => __('Has no value', 'baselayer-blocks'),
		'logicOpEquals'           => __('Is equal to', 'baselayer-blocks'),
		'logicOpGreater'          => __('Greater than', 'baselayer-blocks'),
		'logicOpGreaterOrEqual'   => __('Greater than or equal to', 'baselayer-blocks'),
		'logicOpLess'             => __('Less than', 'baselayer-blocks'),
		'logicOpLessOrEqual'      => __('Less than or equal to', 'baselayer-blocks'),
		'logicOpNotChecked'       => __('Not checked', 'baselayer-blocks'),
		'logicOpNotContains'      => __('Does not contain', 'baselayer-blocks'),
		'logicOpNotEmpty'         => __('Has any value', 'baselayer-blocks'),
		'logicOpNotEquals'        => __('Is not equal to', 'baselayer-blocks'),
		'logicOperator'           => __('Operator', 'baselayer-blocks'),
		'logicOr'                 => __('or', 'baselayer-blocks'),
		'logicSelectValue'        => __('— Select —', 'baselayer-blocks'),
		'logicShowIf'             => __('Show this field if', 'baselayer-blocks'),
		'logicThisField'          => __('This field', 'baselayer-blocks'),
		'logicValue'              => __('Value', 'baselayer-blocks'),
		'maxFiles'                => __('Maximum files', 'baselayer-blocks'),
		'maxFilesHelp'            => __('Maximum number of files visitors can upload.', 'baselayer-blocks'),
		'maxLength'               => __('Maximum length', 'baselayer-blocks'),
		'maxSelections'           => __('Maximum selections', 'baselayer-blocks'),
		'maxValue'                => __('Maximum', 'baselayer-blocks'),
		'minLength'               => __('Minimum length', 'baselayer-blocks'),
		'minSelections'           => __('Minimum selections', 'baselayer-blocks'),
		'minValue'                => __('Minimum', 'baselayer-blocks'),
		'optionLabel'             => __('Label', 'baselayer-blocks'),
		'optionOne'               => __('Option 1', 'baselayer-blocks'),
		'optionSlug'              => __('Slug', 'baselayer-blocks'),
		'optionTwo'               => __('Option 2', 'baselayer-blocks'),
		'options'                 => __('Options', 'baselayer-blocks'),
		'placeholder'             => __('Placeholder', 'baselayer-blocks'),
		'prefix'                  => __('Prefix', 'baselayer-blocks'),
		'readOnly'                => __('Read only', 'baselayer-blocks'),
		'required'                => __('Required', 'baselayer-blocks'),
		'sectionEmpty'            => __('Drop fields here', 'baselayer-blocks'),
		'sectionLabel'            => __('Section title', 'baselayer-blocks'),
		'sectionType'             => __('Section', 'baselayer-blocks'),
		'sectionWidthTitle'       => __('Section width', 'baselayer-blocks'),
		'tabEmpty'                => __('Drop fields here', 'baselayer-blocks'),
		'tabType'                 => __('Tab', 'baselayer-blocks'),
		'tabWidthTitle'           => __('Tab width', 'baselayer-blocks'),
		'logicHelpTab'            => __('Show this tab only when the conditions below are met.', 'baselayer-blocks'),
		'selectMultiple'          => __('Allow multiple selection', 'baselayer-blocks'),
		'selectionBoundsHelp'     => __('Leave empty for no limit. When the maximum is reached, further options cannot be selected.', 'baselayer-blocks'),
		'showCharCount'           => __('Show character count', 'baselayer-blocks'),
		'showUploadPreview'       => __('Show file preview', 'baselayer-blocks'),
		'spacerHeight'            => __('Height', 'baselayer-blocks'),
		'spacerHeightCustomPlaceholder' => __('e.g. 24px or 2rem', 'baselayer-blocks'),
		'suffix'                  => __('Suffix', 'baselayer-blocks'),
		'termsDefaultFieldLabel'  => __('Privacy Policy', 'baselayer-blocks'),
		'termsDefaultLabel'       => __('I agree to the [Privacy Policy](page:privacy).', 'baselayer-blocks'),
		'textareaRows'            => __('Rows', 'baselayer-blocks'),
		'type'                    => __('Type', 'baselayer-blocks'),
		'uploadButtonDefault'     => __('Choose file', 'baselayer-blocks'),
		'uploadButtonText'        => __('Button label', 'baselayer-blocks'),
		'uploadMaxSizeUnit'       => __('MB', 'baselayer-blocks'),
		'uploadStyle'             => __('Style', 'baselayer-blocks'),
		'uploadStyleClassic'      => __('Classic', 'baselayer-blocks'),
		'uploadStyleModern'       => __('Modern', 'baselayer-blocks'),
		'width'                   => __('Width', 'baselayer-blocks'),
		'widthAuto'               => __('Auto', 'baselayer-blocks'),
		'widthCustom'             => __('Custom', 'baselayer-blocks'),
		'widthCustomPlaceholder'  => __('e.g. 40% or 280px', 'baselayer-blocks'),

		'starterPreviewTitle'     => __('Starter template', 'baselayer-blocks'),
		'starterCopyCode'         => __('Copy code', 'baselayer-blocks'),
		'starterCopied'           => __('Copied', 'baselayer-blocks'),
		'starterClose'            => __('Close', 'baselayer-blocks'),
		'starterGenerating'       => __('Generating…', 'baselayer-blocks'),
		'starterGenerateFailed'   => __('Could not generate the starter template.', 'baselayer-blocks'),
		'starterWriteFailed'      => __('Could not create the template file.', 'baselayer-blocks'),

		'types'                    => $type_labels,
	];

	wp_localize_script('bl-blocks-admin', 'blBlocksAdmin', [
		'type'             => $type,
		'postTypes'        => $post_types,
		'blockCategories'  => bl_blocks_block_category_choices(),
		'hasIconPicker'    => $has_icon_picker,
		'icons'            => $icons,
		'pagesRestUrl'     => esc_url_raw(rest_url('wp/v2/pages')),
		'starterPath'      => 'baselayer-blocks/v1/starter-template',
		'restNonce'        => wp_create_nonce('wp_rest'),
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
