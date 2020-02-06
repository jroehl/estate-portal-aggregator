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
      active: this.isActive(this.get('status.values[0]')),
      address: this.getAddress(),
      archived: this.isArchived(this.get('status.values[0]')),
      estateType: this.get('estatetype.values[0]'),
      createdAt: this.sanitizeDate(this.get('_metadata.createdTimestamp')),
      externalID: this.get('identifier.values[0]'),
      internalID: this.get('_metadata.id'),
      livingSpace: this.get('livingarea.values[0]'),
      numberOfRooms: this.get('rooms.values[0]'),
      price: this.getPrice(),
      title: this.get('headline.values[0]'),
      previewImage: this.getPreviewImage(),
      updatedAt: this.sanitizeDate(this.get('_metadata.timestamp')),
    };
  }

  protected async setDetailed(): Promise<void> {}

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
    const street = this.get('addresses.values[0].street');
    let houseNumber;
    if (street) {
      const match = street.match(/^.* ([0-9]+(?:-[0-9]+)(?:[a-z]-[a-z])?).*$/i);
      houseNumber = match ? match[1] : undefined;
    }
    return {
      city: this.get('addresses.values[0].city'),
      houseNumber,
      postcode: this.get('addresses.values[0].zipcode'),
      country: this.get('addresses.values[0].country'),
      street,
    };
  }
}

export class FlowFactDetailedV2 extends FlowFactCommonV2 {
  protected async setDetailed(): Promise<void> {
    this.details = {
      attachments: await this.getAttachments(),
      // @TODO implement missing properties
      // attic: this.get('attic'),
      // balcony: this.get('balcony'),
      // buildingEnergyRatingType: this.get('buildingEnergyRatingType'),
      // cellar: this.get('cellar'),
      // condition: this.get('condition'),
      // constructionPhase: this.get('constructionPhase'),
      // constructionYear: this.get('constructionYear'),
      // courtage: this.getCourtage(),
      // descriptionNote: this.get('descriptionNote'),
      // energyCertificateAvailability: this.get(
      //   'energyCertificate.energyCertificateAvailability'
      // ),
      // energyConsumptionContainsWarmWater: this.get(
      //   'energyConsumptionContainsWarmWater'
      // ),
      // energyPerformanceCertificate: this.get('energyPerformanceCertificate'),
      // floor: this.get('floor'),
      // freeFrom: this.get('freeFrom'),
      // furnishingNote: this.get('furnishingNote'),
      // garden: this.get('garden'),
      // guestBathroom: this.get('guestBathroom'),
      // guestToilet: this.get('guestToilet'),
      // handicappedAccessible: this.get('handicappedAccessible'),
      // heatingType: this.get('heatingType'),
      // interiorQuality: this.get('interiorQuality'),
      // lastRefurbishment: this.get('lastRefurbishment'),
      // listed: this.get('listed'),
      // locationNote: this.get('locationNote'),
      // lodgerFlat: this.get('lodgerFlat'),
      // numberOfApartments: this.get('numberOfApartments'),
      // numberOfBathRooms: this.get('numberOfBathRooms'),
      // numberOfBedRooms: this.get('numberOfBedRooms'),
      // numberOfCommercialUnits: this.get('numberOfCommercialUnits'),
      // numberOfFloors: this.get('numberOfFloors'),
      // numberOfParkingSpaces: this.get('numberOfParkingSpaces'),
      // otherNote: this.get('otherNote'),
      // parkingSpacePrice: this.get('parkingSpacePrice'),
      // parkingSpaceType: this.get('parkingSpaceType'),
      // patio: this.get('patio'),
      // plotArea: this.get('plotArea'),
      // residentialUnits: this.get('residentialUnits'),
      // summerResidencePractical: this.get('summerResidencePractical'),
      // usableFloorSpace: this.get('usableFloorSpace'),
    };
  }

  // private getCourtage(): string {
  //   const result = [
  //     this.get('courtage.hasCourtage'),
  //     this.get('courtage.courtageNote'),
  //   ]
  //     .filter(Boolean)
  //     .join('\n');
  //   return result;
  // }

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
