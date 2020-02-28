import { isObject, isUndefined } from 'lodash';
import { Logger } from '../../utils';
import { Mapping, RealEstate } from './Estate';

export class Translator {
  private _dictionary?: Mapping;
  private translatableSets: Mapping = {};

  public set dictionary(dictionary: Mapping) {
    this._dictionary = dictionary;
  }

  private hasDictionary(): boolean {
    return !isUndefined(this._dictionary) && isObject(this._dictionary);
  }

  private isTranslatable(key: string): boolean {
    return !isUndefined(this.translatableSets[key]);
  }

  private getTranslatablePath(key: string): string {
    return this.translatableSets[key] || 'N/A';
  }

  private translate(value: string): string {
    let result = value;
    const isValidString = typeof value === 'string' && !value.match(/ |\n/gi);

    if (this.isTranslatable(value) && isValidString) {
      const key = value.toLowerCase();
      result = this._dictionary![key];
      if (!result) {
        const path = this.getTranslatablePath(value);
        Logger.warn(`No translation found for "${key}" <${path}>`);
        result = value;
      }
    }
    return result;
  }

  public translateIfNeeded(values: RealEstate): RealEstate {
    if (!this.hasDictionary()) return values;
    return Object.entries(values).reduce((result, [key, value]) => {
      return { ...result, [key]: this.translate(value) };
    }, {});
  }

  public addToTranslatables(translatable: Mapping): void {
    this.translatableSets = { ...this.translatableSets, ...translatable };
  }
}
