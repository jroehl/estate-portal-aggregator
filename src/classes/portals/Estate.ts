import moment from 'moment';
import { get } from 'lodash';

import { RequestError } from './Portal';
import { Translator } from './Translator';

export interface Mapping {
  [key: string]: any | any[];
}

export type RealEstate = RealEstateCommon | RealEstateDetailed;

export type Marketing = 'RENT' | 'PURCHASE' | 'PURCHASE_RENT';

export interface RealEstateCommon {
  active: boolean;
  address?: Address;
  archived: boolean;
  estateType: string;
  marketingType?: Marketing;
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
  private translator: Translator;
  constructor(private response: Mapping, dictionary?: Mapping) {
    this.translator = new Translator();
    if (dictionary) this.translator.dictionary = dictionary;
  }

  private error?: RequestError;

  public abstract common: RealEstateCommon;
  protected abstract async setCommon(): Promise<void>;

  public abstract details?: RealEstateDetailed;
  protected async setDetailed(): Promise<void> {} // tslint:disable-line no-empty

  async setValues(): Promise<Estate> {
    if (this.response.type === 'error') {
      this.setError();
    } else {
      await this.setCommon();
      await this.setDetailed();
    }
    return this;
  }

  public set dictionary(dictionary: Mapping) {
    this.translator.dictionary = dictionary;
  }

  public get values(): RealEstate | RequestError {
    if (this.error) return this.error;
    const result = !this.details
      ? this.common
      : { ...this.common, ...this.details };
    return this.translator.translateIfNeeded(result);
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

  private parseValue(value: any): any {
    if (!value || Array.isArray(value)) return value;
    if (value.toString().match(/AVAILABLE|YES|true/i)) return true;
    if (value.toString().match(/NOT_AVAILABLE|NOT|false/i)) return false;
    return value;
  }

  protected getDate(path: any | any[], defaultValue?: any): number {
    const value = this.getValue(path, defaultValue);
    if (!isNaN(value)) return Number(value);
    return moment(value).valueOf();
  }

  protected getActive(path: any | any[], defaultValue?: any): boolean {
    const value = this.getValue(path, defaultValue);
    return !`${value}`.match(/(INACTIVE|false)/i);
  }

  protected getArchived(path: any | any[], defaultValue?: any): boolean {
    const value = this.getValue(path, defaultValue);
    return !!`${value}`.match(/(ARCHIVED|TO_BE_DELETED|true)/i);
  }

  protected getMarketingType(
    path: any | any[],
    defaultValue?: any
  ): Marketing | undefined {
    const value = this.getValue(path, defaultValue);
    if (value === undefined) return;

    const result = value.toString().toLowerCase();
    const hasRent = result.match(/.*(rent).*/gi);
    const hasPurchase = result.match(/.*(purchase|buy).*/gi);

    if (hasRent && hasPurchase) return 'PURCHASE_RENT';
    if (hasRent) return 'RENT';
    if (hasPurchase) return 'PURCHASE';
  }

  private get(
    path: any | any[],
    defaultValue?: any,
    isTranslatable: boolean = false
  ): any {
    const paths = Array.isArray(path) ? path : [path];
    let result = defaultValue;
    for (const p of paths) {
      const found = get(this.response, p);
      if (found !== undefined && found !== null) {
        result = this.parseValue(found);
        break;
      }
    }
    if (isTranslatable) this.translator.addToTranslatables({ [result]: path });
    return result;
  }

  protected getValue(path: any | any[], defaultValue?: any): any {
    return this.get(path, defaultValue, false);
  }

  protected getTranslatableValue(path: any | any[], defaultValue?: any): any {
    return this.get(path, defaultValue, true);
  }
}
