import { Mapping, Estate } from '../../Estate';
import { BasicAuth } from '../../../Authorization';
import { Portal, FetchOptions } from '../../Portal';
import { FlowFactEstateDetailedV1, FlowFactEstateCommonV1 } from './Estate';
import { Aggregator } from '../../Aggregator';
import { AvailableTranslations } from '../../../../types';
import FlowFactPortalV1 from './Portal';
import { generateDictionary as generateImmobilienscout24Dictionary } from '../../Immobilienscout24/Aggregator';

export class FlowFactV1 extends Aggregator {
  protected portal: Portal;
  constructor(credentials: BasicAuth, private dictionary?: Mapping) {
    super();
    this.portal = new FlowFactPortalV1(credentials) as Portal;
  }

  public async fetchEstate(id: string): Promise<Estate> {
    const response = await this.fetchResult(id);
    return new FlowFactEstateDetailedV1(response, this.dictionary).setValues();
  }

  public async fetchEstates(options: FetchOptions = {}): Promise<Estate[]> {
    const responses = await this.fetchResults(options);
    const FlowFactV1Estate = options.detailed
      ? FlowFactEstateDetailedV1
      : FlowFactEstateCommonV1;

    return Promise.all(
      responses.map(response =>
        new FlowFactV1Estate(response, this.dictionary).setValues()
      )
    );
  }

  public async generateDictionary(
    language?: AvailableTranslations
  ): Promise<Mapping> {
    return generateImmobilienscout24Dictionary(language);
  }
}
