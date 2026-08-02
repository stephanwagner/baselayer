import { registerCustom } from '../../src/js/block-options/registry';
import { ContainerMarginControl } from './control';
import {
  ALL_CONTAINER_MARGIN_CLASSES,
  containerMarginAttributeKeys,
  containerMarginClassesFromAttributes,
} from './utils';

registerCustom({
  type: 'container-margin',
  Control: ContainerMarginControl,
  managedClasses: ALL_CONTAINER_MARGIN_CLASSES,
  attributeKeys: containerMarginAttributeKeys,
  classesFromAttributes: containerMarginClassesFromAttributes,
  optionKey: (_option, index) => 'container-margin-' + index,
  registerAttributes: (settings, option) => {
    const { top, bottom, linked } = option.attributeNames;
    const defaultSize = option.defaultSize ?? '';
    return {
      ...settings,
      attributes: {
        ...settings.attributes,
        [top]: { type: 'string', default: defaultSize },
        [bottom]: { type: 'string', default: defaultSize },
        [linked]: { type: 'boolean', default: true },
      },
    };
  },
});
