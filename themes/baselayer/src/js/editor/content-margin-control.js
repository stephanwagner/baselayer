import {
  contentMarginSizesForOption,
  displayMarginSize,
  resetMarginSize,
  storedMarginSize,
} from './content-margin-utils';
import { BlockOptionToggleGroupOption } from './block-option-toggle-group-option';
import { BlockOptionDescription } from './block-option-help';

const { Button } = wp.components;
const ToggleGroupControl = wp.components.__experimentalToggleGroupControl;

/**
 * Linked top/bottom content margin picker for block options.
 */
export function ContentMarginControl({ option, attributes, onChange }) {
  const { top, bottom, linked } = option.attributeNames;
  const defaultSize = option.defaultSize ?? '';
  const allowUnset = option.allowUnset === true;
  const sizes = contentMarginSizesForOption(option);
  const isLinked = attributes[linked] !== false;
  const topValue = attributes[top] ?? '';
  const bottomValue = attributes[bottom] ?? '';

  const displayTop = displayMarginSize(topValue, allowUnset);
  const displayBottom = displayMarginSize(bottomValue, allowUnset);

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

  const resetTop = () => {
    const stored = resetMarginSize(defaultSize);

    if (isLinked) {
      onChange({ [top]: stored, [bottom]: stored });
      return;
    }

    onChange({ [top]: stored });
  };

  const resetBottom = () => {
    onChange({ [bottom]: resetMarginSize(defaultSize) });
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

  const renderSizeControl = (sideLabel, value, onSelect, onReset) => {
    const control = ToggleGroupControl ? (
      <ToggleGroupControl
        className="fs-content-margin__sizes fs-block-option-button-group"
        label={sideLabel}
        hideLabelFromVision
        value={value}
        isBlock
        onChange={onSelect}
        __nextHasNoMarginBottom
      >
        {sizes.map((size) => (
          <BlockOptionToggleGroupOption
            key={size.value}
            value={size.value}
            label={size.label}
            icon={size.icon}
          />
        ))}
      </ToggleGroupControl>
    ) : null;

    return (
      <div className="fs-content-margin__field">
        <div className="fs-content-margin__header">
          <span className="fs-content-margin__side-label">{sideLabel}</span>
          <Button variant="link" className="fs-content-margin__reset" onClick={onReset}>
            Reset
          </Button>
        </div>
        {control}
      </div>
    );
  };

  const renderActionButton = (icon, label, onClick, className) => (
    <Button variant="link" className={'fs-content-margin__action ' + className} onClick={onClick}>
      <span className={'fs-icon -icon-' + icon} aria-hidden="true" />
      {label}
    </Button>
  );

  return (
    <div className="fs-content-margin">
      {option.label ? <span className="fs-content-margin__label">{option.label}</span> : null}

      {renderSizeControl(isLinked ? 'Oben und Unten' : 'Oben', displayTop, setTop, resetTop)}

      {isLinked
        ? renderActionButton('link-off', 'Unten', revealBottom, 'fs-content-margin__action--reveal')
        : (
          <>
            {renderActionButton('link', 'Verknüpfen', relink, 'fs-content-margin__action--relink')}
            {renderSizeControl('Unten', displayBottom, setBottom, resetBottom)}
          </>
        )}
      <BlockOptionDescription description={option.description} />
    </div>
  );
}
