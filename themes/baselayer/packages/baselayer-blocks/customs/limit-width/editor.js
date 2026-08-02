import { registerCustom } from '../../src/js/block-options/registry';
import { LimitWidthControl } from './control';
import {
  ALL_LIMIT_WIDTH_CLASSES,
  limitWidthAttributeKeys,
  limitWidthClassesFromAttributes,
  migrateLegacyLimitWidthAttributes,
} from './utils';

registerCustom({
  type: 'limit-width',
  Control: LimitWidthControl,
  managedClasses: ALL_LIMIT_WIDTH_CLASSES,
  attributeKeys: (option) => [...limitWidthAttributeKeys(option), 'limitWidth'],
  classesFromAttributes: limitWidthClassesFromAttributes,
  optionKey: (_option, index) => 'limit-width-' + index,
  migrateAttributes: migrateLegacyLimitWidthAttributes,
  registerAttributes: (settings, option) => {
    const { size, align } = option.attributeNames;
    return {
      ...settings,
      attributes: {
        ...settings.attributes,
        [size]: { type: 'string', default: '' },
        [align]: { type: 'string', default: option.defaultAlign ?? 'center' },
        limitWidth: { type: 'string', default: '' },
      },
    };
  },
});
