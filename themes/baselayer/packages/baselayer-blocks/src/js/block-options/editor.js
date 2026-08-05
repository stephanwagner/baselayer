/**
 * Block options editor — generics + registered customs (no type switches).
 */
import './load-customs.js';
import { IconPicker } from '../../../../../src/js/editor/icons/icon-picker.js';
import { BlockOptionToggleGroupOption } from './shared/block-option-toggle-group-option';
import { BlockOptionDescription, optionHelpProps } from './shared/block-option-help';
import {
  getCustom,
  allCustomManagedClasses,
} from './registry';

const { InspectorControls } = wp.blockEditor;
const { PanelBody, ToggleControl, SelectControl } = wp.components;
const ToggleGroupControl = wp.components.__experimentalToggleGroupControl;
const { createHigherOrderComponent } = wp.compose;
const { useSelect } = wp.data;
const { Fragment, useEffect, useRef } = wp.element;

/** Image options owned by the gallery when nested — skip in the image inspector. */
const GALLERY_OWNED_IMAGE_ATTRIBUTES = ['showImageLabel', 'hasLightbox', 'alignWideContainer'];
const GALLERY_OWNED_IMAGE_TYPES = ['container-margin'];

/** Resolved from PHP (bl_block_options store → baselayerBlockOptions). */
const blockOptions = Array.isArray(window.baselayerBlockOptions)
  ? window.baselayerBlockOptions
  : [];

/** Ausblenden — forced on every block; not part of the store / presets. */
const HIDE_BLOCK_OPTION = {
  type: 'boolean',
  label: 'Sichtbarkeit',
  toggleLabel: 'Ausblenden',
  default: false,
  attributeName: 'hideBlock',
  className: '-block-is-hidden',
};
const HIDE_BLOCK_CLASS = HIDE_BLOCK_OPTION.className;
const HIDE_BLOCK_ATTRIBUTE = HIDE_BLOCK_OPTION.attributeName;

/** Class applied by getAlignWideContainerControl() — kept managed so leftovers are stripped. */
const ALIGN_WIDE_CONTAINER_CLASS = 'container-wide';

/** Merge global hide ahead of block-specific options. */
const effectiveBlockConfig = (name, blockConfig) => ({
  name: blockConfig?.name || name,
  options: [HIDE_BLOCK_OPTION, ...(blockConfig?.options || [])],
});

const ICON_CLASS_PREFIX = '-icon-';
const HAS_ICON_CLASS = '-has-icon';
const ICON_ONLY_CLASS = '-icon-only';

const LEGACY_IMAGE_TEXT_LAYOUT_CLASSES = [
  '-image-left-text-right',
  '-image-right-text-left',
  '-image-text-layout',
];

const iconPrefix = (option) => option.classPrefix || ICON_CLASS_PREFIX;

const iconNameFromClass = (value, option) => {
  const prefix = iconPrefix(option);
  return value && value.indexOf(prefix) === 0 ? value.slice(prefix.length) : '';
};

const getBooleanOptionLabels = (option) => {
  const hasToggleLabel = Object.prototype.hasOwnProperty.call(option, 'toggleLabel');

  if (hasToggleLabel) {
    return {
      rowLabel: option.label || '',
      toggleLabel: option.toggleLabel || '',
    };
  }

  return {
    rowLabel: '',
    toggleLabel: option.label || '',
  };
};

const getBlockOptionKey = (option, index) => {
  const custom = getCustom(option.type);
  if (custom?.optionKey) {
    return custom.optionKey(option, index);
  }
  return option.attributeName || 'block-option-' + index;
};

const getBlockOptionWrapperClass = (option, index) => {
  const classes = ['bl-block-option'];

  if (option.type === 'boolean') {
    classes.push('bl-block-option-boolean');
  }

  if (index > 0 && !option.noSeparator) {
    classes.push('bl-block-option--separated');
  }

  return classes.join(' ');
};

const BlockOptionWrapper = ({ option, index, children }) =>
  wp.element.createElement(
    'div',
    { className: getBlockOptionWrapperClass(option, index) },
    children
  );

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

const migrateLegacyImageTextLayoutAttributes = (attributes) => {
  const classNames = (attributes.className || '').split(/\s+/).filter(Boolean);
  const hasLegacyClass = LEGACY_IMAGE_TEXT_LAYOUT_CLASSES.some((legacyClass) =>
    classNames.includes(legacyClass)
  );
  const hasLegacyAttribute = Boolean(attributes.imageTextLayout);

  if (!hasLegacyClass && !hasLegacyAttribute) {
    return null;
  }

  return {
    harmonizeImageText: true,
    imageTextLayout: '',
  };
};

