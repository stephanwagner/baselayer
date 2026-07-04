import { blockOptions } from '../../../config/block-options';
import { IconPicker } from './icons/icon-picker';

const { InspectorControls } = wp.blockEditor;
const { PanelBody, ToggleControl, SelectControl } = wp.components;
const ToggleGroupControl = wp.components.__experimentalToggleGroupControl;
const ToggleGroupControlOption = wp.components.__experimentalToggleGroupControlOption;
const { createHigherOrderComponent } = wp.compose;
const { Fragment, useEffect } = wp.element;

// Prefix used when an `icon` option is stored as a class name (e.g. `-icon-bolt`).
const ICON_CLASS_PREFIX = '-icon-';

// Marker class added whenever an icon option has a value (target any icon button in CSS).
const HAS_ICON_CLASS = '-has-icon';

const iconPrefix = (option) => option.classPrefix || ICON_CLASS_PREFIX;

// Strip the class prefix so the picker works with the raw icon name.
const iconNameFromClass = (value, option) => {
  const prefix = iconPrefix(option);
  return value && value.indexOf(prefix) === 0 ? value.slice(prefix.length) : '';
};

// Position modifiers (e.g. `-icon-right`) share the icon prefix but are not glyph classes.
const iconPositionClasses = (blockConfig) => {
  const classes = new Set();

  blockConfig.options.forEach((option) => {
    if (option.type !== 'button-group') {
      return;
    }

    option.options.forEach((item) => {
      if (item.value) {
        classes.add(item.value);
      }
    });
  });

  return classes;
};

const isIconGlyphClass = (className, blockConfig) => {
  if (!className || className.indexOf(ICON_CLASS_PREFIX) !== 0) {
    return false;
  }

  return !iconPositionClasses(blockConfig).has(className);
};

// Static class names managed by block options (boolean / select / button-group values).
const managedStaticClasses = (blockConfig) => {
  const classes = new Set([HAS_ICON_CLASS]);

  blockConfig.options.forEach((option) => {
    if (option.type === 'boolean' && option.className) {
      classes.add(option.className);
    }

    if (option.type === 'select' || option.type === 'button-group') {
      option.options.forEach((item) => {
        if (item.value) {
          classes.add(item.value);
        }
      });
    }

    if (option.type === 'icon' && option.hasIconClass) {
      classes.add(option.hasIconClass);
    }
  });

  return classes;
};

// Build the class list implied by current block-option attribute values.
const collectOptionClasses = (blockConfig, attributes) => {
  const classes = [];

  blockConfig.options.forEach((option) => {
    if (option.type === 'boolean' && attributes[option.attributeName]) {
      classes.push(option.className);
    } else if (option.type === 'icon' && attributes[option.attributeName]) {
      classes.push(attributes[option.attributeName]);
      classes.push(option.hasIconClass || HAS_ICON_CLASS);
    } else if (
      (option.type === 'select' || option.type === 'button-group') &&
      attributes[option.attributeName]
    ) {
      classes.push(attributes[option.attributeName]);
    }
  });

  return classes;
};

const dedupeClasses = (classNames) =>
  [...new Set((classNames || '').split(/\s+/).filter(Boolean))].join(' ');

// Merge block-option classes into the block's persisted `className` attribute.
const syncClassNameFromOptions = (attributes, blockConfig) => {
  const staticClasses = managedStaticClasses(blockConfig);
  const base = (attributes.className || '')
    .split(/\s+/)
    .filter(Boolean)
    .filter((className) => {
      if (staticClasses.has(className) || isIconGlyphClass(className, blockConfig)) {
        return false;
      }

      return true;
    })
    .join(' ');

  const optionClasses = collectOptionClasses(blockConfig, attributes);

  return dedupeClasses([base, ...optionClasses].filter(Boolean).join(' '));
};

