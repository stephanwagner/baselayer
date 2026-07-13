<footer class="footer__wrapper">
	<div class="footer__container container">
		<div class="footer__text">
			<?php
			$company = function_exists('get_field') ? get_field('company', 'option') : null;
			$company = is_array($company) ? $company : [];
			$company_name = (string) ($company['name'] ?? '');
			$company_address = (string) ($company['address'] ?? '');
			$company_phone = (string) ($company['phone'] ?? '');
			$company_email = (string) ($company['email'] ?? '');
			?>
			<?php if ($company_name !== '') : ?>
				<b><?= esc_html($company_name) ?></b><br>
			<?php endif; ?>
			<?php if ($company_address !== '') : ?>
				<?= nl2br(esc_html($company_address)) ?><br>
			<?php endif; ?>
			<?php if ($company_phone !== '') : ?>
				<a href="tel:<?= esc_attr(preg_replace('/\s+/', '', $company_phone)) ?>"><?= esc_html($company_phone) ?></a><br>
			<?php endif; ?>
			<?php if ($company_email !== '') : ?>
				<a href="mailto:<?= esc_attr($company_email) ?>"><?= esc_html($company_email) ?></a>
			<?php endif; ?>
			<?php
			if (function_exists('bl_get_social_media_links') && function_exists('bl_render_template')) {
				$social_links = bl_get_social_media_links();
				if ($social_links !== []) {
					bl_render_template('social-media-links', ['links' => $social_links]);
				}
			}
			?>
		</div>
		<div class="footer-menu__wrapper">
			<?php bl_nav_menu([
				'theme_location' => 'footer_menu',
				'menu_class' => 'footer-menu__container',
				'container' => 'nav',
				'container_aria_label' => esc_attr__('Footer navigation', 'baselayer'),
			]); ?>
		</div>
	</div>
</footer>

</div>

<?php wp_footer(); ?>

</body>

</html>
