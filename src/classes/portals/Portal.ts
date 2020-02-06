import rp, { RequestPromiseOptions } from 'request-promise-native';
import { merge } from 'lodash';

import { Authorization } from '../Authorization';

export interface FetchOptions {
  detailed?: boolean;
  recursively?: boolean;
  page?: number;
  pageSize?: number;
}

export abstract class Portal {
  abstract baseURL: string;

  constructor(private authorizer: Authorization) {}

  protected async request(uri: string, opts?: RequestPromiseOptions) {
    const method = 'GET';
    const options = merge(
      {
        method,
        headers: {
          ...(await this.authorizer.authorize(uri, opts?.method || method)),
          Accept: 'application/json',
          'Cache-Control': 'no-cache',
        },
        json: true,
      },
      opts
    );

    return rp(uri, options);
  }

  abstract async fetchEstates(options?: FetchOptions): Promise<any[]>;

  abstract async fetchEstate(id: string): Promise<any>;
}
