/**
 * Form block editor registration.
 */
(function (wp) {
  if (!wp || !wp.blocks || !wp.element || !wp.blockEditor || !wp.components) {
    return;
  }

  const { registerBlockType } = wp.blocks;
  const { createElement: el, Fragment } = wp.element;
  const { InspectorControls, useBlockProps } = wp.blockEditor;
  const { PanelBody, SelectControl } = wp.components;
  const options = (window.blFormsBlock && window.blFormsBlock.options) || [
    { label: 'Select a form…', value: '0' },
  ];

  registerBlockType('baselayer/form', {
    edit: function Edit(props) {
      const { attributes, setAttributes } = props;
      const formId = attributes.formId || 0;
      const blockProps = useBlockProps({ className: 'bl-form-block-editor' });
      const selected = options.find((opt) => String(opt.value) === String(formId));

      return el(
        Fragment,
        null,
        el(
          InspectorControls,
          null,
          el(
            PanelBody,
            { title: 'Form', initialOpen: true },
            el(SelectControl, {
              label: 'Form',
              value: String(formId || 0),
              options,
              onChange: (value) => setAttributes({ formId: parseInt(value, 10) || 0 }),
            })
          )
        ),
        el(
          'div',
          blockProps,
          el(
            'div',
            { className: 'bl-form-block-placeholder' },
            formId
              ? 'Form: ' + (selected ? selected.label : '#' + formId)
              : 'Select a form in the block settings.'
          )
        )
      );
    },
    save: function save() {
      return null;
    },
  });
})(window.wp);
