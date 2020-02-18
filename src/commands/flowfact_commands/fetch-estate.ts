import { Argv } from 'yargs';

import { command as parentCommand, FlowFactFlags } from '../flowfact';
import { BasicAuth, TokenAuth } from '../../classes/Authorization';
import {
  storeResponse,
  generateOutputName,
  loadDictionary,
} from '../../utils/cli-tools';
import { Logger } from '../../utils';
import { GlobalFlags, fetchOptions } from '../../cli';
import { FlowFactV1 } from '../../classes/portals/FlowFact/v1/Aggregator';
import { FlowFactV2 } from '../../classes/portals/FlowFact/v2/Aggregator';

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

exports.handler = async (argv: Arguments) => {
  try {
    const dictionary = loadDictionary(argv.dictionary);
    const flowFact = argv.apiV1
      ? new FlowFactV1(argv as BasicAuth, dictionary)
      : new FlowFactV2(argv as TokenAuth, dictionary);

    let result;
    if (!argv.normalize) {
      result = await flowFact.fetchResult(argv.id);
    } else {
      result = await flowFact.fetchEstate(argv.id);
    }

    const name = generateOutputName(
      parentCommand,
      command.replace(' <estate-id>', ''),
      argv.apiV1 ? 'v1' : 'v2',
      argv.normalize ? 'normalized' : 'original',
      'long'
    );
    if (argv.storeResult) {
      const fileName = storeResponse(name, result, argv.pretty);
      Logger.log(`Result stored at "${fileName}"`);
    } else {
      Logger.logJSON(result);
    }
  } catch (error) {
    Logger.error(error);
  }
};
