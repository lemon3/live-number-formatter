import type { Number, Options, LocalNumber } from './index.types';
import { Emitter } from './utils/emitter';
import {
  insertCharsAt,
  deleteCharAt,
  replaceCharAt,
  isStringOrNumber,
  formatNumber,
  getLocaleSeparators,
} from './utils';

// event names for emitting
const INPUT_EVENT = 'input';
const MINUS_SIGN = '-';
const DECIMAL_DOT = '.';
const DECIMAL_COMMA = ',';

class NumberClass extends Emitter implements Number {
  private _value: string = '';
  private _formattedValue: string = '';

  static readonly defaults: Options = {
    startValue: null,
    prefix: null,
    suffix: null, // TODO: implement
    locale: 'en-US',
    min: null,
    max: null,
    showAffixWhenEmpty: false,
    allowComma: true,
    maxDecimalPlaces: null,
    ltr: true, // TODO: implement -> left to right, default: true
  };

  element;
  options;
  settings;
  selectionDirection;
  defaultPrevented;

  isMinus = false;
  arrows: string[] = [];
  allowedKeys: Set<string> = new Set([
    '0',
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    'Backspace',
    'Delete',
    'Tab',
    MINUS_SIGN,
  ]);
  error = false;
  localNumber = {
    decimal: DECIMAL_DOT,
    group: DECIMAL_COMMA,
  };
  originalType = '';

  constructor(
    element: string | HTMLInputElement | undefined | null,
    options?: Options
  ) {
    super();

    const _element =
      'string' === typeof element
        ? (document.querySelector(element) as HTMLInputElement)
        : element;

    if (null === _element || !_element) {
      throw new Error('no element given');
    }

    this.element = _element;
    this.options = options as Options;
    this.settings = { ...NumberClass.defaults, ...options };

    this.selectionDirection = 'none';
    this.defaultPrevented = false;

    this.allowedEvents = [INPUT_EVENT];

    this.init();
  }

