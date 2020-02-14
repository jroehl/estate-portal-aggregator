import { Credentials, BasicAuth, TokenAuth } from '../../Authorization';
import FlowFactV1 from './v1/Portal';
import FlowFactV2 from './v2/Portal';
import { FlowFactEstateCommonV1, FlowFactEstateDetailedV1 } from './v1/Estate';
import { FlowFactEstateCommonV2, FlowFactEstateDetailedV2 } from './v2/Estate';
import { Mapping } from '../Estate';

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

export type FlowFactEstateV1 =
  | FlowFactEstateCommonV1
  | FlowFactEstateDetailedV1;
export type FlowFactEstateV2 =
  | FlowFactEstateCommonV2
  | FlowFactEstateDetailedV2;

// estate factory for api versions
export class FlowFactEstateCommon {
  constructor(apiVersion: APIVersion, response: Mapping, dictionary?: Mapping) {
    switch (apiVersion) {
      case 'v1':
        return new FlowFactEstateCommonV1(response, dictionary);
      case 'v2':
        return new FlowFactEstateCommonV2(response, dictionary);
      default:
        throw new Error('API Version is invalid');
    }
  }
}

// estate factory for api versions
export class FlowFactEstateDetailed {
  constructor(apiVersion: APIVersion, response: Mapping, dictionary?: Mapping) {
    switch (apiVersion) {
      case 'v1':
        return new FlowFactEstateDetailedV1(response, dictionary);
      case 'v2':
        return new FlowFactEstateDetailedV2(response, dictionary);
      default:
        throw new Error('API Version is invalid');
    }
  }
}

export {
  FlowFactEstateCommonV1,
  FlowFactEstateDetailedV1,
  FlowFactEstateCommonV2,
  FlowFactEstateDetailedV2,
};
