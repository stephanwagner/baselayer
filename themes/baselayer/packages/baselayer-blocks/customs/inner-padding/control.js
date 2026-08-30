import {
  INNER_PADDING_SIZES,
  displayInnerPadding,
  innerPaddingAllowsContentAlign,
  storedInnerPadding,
} from './utils';
import { BlockOptionToggleGroupOption } from '../../src/js/block-options/shared/block-option-toggle-group-option';
import { BlockOptionDescription, optionHelpProps } from '../../src/js/block-options/shared/block-option-help';
import { t } from '../../src/js/block-options/shared/i18n';

const { ToggleControl, SelectControl } = wp.components;
const ToggleGroupControl = wp.components.__experimentalToggleGroupControl;
const { useEffect } = wp.element;

const sizeTitle = (value) => {
  const titles = {
    unset: t('notSet', 'Not set'),
    auto: t('auto', 'Auto'),
    none: t('noPadding', 'No padding'),
  };
  return titles[value] || '';
};

/**
 * Innenabstand picker with optional content-column align
 * (root + container-wide / align wide|full only).
 */
export function InnerPaddingControl({ option, attributes, onChange, isRootBlock = true }) {
  const names = option.attributeNames || {};
  const padding = names.padding || 'containerPadding';
  const contentAlign = names.contentAlign || 'alignContentToContainer';
  const stored = attributes[padding] ?? option.default ?? '';
  const display = displayInnerPadding(stored);
  const showContentAlign =
    Boolean(option.showContentAlign) &&
    isRootBlock &&
    innerPaddingAllowsContentAlign(attributes);

  // Drop stale content-align when width / nesting no longer allows it.
  useEffect(() => {
    if (!showContentAlign && attributes[contentAlign]) {
      onChange({ [contentAlign]: false });
    }
  }, [
    showContentAlign,
    attributes[contentAlign],
    contentAlign,
    onChange,
  ]);

  const setPadding = (uiValue) => {
    const next = { [padding]: storedInnerPadding(uiValue) };
    if (!showContentAlign) {
      next[contentAlign] = false;
    }
    onChange(next);
  };

  const contentToggle = showContentAlign ? (
    <ToggleControl
      className="bl-inner-padding-content-toggle"
      label={t('alignContentToContentColumn', 'Align content to content column')}
      checked={Boolean(attributes[contentAlign])}
      onChange={(checked) => onChange({ [contentAlign]: checked })}
      __nextHasNoMarginBottom
    />
  ) : null;

  if (!ToggleGroupControl) {
    return (
      <div className="bl-inner-padding">
        <SelectControl
          label={option.label}
          value={display}
          options={INNER_PADDING_SIZES.map((s) => ({
            label: s.label,
            value: s.value,
          }))}
          onChange={setPadding}
          {...optionHelpProps(option)}
        />
        {contentToggle}
      </div>
    );
  }

  return (
    <div className="bl-inner-padding">
      <ToggleGroupControl
        className="bl-block-option-button-group"
        label={option.label}
        value={display}
        isBlock
        onChange={setPadding}
        __nextHasNoMarginBottom
        __next40pxDefaultSize
      >
        {INNER_PADDING_SIZES.map((opt) => (
          <BlockOptionToggleGroupOption
            key={opt.value}
            value={opt.value}
            label={opt.label}
            title={sizeTitle(opt.value)}
          />
        ))}
      </ToggleGroupControl>
      {contentToggle}
      <BlockOptionDescription description={option.description} />
    </div>
  );
}
