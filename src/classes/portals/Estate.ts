import moment from 'moment';
import { get } from 'lodash';

export interface Mapping {
  [key: string]: any | any[];
}

export type RealEstate = RealEstateCommon | RealEstateDetailed;

export interface RealEstateCommon {
  active: boolean;
  address?: Address;
  archived: boolean;
  estateType: string; // buildingType
  createdAt: number;
  externalID: string;
  internalID: string;
  livingSpace?: number;
  numberOfRooms?: number;
  price?: Price;
  title: string;
  previewImage?: Attachment;
  updatedAt: number;
}

export interface Price {
  value: number;
  currency: string;
  marketingType: string;
  priceIntervalType?: string;
}

export interface Address {
  city: string;
  houseNumber: number;
  postcode: string;
  street: string;
  country: string;
}

export interface RealEstateDetailed {
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

export interface Attachment {
  title: string;
  url: string;
}

export abstract class Estate {
  constructor(private response: Mapping) {}

  protected abstract common: RealEstateCommon;
  protected abstract async setCommon(): Promise<void>;

  protected abstract details?: RealEstateDetailed;
  protected abstract async setDetailed(): Promise<void>;

  async setValues(): Promise<Estate> {
    await this.setCommon();
    await this.setDetailed();
    return this;
  }

  public get values(): RealEstate {
    if (!this.details) return this.common;
    return { ...this.common, ...this.details };
  }

  public toString(): string {
    return JSON.stringify(this.values);
  }

  public toJSON(): any {
    return this.values;
  }

  protected isActive(active: any): boolean {
    return !`${active}`.match(/(INACTIVE|false)/i);
  }

  protected isArchived(archived: any): boolean {
    return !!`${archived}`.match(/(ARCHIVED|TO_BE_DELETED|true)/i);
  }

  protected parseValue(value: any): any {
    if (!value || Array.isArray(value)) return value;
    if (!isNaN(value)) return Number(value);
    if (value.toString().match(/AVAILABLE|YES|true/i)) return true;
    if (value.toString().match(/NOT_AVAILABLE|NOT|false/i)) return false;
    // return this.dictionary[value] || value;
    return value;
  }

  protected sanitizeDate(date: number): number {
    if (!isNaN(date)) return date;
    return moment(date).valueOf();
  }

  protected get(path: any | any[], defaultValue?: any): any {
    const paths = Array.isArray(path) ? path : [path];
    for (const p of paths) {
      const result = get(this.response, p);
      if (result !== undefined && result !== null) {
        return this.parseValue(result);
      }
    }
    return defaultValue;
  }
}
