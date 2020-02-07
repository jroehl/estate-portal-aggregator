import {
  Price,
  Address,
  RealEstateDetailed,
  Attachment,
  Estate,
  RealEstateCommon,
} from '../../Estate';

import { get } from 'lodash';

export class FlowFactCommonV2 extends Estate {
  protected common!: RealEstateCommon;
  protected details?: RealEstateDetailed;

  protected async setCommon(): Promise<void> {
    this.common = {
      active: this.getActive('status.values[0]'),
      address: this.getAddress(),
      archived: this.getArchived('status.values[0]'),
      estateType: this.get('estatetype.values[0]'),
      createdAt: this.getDate('_metadata.createdTimestamp'),
      externalID: this.get('identifier.values[0]'),
      internalID: this.get('_metadata.id'),
      livingSpace: this.get('livingarea.values[0]'),
      numberOfRooms: this.get('rooms.values[0]'),
      price: this.getPrice(),
      title: this.get('headline.values[0]'),
      previewImage: this.getPreviewImage(),
      updatedAt: this.getDate('_metadata.timestamp'),
    };
  }

  protected async setDetailed(): Promise<void> {}

  protected getBoolean(
    path: any | any[],
    defaultValue?: any
  ): boolean | undefined {
    const value = this.get(path, defaultValue);
    if (value === 1) return true;
    if (value === 0) return false;
  }

  private getPreviewImage(): Attachment | undefined {
    const image = this.get('mainImage.values[0]', {});
    return {
      title: image.headline,
      url: image.uri,
    };
  }

  private getPrice(): Price | undefined {
    const price = this.get('purchaseprice.values[0]');
    const rent = this.get('rent.values[0]');
    if (!price && !rent) return;
    return {
      value: price || rent,
      currency: this.get('currency.values[0]', '€'),
      marketingType: this.get('tradeType.values[0]') ? 'RENT' : 'PURCHASE',
    };
  }

  private getAddress(): Address | undefined {
    return {
      city: this.get('addresses.values[0].city'),
      postcode: this.get('addresses.values[0].zipcode'),
      country: this.get('addresses.values[0].country'),
      street: this.get('addresses.values[0].street'),
    };
  }
}

export class FlowFactDetailedV2 extends FlowFactCommonV2 {
  protected async setDetailed(): Promise<void> {
    this.details = {
      attachments: await this.getAttachments(),
      // attic: this.get('attic'),
      balcony: this.getBoolean('balconyavailable.values[0'),
      // buildingEnergyRatingType: this.get('buildingEnergyRatingType'),
      cellar: this.getBoolean('cellar.values[0]'),
      condition: this.get('condition.values[0]'),
      constructionPhase: this.get('constructionphase.values[0]'),
      constructionYear: this.get('yearofconstruction.values[0]'),
      courtage: this.get('commissionInformation.values[0]'),
      descriptionNote: this.get('textEstate.values[0]'),
      energyCertificateAvailability: this.getBoolean(
        'energy_certificate_availability.values[0]'
      ),
      energyConsumptionContainsWarmWater: this.getBoolean(
        'energywithwarmwater.values[0]'
      ),
      energyPerformanceCertificate: this.getBoolean(
        'energyCertificate.energy_performance_certificate.values[0]'
      ),
      floor: this.get('floor.values[0]'),
      // freeFrom: this.get('freeFrom'),
      furnishingNote: this.get('textEnvironment.values[0]'),
      garden: this.getBoolean('gardenarea.values[0]'),
      guestBathroom: this.getBoolean('guesttoilet.values[0]'),
      guestToilet: this.getBoolean('guesttoilet.values[0]'),
      handicappedAccessible: this.getBoolean('barrierfree.values[0]'),
      heatingType: this.get('typeofheating.values[0]'),
      interiorQuality: this.get('qualfitout.values[0]'),
      lastRefurbishment: this.get('lastModernization.values[0]'),
      listed: this.getBoolean('monument.values[0]'),
      locationNote: this.get('textLocation.values[0]'),
      lodgerFlat: this.getBoolean('lodger_flat.values[0]'),
      // numberOfApartments: this.get('numberOfApartments'),
      numberOfBathRooms: this.get('numberbathrooms.values[0]'),
      numberOfBedRooms: this.get('numberbedrooms.values[0]'),
      // numberOfCommercialUnits: this.get('numberOfCommercialUnits'),
      numberOfFloors: this.get('no_of_floors.values[0]'),
      // numberOfParkingSpaces: this.get('numberOfParkingSpaces'),
      otherNote: this.get('textFree.values[0]'),
      // parkingSpacePrice: this.get('parkingSpacePrice'),
      parkingSpaceType: this.get('parking.values[0]'),
      // patio: this.get('patio'),
      plotArea: this.get('plotarea.values[0]'),
      // residentialUnits: this.get('residentialUnits'),
      // summerResidencePractical: this.get('summerResidencePractical'),
      usableFloorSpace: this.get('usablearea.values[0]'),
    };
  }

  private async getAttachments(): Promise<Attachment[]> {
    return this.get('onlineImage.values', []).map(
      (attachment: any) =>
        ({
          title: get(attachment, 'headline'),
          url: get(attachment, 'uri'),
        } as Attachment)
    );
  }
}
