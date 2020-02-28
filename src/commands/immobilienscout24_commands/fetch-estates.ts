import { Argv } from 'yargs';

import {
  command as parentCommand,
  Immobilienscout24Flags,
} from '../immobilienscout24';
import { OAuth } from '../../classes/Authorization';
import {
  storeResponse,
  generateOutputName,
  loadDictionary,
} from '../../utils/cli-tools';
import { Logger } from '../../utils';
import {
  GlobalFlags,
  fetchOptions,
  fetchMultipleOptions,
  PaginatedFlags,
} from '../../cli';
import { Immobilienscout24 } from '../../classes/portals/Immobilienscout24/Aggregator';

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
    const is24 = new Immobilienscout24(argv as OAuth);

    let results;
    if (!argv.normalize) {
      results = await is24.fetchResults(argv);
    } else {
      results = await is24.fetchEstates(argv);
      results = results.map(result =>
        result.getProperties(argv.detailed, loadDictionary(argv.dictionary))
      );
    }

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
    Logger.error(error);
  }
};
