import {
  Immobilienscout24Portal,
  Immobilienscout24EstateCommon,
  Immobilienscout24EstateDetailed,
} from '../../classes/portals/Immobilienscout24/Portal';
import { OAuth } from '../../classes/Authorization';
import { loadDictionary } from '../../utils/cli-tools';
import { FetchSingleOptions } from '../../types';
import { Immobilienscout24Estate } from '../../classes/portals/Immobilienscout24/Estate';

export const fetchEstate = async (
  id: string,
  credentials: OAuth,
  options: FetchSingleOptions = { normalizedResult: true, detailedResult: true }
): Promise<Immobilienscout24Estate> => {
  const is24 = new Immobilienscout24Portal(credentials);
  let result = await is24.fetchEstate(id);
  if (options.normalizedResult) {
    const dictionary = loadDictionary(options.dictionaryPath);
    const Estate = options.detailedResult
      ? Immobilienscout24EstateDetailed
      : Immobilienscout24EstateCommon;
    result = await new Estate(result, dictionary).setValues();
  }
  return result;
};
