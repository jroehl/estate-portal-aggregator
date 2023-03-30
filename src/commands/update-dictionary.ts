import { execSync } from 'child_process';
import { writeFileSync } from 'fs';
import _ from 'lodash';
import { join, resolve } from 'path';
import { Argv } from 'yargs';
import { DictionaryFlags, updateDictionaryOptions } from '../cli';
import existingTranslations from '../translations';
import { Logger } from '../utils';
import {
  generateOutputName,
  getRootDir,
  storeResponse
} from '../utils/cli-tools';

export const command = 'update-dictionary';

export const aliases = ['update'];

const usage = `
$0 ${command}
`;

interface Arguments extends DictionaryFlags {}

exports.builder = (yargs: Argv) =>
  yargs
    .usage(usage)
    .group(Object.keys(updateDictionaryOptions), 'Dictionary options')
    .options(updateDictionaryOptions);

exports.handler = async ({ language }: Arguments) => {
  try {
    const commands = [
      `flowfact generate-dictionary --language ${language} --api-v1`,
      `flowfact generate-dictionary --language ${language}`,
      `immobilienscout24 generate-dictionary --language ${language}`,
      `generate-dictionary --language ${language}`,
    ];

    const outputs = commands.map((command) => {
      const output = generateOutputName(
        ...command.replace(/-/g, '').split(' ')
      );
      Logger.log(`Executing "estate-portal ${command}"`);
      const bin = join(getRootDir(), 'bin', 'estate-portal');
      execSync(`${bin} ${command} --output ${output}`, {
        stdio: 'inherit',
      });
      return resolve(process.cwd(), `${output}.json`);
    });

    Logger.log('Merging dictionaries, keeping existing translations:');
    const missingTranslations: Record<string, string> = {};
    const result = outputs.reduce(
      (acc, output) => {
        const dictionary = require(output);

        const reducedDictionary = Object.entries(dictionary).reduce(
          (fetchedAcc, [key, value]) => {
            const lowerCaseKey = key.toLowerCase();
            if (!acc[lowerCaseKey] && value) {
              if (!value) {
                missingTranslations[lowerCaseKey] = '';
                return fetchedAcc;
              }
              return { ...fetchedAcc, [lowerCaseKey]: value };
            }
            return fetchedAcc;
          },
          {}
        );

        return {
          ...acc,
          ...reducedDictionary,
        };
      },
      {
        ...(existingTranslations[language] as Record<string, string>),
      }
    );

    const sorted = _(result).toPairs().sortBy(0).fromPairs().value();

    const translationsDir = resolve(getRootDir(), 'src', 'translations');
    writeFileSync(
      resolve(translationsDir, `${language}.json`),
      JSON.stringify(sorted, null, 2)
    );

    if (Object.keys(missingTranslations).length > 0) {
      const filename = storeResponse(
        `missing-translations-language`,
        missingTranslations,
        true
      );
      Logger.warn(`Missing translations stored in ${filename}`);
    }

    Logger.log('Dictionary stored in translations directory');

    // cleanup output files
    outputs.forEach((output) => execSync(`rm -f ${output}`));
  } catch (error) {
    Logger.error(error);
  }
};
