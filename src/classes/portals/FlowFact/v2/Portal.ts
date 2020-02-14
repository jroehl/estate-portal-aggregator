import { flatten } from 'lodash';
import requestPromise from 'request-promise-native';

import { Portal, FetchOptions } from '../../Portal';
import {
  Authorization,
  AuthorizationHeader,
  Credentials,
  TokenAuth,
} from '../../../Authorization';

export const estateSchemas = [
  'catering_accommodation_purchase',
  'catering_accommodation_rent',
  'flat_purchase',
  'flat_rent',
  'garage_pitch',
  'garage_pitch_purchase',
  'garage_pitch_rent',
  'house_purchase',
  'houses_rent',
  'investment',
  'land_lease',
  'land_purchase',
  'office_surgery_purchase',
  'office_surgery_rent',
  'other_commercial_estates_purchase',
  'other_commercial_estates_rent',
  'production_halls_purchase',
  'production_halls_rent',
  'shops_commerce_purchase',
  'shops_commerce_rent',
  'temporary_accommodation',
];

class FlowFactV2Authorization extends Authorization {
  protected authorizationHeader?: AuthorizationHeader;
  async authorize(): Promise<AuthorizationHeader> {
    const { token } = this.credentials as TokenAuth;
    if (!this.authorizationHeader) {
      const cognitoToken = await requestPromise(
        'https://api.production.cloudios.flowfact-prod.cloud/admin-token-service/stable/public/adminUser/authenticate',
        {
          method: 'GET',
          headers: {
            token,
          },
        }
      );
      this.authorizationHeader = { cognitoToken };
    }
    return this.authorizationHeader;
  }

  checkCredentials(credentials: Credentials): Credentials {
    const basicAuth = (credentials as unknown) as TokenAuth;
    const isValid = Boolean(basicAuth.token);

    if (!isValid) {
      throw new Error(
        'Credential validation for FlowFact v2 failed - missing property'
      );
    }
    return credentials;
  }
}

export default class FlowFactPortalV2 extends Portal {
  baseURL: string = 'https://api.production.cloudios.flowfact-prod.cloud';

  constructor(credentials: TokenAuth) {
    super(new FlowFactV2Authorization(credentials));
  }

  private async fetchRecursive(
    baseURL: string,
    opts?: requestPromise.RequestPromiseOptions,
    options?: FetchOptions,
    elements: any[] = []
  ): Promise<any[]> {
    const currentPage = options?.page || 1;
    const size = options?.pageSize || 50;
    const uri = `${baseURL}?size=${size}&page=${currentPage}`;

    const res = await this.request(uri, opts);

    if (res.type === 'error') return [...elements, res];

    const { entries, totalCount } = res;

    elements = [...elements, ...entries];
    if (options?.recursively && elements.length < totalCount) {
      return this.fetchRecursive(
        baseURL,
        opts,
        { ...options, page: currentPage + 1 },
        elements
      );
    }

    return elements;
  }

  async fetchEstates(options?: FetchOptions): Promise<any[]> {
    const items = await Promise.all(
      estateSchemas.map(async schemaID => {
        const results = await this.fetchRecursive(
          `${this.baseURL}/search-service/stable/schemas/${schemaID}`,
          {
            method: 'POST',
            body: {
              target: 'ENTITY',
              distinct: true,
            },
          },
          options
        );
        return results;
      })
    );
    const flattened = flatten(items);
    if (!options?.detailed) return flattened;
    return Promise.all(
      flattened.map(async (res: any) => {
        const estateID = res._metadata.id;
        const result = await this.fetchEstate(estateID);
        return result;
      })
    ).then(x => x.filter(Boolean));
  }

  async fetchEstate(id: string): Promise<any> {
    const uri = `${this.baseURL}/entity-service/stable/entities/${id}`;
    return this.request(uri, undefined, { id });
  }

  async fetchSchemas(options?: FetchOptions): Promise<any[]> {
    const uri = `${this.baseURL}/schema-service/stable/v2/schemas/`;
    return this.fetchRecursive(uri, undefined, options);
  }

  async fetchSchema(schemaID: string): Promise<any> {
    const uri = `${this.baseURL}/schema-service/stable/v2/schemas/${schemaID}`;
    return this.request(uri, undefined, { schemaID });
  }
}
