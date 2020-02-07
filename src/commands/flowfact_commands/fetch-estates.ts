import { Argv } from 'yargs';

import { command as parentCommand, flowfactFlags } from '../flowfact';
import {
  FlowFact,
  FlowFactEstateDetailed,
  FlowFactEstateCommon,
} from '../../classes/portals/FlowFact';
import { Credentials } from '../../classes/Authorization';
import { Portal } from '../../classes/portals/Portal';
import { storeResponse } from '../../utils/cli-tools';
import { Logger } from '../../utils';
import { Estate } from '../../classes/portals/Estate';
import { globalFlags } from '../../cli';
import { paginatedFlags } from '..';

export const command = 'fetch-estates';

export const aliases = ['fes'];

const usage = `
$0 ${parentCommand} ${command} [args]
`;

interface Arguments extends globalFlags, flowfactFlags, paginatedFlags {}

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
  const apiVersion = argv.apiV1 ? 'v1' : 'v2';
  const flowFact = new FlowFact(apiVersion, argv as Credentials) as Portal;

  try {
    let results = await flowFact.fetchEstates({
      recursively: argv.recursively,
      page: argv.page,
      pageSize: argv.pageSize,
      detailed: argv.detailed,
    });

    if (argv.normalize) {
      const FlowFactEstate = argv.detailed
        ? FlowFactEstateDetailed
        : FlowFactEstateCommon;
      results = await Promise.all(
        results.map(
          async result =>
            await (new FlowFactEstate(apiVersion, result) as Estate).setValues()
        )
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
    Logger.error(error.message || error);
    Logger.error(error);
  }
};
