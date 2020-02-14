import { Argv } from 'yargs';

import {
  command as parentCommand,
  Immobilienscout24Flags,
} from '../immobilienscout24';
import { OAuth } from '../../classes/Authorization';
import { storeResponse, generateOutputName } from '../../utils/cli-tools';
import { Logger } from '../../utils';
import { GlobalFlags, fetchOptions } from '../../cli';
import { fetchEstate } from '../../lib/immobilienscout24/fetch-estate';

export const command = 'fetch-estate <estate-id>';

export const aliases = ['fe'];

const usage = `
$0 ${parentCommand} ${command} [args]
`;

interface Arguments extends GlobalFlags, Immobilienscout24Flags {
  id: string;
}

exports.builder = (yargs: Argv) =>
  yargs
    .group(Object.keys(fetchOptions), 'Fetch options')
    .options(fetchOptions)
    .usage(usage)
    .positional('estate-id', { alias: ['id'], type: 'string' });

exports.handler = async (argv: Arguments) => {
  try {
    const result = await fetchEstate(argv.id, argv as OAuth, {
      detailedResult: argv.detailed,
      normalizedResult: argv.normalize,
      dictionaryPath: argv.dictionary,
    });

    const name = generateOutputName(
      parentCommand,
      command.replace(' <estate-id>', ''),
      argv.normalize ? 'normalized' : 'original',
      argv.detailed ? 'long' : 'short'
    );
    if (argv.storeResult) {
      const fileName = storeResponse(name, result, argv.pretty);
      Logger.log(`Result stored at "${fileName}"`);
    } else {
      Logger.logJSON(result);
    }
  } catch (error) {
    Logger.error(error.message || error);
  }
};
