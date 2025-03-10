import { describe, expect, it } from 'vitest';
import {
  parseLocaleNumber,
  insertCharsAt,
  deleteCharAt,
  replaceCharAt,
  isInRange,
  checkStringLength,
  isStringOrNumber,
  toShort,
  toLong,
} from '../../src/utils';

describe('insertCharsAt', () => {
  it('should insert a character at the specified position', () => {
    const string = 'hello';
    const chars = 'x';
    const position = 2;
    const result = insertCharsAt(string, chars, position);
    expect(result).toBe('hexllo');
  });

  it('should insert a string at the specified position', () => {
    const string = 'hello';
    const chars = 'xyz';
    const position = 2;
    const result = insertCharsAt(string, chars, position);
    expect(result).toBe('hexyzllo');
  });

  it('should insert at the beginning of the string if position is 0', () => {
    const string = 'hello';
    const chars = 'x';
    const position = 0;
    const result = insertCharsAt(string, chars, position);
    expect(result).toBe('xhello');
  });

  it('should insert at the end of the string if position is equal to the string length', () => {
    const string = 'hello';
    const chars = 'x';
    const position = 5;
    const result = insertCharsAt(string, chars, position);
    expect(result).toBe('hellox');
  });

  it('should insert at the beginning of the string if position is lower than 0 (e.g. -1)', () => {
    const string = 'hello';
    const chars = 'x';
    const position = -1;
    const result = insertCharsAt(string, chars, position);
    expect(result).toBe('xhello');
  });

  it('should insert at the end of the string if position is greater than the string length', () => {
    const string = 'hello';
    const chars = 'x';
    const position = 10;
    const result = insertCharsAt(string, chars, position);
    expect(result).toBe('hellox');
  });

  it('should return the original string if chars is an empty string', () => {
    const string = 'hello';
    const chars = '';
    const position = 2;
    const result = insertCharsAt(string, chars, position);
    expect(result).toBe('hello');
  });
});

// deleteCharAt
describe('deleteCharAt', () => {
  it('should delete a character at the specified position', () => {
    const string = 'hello';
    const start = 0;
    const result = deleteCharAt(string, start);
    expect(result).toBe('ello');
  });

  it('should not delete a character if start pos is lower than 0', () => {
    const string = 'hello';
    const start = -1;
    const result = deleteCharAt(string, start);
    expect(result).toBe('hello');
  });

  it('should not delete a character if start pos is higher or equal to string length', () => {
    const string = 'hello';
    const start = string.length;
    const result = deleteCharAt(string, start);
    expect(result).toBe('hello');
  });

  it('should not delete a range of characters', () => {
    const string = 'hello';
    const start = 0;
    const end = 2;
    const result = deleteCharAt(string, start, end);
    expect(result).toBe('llo');
  });

  it('should not delete if start and end positions a the same', () => {
    const string = 'hello';
    const start = 0;
    const end = 0;
    const result = deleteCharAt(string, start, end);
    expect(result).toBe('hello');
  });

  it('should delete one character a a given start position if end is undefined', () => {
    const string = 'hello';
    const start = 1;
    const end = undefined;
    const result = deleteCharAt(string, start, end);
    expect(result).toBe('hllo');
  });

  it('should return original string if start is undefined', () => {
    const string = 'hello';
    const start = undefined;
    // @ts-ignore
    const result = deleteCharAt(string, start);
    expect(result).toBe('hello');
  });

  it('should return original string if start position is higher than string length', () => {
    const string = 'hello';
    const start = 7;
    const result = deleteCharAt(string, start);
    expect(result).toBe('hello');
  });

  it('should return error if string is not of type string', () => {
    const string = undefined;
    const start = 0;
    // @ts-ignore
    expect(() => deleteCharAt(string, start)).toThrowError(
      'Input must be a string'
    );
  });

  it('should return original string if start is undefined', () => {
    const string = 'hello';
    const start = undefined;
    const end = 4;
    // @ts-ignore
    const result = deleteCharAt(string, start, end);
    expect(result).toBe('hello');
  });

  it('should return original string if end is higher than string length', () => {
    const string = 'hello';
    const start = 0;
    const end = 66;
    const result = deleteCharAt(string, start, end);
    expect(result).toBe('hello');
  });
});

