import { registerCustom } from '../../src/js/block-options/registry';
import { AlignWideControl } from './control';
import {
  ALL_ALIGN_WIDE_CLASSES,
  alignWideAttributeKeys,
  alignWideClassesFromAttributes,
} from './utils';

registerCustom({
  type: 'align-wide',
  Control: AlignWideControl,
  managedClasses: ALL_ALIGN_WIDE_CLASSES,
  attributeKeys: alignWideAttributeKeys,
  classesFromAttributes: alignWideClassesFromAttributes,
  optionKey: (_option, index) => 'align-wide-' + index,
  registerAttributes: (settings, option) => {
    const { container, content } = option.attributeNames;
    return {
      ...settings,
      attributes: {
        ...settings.attributes,
        [container]: { type: 'string', default: option.default ?? '' },
        [content]: { type: 'boolean', default: false },
      },
    };
  },
});
