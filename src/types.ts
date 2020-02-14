export type AvailableTranslations = 'de' | 'en';

export interface FetchSingleOptions {
  dictionaryPath?: string;
  normalizedResult?: boolean;
  detailedResult?: boolean;
}

export interface FetchMultipleOptions extends FetchSingleOptions {
  recursively?: boolean;
  page?: number;
  pageSize?: number;
}
