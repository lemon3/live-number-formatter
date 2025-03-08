declare global {
  interface Window {
    clipboardData: any;
  }
}

export interface Options {
  [key: string]: any;
}

export interface Number {
  options: Options;
  settings: Options;
  init(): void;
}
