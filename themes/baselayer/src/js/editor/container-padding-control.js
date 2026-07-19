import {
  containerPaddingSizesForOption,
  containerPaddingAttributeName,
  displayPaddingSize,
  resetPaddingSize,
  storedPaddingSize,
} from './container-padding-utils';
import { BlockOptionToggleGroupOption } from './block-option-toggle-group-option';
import { BlockOptionDescription } from './block-option-help';

const { Button } = wp.components;
const ToggleGroupControl = wp.components.__experimentalToggleGroupControl;

/**
 * Uniform container padding picker for block options.
 */
export function ContainerPaddingControl({ option, attributes, onChange }) {
  const attributeName = containerPaddingAttributeName(option);
  const defaultSize = option.defaultSize ?? 'm';
  const sizes = containerPaddingSizesForOption(option);
  const value = displayPaddingSize(attributes[attributeName] ?? '', false);

  const setSize = (pickedSize) => {
    onChange({ [attributeName]: storedPaddingSize(pickedSize) });
  };

  const reset = () => {
    onChange({ [attributeName]: resetPaddingSize(defaultSize) });
  };

  const control = ToggleGroupControl ? (
    <ToggleGroupControl
      className="bl-container-padding__sizes bl-block-option-button-group"
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
    <div className="bl-container-padding">
      <div className="bl-container-padding__header">
        {option.label ? <span className="bl-container-padding__label">{option.label}</span> : <span />}
        <Button variant="link" className="bl-container-padding__reset" onClick={reset}>
          Reset
        </Button>
      </div>
      {control}
      <BlockOptionDescription description={option.description} />
    </div>
  );
}
