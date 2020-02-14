import { Argv } from 'yargs';
import { Logger } from '../../utils';
import { storeResponse, generateOutputName } from '../../utils/cli-tools';
import is24 from '../../translations';
import { command as parentCommand } from '../immobilienscout24';
import { Mapping } from '../../classes/portals/Estate';
import { generateDictionaryOptions, DictionaryFlags } from '../../cli';
import { generateEstatePropertyKeys } from '../generate-dictionary';

export const command = 'generate-dictionary';

export const aliases = ['generate'];

const usage = `
$0 ${parentCommand} ${command} [args]
`;

interface Arguments extends DictionaryFlags {} // tslint:disable-line no-empty-interface

exports.builder = (yargs: Argv) =>
  yargs
    .usage(usage)
    .group(Object.keys(generateDictionaryOptions), 'Dictionary options')
    .options(generateDictionaryOptions);

const cleanValues = (mapping: Mapping): Mapping =>
  Object.keys(mapping).reduce((red, key) => ({ ...red, [key]: '' }), {});

export const getCommonKeys = (language?: string): Mapping => {
  const result = language ? (is24 as Mapping)[language] : cleanValues(is24.en);

  const excludedKeys = generateEstatePropertyKeys();
  excludedKeys.forEach(key => delete (result as Mapping)[key]);

  return result;
};

exports.handler = async (argv: Arguments) => {
  const result = getCommonKeys(argv.language);

  try {
    const name = generateOutputName(parentCommand, command, argv.language);
    const fileName = storeResponse(name, result, true);
    Logger.log(`Dictionary stored at "${fileName}"`);
  } catch (error) {
    Logger.error(error.message || error);
  }
};
