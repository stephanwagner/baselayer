<?php

/**
 * Themed one-shot toast (user meta, no query args). Not a core .notice, so admin common.js
 * does not relocate it. Rendered in admin_footer and wp_footer (logged-in front + admin bar purge).
 *
 * Same UI can be shown immediately via window.fsAdminNoticeShow(type, message) after admin assets print.
 */

defined('ABSPATH') || exit;

const BL_ADMIN_NOTICE_META = 'bl_admin_notice';

/**
 * Queue a one-shot message for a user, shown on the next full page load (wp-admin or front when logged in).
 *
 * @param int    $user_id WordPress user ID.
 * @param string $type    success|error|warning|info
 * @param string $message Plain text (stored stripped; use translated strings for i18n).
 */
function bl_admin_notice(int $user_id, string $type, string $message): void
{
	if ($user_id < 1) {
		return;
	}
	$message = wp_strip_all_tags($message, true);
	$message = trim($message);
	if ($message === '') {
		return;
	}
	$type = in_array($type, ['success', 'error', 'warning', 'info'], true) ? $type : 'info';
	update_user_meta($user_id, BL_ADMIN_NOTICE_META, [
		'type'    => $type,
		'message' => $message,
	]);
}

/**
 * Queue a toast for the current user (next full page load).
 */
function bl_admin_notice_current_user(string $type, string $message): void
{
	$uid = (int) get_current_user_id();
	if ($uid < 1) {
		return;
	}
	bl_admin_notice($uid, $type, $message);
}

/**
 * @param array{message?:string,type?:string} $data
 * @return array{message: string, type: string}|null
 */
function bl_admin_notice_normalize(array $data): ?array
{
	$type = (string) ($data['type'] ?? 'info');
	$type = in_array($type, ['success', 'error', 'warning', 'info'], true) ? $type : 'info';
	$message = isset($data['message']) ? trim(wp_strip_all_tags((string) $data['message'], true)) : '';
	if ($message === '') {
		return null;
	}

	return ['type' => $type, 'message' => $message];
}

/**
 * CSS variables for toast position (admin vs front).
 *
 * @return array{top: string, top_mobile: string}
 */
function bl_admin_notice_position_vars(): array
{
	if (is_admin()) {
		return ['top' => '40px', 'top_mobile' => '46px'];
	}
	return [
		'top'        => is_admin_bar_showing() ? '52px' : '1.25rem',
		'top_mobile' => is_admin_bar_showing() ? '58px' : '1.25rem',
	];
}

/**
 * Print shared toast styles + window.fsAdminNoticeShow once per request (logged-in).
 */
