import { Argv } from 'yargs';

import { command as parentCommand, FlowFactFlags } from '../flowfact';
import { BasicAuth, TokenAuth } from '../../classes/Authorization';
import { storeResponse, generateOutputName } from '../../utils/cli-tools';
import { Logger } from '../../utils';
import { GlobalFlags, fetchOptions } from '../../cli';
import { fetchEstateV1, fetchEstateV2 } from '../../lib/flowfact/fetch-estate';

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
