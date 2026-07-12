/**
 * Register FromScratch Creator custom blocks in the editor (PoC).
 */
(function (wp) {
  if (!wp || !wp.blocks || !wp.element || !wp.blockEditor || !wp.components) {
    return;
  }

  const { registerBlockType } = wp.blocks;
  const { createElement: el, Fragment } = wp.element;
  const { InspectorControls, useBlockProps } = wp.blockEditor;
  const { PanelBody, TextControl, TextareaControl, SelectControl, ToggleControl } = wp.components;
  const config = window.fromscratchCreatorBlocks || {};
  const blocks = Array.isArray(config.blocks) ? config.blocks : [];

  function renderFieldControl(field, attributes, setAttributes) {
    const slug = field.slug;
    const label = field.title || slug;
    const value = attributes[slug];
    const onChange = (next) => setAttributes({ [slug]: next });

    if (field.type === 'textarea') {
      return el(TextareaControl, {
        key: slug,
        label,
        value: value == null ? '' : String(value),
        onChange,
        rows: field.rows || 4,
        help: field.presentation && field.presentation.description,
      });
    }

    if (field.type === 'checkbox') {
      return el(ToggleControl, {
        key: slug,
        label,
        checked: Boolean(value),
        onChange,
        help: field.presentation && field.presentation.description,
      });
    }

    if (field.type === 'select') {
      const options = [{ label: '—', value: '' }].concat(
        (field.options || []).map((opt) => ({
          label: opt.label || opt.value,
          value: String(opt.value),
        }))
      );
      return el(SelectControl, {
        key: slug,
        label,
        value: value == null ? '' : String(value),
        options,
        onChange,
        help: field.presentation && field.presentation.description,
      });
    }

    return el(TextControl, {
      key: slug,
      label,
      value: value == null ? '' : String(value),
      onChange,
      help: field.presentation && field.presentation.description,
    });
  }

  blocks.forEach((block) => {
    if (!block || !block.name) {
      return;
    }

    registerBlockType(block.name, {
      apiVersion: 3,
      title: block.title || block.slug,
      category: 'fromscratch',
      icon: 'block-default',
      attributes: block.attributes || {},
      supports: {
        html: false,
        className: true,
      },
      edit: function Edit(props) {
        const { attributes, setAttributes } = props;
        const blockProps = useBlockProps({ className: 'fs-creator-block-editor' });
        const fields = Array.isArray(block.fields) ? block.fields : [];

        return el(
          Fragment,
          null,
          el(
            InspectorControls,
            null,
            el(
              PanelBody,
              { title: block.title || 'Fields', initialOpen: true },
              fields.length
                ? fields.map((field) => renderFieldControl(field, attributes, setAttributes))
                : el('p', null, 'No fields yet. Add fields in Blocks admin.')
            )
          ),
          el(
            'div',
            blockProps,
            el('strong', null, block.title || block.slug),
            fields.length
              ? el(
                  'ul',
                  { className: 'fs-creator-block-editor__preview' },
                  fields.map((field) => {
                    let val = attributes[field.slug];
                    if (Array.isArray(val)) {
                      val = val.join(', ');
                    } else if (typeof val === 'boolean') {
                      val = val ? 'true' : 'false';
                    }
                    return el('li', { key: field.slug }, (field.title || field.slug) + ': ' + (val == null || val === '' ? '—' : String(val)));
                  })
                )
              : el('p', { className: 'description' }, 'No fields configured.')
          )
        );
      },
      save: function () {
        return null;
      },
    });
  });
})(window.wp);
