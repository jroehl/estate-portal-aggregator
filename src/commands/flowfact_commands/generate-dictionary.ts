import { Argv } from 'yargs';
import { flatten } from 'lodash';

import { Logger } from '../../utils';
import { storeResponse, generateOutputName } from '../../utils/cli-tools';
import { command as parentCommand, FlowFactFlags } from '../flowfact';
import { GlobalFlags } from '../../cli';
import estateCommon from '../../translations';
import { Credentials } from '../../classes/Authorization';
import { FlowFact, APIVersion } from '../../classes/portals/FlowFact';
import FlowFactV2, {
  estateSchemas,
} from '../../classes/portals/FlowFact/v2/Portal';
import { Mapping } from '../../classes/portals/Estate';
import { DictionaryFlags, generateDictionaryOptions } from '../../cli';
import { getCommonKeys } from '../immobilienscout24_commands/generate-dictionary';

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

const initFieldParse = (language: string, dictionary: Mapping = {}) => {
  const parse = (props: Mapping = {}): Mapping[] => {
    return Object.entries(props).map(
      ([key, { name, captions, fields, properties }]: [string, any]) => {
        const lowerKey = (name || key).toLowerCase();
        return flatten([
          {
            [lowerKey]: language
              ? captions[language] || dictionary[lowerKey] || ''
              : '',
          },
          ...parse(properties || fields),
        ]);
      }
    );
  };

  return parse;
};

const generateDictionary = async (
  flowFact: FlowFactV2,
  dictionary: Mapping,
  language: string
): Promise<Mapping> => {
  const schemas = await flowFact.fetchSchemas();
  const reducedSchemas = schemas.filter(({ name }) =>
    estateSchemas.includes(name)
  );
  const parseFields = initFieldParse(language, dictionary);
  const values = flatten(parseFields(reducedSchemas));
  return Object.assign({}, ...values);
};

exports.handler = async (argv: Arguments) => {
  const apiVersion: APIVersion = argv.apiV1 ? 'v1' : 'v2';
  try {
    const flowFact = new FlowFact(apiVersion, argv as Credentials) as FlowFact;

    let result: Mapping = {};
    if (apiVersion === 'v1') {
      result = getCommonKeys(argv.language);
    } else {
      const dictionary = await generateDictionary(
        flowFact as FlowFactV2,
        {
          ...estateCommon.fallbacks.en,
          ...estateCommon[argv.language || 'en'],
        },
        argv.language
      );
      result = dictionary;
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
