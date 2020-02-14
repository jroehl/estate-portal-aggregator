import { Argv } from 'yargs';
import { Logger } from '../../utils';
import { storeResponse, generateOutputName } from '../../utils/cli-tools';
import { command as parentCommand } from '../immobilienscout24';
import { generateDictionaryOptions, DictionaryFlags } from '../../cli';
import { generateDictionary } from '../../lib/immobilienscout24/generate-dictionary';

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

exports.handler = async (argv: Arguments) => {
  try {
    const result = generateDictionary(argv.language);

    const name = generateOutputName(parentCommand, command, argv.language);
    const fileName = storeResponse(name, result, true);
    Logger.log(`Dictionary stored at "${fileName}"`);
  } catch (error) {
    Logger.error(error.message || error);
  }
};
