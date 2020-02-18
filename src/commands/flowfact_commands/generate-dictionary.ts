import { Argv } from 'yargs';

import { Logger } from '../../utils';
import { storeResponse, generateOutputName } from '../../utils/cli-tools';
import { command as parentCommand, FlowFactFlags } from '../flowfact';
import { TokenAuth, BasicAuth } from '../../classes/Authorization';
import { APIVersion } from '../../classes/portals/FlowFact';
import { DictionaryFlags, generateDictionaryOptions } from '../../cli';
import { FlowFactV1 } from '../../classes/portals/FlowFact/v1/Aggregator';
import { FlowFactV2 } from '../../classes/portals/FlowFact/v2/Aggregator';

export const command = 'generate-dictionary';

export const aliases = ['generate'];

const usage = `
$0 ${parentCommand} ${command} [args]
`;

interface Arguments extends FlowFactFlags, DictionaryFlags {}

exports.builder = (yargs: Argv) =>
  yargs
    .usage(usage)
    .group(Object.keys(generateDictionaryOptions), 'Dictionary options')
    .options(generateDictionaryOptions);

exports.handler = async (argv: Arguments) => {
  try {
    const apiVersion: APIVersion = argv.apiV1 ? 'v1' : 'v2';

    const flowFact = argv.apiV1
      ? new FlowFactV1(argv as BasicAuth)
      : new FlowFactV2(argv as TokenAuth);

    const result = await flowFact.generateDictionary(argv.language);

    const name = generateOutputName(
      parentCommand,
      command,
      apiVersion,
      argv.language
    );
    const fileName = storeResponse(name, result, true);
    Logger.log(`Dictionary stored at "${fileName}"`);
  } catch (error) {
    Logger.error(error);
  }
};