// replaceCharAt
describe('replaceCharAt', () => {
  it('should replace a character at a specific position', () => {
    expect(replaceCharAt('hello', 'x', 2)).toBe('hexlo');
  });

  it('should replace multiple characters at a specific position', () => {
    expect(replaceCharAt('hello', 'xy', 2, 3)).toBe('hexylo');
  });

  it('should replace characters at the beginning of the string', () => {
    expect(replaceCharAt('hello', 'x', 0)).toBe('xello');
  });

  it('should replace characters at the end of the string', () => {
    expect(replaceCharAt('hello', 'x', 4)).toBe('hellx');
  });

  it('should throw an error for non-string input', () => {
    // @ts-ignore
    expect(() => replaceCharAt(123, 'x', 0)).toThrowError(
      'Input must be a string'
    );
  });

  it('should throw an error for invalid start position', () => {
    expect(() => replaceCharAt('hello', 'x', -1)).toThrowError(
      'Invalid start or end position'
    );
  });

  it('should throw an error for invalid end position', () => {
    expect(() => replaceCharAt('hello', 'x', 0, 10)).toThrowError(
      'Invalid start or end position'
    );
  });

  it('should throw an error for start position greater than end position', () => {
    expect(() => replaceCharAt('hello', 'x', 3, 2)).toThrowError(
      'Invalid start or end position'
    );
  });

  it('should use an empty string as default replacement if not provided', () => {
    expect(replaceCharAt('hello', '', 2)).toBe('helo');
  });

  it('should use an empty string as default replacement if null is provided', () => {
    // @ts-ignore
    expect(replaceCharAt('hello', null, 2)).toBe('helo');
  });
});

// parseLocaleNumber
describe('parseLocaleNumber', () => {
  it('should parse numbers with comma as thousand separator and dot as decimal', () => {
    expect(parseLocaleNumber('$ 12,738.44')).toBe(12738.44);
    expect(parseLocaleNumber('$ 12,001,738.44')).toBe(12001738.44);
  });

  it('should parse numbers with dot as thousand separator and comma as decimal', () => {
    expect(parseLocaleNumber('€ 12.738,44')).toBe(12738.44);
    expect(parseLocaleNumber('€ 12.001.738,44')).toBe(12001738.44);
  });

  it('should parse numbers with space as thousand separator and comma as decimal', () => {
    expect(parseLocaleNumber('£ 12 738,44')).toBe(12738.44);
    expect(parseLocaleNumber('£ 12 001 738,44')).toBe(12001738.44);
  });

  it('should parse numbers without thousand separator', () => {
    expect(parseLocaleNumber('€ 12.344')).toBe(12344);
    expect(parseLocaleNumber('€ 17.236')).toBe(17236);
    expect(parseLocaleNumber('€ 17.001.236')).toBe(17001236);
  });

  it('should parse numbers with comma as decimal separator', () => {
    expect(parseLocaleNumber('€ 444,4')).toBe(444.4);
    expect(parseLocaleNumber('€ 0,4')).toBe(0.4);
  });

  it('should parse small numbers correctly', () => {
    expect(parseLocaleNumber('€ 4,56')).toBe(4.56);
    expect(parseLocaleNumber('€ 4,5')).toBe(4.5);
    expect(parseLocaleNumber('€ 4')).toBe(4);
    expect(parseLocaleNumber('€ 0')).toBe(0);
    expect(parseLocaleNumber('€ -1')).toBe(-1);
  });

  it('should parse empty strings as NaN correctly', () => {
    expect(parseLocaleNumber('')).toBe(NaN);
  });

  it('should return number if it is allready a valid number', () => {
    expect(parseLocaleNumber('123')).toBe(123);
    expect(parseLocaleNumber('0.45')).toBe(0.45);
    expect(parseLocaleNumber('12230.4235')).toBe(12230.4235);
    expect(parseLocaleNumber('123.495')).toBe(123.495);
  });

  it('should remove all non numbers', () => {
    expect(parseLocaleNumber('123 j 456')).toBe(123456);
  });
});

