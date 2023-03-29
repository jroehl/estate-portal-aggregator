import requestPromise from 'request-promise-native';

import {
  Authorization,
  AuthorizationHeader,
  Credentials,
  TokenAuth
} from '../../../Authorization';
import { FetchOptions, Portal } from '../../Portal';

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
    const basicAuth = credentials as unknown as TokenAuth;
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
  baseURL: string =
    process.env.FLOWFACT_V2_BASE_URL ||
    'https://api.production.cloudios.flowfact-prod.cloud';

  constructor(credentials: TokenAuth) {
    super(new FlowFactV2Authorization(credentials));
  }

  private async fetchRecursive(
    baseURL: string,
    opts?: requestPromise.RequestPromiseOptions,
    fetchOptions?: FetchOptions,
    elements: any[] = []
  ): Promise<any[]> {
    const currentPage = fetchOptions?.page || 1;
    const size = fetchOptions?.pageSize || 50;
    const uri = `${baseURL}?size=${size}&page=${currentPage}`;

    const res = await this.request(uri, opts);

    if (res.type === 'error') return [...elements, res];

    const { entries = [], totalCount } = res;

    const sanitizedEntries = Array.isArray(entries) ? entries : [entries];

    elements = [...elements, ...sanitizedEntries];
    if (fetchOptions?.recursively && elements.length < totalCount) {
      return this.fetchRecursive(
        baseURL,
        opts,
        { ...fetchOptions, page: currentPage + 1 },
        elements
      );
    }

    return elements;
  }

  async fetchEstates(options?: FetchOptions): Promise<any[]> {
    const estates = await this.fetchRecursive(
      `${this.baseURL}/search-service/stable/schemas/estates`,
      {
        method: 'POST',
        body: {
          target: 'ENTITY',
          distinct: true,
          ...(options?.body || {}),
        },
      },
      options
    );
    if (!options?.detailed) return estates;

    return Promise.all(
      estates.map(async (res: any) => {
        const estateID = res._metadata.id;
        return await this.fetchEstate(estateID);
      })
    ).then((x) => x.filter(Boolean));
  }

  async fetchEstate(id: string): Promise<any> {
    const uri = `${this.baseURL}/entity-service/stable/entities/${id}`;
    return this.request(uri, undefined, { id });
  }

  async fetchSchemas(
    options?: FetchOptions,
    groups?: string[]
  ): Promise<any[]> {
    const uri = `${this.baseURL}/schema-service/stable/v2/schemas/`;
    const res = await this.fetchRecursive(uri, undefined, options);
    if (!groups?.length) return res;
    return res.filter((schema: any) =>
      schema.groups?.some((group: string) => groups.includes(group))
    );
  }
}
