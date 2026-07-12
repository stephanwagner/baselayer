import { registerType } from '../registry';
import text from './text';
import textarea from './textarea';
import select from './select';
import checkbox from './checkbox';

const allTypes = [text, textarea, select, checkbox];

export function registerAllTypes() {
  allTypes.forEach((type) => registerType(type));
}

export { allTypes };
