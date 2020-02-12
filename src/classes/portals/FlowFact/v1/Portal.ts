import { Portal, FetchOptions } from '../../Portal';
import {
  BasicAuth,
  Authorization,
  AuthorizationHeader,
  Credentials,
} from '../../../Authorization';

class FlowFactV1Authorization extends Authorization {
  protected authorizationHeader?: AuthorizationHeader;
  async authorize(): Promise<AuthorizationHeader> {
    if (!this.authorizationHeader) {
      const { customer, user, password } = this.credentials as BasicAuth;
      const base64Auth = Buffer.from(
        `${customer}/${user}:${password}`
      ).toString('base64');

      this.authorizationHeader = {
        Authorization: `Basic ${base64Auth}`,
      };
    }
    return this.authorizationHeader;
  }

  checkCredentials(credentials: Credentials): Credentials {
    const basicAuth = (credentials as unknown) as BasicAuth;
    const isValid = Boolean(
      basicAuth.customer && basicAuth.user && basicAuth.password
    );

    if (!isValid) {
      throw 'Credential validation for FlowFact v1 failed - missing property';
    }
    return credentials;
  }
}

export default class FlowFactV1 extends Portal {
  baseURL: string;

  constructor(credentials: BasicAuth) {
    super(new FlowFactV1Authorization(credentials));
    this.baseURL = `https://flowfactapi.flowfact.com/com.flowfact.server/api/rest/v1.0/customers/${credentials.customer}/users/${credentials.user}/estates`;
  }

  private async fetchRecursive(
    baseURL: string,
    options?: FetchOptions,
    elements: any[] = []
  ): Promise<any[]> {
    const currentPage = options?.page || 1;
    const size = options?.pageSize || 50;
    const uri = `${this.baseURL}?size=${size}&page=${currentPage}`;

    const res = await this.request(uri);

    if (res.type === 'error') return [...elements, res];

    const {
      value: { estateshort, total },
    } = res;

    elements = [...elements, ...estateshort];
    if (options?.recursively && elements.length < total) {
      return this.fetchRecursive(
        baseURL,
        { ...options, page: currentPage + 1 },
        elements
      );
    }

    return elements;
  }

  async fetchEstates(options?: FetchOptions): Promise<any[]> {
    const result = await this.fetchRecursive(this.baseURL, options);
    if (!options?.detailed) return result;
    return Promise.all(
      result.map(async (res: any) => {
        const estateID = res.id || res.value.id;
        return this.fetchEstate(estateID);
      })
    );
  }

  async fetchEstate(id: string): Promise<any> {
    const uri = `${this.baseURL}/${id}`;
    return this.request(uri, undefined, { id });
  }
}
