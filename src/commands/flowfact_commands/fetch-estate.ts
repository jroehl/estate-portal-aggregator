import { Argv } from 'yargs';

import { command as parentCommand, FlowFactFlags } from '../flowfact';
import {
  FlowFactEstateCommonV1,
  FlowFactEstateDetailedV1,
  FlowFactEstateCommonV2,
  FlowFactEstateDetailedV2,
  FlowFactEstateV1,
  FlowFactEstateV2,
} from '../../classes/portals/FlowFact';
import { BasicAuth, TokenAuth } from '../../classes/Authorization';
import {
  storeResponse,
  loadDictionary,
  generateOutputName,
} from '../../utils/cli-tools';
import { Logger } from '../../utils';
import { GlobalFlags, fetchOptions, FetchSingleOptions } from '../../cli';
import FlowFactV2 from '../../classes/portals/FlowFact/v2/Portal';
import { enrichResultWithReadableKeys } from '../../classes/portals/FlowFact/v2/utils';
import FlowFactV1 from '../../classes/portals/FlowFact/v1/Portal';

export const command = 'fetch-estate <estate-id>';

export const aliases = ['fe'];

const usage = `
$0 ${parentCommand} ${command} [args]
`;

interface Arguments extends GlobalFlags, FlowFactFlags {
  id: string;
}

exports.builder = (yargs: Argv) =>
  yargs
    .group(Object.keys(fetchOptions), 'Fetch options')
    .options(fetchOptions)
    .usage(usage)
    .positional('estate-id', { alias: ['id'], type: 'string' });

export const fetchEstateV1 = async (
  id: string,
  credentials: BasicAuth,
  options: FetchSingleOptions = { normalizedResult: true, detailedResult: true }
): Promise<FlowFactEstateV1> => {
  const flowFact = new FlowFactV1(credentials);

  let result = await flowFact.fetchEstate(id);

  if (options.normalizedResult) {
    const dictionary = loadDictionary(options.dictionaryPath);

    const EstateV1 = options.detailedResult
      ? FlowFactEstateDetailedV1
      : FlowFactEstateCommonV1;

    result = await new EstateV1(result, dictionary).setValues();
  }

  return result;
};

export const fetchEstateV2 = async (
  id: string,
  credentials: TokenAuth,
  options: FetchSingleOptions = { normalizedResult: true, detailedResult: true }
): Promise<FlowFactEstateV2> => {
  const flowFact = new FlowFactV2(credentials);

  let result = await flowFact.fetchEstate(id);

  if (options.normalizedResult) {
    result = await enrichResultWithReadableKeys(flowFact, result);

    const dictionary = loadDictionary(options.dictionaryPath);

    const EstateV2 = options.detailedResult
      ? FlowFactEstateDetailedV2
      : FlowFactEstateCommonV2;

    result = await new EstateV2(result, dictionary).setValues();
  }

  return result;
};

exports.handler = async (argv: Arguments) => {
  try {
    const options = {
      detailedResult: argv.detailed,
      normalizedResult: argv.normalize,
      dictionaryPath: argv.dictionary,
    };

    const result = await (argv.apiV1
      ? fetchEstateV1(argv.id, argv as BasicAuth, options)
      : fetchEstateV2(argv.id, argv as TokenAuth, options));

    const name = generateOutputName(
      parentCommand,
      command.replace(' <estate-id>', ''),
      argv.apiV1 ? 'v1' : 'v2',
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
