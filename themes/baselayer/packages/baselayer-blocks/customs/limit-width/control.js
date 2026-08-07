import {
  LIMIT_WIDTH_ALIGN_VALUES,
  LIMIT_WIDTH_SIZES,
  displayLimitWidthSize,
  storedLimitWidthSize,
} from './utils';
import { BlockOptionToggleGroupOption } from '../../src/js/block-options/shared/block-option-toggle-group-option';
import { BlockOptionDescription } from '../../src/js/block-options/shared/block-option-help';
import { t } from '../../src/js/block-options/shared/i18n';

const ToggleGroupControl = wp.components.__experimentalToggleGroupControl;

const limitWidthAligns = () => [
  { ...LIMIT_WIDTH_ALIGN_VALUES[0], label: t('left', 'Left') },
  { ...LIMIT_WIDTH_ALIGN_VALUES[1], label: t('center', 'Center') },
  { ...LIMIT_WIDTH_ALIGN_VALUES[2], label: t('right', 'Right') },
];

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
  const aligns = limitWidthAligns();

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

  const sizeWord = t('size', 'Size');
  const alignWord = t('alignment', 'Alignment');
  const sizeLabel = option.label ? `${option.label} ${sizeWord}` : sizeWord;
  const alignLabel = option.label ? `${option.label} ${alignWord}` : alignWord;

  return (
    <div className="bl-limit-width">
      {option.label ? <span className="bl-limit-width__label">{option.label}</span> : null}

      <div className="bl-limit-width__row bl-block-option-button-group">
        <ToggleGroupControl
          className="bl-limit-width__sizes"
          label={sizeLabel}
          hideLabelFromVision
          value={displaySize}
          isBlock
          onChange={setSize}
          __nextHasNoMarginBottom
          __next40pxDefaultSize
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
            label={alignLabel}
            hideLabelFromVision
            value={storedAlign}
            isBlock
            onChange={setAlign}
            __nextHasNoMarginBottom
            __next40pxDefaultSize
          >
            {aligns.map((item) => (
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
