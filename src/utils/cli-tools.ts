import moment from 'moment';
import { writeFileSync } from 'fs';
import { resolve } from 'path';

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
