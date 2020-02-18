import { flatten } from 'lodash';

import { Mapping, Estate } from '../../Estate';
import { TokenAuth } from '../../../Authorization';
import { Portal, FetchOptions } from '../../Portal';
import { FlowFactEstateDetailedV2, FlowFactEstateCommonV2 } from './Estate';
import { Aggregator } from '../../Aggregator';
import { AvailableTranslations } from '../../../../types';
import FlowFactPortalV2, { estateSchemas } from './Portal';
import { enrichResultWithReadableKeys } from './utils';
import estateCommon from '../../../../translations';

const initFieldParse = (
  language?: AvailableTranslations,
  dictionary: Mapping = {}
) => {
  const parse = (props: Mapping = {}): Mapping[] => {
    return Object.entries(props).map(
      ([key, { name, captions, fields, properties }]: [string, any]) => {
        const lowerKey = (name || key).toLowerCase();
        return flatten([
          {
            [lowerKey]: language
              ? captions[language] || dictionary[lowerKey] || ''
              : '',
          },
          ...parse(properties || fields),
        ]);
      }
    );
  };

  return parse;
};

export class FlowFactV2 extends Aggregator {
  protected portal: Portal;
  constructor(credentials: TokenAuth, private dictionary?: Mapping) {
    super();
    this.portal = new FlowFactPortalV2(credentials) as Portal;
  }

  public async fetchEstate(id: string): Promise<Estate> {
    let response = await this.fetchResult(id);
    response = await enrichResultWithReadableKeys(
      this.portal as FlowFactPortalV2,
      response
    );
    return new FlowFactEstateDetailedV2(response, this.dictionary).setValues();
  }

  public async fetchEstates(options: FetchOptions = {}): Promise<Estate[]> {
    let responses = await this.fetchResults(options);
    responses = await enrichResultWithReadableKeys(
      this.portal as FlowFactPortalV2,
      responses
    );

    const FlowFactV2Estate = options.detailed
      ? FlowFactEstateDetailedV2
      : FlowFactEstateCommonV2;

    return Promise.all(
      responses.map(response =>
        new FlowFactV2Estate(response, this.dictionary).setValues()
      )
    );
  }

  public async generateDictionary(
    language?: AvailableTranslations
  ): Promise<Mapping> {
    const schemas = await (this.portal as FlowFactPortalV2).fetchSchemas();
    const reducedSchemas = schemas.filter(({ name }) =>
      estateSchemas.includes(name)
    );
    const dictionary = {
      ...estateCommon.fallbacks.en,
      ...estateCommon[language || 'en'],
    };
    const parseFields = initFieldParse(language, dictionary);
    const result = flatten(parseFields(reducedSchemas));
    return Object.assign({}, ...result);
  }
}
