import { FlowFactEstateV2 } from './Estate';
import { Estate } from '../../Estate';
import {
  getResultEstate,
  getResultCommon,
  getResultProperties,
  dictionary,
} from './test/helpers';

describe('FlowFact v2  Estate', () => {
  it('should initialize', () => {
    const estate = new FlowFactEstateV2();
    expect(estate).toBeInstanceOf(Estate);
  });

  it('should return common', async () => {
    const estate = new FlowFactEstateV2();

    const result = await estate.init(getResultEstate());
    expect(result).toBeInstanceOf(Estate);
    const common = result.getCommon();
    expect(common).toEqual(getResultCommon());
  });

  it('should return properties', async () => {
    const estate = new FlowFactEstateV2();

    const result = await estate.init(getResultEstate());
    expect(result).toBeInstanceOf(Estate);
    const properties = result.getProperties();
    expect(properties).toEqual(getResultProperties());
  });

  it('should return translated common', async () => {
    const estate = new FlowFactEstateV2();

    const result = await estate.init(getResultEstate());
    expect(result).toBeInstanceOf(Estate);

    const common = result.getTranslatedCommon(dictionary);
    expect(common).toEqual(getResultCommon(true));
  });

  it('should return translated properties', async () => {
    const estate = new FlowFactEstateV2();

    const result = await estate.init(getResultEstate());
    expect(result).toBeInstanceOf(Estate);

    const common = result.getTranslatedProperties(dictionary);
    expect(common).toEqual(getResultProperties(true));
  });
});
