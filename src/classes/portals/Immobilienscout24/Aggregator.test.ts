import { Immobilienscout24 } from './Aggregator';
import { credentials } from './__mocks__/request-promise-native';
import { Aggregator } from '../Aggregator';
import { Estate } from '../Estate';
import en from '../../../translations/en';

describe('Immobilienscout24 Aggregator', () => {
  it('should initialize', () => {
    const aggregator = new Immobilienscout24({
      consumerKey: 'consumerKey',
      consumerSecret: 'consumerSecret',
      oauthToken: 'oauthToken',
      oauthTokenSecret: 'oauthTokenSecret',
    });
    expect(aggregator).toBeInstanceOf(Aggregator);
  });

  it('should fetch aggregated estate', async () => {
    const aggregator = new Immobilienscout24(credentials);

    const result = await aggregator.fetchEstate('315859901');
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
