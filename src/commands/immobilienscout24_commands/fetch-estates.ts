import { Argv } from 'yargs';

import {
  command as parentCommand,
  Immobilienscout24Flags,
} from '../immobilienscout24';
import {
  Immobilienscout24,
  Immobilienscout24Estate,
  Immobilienscout24EstateCommon,
  Immobilienscout24EstateDetailed,
} from '../../classes/portals/Immobilienscout24/Portal';
import { OAuth } from '../../classes/Authorization';
import {
  storeResponse,
  loadDictionary,
  generateOutputName,
} from '../../utils/cli-tools';
import { Logger } from '../../utils';
import {
  GlobalFlags,
  fetchOptions,
  fetchMultipleOptions,
  FetchMultipleOptions,
} from '../../cli';
import { PaginatedFlags } from '../../cli';
import { Estate as IEstate } from '../../classes/portals/Estate';

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

export const fetchEstates = async (
  credentials: OAuth,
  options: FetchMultipleOptions
): Promise<Immobilienscout24Estate[]> => {
  if (!options) {
    options = {
      normalizedResult: true,
      detailedResult: false,
    };
  }

  const is24 = new Immobilienscout24(credentials);

  let results: Immobilienscout24Estate[] = await is24.fetchEstates({
    recursively: options.recursively,
    page: options.page,
    pageSize: options.pageSize,
    detailed: options.detailedResult,
  });

  if (options.normalizedResult) {
    const dictionary = loadDictionary(options.dictionaryPath);

    const Estate = options.detailedResult
      ? Immobilienscout24EstateDetailed
      : Immobilienscout24EstateCommon;

    results = await Promise.all(
      results.map(
        async result => await new Estate(result, dictionary).setValues()
      )
    );
  }

  return results;
};
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
