const ToggleGroupControlOption = wp.components.__experimentalToggleGroupControlOption;
const ToggleGroupControlOptionIcon = wp.components.__experimentalToggleGroupControlOptionIcon;

const themeIconComponents = new Map();

function getThemeIconComponent(iconName) {
  if (!themeIconComponents.has(iconName)) {
    themeIconComponents.set(iconName, function ThemeIcon() {
      return <span className={'fs-icon -icon-' + iconName} aria-hidden="true" />;
    });
  }

  return themeIconComponents.get(iconName);
}

/**
 * Toggle group option with optional icon-only or icon + label display.
 *
 * @param {Object} props
 * @param {string} props.value
 * @param {string} props.label
 * @param {string} [props.icon] Icon file name without prefix (e.g. `block`).
 * @param {boolean} [props.iconLabel] Show icon and visible label together.
 * @param {'before'|'after'} [props.iconPosition] Place icon before or after the label.
 */
export function BlockOptionToggleGroupOption({ value, label, icon, iconLabel, iconPosition = 'before' }) {
  if (icon && iconLabel && ToggleGroupControlOption) {
    const iconPlacement = iconPosition === 'after' ? '-icon-after' : '-icon-before';

    return (
      <ToggleGroupControlOption
        value={value}
        label={label}
        showTooltip
        className={'fs-toggle-group-option--icon-label ' + iconPlacement + ' -icon-' + icon}
      />
    );
  }

  if (icon && ToggleGroupControlOptionIcon) {
    return (
      <ToggleGroupControlOptionIcon
        value={value}
        label={label}
        icon={getThemeIconComponent(icon)}
      />
    );
  }

  if (!ToggleGroupControlOption) {
    return null;
  }

  return (
    <ToggleGroupControlOption
      value={value}
      label={icon ? '—' : label}
      showTooltip={Boolean(icon)}
      aria-label={icon ? label : undefined}
    />
  );
}
