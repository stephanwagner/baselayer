import {
  SPACER_RESPONSIVE_HEIGHT_SIZES,
  displaySpacerResponsiveHeight,
  storedSpacerResponsiveHeight,
} from './spacer-responsive-height-utils';
import { BlockOptionToggleGroupOption } from './block-option-toggle-group-option';
import { BlockOptionDescription } from './block-option-help';

const ToggleGroupControl = wp.components.__experimentalToggleGroupControl;

/**
 * Responsive spacer height picker (scales down on smaller breakpoints).
 */
export function SpacerResponsiveHeightControl({ option, attributes, onChange }) {
  const stored = attributes[option.attributeName] ?? '';
  const displayValue = displaySpacerResponsiveHeight(stored);

  const setSize = (pickedSize) => {
    const className = storedSpacerResponsiveHeight(pickedSize);

    if (!className) {
      onChange({ [option.attributeName]: '' });
      return;
    }

    onChange({ [option.attributeName]: className, height: undefined });
  };

  if (!ToggleGroupControl) {
    return null;
  }

  return (
    <div className="fs-spacer-responsive-height">
      {option.label ? <span className="fs-spacer-responsive-height__label">{option.label}</span> : null}

      <ToggleGroupControl
        className="fs-spacer-responsive-height__sizes fs-block-option-button-group"
        label={option.label ? option.label : 'Responsive Höhe'}
        hideLabelFromVision
        value={displayValue}
        isBlock
        onChange={setSize}
        __nextHasNoMarginBottom
      >
        {SPACER_RESPONSIVE_HEIGHT_SIZES.map((size) => (
          <BlockOptionToggleGroupOption
            key={size.value}
            value={size.value}
            label={size.label}
          />
        ))}
      </ToggleGroupControl>

      <BlockOptionDescription description={option.description} />
    </div>
  );
}
