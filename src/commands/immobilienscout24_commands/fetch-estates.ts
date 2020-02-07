import { Argv } from 'yargs';

import {
  command as parentCommand,
  immobilienscout24Flags,
} from '../immobilienscout24';
import {
  Immobilienscout24,
  Immobilienscout24EstateCommon,
  Immobilienscout24EstateDetailed,
} from '../../classes/portals/Immobilienscout24/Portal';
import { OAuth } from '../../classes/Authorization';
import { storeResponse } from '../../utils/cli-tools';
import { Logger } from '../../utils';
import { globalFlags } from '../../cli';
import { paginatedFlags } from '..';

export const command = 'fetch-estates';

export const aliases = ['fes'];

const usage = `
$0 ${parentCommand} ${command} [args]
`;

interface Arguments
  extends globalFlags,
    immobilienscout24Flags,
    paginatedFlags {}

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
      const Estate = argv.detailed
        ? Immobilienscout24EstateDetailed
        : Immobilienscout24EstateCommon;
      results = await Promise.all(
        results.map(async result => await new Estate(result).setValues())
      );
    }

    if (argv.storeResult) {
      const fileName = storeResponse(
        `${parentCommand}-${command}-${argv.detailed ? 'long' : 'short'}`,
        results,
        argv.pretty
      );
      Logger.log(
        `${results.length} result${
          results.length === 1 ? '' : 's'
        } stored at "${fileName}"`
      );
    } else {
      Logger.logJSON(results);
    }
  } catch (error) {
    Logger.error(error.message);
  }
};
