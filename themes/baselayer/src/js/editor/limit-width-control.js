import {
  LIMIT_WIDTH_ALIGNS,
  LIMIT_WIDTH_SIZES,
  displayLimitWidthSize,
  storedLimitWidthSize,
} from './limit-width-utils';
import { BlockOptionToggleGroupOption } from './block-option-toggle-group-option';
import { BlockOptionDescription } from './block-option-help';

const ToggleGroupControl = wp.components.__experimentalToggleGroupControl;

/**
 * Width limit picker with separate size and alignment segments.
 */
export function LimitWidthControl({ option, attributes, onChange }) {
  const { size, align } = option.attributeNames;
  const defaultAlign = option.defaultAlign ?? 'center';
  const storedSize = attributes[size] ?? '';
  const storedAlign = attributes[align] ?? defaultAlign;
  const displaySize = displayLimitWidthSize(storedSize);
  const hasSize = Boolean(storedSize);

  const setSize = (pickedSize) => {
    onChange({ [size]: storedLimitWidthSize(pickedSize) });
  };

  const setAlign = (pickedAlign) => {
    if (!hasSize) {
      return;
    }

    onChange({ [align]: pickedAlign });
  };

  if (!ToggleGroupControl) {
    return null;
  }

  return (
    <div className="bl-limit-width">
      {option.label ? <span className="bl-limit-width__label">{option.label}</span> : null}

      <div className="bl-limit-width__row bl-block-option-button-group">
        <ToggleGroupControl
          className="bl-limit-width__sizes"
          label={option.label ? option.label + ' Größe' : 'Größe'}
          hideLabelFromVision
          value={displaySize}
          isBlock
          onChange={setSize}
          __nextHasNoMarginBottom
        >
          {LIMIT_WIDTH_SIZES.map((item) => (
            <BlockOptionToggleGroupOption
              key={item.value}
              value={item.value}
              label={item.label}
              icon={item.icon}
            />
          ))}
        </ToggleGroupControl>

        <div
          className={
            'bl-limit-width__align-wrap' + (hasSize ? '' : ' bl-limit-width__align-wrap--is-disabled')
          }
        >
          <ToggleGroupControl
            className="bl-limit-width__align"
            label={option.label ? option.label + ' Ausrichtung' : 'Ausrichtung'}
            hideLabelFromVision
            value={storedAlign}
            isBlock
            onChange={setAlign}
            __nextHasNoMarginBottom
          >
            {LIMIT_WIDTH_ALIGNS.map((item) => (
              <BlockOptionToggleGroupOption
                key={item.value}
                value={item.value}
                label={item.label}
                icon={item.icon}
              />
            ))}
          </ToggleGroupControl>
        </div>
      </div>
      <BlockOptionDescription description={option.description} />
    </div>
  );
}
