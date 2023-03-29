import { merge } from 'lodash';
import requestPromise, { RequestPromiseOptions } from 'request-promise-native';
import { Logger } from '../../utils';
import { Authorization } from '../Authorization';

export interface FetchOptions {
  detailed?: boolean;
  recursively?: boolean;
  page?: number;
  pageSize?: number;
  body?: Record<string, unknown>;
}

export interface RequestError {
  type: 'error';
  statusCode: number;
  message: string;
  uri: string;
  meta?: any;
}

export abstract class Portal {
  abstract baseURL: string;

  constructor(private authorizer: Authorization) {}

  protected async request(
    uri: string,
    opts?: RequestPromiseOptions,
    meta?: any
  ): Promise<any | RequestError> {
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

    try {
      return await requestPromise(uri, options);
    } catch (error) {
      Logger.error(`ERROR: Fetching ${uri}`);
      return {
        type: 'error',
        message: (error as any).message || error,
        statusCode: (error as any).statusCode || (error as any).code || 400,
        uri,
        meta,
      } as RequestError;
    }
  }

  abstract fetchEstates(options?: FetchOptions): Promise<any[]>;

  abstract fetchEstate(id: string): Promise<any>;
}
