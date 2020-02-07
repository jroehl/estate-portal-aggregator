import { Argv } from 'yargs';

import {
  command as parentCommand,
  immobilienscout24Flags,
} from '../immobilienscout24';
import {
  Immobilienscout24,
  Immobilienscout24EstateCommon,
  Immobilienscout24EstateDetailed,
} from '../../classes/portals/Immobilienscout24/Portal';
import { OAuth } from '../../classes/Authorization';
import { storeResponse } from '../../utils/cli-tools';
import { Logger } from '../../utils';
import { globalFlags } from '../../cli';

export const command = 'fetch-estate <estate-id>';

export const aliases = ['fe'];

const usage = `
$0 ${parentCommand} ${command} [args]
`;

interface Arguments extends globalFlags, immobilienscout24Flags {
  id: string;
}

exports.builder = (yargs: Argv) =>
  yargs.usage(usage).positional('estate-id', { alias: ['id'], type: 'string' });

exports.handler = async (argv: Arguments) => {
  try {
    const is24 = new Immobilienscout24(argv as OAuth);

    let result = await is24.fetchEstate(argv.id);

    if (argv.normalize) {
      const Estate = argv.detailed
        ? Immobilienscout24EstateDetailed
        : Immobilienscout24EstateCommon;
      result = await new Estate(result).setValues();
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
    Logger.error(error.message || error);
  }
};
