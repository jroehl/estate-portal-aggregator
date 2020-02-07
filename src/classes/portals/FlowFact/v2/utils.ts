import FlowFactV2 from './Portal';
import { get, cloneDeep } from 'lodash';
import { Mapping } from '../../../../classes/portals/Estate';
import { Logger } from '../../../../utils';

export const enrichResultWithReadableKeys = async (
  flowFact: FlowFactV2,
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

  constructor(private flowFact: FlowFactV2) {}

  private getFieldMap = (fields: Mapping) =>
    Object.entries(fields).reduce(
      (red, [key, value]: [string, any]) => ({
        ...red,
        [value.value]: { key: key, ...value },
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
    const schemaID = get(response, '_metadata.schema');
    if (!schemaID) return response;

    const result = cloneDeep(response);
    const schema = this.schemas[schemaID];

    if (!schema)
      throw `Schema <${schemaID}> not found - is the ResultEnricher initialized?`;

    Object.entries(schema.properties).forEach(
      ([key, { type, fields = {} }]: [string, any]) => {
        const fieldMap = this.getFieldMap(fields);
        if (type === 'LIST' && result[key]) {
          result[key].values = result[key].values.map((value: string) =>
            fieldMap[value] ? fieldMap[value].key : value
          );
        }
      }
    );

    return result;
  };
}
