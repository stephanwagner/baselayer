/**
 * Block editor: dynamic Blocks + Content Fields document panels.
 */
import {
  createFieldForm,
  openFieldsModal,
  loadUiStateFromStorage,
  saveUiStateToStorage,
  pageRepeaterUiStorageKey,
} from './admin/field-form.js';

(function (wp) {
  if (!wp || !wp.element || !wp.components || !wp.blocks) {
    return;
  }

  const { createElement: el, Fragment, RawHTML, useState, useEffect, useRef, useCallback } = wp.element;
  const { Button, PanelBody, ToolbarGroup, ToolbarButton, Placeholder, Spinner } = wp.components;
  const { InspectorControls, BlockControls, useBlockProps, InnerBlocks } = wp.blockEditor || {};
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

  function normalizeValues(raw) {
    return raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
  }

  function normalizeUi(raw) {
    const base = normalizeValues(raw);
    const repeaters =
      base.repeaters && typeof base.repeaters === 'object' && !Array.isArray(base.repeaters)
        ? base.repeaters
        : {};
    return { ...base, repeaters };
  }

  function openBlockModal(fields, values, onSave, title, uiState, onUiStateChange) {
    openFieldsModal({
      title: title || blockI18n.edit || 'Edit fields',
      fields,
      values: values || {},
      uiState: normalizeUi(uiState),
      onUiStateChange,
      onSave,
    });
  }

  function PreviewLoading() {
    return el('div', { className: 'bl-blocks-block-preview-loading' }, el(Spinner, null));
  }

  /**
   * Imperative compact field form for inspector / document sidebar.
   * Callback ref mounts when the host attaches (Slot/Fill-safe); remount on mountId.
   */
  function SidebarFields({ fields, values, onChange, onOpenModal, mountId, uiState, onUiStateChange }) {
    const onChangeRef = useRef(onChange);
    const onUiStateChangeRef = useRef(onUiStateChange);
    const valuesRef = useRef(values);
    const uiStateRef = useRef(uiState);
    const fieldsRef = useRef(fields);
    const cleanupRef = useRef(null);
    onChangeRef.current = onChange;
    onUiStateChangeRef.current = onUiStateChange;
    valuesRef.current = values;
    uiStateRef.current = uiState;
    fieldsRef.current = Array.isArray(fields) ? fields : [];

    // Only remount when mountId changes (modal apply). Read fields/values from refs
    // so parent re-renders (meta edits) do not thrash the Slot/Fill host.
    const setHost = useCallback(
      (host) => {
        if (typeof cleanupRef.current === 'function') {
          cleanupRef.current();
          cleanupRef.current = null;
        }
        if (!host) {
          return;
        }

        const list = Array.isArray(fieldsRef.current) ? fieldsRef.current : [];
        const form = createFieldForm(list, valuesRef.current || {}, {
          layout: 'compact',
          uiState: normalizeUi(uiStateRef.current),
          onUiStateChange: (next) => {
            if (typeof onUiStateChangeRef.current === 'function') {
              onUiStateChangeRef.current(normalizeUi(next));
            }
          },
        });
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

        cleanupRef.current = () => {
          form.root.removeEventListener('input', sync);
          form.root.removeEventListener('change', sync);
          form.root.removeEventListener('click', onRepeaterClick);
          host.replaceChildren();
        };
      },
      [mountId]
    );

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
            blockI18n.openFieldEditor || pageI18n.openFieldEditor || 'Open field editor'
          )
        : null,
      el('div', { className: 'bl-blocks-sidebar-fields__host', ref: setHost })
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

  function innerBlocksProps(def) {
    const props = {
      renderAppender: InnerBlocks.ButtonBlockAppender,
    };
    const allowed = Array.isArray(def && def.innerBlocksAllowed)
      ? def.innerBlocksAllowed.filter((name) => typeof name === 'string' && name)
      : [];
    if (allowed.length) {
      props.allowedBlocks = allowed;
    }
    const template = def && def.innerBlocksTemplate;
    if (Array.isArray(template) && template.length) {
      props.template = template;
    }
    return props;
  }

  function AccordionInnerEdit({ values, blockProps, def, isSelected, clientId }) {
    const title = typeof values.title === 'string' ? values.title : '';
    const isOpenByDefault = !!values.accordion_is_open;
    const hasChildSelected = useSelect
      ? useSelect(
          (select) => {
            if (!clientId) {
              return false;
            }
            const blockEditor = select('core/block-editor');
            return !!(
              blockEditor &&
              typeof blockEditor.hasSelectedInnerBlock === 'function' &&
              blockEditor.hasSelectedInnerBlock(clientId, true)
            );
          },
          [clientId]
        )
      : false;
    // Match ACF: show content while this accordion or a nested block is focused.
    const editorOpen = isOpenByDefault || !!isSelected || !!hasChildSelected;
    const className = [
      'bl-wp-block',
      'accordion__wrapper',
      editorOpen ? 'accordion-open' : '',
      blockProps.className || '',
    ]
      .filter(Boolean)
      .join(' ');

    return el(
      'div',
      {
        ...blockProps,
        className,
        'data-accordion-is-open': editorOpen ? 'true' : 'false',
      },
      el(
        'div',
        { className: 'accordion__container' },
        el(
          'div',
          {
            className: 'accordion__header noselect',
            role: 'button',
            tabIndex: 0,
            'aria-expanded': editorOpen ? 'true' : 'false',
          },
          el('div', { className: 'accordion__title' }, title || blockI18n.innerBlocksTitle || 'Title'),
          el(
            'div',
            { className: 'accordion__icon', 'aria-hidden': 'true' },
            el(
              'svg',
              {
                xmlns: 'http://www.w3.org/2000/svg',
                height: '24px',
                viewBox: '0 -960 960 960',
                width: '24px',
                fill: 'currentColor',
              },
              el('path', {
                d: 'M466.54-375.23q-6.23-2.31-11.85-7.92L274.92-562.92q-8.3-8.31-8.5-20.89-.19-12.57 8.5-21.27 8.7-8.69 21.08-8.69 12.38 0 21.08 8.69L480-442.15l162.92-162.93q8.31-8.3 20.89-8.5 12.57-.19 21.27 8.5 8.69 8.7 8.69 21.08 0 12.38-8.69 21.08L505.31-383.15q-5.62 5.61-11.85 7.92-6.23 2.31-13.46 2.31t-13.46-2.31Z',
              })
            )
          )
        ),
        el(
          'div',
          { className: 'accordion__content' },
          el(
            'div',
            { className: 'accordion__content-inner' },
            InnerBlocks ? el(InnerBlocks, innerBlocksProps(def)) : null
          )
        )
      )
    );
  }

  function openThemeIconPicker(current, onSelect, returnFocus) {
    import('../../../../src/js/editor/icons/icon-picker-service.js')
      .then(({ openIconPicker }) => {
        openIconPicker({
          currentValue: current || '',
          onSelect,
          returnFocus: returnFocus || null,
        });
      })
      .catch(() => {});
  }

  function IconPickerButton({ value, onChange, isSelected }) {
    const slug = typeof value === 'string' ? value : '';
    if (!slug) {
      return el(
        'button',
        {
          type: 'button',
          className: 'bl-inline-icon-control__placeholder',
          onClick: (evt) => openThemeIconPicker('', onChange, evt.currentTarget),
        },
        el('span', { className: 'bl-inline-icon-control__placeholder-label' }, blockI18n.chooseIcon || 'Choose icon')
      );
    }
    return el(
      'div',
      { className: 'bl-inline-icon-control__selected' },
      el('span', { className: 'bl-icon -icon-' + slug, 'aria-hidden': 'true' }),
      isSelected
        ? el(
            'button',
            {
              type: 'button',
              className: 'bl-inline-icon-control__action',
              onClick: (evt) => openThemeIconPicker(slug, onChange, evt.currentTarget),
            },
            el('span', { className: 'bl-icon -icon-edit', 'aria-hidden': 'true' })
          )
        : null
    );
  }

  function IconInnerEdit({ values, blockProps, isSelected, onChangeValues }) {
    const iconSlug = typeof values.icon === 'string' ? values.icon : '';
    return el(
      'div',
      {
        ...blockProps,
        className: [blockProps.className || '', 'bl-wp-block', 'icon__wrapper'].filter(Boolean).join(' '),
      },
      el(
        'div',
        { className: 'icon__container' },
        el(
          'div',
          { className: 'icon__icon' + (iconSlug ? ' -has-icon' : '') },
          el('div', { className: 'bl-inline-icon-control' + (isSelected ? ' is-active' : '') },
            el(IconPickerButton, {
              value: iconSlug,
              isSelected,
              onChange: (next) => onChangeValues({ ...values, icon: next || '' }),
            })
          )
        )
      )
    );
  }

  function IconTextInnerEdit({ values, blockProps, def, isSelected, onChangeValues }) {
    const iconSlug = typeof values.icon === 'string' ? values.icon : '';
    return el(
      'div',
      {
        ...blockProps,
        className: [blockProps.className || '', 'bl-wp-block', 'icon-text__wrapper'].filter(Boolean).join(' '),
      },
      el(
        'div',
        { className: 'icon-text__container' },
        el(
          'div',
          { className: 'icon-text__content' },
          el(
            'div',
            { className: 'icon-text__icon icon__icon' + (iconSlug ? ' -has-icon' : '') },
            el('div', { className: 'bl-inline-icon-control' + (isSelected ? ' is-active' : '') },
              el(IconPickerButton, {
                value: iconSlug,
                isSelected,
                onChange: (next) => onChangeValues({ ...values, icon: next || '' }),
              })
            )
          ),
          el(
            'div',
            { className: 'icon-text__text-container' },
            el(
              'div',
              { className: 'icon-text__text' },
              InnerBlocks ? el(InnerBlocks, innerBlocksProps(def)) : null
            )
          )
        )
      )
    );
  }

  function SliderInnerEdit({ values, blockProps, def }) {
    const perView = values.slides_per_view || 1;
    const hasContent = !!values.has_content;
    return el(
      'div',
      {
        ...blockProps,
        className: [blockProps.className || '', 'bl-wp-block', 'slider__wrapper'].filter(Boolean).join(' '),
        'data-slider-slides-per-view': String(perView),
        'data-slider-has-content': hasContent ? 'true' : 'false',
        style: {
          ...(blockProps.style || {}),
          '--slider-editor-slide-gap': (values.space_between != null ? values.space_between : 16) + 'px',
        },
      },
      el(
        'div',
        { className: 'slider__container' },
        el(
          'div',
          { className: 'slider__slides' },
          el(
            'div',
            { className: 'swiper' },
            InnerBlocks ? el(InnerBlocks, innerBlocksProps(def)) : null
          )
        )
      )
    );
  }

  function SliderSlideInnerEdit({ blockProps, def }) {
    return el(
      'div',
      {
        ...blockProps,
        className: [blockProps.className || '', 'bl-wp-block', 'slider-slide__wrapper', 'swiper-slide'].filter(Boolean).join(' '),
      },
      el(
        'div',
        { className: 'slider-slide__container' },
        el(
          'div',
          { className: 'slider-slide__content' },
          InnerBlocks ? el(InnerBlocks, innerBlocksProps(def)) : null
        )
      )
    );
  }

  function ClientBlockShell({ values, blockProps, slug, def, isSelected, clientId, onChangeValues }) {
    if (slug === 'accordion') {
      return el(AccordionInnerEdit, { values, blockProps, def, isSelected, clientId });
    }
    if (slug === 'icon') {
      return el(IconInnerEdit, { values, blockProps, isSelected, onChangeValues });
    }
    if (slug === 'icon-text') {
      return el(IconTextInnerEdit, { values, blockProps, def, isSelected, onChangeValues });
    }
    if (slug === 'slider') {
      return el(SliderInnerEdit, { values, blockProps, def });
    }
    if (slug === 'slider-slide') {
      return el(SliderSlideInnerEdit, { blockProps, def });
    }

    return el(
      'div',
      { ...blockProps, className: (blockProps.className || '') + ' bl-blocks-block-editor bl-blocks-block-editor--inner' },
      el('div', { className: 'bl-blocks-block-editor__inner-fields' },
        el('strong', null, values.title || '')
      ),
      InnerBlocks ? el(InnerBlocks, innerBlocksProps(def)) : null
    );
  }

  (blockConfig.blocks || []).forEach((def) => {
    if (!def || !def.name) return;

    const supportsInnerBlocks = !!def.supportsInnerBlocks;
    const usesClientShell = supportsInnerBlocks || def.slug === 'icon';

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
        ui: {
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
        const { attributes, setAttributes, isSelected, clientId } = props;
        const values = normalizeValues(attributes.values);
        const ui = normalizeUi(attributes.ui);
        const [sidebarMountId, setSidebarMountId] = useState(0);
        const sidebarEditing = !!def.sidebarEditing;

        const applyValues = (next) => {
          setAttributes({ values: normalizeValues(next) });
        };

        const applyUi = (next) => {
          setAttributes({ ui: normalizeUi(next) });
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
            def.title,
            ui,
            applyUi
          );

        const blockProps = useBlockProps
          ? useBlockProps({ className: 'bl-blocks-block-editor' })
          : { className: 'bl-blocks-block-editor' };

        const preview = usesClientShell
          ? el(ClientBlockShell, {
              values,
              blockProps,
              slug: def.slug || '',
              def,
              isSelected,
              clientId,
              onChangeValues: applyValues,
            })
          : apiFetch
            ? el('div', blockProps, el(BlockServerPreview, { name: def.name, values }))
            : el(
                'div',
                blockProps,
                el(
                  'div',
                  { className: 'bl-blocks-block-editor__fallback' },
                  el('strong', null, def.title || def.slug),
                  el('p', null, blockI18n.preview || 'Edit fields to configure this block.')
                )
              );

        const inspectorBody = sidebarEditing
          ? el(SidebarFields, {
              fields: def.fields || [],
              values,
              uiState: ui,
              mountId: sidebarMountId,
              onChange: applyValues,
              onUiStateChange: applyUi,
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
          preview
        );
      },
      save: function save() {
        if (supportsInnerBlocks && InnerBlocks && InnerBlocks.Content) {
          return el(InnerBlocks.Content);
        }
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
          const postId = useSelect
            ? useSelect((select) => {
                const editor = select('core/editor');
                return editor && editor.getCurrentPostId ? editor.getCurrentPostId() : 0;
              }, [])
            : pageConfig.postId || 0;
          const { editPost } = useDispatch ? useDispatch('core/editor') : { editPost: null };
          const values = normalizeValues((meta && meta[def.metaKey]) || def.values || {});
          const storageKey = pageRepeaterUiStorageKey(postId || pageConfig.postId || 0, def.metaKey || def.id);
          const [uiState, setUiState] = useState(() => loadUiStateFromStorage(storageKey));
          const [sidebarMountId, setSidebarMountId] = useState(0);
          const sidebarEditing = !!def.sidebarEditing;

          const applyValues = (next) => {
            if (!editPost) return;
            editPost({
              meta: {
                ...meta,
                [def.metaKey]: normalizeValues(next),
              },
            });
          };

          const applyUi = (next) => {
            const normalized = normalizeUi(next);
            setUiState(normalized);
            saveUiStateToStorage(storageKey, normalized);
          };

          const open = () => {
            openFieldsModal({
              title: def.title || pageI18n.panelTitle || 'Content Fields',
              fields: def.fields || [],
              values,
              uiState,
              onUiStateChange: applyUi,
              onSave: (next) => {
                applyValues(next);
                if (sidebarEditing) {
                  setSidebarMountId((id) => id + 1);
                }
              },
            });
          };

          const panelBody = sidebarEditing
            ? el(SidebarFields, {
                fields: def.fields || [],
                values,
                uiState,
                mountId: sidebarMountId,
                onChange: applyValues,
                onUiStateChange: applyUi,
                onOpenModal: open,
              })
            : el(
                Button,
                {
                  variant: 'secondary',
                  className: 'bl-blocks-edit-fields-button',
                  onClick: open,
                },
                pageI18n.edit || blockI18n.edit || 'Edit fields'
              );

          return el(
            PluginDocumentSettingPanel,
            {
              name: 'bl-blocks-page-' + def.id,
              title: def.title || pageI18n.panelTitle || 'Content Fields',
              className: 'bl-blocks-page-settings-panel',
            },
            def.description
              ? el('p', { className: 'description' }, def.description)
              : null,
            panelBody
          );
        },
      });
    });
  }
})(window.wp);