  swapSeparators(
    str: string,
    oldSeparators: LocalNumber,
    newSeparators: LocalNumber
  ) {
    return str
      .replace(new RegExp(`[${oldSeparators.decimal}]`, 'g'), '#')
      .replace(new RegExp(`[${oldSeparators.group}]`, 'g'), newSeparators.group)
      .replace(/#/g, newSeparators.decimal);
  }

  update(option: Options) {
    const oldSeparators = { ...this.localNumber };

    this.settings = { ...this.settings, ...option };
    if (this.settings.locale) {
      this.localNumber = getLocaleSeparators(this.settings.locale);
    }

    if (this._value) {
      this._formattedValue = this.swapSeparators(
        this._formattedValue,
        oldSeparators,
        this.localNumber
      );
    }
    this._setNewValues(this._createNewValues(this._formattedValue));
  }

  onblur = () => {
    const el = this.element;
    if (this.localNumber.decimal === el.value.slice(-1)) {
      this.element.value = el.value.slice(0, -1);
    }
  };

  onkeydown = (evt: KeyboardEvent) => {
    // console.log('onkeydown');
    const el = this.element;
    let key = evt.key;

    // Handle special keys
    if (
      ((evt.metaKey || evt.ctrlKey) && evt.key === 'c') ||
      (evt.metaKey && !this.arrows.includes(key))
    ) {
      return false;
    }

    const decimal = this.localNumber.decimal;
    if (DECIMAL_DOT === key || DECIMAL_COMMA === key) key = decimal;

    const cursorStart = el.selectionStart || 0;
    const cursorEnd = el.selectionEnd || 0;
    const multi = cursorStart !== cursorEnd;
    const val = el.value;

    const valRange = val.slice(cursorStart, cursorEnd);
    const hasDecimal = key === decimal && val.includes(decimal);

    if (hasDecimal && valRange.includes(decimal)) {
      return false;
    }

    if (hasDecimal || !this.allowedKeys.has(key)) {
      evt.stopPropagation();
      evt.preventDefault();
      return false;
    }

    const prefix = this.settings.prefix || '';
    const prefixLen = prefix.length;

    if (!prefixLen) return;

    let end = cursorEnd;
    let start = cursorStart;

    // Handle special keys, only needed when prefix is used!!!
    switch (evt.key) {
      case 'ArrowLeft':
        if (evt.shiftKey) {
          start = cursorStart - (cursorStart <= prefixLen ? 0 : 1);
          if (!multi) this.selectionDirection = 'left';
        } else {
          end = start;
          this.selectionDirection = 'none';
        }

        if (start <= prefixLen) {
          el.setSelectionRange(start, end, 'forward');
          evt.preventDefault();
          this.defaultPrevented = true;
          return;
        }
        break;

      case 'ArrowRight':
        if (evt.shiftKey) {
          if (this.defaultPrevented) {
            el.setSelectionRange(start, end, 'backward');
          }
          this.selectionDirection = 'right';
        } else {
          this.selectionDirection = 'none';
        }
        break;

      case 'ArrowUp':
        end = cursorEnd;
        start = prefixLen;

        if (evt.shiftKey) {
          if (multi) {
            if ('right' === this.selectionDirection) {
              start = end = cursorStart;
              this.selectionDirection = 'none';
            }
          } else {
            this.selectionDirection = 'left';
          }
        } else {
          end = start;
          this.selectionDirection = 'none';
        }

        el.setSelectionRange(start, end, 'forward');
        evt.preventDefault();
        this.defaultPrevented = true;
        return;

      case 'ArrowDown':
        if (evt.shiftKey) {
          if (this.defaultPrevented) {
            el.setSelectionRange(start, end, 'backward');
          }
          this.selectionDirection = 'right';
        } else {
          this.selectionDirection = 'none';
        }
        break;

      case 'Backspace':
        if (cursorStart < prefixLen) {
          el.setSelectionRange(prefixLen, end);
        } else if (cursorStart === prefixLen && !multi) {
          evt.preventDefault();
        }
        break;

      default:
        if (0 !== cursorStart && cursorStart < prefixLen) {
          el.setSelectionRange(prefixLen, prefixLen);
          // evt.preventDefault();
        }
        break;
    }
    this.defaultPrevented = false;
  };

  setMinus(minus: boolean = true) {
    if (minus) {
      this.element.classList.add('is-negative');
    } else {
      this.element.classList.remove('is-negative');
    }
    this.isMinus = minus;
  }

  // TODO: testing
  validateValue(input: string): {
    error: boolean;
    value: number | string;
  } {
    const { min, max } = this.settings;
    const numericValue = Number(input);

    // min value
    if (isStringOrNumber(min) && min && numericValue < +min) {
      return { error: true, value: min };
    }

    // max value
    if (isStringOrNumber(max) && max && numericValue > +max) {
      return { error: true, value: max };
    }

    return { error: false, value: 0 };
  }

  _setNewValues({
    value,
    formattedVal,
  }: {
    value: string;
    formattedVal: string;
  }) {
    this.setMinus(
      // @ts-ignore
      formattedVal.indexOf(MINUS_SIGN) >= this.settings.prefix.length
    );

    value = isNaN(+value) ? '' : value.toString();
    this.element.value = this._formattedValue = formattedVal;
    this.element.dataset.value = this._value = value;

    const result = { value, formattedVal };
    this.emit(INPUT_EVENT, result);
    return result;
  }

  applyPrefix(value: string = '') {
    if (this.settings.showAffixWhenEmpty || value !== '') {
      return this.settings.prefix ? this.settings.prefix + value : value;
    }
    return value;
  }

  _createNewValues(val: string): { value: string; formattedVal: string } {
    const s = this.settings;
    // console.log('dataChanged to:', val);

    // val = val.replaceAll(this.localNumber.group, '');
    let { value, formattedVal } = formatNumber(
      val,
      s.locale,
      s.allowComma,
      s.maxDecimalPlaces
    );

    formattedVal = this.applyPrefix(formattedVal);
    return { value: '' + value, formattedVal };
  }

  onbeforeinput = (evt: InputEvent) => {
    // console.log('onbeforeinput');
    evt.preventDefault();
    const el = this.element;
    const decimal = this.localNumber.decimal;

    let input = evt.data;
    if (DECIMAL_DOT === input || DECIMAL_COMMA === input) input = decimal;

    if ('insertFromPaste' === evt.inputType) {
      let tmp = parseFloat(input || '');
      if (!isNaN(tmp)) input = '' + tmp;
      else if (null !== input && isNaN(+tmp)) return;
    }

    const s = this.settings;
    const prefix = s.prefix || '';
    const prefixLen = prefix.length;

    let val = el.value;

    // minus is added
    if (MINUS_SIGN === input) {
      val = this.isMinus
        ? val.replace(MINUS_SIGN, '')
        : MINUS_SIGN + val.slice(prefixLen);
      this._setNewValues(this._createNewValues(val));
      return;
    }

    let startPosition = el.selectionStart || 0;
    let endPosition = el.selectionEnd || 0;
    let multiSelect = startPosition !== endPosition;

    // multiSelect
    if (multiSelect) {
      // isDeleting
      if (
        evt.inputType === 'deleteContentForward' ||
        evt.inputType === 'deleteContentBackward'
      ) {
        val = deleteCharAt(val, startPosition, endPosition);
      } else {
        val = replaceCharAt(val, input as string, startPosition, endPosition);
      }
    } else {
      if (null === input) {
        if ('deleteContentForward' !== evt.inputType) {
          startPosition = Math.max(prefixLen, --startPosition);
        }
        val = deleteCharAt(val, startPosition);
      } else {
        val = insertCharsAt(val, input as string, startPosition);
      }
    }

    if (prefixLen > 0 && val.startsWith(prefix)) val = val.slice(prefixLen);

    if (val.startsWith(MINUS_SIGN + decimal)) {
      val = '-0' + val.slice(1);
    } else if (val.startsWith(decimal)) {
      val = '0' + val;
    }

    let { value, formattedVal } = this._createNewValues(val);

    const { error, value: newValue } = this.validateValue(value);
    if (error) {
      ({ value, formattedVal } = this._createNewValues('' + newValue));
    }

    let cursorPos =
      input === decimal
        ? formattedVal.indexOf(decimal) + 1
        : Math.max(
            prefix.length,
            endPosition - el.value.length + formattedVal.length
          );
    if ('deleteContentForward' === evt.inputType && !multiSelect) {
      cursorPos++;
    }

    // console.log('>>>', cursorPos);

    this._setNewValues({ value, formattedVal });
    el.setSelectionRange(cursorPos, cursorPos);
  };

  setValue(input: number | string = '') {
    let num = Number(input);
    let parsed = isNaN(num)
      ? input
      : ('' + num).replace(DECIMAL_DOT, this.localNumber.decimal);
    if (!/^[0-9\-,.]*$/.test('' + parsed)) {
      parsed = '';
    }
    this._setNewValues(this._createNewValues(parsed.toString()));
  }

  getValue() {
    return this._value;
  }

  getFormattedValue() {
    return this._formattedValue;
  }

  kill() {
    // change to text if set to type number
    this.element.type = this.originalType;
    this.element.value = ''; // TODO: use the last value given!
  }

  init() {
    if (!this.element) {
      throw new Error('Failed to find element');
    }
    const s = this.settings;

    if (!s.locale) {
      throw new Error('no locale defined');
    }

    this.localNumber = getLocaleSeparators(s.locale);

    if (!s.prefix) {
      s.prefix = '';
    }

    this._formattedValue = s.showAffixWhenEmpty ? s.prefix : '';
    this.arrows = ['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft'];

    // TODO: '+', 'e',
    this.allowedKeys = new Set([...this.allowedKeys, ...this.arrows]);

    this.originalType = this.element.type;
    let inputMode = 'numeric';

    if (0 === s.maxDecimalPlaces) {
      s.allowComma = false;
    } else if (null === s.maxDecimalPlaces) {
      s.maxDecimalPlaces = 10;
    }

    // if comma is allowed, add keys to array
    if (s.allowComma) {
      this.allowedKeys = new Set([
        ...this.allowedKeys,
        DECIMAL_DOT,
        DECIMAL_COMMA,
      ]);
      inputMode = 'decimal';
    }

    this.element.type = 'text';
    this.element.pattern = '^-?[0-9.,]*$';
    this.element.inputMode = inputMode;

    this.element.addEventListener('keydown', this.onkeydown);
    this.element.addEventListener('blur', this.onblur);
    this.element.addEventListener('beforeinput', this.onbeforeinput);

    if (s.startValue) {
      this.setValue(s.startValue);
    } else {
      this.element.value = s.prefix;
    }
  }
}

export default NumberClass;
