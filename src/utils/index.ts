export class Logger {
  static log = (...args: any[]) => console.log(...args);
  static warn = (...args: any[]) => console.warn(...args);
  static info = (...args: any[]) => console.info(...args);
  static error = (...args: any[]) => console.error(...args);
  static logJSON = (json: any) => console.log(JSON.stringify(json, null, 2));
}
