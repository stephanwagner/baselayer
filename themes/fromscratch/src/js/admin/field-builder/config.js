/**
 * Field type groups for the type selector.
 */

export const fieldTypeGroups = [
  {
    id: 'general',
    label: 'General',
    types: ['text', 'textarea'],
  },
  {
    id: 'choice',
    label: 'Choice',
    types: ['select', 'checkbox'],
  },
];

export const defaultTypeId = 'text';
