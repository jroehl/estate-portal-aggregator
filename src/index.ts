export { fetchEstate as fetchEstateImmobilienscout24 } from './lib/immobilienscout24/fetch-estate';
export { fetchEstates as fetchEstatesImmobilienscout24 } from './lib/immobilienscout24/fetch-estates';

export {
  fetchEstateV1 as fetchEstateFlowFactV1,
  fetchEstateV2 as fetchEstateFlowFactV2,
} from './lib/flowfact/fetch-estate';

export {
  fetchEstatesV1 as fetchEstatesFlowFactV1,
  fetchEstatesV2 as fetchEstatesFlowFactV2,
} from './lib/flowfact/fetch-estates';

export { generateDictionary as generateDictionaryCommonProperties } from './lib/generate-dictionary';
export { generateDictionary as generateDictionaryImmobilienscout24 } from './lib/immobilienscout24/generate-dictionary';
export {
  generateDictionaryFlowFactV1,
  generateDictionaryFlowFactV2,
} from './lib/flowfact/generate-dictionary';

export {
  FlowFact,
  FlowFactEstateCommon,
  FlowFactEstateDetailed,
} from './classes/portals/FlowFact';

export {
  Immobilienscout24,
  Immobilienscout24EstateCommon,
  Immobilienscout24EstateDetailed,
} from './classes/portals/Immobilienscout24/Portal';
