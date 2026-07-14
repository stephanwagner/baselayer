(() => {
  // themes/baselayer/src/js/editor/creator-blocks.js
  (function(wp) {
    if (!wp || !wp.blocks || !wp.element || !wp.blockEditor || !wp.components) {
      return;
    }
    const { registerBlockType } = wp.blocks;
    const { createElement: el, Fragment } = wp.element;
    const { InspectorControls, useBlockProps } = wp.blockEditor;
    const { PanelBody, TextControl, TextareaControl, SelectControl, ToggleControl } = wp.components;
    const config = window.baselayerCreatorBlocks || {};
    const blocks = Array.isArray(config.blocks) ? config.blocks : [];
    function renderFieldControl(field, attributes, setAttributes) {
      const slug = field.slug;
      const label = field.title || slug;
      const value = attributes[slug];
      const onChange = (next) => setAttributes({ [slug]: next });
      if (field.type === "textarea") {
        return el(TextareaControl, {
          key: slug,
          label,
          value: value == null ? "" : String(value),
          onChange,
          rows: field.rows || 4,
          help: field.presentation && field.presentation.description
        });
      }
      if (field.type === "checkbox") {
        return el(ToggleControl, {
          key: slug,
          label,
          checked: Boolean(value),
          onChange,
          help: field.presentation && field.presentation.description
        });
      }
      if (field.type === "select") {
        const options = [{ label: "\u2014", value: "" }].concat(
          (field.options || []).map((opt) => ({
            label: opt.label || opt.value,
            value: String(opt.value)
          }))
        );
        return el(SelectControl, {
          key: slug,
          label,
          value: value == null ? "" : String(value),
          options,
          onChange,
          help: field.presentation && field.presentation.description
        });
      }
      return el(TextControl, {
        key: slug,
        label,
        value: value == null ? "" : String(value),
        onChange,
        help: field.presentation && field.presentation.description
      });
    }
    function optionClasses(options, attributes) {
      const classes = [];
      (options || []).forEach((option) => {
        if (!option || option.type !== "checkbox" || !option.class_name || !option.slug) {
          return;
        }
        if (attributes[option.slug]) {
          classes.push(String(option.class_name));
        }
      });
      return classes.join(" ");
    }
    blocks.forEach((block) => {
      if (!block || !block.name) {
        return;
      }
      registerBlockType(block.name, {
        apiVersion: 3,
        title: block.title || block.slug,
        category: "baselayer",
        icon: "block-default",
        attributes: block.attributes || {},
        supports: {
          html: false,
          className: true
        },
        edit: function Edit(props) {
          const { attributes, setAttributes } = props;
          const fields = Array.isArray(block.fields) ? block.fields : [];
          const options = Array.isArray(block.options) ? block.options : [];
          const extraClass = optionClasses(options, attributes);
          const blockProps = useBlockProps({
            className: ["bl-creator-block-editor", extraClass].filter(Boolean).join(" ")
          });
          return el(
            Fragment,
            null,
            el(
              InspectorControls,
              null,
              el(
                PanelBody,
                { title: "Fields", initialOpen: true },
                fields.length ? fields.map((field) => renderFieldControl(field, attributes, setAttributes)) : el("p", null, "No fields yet. Add fields in Blocks admin.")
              ),
              el(
                PanelBody,
                { title: "Custom options", initialOpen: false },
                options.length ? options.map((field) => renderFieldControl(field, attributes, setAttributes)) : el("p", null, "No custom options yet.")
              )
            ),
            el(
              "div",
              blockProps,
              el("strong", null, block.title || block.slug),
              fields.length ? el(
                "ul",
                { className: "bl-creator-block-editor__preview" },
                fields.map((field) => {
                  let val = attributes[field.slug];
                  if (Array.isArray(val)) {
                    val = val.join(", ");
                  } else if (typeof val === "boolean") {
                    val = val ? "true" : "false";
                  }
                  return el("li", { key: field.slug }, (field.title || field.slug) + ": " + (val == null || val === "" ? "\u2014" : String(val)));
                })
              ) : el("p", { className: "description" }, "No fields configured.")
            )
          );
        },
        save: function() {
          return null;
        }
      });
    });
  })(window.wp);
})();
//# sourceMappingURL=creator-blocks.js.map
