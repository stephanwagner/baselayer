<?php

defined('ABSPATH') || exit;

/**
 * Theme menu item options from config (checkboxes in Appearance → Menus).
 */

/**
 * Nav menu term ID while editing Appearance → Menus (walker param can be 0).
 */
function bl_theme_menu_editor_term_id(int $menu_term_id = 0): int
{
	if ($menu_term_id > 0) {
		return $menu_term_id;
	}

	// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- read-only editor context.
	if (isset($_REQUEST['menu'])) {
		$from_request = (int) wp_unslash($_REQUEST['menu']);
		if ($from_request > 0 && is_nav_menu($from_request)) {
			return $from_request;
		}
	}

	global $nav_menu_selected_id;
	if (!empty($nav_menu_selected_id) && is_nav_menu((int) $nav_menu_selected_id)) {
		return (int) $nav_menu_selected_id;
	}

	$recent = (int) get_user_option('nav_menu_recently_edited');
	if ($recent > 0 && is_nav_menu($recent)) {
		return $recent;
	}

	return 0;
}

/**
 * Theme locations assigned to a nav menu term.
 *
 * @return string[]
 */
function bl_theme_menu_locations_for_menu(int $menu_term_id): array
{
	if ($menu_term_id <= 0) {
		return [];
	}

	$locations = get_nav_menu_locations();
	if (!is_array($locations)) {
		return [];
	}

	$matched = [];
	foreach ($locations as $location => $assigned_id) {
		if ((int) $assigned_id === $menu_term_id) {
			$matched[] = (string) $location;
		}
	}

	return $matched;
}

/**
 * Merged options for all theme locations on a menu (deduped by option id).
 *
 * @return array<int, array{id: string, className: string, label: string, default: bool}>
 */
function bl_theme_menu_options_for_menu_term(int $menu_term_id): array
{
	$menu_term_id = bl_theme_menu_editor_term_id($menu_term_id);
	if ($menu_term_id <= 0) {
		return [];
	}

	$by_id = [];
	foreach (bl_theme_menu_locations_for_menu($menu_term_id) as $location) {
		foreach (bl_theme_menu_options($location) as $option) {
			$by_id[$option['id']] = $option;
		}
	}

	if ($by_id !== []) {
		return array_values($by_id);
	}

	// Not assigned to a theme location yet: match nav menu name to config title.
	$nav_menu = wp_get_nav_menu_object($menu_term_id);
	if (!$nav_menu || !is_string($nav_menu->name) || $nav_menu->name === '') {
		return [];
	}

	$nav_name = trim($nav_menu->name);
	foreach (bl_theme_menus_config() as $menu_config) {
		if ($menu_config['options'] === []) {
			continue;
		}
		if (strcasecmp($nav_name, $menu_config['title']) === 0) {
			foreach ($menu_config['options'] as $option) {
				$by_id[$option['id']] = $option;
			}
		}
	}

	return array_values($by_id);
}

/**
 * Whether a menu item option is enabled (saved meta or config default).
 */
function bl_menu_item_option_enabled(int $menu_item_id, array $option): bool
{
	if ($menu_item_id <= 0 || $option['id'] === '') {
		return false;
	}

	$meta_key = bl_menu_item_option_meta_key($option['id']);
	$stored = get_post_meta($menu_item_id, $meta_key, true);

	if ($stored === '1') {
		return true;
	}
	if ($stored !== '' && $stored !== false) {
		return false;
	}

	// Legacy install meta: is-button → highlight.
	if ($option['id'] === 'highlight' && get_post_meta($menu_item_id, '_menu_item_is_button', true) === '1') {
		return true;
	}

	return !empty($option['default']);
}

/**
 * Render option checkboxes on the menu item editor.
 */
function bl_menu_item_render_option_fields($item_id, object $item, int $depth, ?stdClass $args, int $menu_term_id): void
{
	unset($item, $depth, $args);

	$item_id = (int) $item_id;
	$menu_term_id = bl_theme_menu_editor_term_id($menu_term_id);

	$options = bl_theme_menu_options_for_menu_term($menu_term_id);
	if ($options === []) {
		return;
	}

	foreach ($options as $option) {
		if ($option['label'] === '') {
			continue;
		}

		$field_id = 'edit-menu-item-bl-option-' . esc_attr($option['id']) . '-' . $item_id;
		$field_name = 'menu-item-bl-option-' . $option['id'];
		$checked = bl_menu_item_option_enabled($item_id, $option);
		?>
		<p class="field-bl-menu-option field-bl-menu-option-<?= esc_attr($option['id']) ?> description description-wide">
			<label for="<?= esc_attr($field_id) ?>">
				<input
					type="checkbox"
					id="<?= esc_attr($field_id) ?>"
					name="<?= esc_attr($field_name) ?>[<?= (int) $item_id ?>]"
					value="1"
					<?= checked($checked, true, false) ?>
				/>
				<?= esc_html__($option['label'], 'baselayer') ?>
			</label>
		</p>
		<?php
	}
}

add_action('wp_nav_menu_item_custom_fields', 'bl_menu_item_render_option_fields', 10, 5);

/**
 * Save menu item option checkboxes.
 */
function bl_menu_item_save_option_fields(int $menu_id, int $menu_item_id): void
{
	if (!current_user_can('edit_theme_options')) {
		return;
	}

	$options = bl_theme_menu_options_for_menu_term($menu_id);
	foreach ($options as $option) {
		$field_name = 'menu-item-bl-option-' . $option['id'];
		$meta_key = bl_menu_item_option_meta_key($option['id']);
		// phpcs:ignore WordPress.Security.NonceVerification.Missing -- core menu save.
		$enabled = isset($_POST[$field_name][$menu_item_id]) && (string) wp_unslash($_POST[$field_name][$menu_item_id]) === '1';
		if ($enabled) {
			update_post_meta($menu_item_id, $meta_key, '1');
		} else {
			delete_post_meta($menu_item_id, $meta_key);
		}
	}
}

add_action('wp_update_nav_menu_item', 'bl_menu_item_save_option_fields', 10, 2);

/**
 * Add configured option class names to menu items on the frontend.
 *
 * @param string[] $classes
 * @return string[]
 */
function bl_menu_item_option_css_classes(array $classes, object $item, object $args, int $depth): array
{
	unset($depth);

	if (is_admin() || !isset($item->ID)) {
		return $classes;
	}

	$theme_location = isset($args->theme_location) && is_string($args->theme_location) ? $args->theme_location : '';
	if ($theme_location === '') {
		return $classes;
	}

	foreach (bl_theme_menu_options($theme_location) as $option) {
		if ($option['className'] === '') {
			continue;
		}
		if (!bl_menu_item_option_enabled((int) $item->ID, $option)) {
			continue;
		}
		$classes[] = $option['className'];
	}

	return $classes;
}

add_filter('nav_menu_css_class', 'bl_menu_item_option_css_classes', 10, 4);
