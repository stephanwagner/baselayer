(() => {
  // themes/baselayer/packages/baselayer-forms/src/js/block.js
  (function(wp) {
    if (!wp || !wp.blocks || !wp.element || !wp.blockEditor || !wp.components) {
      return;
    }
    const { registerBlockType } = wp.blocks;
    const { createElement: el, Fragment, RawHTML } = wp.element;
    const { InspectorControls, useBlockProps } = wp.blockEditor;
    const { PanelBody, SelectControl } = wp.components;
    const config = window.blFormsBlock || {};
    const options = config.options || [{ label: "Select a form\u2026", value: "0" }];
    const i18n = config.i18n || {};
    const iconSvg = typeof config.icon === "string" ? config.icon.trim() : "";
    const placeholder = (text) => el(
      "div",
      { className: "bl-form-block-placeholder" },
      iconSvg ? el(
        "span",
        {
          className: "bl-form-block-placeholder__icon",
          "aria-hidden": "true"
        },
        el(RawHTML, null, iconSvg)
      ) : null,
      el("span", { className: "bl-form-block-placeholder__text" }, text)
    );
    registerBlockType("baselayer/form", {
      icon: iconSvg ? {
        src: el(
          "span",
          {
            style: { display: "flex" }
          },
          el(RawHTML, null, iconSvg)
        )
      } : "feedback",
      edit: function Edit(props) {
        const { attributes, setAttributes } = props;
        const formId = attributes.formId || 0;
        const blockProps = useBlockProps({ className: "bl-form-block-editor" });
        const selected = options.find((opt) => String(opt.value) === String(formId));
        const formLabel = i18n.form || "Form";
        const selectText = i18n.selectForm || "Select a form in the block settings.";
        const text = formId ? formLabel + ": " + (selected ? selected.label : "#" + formId) : selectText;
        return el(
          Fragment,
          null,
          el(
            InspectorControls,
            null,
            el(
              PanelBody,
              { title: formLabel, initialOpen: true },
              el(SelectControl, {
                label: formLabel,
                value: String(formId || 0),
                options,
                onChange: (value) => setAttributes({ formId: parseInt(value, 10) || 0 })
              })
            )
          ),
          el("div", blockProps, placeholder(text))
        );
      },
      save: function save() {
        return null;
      }
    });
  })(window.wp);
})();
//# sourceMappingURL=forms-block.js.map
