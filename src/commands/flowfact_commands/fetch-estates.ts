import { Argv } from 'yargs';

import { command as parentCommand, FlowFactFlags } from '../flowfact';
import { TokenAuth, BasicAuth } from '../../classes/Authorization';
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
import { FlowFactV1 } from '../../classes/portals/FlowFact/v1/Aggregator';
import { FlowFactV2 } from '../../classes/portals/FlowFact/v2/Aggregator';

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
    const flowFact = argv.apiV1
      ? new FlowFactV1(argv as BasicAuth)
      : new FlowFactV2(argv as TokenAuth);

    let results;
    if (!argv.normalize) {
      results = await flowFact.fetchResults(argv);
    } else {
      results = await flowFact.fetchEstates(argv);
      results = results.map(result =>
        result.getProperties(argv.detailed, loadDictionary(argv.dictionary))
      );
    }

    const name = generateOutputName(
      parentCommand,
      command,
      argv.apiV1 ? 'v1' : 'v2',
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
