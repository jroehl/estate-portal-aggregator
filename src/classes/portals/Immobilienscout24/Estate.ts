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
    const estateType = this.getEstateType();
    this.common = {
      active: this.getActive('realEstateState'),
      address: this.getAddress(),
      archived: this.getArchived('realEstateState'),
      estateType: this.getTranslatableValue(null, estateType),
      marketingType: this.getMarketingType(
        'price.marketingType',
        this.getValue('baseRent') || estateType.match(/rent/i)
          ? 'RENT'
          : 'PURCHASE'
      ),
      createdAt: this.getDate(['creationDate', '@creation']),
      externalID: this.getValue('externalId'),
      internalID: this.getValue('@id'),
      livingSpace: this.getTranslatableValue('livingSpace'),
      numberOfRooms: this.getTranslatableValue('numberOfRooms'),
      price: this.getPrice(),
      title: this.getValue('title'),
      previewImage: this.getPreviewImage(),
      updatedAt: this.getDate([
        'lastModificationDate',
        '@modified',
        '@modification',
      ]),
    };
  }

  private getEstateType(): string {
    let result = this.getValue(['buildingType', 'apartmentType', 'estateType']);
    if (!result) {
      result = this.getValue('type', '').split('.')[1];
    }
    if (!result) {
      result = this.getValue('@xsi.type', '').split(':')[1];
    }
    return result;
  }

  private getPreviewImage(): Attachment {
    return {
      title: this.getValue(['titlePicture.title', 'attachments[0].title']),
      url: this.getValue(
        [
          'titlePicture.urls[0].url[0][@href]',
          'attachments[0].urls[0].url[0][@href]',
        ],
        ''
      ).split('/ORIG')[0],
    };
  }

  private getPrice(): Price | undefined {
    const price = this.getValue('price.value');
    const rent = this.getValue('baseRent');
    if (!price && !rent) return;

    const currency = this.getTranslatableValue('price.currency', '€');
    const priceIntervalType = this.getTranslatableValue('price.intervalType');
    return {
      value: price || rent,
      currency,
      priceIntervalType,
    };
  }

  private getAddress(): Address | undefined {
    return {
      city: this.getValue('address.city'),
      postcode: this.getValue('address.postcode'),
      country: this.getTranslatableValue('address.country'),
      street: [
        this.getValue('address.street'),
        this.getValue('address.houseNumber'),
      ]
        .filter(Boolean)
        .join(' '),
    };
  }
}

export class Immobilienscout24EstateDetailed extends Immobilienscout24EstateCommon {
  protected async setDetailed(): Promise<void> {
    this.details = {
      attachments: await this.getAttachments(),
      attic: this.getTranslatableValue('attic'),
      balcony: this.getTranslatableValue('balcony'),
      buildingEnergyRatingType: this.getTranslatableValue(
        'buildingEnergyRatingType'
      ),
      cellar: this.getTranslatableValue('cellar'),
      condition: this.getTranslatableValue('condition'),
      constructionPhase: this.getTranslatableValue('constructionPhase'),
      constructionYear: this.getTranslatableValue('constructionYear'),
      courtage: this.getCourtage(),
      descriptionNote: this.getValue('descriptionNote'),
      energyCertificateAvailability: this.getTranslatableValue(
        'energyCertificate.energyCertificateAvailability'
      ),
      energyConsumptionContainsWarmWater: this.getTranslatableValue(
        'energyConsumptionContainsWarmWater'
      ),
      energyPerformanceCertificate: this.getTranslatableValue(
        'energyPerformanceCertificate'
      ),
      floor: this.getTranslatableValue('floor'),
      freeFrom: this.getTranslatableValue('freeFrom'),
      furnishingNote: this.getValue('furnishingNote'),
      garden: this.getTranslatableValue('garden'),
      guestBathroom: this.getTranslatableValue('guestBathroom'),
      guestToilet: this.getTranslatableValue('guestToilet'),
      handicappedAccessible: this.getTranslatableValue('handicappedAccessible'),
      heatingType: this.getTranslatableValue('heatingType'),
      interiorQuality: this.getTranslatableValue('interiorQuality'),
      lastRefurbishment: this.getTranslatableValue('lastRefurbishment'),
      listed: this.getTranslatableValue('listed'),
      locationNote: this.getValue('locationNote'),
      lodgerFlat: this.getTranslatableValue('lodgerFlat'),
      numberOfApartments: this.getTranslatableValue('numberOfApartments'),
      numberOfBathRooms: this.getTranslatableValue('numberOfBathRooms'),
      numberOfBedRooms: this.getTranslatableValue('numberOfBedRooms'),
      numberOfCommercialUnits: this.getTranslatableValue(
        'numberOfCommercialUnits'
      ),
      numberOfFloors: this.getTranslatableValue('numberOfFloors'),
      numberOfParkingSpaces: this.getTranslatableValue('numberOfParkingSpaces'),
      otherNote: this.getValue('otherNote'),
      parkingSpacePrice: this.getTranslatableValue('parkingSpacePrice'),
      parkingSpaceType: this.getTranslatableValue('parkingSpaceType'),
      patio: this.getTranslatableValue('patio'),
      plotArea: this.getTranslatableValue('plotArea'),
      residentialUnits: this.getTranslatableValue('residentialUnits'),
      summerResidencePractical: this.getTranslatableValue(
        'summerResidencePractical'
      ),
      usableFloorSpace: this.getTranslatableValue('usableFloorSpace'),
    };
  }

  private getCourtage(): string {
    const result = [
      this.getTranslatableValue('courtage.hasCourtage'),
      this.getTranslatableValue('courtage.courtageNote'),
    ]
      .filter(Boolean)
      .join('\n');
    return result;
  }

  private async getAttachments(): Promise<Attachment[]> {
    return this.getValue('attachments', []).map(
      (attachment: any) =>
        ({
          title: get(attachment, 'title'),
          url: get(attachment, 'urls[0].url[0]["@href"]', '').split('/ORIG')[0],
        } as Attachment)
    );
  }
}
