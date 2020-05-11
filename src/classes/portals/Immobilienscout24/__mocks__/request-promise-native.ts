import { cloneDeep, assign } from 'lodash';
import estates from './estates.json';
import estatesRecursive from './estates-recursive.json';
import estate from './estate.json';
import attachment from './attachment.json';

export default async (uri: string, options: any) => {
  expect(options.headers.Authorization).toBeDefined();
  expect(options.headers['Cache-Control']).toBe('no-cache');
  expect(options.headers.Accept).toBe('application/json');

  if (uri.includes('error')) throw new Error('Request error');
  if (uri.includes('pagesize=2')) return estatesRecursive;
  if (uri.includes('realestate?')) return estates;

  if (uri.includes('attachment')) return attachment;

  const id = estate['realestates.apartmentBuy']['@id'];
  if (uri.includes(id)) return estate;
  return { type: 'error', statusCode: 404, message: 'NotFound' };
};

export const dictionary: object = {
  no_information: 'No information',
  true: 'Yes',
};

export const credentials = {
  consumerKey: 'consumerKey',
  consumerSecret: 'consumerSecret',
  oauthToken: 'oauthToken',
  oauthTokenSecret: 'oauthTokenSecret',
};

const translate = (obj: object): any => {
  return Object.entries(obj).reduce(
    (acc, [key, value]: string[]) => ({
      ...acc,
      [key]:
        value && value.toLowerCase
          ? (dictionary as any)[value.toLowerCase()] || value
          : value,
    }),
    {}
  );
};

export const getResultEstate = (): any => {
  const type = 'realestates.apartmentBuy';
  const resultEstate: any = cloneDeep(estate[type]);
  resultEstate.attachments = [{ attachment: 'exists' }];
  resultEstate.type = type;
  return resultEstate;
};

export const getResultEstates = (): any => {
  const resultEstates = cloneDeep(estates);
  return resultEstates['realestates.realEstates'].realEstateList
    .realEstateElement;
};

export const getResultError = (): any => {
  return {
    type: 'error',
    statusCode: 404,
    message: 'NotFound',
  };
};

export const getResultCommon = (translated: boolean = false): any => {
  const common = {
    active: false,
    address: {
      city: 'Heuersdorf',
      postcode: '04564',
      country: undefined,
      street: 'Heuersdorfer Str 26',
    },
    archived: false,
    estateType: 'NO_INFORMATION',
    marketingType: 'PURCHASE',
    createdAt: 1589126707846,
    externalID: '315859901',
    internalID: '315859901',
    livingSpace: 79430699.05,
    numberOfRooms: 128.23,
    price: {
      value: 6105880.63,
      currency: 'EUR',
      priceIntervalType: undefined,
    },
    title:
      'RestAPI - Immobilienscout24 Testobjekt! +++BITTE+++ NICHT kontaktieren - Wohnung Kauf',
    previewImage: { title: undefined, url: '' },
    updatedAt: undefined,
  };

  if (translated) return translate(common);
  return common;
};

export const getResultProperties = (translated: boolean = false): any => {
  const properties = {
    ...getResultCommon(),
    attachments: [{ title: undefined, url: '' }],
    attic: undefined,
    balcony: false,
    buildingEnergyRatingType: undefined,
    cellar: false,
    condition: 'NO_INFORMATION',
    constructionPhase: undefined,
    constructionYear: undefined,
    courtage: 'true',
    descriptionNote: undefined,
    energyCertificateAvailability: undefined,
    energyConsumptionContainsWarmWater: false,
    energyPerformanceCertificate: undefined,
    floor: undefined,
    freeFrom: undefined,
    furnishingNote: undefined,
    garden: false,
    guestBathroom: undefined,
    guestToilet: false,
    handicappedAccessible: false,
    heatingType: undefined,
    interiorQuality: undefined,
    lastRefurbishment: undefined,
    listed: false,
    locationNote: undefined,
    lodgerFlat: undefined,
    numberOfApartments: undefined,
    numberOfBathRooms: undefined,
    numberOfBedRooms: undefined,
    numberOfCommercialUnits: undefined,
    numberOfFloors: undefined,
    numberOfParkingSpaces: undefined,
    otherNote: undefined,
    parkingSpacePrice: undefined,
    parkingSpaceType: undefined,
    patio: undefined,
    plotArea: undefined,
    residentialUnits: undefined,
    summerResidencePractical: false,
    usableFloorSpace: undefined,
  };
  if (translated) return translate(properties);
  return properties;
};
