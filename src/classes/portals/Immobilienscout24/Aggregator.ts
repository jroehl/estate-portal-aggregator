import { isObject } from 'lodash';

import { Mapping, Estate } from '../Estate';
import { OAuth } from '../../Authorization';
import { Portal, FetchOptions } from '../Portal';
import { Immobilienscout24Portal } from './Portal';
import {
  Immobilienscout24EstateDetailed,
  Immobilienscout24EstateCommon,
} from './Estate';
import { Aggregator } from '../Aggregator';
import { AvailableLanguages } from '../../../types';
import { generateEstatePropertyKeys } from '../../../lib/generate-dictionary';
import is24 from '../../../translations';

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
  constructor(credentials: OAuth, public language?: AvailableLanguages) {
    super();
    this.portal = new Immobilienscout24Portal(credentials) as Portal;
  }

  public async fetchEstate(id: string): Promise<Estate> {
    const response = await this.fetchResult(id);
    const dictionary = await this.generateDictionary(this.language);
    return new Immobilienscout24EstateDetailed(
      response,
      dictionary
    ).setValues();
  }

  public async fetchEstates(options: FetchOptions = {}): Promise<Estate[]> {
    const responses = await this.fetchResults(options);

    const Immobilienscout24Estate = options.detailed
      ? Immobilienscout24EstateDetailed
      : Immobilienscout24EstateCommon;

    const dictionary = await this.generateDictionary(this.language);
    return Promise.all(
      responses.map(response =>
        new Immobilienscout24Estate(response, dictionary).setValues()
      )
    );
  }

  public async generateDictionary(
    language?: AvailableLanguages
  ): Promise<Mapping> {
    if (this.dictionary && isObject(this.dictionary)) return this.dictionary;
    const result = generateDictionary(language);
    this.dictionary = result;
    return result;
  }
}
