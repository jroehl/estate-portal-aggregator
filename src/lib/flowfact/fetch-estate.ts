import {
  FlowFactEstateCommonV1,
  FlowFactEstateDetailedV1,
  FlowFactEstateCommonV2,
  FlowFactEstateDetailedV2,
  FlowFactEstateV1,
  FlowFactEstateV2,
} from '../../classes/portals/FlowFact';
import { BasicAuth, TokenAuth } from '../../classes/Authorization';
import { loadDictionary } from '../../utils/cli-tools';
import { FetchSingleOptions } from '../../cli';
import FlowFactPortalV2 from '../../classes/portals/FlowFact/v2/Portal';
import { enrichResultWithReadableKeys } from '../../classes/portals/FlowFact/v2/utils';
import FlowFactPortalV1 from '../../classes/portals/FlowFact/v1/Portal';

export const fetchEstateV1 = async (
  id: string,
  credentials: BasicAuth,
  options: FetchSingleOptions = { normalizedResult: true, detailedResult: true }
): Promise<FlowFactEstateV1> => {
  const flowFact = new FlowFactPortalV1(credentials);
  let result = await flowFact.fetchEstate(id);
  if (options.normalizedResult) {
    const dictionary = loadDictionary(options.dictionaryPath);
    const EstateV1 = options.detailedResult
      ? FlowFactEstateDetailedV1
      : FlowFactEstateCommonV1;
    result = await new EstateV1(result, dictionary).setValues();
  }
  return result;
};

export const fetchEstateV2 = async (
  id: string,
  credentials: TokenAuth,
  options: FetchSingleOptions = { normalizedResult: true, detailedResult: true }
): Promise<FlowFactEstateV2> => {
  const flowFact = new FlowFactPortalV2(credentials);
  let result = await flowFact.fetchEstate(id);
  if (options.normalizedResult) {
    result = await enrichResultWithReadableKeys(flowFact, result);
    const dictionary = loadDictionary(options.dictionaryPath);
    const EstateV2 = options.detailedResult
      ? FlowFactEstateDetailedV2
      : FlowFactEstateCommonV2;
    result = await new EstateV2(result, dictionary).setValues();
  }
  return result;
};
