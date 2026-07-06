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
 */
export function BlockOptionToggleGroupOption({ value, label, icon, iconLabel }) {
  if (icon && iconLabel && ToggleGroupControlOption) {
    return (
      <ToggleGroupControlOption
        value={value}
        label={label}
        showTooltip
        className="fs-toggle-group-option--icon-label"
      >
        <span className={'fs-icon -icon-' + icon} aria-hidden="true" />
        <span className="fs-toggle-group-option__label">{label}</span>
      </ToggleGroupControlOption>
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
