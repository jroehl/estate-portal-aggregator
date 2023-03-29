import { AvailableLanguages } from '../../types';
import { Estate, Mapping } from './Estate';
import { FetchOptions, Portal } from './Portal';

export abstract class Aggregator {
  protected abstract portal: Portal;
  protected dictionaries: Mapping = {};

  public async fetchResult(id: string): Promise<Mapping> {
    return this.portal.fetchEstate(id);
  }
  public async fetchResults(options: FetchOptions = {}): Promise<Mapping[]> {
    return this.portal.fetchEstates(options);
  }
  public abstract fetchEstate(id: string): Promise<Estate>;
  public abstract fetchEstates(options: FetchOptions): Promise<Estate[]>;
  public abstract generateDictionary(
    language: AvailableLanguages
  ): Promise<Mapping>;
}
