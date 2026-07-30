(() => {
  // themes/baselayer/packages/baselayer-editorial/src/js/editor.js
  (function() {
    "use strict";
    const wp = typeof window !== "undefined" ? window.wp : null;
    if (!wp || !wp.plugins || !wp.editor || !wp.element || !wp.data) {
      return;
    }
    const el = wp.element.createElement;
    const { registerPlugin } = wp.plugins;
    const { PluginPostStatusInfo } = wp.editor;
    const { useSelect } = wp.data;
    const labels = typeof window.blEditorialEditor !== "undefined" && window.blEditorialEditor.i18n ? window.blEditorialEditor.i18n : {};
    function EditorialPendingStatus() {
      const status = useSelect((select) => {
        const editor = select("core/editor");
        if (!editor || typeof editor.getEditedPostAttribute !== "function") {
          return "";
        }
        return editor.getEditedPostAttribute("status") || "";
      }, []);
      if (status !== "pending") {
        return null;
      }
      return el(
        PluginPostStatusInfo,
        { className: "bl-editorial-pending-status" },
        el(
          "div",
          { className: "editor-post-panel__row" },
          el("div", { className: "editor-post-panel__row-label" }, labels.pendingLabel || "Editorial"),
          el(
            "div",
            { className: "editor-post-panel__row-control" },
            el("span", { className: "bl-editorial-pending-status__text" }, labels.pendingText || "Pending review \u2014 awaiting approval")
          )
        )
      );
    }
    registerPlugin("baselayer-editorial-status", {
      render: EditorialPendingStatus
    });
  })();
})();
//# sourceMappingURL=editorial-editor.js.map
