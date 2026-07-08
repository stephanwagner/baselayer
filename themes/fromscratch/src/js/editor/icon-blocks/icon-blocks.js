import { InlineIconControl } from '../icons/inline-icon-control';

const { useBlockProps, InnerBlocks } = wp.blockEditor;

const ICON_SLUG_ATTRIBUTE = 'iconSlug';

const ICON_BLOCKS = {
  'acf/icon': IconBlockEdit,
  'acf/icon-text': IconTextBlockEdit,
};

function IconBlockEdit({ attributes, setAttributes, isSelected }) {
  const iconSlug = attributes[ICON_SLUG_ATTRIBUTE] || '';
  const blockProps = useBlockProps({
    className: ['icon__wrapper', 'fs-wp-block', attributes.className].filter(Boolean).join(' '),
  });

  return (
    <div {...blockProps}>
      <div className="icon__container">
        <div className="icon__content">
          <div className="icon__icon">
            <InlineIconControl
              value={iconSlug}
              isActive={isSelected}
              onChange={(next) => setAttributes({ [ICON_SLUG_ATTRIBUTE]: next })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function IconTextBlockEdit({ attributes, setAttributes, isSelected }) {
  const iconSlug = attributes[ICON_SLUG_ATTRIBUTE] || '';
  const blockProps = useBlockProps({
    className: ['icon-text__wrapper', 'fs-wp-block', attributes.className].filter(Boolean).join(' '),
  });
  const hasIcon = Boolean(iconSlug);

  return (
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
                renderAppender={isSelected ? InnerBlocks.ButtonBlockAppender : InnerBlocks.DefaultBlockAppender}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

wp.hooks.addFilter('blocks.registerBlockType', 'fromscratch/icon-blocks', (settings, name) => {
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
