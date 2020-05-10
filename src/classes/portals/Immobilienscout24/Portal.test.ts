import { Immobilienscout24Portal } from './Portal';
import { Portal } from '../Portal';
import estate from '../__mocks__/estate.json';
import estates from '../__mocks__/estates.json';
import estatesRecursive from '../__mocks__/estates-recursive.json';
import { cloneDeep } from 'lodash';

describe('Immobilienscout24 Portal', () => {
  describe('instance', () => {
    it('should initialize', () => {
      const portal = new Immobilienscout24Portal({
        consumerKey: 'consumerKey',
        consumerSecret: 'consumerSecret',
        oauthToken: 'oauthToken',
        oauthTokenSecret: 'oauthTokenSecret',
      });
      expect(portal).toBeInstanceOf(Portal);
    });

    it('should have base URL', () => {
      const portal = new Immobilienscout24Portal({
        consumerKey: 'consumerKey',
        consumerSecret: 'consumerSecret',
        oauthToken: 'oauthToken',
        oauthTokenSecret: 'oauthTokenSecret',
      });
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
      const portal = new Immobilienscout24Portal({
        consumerKey: 'consumerKey',
        consumerSecret: 'consumerSecret',
        oauthToken: 'oauthToken',
        oauthTokenSecret: 'oauthTokenSecret',
      });

      const result = await portal.fetchEstate('error');
      expect(result).toEqual({
        type: 'error',
        message: 'Request error',
        statusCode: 400,
        meta: {
          id: 'error',
        },
        uri:
          'https://rest.sandbox-immobilienscout24.de/restapi/api/offer/v1.0/user/me/realestate/error',
      });
    });

    it('should return 404 error', async () => {
      const portal = new Immobilienscout24Portal({
        consumerKey: 'consumerKey',
        consumerSecret: 'consumerSecret',
        oauthToken: 'oauthToken',
        oauthTokenSecret: 'oauthTokenSecret',
      });

      const result = await portal.fetchEstate('foo');
      expect(result).toEqual({
        type: 'error',
        statusCode: 404,
        message: 'NotFound',
      });
    });

    it('should return estate', async () => {
      const type = 'realestates.apartmentBuy';
      const resultEstate = cloneDeep(estate[type]);
      const portal = new Immobilienscout24Portal({
        consumerKey: 'consumerKey',
        consumerSecret: 'consumerSecret',
        oauthToken: 'oauthToken',
        oauthTokenSecret: 'oauthTokenSecret',
      });

      const result = await portal.fetchEstate('315859901');

      resultEstate.attachments = [{ attachment: 'exists' }];
      resultEstate.type = type;
      expect(result).toEqual(resultEstate);
    });
  });

  describe('fetchEstates', () => {
    it('should fetch multiple estates', async () => {
      const resultEstates = cloneDeep(estates);
      const portal = new Immobilienscout24Portal({
        consumerKey: 'consumerKey',
        consumerSecret: 'consumerSecret',
        oauthToken: 'oauthToken',
        oauthTokenSecret: 'oauthTokenSecret',
      });

      const result = await portal.fetchEstates();
      expect(result).toEqual(
        resultEstates['realestates.realEstates'].realEstateList
          .realEstateElement
      );
    });

    it('should fetch recursively multiple estates', async () => {
      const resultEstates = cloneDeep(estatesRecursive);
      const portal = new Immobilienscout24Portal({
        consumerKey: 'consumerKey',
        consumerSecret: 'consumerSecret',
        oauthToken: 'oauthToken',
        oauthTokenSecret: 'oauthTokenSecret',
      });

      const result = await portal.fetchEstates({
        recursively: true,
        pageSize: 2,
      });
      expect(result).toEqual([
        resultEstates['realestates.realEstates'].realEstateList
          .realEstateElement,
        resultEstates['realestates.realEstates'].realEstateList
          .realEstateElement,
      ]);
    });

    it('should fetch multiple estates detailed', async () => {
      const type = 'realestates.apartmentBuy';
      const resultEstate = cloneDeep(estate[type]);
      const portal = new Immobilienscout24Portal({
        consumerKey: 'consumerKey',
        consumerSecret: 'consumerSecret',
        oauthToken: 'oauthToken',
        oauthTokenSecret: 'oauthTokenSecret',
      });

      const result = await portal.fetchEstates({ detailed: true });
      resultEstate.attachments = [{ attachment: 'exists' }];
      resultEstate.type = type;

      expect(result).toEqual([
        resultEstate,
        { type: 'error', statusCode: 404, message: 'NotFound' },
      ]);
    });
  });
});
