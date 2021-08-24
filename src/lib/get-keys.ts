import {
  Address,
  Attachment,
  Marketing,
  Price,
  RealEstateCommonProperties,
  RealEstateDetailedProperties
} from '../classes/portals/Estate';

class Common implements RealEstateCommonProperties {
  active!: boolean;
  address!: Address;
  archived!: boolean;
  estateType!: string;
  marketingType!: Marketing;
  createdAt!: number;
  externalID!: string;
  internalID!: string;
  livingSpace!: number;
  numberOfRooms!: number;
  price!: Price | undefined;
  title!: string;
  previewImage!: Attachment;
  updatedAt!: number;
}

class Detailed implements RealEstateDetailedProperties {
  attachments!: Attachment[];
  attic!: boolean;
  balcony!: boolean;
  buildingEnergyRatingType!: string;
  cellar!: boolean;
  condition!: string;
  constructionPhase!: string;
  constructionYear!: number;
  courtage!: string;
  descriptionNote!: string;
  energyCertificateAvailability!: boolean;
  energyConsumptionContainsWarmWater!: boolean;
  energyPerformanceCertificate!: boolean;
  floor!: number;
  freeFrom!: string;
  furnishingNote!: string;
  garden!: boolean;
  guestBathroom!: boolean;
  guestToilet!: boolean;
  handicappedAccessible!: boolean;
  heatingType!: string;
  interiorQuality!: string;
  lastRefurbishment!: number;
  listed!: boolean;
  locationNote!: string;
  lodgerFlat!: boolean;
  numberOfApartments!: number;
  numberOfBathRooms!: number;
  numberOfBedRooms!: number;
  numberOfCommercialUnits!: number;
  numberOfFloors!: number;
  numberOfParkingSpaces!: number;
  otherNote!: string;
  parkingSpacePrice!: string;
  parkingSpaceType!: string;
  patio!: boolean;
  plotArea!: number;
  residentialUnits!: number;
  summerResidencePractical!: boolean;
  usableFloorSpace!: number;
  totalRent!: string;
  additionalExpenses!: string;
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
  priceIntervalType: string | undefined;
}

class At implements Attachment {
  title!: string;
  url!: string;
}

const propertyNames = (Class: any) => {
  return Object.getOwnPropertyNames(new Class());
};

export const generateEstatePropertyKeys = (): string[] => {
  return [
    ...generateCommonEstatePropertyKeys(),
    ...generateDetailedEstatePropertyKeys(),
    ...propertyNames(Ad),
    ...propertyNames(Pr),
    ...propertyNames(At),
  ].map((key) => key.toLowerCase());
};

export const generateDetailedEstatePropertyKeys = (): string[] =>
  propertyNames(Detailed);
export const generateCommonEstatePropertyKeys = (): string[] =>
  propertyNames(Common);
