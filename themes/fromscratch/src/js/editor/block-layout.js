const { createHigherOrderComponent } = wp.compose;
const { useEffect } = wp.element;

const BLOCKS_WITHOUT_LAYOUT = ['core/group', 'core/cover', 'core/column'];

const stripBlockLayout = createHigherOrderComponent((BlockEdit) => {
  return (props) => {
    const { name, attributes, setAttributes } = props;

    useEffect(() => {
      if (!BLOCKS_WITHOUT_LAYOUT.includes(name) || !attributes.layout) {
        return;
      }

      setAttributes({ layout: undefined });
    }, [name, attributes.layout, setAttributes]);

    return <BlockEdit {...props} />;
  };
}, 'stripBlockLayout');

wp.hooks.addFilter('editor.BlockEdit', 'fromscratch/block-layout/strip', stripBlockLayout);
