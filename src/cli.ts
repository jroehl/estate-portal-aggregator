// Import our DAO object
import * as yargs from 'yargs'; // We will take advantage of typings and intellsence.
import { Mapping } from './classes/portals/Estate';
import { AvailableLanguages } from './types';

export interface GlobalFlags {
  detailed: boolean;
  normalize: boolean;
  storeResult: boolean;
  pretty: boolean;
  dictionary?: string;
}

export interface PaginatedFlags {
  recursively?: boolean;
  page?: number;
  pageSize?: number;
}

export interface DictionaryFlags {
  language: AvailableLanguages;
}

export const fetchOptions: { [key: string]: yargs.Options } = {
  'store-result': {
    type: 'boolean',
    default: true,
    description: 'Store the results in a file',
  },
  normalize: {
    type: 'boolean',
    default: true,
    description: 'Return the normalized version of the estate',
  },
  detailed: {
    type: 'boolean',
    default: true,
    description: 'Return the long/detailed version of the estate',
  },
  pretty: {
    type: 'boolean',
    default: true,
    description: 'Store the estate pretty printed',
  },
  dictionary: {
    type: 'string',
    description:
      'Path to dictionary file to translate the values to target language',
  },
};

export const fetchMultipleOptions: { [key: string]: yargs.Options } = {
  detailed: {
    type: 'boolean',
    default: false,
    description: 'Return estates with all details',
  },
  recursively: {
    type: 'boolean',
    default: true,
    description: 'Fetch all paginated results',
  },
  'page-size': {
    type: 'number',
    description: 'Fetch results paginated according to size',
  },
  page: {
    type: 'number',
    description: 'Fetch specific page',
  },
};

export const generateDictionaryOptions: Mapping = {
  language: {
    type: 'string',
    alias: ['l'],
    choices: ['de', 'en'],
    required: false,
    description:
      'Generate pre-filled dictionary with translations for language',
  },
};

// tslint:disable-next-line no-unused-expression
yargs
  .usage('$0 <cmd> [args]')
  .commandDir('commands')
  .demandCommand(1, 'Please specify a command.').argv;
