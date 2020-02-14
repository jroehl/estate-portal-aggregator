import { flatten } from 'lodash';
import { AvailableTranslations } from '../../types';
import estateCommon from '../../translations';
import { TokenAuth } from '../../classes/Authorization';
import FlowFactPortalV2, {
  estateSchemas,
} from '../../classes/portals/FlowFact/v2/Portal';
import { Mapping } from '../../classes/portals/Estate';
import { generateDictionary as generateImmobilienscout24Dictionary } from '../immobilienscout24/generate-dictionary';

export const generateDictionaryFlowFactV1 = (
  language?: AvailableTranslations
): Mapping => {
  return generateImmobilienscout24Dictionary(language);
};

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

export const generateDictionaryFlowFactV2 = async (
  credentials: TokenAuth,
  language?: AvailableTranslations
): Promise<Mapping> => {
  const flowFact = new FlowFactPortalV2(credentials);
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
