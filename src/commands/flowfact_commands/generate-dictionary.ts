import { Argv } from 'yargs';
import { flatten } from 'lodash';

import { Logger } from '../../utils';
import { storeResponse, generateOutputName } from '../../utils/cli-tools';
import { command as parentCommand, FlowFactFlags } from '../flowfact';
import { GlobalFlags, AvailableTranslations } from '../../cli';
import estateCommon from '../../translations';
import { TokenAuth } from '../../classes/Authorization';
import { APIVersion } from '../../classes/portals/FlowFact';
import FlowFactV2, {
  estateSchemas,
} from '../../classes/portals/FlowFact/v2/Portal';
import { Mapping } from '../../classes/portals/Estate';
import { DictionaryFlags, generateDictionaryOptions } from '../../cli';
import { generateDictionary as generateImmobilienscout24Dictionary } from '../immobilienscout24_commands/generate-dictionary';

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

const initFieldParse = (
  language?: AvailableTranslations,
  dictionary: Mapping = {}
) => {
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

export const generateDictionaryFlowFactV1 = (
  language?: AvailableTranslations
): Mapping => {
  return generateImmobilienscout24Dictionary(language);
};

export const generateDictionaryFlowFactV2 = async (
  credentials: TokenAuth,
  language?: AvailableTranslations
): Promise<Mapping> => {
  const flowFact = new FlowFactV2(credentials);

  const schemas = await flowFact.fetchSchemas();
  const reducedSchemas = schemas.filter(({ name }) =>
    estateSchemas.includes(name)
  );
  const dictionary = {
    ...estateCommon.fallbacks.en,
    ...estateCommon[language || 'en'],
  };
  const parseFields = initFieldParse(language, dictionary);
  const values = flatten(parseFields(reducedSchemas));
  return Object.assign({}, ...values);
};

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
