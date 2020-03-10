import { flatten, isObject, cloneDeep } from 'lodash';

import { Mapping, Estate } from '../../Estate';
import { TokenAuth } from '../../../Authorization';
import { Portal, FetchOptions } from '../../Portal';
import { FlowFactEstateV2 } from './Estate';
import { Aggregator } from '../../Aggregator';
import { AvailableLanguages } from '../../../../types';
import FlowFactPortalV2, { estateSchemas } from './Portal';
import { enrichResultWithReadableKeys } from './utils';
import estateCommon from '../../../../translations';

const safeEstateCommon = cloneDeep(estateCommon);

const initFieldParse = (
  language?: AvailableLanguages,
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
  constructor(credentials: TokenAuth) {
    super();
    this.portal = new FlowFactPortalV2(credentials) as Portal;
  }

  public async fetchEstate(id: string): Promise<Estate> {
    let response = await this.fetchResult(id);
    response = await enrichResultWithReadableKeys(
      this.portal as FlowFactPortalV2,
      response
    );
    return new FlowFactEstateV2().init(response);
  }

  public async fetchEstates(options: FetchOptions = {}): Promise<Estate[]> {
    let responses = await this.fetchResults(options);
    responses = await enrichResultWithReadableKeys(
      this.portal as FlowFactPortalV2,
      responses
    );

    return Promise.all(
      responses.map(response => new FlowFactEstateV2().init(response))
    );
  }

  public async generateDictionary(
    language: AvailableLanguages
  ): Promise<Mapping> {
    const dictionary = this.dictionaries[language];
    if (isObject(dictionary)) return dictionary;
    const schemas = await (this.portal as FlowFactPortalV2).fetchSchemas();
    const reducedSchemas = schemas.filter(({ name }) =>
      estateSchemas.includes(name)
    );
    const parseFields = initFieldParse(language, {
      ...safeEstateCommon.fallbacks.en,
      ...safeEstateCommon[language || 'en'],
    });
    const fields = flatten(parseFields(reducedSchemas));
    const result = Object.assign({}, ...fields);
    this.dictionaries[language] = result;
    return result;
  }
}
