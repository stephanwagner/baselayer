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
    const { useSelect, subscribe, select, dispatch } = wp.data;
    const cfg = typeof window.blEditorialEditor !== "undefined" ? window.blEditorialEditor : {};
    const labels = cfg.i18n || {};
    const liveStatuses = Array.isArray(cfg.liveStatuses) ? cfg.liveStatuses : ["publish", "future"];
    const requiresApproval = !!cfg.requiresApproval;
    function EditorialPendingStatus() {
      const status = useSelect((sel) => {
        const editor = sel("core/editor");
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
    if (requiresApproval && typeof subscribe === "function") {
      let syncing = false;
      subscribe(() => {
        if (syncing) {
          return;
        }
        const editor = select("core/editor");
        if (!editor || typeof editor.getCurrentPostAttribute !== "function") {
          return;
        }
        const savedStatus = editor.getCurrentPostAttribute("status") || "";
        if (liveStatuses.indexOf(savedStatus) === -1) {
          return;
        }
        const editedStatus = editor.getEditedPostAttribute("status") || "";
        if (editedStatus === savedStatus) {
          return;
        }
        const edits = dispatch("core/editor");
        if (!edits || typeof edits.editPost !== "function") {
          return;
        }
        syncing = true;
        try {
          edits.editPost({ status: savedStatus }, { undoIgnore: true });
        } finally {
          syncing = false;
        }
      });
    }
  })();
})();
//# sourceMappingURL=editorial-editor.js.map
