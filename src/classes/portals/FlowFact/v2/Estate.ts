import { get } from 'lodash';
import {
  Price,
  Address,
  Attachment,
  Estate,
  RealEstateProperties,
} from '../../Estate';

export class FlowFactEstateV2 extends Estate {
  protected async parse(): Promise<RealEstateProperties> {
    return {
      attachments: await this.getAttachments(),
      attic: this.getBoolean('attic')!,
      balcony: this.getBoolean('balconyavailable.values[0')!,
      buildingEnergyRatingType: this.getTranslatableValue(
        'buildingEnergyRatingType'
      ),
      cellar: this.getBoolean('cellar.values[0]')!,
      condition: this.getTranslatableValue('condition.values[0]'),
      constructionPhase: this.getTranslatableValue(
        'constructionphase.values[0]'
      ),
      constructionYear: this.getTranslatableValue(
        'yearofconstruction.values[0]'
      ),
      courtage: this.getTranslatableValue('commissionInformation.values[0]'),
      descriptionNote: this.getValue('textEstate.values[0]'),
      energyCertificateAvailability: this.getBoolean(
        'energy_certificate_availability.values[0]'
      )!,
      energyConsumptionContainsWarmWater: this.getBoolean(
        'energywithwarmwater.values[0]'
      )!,
      energyPerformanceCertificate: this.getBoolean(
        'energyCertificate.energy_performance_certificate.values[0]'
      )!,
      floor: this.getTranslatableValue('floor.values[0]'),
      freeFrom: this.getValue('freeFrom'),
      furnishingNote: this.getValue('textEnvironment.values[0]'),
      garden: this.getBoolean('gardenarea.values[0]')!,
      guestBathroom: this.getBoolean('guesttoilet.values[0]')!,
      guestToilet: this.getBoolean('guesttoilet.values[0]')!,
      handicappedAccessible: this.getBoolean('barrierfree.values[0]')!,
      heatingType: this.getTranslatableValue('typeofheating.values[0]'),
      interiorQuality: this.getTranslatableValue('qualfitout.values[0]'),
      lastRefurbishment: this.getTranslatableValue(
        'lastModernization.values[0]'
      ),
      listed: this.getBoolean('monument.values[0]')!,
      locationNote: this.getValue('textLocation.values[0]'),
      lodgerFlat: this.getBoolean('lodger_flat.values[0]')!,
      numberOfApartments: this.getValue('numberOfApartments'),
      numberOfBathRooms: this.getTranslatableValue('numberbathrooms.values[0]'),
      numberOfBedRooms: this.getTranslatableValue('numberbedrooms.values[0]'),
      numberOfCommercialUnits: this.getValue('numberOfCommercialUnits'),
      numberOfFloors: this.getValue('no_of_floors.values[0]'),
      numberOfParkingSpaces: this.getValue('numberOfParkingSpaces'),
      otherNote: this.getValue('textFree.values[0]'),
      parkingSpacePrice: this.getValue('parkingSpacePrice'),
      parkingSpaceType: this.getTranslatableValue('parking.values[0]'),
      patio: this.getBoolean('patio')!,
      plotArea: this.getTranslatableValue('plotarea.values[0]'),
      residentialUnits: this.getValue('residentialUnits'),
      summerResidencePractical: this.getBoolean('summerResidencePractical')!,
      usableFloorSpace: this.getTranslatableValue('usablearea.values[0]'),
      active: this.getActive('status.values[0]'),
      address: this.getAddress(),
      archived: this.getArchived('status.values[0]'),
      estateType: this.getTranslatableValue('estatetype.values[0]'),
      marketingType: this.getMarketingType('tradeType.values[0]'),
      createdAt: this.getDate('_metadata.createdTimestamp'),
      externalID: this.getValue('identifier.values[0]'),
      internalID: this.getValue('_metadata.id'),
      livingSpace: this.getTranslatableValue('livingarea.values[0]'),
      numberOfRooms: this.getTranslatableValue('rooms.values[0]'),
      price: this.getPrice(),
      title: this.getTranslatableValue('headline.values[0]'),
      previewImage: this.getPreviewImage(),
      updatedAt: this.getDate('_metadata.timestamp'),
    };
  }

  protected getBoolean(
    path: any | any[],
    defaultValue?: any
  ): boolean | undefined {
    const value = this.getValue(path, defaultValue);
    if (value === 1 || `${value}` === 'true') return true;
    if (value === 0 || `${value}` === 'false') return false;
    return undefined;
  }

  private getPreviewImage(): Attachment | undefined {
    const image = this.getValue('mainImage.values[0]', {});
    return {
      title: image.headline,
      url: image.uri,
    };
  }

  private getPrice(): Price | undefined {
    const price = this.getValue('purchaseprice.values[0]');
    const rent = this.getValue('rent.values[0]');
    if (!price && !rent) return;
    return {
      value: price || rent,
      currency: this.getTranslatableValue('currency.values[0]', '€'),
    };
  }

  private getAddress(): Address {
    return {
      city: this.getValue('addresses.values[0].city'),
      postcode: this.getValue('addresses.values[0].zipcode'),
      country: this.getTranslatableValue('addresses.values[0].country'),
      street: this.getValue('addresses.values[0].street'),
    };
  }

  private async getAttachments(): Promise<Attachment[]> {
    return this.getValue('onlineImage.values', []).map(
      (attachment: any) =>
        ({
          title: get(attachment, 'headline'),
          url: get(attachment, 'uri'),
        } as Attachment)
    );
  }
}
