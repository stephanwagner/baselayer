import {
  contentPaddingSizesForOption,
  contentPaddingAttributeName,
  displayPaddingSize,
  resetPaddingSize,
  storedPaddingSize,
} from './content-padding-utils';
import { BlockOptionToggleGroupOption } from './block-option-toggle-group-option';
import { BlockOptionDescription } from './block-option-help';

const { Button } = wp.components;
const ToggleGroupControl = wp.components.__experimentalToggleGroupControl;

/**
 * Uniform content padding picker for block options.
 */
export function ContentPaddingControl({ option, attributes, onChange }) {
  const attributeName = contentPaddingAttributeName(option);
  const defaultSize = option.defaultSize ?? 'm';
  const sizes = contentPaddingSizesForOption(option);
  const value = displayPaddingSize(attributes[attributeName] ?? '', false);

  const setSize = (pickedSize) => {
    onChange({ [attributeName]: storedPaddingSize(pickedSize) });
  };

  const reset = () => {
    onChange({ [attributeName]: resetPaddingSize(defaultSize) });
  };

  const control = ToggleGroupControl ? (
    <ToggleGroupControl
      className="fs-content-padding__sizes fs-block-option-button-group"
      label={option.label || 'Innenabstand'}
      hideLabelFromVision
      value={value}
      isBlock
      onChange={setSize}
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
    <div className="fs-content-padding">
      <div className="fs-content-padding__header">
        {option.label ? <span className="fs-content-padding__label">{option.label}</span> : <span />}
        <Button variant="link" className="fs-content-padding__reset" onClick={reset}>
          Reset
        </Button>
      </div>
      {control}
      <BlockOptionDescription description={option.description} />
    </div>
  );
}
