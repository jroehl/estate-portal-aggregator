import { Argv } from 'yargs';

import {
  command as parentCommand,
  Immobilienscout24Flags,
} from '../immobilienscout24';
import { OAuth } from '../../classes/Authorization';
import { storeResponse, generateOutputName } from '../../utils/cli-tools';
import { Logger } from '../../utils';
import { GlobalFlags, fetchOptions, fetchMultipleOptions } from '../../cli';
import { PaginatedFlags } from '../../cli';
import { fetchEstates } from '../../lib/immobilienscout24/fetch-estates';

export const command = 'fetch-estates';

export const aliases = ['fes'];

const usage = `
$0 ${parentCommand} ${command} [args]
`;

interface Arguments
  extends GlobalFlags,
    Immobilienscout24Flags,
    PaginatedFlags {}

exports.builder = (yargs: Argv) =>
  yargs
    .usage(usage)
    .group(Object.keys(fetchOptions), 'Fetch options')
    .group(Object.keys(fetchMultipleOptions), 'Fetch multiple options')
    .options({
      ...fetchOptions,
      ...fetchMultipleOptions,
    });

exports.handler = async (argv: Arguments) => {
  try {
    const results = await fetchEstates(argv as OAuth, {
      ...argv,
      detailedResult: argv.detailed,
      normalizedResult: argv.normalize,
      dictionaryPath: argv.dictionary,
    });

    const name = generateOutputName(
      parentCommand,
      command,
      argv.normalize ? 'normalized' : 'original',
      argv.detailed ? 'long' : 'short'
    );
    if (argv.storeResult) {
      const fileName = storeResponse(name, results, argv.pretty);
      Logger.log(
        `${results.length} result${
          results.length === 1 ? '' : 's'
        } stored at "${fileName}"`
      );
    } else {
      Logger.logJSON(results);
    }
  } catch (error) {
    Logger.error(error.message || error);
  }
};
