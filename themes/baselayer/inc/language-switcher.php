<?php

defined('ABSPATH') || exit;

/**
 * Whether the language switcher should output anything.
 */
function bl_language_switcher_available(): bool
{
	return function_exists('bl_theme_feature_enabled') && bl_theme_feature_enabled('languages');
}

/**
 * Submenu arrow icon (matches main navigation).
 */
function bl_language_switcher_submenu_arrow_svg(): string
{
	return '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor" aria-hidden="true"><path d="M466.54-375.23q-6.23-2.31-11.85-7.92L274.92-562.92q-8.3-8.31-8.5-20.89-.19-12.57 8.5-21.27 8.7-8.69 21.08-8.69 12.38 0 21.08 8.69L480-442.15l162.92-162.93q8.31-8.3 20.89-8.5 12.57-.19 21.27 8.5 8.69 8.7 8.69 21.08 0 12.38-8.69 21.08L505.31-383.15q-5.62 5.61-11.85 7.92-6.23 2.31-13.46 2.31t-13.46-2.31Z"/></svg>';
}

/**
 * One language option inside the switcher submenu.
 */
function bl_language_switcher_submenu_item_html(
	string $id,
	string $label,
	string $url,
	bool $is_active,
	bool $disabled = false,
	bool $as_button = false
): string {
	$content = bl_language_switcher_item_content($id, $label);
	$classes = 'menu-link bl-lang-item' . ($is_active ? ' active' : '') . ($disabled ? ' bl-lang-disabled' : '');
	$aria = ' aria-current="' . ($is_active ? 'true' : 'false') . '"';
	$data_lang = ' data-language="' . esc_attr($id) . '"';

	if ($as_button) {
		return '<li class="menu-depth-1"><button type="button" class="' . esc_attr($classes) . '"' . $data_lang . $aria . '>' . $content . '</button></li>';
	}

	if ($disabled) {
		return '<li class="menu-depth-1"><span class="' . esc_attr($classes) . '"' . $data_lang . $aria . '>' . $content . '</span></li>';
	}

	return '<li class="menu-depth-1"><a class="' . esc_attr($classes) . '" href="' . esc_url($url) . '" hreflang="' . esc_attr($id) . '"' . $data_lang . $aria . '>' . $content . '</a></li>';
}

/**
 * Dropdown language switcher (flag + arrow trigger, submenu options).
 *
 * @param string[]               $submenu_items_html <li> markup per language.
 * @param array{google_translate?: bool} $options
 */
function bl_language_switcher_dropdown_html(
	array $submenu_items_html,
	string $current_lang_id,
	string $current_label,
	array $options = []
): string {
	if ($submenu_items_html === []) {
		return '';
	}

	$current_lang_id = strtolower(preg_replace('/[^a-z]/', '', $current_lang_id));
	$submenu_id = 'sub-menu-languages';
	$flag_url = bl_language_flag_url($current_lang_id);
	$google_translate = !empty($options['google_translate']);

	$toggle_label = $current_label !== ''
		? sprintf(
			/* translators: %s: current language name */
			__('Select language, current: %s', 'baselayer'),
			$current_label
		)
		: __('Select language', 'baselayer');

	$flag_alt = $current_label !== ''
		? sprintf(
			/* translators: %s: language name */
			__('Flag for %s', 'baselayer'),
			$current_label
		)
		: '';

	ob_start();
	?>
	<nav
		class="bl-language-switcher"
		aria-label="<?= esc_attr__('Languages', 'baselayer') ?>"
		<?= $google_translate ? ' data-google-translate-toggler translate="no"' : '' ?>
	>
		<ul class="bl-language-switcher__list">
			<li class="menu-item menu-item-has-children menu-depth-0 bl-language-switcher__item">
				<button
					type="button"
					class="sub-menu-toggle bl-language-switcher__trigger"
					aria-expanded="false"
					aria-controls="<?= esc_attr($submenu_id) ?>"
					aria-label="<?= esc_attr($toggle_label) ?>"
					<?= $current_lang_id !== '' ? ' data-language="' . esc_attr($current_lang_id) . '"' : '' ?>
				>
					<?php if ($flag_url !== '') : ?>
						<img
							class="bl-language-switcher__current-flag bl-lang-item__flag"
							src="<?= esc_url($flag_url) ?>"
							alt="<?= esc_attr($flag_alt) ?>"
							width="20"
							height="15"
							decoding="async"
						/>
					<?php endif ?>
					<?= bl_language_switcher_submenu_arrow_svg() ?>
				</button>
				<ul id="<?= esc_attr($submenu_id) ?>" class="sub-menu menu-depth-1">
					<?= implode("\n", $submenu_items_html) ?>
				</ul>
			</li>
		</ul>
	</nav>
	<?php
	return (string) ob_get_clean();
}

/**
 * Language switcher markup (same output as shortcode [bl_language_switcher]).
 */
function bl_language_switcher_html(): string
{
	if (!bl_language_switcher_available()) {
		return '';
	}

	if (function_exists('bl_uses_google_translate') && bl_uses_google_translate()) {
		return bl_google_translate_switcher_html();
	}

	return bl_content_language_switcher_html();
}

add_shortcode('bl_language_switcher', static function ($atts = [], $content = null, $tag = ''): string {
	unset($atts, $content, $tag);
	return bl_language_switcher_html();
});
