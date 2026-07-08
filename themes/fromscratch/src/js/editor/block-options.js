import { blockOptions } from '../../../config/block-options';
import { IconPicker } from './icons/icon-picker';
import { ContentMarginControl } from './content-margin-control';
import { LimitWidthControl } from './limit-width-control';
import { SpacerResponsiveHeightControl } from './spacer-responsive-height-control';
import { BlockOptionToggleGroupOption } from './block-option-toggle-group-option';
import { BlockOptionDescription, optionHelpProps } from './block-option-help';
import {
  ALL_CONTENT_MARGIN_CLASSES,
  contentMarginAttributeKeys,
  contentMarginClassesFromAttributes,
  migrateLegacyContentMarginAttributes,
} from './content-margin-utils';
import {
  ALL_LIMIT_WIDTH_CLASSES,
  limitWidthAttributeKeys,
  limitWidthClassesFromAttributes,
  migrateLegacyLimitWidthAttributes,
} from './limit-width-utils';
import {
  ALL_SPACER_RESPONSIVE_HEIGHT_CLASSES,
  spacerResponsiveHeightAttributeKey,
  spacerResponsiveHeightClassesFromAttributes,
} from './spacer-responsive-height-utils';

const { InspectorControls } = wp.blockEditor;
const { PanelBody, ToggleControl, SelectControl } = wp.components;
const ToggleGroupControl = wp.components.__experimentalToggleGroupControl;
const { createHigherOrderComponent } = wp.compose;
const { Fragment, useEffect, useRef } = wp.element;

// Prefix used when an `icon` option is stored as a class name (e.g. `-icon-bolt`).
const ICON_CLASS_PREFIX = '-icon-';

// Marker class added whenever an icon option has a value (target any icon button in CSS).
const HAS_ICON_CLASS = '-has-icon';

// Auto-applied when a button has an icon but no label text.
const ICON_ONLY_CLASS = '-icon-only';

// Legacy media-text layout classes (removed; stripped on sync / migration).
const LEGACY_IMAGE_TEXT_LAYOUT_CLASSES = [
  '-image-left-text-right',
  '-image-right-text-left',
  '-image-text-layout',
];

const iconPrefix = (option) => option.classPrefix || ICON_CLASS_PREFIX;

// Strip the class prefix so the picker works with the raw icon name.
const iconNameFromClass = (value, option) => {
  const prefix = iconPrefix(option);
  return value && value.indexOf(prefix) === 0 ? value.slice(prefix.length) : '';
};

/**
 * Boolean option labels: `label` = optional row label; `toggleLabel` = text on the switch.
 * Legacy: if only `label` is set, it is used as the toggle label (no row label).
 */
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
  if (option.type === 'content-margin') {
    return 'content-margin-' + index;
  }

  if (option.type === 'limit-width') {
    return 'limit-width-' + index;
  }

  return option.attributeName || 'block-option-' + index;
};

const getBlockOptionWrapperClass = (option, index) => {
  const classes = ['fs-block-option'];

  if (option.type === 'boolean') {
    classes.push('fs-block-option-boolean');
  }

  if (index > 0 && !option.noSeparator) {
    classes.push('fs-block-option--separated');
  }

  return classes.join(' ');
};

const BlockOptionWrapper = ({ option, index, children }) =>
  wp.element.createElement(
    'div',
    { className: getBlockOptionWrapperClass(option, index) },
    children
  );

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

const contentMarginOptions = (blockConfig) =>
  blockConfig.options.filter((option) => option.type === 'content-margin');

const limitWidthOptions = (blockConfig) =>
  blockConfig.options.filter((option) => option.type === 'limit-width');

/** Migrate legacy media-text layout select / className to harmonizeImageText boolean. */
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
  xl: '-extra-large',
  'x-large': '-extra-large',
};

// Placeholder label so core/button save() outputs markup for icon-only buttons (WP skips empty text).
const BUTTON_ICON_ONLY_PLACEHOLDER = '\u200B';

const stripButtonPlaceholderText = (text) => (text || '').replace(/\u200B/g, '').trim();

const isButtonIconOnly = (attributes) =>
  Boolean(attributes.buttonIcon) && stripButtonPlaceholderText(attributes.text) === '';

/** Keep icon-only buttons saveable: inject or remove the zero-width space placeholder. */
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

/** Migrate legacy WP font-size presets into the theme buttonSize option. */
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