const FONT_SIZE_TO_BUTTON_SIZE = {
  s: '-small',
  small: '-small',
  m: '',
  medium: '',
  l: '-large',
  large: '-large',
};

const BUTTON_ICON_ONLY_PLACEHOLDER = '\u200B';

const stripButtonPlaceholderText = (text) => (text || '').replace(/\u200B/g, '').trim();

const isButtonIconOnly = (attributes) =>
  Boolean(attributes.buttonIcon) && stripButtonPlaceholderText(attributes.text) === '';

const syncButtonIconOnlyPlaceholderText = (attributes) => {
  const hasIcon = Boolean(attributes.buttonIcon);
  const text = attributes.text ?? '';
  const stripped = stripButtonPlaceholderText(text);

  if (hasIcon && stripped === '') {
    return text === BUTTON_ICON_ONLY_PLACEHOLDER ? null : { text: BUTTON_ICON_ONLY_PLACEHOLDER };
  }

  if (!hasIcon && text.includes('\u200B') && stripped === '') {
    return { text: '' };
  }

  return null;
};

const migrateLegacyButtonFontSizeAttributes = (attributes) => {
  const updates = {};
  const hasButtonSize = Boolean(attributes.buttonSize);

  if (!hasButtonSize && attributes.fontSize) {
    updates.buttonSize = FONT_SIZE_TO_BUTTON_SIZE[attributes.fontSize] ?? '';
  }

  if (attributes.fontSize !== undefined && attributes.fontSize !== null && attributes.fontSize !== '') {
    updates.fontSize = undefined;
  }

  const typography = attributes.style?.typography;
  if (typography?.fontSize !== undefined) {
    updates.style = {
      ...attributes.style,
      typography: {
        ...typography,
        fontSize: undefined,
      },
    };
  }

  return Object.keys(updates).length ? updates : null;
};

/** Legacy container-padding custom stored size tokens (`m`); button-group stores classes. */
const migrateLegacyContainerPaddingAttributes = (attributes) => {
  const value = attributes.containerPadding;
  if (value === undefined || value === null || value === '') {
    return null;
  }
  if (typeof value !== 'string' || value.indexOf('-container-padding-') === 0) {
    return null;
  }
  if (!/^(none|xs|s|m|l|xl)$/.test(value)) {
    return null;
  }
  return { containerPadding: `-container-padding-${value}` };
};

