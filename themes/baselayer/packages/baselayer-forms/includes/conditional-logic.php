<?php
/**
 * Frontend + submit evaluation for field conditional_logic.
 */

defined('ABSPATH') || exit;

/**
 * Default posted-like values from field defaults (for initial visibility).
 *
 * @param list<array<string, mixed>> $fields
 * @return array<string, mixed>
 */
function bl_forms_fields_default_raw(array $fields): array
{
	$raw = [];
	foreach (bl_forms_iter_fields($fields) as $field) {
		$type = (string) ($field['type'] ?? '');
		if (in_array($type, bl_forms_content_field_types(), true) || $type === 'honeypot') {
			continue;
		}
		$name = (string) ($field['name'] ?? '');
		if ($name === '') {
			continue;
		}
		if ($type === 'toggle' || $type === 'terms') {
			if (bl_forms_field_default_checked($field)) {
				$raw[$name] = '1';
			}
			continue;
		}
		if (
			$type === 'checkboxes'
			|| ($type === 'button_group' && !empty($field['multiple']))
			|| ($type === 'select' && !empty($field['multiple']))
		) {
			$raw[$name] = bl_forms_field_default_values($field);
			continue;
		}
		if (in_array($type, ['file', 'image'], true)) {
			continue;
		}
		if (in_array($type, ['date', 'time', 'datetime'], true)) {
			$raw[$name] = bl_forms_resolve_temporal_bound($field, 'default');
			continue;
		}
		if ($type === 'range') {
			$raw[$name] = bl_forms_resolve_range_default($field);
			continue;
		}
		$default = $field['default_value'] ?? '';
		$raw[$name] = is_scalar($default) ? (string) $default : '';
	}

	return $raw;
}

/**
 * Map field id => field config.
 *
 * @param list<array<string, mixed>> $fields
 * @return array<string, array<string, mixed>>
 */
function bl_forms_fields_by_id(array $fields): array
{
	$by_id = [];
	foreach (bl_forms_iter_fields($fields) as $field) {
		$id = (string) ($field['id'] ?? '');
		if ($id !== '') {
			$by_id[$id] = $field;
		}
	}

	return $by_id;
}

/**
 * Whether an upload field has at least one file in the raw $_FILES payload.
 *
 * @param array<string, mixed> $files
 */
function bl_forms_logic_upload_present(string $name, array $files): bool
{
	if ($name === '' || !isset($files['fields']) || !is_array($files['fields'])) {
		return false;
	}
	$bucket = $files['fields'];
	$error = $bucket['error'][$name] ?? null;
	if ($error === null) {
		return false;
	}
	if (is_array($error)) {
		foreach ($error as $code) {
			if ((int) $code === UPLOAD_ERR_OK) {
				return true;
			}
		}

		return false;
	}

	return (int) $error === UPLOAD_ERR_OK;
}

/**
 * Value used when evaluating a condition against a source field.
 *
 * @param array<string, mixed> $source_field
 * @param array<string, mixed> $raw
 * @param array<string, mixed> $files
 * @return mixed
 */
function bl_forms_logic_source_value(array $source_field, array $raw, array $files = [])
{
	$name = (string) ($source_field['name'] ?? '');
	$type = (string) ($source_field['type'] ?? '');
	if ($name === '') {
		return '';
	}

	if (in_array($type, ['file', 'image'], true)) {
		return bl_forms_logic_upload_present($name, $files) ? '1' : '';
	}

	$raw_value = $raw[$name] ?? null;

	if ($type === 'toggle' || $type === 'terms') {
		return !empty($raw_value) ? '1' : '';
	}

	$multi = $type === 'checkboxes'
		|| ($type === 'button_group' && !empty($source_field['multiple']))
		|| ($type === 'select' && !empty($source_field['multiple']));

	if ($multi) {
		$list = [];
		if (is_array($raw_value)) {
			foreach ($raw_value as $item) {
				if (is_scalar($item) && (string) $item !== '') {
					$list[] = (string) $item;
				}
			}
		} elseif (is_scalar($raw_value) && (string) $raw_value !== '') {
			$list[] = (string) $raw_value;
		}

		return $list;
	}

	if (is_array($raw_value)) {
		return '';
	}

	return $raw_value === null ? '' : (string) $raw_value;
}

