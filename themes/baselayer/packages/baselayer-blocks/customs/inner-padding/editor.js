import { registerCustom } from '../../src/js/block-options/registry';
import { InnerPaddingControl } from './control';
import {
  ALL_INNER_PADDING_CLASSES,
  innerPaddingAttributeKeys,
  innerPaddingClassesFromAttributes,
} from './utils';

registerCustom({
  type: 'inner-padding',
  Control: InnerPaddingControl,
  managedClasses: ALL_INNER_PADDING_CLASSES,
  attributeKeys: innerPaddingAttributeKeys,
  classesFromAttributes: innerPaddingClassesFromAttributes,
  optionKey: (_option, index) => 'inner-padding-' + index,
  registerAttributes: (settings, option) => {
    const names = option.attributeNames || {};
    const padding = names.padding || 'containerPadding';
    const contentAlign = names.contentAlign || 'alignContentToContainer';
    return {
      ...settings,
      attributes: {
        ...settings.attributes,
        [padding]: { type: 'string', default: option.default ?? '' },
        [contentAlign]: { type: 'boolean', default: false },
      },
    };
  },
});