const managedStaticClasses = (blockConfig) => {
  const classes = new Set([
    HAS_ICON_CLASS,
    ICON_ONLY_CLASS,
    HIDE_BLOCK_CLASS,
    ALIGN_WIDE_CONTAINER_CLASS,
    ...allCustomManagedClasses(),
    ...LEGACY_IMAGE_TEXT_LAYOUT_CLASSES,
  ]);

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

const collectOptionClasses = (blockConfig, attributes) => {
  const classes = [];

  blockConfig.options.forEach((option) => {
    const custom = getCustom(option.type);
    if (custom?.classesFromAttributes) {
      classes.push(...custom.classesFromAttributes(option, attributes));
      return;
    }

    if (option.type === 'boolean' && attributes[option.attributeName]) {
      classes.push(option.className);
    } else if (option.type === 'icon' && attributes[option.attributeName]) {
      classes.push(attributes[option.attributeName]);
      classes.push(option.hasIconClass || HAS_ICON_CLASS);
    } else if (
      (option.type === 'select' || option.type === 'button-group') &&
      attributes[option.attributeName]
    ) {
      if (
        blockConfig.name === 'core/button' &&
        option.attributeName === 'buttonIconPosition' &&
        isButtonIconOnly(attributes)
      ) {
        return;
      }

      classes.push(attributes[option.attributeName]);
    }
  });

  return classes;
};

const dedupeClasses = (classNames) =>
  [...new Set((classNames || '').split(/\s+/).filter(Boolean))].join(' ');

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

const blockOptionAttributeKeys = (blockConfig) =>
  blockConfig.options.flatMap((option) => {
    const custom = getCustom(option.type);
    if (custom?.attributeKeys) {
      return custom.attributeKeys(option);
    }
    return [option.attributeName];
  });

const blockOptionSyncDeps = (blockConfig, attributes) => {
  const keys = blockOptionAttributeKeys(blockConfig);

  if (blockConfig.name === 'core/button') {
    keys.push('text');
  }

  return keys.map((key) => attributes[key]);
};

wp.hooks.addFilter('blocks.registerBlockType', 'baselayer/global-block-options/attributes', (settings) => {
  settings.attributes = {
    ...settings.attributes,
    [HIDE_BLOCK_ATTRIBUTE]: {
      type: 'boolean',
      default: HIDE_BLOCK_OPTION.default,
    },
  };

  return settings;
});

blockOptions.forEach((block) => {
  const blockSlug = block.name.replace('/', '-');

  wp.hooks.addFilter('blocks.registerBlockType', 'custom-block-options/block-' + blockSlug, (settings, name) => {
    if (name !== block.name) {
      return settings;
    }

    block.options.forEach((option) => {
      const custom = getCustom(option.type);
      if (custom?.registerAttributes) {
        settings = custom.registerAttributes(settings, option);
        return;
      }

      settings = {
        ...settings,
        attributes: {
          ...settings.attributes,
          [option.attributeName]: {
            type: option.type === 'boolean' ? 'boolean' : 'string',
            default: option.default,
          },
        },
      };
    });

    return settings;
  });
});

const addControl = createHigherOrderComponent((BlockEdit) => {
  return (props) => {
    const { attributes, setAttributes, isSelected, clientId } = props;

    const listedConfig = blockOptions.find((block) => block.name === props.name);
    const blockConfig = effectiveBlockConfig(props.name, listedConfig);

    const isImageInGallery = useSelect(
      (select) => {
        if (props.name !== 'core/image' || !clientId) {
          return false;
        }
        const parents = select('core/block-editor').getBlockParentsByBlockName(
          clientId,
          'core/gallery'
        );
        return Array.isArray(parents) && parents.length > 0;
      },
      [props.name, clientId]
    );

    const prevHeightRef = useRef(attributes.height);

    const setOptionAttributes = (updates) => {
      const nextAttributes = { ...attributes, ...updates };
      const className = syncClassNameFromOptions(nextAttributes, blockConfig);

      setAttributes({
        ...updates,
        className,
      });
    };

    // Custom migrate hooks (e.g. legacy limit-width).
    useEffect(() => {
      if (!listedConfig) {
        return;
      }

      let updates = {};
      blockConfig.options.forEach((option) => {
        const custom = getCustom(option.type);
        if (!custom?.migrateAttributes) {
          return;
        }
        const migrated = custom.migrateAttributes({ ...attributes, ...updates }, option);
        if (migrated) {
          updates = { ...updates, ...migrated };
        }
      });

      if (Object.keys(updates).length) {
        setOptionAttributes(updates);
      }
    }, [listedConfig?.name, props.clientId, attributes.limitWidth, attributes.className]);

    useEffect(() => {
      if (!listedConfig || listedConfig.name !== 'core/columns') {
        return;
      }

      const migrated = migrateLegacyImageTextLayoutAttributes(attributes);
      if (migrated) {
        setOptionAttributes(migrated);
      }
    }, [
      listedConfig?.name,
      props.clientId,
      attributes.imageTextLayout,
      attributes.className,
      attributes.harmonizeImageText,
    ]);

    useEffect(() => {
      if (listedConfig?.name !== 'core/button') {
        return;
      }

      const migrated = migrateLegacyButtonFontSizeAttributes(attributes);
      if (migrated) {
        setOptionAttributes(migrated);
      }
    }, [
      listedConfig?.name,
      props.clientId,
      attributes.fontSize,
      attributes.buttonSize,
      attributes.style,
    ]);

    // Legacy container-padding tokens → class values on the attribute.
    useEffect(() => {
      if (!listedConfig) {
        return;
      }

      const migrated = migrateLegacyContainerPaddingAttributes(attributes);
      if (migrated) {
        setOptionAttributes(migrated);
      }
    }, [listedConfig?.name, props.clientId, attributes.containerPadding]);

    useEffect(() => {
      if (listedConfig?.name !== 'core/button') {
        return;
      }

      const synced = syncButtonIconOnlyPlaceholderText(attributes);
      if (synced) {
        setAttributes(synced);
      }
    }, [listedConfig?.name, props.clientId, attributes.buttonIcon, attributes.text]);

    // Spacer: clear responsive height preset when the user edits core height.
    useEffect(() => {
      if (props.name !== 'core/spacer' || !listedConfig) {
        return;
      }

      const responsive = attributes.spacerResponsiveHeight;
      const currentHeight = attributes.height;

      if (currentHeight === prevHeightRef.current) {
        return;
      }

      prevHeightRef.current = currentHeight;

      if (responsive && currentHeight) {
        setOptionAttributes({ spacerResponsiveHeight: '' });
      }
    }, [props.name, attributes.height, attributes.spacerResponsiveHeight]);

    useEffect(() => {
      const className = syncClassNameFromOptions(attributes, blockConfig);

      if (className !== (attributes.className || '')) {
        setAttributes({ className });
      }
    }, blockOptionSyncDeps(blockConfig, attributes));

    const buttonIconOnly = blockConfig.name === 'core/button' && isButtonIconOnly(attributes);

    return (
      <Fragment>
        <BlockEdit {...props} />
        {isSelected && (
          <InspectorControls>
            <PanelBody title="Block Einstellungen">
              {blockConfig.options.map((option, index) => {
                if (
                  buttonIconOnly &&
                  option.type === 'button-group' &&
                  option.attributeName === 'buttonIconPosition'
                ) {
                  return null;
                }

                if (
                  isImageInGallery &&
                  (GALLERY_OWNED_IMAGE_ATTRIBUTES.includes(option.attributeName) ||
                    GALLERY_OWNED_IMAGE_TYPES.includes(option.type))
                ) {
                  return null;
                }

                const custom = getCustom(option.type);
                if (custom) {
                  const Control = custom.Control;

                  return (
                    <BlockOptionWrapper key={getBlockOptionKey(option, index)} option={option} index={index}>
                      <Control
                        option={option}
                        attributes={attributes}
                        onChange={setOptionAttributes}
                      />
                    </BlockOptionWrapper>
                  );
                }

                if (option.type === 'boolean') {
                  const { rowLabel, toggleLabel } = getBooleanOptionLabels(option);

                  return (
                    <BlockOptionWrapper key={getBlockOptionKey(option, index)} option={option} index={index}>
                      {rowLabel ? <span className="bl-block-option__label">{rowLabel}</span> : null}
                      <ToggleControl
                        label={toggleLabel}
                        checked={attributes[option.attributeName]}
                        onChange={(newValue) => setOptionAttributes({ [option.attributeName]: newValue })}
                        __nextHasNoMarginBottom
                        {...optionHelpProps(option)}
                      />
                    </BlockOptionWrapper>
                  );
                }

                if (option.type === 'select') {
                  return (
                    <BlockOptionWrapper key={getBlockOptionKey(option, index)} option={option} index={index}>
                      <SelectControl
                        label={option.label}
                        value={attributes[option.attributeName]}
                        options={option.options}
                        onChange={(newValue) => setOptionAttributes({ [option.attributeName]: newValue })}
                        {...optionHelpProps(option)}
                      />
                    </BlockOptionWrapper>
                  );
                }

                if (option.type === 'icon') {
                  const prefix = iconPrefix(option);
                  return (
                    <BlockOptionWrapper key={getBlockOptionKey(option, index)} option={option} index={index}>
                      <IconPicker
                        label={option.label}
                        description={option.description}
                        value={iconNameFromClass(attributes[option.attributeName], option)}
                        onChange={(name) =>
                          setOptionAttributes({
                            [option.attributeName]: name ? prefix + name : '',
                          })
                        }
                      />
                    </BlockOptionWrapper>
                  );
                }

                if (option.type === 'button-group') {
                  if (ToggleGroupControl) {
                    return (
                      <BlockOptionWrapper key={getBlockOptionKey(option, index)} option={option} index={index}>
                        <ToggleGroupControl
                          className="bl-block-option-button-group"
                          label={option.label}
                          value={attributes[option.attributeName] ?? option.default ?? ''}
                          isBlock
                          onChange={(newValue) => setOptionAttributes({ [option.attributeName]: newValue })}
                          __nextHasNoMarginBottom
                          __next40pxDefaultSize
                          {...optionHelpProps(option)}
                        >
                          {option.options.map((opt) => (
                            <BlockOptionToggleGroupOption
                              key={opt.value || 'default'}
                              value={opt.value}
                              label={opt.label}
                              icon={opt.icon}
                              iconLabel={option.iconLabel}
                              iconPosition={opt.iconPosition}
                              title={opt.title}
                            />
                          ))}
                        </ToggleGroupControl>
                      </BlockOptionWrapper>
                    );
                  }
                  return (
                    <BlockOptionWrapper key={getBlockOptionKey(option, index)} option={option} index={index}>
                      <SelectControl
                        label={option.label}
                        value={attributes[option.attributeName]}
                        options={option.options}
                        onChange={(newValue) => setOptionAttributes({ [option.attributeName]: newValue })}
                        {...optionHelpProps(option)}
                      />
                    </BlockOptionWrapper>
                  );
                }

                return null;
              })}
            </PanelBody>
          </InspectorControls>
        )}
      </Fragment>
    );
  };
}, 'addControl');

wp.hooks.addFilter('editor.BlockEdit', 'custom-block-options/add-control', addControl);
