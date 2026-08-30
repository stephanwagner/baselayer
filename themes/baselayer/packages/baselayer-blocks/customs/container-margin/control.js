import {
  CONTAINER_MARGIN_SIZES,
  displayMarginSize,
  storedMarginSize,
} from './utils';
import { BlockOptionToggleGroupOption } from '../../src/js/block-options/shared/block-option-toggle-group-option';
import { BlockOptionDescription } from '../../src/js/block-options/shared/block-option-help';
import { t } from '../../src/js/block-options/shared/i18n';

const { Button } = wp.components;
const ToggleGroupControl = wp.components.__experimentalToggleGroupControl;

const marginSizeTitle = (value) => {
  const titles = {
    unset: t('notSet', 'Not set'),
    none: t('noSpacing', 'No spacing'),
  };
  return titles[value] || '';
};

/**
 * Linked top/bottom container margin picker for block options.
 */
export function ContainerMarginControl({ option, attributes, onChange }) {
  const { top, bottom, linked } = option.attributeNames;
  const isLinked = attributes[linked] !== false;
  const topValue = attributes[top] ?? '';
  const bottomValue = attributes[bottom] ?? '';

  const displayTop = displayMarginSize(topValue);
  const displayBottom = displayMarginSize(bottomValue);

  const setTop = (pickedSize) => {
    const stored = storedMarginSize(pickedSize);

    if (isLinked) {
      onChange({
        [top]: stored,
        [bottom]: stored,
      });
      return;
    }

    onChange({ [top]: stored });
  };

  const setBottom = (pickedSize) => {
    onChange({ [bottom]: storedMarginSize(pickedSize) });
  };

  const revealBottom = () => {
    onChange({
      [linked]: false,
      [bottom]: bottomValue || topValue,
    });
  };

  const relink = () => {
    onChange({
      [linked]: true,
      [bottom]: topValue,
    });
  };

  const renderSizeControl = (sideLabel, value, onSelect) => {
    const control = ToggleGroupControl ? (
      <ToggleGroupControl
        className="bl-container-margin__sizes bl-block-option-button-group"
        label={sideLabel}
        hideLabelFromVision
        value={value}
        isBlock
        onChange={onSelect}
        __nextHasNoMarginBottom
        __next40pxDefaultSize
      >
        {CONTAINER_MARGIN_SIZES.map((size) => (
          <BlockOptionToggleGroupOption
            key={size.value}
            value={size.value}
            label={size.label}
            icon={size.icon}
            title={marginSizeTitle(size.value)}
          />
        ))}
      </ToggleGroupControl>
    ) : null;

    return (
      <div className="bl-container-margin__field">
        <div className="bl-container-margin__header">
          <span className="bl-container-margin__side-label">{sideLabel}</span>
        </div>
        {control}
      </div>
    );
  };

  const renderActionButton = (icon, label, onClick, className) => (
    <Button variant="link" className={'bl-container-margin__action ' + className} onClick={onClick}>
      <span className={'bl-icon -icon-' + icon} aria-hidden="true" />
      {label}
    </Button>
  );

  return (
    <div className="bl-container-margin">
      {option.label ? <span className="bl-container-margin__label">{option.label}</span> : null}

      {renderSizeControl(
        isLinked ? t('topAndBottom', 'Top and bottom') : t('top', 'Top'),
        displayTop,
        setTop
      )}

      {isLinked
        ? renderActionButton(
            'link-off',
            t('bottom', 'Bottom'),
            revealBottom,
            'bl-container-margin__action--reveal'
          )
        : (
          <>
            {renderActionButton(
              'link',
              t('linkSides', 'Link sides'),
              relink,
              'bl-container-margin__action--relink'
            )}
            {renderSizeControl(t('bottom', 'Bottom'), displayBottom, setBottom)}
          </>
        )}
      <BlockOptionDescription description={option.description} />
    </div>
  );
}
