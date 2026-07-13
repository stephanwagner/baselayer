import { findIconByValue } from './icon-catalog';
import { openIconPicker } from './icon-picker-service';
import { BlockOptionDescription } from '../block-option-help';

const { Button } = wp.components;
const { useRef } = wp.element;

const iconL10n = (typeof window !== 'undefined' && window.baselayerIcons) || {};
const iconLabels = iconL10n.labels || {};
const uiStrings = iconL10n.ui || {};

const t = (key, fallback) => uiStrings[key] || fallback;
const humanize = (slug) => slug.replace(/-/g, ' ').replace(/^\w/, (char) => char.toUpperCase());
const iconName = (icon) => icon.label || iconLabels[icon.filename] || humanize(icon.filename);

/**
 * Sidebar icon picker for block options (e.g. core/button).
 *
 * @param {Object}   props
 * @param {string}   [props.label]
 * @param {string}   [props.description]
 * @param {string}   props.value
 * @param {Function} props.onChange
 */
export function IconPicker({ label, description, value, onChange }) {
  const triggerRef = useRef(null);
  const selected = findIconByValue(value);

  const openPicker = () => {
    openIconPicker({
      currentValue: value,
      onSelect: onChange,
      returnFocus: triggerRef.current,
    });
  };

  return (
    <div className="fs-icon-picker">
      {label ? <span className="fs-icon-picker__label">{label}</span> : null}

      {selected ? (
        <div className="fs-icon-picker__value">
          <span className={'fs-icon -icon-' + value} aria-hidden="true" />
          <span className="fs-icon-picker__value-name">{iconName(selected.icon)}</span>
        </div>
      ) : null}

      <div className="fs-icon-picker__control">
        <Button ref={triggerRef} variant="secondary" className="fs-icon-picker__trigger" onClick={openPicker}>
          {t('choose', 'Choose icon')}
        </Button>

        {value ? (
          <Button variant="tertiary" isDestructive className="fs-icon-picker__clear" onClick={() => onChange('')}>
            {t('remove', 'Remove')}
          </Button>
        ) : null}
      </div>

      <BlockOptionDescription description={description} />
    </div>
  );
}