/**
 * Whether a scalar/list value is considered empty for logic operators.
 *
 * @param mixed $value
 */
function bl_forms_logic_value_is_empty($value): bool
{
	if (is_array($value)) {
		return $value === [];
	}

	return trim((string) $value) === '';
}

/**
 * Compare two values with >, <, >=, <= (numbers or lexical for dates/times).
 *
 * @param mixed $left
 * @param mixed $right
 */
function bl_forms_logic_compare($left, $right, string $operator): bool
{
	$a = is_array($left) ? '' : (string) $left;
	$b = is_array($right) ? '' : (string) $right;
	if ($a === '' || $b === '') {
		return false;
	}

	if (is_numeric($a) && is_numeric($b)) {
		$left_n = (float) $a;
		$right_n = (float) $b;
		switch ($operator) {
			case '>':
				return $left_n > $right_n;
			case '<':
				return $left_n < $right_n;
			case '>=':
				return $left_n >= $right_n;
			case '<=':
				return $left_n <= $right_n;
		}

		return false;
	}

	$cmp = strcmp($a, $b);
	switch ($operator) {
		case '>':
			return $cmp > 0;
		case '<':
			return $cmp < 0;
		case '>=':
			return $cmp >= 0;
		case '<=':
			return $cmp <= 0;
	}

	return false;
}

/**
 * Evaluate one rule against a source value.
 *
 * @param array{field?: string, operator?: string, value?: string} $rule
 * @param mixed $value
 */
function bl_forms_logic_rule_passes(array $rule, $value): bool
{
	$operator = (string) ($rule['operator'] ?? '');
	$expected = (string) ($rule['value'] ?? '');
	$empty = bl_forms_logic_value_is_empty($value);

	switch ($operator) {
		case 'checked':
			return !$empty && !is_array($value) && (string) $value !== '0';
		case 'not_checked':
			return $empty || (!is_array($value) && (string) $value === '0');
		case '==empty':
			return $empty;
		case '!=empty':
			return !$empty;
		case '==':
			if (is_array($value)) {
				return in_array($expected, $value, true);
			}

			return (string) $value === $expected;
		case '!=':
			if (is_array($value)) {
				return !in_array($expected, $value, true);
			}

			return (string) $value !== $expected;
		case 'contains':
			if (is_array($value)) {
				return in_array($expected, $value, true);
			}

			return $expected !== '' && str_contains((string) $value, $expected);
		case 'not_contains':
			if (is_array($value)) {
				return !in_array($expected, $value, true);
			}

			return $expected === '' || !str_contains((string) $value, $expected);
		case '>':
		case '<':
		case '>=':
		case '<=':
			return bl_forms_logic_compare($value, $expected, $operator);
		default:
			return false;
	}
}

/**
 * Whether a field should be shown given current submission-like values.
 *
 * Missing / disabled logic → always shown.
 *
 * @param array<string, mixed>       $field
 * @param list<array<string, mixed>> $all_fields
 * @param array<string, mixed>       $raw
 * @param array<string, mixed>       $files
 */
function bl_forms_field_conditions_met(array $field, array $all_fields, array $raw, array $files = []): bool
{
	$logic = bl_forms_sanitize_conditional_logic($field['conditional_logic'] ?? null);
	if ($logic === null || empty($logic['enabled']) || empty($logic['groups'])) {
		return true;
	}

	$by_id = bl_forms_fields_by_id($all_fields);

	foreach ($logic['groups'] as $group) {
		if (!is_array($group) || $group === []) {
			continue;
		}
		$group_ok = true;
		foreach ($group as $rule) {
			if (!is_array($rule)) {
				$group_ok = false;
				break;
			}
			$source_id = (string) ($rule['field'] ?? '');
			$source = $by_id[$source_id] ?? null;
			if ($source === null) {
				$group_ok = false;
				break;
			}
			$value = bl_forms_logic_source_value($source, $raw, $files);
			if (!bl_forms_logic_rule_passes($rule, $value)) {
				$group_ok = false;
				break;
			}
		}
		if ($group_ok) {
			return true;
		}
	}

	return false;
}