// Add attributes to the block
blockOptions.forEach((block) => {
  const blockSlug = getBlockSlug(block.name);

  wp.hooks.addFilter('blocks.registerBlockType', 'custom-block-options/block-' + blockSlug, (settings, name) => {
    if (name === block.name) {
      block.options.forEach((option) => {
        settings.attributes = {
          ...settings.attributes,
          [option.attributeName]: {
            type: option.type === 'boolean' ? 'boolean' : 'string',
            default: option.default,
          },
        };
      });
    }
    return settings;
  });
});

// Add custom control
const addControl = createHigherOrderComponent((BlockEdit) => {
  return (props) => {
    const { attributes, setAttributes, isSelected } = props;

    // Find the block configuration based on the block name
    const blockConfig = blockOptions.find((block) => block.name === props.name);

    const setOptionAttributes = (updates) => {
      const nextAttributes = { ...attributes, ...updates };
      const className = syncClassNameFromOptions(nextAttributes, blockConfig);

      setAttributes({
        ...updates,
        className,
      });
    };

    // Backfill `className` when option attributes and wrapper classes drift (e.g. after adding `-has-icon`).
    useEffect(() => {
      if (!blockConfig) {
        return;
      }

      const className = syncClassNameFromOptions(attributes, blockConfig);

      if (className !== (attributes.className || '')) {
        setAttributes({ className });
      }
    }, blockConfig ? blockConfig.options.map((option) => attributes[option.attributeName]) : []);

    if (blockConfig) {
      return (
        <Fragment>
          <BlockEdit {...props} />
          {isSelected && (
            <InspectorControls>
              <PanelBody title="Block Einstellungen">
                {blockConfig.options.map((option) => {
                  if (option.type === 'boolean') {
                    return (
                      <ToggleControl
                        key={option.attributeName}
                        label={option.label}
                        checked={attributes[option.attributeName]}
                        onChange={(newValue) => setOptionAttributes({ [option.attributeName]: newValue })}
                      />
                    );
                  } else if (option.type === 'select') {
                    return (
                      <SelectControl
                        key={option.attributeName}
                        label={option.label}
                        value={attributes[option.attributeName]}
                        options={option.options}
                        onChange={(newValue) => setOptionAttributes({ [option.attributeName]: newValue })}
                      />
                    );
                  } else if (option.type === 'icon') {
                    const prefix = iconPrefix(option);
                    return (
                      <IconPicker
                        key={option.attributeName}
                        label={option.label}
                        value={iconNameFromClass(attributes[option.attributeName], option)}
                        onChange={(name) =>
                          setOptionAttributes({
                            [option.attributeName]: name ? prefix + name : '',
                          })
                        }
                      />
                    );
                  } else if (option.type === 'button-group') {
                    if (ToggleGroupControl && ToggleGroupControlOption) {
                      return (
                        <ToggleGroupControl
                          key={option.attributeName}
                          label={option.label}
                          value={attributes[option.attributeName]}
                          isBlock
                          onChange={(newValue) => setOptionAttributes({ [option.attributeName]: newValue })}
                          __nextHasNoMarginBottom
                        >
                          {option.options.map((opt) => (
                            <ToggleGroupControlOption
                              key={opt.value || 'default'}
                              value={opt.value}
                              label={opt.label}
                            />
                          ))}
                        </ToggleGroupControl>
                      );
                    }
                    return (
                      <SelectControl
                        key={option.attributeName}
                        label={option.label}
                        value={attributes[option.attributeName]}
                        options={option.options}
                        onChange={(newValue) => setOptionAttributes({ [option.attributeName]: newValue })}
                      />
                    );
                  }
                  return null;
                })}
              </PanelBody>
            </InspectorControls>
          )}
        </Fragment>
      );
    }

    return <BlockEdit {...props} />;
  };
}, 'addControl');

// Block-option classes live in the block's `className` attribute (synced above).
wp.hooks.addFilter('editor.BlockEdit', 'custom-block-options/add-control', addControl);

/**
 * Get the slug of a block name
 */
function getBlockSlug(blockName) {
  return blockName.replace('/', '-');
}
