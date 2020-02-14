import { Argv } from 'yargs';

import { command as parentCommand, FlowFactFlags } from '../flowfact';
import {
  FlowFactEstateV1,
  FlowFactEstateV2,
  FlowFactEstateDetailedV1,
  FlowFactEstateCommonV1,
  FlowFactEstateDetailedV2,
  FlowFactEstateCommonV2,
} from '../../classes/portals/FlowFact';
import { TokenAuth, BasicAuth } from '../../classes/Authorization';
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
import FlowFactV2 from '../../classes/portals/FlowFact/v2/Portal';
import { enrichResultWithReadableKeys } from '../../classes/portals/FlowFact/v2/utils';
import FlowFactV1 from '../../classes/portals/FlowFact/v1/Portal';

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

export const fetchEstatesV1 = async (
  credentials: BasicAuth,
  options: FetchMultipleOptions = {
    normalizedResult: true,
    detailedResult: true,
  }
): Promise<FlowFactEstateV1[]> => {
  const flowFact = new FlowFactV1(credentials);

  let results = await flowFact.fetchEstates({
    recursively: options.recursively,
    page: options.page,
    pageSize: options.pageSize,
    detailed: options.detailedResult,
  });

  if (options.normalizedResult) {
    const dictionary = loadDictionary(options.dictionaryPath);

    const EstateV1 = options.detailedResult
      ? FlowFactEstateDetailedV1
      : FlowFactEstateCommonV1;

    results = await Promise.all(
      results.map(
        async result => await new EstateV1(result, dictionary).setValues()
      )
    );
  }

  return results;
};

export const fetchEstatesV2 = async (
  credentials: TokenAuth,
  options: FetchMultipleOptions = {
    normalizedResult: true,
    detailedResult: true,
  }
): Promise<FlowFactEstateV2[]> => {
  const flowFact = new FlowFactV2(credentials);

  let results = await flowFact.fetchEstates({
    recursively: options.recursively,
    page: options.page,
    pageSize: options.pageSize,
    detailed: options.detailedResult,
  });

  if (options.normalizedResult) {
    results = await enrichResultWithReadableKeys(flowFact, results);

    const dictionary = loadDictionary(options.dictionaryPath);

    const EstateV2 = options.detailedResult
      ? FlowFactEstateDetailedV2
      : FlowFactEstateCommonV2;

    results = await Promise.all(
      results.map(
        async result => await new EstateV2(result, dictionary).setValues()
      )
    );
  }

  return results;
};

exports.handler = async (argv: Arguments) => {
  try {
    const options = {
      ...argv,
      detailedResult: argv.detailed,
      normalizedResult: argv.normalize,
      dictionaryPath: argv.dictionary,
    };

    const results = await (argv.apiV1
      ? fetchEstatesV1(argv as BasicAuth, options)
      : fetchEstatesV2(argv as TokenAuth, options));

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
    Logger.error(error.message || error);
  }
};
