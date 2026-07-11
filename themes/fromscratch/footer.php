<footer class="footer__wrapper">
	<div class="footer__container container">
		<div class="footer__text">
			<?php
			$company_name = function_exists('get_field') ? (string) get_field('theme_company', 'option') : '';
			$company_address = function_exists('get_field') ? (string) get_field('theme_address', 'option') : '';
			$company_phone = function_exists('get_field') ? (string) get_field('theme_phone', 'option') : '';
			$company_email = function_exists('get_field') ? (string) get_field('theme_email', 'option') : '';
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
		</div>
		<div class="footer-menu__wrapper">
			<?php fs_nav_menu([
				'theme_location' => 'footer_menu',
				'menu_class' => 'footer-menu__container',
				'container' => 'nav',
				'container_aria_label' => esc_attr__('Footer navigation', 'fromscratch'),
			]); ?>
		</div>
	</div>
</footer>

</div>

<?php wp_footer(); ?>

</body>

</html>
