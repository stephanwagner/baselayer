/**
 * Optional `description` on block option configs (shown as control help text).
 */
export function optionHelpProps(option) {
  return option.description ? { help: option.description } : {};
}

export function BlockOptionDescription({ description }) {
  if (!description) {
    return null;
  }

  return <p className="components-base-control__help">{description}</p>;
}
