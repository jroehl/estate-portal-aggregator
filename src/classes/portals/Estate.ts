import moment from 'moment';
import { get, isObject } from 'lodash';

import { RequestError } from './Portal';
import { Logger } from '../../utils';

export interface Mapping {
  [key: string]: any | any[];
}

export type RealEstate = RealEstateCommon | RealEstateDetailed;

export interface RealEstateCommon {
  active: boolean;
  address?: Address;
  archived: boolean;
  estateType: string;
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
  constructor(private response: Mapping, private dictionary?: Mapping) {}

  private error?: RequestError;

  protected abstract common: RealEstateCommon;
  protected abstract async setCommon(): Promise<void>;

  protected abstract details?: RealEstateDetailed;
  protected abstract async setDetailed(): Promise<void>;

  async setValues(): Promise<Estate> {
    if (this.response.type === 'error') {
      this.setError();
    } else {
      await this.setCommon();
      await this.setDetailed();
    }
    return this;
  }

  public get values(): RealEstate | RequestError {
    if (this.error) return this.error;
    if (!this.details) return this.common;
    return { ...this.common, ...this.details };
  }

  public toString(): string {
    return JSON.stringify(this.values);
  }

  public toJSON(): any {
    return this.values;
  }

  private setError(): void {
    this.error = this.response as RequestError;
  }

  protected translate(value: string): string {
    let result = value;
    if (
      isObject(this.dictionary) &&
      typeof value === 'string' &&
      !value.match(/ |\n/gi)
    ) {
      const key = value.toLowerCase();
      result = this.dictionary[key];
      if (result === undefined) {
        Logger.warn(`No translation found for "${key}"`);
        return value;
      }
    }

    return result;
  }

  private parseValue(value: any, translate: boolean = true): any {
    if (!value || Array.isArray(value)) return value;
    if (value.toString().match(/AVAILABLE|YES|true/i)) return true;
    if (value.toString().match(/NOT_AVAILABLE|NOT|false/i)) return false;
    return translate ? this.translate(value) : value;
  }

  protected getDate(path: any | any[], defaultValue?: any): number {
    const value = this.get(path, defaultValue);
    if (!isNaN(value)) return Number(value);
    return moment(value).valueOf();
  }

  protected getActive(path: any | any[], defaultValue?: any): boolean {
    const value = this.get(path, defaultValue);
    return !`${value}`.match(/(INACTIVE|false)/i);
  }

  protected getArchived(path: any | any[], defaultValue?: any): boolean {
    const value = this.get(path, defaultValue);
    return !!`${value}`.match(/(ARCHIVED|TO_BE_DELETED|true)/i);
  }

  protected get(path: any | any[], defaultValue?: any): any {
    const paths = Array.isArray(path) ? path : [path];
    for (const p of paths) {
      const result = get(this.response, p);
      if (result !== undefined && result !== null) {
        return this.parseValue(result, false);
      }
    }
    return defaultValue;
  }

  protected getTranslated(path: any | any[], defaultValue?: any): any {
    const paths = Array.isArray(path) ? path : [path];
    for (const p of paths) {
      const result = get(this.response, p);
      if (result !== undefined && result !== null) {
        return this.parseValue(result, true);
      }
    }
    return defaultValue;
  }
}