// Static class names managed by block options (boolean / select / button-group values).
const managedStaticClasses = (blockConfig) => {
  const classes = new Set([
    HAS_ICON_CLASS,
    ICON_ONLY_CLASS,
    ...ALL_CONTENT_MARGIN_CLASSES,
    ...ALL_LIMIT_WIDTH_CLASSES,
    ...ALL_SPACER_RESPONSIVE_HEIGHT_CLASSES,
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

// Build the class list implied by current block-option attribute values.
const collectOptionClasses = (blockConfig, attributes) => {
  const classes = [];

  blockConfig.options.forEach((option) => {
    if (option.type === 'content-margin') {
      classes.push(...contentMarginClassesFromAttributes(option, attributes));
    } else if (option.type === 'limit-width') {
      classes.push(...limitWidthClassesFromAttributes(option, attributes));
    } else if (option.type === 'spacer-responsive-height') {
      classes.push(...spacerResponsiveHeightClassesFromAttributes(option, attributes));
    } else if (option.type === 'boolean' && attributes[option.attributeName]) {
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

  // `-icon-only` is applied on the front end only (render_block); not in the editor canvas.
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

const blockOptionAttributeKeys = (blockConfig) =>
  blockConfig.options.flatMap((option) => {
    if (option.type === 'content-margin') {
      return [...contentMarginAttributeKeys(option), 'contentMargin', 'contentMarginAdjust'];
    }

    if (option.type === 'limit-width') {
      return [...limitWidthAttributeKeys(option), 'limitWidth'];
    }

    if (option.type === 'spacer-responsive-height') {
      return [spacerResponsiveHeightAttributeKey(option), 'height'];
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

// Add attributes to the block
blockOptions.forEach((block) => {
  const blockSlug = getBlockSlug(block.name);

  wp.hooks.addFilter('blocks.registerBlockType', 'custom-block-options/block-' + blockSlug, (settings, name) => {
    if (name === block.name) {
      block.options.forEach((option) => {
        if (option.type === 'content-margin') {
          const { top, bottom, linked } = option.attributeNames;
          const defaultSize = option.defaultSize ?? '';
          settings.attributes = {
            ...settings.attributes,
            [top]: { type: 'string', default: defaultSize },
            [bottom]: { type: 'string', default: defaultSize },
            [linked]: { type: 'boolean', default: true },
            contentMargin: { type: 'string', default: '' },
            contentMarginAdjust: { type: 'string', default: '' },
          };
          return;
        }

        if (option.type === 'limit-width') {
          const { size, align } = option.attributeNames;
          settings.attributes = {
            ...settings.attributes,
            [size]: { type: 'string', default: '' },
            [align]: { type: 'string', default: option.defaultAlign ?? 'center' },
            limitWidth: { type: 'string', default: '' },
          };
          return;
        }

        if (option.type === 'spacer-responsive-height') {
          settings.attributes = {
            ...settings.attributes,
            [option.attributeName]: { type: 'string', default: option.default ?? '' },
          };
          return;
        }

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

    const skipHeightResetRef = useRef(false);
    const prevHeightRef = useRef(attributes.height);

    const setOptionAttributes = (updates) => {
      const nextAttributes = { ...attributes, ...updates };
      const className = syncClassNameFromOptions(nextAttributes, blockConfig);

      setAttributes({
        ...updates,
        className,
      });
    };

    // Migrate legacy margin selects / className into the new attributes once.
    useEffect(() => {
      if (!blockConfig) {
        return;
      }

      const marginOptions = contentMarginOptions(blockConfig);
      if (!marginOptions.length) {
        return;
      }

      let updates = {};
      marginOptions.forEach((option) => {
        const migrated = migrateLegacyContentMarginAttributes(
          { ...attributes, ...updates },
          option
        );
        if (migrated) {
          updates = { ...updates, ...migrated };
        }
      });

      if (Object.keys(updates).length) {
        setOptionAttributes(updates);
      }
    }, [
      blockConfig?.name,
      props.clientId,
      attributes.contentMargin,
      attributes.contentMarginAdjust,
      attributes.className,
    ]);

    // Migrate legacy limit-width select / className into split attributes once.
    useEffect(() => {
      if (!blockConfig) {
        return;
      }

      const widthOptions = limitWidthOptions(blockConfig);
      if (!widthOptions.length) {
        return;
      }

      let updates = {};
      widthOptions.forEach((option) => {
        const migrated = migrateLegacyLimitWidthAttributes(
          { ...attributes, ...updates },
          option
        );
        if (migrated) {
          updates = { ...updates, ...migrated };
        }
      });

      if (Object.keys(updates).length) {
        setOptionAttributes(updates);
      }
    }, [
      blockConfig?.name,
      props.clientId,
      attributes.limitWidth,
      attributes.className,
    ]);

    // Migrate legacy media-text layout select / className into harmonizeImageText boolean once.
    useEffect(() => {
      if (!blockConfig || blockConfig.name !== 'core/columns') {
        return;
      }

      const migrated = migrateLegacyImageTextLayoutAttributes(attributes);
      if (migrated) {
        setOptionAttributes(migrated);
      }
    }, [
      blockConfig?.name,
      props.clientId,
      attributes.imageTextLayout,
      attributes.className,
      attributes.harmonizeImageText,
    ]);

    // Migrate legacy WP font-size on buttons into buttonSize once.
    useEffect(() => {
      if (blockConfig?.name !== 'core/button') {
        return;
      }

      const migrated = migrateLegacyButtonFontSizeAttributes(attributes);
      if (migrated) {
        setOptionAttributes(migrated);
      }
    }, [
      blockConfig?.name,
      props.clientId,
      attributes.fontSize,
      attributes.buttonSize,
      attributes.style,
    ]);

    // Icon-only buttons: WP does not save/render empty text — use a zero-width space placeholder.
    useEffect(() => {
      if (blockConfig?.name !== 'core/button') {
        return;
      }

      const synced = syncButtonIconOnlyPlaceholderText(attributes);
      if (synced) {
        setAttributes(synced);
      }
    }, [blockConfig?.name, props.clientId, attributes.buttonIcon, attributes.text]);

    // Spacer: reset responsive preset when the user edits static height.
    useEffect(() => {
      if (props.name !== 'core/spacer' || !blockConfig) {
        return;
      }

      const responsive = attributes.spacerResponsiveHeight;
      const currentHeight = attributes.height;

      if (skipHeightResetRef.current) {
        skipHeightResetRef.current = false;
        prevHeightRef.current = currentHeight;
        return;
      }

      if (currentHeight === prevHeightRef.current) {
        return;
      }

      prevHeightRef.current = currentHeight;

      if (responsive && currentHeight) {
        setOptionAttributes({ spacerResponsiveHeight: '' });
      }
    }, [props.name, attributes.height, attributes.spacerResponsiveHeight]);

    // Backfill `className` when option attributes and wrapper classes drift (e.g. after adding `-has-icon`).
    useEffect(() => {
      if (!blockConfig) {
        return;
      }

      const className = syncClassNameFromOptions(attributes, blockConfig);

      if (className !== (attributes.className || '')) {
        setAttributes({ className });
      }
    }, blockConfig ? blockOptionSyncDeps(blockConfig, attributes) : []);

    const buttonIconOnly = blockConfig?.name === 'core/button' && isButtonIconOnly(attributes);

    if (blockConfig) {
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

                  if (option.type === 'content-margin') {
                    return (
                      <BlockOptionWrapper key={getBlockOptionKey(option, index)} option={option} index={index}>
                        <ContentMarginControl
                          option={option}
                          attributes={attributes}
                          onChange={setOptionAttributes}
                        />
                      </BlockOptionWrapper>
                    );
                  }

                  if (option.type === 'limit-width') {
                    return (
                      <BlockOptionWrapper key={getBlockOptionKey(option, index)} option={option} index={index}>
                        <LimitWidthControl
                          option={option}
                          attributes={attributes}
                          onChange={setOptionAttributes}
                        />
                      </BlockOptionWrapper>
                    );
                  }

                  if (option.type === 'spacer-responsive-height') {
                    return (
                      <BlockOptionWrapper key={getBlockOptionKey(option, index)} option={option} index={index}>
                        <SpacerResponsiveHeightControl
                          option={option}
                          attributes={attributes}
                          onChange={(updates) => {
                            if (updates.height === undefined && updates[option.attributeName]) {
                              skipHeightResetRef.current = true;
                            }
                            setOptionAttributes(updates);
                          }}
                        />
                      </BlockOptionWrapper>
                    );
                  }

                  if (option.type === 'boolean') {
                    const { rowLabel, toggleLabel } = getBooleanOptionLabels(option);

                    return (
                      <BlockOptionWrapper key={getBlockOptionKey(option, index)} option={option} index={index}>
                        {rowLabel ? <span className="fs-block-option__label">{rowLabel}</span> : null}
                        <ToggleControl
                          label={toggleLabel}
                          checked={attributes[option.attributeName]}
                          onChange={(newValue) => setOptionAttributes({ [option.attributeName]: newValue })}
                          __nextHasNoMarginBottom
                          {...optionHelpProps(option)}
                        />
                      </BlockOptionWrapper>
                    );
                  } else if (option.type === 'select') {
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
                  } else if (option.type === 'icon') {
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
                  } else if (option.type === 'button-group') {
                    if (ToggleGroupControl) {
                      return (
                        <BlockOptionWrapper key={getBlockOptionKey(option, index)} option={option} index={index}>
                          <ToggleGroupControl
                            className="fs-block-option-button-group"
                            label={option.label}
                            value={attributes[option.attributeName] ?? option.default ?? ''}
                            isBlock
                            onChange={(newValue) => setOptionAttributes({ [option.attributeName]: newValue })}
                            __nextHasNoMarginBottom
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
