/**
 * ACF inner-blocks toolbar (insert child block from parent toolbar).
 * Enqueued only when the acf/ drop-in is loaded.
 */
(function (wp) {
  if (!wp || !wp.blockEditor || !wp.components || !wp.compose || !wp.element || !wp.hooks) {
    return;
  }

  var el = wp.element.createElement;
  var Fragment = wp.element.Fragment;
  var BlockControls = wp.blockEditor.BlockControls;
  var ToolbarButton = wp.components.ToolbarButton;
  var createHigherOrderComponent = wp.compose.createHigherOrderComponent;
  var toolbarConfigs = window.baselayerAcfInnerBlocksToolbar || {};

  function getToolbarContext(blockName, clientId) {
    if (toolbarConfigs[blockName]) {
      return {
        config: toolbarConfigs[blockName],
        parentClientId: clientId,
        insertAfterClientId: null,
      };
    }

    var select = wp.data.select('core/block-editor');
    var parentClientId = select.getBlockRootClientId(clientId);
    if (!parentClientId) {
      return null;
    }

    var parentBlock = select.getBlock(parentClientId);
    if (!parentBlock || !toolbarConfigs[parentBlock.name]) {
      return null;
    }

    return {
      config: toolbarConfigs[parentBlock.name],
      parentClientId: parentClientId,
      insertAfterClientId: clientId,
    };
  }

  function insertInnerBlock(context) {
    var select = wp.data.select('core/block-editor');
    var dispatch = wp.data.dispatch('core/block-editor');
    var newBlock = wp.blocks.createBlock(context.config.insertBlock);
    var insertIndex;

    if (context.insertAfterClientId) {
      insertIndex = select.getBlockIndex(context.insertAfterClientId) + 1;
    } else {
      insertIndex = select.getBlocks(context.parentClientId).length;
    }

    dispatch.insertBlocks([newBlock], insertIndex, context.parentClientId, true);
  }

  var withAcfInnerBlocksToolbar = createHigherOrderComponent(function (BlockEdit) {
    return function (props) {
      var context = getToolbarContext(props.name, props.clientId);
      if (!context) {
        return el(BlockEdit, props);
      }

      return el(
        Fragment,
        null,
        props.isSelected
          ? el(
              BlockControls,
              { group: 'other' },
              el(ToolbarButton, {
                icon: 'plus-alt2',
                label: context.config.label,
                onClick: function () {
                  insertInnerBlock(context);
                },
              })
            )
          : null,
        el(BlockEdit, props)
      );
    };
  }, 'withAcfInnerBlocksToolbar');

  if (Object.keys(toolbarConfigs).length) {
    wp.hooks.addFilter(
      'editor.BlockEdit',
      'baselayer/acf-inner-blocks-toolbar',
      withAcfInnerBlocksToolbar
    );
  }
})(window.wp);
