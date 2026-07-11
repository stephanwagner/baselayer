<?php

defined('ABSPATH') || exit;

/**
 * Site logo URL from the Customizer (custom_logo), if set.
 */
function fs_schema_site_logo_url(): string
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
 * @param mixed $logo ACF image array, attachment ID, or URL string.
 */
function fs_schema_resolve_logo_url($logo): string
{
	if (is_array($logo) && !empty($logo['url']) && is_string($logo['url'])) {
		return $logo['url'];
	}

	if (is_numeric($logo)) {
		$url = wp_get_attachment_image_url((int) $logo, 'full');
		return is_string($url) ? $url : '';
	}

	if (is_string($logo) && $logo !== '') {
		return $logo;
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
function fs_schema_get_data(): ?array
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

	$logo = fs_schema_resolve_logo_url($schema['logo'] ?? null);
	if ($logo === '') {
		$logo = fs_schema_site_logo_url();
	}
	if ($logo !== '') {
		$data['logo'] = $logo;
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
function fs_schema_head(): void
{
	$data = fs_schema_get_data();
	if ($data === null) {
		return;
	}

	$json = wp_json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
	if (!is_string($json) || $json === '') {
		return;
	}

	echo '<script type="application/ld+json">' . $json . '</script>' . "\n";
}
add_action('wp_head', 'fs_schema_head');
