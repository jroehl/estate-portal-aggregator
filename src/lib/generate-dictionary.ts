import estateCommon from '../translations';
import {
  RealEstateCommon,
  RealEstateDetailed,
  Address,
  Price,
  Attachment,
  Mapping,
} from '../classes/portals/Estate';
import { AvailableTranslations } from '../types';

class RealEstate implements RealEstateCommon, RealEstateDetailed {
  active!: boolean;
  address?: Address;
  archived!: boolean;
  estateType!: string;
  createdAt!: number;
  externalID!: string;
  internalID!: string;
  livingSpace?: number | undefined;
  numberOfRooms?: number | undefined;
  price?: Price | undefined;
  title!: string;
  previewImage?: Attachment | undefined;
  updatedAt!: number;

  attachments?: Attachment[];
  attic?: boolean;
  balcony?: boolean;
  buildingEnergyRatingType?: string;
  cellar?: boolean;
  condition?: string;
  constructionPhase?: string;
  constructionYear?: number;
  courtage?: string;
  descriptionNote?: string;
  energyCertificateAvailability?: boolean;
  energyConsumptionContainsWarmWater?: boolean;
  energyPerformanceCertificate?: boolean;
  floor?: number;
  freeFrom?: string;
  furnishingNote?: string;
  garden?: boolean;
  guestBathroom?: boolean;
  guestToilet?: boolean;
  handicappedAccessible?: boolean;
  heatingType?: string;
  interiorQuality?: string;
  lastRefurbishment?: number;
  listed?: boolean;
  locationNote?: string;
  lodgerFlat?: boolean;
  numberOfApartments?: number;
  numberOfBathRooms?: number;
  numberOfBedRooms?: number;
  numberOfCommercialUnits?: number;
  numberOfFloors?: number;
  numberOfParkingSpaces?: number;
  otherNote?: string;
  parkingSpacePrice?: number;
  parkingSpaceType?: string;
  patio?: boolean;
  plotArea?: number;
  residentialUnits?: number;
  summerResidencePractical?: boolean;
  usableFloorSpace?: number;
}

class Ad implements Address {
  city!: string;
  postcode!: string;
  street!: string;
  country!: string;
}

class Pr implements Price {
  value!: number;
  currency!: string;
  marketingType!: string;
  priceIntervalType?: string | undefined;
}

class At implements Attachment {
  title!: string;
  url!: string;
}

const propertyNames = (Class: any) => {
  return Object.getOwnPropertyNames(new Class());
};

const objectify = (array: string[], mapping: Mapping = {}) =>
  array.reduce((red, key) => {
    const lowerKey = key.toLowerCase();
    return {
      ...red,
      [lowerKey]: mapping[lowerKey] || '',
    };
  }, {});

export const generateEstatePropertyKeys = (): string[] => {
  return [
    ...propertyNames(RealEstate),
    ...propertyNames(Ad),
    ...propertyNames(Pr),
    ...propertyNames(At),
  ].map(key => key.toLowerCase());
};

export const generateDictionary = (
  language?: AvailableTranslations
): Mapping => {
  const commonKeys = generateEstatePropertyKeys();
  const mapping = language ? estateCommon[language] : undefined;
  return objectify(commonKeys, mapping);
};
