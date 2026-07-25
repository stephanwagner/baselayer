(function () {
  'use strict';

  const wp = typeof window !== 'undefined' ? window.wp : null;
  if (!wp || typeof baselayerEvents === 'undefined') {
    return;
  }

  const EVENT_TYPES =
    baselayerEvents.postTypes && Array.isArray(baselayerEvents.postTypes)
      ? baselayerEvents.postTypes
      : baselayerEvents.postType
        ? [baselayerEvents.postType]
        : [];
  if (!EVENT_TYPES.length) {
    return;
  }

  const el = wp.element.createElement;
  const { useState } = wp.element;
  const { useSelect } = wp.data;
  const { useEntityProp } = wp.coreData;
  const { registerPlugin } = wp.plugins;
  const { PluginDocumentSettingPanel } = wp.editor;
  const { Button, Modal, TextControl, TextareaControl } = wp.components;

  const L = baselayerEvents;
  const META_KEY = '_bl_event_metadata';

  function metaConfigForType(postType) {
    if (L.metaByType && L.metaByType[postType]) {
      return L.metaByType[postType];
    }
    return L.meta || { title: '', groups: {} };
  }

  function parseMetadata(raw) {
    if (!raw || typeof raw !== 'string') {
      return {};
    }
    try {
      const data = JSON.parse(raw);
      return data && typeof data === 'object' ? data : {};
    } catch (e) {
      return {};
    }
  }

  function encodeMetadata(data) {
    const clean = {};
    Object.keys(data || {}).forEach(function (groupId) {
      const row = data[groupId];
      if (!row || typeof row !== 'object') {
        return;
      }
      const out = {};
      Object.keys(row).forEach(function (fieldId) {
        const v = row[fieldId];
        if (v != null && String(v).trim() !== '') {
          out[fieldId] = String(v).trim();
        }
      });
      if (Object.keys(out).length) {
        clean[groupId] = out;
      }
    });
    return Object.keys(clean).length ? JSON.stringify(clean) : '';
  }

  function MetadataModal(props) {
    const { config, initialData, onSave, onRequestClose } = props;
    const [draft, setDraft] = useState(function () {
      return JSON.parse(JSON.stringify(initialData || {}));
    });

    function setField(groupId, fieldId, value) {
      const next = Object.assign({}, draft);
      const row = Object.assign({}, next[groupId] || {});
      row[fieldId] = value;
      next[groupId] = row;
      setDraft(next);
    }

    const groups = config.groups || {};

    return el(
      Modal,
      {
        title: config.title || L.metadataModalTitle || 'Event metadata',
        onRequestClose: onRequestClose,
        className: 'bl-event-metadata-modal',
      },
      el(
        'div',
        { className: 'bl-event-metadata-modal__body' },
        el(
          'div',
          { className: 'bl-event-metadata-modal__fields' },
          Object.keys(groups).map(function (groupId) {
            const group = groups[groupId];
            return el(
              'div',
              { key: groupId, className: 'bl-event-metadata-modal__group' },
              el('h3', { className: 'bl-event-metadata-modal__group-title' }, group.title || groupId),
              el(
                'div',
                { className: 'bl-event-metadata-modal__table' },
                Object.keys(group.fields || {}).map(function (fieldId) {
                  const field = group.fields[fieldId];
                  const value = (draft[groupId] && draft[groupId][fieldId]) || '';
                  const label = field.label || fieldId;
                  const control =
                    field.type === 'textarea'
                      ? el(TextareaControl, {
                          hideLabelFromVision: true,
                          label: label,
                          rows: 3,
                          value: value,
                          onChange: function (v) {
                            setField(groupId, fieldId, v);
                          },
                        })
                      : el(TextControl, {
                          hideLabelFromVision: true,
                          label: label,
                          type:
                            field.type === 'email'
                              ? 'email'
                              : field.type === 'url'
                                ? 'url'
                                : 'text',
                          value: value,
                          onChange: function (v) {
                            setField(groupId, fieldId, v);
                          },
                        });
                  return el(
                    'div',
                    { key: groupId + '-' + fieldId, className: 'bl-event-metadata-modal__row' },
                    el('div', { className: 'bl-event-metadata-modal__row-label' }, label),
                    el('div', { className: 'bl-event-metadata-modal__row-field' }, control),
                  );
                }),
              ),
            );
          }),
        ),
        el(
          'div',
          { className: 'bl-event-metadata-modal__footer' },
          el(
            Button,
            { variant: 'tertiary', onClick: onRequestClose },
            L.cancelLabel || 'Cancel',
          ),
          el(
            Button,
            {
              variant: 'primary',
              onClick: function () {
                onSave(encodeMetadata(draft));
                onRequestClose();
              },
            },
            L.saveLabel || 'Save',
          ),
        ),
      ),
    );
  }

  function EventMetadataPanelContent() {
    const postType = useSelect(function (select) {
      return select('core/editor')?.getCurrentPostType?.() || '';
    }, []);
    const postId = useSelect(function (select) {
      return select('core/editor')?.getCurrentPostId?.();
    }, []);

    if (!postType || EVENT_TYPES.indexOf(postType) === -1 || !postId) {
      return null;
    }

    const config = metaConfigForType(postType);
    if (!config.groups || !Object.keys(config.groups).length) {
      return null;
    }

    const [meta, setMeta] = useEntityProp('postType', postType, 'meta', postId);
    const [modalOpen, setModalOpen] = useState(false);

    if (!meta || typeof setMeta !== 'function') {
      return null;
    }

    const raw = meta[META_KEY] || '';
    const data = parseMetadata(raw);

    function patch(next) {
      setMeta(Object.assign({}, meta, next));
    }

    const summary = [];
    Object.keys(config.groups).forEach(function (groupId) {
      const group = config.groups[groupId];
      const vals = data[groupId] || {};
      const lines = [];
      Object.keys(group.fields || {}).forEach(function (fieldId) {
        const v = vals[fieldId];
        if (v != null && String(v).trim() !== '') {
          lines.push(String(v).trim());
        }
      });
      if (lines.length) {
        summary.push({ id: groupId, title: group.title || groupId, lines: lines });
      }
    });

    return el(
      PluginDocumentSettingPanel,
      {
        name: 'baselayer-event-metadata',
        title: config.title || L.metadataModalTitle || 'Event metadata',
        className: 'baselayer-event-metadata-panel',
      },
      el(
        'div',
        { className: 'baselayer-editor-panel bl-event-metadata' },
        summary.length
          ? summary.map(function (block) {
              return el(
                'div',
                { key: block.id, className: 'bl-event-metadata__group' },
                el('p', { className: 'bl-event-metadata__group-title' }, block.title),
                block.lines.map(function (line, i) {
                  return el('p', { key: block.id + '-' + i, className: 'bl-event-metadata__line' }, line);
                }),
              );
            })
          : el('p', { className: 'description' }, L.noMetadata || 'No metadata'),
        el(
          Button,
          {
            variant: 'secondary',
            onClick: function () {
              setModalOpen(true);
            },
          },
          L.editMetadata || 'Edit metadata',
        ),
        modalOpen
          ? el(MetadataModal, {
              config: config,
              initialData: data,
              onRequestClose: function () {
                setModalOpen(false);
              },
              onSave: function (encoded) {
                patch({ [META_KEY]: encoded });
              },
            })
          : null,
      ),
    );
  }

  if (PluginDocumentSettingPanel) {
    registerPlugin('baselayer-event-metadata', {
      render: function () {
        return el(EventMetadataPanelContent, null);
      },
    });
  }
})();
