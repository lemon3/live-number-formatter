declare global {
  interface Window {
    clipboardData: any;
  }
}
export interface Options {
  startValue?: number | string | null;
  prefix?: string | null;
  suffix?: string | null;
  locale?: string;
  min?: number | null;
  max?: number | null;
  minlength?: number | null;
  maxlength?: number | null;
  showAffixWhenEmpty?: boolean;
  allowComma?: boolean;
  maxDecimalPlaces?: number | null;
  ltr?: boolean;
}

// export interface Options {
//   [key: string]: any;
// }

export interface Number {
  element: HTMLInputElement;
  options: Options;
  settings: Options;
  originalType: string;
  selectionDirection: string;
  defaultPrevented: boolean;
  isMinus: boolean;
  arrows: string[];
  allowedKeys: string[];
  error: boolean;
  localNumber: LocalNumber;

  init(): void;
}
export interface LocalNumber {
  decimal: string;
  group: string;
}
