import { get } from 'lodash';

import {
  Price,
  Address,
  RealEstateDetailed,
  Attachment,
  Estate,
  RealEstateCommon,
} from '../../Estate';

export class FlowFactEstateCommonV1 extends Estate {
  public common!: RealEstateCommon;
  public details?: RealEstateDetailed;

  protected async setCommon(): Promise<void> {
    this.common = {
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
    const rent = this.getValue([
      'rent.value.value',
      'value.rent.value.value',
    ]);
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
      street: this.getValue([
        'location.street',
        'value.location.street',
      ]),
    };
  }
}

export class FlowFactEstateDetailedV1 extends FlowFactEstateCommonV1 {
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
    return this.getValue('value.pictures.estatepicture', []).map(
      (attachment: any) =>
        ({
          title: get(attachment, 'headline'),
          url: get(attachment, 'href'),
        } as Attachment)
    );
  }
}
