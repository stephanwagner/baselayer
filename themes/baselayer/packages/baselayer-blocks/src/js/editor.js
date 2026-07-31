/**
 * Block editor: dynamic Blocks + Page Settings document panels.
 */
import { openFieldsModal } from './admin/field-form.js';

(function (wp) {
  if (!wp || !wp.element || !wp.components || !wp.blocks) {
    return;
  }

  const { createElement: el, Fragment, RawHTML } = wp.element;
  const { Button, PanelBody, ToolbarGroup, ToolbarButton } = wp.components;
  const { InspectorControls, BlockControls, useBlockProps } = wp.blockEditor || {};
  const { registerBlockType } = wp.blocks;
  const { registerPlugin } = wp.plugins || {};
  const { PluginDocumentSettingPanel } = wp.editPost || wp.editor || {};
  const { useSelect, useDispatch } = wp.data || {};

  const blockConfig = window.blBlocksEditor || {};
  const pageConfig = window.blBlocksPage || {};
  const blockI18n = blockConfig.i18n || {};
  const pageI18n = pageConfig.i18n || {};

  function blockIcon(icon) {
    if (typeof icon === 'string' && icon.toLowerCase().includes('<svg')) {
      return {
        src: el(
          'span',
          { style: { display: 'flex' } },
          el(RawHTML, null, icon)
        ),
      };
    }
    return icon || 'block-default';
  }

  function openBlockModal(fields, values, onSave, title) {
    openFieldsModal({
      title: title || blockI18n.edit || 'Edit fields',
      fields,
      values: values || {},
      onSave,
    });
  }

  (blockConfig.blocks || []).forEach((def) => {
    if (!def || !def.name) return;

    registerBlockType(def.name, {
      apiVersion: 3,
      title: def.title || def.slug,
      description: def.description || '',
      category: def.category || 'widgets',
      icon: blockIcon(def.icon),
      keywords: def.keywords || [],
      attributes: {
        values: {
          type: 'object',
          default: {},
        },
      },
      supports: {
        html: false,
        className: true,
        anchor: true,
      },
      edit: function Edit(props) {
        const { attributes, setAttributes } = props;
        const values = attributes.values || {};
        const open = () =>
          openBlockModal(def.fields || [], values, (next) => {
            setAttributes({ values: next });
          }, def.title);

        const blockProps = useBlockProps
          ? useBlockProps({ className: 'bl-blocks-block-editor' })
          : { className: 'bl-blocks-block-editor' };

        return el(
          Fragment,
          null,
          BlockControls
            ? el(
                BlockControls,
                { group: 'block' },
                el(
                  ToolbarGroup,
                  null,
                  el(ToolbarButton, {
                    icon: 'edit',
                    label: blockI18n.edit || 'Edit fields',
                    onClick: open,
                  })
                )
              )
            : null,
          InspectorControls
            ? el(
                InspectorControls,
                null,
                el(
                  PanelBody,
                  { title: blockI18n.panelTitle || 'Block fields', initialOpen: true },
                  el(
                    Button,
                    { variant: 'secondary', onClick: open },
                    blockI18n.edit || 'Edit fields'
                  )
                )
              )
            : null,
          el(
            'div',
            blockProps,
            el('strong', null, def.title || def.slug),
            el('p', null, blockI18n.preview || 'Edit fields to configure this block.')
          )
        );
      },
      save: function save() {
        return null;
      },
    });
  });

  if (registerPlugin && PluginDocumentSettingPanel && Array.isArray(pageConfig.definitions)) {
    pageConfig.definitions.forEach((def) => {
      registerPlugin('bl-blocks-page-' + def.id, {
        render: function PageSettingsPanel() {
          const meta = useSelect
            ? useSelect((select) => {
                const editor = select('core/editor');
                return editor && editor.getEditedPostAttribute
                  ? editor.getEditedPostAttribute('meta') || {}
                  : {};
              }, [])
            : {};
          const { editPost } = useDispatch ? useDispatch('core/editor') : { editPost: null };
          const values = (meta && meta[def.metaKey]) || def.values || {};

          const open = () => {
            openFieldsModal({
              title: def.title || pageI18n.panelTitle || 'Page Settings',
              fields: def.fields || [],
              values,
              onSave: (next) => {
                if (!editPost) return;
                editPost({
                  meta: {
                    ...meta,
                    [def.metaKey]: next,
                  },
                });
              },
            });
          };

          return el(
            PluginDocumentSettingPanel,
            {
              name: 'bl-blocks-page-' + def.id,
              title: def.title || pageI18n.panelTitle || 'Page Settings',
              className: 'bl-blocks-page-panel',
            },
            def.description ? el('p', { className: 'description' }, def.description) : null,
            el(
              Button,
              { variant: 'secondary', onClick: open },
              pageI18n.openFields || pageI18n.edit || 'Edit fields'
            )
          );
        },
      });
    });
  }
})(window.wp);
