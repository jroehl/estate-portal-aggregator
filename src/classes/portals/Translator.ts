import { isUndefined } from 'lodash';
import { Logger } from '../../utils';
import { Mapping, RealEstateProperties } from './Estate';

export class Translator {
  private translatableSets: Mapping = {};

  private isTranslatable(key: string): boolean {
    return !isUndefined(this.translatableSets[key]);
  }

  private getTranslatablePath(key: string): string {
    return this.translatableSets[key] || 'N/A';
  }

  private translateValue(dictionary: Mapping, value: string): string {
    let result = value;
    const isValidString = typeof value === 'string' && !value.match(/ |\n/gi);
    if (this.isTranslatable(value) && isValidString) {
      const key = value.toLowerCase();
      result = dictionary![key];
      if (!result) {
        const path = this.getTranslatablePath(value);
        Logger.warn(`No translation found for "${key}" <${path}>`);
        result = value;
      }
    }
    return result;
  }

  public translateValues(
    dictionary: Mapping,
    values: RealEstateProperties
  ): RealEstateProperties {
    return Object.entries(values).reduce((result, [key, value]) => {
      return { ...result, [key]: this.translateValue(dictionary, value) };
    }, {} as RealEstateProperties);
  }

  public addToTranslatables(translatable: Mapping): void {
    this.translatableSets = { ...this.translatableSets, ...translatable };
  }
}
