import { Mapping } from '../classes/portals/Estate';

export interface paginatedFlags {
  recursively: boolean;
  page: number;
  pageSize: number;
}

export interface dictionaryFlags {
  language: 'de' | 'en';
}

export const generateDictionaryOptions: Mapping = {
  language: {
    type: 'string',
    alias: ['l'],
    choices: ['de', 'en'],
    required: false,
    description: 'Generate pre-filled dictionary with specified language',
  },
};
