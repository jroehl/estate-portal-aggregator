import { get } from 'lodash';

import {
  Price,
  Address,
  RealEstateDetailed,
  Attachment,
  Estate,
  RealEstateCommon,
} from '../Estate';

export type Immobilienscout24Estate =
  | Immobilienscout24EstateCommon
  | Immobilienscout24EstateDetailed;

export class Immobilienscout24EstateCommon extends Estate {
  public common!: RealEstateCommon;
  public details?: RealEstateDetailed;

  protected async setCommon(): Promise<void> {
    this.common = {
      active: this.getActive('realEstateState'),
      address: this.getAddress(),
      archived: this.getArchived('realEstateState'),
      estateType: this.translate(this.getEstateType()),
      marketingType: this.getMarketingType(
        'price.marketingType',
        this.get('baseRent') || this.getEstateType().match(/rent/i)
          ? 'RENT'
          : 'PURCHASE'
      ),
      createdAt: this.getDate(['creationDate', '@creation']),
      externalID: this.get('externalId'),
      internalID: this.get('@id'),
      livingSpace: this.getTranslated('livingSpace'),
      numberOfRooms: this.getTranslated('numberOfRooms'),
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

    const currency = this.getTranslated('price.currency', '€');
    const priceIntervalType = this.getTranslated('price.intervalType');
    return {
      value: price || rent,
      currency,
      priceIntervalType,
    };
  }

  private getAddress(): Address | undefined {
    return {
      city: this.get('address.city'),
      postcode: this.get('address.postcode'),
      country: this.getTranslated('address.country'),
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
      attic: this.getTranslated('attic'),
      balcony: this.getTranslated('balcony'),
      buildingEnergyRatingType: this.getTranslated('buildingEnergyRatingType'),
      cellar: this.getTranslated('cellar'),
      condition: this.getTranslated('condition'),
      constructionPhase: this.getTranslated('constructionPhase'),
      constructionYear: this.getTranslated('constructionYear'),
      courtage: this.getCourtage(),
      descriptionNote: this.get('descriptionNote'),
      energyCertificateAvailability: this.getTranslated(
        'energyCertificate.energyCertificateAvailability'
      ),
      energyConsumptionContainsWarmWater: this.getTranslated(
        'energyConsumptionContainsWarmWater'
      ),
      energyPerformanceCertificate: this.getTranslated(
        'energyPerformanceCertificate'
      ),
      floor: this.getTranslated('floor'),
      freeFrom: this.getTranslated('freeFrom'),
      furnishingNote: this.get('furnishingNote'),
      garden: this.getTranslated('garden'),
      guestBathroom: this.getTranslated('guestBathroom'),
      guestToilet: this.getTranslated('guestToilet'),
      handicappedAccessible: this.getTranslated('handicappedAccessible'),
      heatingType: this.getTranslated('heatingType'),
      interiorQuality: this.getTranslated('interiorQuality'),
      lastRefurbishment: this.getTranslated('lastRefurbishment'),
      listed: this.getTranslated('listed'),
      locationNote: this.get('locationNote'),
      lodgerFlat: this.getTranslated('lodgerFlat'),
      numberOfApartments: this.getTranslated('numberOfApartments'),
      numberOfBathRooms: this.getTranslated('numberOfBathRooms'),
      numberOfBedRooms: this.getTranslated('numberOfBedRooms'),
      numberOfCommercialUnits: this.getTranslated('numberOfCommercialUnits'),
      numberOfFloors: this.getTranslated('numberOfFloors'),
      numberOfParkingSpaces: this.getTranslated('numberOfParkingSpaces'),
      otherNote: this.get('otherNote'),
      parkingSpacePrice: this.getTranslated('parkingSpacePrice'),
      parkingSpaceType: this.getTranslated('parkingSpaceType'),
      patio: this.getTranslated('patio'),
      plotArea: this.getTranslated('plotArea'),
      residentialUnits: this.getTranslated('residentialUnits'),
      summerResidencePractical: this.getTranslated('summerResidencePractical'),
      usableFloorSpace: this.getTranslated('usableFloorSpace'),
    };
  }

  private getCourtage(): string {
    const result = [
      this.getTranslated('courtage.hasCourtage'),
      this.getTranslated('courtage.courtageNote'),
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
