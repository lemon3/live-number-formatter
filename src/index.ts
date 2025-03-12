import type { Number } from './index.types';
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
const INPUT = 'input';

const defaults = {
  startValue: null,
  prefix: null,
  suffix: null, // TODO: implement
  locale: 'en-US',
  min: null,
  max: null,
  minlength: null,
  maxlength: null,
  showAffixWhenEmpty: false,
  allowComma: true,
  maxDecimalPlaces: 2,
  ltr: true, // TODO: implement -> left to right, default: true
};

class NumberClass extends Emitter implements Number {
  private _value: string = '';
  private _formattedValue: string = '';

  element: HTMLInputElement;
  options: any;
  settings: any;
  selectionDirection: string;
  defaultPrevented: boolean;

  isMinus: boolean = false;
  arrows: string[] = [];
  allowedKeys: string[] = [];
  error: boolean = false;
  localNumber: { decimal: string; group: string } = {
    decimal: '.',
    group: ',',
  };

  constructor(element: any, options?: any) {
    super();

    element =
      'string' === typeof element ? document.querySelector(element) : element;

    if (null === element || 0 === element.length) {
      throw { error: true };
    }

    this.element = element;
    this.options = options;
    this.settings = { ...defaults, ...options };

    this.selectionDirection = 'none';
    this.defaultPrevented = false;

    this.allowedEvents = [INPUT];
    this.init();
  }

  onblur = () => {
    const el = this.element;
    if (this.localNumber.decimal === el.value.slice(-1)) {
      this.element.value = el.value.slice(0, -1);
    }
  };

  onkeydown = (evt: KeyboardEvent) => {
    const el = this.element;
    let key = evt.key;

    // Handle special keys
    if (
      ((evt.metaKey || evt.ctrlKey) && evt.key === 'c') ||
      (evt.metaKey && !this.arrows.includes(key))
    ) {
      // Allow cmd+c (or ctrl+c) to copy text
      return;
    }

    // Prevent default behavior for disallowed keys
    if (!this.allowedKeys.includes(key)) {
      evt.stopPropagation();
      evt.preventDefault();
      return false;
    }

    if ('.' === key || ',' === key) key = this.localNumber.decimal;
    const val = el.value;

    // no double decimal separator
    if (
      key === this.localNumber.decimal &&
      val.includes(this.localNumber.decimal)
    ) {
      evt.preventDefault();
      return;
    }

    const prefix = this.settings.prefix || '';
    const prefixLen = prefix.length;

    if (0 === prefixLen) return;

    const cursorStart = el.selectionStart || 0;
    const cursorEnd = el.selectionEnd || 0;
    const multi = cursorStart !== cursorEnd;

    let end = cursorEnd;
    let start = cursorStart;

    // Handle special keys
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
        }
        break;

