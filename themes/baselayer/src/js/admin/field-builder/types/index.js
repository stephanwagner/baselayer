import { registerType } from '../registry';
import text from './text';
import textarea from './textarea';
import select from './select';
import checkbox from './checkbox';
import email from './email';
import url from './url';
import number from './number';
import phone from './phone';

const allTypes = [text, textarea, number, email, phone, url, select, checkbox];

export function registerAllTypes() {
  allTypes.forEach((type) => registerType(type));
}

export { allTypes };
