<?php
/**
 * This is my Block
 */

$text2 = bl_block_field('text_2');
$bild = bl_block_field('bild');
$datei = bl_block_field('datei');
$seite2 = bl_block_field('seite_2');
$link = bl_block_field('link');
$url = bl_block_field('url');
$text = bl_block_field('text');

$wrapper_attributes = get_block_wrapper_attributes([
	'class' => 'bl-this-is-my-block',
]);
?>
<div <?php echo $wrapper_attributes; ?>>
	<?php if ($text2) : ?>
		<p class="bl-this-is-my-block__text_2"><?php echo esc_html($text2); ?></p>
	<?php endif; ?>
	<?php if ($bild) : ?>
		<div class="bl-this-is-my-block__bild">
			<?php foreach ($bild as $image) : ?>
				<?php
				echo function_exists('bl_img')
					? bl_img($image['ID'], 'large', ['class' => 'bl-this-is-my-block__bild-item'])
					: wp_get_attachment_image($image['ID'], 'large', false, ['class' => 'bl-this-is-my-block__bild-item']);
				?>
			<?php endforeach; ?>
		</div>
	<?php endif; ?>
	<?php if ($datei) : ?>
		<p class="bl-this-is-my-block__datei"><a href="<?php echo esc_url($datei['url']); ?>"><?php echo esc_html($datei['title'] !== '' ? $datei['title'] : $datei['filename']); ?></a></p>
	<?php endif; ?>
	<?php if ($seite2) : ?>
		<p class="bl-this-is-my-block__seite_2"><a href="<?php echo esc_url($seite2['url']); ?>"><?php echo esc_html($seite2['title']); ?></a></p>
	<?php endif; ?>
	<?php if ($link) : ?>
		<p class="bl-this-is-my-block__link"><a href="<?php echo esc_url($link['url']); ?>"<?php echo !empty($link['target']) ? ' target="_blank" rel="noopener noreferrer"' : ''; ?>><?php echo esc_html($link['title']); ?></a></p>
	<?php endif; ?>
	<?php if ($url) : ?>
		<p class="bl-this-is-my-block__url"><a href="<?php echo esc_url($url); ?>"><?php echo esc_html($url); ?></a></p>
	<?php endif; ?>
	<?php if ($text) : ?>
		<p class="bl-this-is-my-block__text"><?php echo esc_html($text); ?></p>
	<?php endif; ?>
</div>
