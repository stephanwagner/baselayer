/**
 * Field type groups for the type selector.
 */

export const fieldTypeGroups = [
  {
    id: 'general',
    label: 'General',
    types: ['text', 'textarea', 'number', 'email', 'phone', 'url'],
  },
  {
    id: 'choice',
    label: 'Choice',
    types: ['select', 'checkbox'],
  },
];

export const defaultTypeId = 'text';
