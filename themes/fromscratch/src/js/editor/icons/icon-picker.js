import {
  iconCategories,
  resolveIconName,
  iconMatchesQuery,
  findIconByValue
} from './icon-catalog';

const { Button, Modal, SearchControl, ToggleControl } = wp.components;
const ToggleGroupControl = wp.components.__experimentalToggleGroupControl;
const ToggleGroupControlOption =
  wp.components.__experimentalToggleGroupControlOption;
const { useState } = wp.element;

// Translated labels + UI strings provided by PHP (inc/editor-icons.php).
const iconL10n = (typeof window !== 'undefined' && window.fromscratchIcons) || {};
const iconLabels = iconL10n.labels || {};
const categoryLabels = iconL10n.categories || {};
const uiStrings = iconL10n.ui || {};

// Localized UI string with an English fallback (source language).
const t = (key, fallback) => uiStrings[key] || fallback;

// Fallback when a label is missing: "calendar-month" -> "Calendar month".
const humanize = (slug) =>
  slug
    .replace(/-/g, ' ')
    .replace(/^\w/, (char) => char.toUpperCase());

// Prefer an inline label (theme icons carry their own), then the PHP-localized
// label, then a humanized file name / slug.
const iconName = (icon) =>
  icon.label || iconLabels[icon.filename] || humanize(icon.filename);
const categoryName = (category) =>
  category.label || categoryLabels[category.slug] || humanize(category.slug);

// Remember the outline/filled preference across pickers and sessions.
const VARIANT_STORAGE_KEY = 'fromscratchIconVariant';

const readStoredVariant = () => {
  try {
    return window.localStorage.getItem(VARIANT_STORAGE_KEY) === 'fill'
      ? 'fill'
      : 'outline';
  } catch (e) {
    return 'outline';
  }
};

const writeStoredVariant = (variant) => {
  try {
    window.localStorage.setItem(VARIANT_STORAGE_KEY, variant);
  } catch (e) {
    // Storage may be unavailable (private mode / disabled) — ignore.
  }
};

/**
 * Reusable icon picker with an outline/filled toggle.
 *
 * The value is the resolved icon file name (e.g. `heart`, `heart-fill`,
 * `arrow-left`) or an empty string. The filled toggle is global for the modal:
 * icons that declare a `fill` alternative switch to it, while icons without one
 * stay outline so they remain visible and selectable.
 *
 * @param {Object}   props
 * @param {string}   [props.label]  Optional field label.
 * @param {string}   props.value    Selected icon file name, or '' when none.
 * @param {Function} props.onChange Receives the resolved icon file name (or '').
 */
export function IconPicker({ label, value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [variant, setVariant] = useState(() => {
    const selected = findIconByValue(value);
    // Match the current icon when editing; otherwise use the saved preference.
    return selected ? selected.variant : readStoredVariant();
  });

  const query = search.trim().toLowerCase();
  const selected = findIconByValue(value);

  // Update the toggle and persist the choice for next time.
  const changeVariant = (next) => {
    setVariant(next);
    writeStoredVariant(next);
  };

  const renderVariantToggle = () => {
    if (ToggleGroupControl && ToggleGroupControlOption) {
      return (
        <ToggleGroupControl
          className="fs-icon-picker__variant"
          label={t('style', 'Style')}
          hideLabelFromVision
          isBlock
          value={variant}
          onChange={changeVariant}
          __nextHasNoMarginBottom
        >
          <ToggleGroupControlOption
            value="outline"
            label={t('outline', 'Outline')}
          />
          <ToggleGroupControlOption
            value="fill"
            label={t('filled', 'Filled')}
          />
        </ToggleGroupControl>
      );
    }

    return (
      <ToggleControl
        className="fs-icon-picker__variant"
        label={t('filled', 'Filled')}
        checked={variant === 'fill'}
        onChange={(next) => changeVariant(next ? 'fill' : 'outline')}
        __nextHasNoMarginBottom
      />
    );
  };

  return (
    <div className="fs-icon-picker">
      {label ? <span className="fs-icon-picker__label">{label}</span> : null}

      <div className="fs-icon-picker__control">
        <Button
          variant="secondary"
          className="fs-icon-picker__trigger"
          onClick={() => setIsOpen(true)}
        >
          {value ? (
            <span className={'fs-icon -icon-' + value} aria-hidden="true" />
          ) : null}
          <span>
            {selected ? iconName(selected.icon) : t('choose', 'Choose icon')}
          </span>
        </Button>

        {value ? (
          <Button
            variant="tertiary"
            isDestructive
            className="fs-icon-picker__clear"
            onClick={() => onChange('')}
          >
            {t('remove', 'Remove')}
          </Button>
        ) : null}
      </div>

      {isOpen ? (
        <Modal
          title={t('choose', 'Choose icon')}
          onRequestClose={() => setIsOpen(false)}
          className="fs-icon-picker__modal"
        >
          <div className="fs-icon-picker__toolbar">
            <SearchControl
              value={search}
              onChange={setSearch}
              placeholder={t('search', 'Search icons …')}
              __nextHasNoMarginBottom
            />
            {renderVariantToggle()}
          </div>

          <div className="fs-icon-picker__categories">
            {iconCategories.map((category) => {
              const icons = category.icons.filter((icon) =>
                iconMatchesQuery(icon, query, iconName(icon))
              );

              if (!icons.length) {
                return null;
              }

              return (
                <div key={category.slug} className="fs-icon-picker__category">
                  <h3 className="fs-icon-picker__category-title">
                    {categoryName(category)}
                  </h3>
                  <div className="fs-icon-picker__grid">
                    {icons.map((icon) => {
                      const resolved = resolveIconName(icon, variant);
                      const name = iconName(icon);

                      return (
                        <button
                          key={icon.filename}
                          type="button"
                          className={
                            'fs-icon-picker__item' +
                            (value === resolved ? ' is-selected' : '')
                          }
                          onClick={() => {
                            onChange(resolved);
                            setIsOpen(false);
                          }}
                          aria-label={name}
                          title={name}
                        >
                          <span
                            className={'fs-icon -icon-' + resolved}
                            aria-hidden="true"
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </Modal>
      ) : null}
    </div>
  );
}