describe('isInRange', () => {
  it('returns true when no bounds are defined', () => {
    expect(isInRange(10)).toBe(true);
  });

  it('returns true when value is greater than or equal to min', () => {
    expect(isInRange(10, 5)).toBe(true);
  });

  it('returns false when value is less than min', () => {
    expect(isInRange(5, 10)).toBe(false);
  });

  it('returns true when value is less than or equal to max', () => {
    expect(isInRange(5, undefined, 10)).toBe(true);
  });

  it('returns false when value is greater than max', () => {
    expect(isInRange(15, undefined, 10)).toBe(false);
  });

  it('returns true when value is within range', () => {
    expect(isInRange(5, 0, 10)).toBe(true);
  });

  it('returns false when value is outside range', () => {
    expect(isInRange(15, 0, 10)).toBe(false);
  });

  it('returns false when value is equal to min', () => {
    expect(isInRange(5, 5, 10)).toBe(true);
  });

  it('returns false when value is equal to max', () => {
    expect(isInRange(10, 5, 10)).toBe(true);
  });
});

describe('checkStringLength', () => {
  it('returns true when no bounds are defined', () => {
    expect(checkStringLength('hello')).toBe(true);
  });

  it('returns true when length is greater than or equal to min', () => {
    expect(checkStringLength('hello', 3)).toBe(true);
  });

  it('returns false when length is less than min', () => {
    expect(checkStringLength('hello', 10)).toBe(false);
  });

  it('returns true when length is less than or equal to max', () => {
    expect(checkStringLength('hello', undefined, 10)).toBe(true);
  });

  it('returns false when length is greater than max', () => {
    expect(checkStringLength('hello', undefined, 3)).toBe(false);
  });

  it('returns true when length is within range', () => {
    expect(checkStringLength('hello', 3, 10)).toBe(true);
  });

  it('returns false when length is outside range', () => {
    expect(checkStringLength('hello', 10, 20)).toBe(false);
  });

  it('returns true when length is equal to min', () => {
    expect(checkStringLength('abc', 3, 10)).toBe(true);
  });

  it('returns true when length is equal to max', () => {
    expect(checkStringLength('abcdefghij', 3, 10)).toBe(true);
  });
});

describe('isStringOrNumber', () => {
  it('returns true for strings', () => {
    expect(isStringOrNumber('hello')).toBe(true);
  });

  it('returns true for numbers', () => {
    expect(isStringOrNumber(123)).toBe(true);
  });

  it('returns false for booleans', () => {
    expect(isStringOrNumber(true)).toBe(false);
  });

  it('returns false for objects', () => {
    expect(isStringOrNumber({})).toBe(false);
  });

  it('returns false for null', () => {
    expect(isStringOrNumber(null)).toBe(false);
  });

  it('returns false for undefined', () => {
    expect(isStringOrNumber(undefined)).toBe(false);
  });
});

describe('toShort', () => {
  it('returns true when string is too short', () => {
    expect(toShort('hello', 6)).toBe(true);
  });

  it('returns false when string is long enough', () => {
    expect(toShort('hello', 3)).toBe(false);
  });

  it('returns true when string is empty', () => {
    expect(toShort('', 1)).toBe(true);
  });

  it('throws error when string is not a string', () => {
    // @ts-ignore
    expect(() => toShort(123, 1)).toThrowError('Input must be a string');
  });

  it('throws error when minLength is not a number', () => {
    // @ts-ignore
    expect(() => toShort('hello', 'a')).toThrowError(
      'Minimum length must be a number'
    );
  });
});

describe('toLong', () => {
  it('returns true when string is too long', () => {
    expect(toLong('hello', 4)).toBe(true);
  });

  it('returns false when string shorter', () => {
    expect(toLong('hello', 8)).toBe(false);
  });

  it('returns false when string is empty', () => {
    expect(toLong('', 1)).toBe(false);
  });

  it('throws error when string is not a string', () => {
    // @ts-ignore
    expect(() => toLong(123, 1)).toThrowError('Input must be a string');
  });

  it('throws error when maxLength is not a number', () => {
    // @ts-ignore
    expect(() => toLong('hello', 'a')).toThrowError(
      'returns true when string is empty length must be a number'
    );
  });
});
