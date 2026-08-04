import { InlineIconControl } from '../icons/inline-icon-control';
import { IconPicker } from '../icons/icon-picker';

const { useBlockProps, InnerBlocks, InspectorControls } = wp.blockEditor;
const { PanelBody } = wp.components;

const ICON_SLUG_ATTRIBUTE = 'iconSlug';

// Keep in sync with icon-text.php InnerBlocks allowedBlocks
const ICON_TEXT_ALLOWED_BLOCKS = ['core/heading', 'core/paragraph', 'core/buttons', 'core/separator'];
const ICON_TEXT_INNER_TEMPLATE = [['core/paragraph', {}]];

const iconL10n = (typeof window !== 'undefined' && window.baselayerIcons) || {};
const uiStrings = iconL10n.ui || {};
const t = (key, fallback) => uiStrings[key] || fallback;

const ICON_BLOCKS = {
  'acf/icon': IconBlockEdit,
  'acf/icon-text': IconTextBlockEdit,
};

function IconInspector({ iconSlug, setAttributes }) {
  return (
    <InspectorControls>
      <PanelBody title={t('icon', 'Icon')} initialOpen={true}>
        <IconPicker
          value={iconSlug || ''}
          onChange={(next) => setAttributes({ [ICON_SLUG_ATTRIBUTE]: next || '' })}
        />
      </PanelBody>
    </InspectorControls>
  );
}

function IconBlockEdit({ attributes, setAttributes, isSelected }) {
  const iconSlug = attributes[ICON_SLUG_ATTRIBUTE] || '';
  const hasIcon = Boolean(iconSlug);
  const blockProps = useBlockProps({
    className: ['icon__wrapper', 'bl-wp-block', attributes.className].filter(Boolean).join(' '),
  });

  return (
    <>
      <IconInspector iconSlug={iconSlug} setAttributes={setAttributes} />
      <div {...blockProps}>
        <div className="icon__container">
          <div className="icon__content">
            <div className={'icon__icon' + (hasIcon ? ' -has-icon' : '')}>
              <InlineIconControl
                value={iconSlug}
                isActive={isSelected}
                onChange={(next) => setAttributes({ [ICON_SLUG_ATTRIBUTE]: next })}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function IconTextBlockEdit({ attributes, setAttributes, isSelected }) {
  const iconSlug = attributes[ICON_SLUG_ATTRIBUTE] || '';
  const blockProps = useBlockProps({
    className: ['icon-text__wrapper', 'bl-wp-block', attributes.className].filter(Boolean).join(' '),
  });
  const hasIcon = Boolean(iconSlug);

  return (
    <>
      <IconInspector iconSlug={iconSlug} setAttributes={setAttributes} />
      <div {...blockProps}>
        <div className="icon-text__container">
          <div className="icon-text__content">
            <div className={'icon-text__icon icon__icon' + (hasIcon ? ' -has-icon' : '')}>
              <InlineIconControl
                value={iconSlug}
                isActive={isSelected}
                onChange={(next) => setAttributes({ [ICON_SLUG_ATTRIBUTE]: next })}
              />
            </div>
            <div className="icon-text__text-container">
              <div className="icon-text__text">
                <InnerBlocks
                  allowedBlocks={ICON_TEXT_ALLOWED_BLOCKS}
                  template={ICON_TEXT_INNER_TEMPLATE}
                  templateLock={false}
                  renderAppender={isSelected ? InnerBlocks.ButtonBlockAppender : InnerBlocks.DefaultBlockAppender}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

wp.hooks.addFilter('blocks.registerBlockType', 'baselayer/icon-blocks', (settings, name) => {
  if (!ICON_BLOCKS[name]) {
    return settings;
  }

  return {
    ...settings,
    attributes: {
      ...settings.attributes,
      [ICON_SLUG_ATTRIBUTE]: {
        type: 'string',
        default: '',
      },
    },
    edit: ICON_BLOCKS[name],
  };
});
