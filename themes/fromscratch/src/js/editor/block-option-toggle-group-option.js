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
 * Toggle group option with optional icon-only display (label kept for tooltip/a11y).
 *
 * @param {Object} props
 * @param {string} props.value
 * @param {string} props.label
 * @param {string} [props.icon] Icon file name without prefix (e.g. `block`).
 */
export function BlockOptionToggleGroupOption({ value, label, icon }) {
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
