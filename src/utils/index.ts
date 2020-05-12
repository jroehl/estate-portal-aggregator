const notIsTest = process.env.NODE_ENV !== 'test';

export class Logger {
  static log = (...args: any[]) => notIsTest && console.log(...args); // tslint:disable-line no-console
  static warn = (...args: any[]) => notIsTest && console.warn(...args); // tslint:disable-line no-console
  static info = (...args: any[]) => notIsTest && console.info(...args); // tslint:disable-line no-console
  static error = (...args: any[]) => notIsTest && console.error(...args); // tslint:disable-line no-console
  static logJSON = (json: any) =>
    notIsTest && console.log(JSON.stringify(json, null, 2)); // tslint:disable-line no-console
}
