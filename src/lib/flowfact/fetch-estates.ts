import {
  FlowFactEstateV1,
  FlowFactEstateV2,
  FlowFactEstateDetailedV1,
  FlowFactEstateCommonV1,
  FlowFactEstateDetailedV2,
  FlowFactEstateCommonV2,
} from '../../classes/portals/FlowFact';
import { TokenAuth, BasicAuth } from '../../classes/Authorization';
import { loadDictionary } from '../../utils/cli-tools';
import { FetchMultipleOptions } from '../../cli';
import FlowFactPortalV2 from '../../classes/portals/FlowFact/v2/Portal';
import { enrichResultWithReadableKeys } from '../../classes/portals/FlowFact/v2/utils';
import FlowFactPortalV1 from '../../classes/portals/FlowFact/v1/Portal';

export const fetchEstatesV1 = async (
  credentials: BasicAuth,
  options: FetchMultipleOptions = {
    normalizedResult: true,
    detailedResult: true,
  }
): Promise<FlowFactEstateV1[]> => {
  const flowFact = new FlowFactPortalV1(credentials);
  let results = await flowFact.fetchEstates({
    recursively: options.recursively,
    page: options.page,
    pageSize: options.pageSize,
    detailed: options.detailedResult,
  });
  if (options.normalizedResult) {
    const dictionary = loadDictionary(options.dictionaryPath);
    const EstateV1 = options.detailedResult
      ? FlowFactEstateDetailedV1
      : FlowFactEstateCommonV1;
    results = await Promise.all(
      results.map(
        async result => await new EstateV1(result, dictionary).setValues()
      )
    );
  }
  return results;
};

export const fetchEstatesV2 = async (
  credentials: TokenAuth,
  options: FetchMultipleOptions = {
    normalizedResult: true,
    detailedResult: true,
  }
): Promise<FlowFactEstateV2[]> => {
  const flowFact = new FlowFactPortalV2(credentials);
  let results = await flowFact.fetchEstates({
    recursively: options.recursively,
    page: options.page,
    pageSize: options.pageSize,
    detailed: options.detailedResult,
  });
  if (options.normalizedResult) {
    results = await enrichResultWithReadableKeys(flowFact, results);
    const dictionary = loadDictionary(options.dictionaryPath);
    const EstateV2 = options.detailedResult
      ? FlowFactEstateDetailedV2
      : FlowFactEstateCommonV2;
    results = await Promise.all(
      results.map(
        async result => await new EstateV2(result, dictionary).setValues()
      )
    );
  }
  return results;
};
