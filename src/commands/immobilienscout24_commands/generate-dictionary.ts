import { Argv } from 'yargs';
import { OAuth } from '../../classes/Authorization';
import { Immobilienscout24 } from '../../classes/portals/Immobilienscout24/Aggregator';
import { DictionaryFlags, generateDictionaryOptions } from '../../cli';
import { Logger } from '../../utils';
import { generateOutputName, storeResponse } from '../../utils/cli-tools';
import {
  command as parentCommand,
  Immobilienscout24Flags
} from '../immobilienscout24';

export const command = 'generate-dictionary';

export const aliases = ['generate'];

const usage = `
$0 ${parentCommand} ${command} [args]
`;

interface Arguments extends DictionaryFlags, Immobilienscout24Flags {} // tslint:disable-line no-empty-interface

exports.builder = (yargs: Argv) =>
  yargs
    .usage(usage)
    .group(Object.keys(generateDictionaryOptions), 'Dictionary options')
    .options(generateDictionaryOptions);

exports.handler = async (argv: Arguments) => {
  try {
    const is24 = new Immobilienscout24(argv as OAuth);

    const result = await is24.generateDictionary(argv.language);

    const name =
      argv.output || generateOutputName(parentCommand, command, argv.language);
    const fileName = storeResponse(name, result, true);
    Logger.log(`Dictionary stored at "${fileName}"`);
  } catch (error) {
    Logger.error(error);
  }
};
