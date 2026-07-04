import { iconCategories, hasFill } from './icon-catalog';

const { Button, Modal, SearchControl, ToggleControl } = wp.components;
const ToggleGroupControl = wp.components.__experimentalToggleGroupControl;
const ToggleGroupControlOption =
  wp.components.__experimentalToggleGroupControlOption;
const { useState } = wp.element;
const { __ } = wp.i18n;

const isFillValue = (value) =>
  typeof value === 'string' && value.slice(-5) === '-fill';

/**
 * Reusable icon picker with an outline/filled toggle.
 *
 * The value is the resolved icon name (e.g. `heart`, `heart-fill`, `arrow-left`)
 * or an empty string. The filled toggle is global for the modal: filled icons
 * switch to their `-fill` variant, while icons without one stay outline so they
 * remain selectable.
 *
 * @param {Object}   props
 * @param {string}   [props.label]  Optional field label.
 * @param {string}   props.value    Selected icon name, or '' when none.
 * @param {Function} props.onChange Receives the resolved icon name (or '').
 */
export function IconPicker({ label, value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [variant, setVariant] = useState(
    isFillValue(value) ? 'fill' : 'outline'
  );

  const query = search.trim().toLowerCase();
  const filled = variant === 'fill';

  // Resolve a base icon name to the variant to show/store. Icons without a
  // filled version fall back to their outline so they stay visible when filled.
  const resolve = (name) => (filled && hasFill(name) ? name + '-fill' : name);

  const renderVariantToggle = () => {
    if (ToggleGroupControl && ToggleGroupControlOption) {
      return (
        <ToggleGroupControl
          className="fs-icon-picker__variant"
          label={__('Stil', 'fromscratch')}
          hideLabelFromVision
          isBlock
          value={variant}
          onChange={setVariant}
          __nextHasNoMarginBottom
        >
          <ToggleGroupControlOption
            value="outline"
            label={__('Umriss', 'fromscratch')}
          />
          <ToggleGroupControlOption
            value="fill"
            label={__('Gefüllt', 'fromscratch')}
          />
        </ToggleGroupControl>
      );
    }

    return (
      <ToggleControl
        className="fs-icon-picker__variant"
        label={__('Gefüllt', 'fromscratch')}
        checked={filled}
        onChange={(next) => setVariant(next ? 'fill' : 'outline')}
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
          <span>{value || __('Icon wählen', 'fromscratch')}</span>
        </Button>

        {value ? (
          <Button
            variant="tertiary"
            isDestructive
            className="fs-icon-picker__clear"
            onClick={() => onChange('')}
          >
            {__('Entfernen', 'fromscratch')}
          </Button>
        ) : null}
      </div>

      {isOpen ? (
        <Modal
          title={__('Icon wählen', 'fromscratch')}
          onRequestClose={() => setIsOpen(false)}
          className="fs-icon-picker__modal"
        >
          <div className="fs-icon-picker__toolbar">
            <SearchControl
              value={search}
              onChange={setSearch}
              placeholder={__('Icons durchsuchen …', 'fromscratch')}
              __nextHasNoMarginBottom
            />
            {renderVariantToggle()}
          </div>

          <div className="fs-icon-picker__categories">
            {iconCategories.map((category) => {
              const icons = query
                ? category.icons.filter((name) => name.includes(query))
                : category.icons;

              if (!icons.length) {
                return null;
              }

              return (
                <div key={category.slug} className="fs-icon-picker__category">
                  <h3 className="fs-icon-picker__category-title">
                    {category.label}
                  </h3>
                  <div className="fs-icon-picker__grid">
                    {icons.map((name) => {
                      const resolved = resolve(name);

                      return (
                        <button
                          key={name}
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
