import { Credentials, BasicAuth, TokenAuth } from '../../Authorization';
import FlowFactV1 from './v1';
import FlowFactV2 from './v2';
import { FlowFactCommonV1, FlowFactDetailedV1 } from './v1/Estate';
import { FlowFactCommonV2, FlowFactDetailedV2 } from './v2/Estate';

export type APIVersion = 'v1' | 'v2';

// portal factory for api versions
export class FlowFact {
  constructor(apiVersion: APIVersion, credentials: Credentials) {
    switch (apiVersion) {
      case 'v1':
        return new FlowFactV1(credentials as BasicAuth);
      case 'v2':
        return new FlowFactV2(credentials as TokenAuth);
      default:
        throw new Error('API Version is invalid');
    }
  }
}

// estate factory for api versions
export class FlowFactEstateCommon {
  constructor(apiVersion: APIVersion, response: any) {
    switch (apiVersion) {
      case 'v1':
        return new FlowFactCommonV1(response);
      case 'v2':
        return new FlowFactCommonV2(response);
      default:
        throw new Error('API Version is invalid');
    }
  }
}

// estate factory for api versions
export class FlowFactEstateDetailed {
  constructor(apiVersion: APIVersion, response: any) {
    switch (apiVersion) {
      case 'v1':
        return new FlowFactDetailedV1(response);
      case 'v2':
        return new FlowFactDetailedV2(response);
      default:
        throw new Error('API Version is invalid');
    }
  }
}
