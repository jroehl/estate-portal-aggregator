import { isObject } from 'lodash';

import { Mapping, Estate } from '../../Estate';
import { BasicAuth } from '../../../Authorization';
import { Portal, FetchOptions } from '../../Portal';
import { FlowFactEstateDetailedV1, FlowFactEstateCommonV1 } from './Estate';
import { Aggregator } from '../../Aggregator';
import { AvailableLanguages } from '../../../../types';
import FlowFactPortalV1 from './Portal';
import { generateDictionary as generateImmobilienscout24Dictionary } from '../../Immobilienscout24/Aggregator';

export class FlowFactV1 extends Aggregator {
  protected portal: Portal;
  constructor(credentials: BasicAuth, public language?: AvailableLanguages) {
    super();
    this.portal = new FlowFactPortalV1(credentials) as Portal;
  }

  public async fetchEstate(id: string): Promise<Estate> {
    const response = await this.fetchResult(id);
    const dictionary = await this.generateDictionary(this.language);
    return new FlowFactEstateDetailedV1(response, dictionary).setValues();
  }

  public async fetchEstates(options: FetchOptions = {}): Promise<Estate[]> {
    const responses = await this.fetchResults(options);
    const FlowFactV1Estate = options.detailed
      ? FlowFactEstateDetailedV1
      : FlowFactEstateCommonV1;

    const dictionary = await this.generateDictionary(this.language);
    return Promise.all(
      responses.map(response =>
        new FlowFactV1Estate(response, dictionary).setValues()
      )
    );
  }

  public async generateDictionary(
    language?: AvailableLanguages
  ): Promise<Mapping> {
    if (this.dictionary && isObject(this.dictionary)) return this.dictionary;
    const result = generateImmobilienscout24Dictionary(language);
    this.dictionary = result;
    return result;
  }
}
