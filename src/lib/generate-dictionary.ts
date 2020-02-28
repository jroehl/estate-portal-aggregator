import estateCommon from '../translations';
import { Mapping } from '../classes/portals/Estate';
import { AvailableLanguages } from '../types';
import { generateEstatePropertyKeys } from './get-keys';

const objectify = (array: string[], mapping: Mapping = {}) =>
  array.reduce((red, key) => {
    const lowerKey = key.toLowerCase();
    return {
      ...red,
      [lowerKey]: mapping[lowerKey] || '',
    };
  }, {});

export const generateDictionary = (language: AvailableLanguages): Mapping => {
  const commonKeys = generateEstatePropertyKeys();
  const mapping = language ? estateCommon[language] : undefined;
  return objectify(commonKeys, mapping);
};
