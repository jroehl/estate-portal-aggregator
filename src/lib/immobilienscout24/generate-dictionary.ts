import is24 from '../../translations';
import { Mapping } from '../../classes/portals/Estate';
import { AvailableTranslations } from '../../cli';
import { cleanValues } from '../../commands/immobilienscout24_commands/generate-dictionary';
import { generateEstatePropertyKeys } from '../generate-dictionary';

export const generateDictionary = (
  language?: AvailableTranslations
): Mapping => {
  const result = language ? (is24 as Mapping)[language] : cleanValues(is24.en);
  const excludedKeys = generateEstatePropertyKeys();
  excludedKeys.forEach(key => delete (result as Mapping)[key]);
  return result;
};
