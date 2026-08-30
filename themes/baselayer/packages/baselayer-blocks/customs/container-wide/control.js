import {
  ALIGN_WIDE_CONTAINER_CLASS,
} from './utils';
import { BlockOptionToggleGroupOption } from '../../src/js/block-options/shared/block-option-toggle-group-option';
import { BlockOptionDescription, optionHelpProps } from '../../src/js/block-options/shared/block-option-help';
import { t } from '../../src/js/block-options/shared/i18n';

const { ToggleControl, SelectControl } = wp.components;
const ToggleGroupControl = wp.components.__experimentalToggleGroupControl;

const alignWideOptions = () => [
  { label: t('default', 'Default'), value: '' },
  { label: t('wide', 'Wide'), value: ALIGN_WIDE_CONTAINER_CLASS },
];

/**
 * Inhaltsbreite picker with optional content-column align when Erweitert.
 */
export function ContainerWideControl({ option, attributes, onChange }) {
  const names = option.attributeNames || {};
  const container = names.container || 'alignWideContainer';
  const content = names.content || 'alignWideContent';
  const containerValue = attributes[container] ?? option.default ?? '';
  const wideSelected = containerValue === ALIGN_WIDE_CONTAINER_CLASS;
  const showContentAlign = option.showContentAlign !== false;
  const options = alignWideOptions();

  const setContainer = (newValue) => {
    const next = { [container]: newValue };
    if (newValue !== ALIGN_WIDE_CONTAINER_CLASS || !showContentAlign) {
      next[content] = false;
    }
    onChange(next);
  };

  const contentToggle =
    wideSelected && showContentAlign ? (
      <ToggleControl
        className="bl-align-wide-content-toggle"
        label={t('alignContentToContentColumn', 'Align content to content column')}
        checked={Boolean(attributes[content])}
        onChange={(checked) => onChange({ [content]: checked })}
      />
    ) : null;

  if (!ToggleGroupControl) {
    return (
      <div className="bl-align-wide">
        <SelectControl
          label={option.label}
          value={containerValue}
          options={options}
          onChange={setContainer}
          {...optionHelpProps(option)}
        />
        {contentToggle}
      </div>
    );
  }

  return (
    <div className="bl-align-wide">
      <ToggleGroupControl
        className="bl-block-option-button-group"
        label={option.label}
        value={containerValue}
        isBlock
        onChange={setContainer}
        __nextHasNoMarginBottom
        __next40pxDefaultSize
      >
        {options.map((opt) => (
          <BlockOptionToggleGroupOption
            key={opt.value || 'default'}
            value={opt.value}
            label={opt.label}
          />
        ))}
      </ToggleGroupControl>
      {contentToggle}
      <BlockOptionDescription description={option.description} />
    </div>
  );
}

/** @deprecated Use ContainerWideControl */
export const AlignWideControl = ContainerWideControl;
