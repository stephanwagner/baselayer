const { BlockControls } = wp.blockEditor;
const { ToolbarButton } = wp.components;
const { createHigherOrderComponent } = wp.compose;
const { Fragment } = wp.element;

const toolbarConfigs = window.fromscratchAcfInnerBlocksToolbar || {};

const getToolbarContext = (blockName, clientId) => {
  if (toolbarConfigs[blockName]) {
    return {
      config: toolbarConfigs[blockName],
      parentClientId: clientId,
      insertAfterClientId: null,
    };
  }

  const select = wp.data.select('core/block-editor');
  const parentClientId = select.getBlockRootClientId(clientId);

  if (!parentClientId) {
    return null;
  }

  const parentBlock = select.getBlock(parentClientId);

  if (!parentBlock || !toolbarConfigs[parentBlock.name]) {
    return null;
  }

  return {
    config: toolbarConfigs[parentBlock.name],
    parentClientId,
    insertAfterClientId: clientId,
  };
};

const insertInnerBlock = ({ config, parentClientId, insertAfterClientId }) => {
  const select = wp.data.select('core/block-editor');
  const dispatch = wp.data.dispatch('core/block-editor');
  const newBlock = wp.blocks.createBlock(config.insertBlock);

  let insertIndex;

  if (insertAfterClientId) {
    insertIndex = select.getBlockIndex(insertAfterClientId) + 1;
  } else {
    insertIndex = select.getBlocks(parentClientId).length;
  }

  dispatch.insertBlocks([newBlock], insertIndex, parentClientId, true);
};

const withAcfInnerBlocksToolbar = createHigherOrderComponent((BlockEdit) => {
  return (props) => {
    const { name, clientId, isSelected } = props;
    const context = getToolbarContext(name, clientId);

    if (!context) {
      return <BlockEdit {...props} />;
    }

    const { config } = context;

    return (
      <Fragment>
        {isSelected && (
          <BlockControls group="other">
            <ToolbarButton
              label={config.label}
              onClick={() => insertInnerBlock(context)}
            >
              {config.text}
            </ToolbarButton>
          </BlockControls>
        )}
        <BlockEdit {...props} />
      </Fragment>
    );
  };
}, 'withAcfInnerBlocksToolbar');

if (Object.keys(toolbarConfigs).length) {
  wp.hooks.addFilter(
    'editor.BlockEdit',
    'fromscratch/acf-inner-blocks-toolbar',
    withAcfInnerBlocksToolbar
  );
}
