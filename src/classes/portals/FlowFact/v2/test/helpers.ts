import { cloneDeep } from 'lodash';
import estates from './estates.json';
import estatesRecursive from './estates-recursive.json';
import estate from './estate.json';
import schemas from './schemas.json';

export const ENDPOINT = 'https://flowfact-v2.api';

export default (uri: string, options: any) => {
  if (uri.includes('authenticate')) return 'cognitoToken';
  if (uri.includes('error')) throw new Error('Request error');

  if (uri.includes('schemas/?')) {
    return schemas;
  }

  if (uri.includes('schemas')) {
    if (options.method === 'POST' && uri.includes('flat_rent')) {
      if (uri.includes('size=2')) return estatesRecursive;
      return estates;
    }
    return {};
  }

  if (uri.includes(estate.id)) return estate;

  return { type: 'error', statusCode: 404, message: 'NotFound' };
};

export const dictionary: object = {
  no_information: 'No information',
  true: 'Yes',
};

export const credentials = {
  token: 'token',
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
  const resultEstate: any = cloneDeep(estate);
  return resultEstate;
};

export const getResultEstates = (): any => {
  const resultEstates = cloneDeep(estates);
  return resultEstates.entries;
};

export const getResultError = (): any => {
  return {
    type: 'error',
    statusCode: 404,
    message: 'NotFound',
  };
};

export const getSchemas = (): any => {
  return schemas.entries;
};

export const getResultCommon = (translated: boolean = false): any => {
  const common = {
    active: false,
    address: {
      city: 'Foobartown',
      postcode: '12345',
      country: 'Deutschland',
      street: 'Foobarstr 8',
    },
    archived: false,
    estateType: '01ETAG',
    createdAt: 1571395296605,
    externalID: 'KAT8WE   4',
    internalID: '75a1bcea-49de-3d8d-97bb-05b600e1bb6a',
    livingSpace: 66.18,
    numberOfRooms: 2,
    price: { value: 54000, currency: '€' },
    title: 'Wohnen in schöner ländlicher Gegend nahe der Stadt Foobartown',
    previewImage: {
      title: 'Wohnzimmer',
      url:
        'https://s3.eu-central-1.amazonaws.com/cloudios.production.image/8b/91811a12-a594-42d4-bf75-bddb39c94b8b/6a/75a1bcea-49de-3d8d-97bb-05b600e1bb6a/17/a58a7f44-79dc-4177-8ed2-4bf589673117.JPG',
    },
    updatedAt: 1580294614972,
  };

  if (translated) return translate(common);
  return common;
};

export const getResultProperties = (translated: boolean = false): any => {
  const properties = {
    ...getResultCommon(translated),
    attachments: [
      {
        title: 'Wohnzimmer',
        url:
          'https://s3.eu-central-1.amazonaws.com/cloudios.production.image/8b/91811a12-a594-42d4-bf75-bddb39c94b8b/6a/75a1bcea-49de-3d8d-97bb-05b600e1bb6a/17/a58a7f44-79dc-4177-8ed2-4bf589673117.JPG',
      },
      {
        title: 'Carport',
        url:
          'https://s3.eu-central-1.amazonaws.com/cloudios.production.image/8b/91811a12-a594-42d4-bf75-bddb39c94b8b/6a/75a1bcea-49de-3d8d-97bb-05b600e1bb6a/91/65cacc57-abdd-4ff9-9b33-5e9391111491.JPG',
      },
    ],
    attic: undefined,
    balcony: undefined,
    buildingEnergyRatingType: undefined,
    cellar: undefined,
    condition: undefined,
    constructionPhase: undefined,
    constructionYear: 1995,
    courtage: undefined,
    descriptionNote:
      'Dolore exercitation aliquip anim laborum cillum tempor excepteur occaecat culpa. Aliqua amet nisi ad quis ut incididunt adipisicing laborum reprehenderit consectetur esse. Do in amet incididunt commodo labore. Pariatur voluptate exercitation reprehenderit adipisicing tempor id culpa esse ullamco voluptate. Ex pariatur excepteur mollit culpa culpa tempor non ipsum. Magna amet adipisicing cillum excepteur nulla sint aliquip et. Aliqua occaecat id aliqua ut ullamco magna eiusmod officia veniam.',
    energyCertificateAvailability: undefined,
    energyConsumptionContainsWarmWater: undefined,
    energyPerformanceCertificate: undefined,
    floor: undefined,
    freeFrom: undefined,
    furnishingNote:
      'Laboris duis do non ut officia aliquip cupidatat officia commodo pariatur id consectetur eiusmod exercitation. Labore elit incididunt minim labore magna pariatur aute cillum ad aute est cupidatat. Consequat nostrud laboris dolor deserunt Lorem qui do sit est incididunt deserunt voluptate. Fugiat amet qui commodo voluptate sunt minim sint Lorem. Magna culpa laborum id irure ex eu duis. Ad esse qui velit incididunt excepteur. Cillum laborum nostrud non qui ipsum consectetur sit consequat dolor.',
    garden: undefined,
    guestBathroom: undefined,
    guestToilet: undefined,
    handicappedAccessible: undefined,
    heatingType: 'OEL',
    interiorQuality: undefined,
    lastRefurbishment: undefined,
    listed: true,
    locationNote:
      'Do aute consectetur pariatur ea duis aliquip in cupidatat. Irure proident reprehenderit ullamco commodo minim duis non cillum tempor aliquip cupidatat. Officia voluptate commodo dolor incididunt incididunt labore aute non nostrud in velit sint minim eiusmod. Elit nulla irure non dolore adipisicing adipisicing eu aliqua consectetur officia sit duis amet consectetur. Officia id officia dolore sunt quis enim Lorem labore. Minim magna mollit et amet aute ullamco aute.',
    lodgerFlat: undefined,
    numberOfApartments: undefined,
    numberOfBathRooms: 1,
    numberOfBedRooms: 1,
    numberOfCommercialUnits: undefined,
    numberOfFloors: 1,
    numberOfParkingSpaces: undefined,
    otherNote: 'Gerne vereinbaren wir einen Besichtigungstermin mit Ihnen.',
    parkingSpacePrice: undefined,
    parkingSpaceType: '4',
    patio: undefined,
    plotArea: undefined,
    residentialUnits: undefined,
    summerResidencePractical: undefined,
    usableFloorSpace: undefined,
    marketingType: undefined,
  };
  if (translated) return translate(properties);
  return properties;
};
