<?php

defined('ABSPATH') || exit;

/**
 * Site logo URL from the Customizer (custom_logo), if set.
 */
function bl_schema_site_logo_url(): string
{
	$logo_id = (int) get_theme_mod('custom_logo');
	if ($logo_id <= 0) {
		return '';
	}

	$url = wp_get_attachment_image_url($logo_id, 'full');
	return is_string($url) ? $url : '';
}

/**
 * Resolve an ACF image field value to a full URL.
 *
 * @param mixed $image ACF image array, attachment ID, or URL string.
 */
function bl_schema_resolve_image_url($image): string
{
	if (is_array($image) && !empty($image['url']) && is_string($image['url'])) {
		return $image['url'];
	}

	if (is_numeric($image)) {
		$url = wp_get_attachment_image_url((int) $image, 'full');
		return is_string($url) ? $url : '';
	}

	if (is_string($image) && $image !== '') {
		return $image;
	}

	return '';
}

/**
 * Build the Schema.org Organization/LocalBusiness graph from ACF options.
 *
 * Requires Type and Name. Returns null when schema should not be output.
 *
 * @return array<string, mixed>|null
 */
function bl_schema_get_data(): ?array
{
	if (!function_exists('get_field')) {
		return null;
	}

	if (!get_field('has_schema', 'option')) {
		return null;
	}

	$schema = get_field('schema', 'option');
	if (!is_array($schema)) {
		return null;
	}

	$type = trim((string) ($schema['type'] ?? ''));
	$name = trim((string) ($schema['organization_name'] ?? ''));
	if ($name === '') {
		$company = get_field('company', 'option');
		$name = is_array($company) ? trim((string) ($company['name'] ?? '')) : '';
	}

	if ($type === '' || $name === '') {
		return null;
	}

	$data = [
		'@context' => 'https://schema.org',
		'@type' => $type,
		'name' => $name,
	];

	$description = trim((string) ($schema['description'] ?? ''));
	if ($description !== '') {
		$description = wp_strip_all_tags($description);
		$description = trim(preg_replace('/\R+/u', ' ', $description) ?? $description);
		$description = trim(preg_replace('/\s+/u', ' ', $description) ?? $description);
		if ($description !== '') {
			$data['description'] = $description;
		}
	}

	$website = trim((string) ($schema['website'] ?? ''));
	$data['url'] = $website !== '' ? $website : home_url('/');

	$logo = bl_schema_resolve_image_url($schema['logo'] ?? null);
	if ($logo === '') {
		$logo = bl_schema_site_logo_url();
	}
	if ($logo !== '') {
		$data['logo'] = $logo;
	}

	$image = bl_schema_resolve_image_url($schema['image'] ?? null);
	if ($image !== '') {
		$data['image'] = $image;
	}

	$phone = trim((string) ($schema['phone'] ?? ''));
	if ($phone !== '') {
		$data['telephone'] = $phone;
	}

	$email = trim((string) ($schema['email'] ?? ''));
	if ($email !== '') {
		$data['email'] = $email;
	}

	$street = trim((string) ($schema['street'] ?? ''));
	$postal_code = trim((string) ($schema['zip'] ?? $schema['postal_code'] ?? ''));
	$city = trim((string) ($schema['city'] ?? ''));
	$country = trim((string) ($schema['country'] ?? ''));

	if ($street !== '' || $postal_code !== '' || $city !== '' || $country !== '') {
		$address = ['@type' => 'PostalAddress'];
		if ($street !== '') {
			$address['streetAddress'] = $street;
		}
		if ($postal_code !== '') {
			$address['postalCode'] = $postal_code;
		}
		if ($city !== '') {
			$address['addressLocality'] = $city;
		}
		if ($country !== '') {
			$address['addressCountry'] = $country;
		}
		$data['address'] = $address;
	}

	$same_as = [];
	$profiles = $schema['social_profiles'] ?? null;
	if (is_array($profiles)) {
		foreach ($profiles as $row) {
			if (!is_array($row)) {
				continue;
			}
			$url = trim((string) ($row['url'] ?? ''));
			if ($url !== '') {
				$same_as[] = $url;
			}
		}
	}
	if ($same_as !== []) {
		$data['sameAs'] = array_values(array_unique($same_as));
	}

	return $data;
}

/**
 * Print JSON-LD schema in <head> when ACF schema options are complete.
 */
function bl_schema_head(): void
{
	$data = bl_schema_get_data();
	if ($data === null) {
		return;
	}

	$json = wp_json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
	if (!is_string($json) || $json === '') {
		return;
	}

	echo '<script type="application/ld+json">' . $json . '</script>' . "\n";
}
add_action('wp_head', 'bl_schema_head');

/**
 * FAQ items collected from Accordion blocks during render.
 *
 * @var list<array{question: string, answer: string}>
 */
$GLOBALS['bl_schema_faq_items'] = [];

/**
 * Normalize text for FAQ schema (strip tags, collapse whitespace).
 */
function bl_schema_faq_plain_text(string $html): string
{
	$text = wp_strip_all_tags($html);
	$text = html_entity_decode($text, ENT_QUOTES | ENT_HTML5, 'UTF-8');
	$text = trim(preg_replace('/\R+/u', ' ', $text) ?? $text);
	$text = trim(preg_replace('/\s+/u', ' ', $text) ?? $text);

	return $text;
}

/**
 * Register one FAQ Q&A from an Accordion marked for FAQ schema.
 */
function bl_schema_faq_collect(string $question, string $answer_html): void
{
	if (is_admin()) {
		return;
	}

	$question = bl_schema_faq_plain_text($question);
	$answer = bl_schema_faq_plain_text($answer_html);

	if ($question === '' || $answer === '') {
		return;
	}

	if (!isset($GLOBALS['bl_schema_faq_items']) || !is_array($GLOBALS['bl_schema_faq_items'])) {
		$GLOBALS['bl_schema_faq_items'] = [];
	}

	$GLOBALS['bl_schema_faq_items'][] = [
		'question' => $question,
		'answer'   => $answer,
	];
}

/**
 * Build FAQPage Schema.org data from collected Accordion items.
 *
 * @return array<string, mixed>|null
 */
function bl_schema_faq_get_data(): ?array
{
	$items = $GLOBALS['bl_schema_faq_items'] ?? [];
	if (!is_array($items) || $items === []) {
		return null;
	}

	$main_entity = [];
	foreach ($items as $item) {
		if (!is_array($item)) {
			continue;
		}
		$question = isset($item['question']) && is_string($item['question']) ? $item['question'] : '';
		$answer = isset($item['answer']) && is_string($item['answer']) ? $item['answer'] : '';
		if ($question === '' || $answer === '') {
			continue;
		}

		$main_entity[] = [
			'@type' => 'Question',
			'name' => $question,
			'acceptedAnswer' => [
				'@type' => 'Answer',
				'text' => $answer,
			],
		];
	}

	if ($main_entity === []) {
		return null;
	}

	return [
		'@context' => 'https://schema.org',
		'@type' => 'FAQPage',
		'mainEntity' => $main_entity,
	];
}

/**
 * Print FAQPage JSON-LD after the page content has rendered Accordion blocks.
 */
function bl_schema_faq_footer(): void
{
	if (is_admin()) {
		return;
	}

	$data = bl_schema_faq_get_data();
	if ($data === null) {
		return;
	}

	$json = wp_json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
	if (!is_string($json) || $json === '') {
		return;
	}

	echo '<script type="application/ld+json">' . $json . '</script>' . "\n";
}
add_action('wp_footer', 'bl_schema_faq_footer', 20);