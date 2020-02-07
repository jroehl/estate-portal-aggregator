import { Argv } from 'yargs';
import { Logger } from '../../utils';
import { storeResponse } from '../../utils/cli-tools';
import is24 from '../../translations';
import { command as parentCommand } from '../immobilienscout24';
import { Mapping } from '../../classes/portals/Estate';
import { generateDictionaryOptions, dictionaryFlags } from '..';

export const command = 'generate-dictionary';

export const aliases = ['generate'];

const usage = `
$0 ${parentCommand} ${command} [args]
`;

interface Arguments extends dictionaryFlags {}

exports.builder = (yargs: Argv) =>
  yargs.usage(usage).options(generateDictionaryOptions);

const cleanValues = (mapping: Mapping) =>
  Object.keys(mapping).reduce((red, key) => ({ ...red, [key]: '' }), {});

exports.handler = async (argv: Arguments) => {
  const result = argv.language ? is24 : cleanValues(is24);
  try {
    const name = [parentCommand, command, argv.language]
      .filter(Boolean)
      .join('-');
    const fileName = storeResponse(name, result, true);
    Logger.log(`Dictionary stored at "${fileName}"`);
  } catch (error) {
    Logger.error(error.message || error);
  }
};
