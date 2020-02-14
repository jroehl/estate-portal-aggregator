import { Argv } from 'yargs';
import { flatten } from 'lodash';

import { Logger } from '../../utils';
import { storeResponse, generateOutputName } from '../../utils/cli-tools';
import { command as parentCommand, FlowFactFlags } from '../flowfact';
import { TokenAuth } from '../../classes/Authorization';
import { APIVersion } from '../../classes/portals/FlowFact';
import { Mapping } from '../../classes/portals/Estate';
import {
  DictionaryFlags,
  generateDictionaryOptions,
  GlobalFlags,
} from '../../cli';
import {
  generateDictionaryFlowFactV1,
  generateDictionaryFlowFactV2,
} from '../../lib/flowfact/generate-dictionary';

export const command = 'generate-dictionary';

export const aliases = ['generate'];

const usage = `
$0 ${parentCommand} ${command} [args]
`;

interface Arguments extends GlobalFlags, FlowFactFlags, DictionaryFlags {}

exports.builder = (yargs: Argv) =>
  yargs
    .usage(usage)
    .group(Object.keys(generateDictionaryOptions), 'Dictionary options')
    .options(generateDictionaryOptions);

exports.handler = async (argv: Arguments) => {
  try {
    const apiVersion: APIVersion = argv.apiV1 ? 'v1' : 'v2';

    let result: Mapping = {};
    if (apiVersion === 'v1') {
      result = generateDictionaryFlowFactV1(argv.language);
    } else {
      result = await generateDictionaryFlowFactV2(
        argv as TokenAuth,
        argv.language
      );
    }

    const name = generateOutputName(
      parentCommand,
      command,
      apiVersion,
      argv.language
    );
    const fileName = storeResponse(name, result, true);
    Logger.log(`Dictionary stored at "${fileName}"`);
  } catch (error) {
    Logger.error(error.message || error);
  }
};
