import is24 from '../../translations';
import { Mapping } from '../../classes/portals/Estate';
import { AvailableTranslations } from '../../types';
import { generateEstatePropertyKeys } from '../generate-dictionary';

const cleanValues = (mapping: Mapping): Mapping =>
  Object.keys(mapping).reduce((red, key) => ({ ...red, [key]: '' }), {});

export const generateDictionary = (
  language?: AvailableTranslations
): Mapping => {
  const result = language ? (is24 as Mapping)[language] : cleanValues(is24.en);
  const excludedKeys = generateEstatePropertyKeys();
  excludedKeys.forEach(key => delete (result as Mapping)[key]);
  return result;
};
