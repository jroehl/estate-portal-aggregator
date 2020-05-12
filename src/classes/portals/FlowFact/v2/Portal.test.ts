import { Portal } from '../../Portal';
import FlowFactPortalV2 from './Portal';
import {
  getResultError,
  getResultEstate,
  getResultEstates,
  credentials,
  getSchemas,
  ENDPOINT,
} from './test/helpers';

describe('FlowFact v2 Portal', () => {
  beforeAll(() => {
    process.env.FLOWFACT_V2_BASE_URL = ENDPOINT;
  });

  describe('instance', () => {
    it('should initialize', () => {
      const portal = new FlowFactPortalV2(credentials);
      expect(portal).toBeInstanceOf(Portal);
    });

    it('should have base URL', () => {
      const portal = new FlowFactPortalV2(credentials);
      expect(portal.baseURL).toBeDefined();
    });

    it('should throw error', () => {
      expect(() => new FlowFactPortalV2({ token: '' })).toThrowError(
        'Credential validation for FlowFact v2 failed - missing property'
      );
    });
  });

  describe('fetchEstate', () => {
    it('should return error', async () => {
      const portal = new FlowFactPortalV2(credentials);

      const result = await portal.fetchEstate('error');
      expect(result).toEqual({
        type: 'error',
        message: 'Request error',
        statusCode: 400,
        meta: {
          id: 'error',
        },
        uri: `${ENDPOINT}/entity-service/stable/entities/error`,
      });
    });

    it('should return 404 error', async () => {
      const portal = new FlowFactPortalV2(credentials);

      const result = await portal.fetchEstate('foo');
      expect(result).toEqual(getResultError());
    });

    it('should return estate', async () => {
      const portal = new FlowFactPortalV2(credentials);

      const resultEstate = getResultEstate();
      const result = await portal.fetchEstate(resultEstate.id);
      expect(result).toEqual(resultEstate);
    });
  });

  describe('fetchEstates', () => {
    it('should fetch multiple estates', async () => {
      const portal = new FlowFactPortalV2(credentials);
      const result = await portal.fetchEstates();
      expect(result).toEqual(getResultEstates());
    });
    it('should fetch recursively multiple estates', async () => {
      const portal = new FlowFactPortalV2(credentials);
      const result = await portal.fetchEstates({
        recursively: true,
        pageSize: 2,
      });
      expect(result).toEqual([getResultEstates()[0], getResultEstates()[0]]);
    });
    it('should fetch multiple estates detailed', async () => {
      const portal = new FlowFactPortalV2(credentials);
      const result = await portal.fetchEstates({ detailed: true });
      expect(result).toEqual([getResultEstate(), getResultError()]);
    });
  });

  describe('fetchSchemas', () => {
    it('should fetch multiple schemas', async () => {
      const portal = new FlowFactPortalV2(credentials);
      const result = await portal.fetchSchemas();
      expect(result).toEqual(getSchemas());
    });
  });
});
