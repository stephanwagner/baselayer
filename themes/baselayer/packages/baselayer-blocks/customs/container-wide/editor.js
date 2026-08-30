import { registerCustom } from '../../src/js/block-options/registry';
import { ContainerWideControl } from './control';
import {
  ALL_ALIGN_WIDE_CLASSES,
  alignWideAttributeKeys,
  alignWideClassesFromAttributes,
} from './utils';

registerCustom({
  type: 'container-wide',
  Control: ContainerWideControl,
  managedClasses: ALL_ALIGN_WIDE_CLASSES,
  attributeKeys: alignWideAttributeKeys,
  classesFromAttributes: alignWideClassesFromAttributes,
  optionKey: (_option, index) => 'container-wide-' + index,
  registerAttributes: (settings, option) => {
    const names = option.attributeNames || {};
    const container = names.container || 'alignWideContainer';
    const content = names.content || 'alignWideContent';
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
