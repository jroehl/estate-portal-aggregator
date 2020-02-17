import { Mapping, Estate } from './Estate';
import { FetchOptions, Portal } from './Portal';
import { AvailableTranslations } from '../../types';

export abstract class Aggregator {
  protected abstract portal: Portal;
  public async fetchResult(id: string): Promise<Mapping> {
    return this.portal.fetchEstate(id);
  }
  public async fetchResults(options: FetchOptions): Promise<Mapping[]> {
    return this.portal.fetchEstates(options);
  }
  public abstract async fetchEstate(id: string): Promise<Estate>;
  public abstract async fetchEstates(options: FetchOptions): Promise<Estate[]>;
  public abstract async generateDictionary(
    language?: AvailableTranslations
  ): Promise<Mapping>;
}
