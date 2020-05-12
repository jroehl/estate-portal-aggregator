import routeFlowFactV2 from '../portals/FlowFact/v2/test/helpers';
import routeImmobilienscout24 from '../portals/Immobilienscout24/test/helpers';

export default async (uri: string, options: any) => {
  if (uri.includes('immobilienscout24')) {
    return routeImmobilienscout24(uri, options);
  }
  if (uri.includes('flowfact-v2')) {
    return routeFlowFactV2(uri, options);
  }
  if (uri.includes('authenticate')) {
    return 'cognitoToken';
  }

  throw new Error(`"${uri}" not set up in mocked routing`);
};
