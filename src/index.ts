export { fetchEstate as fetchEstateImmobilienscout24 } from './commands/immobilienscout24_commands/fetch-estate';
export { fetchEstates as fetchEstatesImmobilienscout24 } from './commands/immobilienscout24_commands/fetch-estates';

export {
  fetchEstateV1 as fetchEstateFlowFactV1,
  fetchEstateV2 as fetchEstateFlowFactV2,
} from './commands/flowfact_commands/fetch-estate';

export {
  fetchEstatesV1 as fetchEstatesFlowFactV1,
  fetchEstatesV2 as fetchEstatesFlowFactV2,
} from './commands/flowfact_commands/fetch-estates';

export { generateDictionary as generateDictionaryCommonProperties } from './commands/generate-dictionary';
export { generateDictionary as generateDictionaryImmobilienscout24 } from './commands/immobilienscout24_commands/generate-dictionary';
export {
  generateDictionaryFlowFactV1,
  generateDictionaryFlowFactV2,
} from './commands/flowfact_commands/generate-dictionary';

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
