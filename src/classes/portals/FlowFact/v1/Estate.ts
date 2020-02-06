import {
  Price,
  Address,
  RealEstateDetailed,
  Attachment,
  Estate,
  RealEstateCommon,
} from '../../Estate';

import { get } from 'lodash';

export class FlowFactCommonV1 extends Estate {
  protected common!: RealEstateCommon;
  protected details?: RealEstateDetailed;

  protected async setCommon(): Promise<void> {
    this.common = {
      active: this.isActive(this.get(['active', 'value.active'])),
      address: this.getAddress(),
      archived: this.isArchived(this.get(['archived', 'value.archived'])),
      estateType: this.get([
        'estatetype.selected.id',
        'estatetype',
        'value.estatetype.selected.id',
      ]),
      createdAt: this.sanitizeDate(this.get(['created', 'value.created'])),
      externalID: this.get(['identifier', 'value.identifier']),
      internalID: this.get(['id', 'value.id']),
      livingSpace: this.getDetail('livingarea'),
      numberOfRooms: this.getDetail('rooms'),
      price: this.getPrice(),
      title: this.get(['headline', 'value.headline']),
      previewImage: this.getPreviewImage(),
      updatedAt: this.sanitizeDate(this.get(['modified', 'value.modified'])),
    };
  }

  protected async setDetailed(): Promise<void> {}

  protected getDetail(detail: string): any {
    const found = this.get('value.details.any', []).find(
      ({ name }: { name: string }) => name === detail
    );
    if (found) return found.value.value;
  }

  private getPreviewImage(): Attachment | undefined {
    return {
      title: this.get([
        'value.pictures.estatepicture[0].headline',
        'previewimage.headline',
      ]),
      url: this.get([
        'value.pictures.estatepicture[0].href',
        'previewimage.href',
      ]),
    };
  }

  private getPrice(): Price | undefined {
    const price = this.get([
      'purchaseprice.value.value',
      'value.purchaseprice.value.value',
    ]);
    const rent = this.get(['rent.value.value', 'value.rent.value.value']);
    const currency = this.get(
      [
        'rent.value.unit',
        'value.rent.value.unit',
        'purchaseprice.value.unit',
        'value.purchaseprice.value.unit',
      ],
      '€'
    );
    const marketingType = this.get(['tradetype', 'value.tradetype']);
    return {
      value: price || rent,
      currency,
      marketingType,
    };
  }

  private getAddress(): Address | undefined {
    const street = this.get(['location.street', 'value.location.street']);
    let houseNumber;
    if (street) {
      const match = street.match(/^.* ([0-9]+(?:-[0-9]+)(?:[a-z]-[a-z])?).*$/i);
      houseNumber = match ? match[1] : undefined;
    }
    return {
      city: this.get(['location.city', 'value.location.city']),
      houseNumber,
      postcode: this.get(['location.postalcode', 'value.location.postalcode']),
      country: this.get(['location.country', 'value.location.country']),
      street,
    };
  }
}

export class FlowFactDetailedV1 extends FlowFactCommonV1 {
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
    return this.get('value.pictures.estatepicture', []).map(
      (attachment: any) =>
        ({
          title: get(attachment, 'headline'),
          url: get(attachment, 'href'),
        } as Attachment)
    );
  }
}
