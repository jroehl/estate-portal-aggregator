import {
  Price,
  Address,
  RealEstateDetailed,
  Attachment,
  Estate,
  RealEstateCommon,
} from '../Estate';

import { get } from 'lodash';

export class Immobilienscout24EstateCommon extends Estate {
  protected common!: RealEstateCommon;
  protected details?: RealEstateDetailed;

  protected async setCommon(): Promise<void> {
    this.common = {
      active: this.getActive('realEstateState'),
      address: this.getAddress(),
      archived: this.getArchived('realEstateState'),
      estateType: this.getEstateType(),
      createdAt: this.getDate(['creationDate', '@creation']),
      externalID: this.get('externalId'),
      internalID: this.get('@id'),
      livingSpace: this.get('livingSpace'),
      numberOfRooms: this.get('numberOfRooms'),
      price: this.getPrice(),
      title: this.get('title'),
      previewImage: this.getPreviewImage(),
      updatedAt: this.getDate([
        'lastModificationDate',
        '@modified',
        '@modification',
      ]),
    };
  }

  protected async setDetailed(): Promise<void> {}

  private getEstateType(): string {
    let result = this.get(['buildingType', 'apartmentType', 'estateType']);
    if (!result) {
      result = this.get('type', '').split('.')[1];
    }
    if (!result) {
      result = this.get('@xsi.type', '').split(':')[1];
    }
    return result;
  }

  private getPreviewImage(): Attachment {
    return {
      title: this.get(['titlePicture.title', 'attachments[0].title']),
      url: this.get(
        [
          'titlePicture.urls[0].url[0][@href]',
          'attachments[0].urls[0].url[0][@href]',
        ],
        ''
      ).split('/ORIG')[0],
    };
  }

  private getPrice(): Price | undefined {
    const price = this.get('price.value');
    const rent = this.get('baseRent');
    if (!price && !rent) return;

    const currency = this.get('price.currency', '€');
    const marketingType = this.get(
      'price.marketingType',
      rent || this.getEstateType().match(/rent/i) ? 'RENT' : 'PURCHASE'
    );
    const priceIntervalType = this.get('price.value');
    return {
      value: price || rent,
      currency,
      marketingType,
      priceIntervalType,
    };
  }

  private getAddress(): Address | undefined {
    return {
      city: this.get('address.city'),
      postcode: this.get('address.postcode'),
      country: this.get('address.country'),
      street: [this.get('address.street'), this.get('address.houseNumber')]
        .filter(Boolean)
        .join(' '),
    };
  }
}

export class Immobilienscout24EstateDetailed extends Immobilienscout24EstateCommon {
  protected async setDetailed(): Promise<void> {
    this.details = {
      attachments: await this.getAttachments(),
      attic: this.get('attic'),
      balcony: this.get('balcony'),
      buildingEnergyRatingType: this.get('buildingEnergyRatingType'),
      cellar: this.get('cellar'),
      condition: this.get('condition'),
      constructionPhase: this.get('constructionPhase'),
      constructionYear: this.get('constructionYear'),
      courtage: this.getCourtage(),
      descriptionNote: this.get('descriptionNote'),
      energyCertificateAvailability: this.get(
        'energyCertificate.energyCertificateAvailability'
      ),
      energyConsumptionContainsWarmWater: this.get(
        'energyConsumptionContainsWarmWater'
      ),
      energyPerformanceCertificate: this.get('energyPerformanceCertificate'),
      floor: this.get('floor'),
      freeFrom: this.get('freeFrom'),
      furnishingNote: this.get('furnishingNote'),
      garden: this.get('garden'),
      guestBathroom: this.get('guestBathroom'),
      guestToilet: this.get('guestToilet'),
      handicappedAccessible: this.get('handicappedAccessible'),
      heatingType: this.get('heatingType'),
      interiorQuality: this.get('interiorQuality'),
      lastRefurbishment: this.get('lastRefurbishment'),
      listed: this.get('listed'),
      locationNote: this.get('locationNote'),
      lodgerFlat: this.get('lodgerFlat'),
      numberOfApartments: this.get('numberOfApartments'),
      numberOfBathRooms: this.get('numberOfBathRooms'),
      numberOfBedRooms: this.get('numberOfBedRooms'),
      numberOfCommercialUnits: this.get('numberOfCommercialUnits'),
      numberOfFloors: this.get('numberOfFloors'),
      numberOfParkingSpaces: this.get('numberOfParkingSpaces'),
      otherNote: this.get('otherNote'),
      parkingSpacePrice: this.get('parkingSpacePrice'),
      parkingSpaceType: this.get('parkingSpaceType'),
      patio: this.get('patio'),
      plotArea: this.get('plotArea'),
      residentialUnits: this.get('residentialUnits'),
      summerResidencePractical: this.get('summerResidencePractical'),
      usableFloorSpace: this.get('usableFloorSpace'),
    };
  }

  private getCourtage(): string {
    const result = [
      this.get('courtage.hasCourtage'),
      this.get('courtage.courtageNote'),
    ]
      .filter(Boolean)
      .join('\n');
    return result;
  }

  private async getAttachments(): Promise<Attachment[]> {
    return this.get('attachments', []).map(
      (attachment: any) =>
        ({
          title: get(attachment, 'title'),
          url: get(attachment, 'urls[0].url[0]["@href"]', '').split('/ORIG')[0],
        } as Attachment)
    );
  }
}
