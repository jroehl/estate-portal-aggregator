import { Aggregator } from '../Aggregator';
import { Estate } from '../Estate';
import { Immobilienscout24 } from './Aggregator';
import { credentials, getResultEstate } from './test/helpers';

describe('Immobilienscout24 Aggregator', () => {
  it('should initialize', () => {
    const aggregator = new Immobilienscout24(credentials);
    expect(aggregator).toBeInstanceOf(Aggregator);
  });

  it('should fetch aggregated estate', async () => {
    const aggregator = new Immobilienscout24(credentials);

    const result = await aggregator.fetchEstate(getResultEstate()['@id']);
    expect(result).toBeInstanceOf(Estate);
  });

  it('should fetch aggregated estates', async () => {
    const aggregator = new Immobilienscout24(credentials);

    const result = await aggregator.fetchEstates();
    result.forEach((res) => expect(res).toBeInstanceOf(Estate));
    expect(result).toHaveLength(2);
  });

  it('should fetch get dictionary', async () => {
    const aggregator = new Immobilienscout24(credentials);

    const result = await aggregator.generateDictionary('en');
    expect(result).toBeInstanceOf(Object);
    expect(result).toBeDefined();
  });
});
