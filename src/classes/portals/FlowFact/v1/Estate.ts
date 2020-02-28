import { get } from 'lodash';

import {
  Price,
  Address,
  Attachment,
  Estate,
  RealEstateProperties,
} from '../../Estate';

export class FlowFactEstateV1 extends Estate {
  protected async parse(): Promise<RealEstateProperties> {
    return {
      active: this.getActive(['active', 'value.active']),
      address: this.getAddress(),
      archived: this.getArchived(['archived', 'value.archived']),
      estateType: this.getTranslatableValue([
        'estatetype.selected.id',
        'estatetype',
        'value.estatetype.selected.id',
      ]),
      marketingType: this.getMarketingType(['tradetype', 'value.tradetype']),
      createdAt: this.getDate(['created', 'value.created']),
      externalID: this.getValue(['identifier', 'value.identifier']),
      internalID: this.getValue(['id', 'value.id']),
      livingSpace: this.getDetail('livingarea'),
      numberOfRooms: this.getDetail('rooms'),
      price: this.getPrice(),
      title: this.getValue(['headline', 'value.headline']),
      previewImage: this.getPreviewImage(),
      updatedAt: this.getDate(['modified', 'value.modified']),
      attachments: await this.getAttachments(),
      // @TODO implement missing properties
      attic: this.getValue('attic'),
      balcony: this.getValue('balcony'),
      buildingEnergyRatingType: this.getValue('buildingEnergyRatingType'),
      cellar: this.getValue('cellar'),
      condition: this.getValue('condition'),
      constructionPhase: this.getValue('constructionPhase'),
      constructionYear: this.getValue('constructionYear'),
      courtage: this.getValue('courtage'),
      descriptionNote: this.getValue('descriptionNote'),
      energyCertificateAvailability: this.getValue(
        'energyCertificate.energyCertificateAvailability'
      ),
      energyConsumptionContainsWarmWater: this.getValue(
        'energyConsumptionContainsWarmWater'
      ),
      energyPerformanceCertificate: this.getValue(
        'energyPerformanceCertificate'
      ),
      floor: this.getValue('floor'),
      freeFrom: this.getValue('freeFrom'),
      furnishingNote: this.getValue('furnishingNote'),
      garden: this.getValue('garden'),
      guestBathroom: this.getValue('guestBathroom'),
      guestToilet: this.getValue('guestToilet'),
      handicappedAccessible: this.getValue('handicappedAccessible'),
      heatingType: this.getValue('heatingType'),
      interiorQuality: this.getValue('interiorQuality'),
      lastRefurbishment: this.getValue('lastRefurbishment'),
      listed: this.getValue('listed'),
      locationNote: this.getValue('locationNote'),
      lodgerFlat: this.getValue('lodgerFlat'),
      numberOfApartments: this.getValue('numberOfApartments'),
      numberOfBathRooms: this.getValue('numberOfBathRooms'),
      numberOfBedRooms: this.getValue('numberOfBedRooms'),
      numberOfCommercialUnits: this.getValue('numberOfCommercialUnits'),
      numberOfFloors: this.getValue('numberOfFloors'),
      numberOfParkingSpaces: this.getValue('numberOfParkingSpaces'),
      otherNote: this.getValue('otherNote'),
      parkingSpacePrice: this.getValue('parkingSpacePrice'),
      parkingSpaceType: this.getValue('parkingSpaceType'),
      patio: this.getValue('patio'),
      plotArea: this.getValue('plotArea'),
      residentialUnits: this.getValue('residentialUnits'),
      summerResidencePractical: this.getValue('summerResidencePractical'),
      usableFloorSpace: this.getValue('usableFloorSpace'),
    };
  }

  protected getDetail(detail: string): any {
    const found = this.getValue('value.details.any', []).find(
      ({ name }: { name: string }) => name === detail
    );
    if (found) return found.value.value;
  }

  private getPreviewImage(): Attachment | undefined {
    return {
      title: this.getValue([
        'value.pictures.estatepicture[0].headline',
        'previewimage.headline',
      ]),
      url: this.getValue([
        'value.pictures.estatepicture[0].href',
        'previewimage.href',
      ]),
    };
  }

  private getPrice(): Price | undefined {
    const price = this.getValue([
      'purchaseprice.value.value',
      'value.purchaseprice.value.value',
    ]);
    const rent = this.getValue(['rent.value.value', 'value.rent.value.value']);
    const currency = this.getTranslatableValue(
      [
        'rent.value.unit',
        'value.rent.value.unit',
        'purchaseprice.value.unit',
        'value.purchaseprice.value.unit',
      ],
      '€'
    );
    return {
      value: price || rent,
      currency,
    };
  }

  private getAddress(): Address | undefined {
    return {
      city: this.getValue(['location.city', 'value.location.city']),
      postcode: this.getValue([
        'location.postalcode',
        'value.location.postalcode',
      ]),
      country: this.getTranslatableValue([
        'location.country',
        'value.location.country',
      ]),
      street: this.getValue(['location.street', 'value.location.street']),
    };
  }

  private async getAttachments(): Promise<Attachment[]> {
    return this.getValue('value.pictures.estatepicture', []).map(
      (attachment: any) =>
        ({
          title: get(attachment, 'headline'),
          url: get(attachment, 'href'),
        } as Attachment)
    );
  }
}
