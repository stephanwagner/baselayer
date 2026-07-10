(function (wp) {
  'use strict';

  const el = wp.element.createElement;
  const { useEffect } = wp.element;
  const { registerPlugin } = wp.plugins;
  const { useSelect } = wp.data;
  const { useEntityProp } = wp.coreData;
  const { CheckboxControl } = wp.components;

  const editor = wp.editor || {};
  const PluginPostStatusInfo = editor.PluginPostStatusInfo;

  const META_KEY = '_fs_show_page_title';
  const BODY_CLASS_HIDDEN = 'fs-page-title-hidden';

  function isShowTitleChecked(value) {
    return value === undefined || value === null || value === true || value === '1' || value === 1;
  }

  function getEditorCanvasIframe() {
    return document.querySelector('iframe[name="editor-canvas"]');
  }

  function syncPageTitleHiddenClass(hidden) {
    var on = !!hidden;
    document.body.classList.toggle(BODY_CLASS_HIDDEN, on);

    var iframe = getEditorCanvasIframe();
    if (!iframe) {
      return;
    }

    var applyToIframe = function () {
      try {
        var iframeBody = iframe.contentDocument && iframe.contentDocument.body;
        if (iframeBody) {
          iframeBody.classList.toggle(BODY_CLASS_HIDDEN, on);
        }
      } catch (e) {
        // Cross-origin or not ready yet.
      }
    };

    applyToIframe();
    iframe.addEventListener('load', applyToIframe, { once: true });
  }

  function ShowPageTitleCheckbox(props) {
    const postType = props.postType;
    const postId = props.postId;
    const cfg = props.cfg || {};

    const [meta, setMeta] = useEntityProp('postType', postType, 'meta', postId);
    if (!meta || typeof setMeta !== 'function') {
      return null;
    }

    var checked = isShowTitleChecked(meta[META_KEY]);
    var label = cfg.labelShowTitlePage || 'Show page title';

    return el(CheckboxControl, {
      label: label,
      checked: checked,
      onChange: function (val) {
        setMeta(
          Object.assign({}, meta, {
            [META_KEY]: val ? true : false,
          }),
        );
      },
      __nextHasNoMarginBottom: true,
    });
  }

  function ShowPageTitlePlugin() {
    const postType = useSelect(function (select) {
      return select('core/editor')?.getCurrentPostType?.() || '';
    }, []);
    const postId = useSelect(function (select) {
      return select('core/editor')?.getCurrentPostId?.();
    }, []);
    const showTitleMeta = useSelect(
      function (select) {
        if (!postId) {
          return true;
        }
        var edited = select('core/editor')?.getEditedPostAttribute?.('meta');
        if (edited && Object.prototype.hasOwnProperty.call(edited, META_KEY)) {
          return edited[META_KEY];
        }
        return select('core/editor')?.getCurrentPostAttribute?.('meta')?.[META_KEY];
      },
      [postId],
    );

    var cfg = typeof fromscratchPageSidebarOptions !== 'undefined' ? fromscratchPageSidebarOptions : {};
    var allowed = cfg.showTitlePostTypes && Array.isArray(cfg.showTitlePostTypes) ? cfg.showTitlePostTypes : ['page'];
    var isAllowed = !!(postType && allowed.indexOf(postType) !== -1 && postId);

    useEffect(
      function () {
        if (!isAllowed) {
          syncPageTitleHiddenClass(false);
          return function () {
            syncPageTitleHiddenClass(false);
          };
        }

        var hidden = !isShowTitleChecked(showTitleMeta);
        syncPageTitleHiddenClass(hidden);

        // Canvas iframe can mount after the plugin; retry briefly.
        var tries = 0;
        var timer = window.setInterval(function () {
          syncPageTitleHiddenClass(hidden);
          tries += 1;
          if (tries >= 20 || getEditorCanvasIframe()?.contentDocument?.body) {
            window.clearInterval(timer);
          }
        }, 250);

        return function () {
          window.clearInterval(timer);
          syncPageTitleHiddenClass(false);
        };
      },
      [isAllowed, showTitleMeta],
    );

    if (!PluginPostStatusInfo || !isAllowed) {
      return null;
    }

    return el(
      PluginPostStatusInfo,
      { className: 'fromscratch-page-show-title' },
      el(ShowPageTitleCheckbox, {
        postType: postType,
        postId: postId,
        cfg: cfg,
      }),
    );
  }

  registerPlugin('fromscratch-page-show-title', {
    render: ShowPageTitlePlugin,
  });
})(typeof wp !== 'undefined' ? wp : window.wp);
