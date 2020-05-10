import { isObject } from 'lodash';

import { Mapping, Estate } from '../../Estate';
import { BasicAuth } from '../../../Authorization';
import { Portal, FetchOptions } from '../../Portal';
import { FlowFactEstateV1 } from './Estate';
import { Aggregator } from '../../Aggregator';
import { AvailableLanguages } from '../../../../types';
import FlowFactPortalV1 from './Portal';
import { generateDictionary } from '../../Immobilienscout24/Aggregator';

export class FlowFactV1 extends Aggregator {
  protected portal: Portal;
  constructor(credentials: BasicAuth) {
    super();
    this.portal = new FlowFactPortalV1(credentials) as Portal;
  }

  public async fetchEstate(id: string): Promise<Estate> {
    const response = await this.fetchResult(id);
    return new FlowFactEstateV1().init(response);
  }

  public async fetchEstates(options: FetchOptions = {}): Promise<Estate[]> {
    const responses = await this.fetchResults(options);

    return Promise.all(
      responses.map((response) => new FlowFactEstateV1().init(response))
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
