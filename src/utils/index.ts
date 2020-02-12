export class Logger {
  static log = (...args: any[]) => console.log(...args); // tslint:disable-line no-console
  static warn = (...args: any[]) => console.warn(...args); // tslint:disable-line no-console
  static info = (...args: any[]) => console.info(...args); // tslint:disable-line no-console
  static error = (...args: any[]) => console.error(...args); // tslint:disable-line no-console
  static logJSON = (json: any) => console.log(JSON.stringify(json, null, 2)); // tslint:disable-line no-console
}
