import { Argv } from 'yargs';

import {
  command as parentCommand,
  Immobilienscout24Flags,
} from '../immobilienscout24';
import {
  Immobilienscout24,
  Immobilienscout24EstateCommon,
  Immobilienscout24EstateDetailed,
} from '../../classes/portals/Immobilienscout24/Portal';
import { OAuth } from '../../classes/Authorization';
import { storeResponse, loadDictionary } from '../../utils/cli-tools';
import { Logger } from '../../utils';
import { GlobalFlags } from '../../cli';
import { PaginatedFlags } from '..';

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
    .group('detailed', 'Args')
    .options({
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
    });

exports.handler = async (argv: Arguments) => {
  try {
    const is24 = new Immobilienscout24(argv as OAuth);

    let results = await is24.fetchEstates({
      recursively: argv.recursively,
      page: argv.page,
      pageSize: argv.pageSize,
      detailed: argv.detailed,
    });

    if (argv.normalize) {
      const dictionary = loadDictionary(argv.dictionary);
      const Estate = argv.detailed
        ? Immobilienscout24EstateDetailed
        : Immobilienscout24EstateCommon;
      results = await Promise.all(
        results.map(
          async result => await new Estate(result, dictionary).setValues()
        )
      );
    }

    const name = [
      parentCommand,
      command,
      argv.normalize ? 'normalized' : 'original',
      argv.detailed ? 'long' : 'short',
    ].join('-');
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
