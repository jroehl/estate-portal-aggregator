import {
  Immobilienscout24Portal,
  Immobilienscout24EstateCommon,
  Immobilienscout24EstateDetailed,
} from '../../classes/portals/Immobilienscout24/Portal';
import { OAuth } from '../../classes/Authorization';
import { loadDictionary } from '../../utils/cli-tools';
import { FetchMultipleOptions } from '../../types';
import { Immobilienscout24Estate } from '../../classes/portals/Immobilienscout24/Estate';

export const fetchEstates = async (
  credentials: OAuth,
  options: FetchMultipleOptions = {
    normalizedResult: true,
    detailedResult: true,
  }
): Promise<Immobilienscout24Estate[]> => {
  const is24 = new Immobilienscout24Portal(credentials);
  let results = await is24.fetchEstates({
    recursively: options.recursively,
    page: options.page,
    pageSize: options.pageSize,
    detailed: options.detailedResult,
  });
  if (options.normalizedResult) {
    const dictionary = loadDictionary(options.dictionaryPath);
    const Estate = options.detailedResult
      ? Immobilienscout24EstateDetailed
      : Immobilienscout24EstateCommon;
    results = await Promise.all(
      results.map(
        async result => await new Estate(result, dictionary).setValues()
      )
    );
  }
  return results;
};
