<?php

defined('ABSPATH') || exit;

/**
 * Request client IP for security (login limit, IP blocking, etc.).
 *
 * Filter: `baselayer_client_ip` — override the resolved address (e.g. tests: return a fixed string).
 *
 * Local / testing: when `WP_DEBUG` is true, you may define `BL_SIMULATE_CLIENT_IP` in wp-config.php
 * to a valid IPv4/IPv6 string; it replaces detection for this request only (never used without WP_DEBUG).
 *
 * @since Theme uses this instead of reading REMOTE_ADDR directly so proxies and tests behave consistently.
 */
function bl_client_ip(): string
{
	if (defined('WP_DEBUG') && WP_DEBUG && defined('BL_SIMULATE_CLIENT_IP')) {
		$sim = BL_SIMULATE_CLIENT_IP;
		if (is_string($sim)) {
			$sim = trim($sim);
			if ($sim !== '' && filter_var($sim, FILTER_VALIDATE_IP)) {
				return (string) apply_filters('baselayer_client_ip', bl_security_normalize_ipv4_mapped($sim));
			}
		}
	}

	$remote = '';
	if (!empty($_SERVER['REMOTE_ADDR'])) {
		$remote = trim((string) wp_unslash($_SERVER['REMOTE_ADDR']));
	}
	$xff_raw = isset($_SERVER['HTTP_X_FORWARDED_FOR']) ? (string) wp_unslash($_SERVER['HTTP_X_FORWARDED_FOR']) : '';

	if ($xff_raw !== '' && $remote !== '' && filter_var($remote, FILTER_VALIDATE_IP) && bl_security_ip_is_non_public($remote)) {
		$parts = array_map('trim', explode(',', $xff_raw));
		foreach ($parts as $p) {
			if ($p !== '' && filter_var($p, FILTER_VALIDATE_IP)) {
				return (string) apply_filters('baselayer_client_ip', bl_security_normalize_ipv4_mapped($p));
			}
		}
	}

	if ($remote !== '' && filter_var($remote, FILTER_VALIDATE_IP)) {
		return (string) apply_filters('baselayer_client_ip', bl_security_normalize_ipv4_mapped($remote));
	}

	if (!empty($_SERVER['HTTP_X_REAL_IP'])) {
		$real = trim((string) wp_unslash($_SERVER['HTTP_X_REAL_IP']));
		if ($real !== '' && filter_var($real, FILTER_VALIDATE_IP)) {
			return (string) apply_filters('baselayer_client_ip', bl_security_normalize_ipv4_mapped($real));
		}
	}

	if ($xff_raw !== '') {
		$parts = array_map('trim', explode(',', $xff_raw));
		foreach ($parts as $p) {
			if ($p !== '' && filter_var($p, FILTER_VALIDATE_IP)) {
				return (string) apply_filters('baselayer_client_ip', bl_security_normalize_ipv4_mapped($p));
			}
		}
	}

	return (string) apply_filters('baselayer_client_ip', '');
}

/**
 * @internal Used by bl_client_ip().
 */
function bl_security_ip_is_non_public(string $ip): bool
{
	return !filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE);
}

/**
 * @internal Map IPv4-mapped IPv6 to IPv4 for stable keys.
 */
function bl_security_normalize_ipv4_mapped(string $ip): string
{
	if (stripos($ip, '::ffff:') === 0) {
		$v4 = substr($ip, 7);
		if (filter_var($v4, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4)) {
			return $v4;
		}
	}
	return $ip;
}