function bl_admin_notice_print_client_assets(): void
{
	static $printed = false;
	if ($printed || !is_user_logged_in()) {
		return;
	}
	$printed = true;
	$pos = bl_admin_notice_position_vars();
	$dismiss = esc_attr__('Dismiss notice', 'baselayer');
?>
	<style id="bl-admin-notice--base">
		#bl-admin-notice-root.bl-admin-notice {
			transform: translateX(64px);
			position: fixed;
			z-index: 100050;
			right: 12px;
			left: auto;
			top: <?= esc_attr($pos['top']) ?>;
			max-width: min(460px, calc(100vw - 30px));
			box-shadow: 0 1px 1px rgba(0, 0, 0, .04), 0 1px 3px rgba(0, 0, 0, .1);
			border: 1px solid var(--bl-an-border, #50575e);
			border-left: 4px solid var(--bl-an-border, #50575e);
			border-radius: 6px;
			background: #fff;
			color: #1d2327;
			font-size: 13px;
			line-height: 1.5;
			opacity: 0;
			pointer-events: none;
			transition: transform 320ms, opacity 320ms;
			will-change: transform, opacity;
		}

		#bl-admin-notice-root.bl-admin-notice.is-open {
			transform: translateX(0);
			opacity: 1;
			pointer-events: auto;
		}

		#bl-admin-notice-root.bl-admin-notice.is-closed {
			opacity: 0 !important;
			pointer-events: none;
		}

		#bl-admin-notice-root.bl-admin-notice--success {
			--bl-an-border: #00a32a;
			background: #edfaef;
		}

		#bl-admin-notice-root.bl-admin-notice--error {
			--bl-an-border: #d63638;
			background: #fcf0f1;
		}

		#bl-admin-notice-root.bl-admin-notice--warning {
			--bl-an-border: #dba617;
			background: #fcf9e8;
		}

		#bl-admin-notice-root.bl-admin-notice--info {
			--bl-an-border: #72aee6;
			background: #f0f6fc;
		}

		#bl-admin-notice-root .bl-admin-notice__inner {
			display: flex;
			align-items: center;
			gap: 16px;
			padding: 8px 8px 8px 12px;
			font-weight: 500;
		}

		#bl-admin-notice-root .bl-admin-notice__message {
			flex: 1;
			margin: 0;
			padding: 0;
		}

		#bl-admin-notice-root .bl-admin-notice__dismiss {
			flex-shrink: 0;
			height: 24px;
			width: 24px;
			margin: 0;
			padding: 0;
			border: 0;
			background: transparent;
			color: #646970;
			cursor: pointer;
			border-radius: 2px;
			align-self: top;
			display: flex;
			justify-content: center;
			align-items: center;
			align-self: flex-start;
		}

		#bl-admin-notice-root .bl-admin-notice__dismiss svg {
			display: block;
			width: 14px;
			height: 14px;
		}

		#bl-admin-notice-root .bl-admin-notice__dismiss:hover,
		#bl-admin-notice-root .bl-admin-notice__dismiss:focus {
			color: #1d2327;
		}

		@media (max-width: 782px) {
			#bl-admin-notice-root.bl-admin-notice {
				top: <?= esc_attr($pos['top_mobile']) ?>;
			}
		}
	</style>
	<script>
		(function() {
			var dismissLabel = <?= wp_json_encode($dismiss, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) ?>;
			window.fsAdminNoticeShow = window.fsAdminNoticeShow || function(type, message) {
				var ok = {
					success: 1,
					error: 1,
					warning: 1,
					info: 1
				};
				if (!ok[type]) {
					type = 'info';
				}
				message = String(message || '').replace(/^\s+|\s+$/g, '');
				if (!message) {
					return;
				}
				var existing = document.getElementById('bl-admin-notice-root');
				if (existing && existing.parentNode) {
					existing.parentNode.removeChild(existing);
				}
				var root = document.createElement('div');
				root.id = 'bl-admin-notice-root';
				root.className = 'bl-admin-notice bl-admin-notice--' + type;
				root.setAttribute('role', type === 'error' ? 'alert' : 'status');
				root.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite');
				var inner = document.createElement('div');
				inner.className = 'bl-admin-notice__inner';
				var p = document.createElement('p');
				p.className = 'bl-admin-notice__message';
				p.textContent = message;
				var btn = document.createElement('button');
				btn.type = 'button';
				btn.className = 'bl-admin-notice__dismiss';
				btn.setAttribute('aria-label', dismissLabel);
				btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M480-424 284-228q-11 11-28 11t-28-11q-11-11-11-28t11-28l196-196-196-196q-11-11-11-28t11-28q11-11 28-11t28 11l196 196 196-196q11-11 28-11t28 11q11 11 11 28t-11 28L536-480l196 196q11 11 11 28t-11 28q-11 11-28 11t-28-11L480-424Z"></path></svg>';
				inner.appendChild(p);
				inner.appendChild(btn);
				root.appendChild(inner);
				document.body.appendChild(root);
				var autoTimer = null;
				var done = false;

				function removeNode() {
					if (root && root.parentNode) {
						root.parentNode.removeChild(root);
					}
				}

				function close() {
					if (done) {
						return;
					}
					done = true;
					if (autoTimer !== null) {
						clearTimeout(autoTimer);
						autoTimer = null;
					}
					root.classList.remove('is-open');
					root.classList.add('is-closed');
					setTimeout(removeNode, 320);
				}

				function show() {
					requestAnimationFrame(function() {
						requestAnimationFrame(function() {
							root.classList.add('is-open');
							autoTimer = setTimeout(close, 6000);
						});
					});
				}
				show();
				btn.addEventListener('click', close);
			};
		})();
	</script>
<?php
}

/**
 * Print the toast if user meta is set; clears meta before output.
 */
function bl_admin_notice_maybe_output(): void
{
	if (!is_user_logged_in()) {
		return;
	}
	bl_admin_notice_print_client_assets();
	$user_id = (int) get_current_user_id();
	$raw     = get_user_meta($user_id, BL_ADMIN_NOTICE_META, true);
	if (!is_array($raw)) {
		if ($raw !== false && $raw !== '') {
			delete_user_meta($user_id, BL_ADMIN_NOTICE_META);
		}

		return;
	}
	$data = bl_admin_notice_normalize($raw);
	delete_user_meta($user_id, BL_ADMIN_NOTICE_META);
	if ($data === null) {
		return;
	}
	$type    = $data['type'];
	$message = $data['message'];
?>
	<script>
		(function() {
			if (typeof window.fsAdminNoticeShow === 'function') {
				window.fsAdminNoticeShow(<?= wp_json_encode($type, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) ?>, <?= wp_json_encode($message, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) ?>);
			}
		})();
	</script>
<?php
}

add_action('admin_footer', 'bl_admin_notice_print_client_assets', 0);
add_action('wp_footer', 'bl_admin_notice_print_client_assets', 0);
add_action('admin_footer', 'bl_admin_notice_maybe_output', 1);
add_action('wp_footer', 'bl_admin_notice_maybe_output', 1);
