import { openIconPicker } from './icon-picker-service';

const { Button } = wp.components;
const { useRef } = wp.element;

const iconL10n = (typeof window !== 'undefined' && window.fromscratchIcons) || {};
const uiStrings = iconL10n.ui || {};

const t = (key, fallback) => uiStrings[key] || fallback;

/**
 * Inline icon picker for ACF icon blocks in the editor canvas.
 *
 * @param {Object}   props
 * @param {string}   props.value
 * @param {Function} props.onChange
 * @param {boolean}  [props.isActive]
 */
export function InlineIconControl({ value, onChange, isActive = false }) {
  const placeholderRef = useRef(null);
  const editRef = useRef(null);

  const openPicker = (returnFocus) => {
    openIconPicker({
      currentValue: value,
      onSelect: onChange,
      returnFocus,
    });
  };

  if (!value) {
    return (
      <div className={'fs-inline-icon-control' + (isActive ? ' is-active' : '')}>
        <button
          ref={placeholderRef}
          type="button"
          className="fs-inline-icon-control__placeholder"
          onClick={() => openPicker(placeholderRef.current)}
          aria-label={t('choose', 'Choose icon')}
        >
          <span className="fs-inline-icon-control__placeholder-glyph" aria-hidden="true" />
          <span className="fs-inline-icon-control__placeholder-label">
            <span>{t('chooseLine1', 'Choose')}</span>
            <span>{t('chooseLine2', 'an')}</span>
            <span>{t('chooseLine3', 'Icon')}</span>
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className={'fs-inline-icon-control' + (isActive ? ' is-active' : '')}>
      <div className="fs-inline-icon-control__selected">
        <span className={'fs-icon -icon-' + value} aria-hidden="true" />

        <div className="fs-inline-icon-control__actions">
          <Button
            ref={editRef}
            icon="edit"
            label={t('change', 'Change icon')}
            showTooltip={false}
            className="fs-inline-icon-control__action"
            onClick={() => openPicker(editRef.current)}
          />
          <Button
            icon="no-alt"
            label={t('remove', 'Remove')}
            showTooltip={false}
            className="fs-inline-icon-control__action is-destructive"
            onClick={() => onChange('')}
          />
        </div>
      </div>
    </div>
  );
}
