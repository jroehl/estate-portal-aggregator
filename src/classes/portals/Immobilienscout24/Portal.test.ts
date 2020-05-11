import { Portal } from '../Portal';
import { Immobilienscout24Portal } from './Portal';
import {
  getResultError,
  getResultEstate,
  getResultEstates,
  credentials,
} from './__mocks__/request-promise-native';

const ENDPOINT = 'https://immobilienscout24.api/realestate';

describe('Immobilienscout24 Portal', () => {
  beforeAll(() => {
    process.env.IS24_BASE_URL = ENDPOINT;
  });
  describe('instance', () => {
    it('should initialize', () => {
      const portal = new Immobilienscout24Portal(credentials);
      expect(portal).toBeInstanceOf(Portal);
    });

    it('should have base URL', () => {
      const portal = new Immobilienscout24Portal(credentials);
      expect(portal.baseURL).toBeDefined();
    });

    it('should throw error', () => {
      expect(
        () =>
          new Immobilienscout24Portal({
            consumerKey: '',
            consumerSecret: '',
            oauthToken: '',
            oauthTokenSecret: '',
          })
      ).toThrowError(
        'Credential validation for Immobilienscout24 failed - missing property'
      );
    });
  });

  describe('fetchEstate', () => {
    it('should return error', async () => {
      const portal = new Immobilienscout24Portal(credentials);

      const result = await portal.fetchEstate('error');
      expect(result).toEqual({
        type: 'error',
        message: 'Request error',
        statusCode: 400,
        meta: {
          id: 'error',
        },
        uri: `${ENDPOINT}/error`,
      });
    });

    it('should return 404 error', async () => {
      const portal = new Immobilienscout24Portal(credentials);

      const result = await portal.fetchEstate('foo');
      expect(result).toEqual(getResultError());
    });

    it('should return estate', async () => {
      const portal = new Immobilienscout24Portal(credentials);

      const result = await portal.fetchEstate('315859901');

      expect(result).toEqual(getResultEstate());
    });
  });

  describe('fetchEstates', () => {
    it('should fetch multiple estates', async () => {
      const portal = new Immobilienscout24Portal(credentials);

      const result = await portal.fetchEstates();
      expect(result).toEqual(getResultEstates());
    });

    it('should fetch recursively multiple estates', async () => {
      const portal = new Immobilienscout24Portal(credentials);

      const result = await portal.fetchEstates({
        recursively: true,
        pageSize: 2,
      });
      expect(result).toEqual([getResultEstates()[0], getResultEstates()[0]]);
    });

    it('should fetch multiple estates detailed', async () => {
      const portal = new Immobilienscout24Portal(credentials);

      const result = await portal.fetchEstates({ detailed: true });

      expect(result).toEqual([getResultEstate(), getResultError()]);
    });
  });
});
