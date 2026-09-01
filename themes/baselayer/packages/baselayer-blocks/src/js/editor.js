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
import { parseJsxPreview } from './admin/parse-jsx-preview.js';
import { InlineIconControl } from '../../../../src/js/editor/icons/inline-icon-control.js';

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

  function isLayoutFieldType(type) {
    return ['column', 'section', 'tab', 'group'].includes(type);
  }

  function isStaticFieldType(type) {
    return [
      'divider',
      'spacer',
      'row_break',
      'heading',
      'text_block',
      'html',
      'captcha',
      'honeypot',
    ].includes(type);
  }

  /** Seedable default for one field; undefined when the key should stay absent. */
  function defaultValueForField(field) {
    if (!field || typeof field !== 'object') {
      return undefined;
    }
    const type = field.type || 'text';
    if (isLayoutFieldType(type) || isStaticFieldType(type)) {
      return undefined;
    }
    if (['page', 'link', 'image', 'file', 'repeater'].includes(type)) {
      return undefined;
    }
    if (field.active === false) {
      return undefined;
    }

    if (type === 'toggle' || type === 'terms') {
      const dv = field.default_value;
      if (dv === '' || dv == null || dv === false || dv === 0 || dv === '0') {
        return undefined;
      }
      return '1';
    }

    if (type === 'range') {
      const mode = field.mode === 'single' ? 'single' : 'range';
      const min =
        field.min != null && field.min !== '' ? String(field.min) : '';
      const max =
        field.max != null && field.max !== '' ? String(field.max) : '';
      if (mode === 'single') {
        const dv = field.default_value;
        let value = '';
        if (dv != null && typeof dv === 'object' && !Array.isArray(dv)) {
          value = dv.from != null && dv.from !== '' ? String(dv.from) : '';
        } else if (dv != null && String(dv).trim() !== '') {
          value = String(dv).trim();
        }
        if (value === '') {
          value = min;
        }
        return value !== '' ? value : undefined;
      }
      const dv = field.default_value;
      let from = '';
      let to = '';
      if (dv && typeof dv === 'object' && !Array.isArray(dv)) {
        from = dv.from != null && dv.from !== '' ? String(dv.from) : '';
        to = dv.to != null && dv.to !== '' ? String(dv.to) : '';
      }
      if (from === '') from = min;
      if (to === '') to = max;
      if (from === '' && to === '') {
        return undefined;
      }
      return { from, to };
    }

    const multi =
      type === 'checkboxes' ||
      (type === 'button_group' && !!field.multiple) ||
      (type === 'select' && !!field.multiple);

    const dv = field.default_value;
    if (dv == null || dv === '') {
      return undefined;
    }

    if (multi) {
      if (Array.isArray(dv)) {
        const list = dv
          .filter((item) => item != null && String(item) !== '')
          .map((item) => String(item));
        return list.length ? list : undefined;
      }
      return [String(dv)];
    }

    return String(dv);
  }

  function buildDefaultValues(fields) {
    const out = {};
    if (!Array.isArray(fields)) {
      return out;
    }
    fields.forEach((field) => {
      if (!field || typeof field !== 'object') {
        return;
      }
      const type = field.type || '';
      if (isLayoutFieldType(type)) {
        Object.assign(out, buildDefaultValues(field.children || []));
        return;
      }
      if (isStaticFieldType(type) || type === 'repeater') {
        return;
      }
      if (field.active === false) {
        return;
      }
      const name = field.name || '';
      if (!name) {
        return;
      }
      const seeded = defaultValueForField(field);
      if (seeded !== undefined) {
        out[name] = seeded;
      }
    });
    return out;
  }

  function normalizeValues(raw, fields) {
    const base =
      raw && typeof raw === 'object' && !Array.isArray(raw) ? { ...raw } : {};
    if (!fields) {
      return base;
    }
    const defaults = buildDefaultValues(fields);
    Object.keys(defaults).forEach((key) => {
      if (!Object.prototype.hasOwnProperty.call(base, key)) {
        base[key] = defaults[key];
      }
    });
    return base;
  }

  function hasEditableFields(fields) {
    return Array.isArray(fields) && fields.length > 0;
  }

  function NoEditableFieldsNotice() {
    return el(
      'p',
      { className: 'description bl-blocks-no-editable-fields' },
      blockI18n.noEditableFields ||
        pageI18n.noEditableFields ||
        'This block has no editable fields. Add fields to the block definition to configure it here.'
    );
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
            onChangeRef.current(normalizeValues(form.getValues(), fieldsRef.current));
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
        // Persist UI-shown field defaults without requiring a control change.
        sync();

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

  function defaultInnerBlocksProps(def) {
    const props = {};
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
    // Slider parent: ButtonBlockAppender so editor SCSS can style the black “Slide” pill.
    // Accordion / slide content keep Gutenberg’s default small inserter (like ACF).
    if (def && def.slug === 'slider' && InnerBlocks && InnerBlocks.ButtonBlockAppender) {
      props.renderAppender = InnerBlocks.ButtonBlockAppender;
    }
    return props;
  }

  /**
   * PHP template preview (source of truth). InnerBlocks tags become live holes;
   * icon hosts can be hydrated with InlineIconControl.
   */
  function BlockPhpPreview({
    name,
    values,
    def,
    slug,
    isSelected,
    clientId,
    blockAlign,
    blockClassName,
    onChangeValues,
  }) {
    const [response, setResponse] = useState({ status: 'idle' });
    const shouldDebounceRef = useRef(false);
    const valuesKey = JSON.stringify(values || {});
    const supportsInner = !!(def && def.supportsInnerBlocks);
    const needsJsx = supportsInner || slug === 'icon' || slug === 'icon-text';

    const hasChildSelected = useSelect
      ? useSelect(
          (select) => {
            if (!clientId || !supportsInner) {
              return false;
            }
            const blockEditor = select('core/block-editor');
            return !!(
              blockEditor &&
              typeof blockEditor.hasSelectedInnerBlock === 'function' &&
              blockEditor.hasSelectedInnerBlock(clientId, true)
            );
          },
          [clientId, supportsInner]
        )
      : false;

    const accordionEditorOpen =
      slug === 'accordion' && (!!isSelected || !!hasChildSelected || !!values.accordion_is_open);

    const sliderEditorExpanded =
      slug === 'slider' && (!!isSelected || !!hasChildSelected);

    useEffect(() => {
      if (!apiFetch || !name) {
        return undefined;
      }

      const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
      let cancelled = false;

      const run = () => {
        // Keep the last successful preview mounted while refetching after edits.
        setResponse((prev) => {
          if (prev.status === 'success' && typeof prev.content === 'string') {
            return { ...prev, refreshing: true };
          }
          return { status: 'loading' };
        });
        apiFetch({
          path: renderPath,
          method: 'POST',
          data: {
            name,
            values: values || {},
            className: typeof blockClassName === 'string' ? blockClassName : '',
          },
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
            setResponse((prev) => {
              if (prev.status === 'success' && typeof prev.content === 'string') {
                return { ...prev, refreshing: false };
              }
              return {
                status: 'error',
                error: (error && error.message) || String(error),
              };
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

    if (
      (response.status === 'loading' || response.status === 'idle') &&
      typeof response.content !== 'string'
    ) {
      return el(PreviewLoading, null);
    }

    if (response.status === 'error') {
      const template = blockI18n.previewError || 'Error loading preview: %s';
      const message = template.replace('%s', response.error || '');
      return el(Placeholder, { className: 'bl-blocks-block-preview-error', label: message });
    }

    if (!response.content) {
      return el(
        'div',
        { className: 'bl-blocks-block-preview-empty' },
        blockI18n.previewEmpty || 'Block has no content.'
      );
    }

    if (!needsJsx) {
      return el(RawHTML, null, response.content);
    }

    const iconSlug = typeof values.icon === 'string' ? values.icon : '';
    const iconControl =
      (slug === 'icon' || slug === 'icon-text') && typeof onChangeValues === 'function'
        ? {
            type: InlineIconControl,
            value: iconSlug,
            props: {
              value: iconSlug,
              isActive: !!isSelected,
              onChange: (next) => onChangeValues({ ...values, icon: next || '' }),
            },
          }
        : null;

    let tree = null;
    try {
      tree = parseJsxPreview(response.content, {
        createElement: el,
        Fragment,
        InnerBlocks: supportsInner ? InnerBlocks : null,
        defaultInnerBlocksProps: defaultInnerBlocksProps(def),
        iconControl,
        accordionEditorOpen: slug === 'accordion' ? accordionEditorOpen : false,
        sliderEditorExpanded: slug === 'slider' ? sliderEditorExpanded : false,
        blockAlign: typeof blockAlign === 'string' ? blockAlign : '',
        blockClassName: typeof blockClassName === 'string' ? blockClassName : '',
      });
    } catch (err) {
      if (typeof console !== 'undefined' && console.warn) {
        console.warn('Baselayer Blocks: failed to parse PHP preview as JSX', err);
      }
      tree = null;
    }

    if (tree == null) {
      return el(RawHTML, null, response.content);
    }

    return tree;
  }

  (blockConfig.blocks || []).forEach((def) => {
    if (!def || !def.name) return;

    const supportsInnerBlocks = !!def.supportsInnerBlocks;

    registerBlockType(def.name, {
      apiVersion: 3,
      title: def.title || def.slug,
      description: def.description || '',
      category: def.category || 'design',
      icon: blockIcon(def.icon),
      keywords: def.keywords || [],
      attributes: {
        values: {
          type: 'object',
          default: buildDefaultValues(def.fields || []),
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
        ...(Array.isArray(def.align) && def.align.length ? { align: def.align } : {}),
      },
      edit: function Edit(props) {
        const { attributes, setAttributes, isSelected, clientId } = props;
        const fieldList = def.fields || [];
        const values = normalizeValues(attributes.values, fieldList);
        const ui = normalizeUi(attributes.ui);
        const blockAlign =
          typeof attributes.align === 'string' ? attributes.align : '';
        const blockClassName =
          typeof attributes.className === 'string' ? attributes.className : '';
        const [sidebarMountId, setSidebarMountId] = useState(0);
        const sidebarEditing = !!def.sidebarEditing;
        const editableFields = hasEditableFields(fieldList);

        const applyValues = (next) => {
          setAttributes({ values: normalizeValues(next, fieldList) });
        };

        const applyUi = (next) => {
          setAttributes({ ui: normalizeUi(next) });
        };

        // Materialize missing field defaults into attributes on insert / first edit.
        useEffect(() => {
          const raw =
            attributes.values &&
            typeof attributes.values === 'object' &&
            !Array.isArray(attributes.values)
              ? attributes.values
              : {};
          const defaults = buildDefaultValues(fieldList);
          const needsSeed = Object.keys(defaults).some(
            (key) => !Object.prototype.hasOwnProperty.call(raw, key)
          );
          if (needsSeed) {
            setAttributes({ values: normalizeValues(raw, fieldList) });
          }
        }, [clientId]);

        const open = () =>
          openBlockModal(
            fieldList,
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

        const slug = def.slug || '';
        const isIconShell = slug === 'icon' || slug === 'icon-text';
        const applyCanvasValues = (next) => {
          applyValues(next);
          if (isIconShell && sidebarEditing) {
            setSidebarMountId((id) => id + 1);
          }
        };

        const preview = apiFetch
          ? el(
              'div',
              blockProps,
              el(BlockPhpPreview, {
                name: def.name,
                values,
                def,
                slug,
                isSelected,
                clientId,
                blockAlign,
                blockClassName,
                onChangeValues: isIconShell ? applyCanvasValues : null,
              })
            )
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

        const inspectorBody = !editableFields
          ? el(NoEditableFieldsNotice)
          : sidebarEditing
            ? el(SidebarFields, {
                fields: fieldList,
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
          editableFields && BlockControls
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
          const fieldList = def.fields || [];
          const values = normalizeValues((meta && meta[def.metaKey]) || def.values || {}, fieldList);
          const storageKey = pageRepeaterUiStorageKey(postId || pageConfig.postId || 0, def.metaKey || def.id);
          const [uiState, setUiState] = useState(() => loadUiStateFromStorage(storageKey));
          const [sidebarMountId, setSidebarMountId] = useState(0);
          const sidebarEditing = !!def.sidebarEditing;
          const editableFields = hasEditableFields(fieldList);

          const applyValues = (next) => {
            if (!editPost) return;
            editPost({
              meta: {
                ...meta,
                [def.metaKey]: normalizeValues(next, fieldList),
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
              fields: fieldList,
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

          const panelBody = !editableFields
            ? el(NoEditableFieldsNotice)
            : sidebarEditing
              ? el(SidebarFields, {
                  fields: fieldList,
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
              ? el('p', { className: 'description bl-blocks-fields__description' }, def.description)
              : null,
            panelBody
          );
        },
      });
    });
  }
})(window.wp);
