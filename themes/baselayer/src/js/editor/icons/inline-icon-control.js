import { openIconPicker } from './icon-picker-service';

const { useRef } = wp.element;

const iconL10n = (typeof window !== 'undefined' && window.baselayerIcons) || {};
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
      <div className={'bl-inline-icon-control' + (isActive ? ' is-active' : '')}>
        <button
          ref={placeholderRef}
          type="button"
          className="bl-inline-icon-control__placeholder"
          onClick={() => openPicker(placeholderRef.current)}
          aria-label={t('choose', 'Choose icon')}
        >
          <span className="bl-inline-icon-control__placeholder-label">{t('choose', 'Choose icon')}</span>
        </button>
      </div>
    );
  }

  return (
    <div className={'bl-inline-icon-control' + (isActive ? ' is-active' : '')}>
      <div className="bl-inline-icon-control__selected">
        <span className={'bl-icon -icon-' + value} aria-hidden="true" />

        <div className="bl-inline-icon-control__actions">
          <button
            ref={editRef}
            type="button"
            className="bl-inline-icon-control__action"
            aria-label={t('change', 'Change icon')}
            onClick={() => openPicker(editRef.current)}
          >
            <span className="bl-icon -icon-edit" aria-hidden="true" />
          </button>
          <button
            type="button"
            className="bl-inline-icon-control__action is-destructive"
            aria-label={t('remove', 'Remove')}
            onClick={() => onChange('')}
          >
            <span className="bl-icon -icon-close" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
