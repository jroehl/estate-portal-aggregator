import moment from 'moment';
import { writeFileSync, existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import { Mapping } from '../classes/portals/Estate';

export const storeResponse = (
  command: string,
  result: any,
  pretty: boolean
) => {
  const file = resolve(
    process.cwd(),
    `${command}-${moment().toISOString()}.json`
  );
  writeFileSync(
    file,
    pretty ? JSON.stringify(result, null, 2) : JSON.stringify(result)
  );
  return file;
};

export const loadDictionary = (path?: string): Mapping | undefined => {
  if (!path) return undefined;
  if (!existsSync(path) || !path.endsWith('.json'))
    throw new Error(`No valid file found at "${path}"`);
  return JSON.parse(readFileSync(path, 'utf-8'));
};

export const generateOutputName = (...parts: string[]): string =>
  parts.filter(Boolean).join('-');
