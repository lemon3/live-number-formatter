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
 * From a LocaleString to a number
 *
 * @param localeString The string to format
 * @returns number
 */
const parseLocaleNumber = (localeString: string): number => {
  if ('' === localeString) return NaN;

  if (!isNaN(Number(localeString))) {
    return Number(localeString);
  }

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

const formatNumber = (
  num: string | number,
  prefix: string = '',
  showAffixWhenEmpty: boolean = false
): string => {
  num = '' + num;
  if (prefix.length > 0 && num.startsWith(prefix)) {
    num = num.slice(prefix.length);
  }

  // Check if input is empty
  if (!num) return showAffixWhenEmpty ? prefix : '';

  // Check if input has a comma at the end
  let hasTrailingComma = num.endsWith(',');

  // Remove trailing comma if present
  // num = num.replace(/,$/, '');

  num = num.replaceAll('.', '');

  // Replace comma with dot if present
  num = num.replace(',', '.'); // us correct

  // Convert to number
  let number = Number(num);

  // Check if number is NaN (not a number)
  if (isNaN(number)) return '';

  // Split the number into integer and fractional parts
  let parts = num.split('.');

  // Format the integer part
  let integerPart = Number(parts[0]).toLocaleString('de-DE');

  // If there is a fractional part, append it to the integer part
  if (parts.length > 1) {
    return prefix + (integerPart + ',' + parts[1]);
  } else {
    // If there is no fractional part, return the integer part
    return prefix + (hasTrailingComma ? integerPart + ',' : integerPart);
  }
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
  console.log(min, max);
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
};
