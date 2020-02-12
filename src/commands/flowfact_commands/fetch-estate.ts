import { Argv } from 'yargs';

import { command as parentCommand, FlowFactFlags } from '../flowfact';
import {
  FlowFact,
  FlowFactEstateCommon,
  FlowFactEstateDetailed,
} from '../../classes/portals/FlowFact';
import { Credentials } from '../../classes/Authorization';
import { Portal } from '../../classes/portals/Portal';
import { storeResponse, loadDictionary } from '../../utils/cli-tools';
import { Logger } from '../../utils';
import { Estate } from '../../classes/portals/Estate';
import { APIVersion } from '../../classes/portals/FlowFact';
import { GlobalFlags } from '../../cli';
import FlowFactV2 from '../../classes/portals/FlowFact/v2/Portal';
import { enrichResultWithReadableKeys } from '../../classes/portals/FlowFact/v2/utils';

export const command = 'fetch-estate <estate-id>';

export const aliases = ['fe'];

const usage = `
$0 ${parentCommand} ${command} [args]
`;

interface Arguments extends GlobalFlags, FlowFactFlags {
  id: string;
}

exports.builder = (yargs: Argv) =>
  yargs.usage(usage).positional('estate-id', { alias: ['id'], type: 'string' });

exports.handler = async (argv: Arguments) => {
  try {
    const apiVersion: APIVersion = argv.apiV1 ? 'v1' : 'v2';
    const flowFact = new FlowFact(apiVersion, argv as Credentials) as Portal;

    let result = await flowFact.fetchEstate(argv.id);

    if (apiVersion === 'v2') {
      result = await enrichResultWithReadableKeys(
        flowFact as FlowFactV2,
        result
      );
    }

    if (argv.normalize) {
      const dictionary = loadDictionary(argv.dictionary);
      const FlowFactEstate = argv.detailed
        ? FlowFactEstateDetailed
        : FlowFactEstateCommon;
      result = await (new FlowFactEstate(
        apiVersion,
        result,
        dictionary
      ) as Estate).setValues();
    }

    const name = [
      parentCommand,
      command.replace(' <estate-id>', ''),
      apiVersion,
      argv.normalize ? 'normalized' : 'original',
      'long',
    ].join('-');
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
