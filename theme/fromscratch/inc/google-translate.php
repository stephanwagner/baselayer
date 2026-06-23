<?php

defined('ABSPATH') || exit;

/**
 * Google Translate: consent modal, hidden widget mount, and language switcher markup.
 */

/**
 * Language switcher for Google Translate mode (buttons, no navigation).
 */
function fs_google_translate_switcher_html(): string
{
	$languages = fs_get_content_languages();
	if ($languages === []) {
		return '';
	}

	$page_lang = fs_get_default_language();
	if ($page_lang === '') {
		$page_lang = (string) ($languages[0]['id'] ?? '');
	}
	if ($page_lang === '') {
		return '';
	}

	$items = [];
	foreach ($languages as $lang) {
		$id = isset($lang['id']) ? (string) $lang['id'] : '';
		if ($id === '') {
			continue;
		}

		$label = function_exists('fs_content_language_label')
			? fs_content_language_label($lang, 'name')
			: $id;
		$is_active = ($id === $page_lang);

		$items[] = sprintf(
			'<button type="button" class="fs-lang-item%s" data-language="%s" aria-current="%s">%s</button>',
			$is_active ? ' active' : '',
			esc_attr($id),
			$is_active ? 'true' : 'false',
			fs_language_switcher_item_content($id, $label)
		);
	}

	if ($items === []) {
		return '';
	}

	return '<ul class="fs-language-toggler" data-google-translate-toggler translate="no"><li>'
		. implode('</li><li>', $items)
		. '</li></ul>';
}

/**
 * Hidden Google Translate mount (widget loads here after consent).
 */
function fs_google_translate_element_markup(): void
{
	?>
	<div id="google_translate_element" class="google-translate__element" hidden aria-hidden="true"></div>
	<?php
}

/**
 * Consent modal source (opened from the header language switcher).
 */
function fs_google_translate_modal_markup(): void
{
	$privacy_url = function_exists('get_privacy_policy_url') ? get_privacy_policy_url() : '';
	?>
	<div class="google-translate-modal__source" hidden>
		<div data-modal-content="google-translate-consent" translate="no">
			<h2 class="modal__title">
				<?= esc_html__('Automatic page translation', 'fromscratch') ?>
			</h2>
			<div class="modal__text">
				<p>
					<?= esc_html__('If you agree, a connection to Google will be established to translate this page automatically. Content on this page and personal data such as your IP address may be transmitted to Google. Machine translations may contain errors.', 'fromscratch') ?>
				</p>
				<p>
					<?php
					if (is_string($privacy_url) && $privacy_url !== '') {
						echo wp_kses(
							sprintf(
								/* translators: 1: privacy policy link, 2: Google privacy policy link */
								__('More information is available in our %1$s and in the %2$s.', 'fromscratch'),
								'<a href="' . esc_url($privacy_url) . '">' . esc_html__('Privacy Policy', 'fromscratch') . '</a>',
								'<a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">' . esc_html__('Google Privacy Policy', 'fromscratch') . '</a>'
							),
							['a' => ['href' => true, 'target' => true, 'rel' => true]]
						);
					} else {
						echo wp_kses(
							sprintf(
								/* translators: %s: Google privacy policy link */
								__('More information is available in the %s.', 'fromscratch'),
								'<a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">' . esc_html__('Google Privacy Policy', 'fromscratch') . '</a>'
							),
							['a' => ['href' => true, 'target' => true, 'rel' => true]]
						);
					}
					?>
				</p>
			</div>
			<div class="modal__footer google-translate-modal__footer">
				<button
					type="button"
					class="modal__button button -small -outline"
					data-google-translate-decline
				>
					<span><?= esc_html__('Cancel', 'fromscratch') ?></span>
				</button>
				<button
					type="button"
					class="modal__button button -small"
					data-google-translate-accept
				>
					<span><?= esc_html__('Agree and translate', 'fromscratch') ?></span>
				</button>
			</div>
		</div>
	</div>
	<?php
}

add_action('wp_footer', 'fs_google_translate_element_markup', 4);
add_action('wp_footer', 'fs_google_translate_modal_markup', 5);
