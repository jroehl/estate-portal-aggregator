import { isObject, isUndefined } from 'lodash';

import { Mapping, Estate } from '../Estate';
import { OAuth } from '../../Authorization';
import { Portal, FetchOptions } from '../Portal';
import { Immobilienscout24Portal } from './Portal';
import { Immobilienscout24Estate } from './Estate';
import { Aggregator } from '../Aggregator';
import { AvailableLanguages } from '../../../types';
import is24 from '../../../translations';
import { generateEstatePropertyKeys } from '../../../lib/get-keys';

const cleanValues = (mapping: Mapping): Mapping =>
  Object.keys(mapping).reduce((red, key) => ({ ...red, [key]: '' }), {});

export const generateDictionary = (language?: AvailableLanguages): Mapping => {
  const result = language ? (is24 as Mapping)[language] : cleanValues(is24.en);
  const excludedKeys = generateEstatePropertyKeys();
  excludedKeys.forEach(key => delete (result as Mapping)[key]);
  return result;
};

export class Immobilienscout24 extends Aggregator {
  protected portal: Portal;
  constructor(credentials: OAuth) {
    super();
    this.portal = new Immobilienscout24Portal(credentials) as Portal;
  }

  public async fetchEstate(id: string): Promise<Estate> {
    const response = await this.fetchResult(id);
    return new Immobilienscout24Estate().init(response);
  }

  public async fetchEstates(options: FetchOptions = {}): Promise<Estate[]> {
    const responses = await this.fetchResults(options);

    return Promise.all(
      responses.map(response => new Immobilienscout24Estate().init(response))
    );
  }

  public async generateDictionary(
    language: AvailableLanguages
  ): Promise<Mapping> {
    const dictionary = this.dictionaries[language];
    if (isObject(dictionary)) return dictionary;
    const result = generateDictionary(language);
    this.dictionaries[language] = result;
    return result;
  }
}
