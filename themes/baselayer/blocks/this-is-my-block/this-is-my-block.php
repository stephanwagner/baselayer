<?php
/**
 * This is my Block
 */

$text2 = $values['text_2'] ?? '';
$bild = $values['bild'] ?? '';
$datei = $values['datei'] ?? '';
$seite2 = $values['seite_2'] ?? '';
$link = $values['link'] ?? '';
$url = $values['url'] ?? '';
$text = $values['text'] ?? '';

$wrapper_attributes = get_block_wrapper_attributes([
	'class' => 'bl-this-is-my-block',
]);
?>
<div <?php echo $wrapper_attributes; ?>>
	<?php if ((string) $text2 !== '') : ?>
		<p><?php echo esc_html((string) $text2); ?></p>
	<?php endif; ?>
	<?php if ((string) $bild !== '') : ?>
		<p><?php echo esc_html((string) $bild); ?></p>
	<?php endif; ?>
	<?php if ((string) $datei !== '') : ?>
		<p><?php echo esc_html((string) $datei); ?></p>
	<?php endif; ?>
	<?php if ((string) $seite2 !== '') : ?>
		<p><?php echo esc_html((string) $seite2); ?></p>
	<?php endif; ?>
	<?php if ((string) $link !== '') : ?>
		<p><?php echo esc_html((string) $link); ?></p>
	<?php endif; ?>
	<?php if ((string) $url !== '') : ?>
		<p><?php echo esc_html((string) $url); ?></p>
	<?php endif; ?>
	<?php if ((string) $text !== '') : ?>
		<p><?php echo esc_html((string) $text); ?></p>
	<?php endif; ?>
</div>
