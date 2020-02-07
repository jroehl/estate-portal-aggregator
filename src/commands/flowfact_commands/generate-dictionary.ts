import { Argv } from 'yargs';
import { flatten } from 'lodash';

import { Logger } from '../../utils';
import { storeResponse } from '../../utils/cli-tools';
import { command as parentCommand, flowfactFlags } from '../flowfact';
import { globalFlags } from '../../cli';
import estateCommon from '../../translations';
import { Credentials } from '../../classes/Authorization';
import { FlowFact, APIVersion } from '../../classes/portals/FlowFact';
import FlowFactV2, {
  estateSchemas,
} from '../../classes/portals/FlowFact/v2/Portal';
import { Mapping } from '../../classes/portals/Estate';
import { dictionaryFlags, generateDictionaryOptions } from '..';

export const command = 'generate-dictionary';

export const aliases = ['generate'];

const usage = `
$0 ${parentCommand} ${command} [args]
`;

interface Arguments extends globalFlags, flowfactFlags, dictionaryFlags {}

exports.builder = (yargs: Argv) =>
  yargs.usage(usage).options(generateDictionaryOptions);

const cleanValues = (mapping: Mapping) =>
  Object.keys(mapping).reduce((red, key) => ({ ...red, [key]: '' }), {});

const generateDictionary = async (flowFact: FlowFactV2): Promise<Mapping> => {
  const schemas = await flowFact.fetchSchemas();
  const values = flatten(
    schemas.map(({ name, captions, properties }: Mapping) => {
      if (!estateSchemas.includes(name)) return [];
      return flatten([
        { [name.toLowerCase()]: captions.de },
        ...Object.entries(properties).map(
          ([key, { captions, fields = [] }]: [string, any]) => {
            return flatten([
              { [key.toLowerCase()]: captions.de || '' },
              ...Object.entries(fields).map(
                ([key, { captions }]: [string, any]) => {
                  return { [key.toLowerCase()]: captions.de };
                }
              ),
            ]);
          }
        ),
      ]);
    })
  );
  return values.reduce((red, value) => ({ ...red, ...value }), {});
};

exports.handler = async (argv: Arguments) => {
  const apiVersion: APIVersion = argv.apiV1 ? 'v1' : 'v2';
  try {
    const flowFact = new FlowFact(apiVersion, argv as Credentials) as FlowFact;

    let result: Mapping;
    if (apiVersion === 'v2') {
      const dictionary = await generateDictionary(flowFact as FlowFactV2);
      result = dictionary;
    } else {
      result = estateCommon;
    }

    const cleaned = argv.language ? result : cleanValues(result);

    const name = [parentCommand, command, apiVersion, argv.language]
      .filter(Boolean)
      .join('-');
    const fileName = storeResponse(name, cleaned, true);
    Logger.log(`Dictionary stored at "${fileName}"`);
  } catch (error) {
    Logger.error(error.message || error);
  }
};
