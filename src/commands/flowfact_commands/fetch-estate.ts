import { Argv } from 'yargs';

import { command as parentCommand, flowfactFlags } from '../flowfact';
import {
  FlowFact,
  FlowFactEstateCommon,
  FlowFactEstateDetailed,
} from '../../classes/portals/FlowFact';
import { Credentials } from '../../classes/Authorization';
import { Portal } from '../../classes/portals/Portal';
import { storeResponse } from '../../utils/cli-tools';
import { Logger } from '../../utils';
import { Estate } from '../../classes/portals/Estate';
import { globalFlags } from '../../cli';

export const command = 'fetch-estate <estate-id>';

export const aliases = ['fe'];

const usage = `
$0 ${parentCommand} ${command} [args]
`;

interface Arguments extends globalFlags, flowfactFlags {
  id: string;
}

exports.builder = (yargs: Argv) =>
  yargs.usage(usage).positional('estate-id', { alias: ['id'], type: 'string' });

exports.handler = async (argv: Arguments) => {
  const apiVersion = argv.apiV1 ? 'v1' : 'v2';
  const flowFact = new FlowFact(apiVersion, argv as Credentials) as Portal;

  try {
    let result = await flowFact.fetchEstate(argv.id);

    if (argv.normalize) {
      const FlowFactEstate = argv.detailed
        ? FlowFactEstateDetailed
        : FlowFactEstateCommon;
      result = await (new FlowFactEstate(
        apiVersion,
        result
      ) as Estate).setValues();
    }

    if (argv.storeResult) {
      const fileName = storeResponse(
        `${parentCommand}-${command}-long`,
        result,
        argv.pretty
      );
      Logger.log(`Result stored at "${fileName}"`);
    } else {
      Logger.logJSON(result);
    }
  } catch (error) {
    Logger.error(error.message);
  }
};
