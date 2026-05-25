<?php

defined('ABSPATH') || exit;

$placeholder = isset($placeholder) && is_string($placeholder) ? $placeholder : '';
$label = isset($label) && is_string($label) ? $label : '';
$button = isset($button) && is_string($button) ? $button : '';
$value = isset($value) && is_string($value) ? $value : '';
$action = isset($action) && is_string($action) ? $action : '';
$id = isset($id) && is_string($id) ? $id : 'fs-search';
$class = isset($class) && is_string($class) ? $class : '';
$autofocus = !empty($autofocus);

$input_id = $id . '-field';
$form_class = trim('search-form ' . $class);
?>
<form role="search" method="get" class="<?= esc_attr($form_class) ?>" action="<?= esc_url($action) ?>">
	<?php if ($label !== '') { ?>
		<label class="search-form__label screen-reader-text" for="<?= esc_attr($input_id) ?>">
			<?= esc_html($label) ?>
		</label>
	<?php } ?>
	<div class="search-form__fields">
		<input
			type="search"
			class="search-form__input"
			id="<?= esc_attr($input_id) ?>"
			name="s"
			value="<?= esc_attr($value) ?>"
			placeholder="<?= esc_attr($placeholder) ?>"
			<?= $autofocus ? ' autofocus' : '' ?>>
		<button type="submit" class="search-form__submit button">
			<svg class="search-form__submit-icon" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
				<path d="M380-320q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l224 224q11 11 11 28t-11 28q-11 11-28 11t-28-11L532-372q-30 24-69 38t-83 14Zm0-80q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z" />
			</svg>
		</button>
	</div>
</form>