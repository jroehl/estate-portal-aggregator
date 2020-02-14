import { Argv } from 'yargs';

import { command as parentCommand, FlowFactFlags } from '../flowfact';
import {
  FlowFact,
  FlowFactEstateDetailed,
  FlowFactEstateCommon,
} from '../../classes/portals/FlowFact';
import { Credentials } from '../../classes/Authorization';
import { Portal } from '../../classes/portals/Portal';
import {
  storeResponse,
  loadDictionary,
  generateOutputName,
} from '../../utils/cli-tools';
import { Logger } from '../../utils';
import { Estate } from '../../classes/portals/Estate';
import { GlobalFlags, fetchOptions, fetchMultipleOptions } from '../../cli';
import { PaginatedFlags } from '../../cli';
import { APIVersion } from '../../classes/portals/FlowFact';
import FlowFactV2 from '../../classes/portals/FlowFact/v2/Portal';
import { enrichResultWithReadableKeys } from '../../classes/portals/FlowFact/v2/utils';

export const command = 'fetch-estates';

export const aliases = ['fes'];

const usage = `
$0 ${parentCommand} ${command} [args]
`;

interface Arguments extends GlobalFlags, FlowFactFlags, PaginatedFlags {}

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
    const apiVersion: APIVersion = argv.apiV1 ? 'v1' : 'v2';
    const flowFact = new FlowFact(apiVersion, argv as Credentials) as Portal;

    let results = await flowFact.fetchEstates({
      recursively: argv.recursively,
      page: argv.page,
      pageSize: argv.pageSize,
      detailed: argv.detailed,
    });

    if (apiVersion === 'v2') {
      results = await enrichResultWithReadableKeys(
        flowFact as FlowFactV2,
        results
      );
    }

    if (argv.normalize) {
      const dictionary = loadDictionary(argv.dictionary);
      const FlowFactEstate = argv.detailed
        ? FlowFactEstateDetailed
        : FlowFactEstateCommon;
      results = await Promise.all(
        results.map(
          async result =>
            await (new FlowFactEstate(
              apiVersion,
              result,
              dictionary
            ) as Estate).setValues()
        )
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
    Logger.error(error.message || error);
  }
};
