import rp from 'request-promise-native';
import { flatten } from 'lodash';

import { Portal, FetchOptions } from '../../Portal';
import {
  Authorization,
  AuthorizationHeader,
  Credentials,
  TokenAuth,
} from '../../../Authorization';
import { Logger } from '../../../../utils';

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
    if (!this.authorizationHeader) {
      const cognitoToken = await rp(
        'https://api.production.cloudios.flowfact-prod.cloud/admin-token-service/stable/public/adminUser/authenticate',
        {
          method: 'GET',
          headers: {
            token: '31a4a86e-24f1-4a3f-a3a3-26c0f98f5c91',
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
      throw 'Credential validation for FlowFact v2 failed - missing property';
    }
    return credentials;
  }
}

export default class FlowFactV2 extends Portal {
  baseURL: string = 'https://api.production.cloudios.flowfact-prod.cloud';

  constructor(credentials: TokenAuth) {
    super(new FlowFactV2Authorization(credentials));
  }

  private async _fetchEstates(
    schemaID: string,
    options?: FetchOptions,
    elements: any[] = []
  ): Promise<any[]> {
    const currentPage = options?.page || 1;
    const size = options?.pageSize || 50;
    const uri = `${this.baseURL}/search-service/stable/schemas/${schemaID}?size=${size}&page=${currentPage}`;

    const res = await this.request(uri, {
      method: 'POST',
      body: {
        target: 'ENTITY',
        distinct: true,
      },
    });

    const { entries, totalCount } = res;

    elements = [...elements, ...entries];
    if (options?.recursively && elements.length < totalCount) {
      return this._fetchEstates(
        schemaID,
        { ...options, page: currentPage + 1 },
        elements
      );
    }

    return elements;
  }

  async fetchEstates(options?: FetchOptions): Promise<any[]> {
    const items = await Promise.all(
      estateSchemas.map(async schemaID => {
        const results = await this._fetchEstates(schemaID, options);
        return results.map(result => ({ type: schemaID, ...result }));
      })
    );
    const flattened = flatten(items);
    if (!options?.detailed) return flattened;
    return Promise.all(
      flattened.map(async (res: any) => {
        const estateID = res._metadata.id;
        const result = await this.fetchEstate(estateID);
        return { type: res.type, ...result };
      })
    ).then(items => items.filter(Boolean));
  }

  async fetchEstate(id: string): Promise<any> {
    const uri = `${this.baseURL}/entity-service/stable/entities/${id}`;
    return this.request(uri, undefined, { id });
  }
}