/**
 * Map leaf field id → ancestor layout fields (column / section / tab).
 *
 * @param list<array<string, mixed>>       $fields
 * @param list<array<string, mixed>>       $ancestors
 * @return array<string, list<array<string, mixed>>>
 */
function bl_forms_build_logic_ancestor_map(array $fields, array $ancestors = []): array
{
	$map = [];
	$layout_types = function_exists('bl_forms_layout_field_types')
		? bl_forms_layout_field_types()
		: ['column', 'section', 'tab'];

	foreach ($fields as $field) {
		if (!is_array($field)) {
			continue;
		}
		$type = (string) ($field['type'] ?? '');
		if (in_array($type, $layout_types, true)) {
			$children = isset($field['children']) && is_array($field['children']) ? $field['children'] : [];
			$next = $ancestors;
			$next[] = $field;
			foreach (bl_forms_build_logic_ancestor_map($children, $next) as $id => $chain) {
				$map[$id] = $chain;
			}
			continue;
		}
		$id = (string) ($field['id'] ?? '');
		if ($id !== '') {
			$map[$id] = $ancestors;
		}
	}

	return $map;
}

/**
 * Whether a leaf field is visible given its own logic and ancestor layout logic.
 *
 * @param array<string, mixed>                        $field
 * @param list<array<string, mixed>>                  $all_fields
 * @param array<string, mixed>                        $raw
 * @param array<string, mixed>                        $files
 * @param array<string, list<array<string, mixed>>>   $ancestor_map
 */
function bl_forms_field_is_effectively_visible(
	array $field,
	array $all_fields,
	array $raw,
	array $files = [],
	array $ancestor_map = []
): bool {
	$id = (string) ($field['id'] ?? '');
	if ($id !== '' && isset($ancestor_map[$id]) && is_array($ancestor_map[$id])) {
		foreach ($ancestor_map[$id] as $ancestor) {
			if (!is_array($ancestor)) {
				continue;
			}
			if (!bl_forms_field_conditions_met($ancestor, $all_fields, $raw, $files)) {
				return false;
			}
		}
	}

	return bl_forms_field_conditions_met($field, $all_fields, $raw, $files);
}

/**
 * Whether render context says this field starts hidden by logic.
 *
 * @param array<string, mixed> $field
 * @param array{all_fields?: list<array<string, mixed>>, default_raw?: array<string, mixed>} $context
 */
function bl_forms_field_logic_starts_hidden(array $field, array $context): bool
{
	$logic = bl_forms_sanitize_conditional_logic($field['conditional_logic'] ?? null);
	if ($logic === null || empty($logic['enabled'])) {
		return false;
	}
	$all = $context['all_fields'] ?? null;
	$raw = $context['default_raw'] ?? null;
	if (!is_array($all) || !is_array($raw)) {
		return false;
	}

	return !bl_forms_field_conditions_met($field, $all, $raw);
}

/**
 * data-bl-field-id + conditional_logic attributes (and initial hidden).
 *
 * @param array<string, mixed> $field
 * @param array{all_fields?: list<array<string, mixed>>, default_raw?: array<string, mixed>} $context
 */
function bl_forms_field_id_and_logic_attrs(array $field, array $context = []): string
{
	$attrs = '';
	$field_id = (string) ($field['id'] ?? '');
	if ($field_id !== '') {
		$attrs .= ' data-bl-field-id="' . esc_attr($field_id) . '"';
	}
	$logic = bl_forms_sanitize_conditional_logic($field['conditional_logic'] ?? null);
	if ($logic === null || empty($logic['enabled'])) {
		return $attrs;
	}
	$attrs .= ' data-bl-conditional-logic="' . esc_attr((string) wp_json_encode($logic)) . '"';
	if (bl_forms_field_logic_starts_hidden($field, $context)) {
		$attrs .= ' hidden';
	}

	return $attrs;
}
