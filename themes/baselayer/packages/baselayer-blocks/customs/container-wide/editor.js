import { registerCustom } from '../../src/js/block-options/registry';
import { ContainerWideControl } from './control';
import {
  ALL_ALIGN_WIDE_CLASSES,
  alignWideAttributeKeys,
  alignWideClassesFromAttributes,
} from './utils';

const containerWideDef = {
  Control: ContainerWideControl,
  managedClasses: ALL_ALIGN_WIDE_CLASSES,
  attributeKeys: alignWideAttributeKeys,
  classesFromAttributes: alignWideClassesFromAttributes,
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
};

registerCustom({
  ...containerWideDef,
  type: 'container-wide',
  optionKey: (_option, index) => 'container-wide-' + index,
});

// BC: stores / seeds that still use type "align-wide".
registerCustom({
  ...containerWideDef,
  type: 'align-wide',
  optionKey: (_option, index) => 'align-wide-' + index,
});
