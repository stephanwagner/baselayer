/**
 * Block editor: dynamic Blocks + Content fields document panels.
 */
import { createFieldForm, openFieldsModal } from './admin/field-form.js';

(function (wp) {
  if (!wp || !wp.element || !wp.components || !wp.blocks) {
    return;
  }

  const { createElement: el, Fragment, RawHTML, useState, useEffect, useRef } = wp.element;
  const { Button, PanelBody, ToolbarGroup, ToolbarButton, Placeholder, Spinner } = wp.components;
  const { InspectorControls, BlockControls, useBlockProps } = wp.blockEditor || {};
  const { registerBlockType } = wp.blocks;
  const { registerPlugin } = wp.plugins || {};
  const { PluginDocumentSettingPanel } = wp.editPost || wp.editor || {};
  const { useSelect, useDispatch } = wp.data || {};
  const apiFetch = wp.apiFetch;
  const debounce = (wp.compose && wp.compose.debounce) || null;

  const blockConfig = window.blBlocksEditor || {};
  const pageConfig = window.blBlocksPage || {};
  const blockI18n = blockConfig.i18n || {};
  const pageI18n = pageConfig.i18n || {};
  const renderPath = blockConfig.renderPath || 'baselayer-blocks/v1/render';

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

  function normalizeValues(raw) {
    return raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
  }

  function PreviewLoading() {
    return el('div', { className: 'bl-blocks-block-preview-loading' }, el(Spinner, null));
  }

  /**
   * Imperative compact field form for the block inspector.
   * Mounts once per mountId; remount only when the modal applies new values.
   */
  function SidebarFields({ fields, values, onChange, onOpenModal, mountId }) {
    const hostRef = useRef(null);
    const onChangeRef = useRef(onChange);
    const valuesRef = useRef(values);
    onChangeRef.current = onChange;
    valuesRef.current = values;

    useEffect(() => {
      const host = hostRef.current;
      if (!host) {
        return undefined;
      }

      const form = createFieldForm(fields || [], valuesRef.current || {}, { layout: 'compact' });
      host.replaceChildren(form.root);

      const sync = () => {
        if (typeof onChangeRef.current === 'function') {
          onChangeRef.current(normalizeValues(form.getValues()));
        }
      };

      const onRepeaterClick = (evt) => {
        const target = evt.target;
        if (
          target &&
          typeof target.closest === 'function' &&
          target.closest('.bl-blocks-fields__repeater-add, .bl-blocks-fields__repeater-remove')
        ) {
          window.setTimeout(sync, 0);
        }
      };

      form.root.addEventListener('input', sync);
      form.root.addEventListener('change', sync);
      form.root.addEventListener('click', onRepeaterClick);

      return () => {
        form.root.removeEventListener('input', sync);
        form.root.removeEventListener('change', sync);
        form.root.removeEventListener('click', onRepeaterClick);
        host.replaceChildren();
      };
    }, [fields, mountId]);

    return el(
      'div',
      { className: 'bl-blocks-sidebar-fields' },
      typeof onOpenModal === 'function'
        ? el(
            Button,
            {
              variant: 'secondary',
              className: 'bl-blocks-edit-fields-button',
              onClick: onOpenModal,
            },
            blockI18n.openFieldEditor || 'Open field editor'
          )
        : null,
      el('div', { className: 'bl-blocks-sidebar-fields__host', ref: hostRef })
    );
  }

  /**
   * Preview via package REST (name + values only). Avoids core /block-renderer
   * attribute schema validation against theme-injected attrs (hideBlock, style, …).
   */
  function BlockServerPreview({ name, values }) {
    const [response, setResponse] = useState({ status: 'idle' });
    const shouldDebounceRef = useRef(false);
    const valuesKey = JSON.stringify(values || {});

    useEffect(() => {
      if (!apiFetch || !name) {
        return undefined;
      }

      const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
      let cancelled = false;

      const run = () => {
        setResponse({ status: 'loading' });
        apiFetch({
          path: renderPath,
          method: 'POST',
          data: { name, values: values || {} },
          signal: controller ? controller.signal : undefined,
        })
          .then((res) => {
            if (cancelled) return;
            setResponse({
              status: 'success',
              content: res && typeof res.rendered === 'string' ? res.rendered : '',
            });
          })
          .catch((error) => {
            if (cancelled || (error && error.name === 'AbortError')) {
              return;
            }
            setResponse({
              status: 'error',
              error: (error && error.message) || String(error),
            });
          })
          .finally(() => {
            shouldDebounceRef.current = true;
          });
      };

      let cancelDebounce = () => {};
      if (debounce && shouldDebounceRef.current) {
        const debounced = debounce(run, 500);
        debounced();
        cancelDebounce = () => debounced.cancel();
      } else if (shouldDebounceRef.current) {
        const t = window.setTimeout(run, 500);
        cancelDebounce = () => window.clearTimeout(t);
      } else {
        run();
      }

      return () => {
        cancelled = true;
        if (controller) {
          controller.abort();
        }
        cancelDebounce();
      };
    }, [name, valuesKey]);

    if (response.status === 'loading' || response.status === 'idle') {
      return el(PreviewLoading, null);
    }

    if (response.status === 'error') {
      const template = blockI18n.previewError || 'Error loading preview: %s';
      const message = template.replace('%s', response.error || '');
      return el(Placeholder, { className: 'bl-blocks-block-preview-error', label: message });
    }

    if (!response.content) {
      return el(Placeholder, {
        className: 'bl-blocks-block-preview-empty',
        label: blockI18n.previewEmpty || 'Block rendered as empty.',
      });
    }

    return el(RawHTML, null, response.content);
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
        const values = normalizeValues(attributes.values);
        const [sidebarMountId, setSidebarMountId] = useState(0);
        const sidebarEditing = !!def.sidebarEditing;

        const applyValues = (next) => {
          setAttributes({ values: normalizeValues(next) });
        };

        const open = () =>
          openBlockModal(
            def.fields || [],
            values,
            (next) => {
              applyValues(next);
              if (sidebarEditing) {
                setSidebarMountId((id) => id + 1);
              }
            },
            def.title
          );

        const blockProps = useBlockProps
          ? useBlockProps({ className: 'bl-blocks-block-editor' })
          : { className: 'bl-blocks-block-editor' };

        const preview = apiFetch
          ? el(BlockServerPreview, { name: def.name, values })
          : el(
              'div',
              { className: 'bl-blocks-block-editor__fallback' },
              el('strong', null, def.title || def.slug),
              el('p', null, blockI18n.preview || 'Edit fields to configure this block.')
            );

        const inspectorBody = sidebarEditing
          ? el(SidebarFields, {
              fields: def.fields || [],
              values,
              mountId: sidebarMountId,
              onChange: applyValues,
              onOpenModal: open,
            })
          : el(
              Button,
              {
                variant: 'secondary',
                className: 'bl-blocks-edit-fields-button',
                onClick: open,
              },
              blockI18n.edit || 'Edit fields'
            );

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
                  inspectorBody
                )
              )
            : null,
          el('div', blockProps, preview)
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
              title: def.title || pageI18n.panelTitle || 'Content fields',
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
              title: def.title || pageI18n.panelTitle || 'Content fields',
              className: 'bl-blocks-page-settings-panel',
            },
            def.description
              ? el('p', { className: 'description' }, def.description)
              : null,
            el(
              Button,
              {
                variant: 'secondary',
                className: 'bl-blocks-edit-fields-button',
                onClick: open,
              },
              pageI18n.edit || blockI18n.edit || 'Edit fields'
            )
          );
        },
      });
    });
  }
})(window.wp);
