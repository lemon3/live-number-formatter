/**
 * Inserts (a) character(s) at a given position in the input string
 * @param string
 * @param chars
 * @param position
 * @returns
 */
const insertCharsAt = (
  string: string,
  chars: string = '',
  position: number = 0
) => {
  if (typeof string !== 'string') {
    throw new Error('Input must be a string');
  }

  position = Math.min(string.length, Math.max(position, 0));
  return string.slice(0, position) + chars + string.slice(position);
};

const deleteCharAt = (
  string: string,
  start: number,
  end: number = start + 1
) => {
  // Check if the input string is valid
  if (typeof string !== 'string') {
    throw new Error('Input must be a string');
  }

  if (
    string.length < 0 ||
    'undefined' === typeof start ||
    start < 0 ||
    end > string.length
  )
    return string;

  return string.slice(0, start) + string.slice(end);
};

/**
 * Replaces characters in a string for a given start and end position
 * The characters form the input string - between start and end - are removed,
 * and the new chars are inserted at that position
 *
 * @param str The Input string
 * @param chars the characters to be inserted
 * @param start Start position for replacement
 * @param end End position for the replacement
 * @returns
 */
const replaceCharAt = (
  string: string,
  chars: string = '',
  start: number,
  end: number = start + 1
) => {
  // Check if the input string is valid
  if (typeof string !== 'string') {
    throw new Error('Input must be a string');
  }

  // Check if the start and end positions are valid
  if (start < 0 || end > string.length || start > end) {
    throw new Error('Invalid start or end position');
  }

  chars = chars !== null && chars !== '' ? chars : '';
  return string.slice(0, start) + chars + string.slice(end);
};

/**
 * From a LocaleString to a number if there is no locale set
 *
 * @param localeString The string to format
 * @returns number
 */
const parseNumber = (localeString: string): number => {
  if ('' === localeString) return NaN;
  if (!isNaN(Number(localeString))) return Number(localeString);

  let result = localeString.replaceAll(' ', '').replace(/[^\d-.,\s]/g, '');
  const indexComma = result.lastIndexOf(',');
  const indexDot = result.lastIndexOf('.');

  if (indexComma > 0 && indexDot > 0) {
    if (indexComma > indexDot) {
      result = result.replaceAll('.', '').replace(',', '.');
    } else {
      result = result.replaceAll(',', '');
    }
  } else {
    if (indexDot > 0) {
      // check if it is a thousand separator
      result = result.replaceAll('.', '');
    } else if (indexComma > 0) {
      result = result.replaceAll(',', '.');
    }
  }
  return parseFloat(result);
};

const getLocaleStorage = new Map();
const getLocaleSeparators = (locale: string) => {
  if (getLocaleStorage.get(locale)) return getLocaleStorage.get(locale);

  const numberFormat = new Intl.NumberFormat(locale, { useGrouping: true });
  const parts = numberFormat.formatToParts(1234.56);
  const decimal = parts?.find((part) => part.type === 'decimal')?.value || '.';
  const group = parts?.find((part) => part.type === 'group')?.value || ',';

  const result = { decimal, group };

  getLocaleStorage.set(locale, result);
  return result;
};

function parseLocaleNumber(localeString: string = '', locale?: string): number {
  if (!locale) {
    return parseNumber(localeString);
  }
  // is a correct number
  // if (!isNaN(Number(localeString))) {
  //   return Number(localeString);
  // }

  localeString = localeString.replaceAll(' ', '').replace(/[^\d-.,\s]/g, '');
  // if ('number' === typeof localeString) return localeString;
  const { decimal, group } = getLocaleSeparators(locale);

  return parseFloat(localeString.replaceAll(group, '').replace(decimal, '.'));
}

// const _tmp = (val) => {
//   let res = isNaN(val) ? val.replaceAll('.', '').replace(',', '.') : val;
//   let [int, comma] = res.split('.');
//   return Number(int).toLocaleString('de-DE') + (comma ? ',' + comma : '');
// };

const formatNumber = (
  value: string,
  locale: string = 'en-US',
  allowComma: boolean = true,
  maxDecimalPlaces: number = 2
): { value: number; formattedVal: string } => {
  const { decimal } = getLocaleSeparators(locale);
  let number = parseLocaleNumber(value, locale);

  if ('' === value || isNaN(+number)) {
    return {
      value: +number,
      formattedVal: '',
    };
  }

  const trailingComma = value.toString().endsWith(decimal) ? decimal : '';
  // let [, fractionVal] = value.split(decimal);

  let [intNum, fractionVal] = ('' + number).split('.');
  const intValLocal = Number(intNum).toLocaleString(locale);
  const decimalPlaces = fractionVal?.slice(0, maxDecimalPlaces) || '';

  return {
    value: parseFloat(`${intNum}.${decimalPlaces}`),
    formattedVal:
      intValLocal +
      (fractionVal && allowComma ? decimal + decimalPlaces : trailingComma),
  };
};

const toShort = (string: string, minLength: number): boolean => {
  if (typeof string !== 'string') {
    throw new Error('Input must be a string');
  }
  if (typeof minLength !== 'number') {
    throw new Error('Minimum length must be a number');
  }
  return string.length < minLength;
};

const toLong = (string: string, maxlength: number): boolean => {
  if (typeof string !== 'string') {
    throw new Error('Input must be a string');
  }
  if (typeof maxlength !== 'number') {
    throw new Error('Maximum length must be a number');
  }
  return string.length > maxlength;
};

const isInRange = (
  value: number,
  min: number | undefined = undefined,
  max: number | undefined = undefined
): boolean => {
  return (
    (min === undefined || value >= min) && (max === undefined || value <= max)
  );
};

const checkStringLength = (
  string: string,
  min: number | undefined = undefined,
  max: number | undefined = undefined
): boolean => {
  return (
    (min === undefined || string.length >= min) &&
    (max === undefined || string.length <= max)
  );
};

const isStringOrNumber = (value: any): boolean => {
  return typeof value === 'string' || typeof value === 'number';
};

export {
  parseLocaleNumber,
  insertCharsAt,
  deleteCharAt,
  replaceCharAt,
  formatNumber,
  isInRange,
  checkStringLength,
  isStringOrNumber,
  toShort,
  toLong,
  parseNumber,
  getLocaleSeparators,
};
