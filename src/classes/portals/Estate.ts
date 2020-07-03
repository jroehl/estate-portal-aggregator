import moment from 'moment';
import { get, pick } from 'lodash';

import { Translator } from './Translator';
import { generateCommonEstatePropertyKeys } from '../../lib/get-keys';

export interface Mapping {
  [key: string]: any | any[];
}

export type RealEstateProperties =
  | RealEstateCommonProperties
  | RealEstateDetailedProperties;

export type Marketing = 'RENT' | 'PURCHASE' | 'PURCHASE_RENT';

export interface RealEstateCommonProperties {
  active: boolean;
  address: Address;
  archived: boolean;
  estateType: string;
  marketingType: Marketing;
  createdAt: number;
  externalID: string;
  internalID: string;
  livingSpace: number;
  numberOfRooms: number;
  price: Price | undefined;
  title: string;
  previewImage: Attachment;
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

export interface RealEstateDetailedProperties {
  attachments: Attachment[];
  attic: boolean;
  balcony: boolean;
  buildingEnergyRatingType: string;
  cellar: boolean;
  condition: string;
  constructionPhase: string;
  constructionYear: number;
  courtage: string;
  descriptionNote: string;
  energyCertificateAvailability: boolean;
  energyConsumptionContainsWarmWater: boolean;
  energyPerformanceCertificate: boolean;
  floor: number;
  freeFrom: string;
  furnishingNote: string;
  garden: boolean;
  guestBathroom: boolean;
  guestToilet: boolean;
  handicappedAccessible: boolean;
  heatingType: string;
  interiorQuality: string;
  lastRefurbishment: number;
  listed: boolean;
  locationNote: string;
  lodgerFlat: boolean;
  numberOfApartments: number;
  numberOfBathRooms: number;
  numberOfBedRooms: number;
  numberOfCommercialUnits: number;
  numberOfFloors: number;
  numberOfParkingSpaces: number;
  otherNote: string;
  parkingSpacePrice: string;
  parkingSpaceType: string;
  patio: boolean;
  plotArea: number;
  residentialUnits: number;
  summerResidencePractical: boolean;
  usableFloorSpace: number;
  totalRent: string | undefined;
  serviceCharge: string | undefined;
}

export interface Attachment {
  title: string;
  url: string;
}

export abstract class Estate {
  private _translator: Translator;
  private _response?: Mapping;
  constructor() {
    this._translator = new Translator();
  }

  private _properties?: RealEstateProperties;
  protected abstract async parse(): Promise<RealEstateProperties>;

  public async init(response: Mapping): Promise<Estate> {
    if (response.type === 'error') throw response;
    this._response = response;
    this._properties = await this.parse();
    return this;
  }

  public getProperties(
    detailed: boolean = true,
    dictionary?: Mapping
  ): RealEstateProperties {
    if (!this._properties) throw new Error('Estate class not initialized');
    let result = this._properties;
    if (dictionary) {
      result = this._translator.translateValues(dictionary, result);
    }

    if (!detailed) {
      result = pick(
        result,
        ...generateCommonEstatePropertyKeys()
      ) as RealEstateProperties;
    }
    return result;
  }

  public getTranslatedProperties(
    dictionary: Mapping
  ): RealEstateDetailedProperties {
    return this.getProperties(true, dictionary) as RealEstateDetailedProperties;
  }

  public getCommon(): RealEstateCommonProperties {
    return this.getProperties(false) as RealEstateCommonProperties;
  }

  public getTranslatedCommon(dictionary: Mapping): RealEstateCommonProperties {
    return this.getProperties(false, dictionary) as RealEstateCommonProperties;
  }

  private parseValue(value: any): any {
    if (!value || Array.isArray(value)) return value;
    if (value.toString().match(/AVAILABLE|YES|true/i)) return true;
    if (value.toString().match(/NOT_AVAILABLE|NOT|false/i)) return false;
    return value;
  }

  protected getDate(path: any | any[], defaultValue?: any): number | undefined {
    const value = this.getValue(path, defaultValue);
    if (!isNaN(value)) return Number(value);
    if (!value) return undefined;
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
      const found = get(this._response, p);
      if (found !== undefined && found !== null) {
        result = this.parseValue(found);
        break;
      }
    }
    if (isTranslatable) this._translator.addToTranslatables({ [result]: path });
    return result;
  }

  protected getValue(path: any | any[], defaultValue?: any): any {
    return this.get(path, defaultValue, false);
  }

  protected getTranslatableValue(path: any | any[], defaultValue?: any): any {
    return this.get(path, defaultValue, true);
  }
}