      case 'ArrowRight':
        if (evt.shiftKey) {
          if (this.defaultPrevented) {
            this.defaultPrevented = false;
            el.setSelectionRange(start, end, 'backward');
          }
          this.selectionDirection = 'right';
        } else {
          this.defaultPrevented = false;
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
        break;

      case 'ArrowDown':
        if (evt.shiftKey) {
          if (this.defaultPrevented) {
            this.defaultPrevented = false;
            el.setSelectionRange(start, end, 'backward');
          }
          this.selectionDirection = 'right';
        } else {
          this.defaultPrevented = false;
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
  checkInput() {
    const s = this.settings;
    const parsed = this._value || '';
    const newString = parsed.toString().replace('-', '');
    const newNumber = Number(parsed);

    if (isStringOrNumber(s.min) && newNumber < +s.min) {
      console.log('to small, min: ', s.min);
      return false;
    }

    if (isStringOrNumber(s.max) && newNumber > +s.max) {
      console.log('to big, max: ', s.max);
      return false;
    }

    if (isStringOrNumber(s.minlength) && newString.length < s.minlength) {
      console.log('to short');
      return false;
    }

    if (isStringOrNumber(s.maxlength) && newString.length > s.maxlength) {
      console.log('to long', newString, newString.length, s.maxlength);
      return false;
    }

    return true;
  }

  _setNewValues({
    value,
    formattedVal,
  }: {
    value: number;
    formattedVal: string;
  }) {
    this.setMinus(formattedVal.indexOf('-') >= this.settings.prefix.length);
    this.element.value = formattedVal;

    const _value = isNaN(value) ? '' : value.toString();

    this._value = _value;
    this._formattedValue = formattedVal;
    this.element.dataset.value = _value;

    const result = {
      value: _value,
      formattedVal,
    };

    this.emit(INPUT, result);
    return result;
  }

  _createNewValues(val: string): { value: number; formattedVal: string } {
    const s = this.settings;
    // console.log('dataChanged to:', val);

    let { value, formattedVal } = formatNumber(
      val,
      s.locale,
      s.allowComma,
      s.maxDecimalPlaces
    );

    // add prefix if needed
    if (s.prefix) {
      if (!formattedVal) {
        formattedVal = s.showAffixWhenEmpty ? s.prefix : '';
      } else {
        formattedVal = s.prefix + formattedVal;
      }
    }
    return { value, formattedVal };
  }

  onbeforeinput = (evt: InputEvent) => {
    evt.preventDefault();
    const el = this.element;
    let input = evt.data;
    if ('.' === input || ',' === input) input = this.localNumber.decimal;

    if ('insertFromPaste' === evt.inputType) {
      let tmp = parseFloat(input || '');
      if (!isNaN(tmp)) input = '' + tmp;
      else if (null !== input && isNaN(+tmp)) return;
    }

    const s = this.settings;
    const prefixLen = s.prefix.length;
    let val = el.value;

    // minus is added
    if ('-' === input) {
      // if (!this._value) return;
      val = this.isMinus ? val.replace('-', '') : '-' + val.slice(prefixLen);
      this._setNewValues(this._createNewValues(val));
      return;
    }

    let startPosition = el.selectionStart || 0;
    let endPosition = el.selectionEnd || 0;

    // multiSelect
    if (startPosition !== endPosition) {
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

    const check = this.checkInput();
    if (!check) return;

    if (prefixLen > 0 && val.startsWith(s.prefix)) val = val.slice(prefixLen);

    if (val.startsWith(this.localNumber.decimal)) {
      val = '0' + val; // val = val.slice(1);
    } else if (val.startsWith(`-${this.localNumber.decimal}`)) {
      val = '-0' + val.slice(1);
    }

    const { value, formattedVal } = this._createNewValues(val);

    let cursorPos = Math.max(
      s.prefix.length,
      endPosition - el.value.length + formattedVal.length
    );
    if (
      'deleteContentForward' === evt.inputType &&
      startPosition === endPosition // no multiselect
    ) {
      cursorPos++;
    }
    // console.log('>>>', cursorPos);

    this._setNewValues({ value, formattedVal });
    el.setSelectionRange(cursorPos, cursorPos);
  };

  setValue(input: number | string = '') {
    let parsed = Number(input);
    if (isNaN(parsed)) return;
    this._setNewValues(this._createNewValues('' + parsed));
  }

  getValue() {
    return this._value;
  }

  getFormattedValue() {
    return this._formattedValue;
  }

  kill() {
    // change to text if set to type number
    this.element.type = this.settings.originalType;
    this.element.value = ''; // TODO: use the last value given!
  }

  init() {
    if (!this.element) {
      throw new Error('Failed to find form, result or num elements');
    }

    this.localNumber = getLocaleSeparators(this.settings.locale);

    if (!this.settings.prefix) {
      this.settings.prefix = '';
    }

    this.arrows = ['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft'];

    // TODO: '+', 'e',
    this.allowedKeys = [
      ...this.arrows,
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
      '-',
    ];

    this.settings.originalType = this.element.type;
    this.element.setAttribute('type', 'text');
    let inputMode = 'numeric';

    // if comma is allowed, add keys to array
    if (this.settings.allowComma) {
      this.allowedKeys = [...this.allowedKeys, '.', ','];
      inputMode = 'decimal';
    }
    this.element.setAttribute('inputmode', inputMode);

    this.element.addEventListener('keydown', this.onkeydown);
    this.element.addEventListener('blur', this.onblur);
    this.element.addEventListener('beforeinput', this.onbeforeinput);

    if (this.settings.startValue) {
      this.setValue(this.settings.startValue);
    } else {
      this.element.value = this.settings.prefix;
    }
  }
}

export { NumberClass };
