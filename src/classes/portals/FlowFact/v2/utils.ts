import { cloneDeep } from 'lodash';

import FlowFactPortalV2 from './Portal';
import { Mapping } from '../../../../classes/portals/Estate';
import { Logger } from '../../../../utils';

export const enrichResultWithReadableKeys = async (
  flowFact: FlowFactPortalV2,
  result: any | any[]
) => {
  const enricher = new ResultEnricher(flowFact);
  await enricher.setSchemas();
  if (Array.isArray(result))
    return result.map(enricher.enrichResultWithReadableKeys);

  return enricher.enrichResultWithReadableKeys(result);
};

class ResultEnricher {
  private maxTries: number = 10;
  private tries: number = 0;
  private schemas!: Mapping;

  constructor(private flowFact: FlowFactPortalV2) {}

  private getFieldMap = (fields: Mapping) =>
    Object.entries(fields).reduce(
      (red, [key, value]: [string, any]) => ({
        ...red,
        [value.value]: { key, ...value },
      }),
      {} as Mapping
    );

  public setSchemas = async (): Promise<any> => {
    this.tries++;
    try {
      const result = await this.flowFact.fetchSchemas();
      if (!result.length) throw result;
      this.schemas = result.reduce(
        (red, schema) => ({ ...red, [schema.name]: schema }),
        {}
      );
    } catch (error) {
      Logger.warn(
        `ERROR: Fetching schemas, retrying ${this.tries}/${this.maxTries}`
      );
      if (this.tries <= this.maxTries) {
        return this.setSchemas();
      }
      throw error;
    }
  };

  public enrichResultWithReadableKeys = (response: any): any => {
    this.tries = 0;
    const result = cloneDeep(response);
    Object.values(this.schemas).forEach((schema: any) => {
      Object.entries(schema.properties).forEach(
        ([key, { type, fields = {} }]: [string, any]) => {
          const fieldMap = this.getFieldMap(fields);
          if (type === 'LIST' && Array.isArray(result[key]?.values)) {
            result[key].values = result[key].values.map((value: string) =>
              fieldMap[value] !== undefined ? fieldMap[value].key : value
            );
          }
        }
      );
    });

    return result;
  };
}
