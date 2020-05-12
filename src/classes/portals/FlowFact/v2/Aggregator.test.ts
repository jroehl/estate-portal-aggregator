import { FlowFactV2 } from './Aggregator';
import { credentials, getResultEstate, ENDPOINT } from './test/helpers';
import { Aggregator } from '../../Aggregator';
import { Estate } from '../../Estate';

describe('FlowFactV2 Aggregator', () => {
  beforeAll(() => {
    process.env.FLOWFACT_V2_BASE_URL = ENDPOINT;
  });

  it('should initialize', () => {
    const aggregator = new FlowFactV2(credentials);
    expect(aggregator).toBeInstanceOf(Aggregator);
  });

  it('should fetch aggregated estate', async () => {
    const aggregator = new FlowFactV2(credentials);

    const result = await aggregator.fetchEstate(getResultEstate().id);
    expect(result).toBeInstanceOf(Estate);
  });

  it('should fetch aggregated estates', async () => {
    const aggregator = new FlowFactV2(credentials);

    const result = await aggregator.fetchEstates();
    result.forEach((res) => expect(res).toBeInstanceOf(Estate));
    expect(result).toHaveLength(2);
  });

  it('should fetch get dictionary', async () => {
    const aggregator = new FlowFactV2(credentials);

    const result = await aggregator.generateDictionary('en');
    expect(result).toBeInstanceOf(Object);
    expect(result).toBeDefined();
  });
});
