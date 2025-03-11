import type { Number } from './index.types';
import { Emitter } from './utils/emitter';
import {
  insertCharsAt,
  deleteCharAt,
  replaceCharAt,
  formatNumber,
  parseLocaleNumber,
  isStringOrNumber,
} from './utils';

// event names for emitting
const INPUT = 'input';

const defaults = {
  startValue: null,
  prefix: null,
  suffix: null, // TODO: implement
  min: null,
  max: null,
  minlength: null,
  maxlength: null,
  showAffixWhenEmpty: false,
  allowComma: true,
  ltr: true, // TODO: implement -> left to right, default: true
};

class NumberClass extends Emitter implements Number {
  element: HTMLInputElement;
  options: any;
  settings: any;

  selectionDirection: string;
  defaultPrevented: boolean;
  to: any;
  // private _selectedCharsCount: number;
  private _value: string = '';
  private _formattedValue: string = '';
  isMinus: boolean = false;
  arrows: string[] = [];
  allowedKeys: string[] = [];
  error: boolean = false;

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
    // this._selectedCharsCount = 0;

    this.allowedEvents = [INPUT];
    this.init();
  }

  onblur = () => {
    const el = this.element;
    if (',' === el.value.slice(-1)) {
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

    if ('.' === key) key = ',';
    const val = el.value;

    // no double ','
    if (key === ',' && val.includes(',')) {
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

  onbeforeinput = (evt: InputEvent) => {
    evt.preventDefault();
    const el = this.element;
    let input = evt.data;

    if ('insertFromPaste' === evt.inputType) {
      let tmp = parseFloat(input || '');
      if (!isNaN(tmp)) input = '' + tmp;
      else if (null !== input && isNaN(+tmp)) return;
    }

    if ('.' === input) input = ',';

    let startPosition = el.selectionStart || 0;
    let endPosition = el.selectionEnd || 0;
    let val = el.value;
    const s = this.settings;
    let multiSelect = startPosition !== endPosition;

    if ('-' === input) {
      if (!this._value) return;
      let tmp;
      if (this.isMinus) {
        tmp = val.replace('-', '');
      } else {
        tmp = val.slice(0, s.prefix.length) + '-' + val.slice(s.prefix.length);
      }

      this.dataChanged(evt, tmp.slice(this.settings.prefix.length));
      return;
    }

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
          startPosition--;
        }
        if (startPosition >= 0) val = deleteCharAt(val, startPosition);
      } else {
        val = insertCharsAt(val, input as string, startPosition);
      }
    }

    const parsed = this._value || '';
    const newString = parsed.toString().replace('-', '');
    const newNumber = Number(parsed);

    if (isStringOrNumber(s.min) && newNumber < +s.min) {
      console.log('to small, min: ', s.min);
      return;
    }

    if (isStringOrNumber(s.max) && newNumber > +s.max) {
      console.log('to big, max: ', s.max);
      return;
    }

    if (isStringOrNumber(s.minlength) && newString.length < s.minlength) {
      console.log('to short');
      return;
    }

    if (isStringOrNumber(s.maxlength) && newString.length > s.maxlength) {
      console.log('to long', newString, newString.length, s.maxlength);
      return;
    }

    if (s.prefix && s.prefix.length > 0 && val.startsWith(s.prefix)) {
      val = val.slice(s.prefix.length);
    }

    if (val.startsWith(',')) {
      val = '0' + val;
      // val = val.slice(1);
    } else if (val.startsWith('-,')) {
      val = '-0' + val.slice(1);
    }

    this.dataChanged(evt, val);
  };

  dataChanged(evt: InputEvent, val: string) {
    // console.log('dataChanged to:', val);
    const el = this.element;

    const prevLen = el.value.length;
    const strBefore = val.length;
    const startPosition = el.selectionStart || 0;
    const endPosition = el.selectionEnd || 0;
    const multiSelect = startPosition !== endPosition;

    const formattedVal = formatNumber(
      val,
      this.settings.prefix,
      this.settings.showAffixWhenEmpty
    );
    const formattedLen = formattedVal.length;

    let cursorPos;

    if (strBefore <= prevLen) {
      cursorPos = endPosition - prevLen + formattedLen;
      if ('deleteContentForward' === evt.inputType && !multiSelect) {
        cursorPos++;
      }
    } else {
      cursorPos = startPosition - prevLen + formattedLen;
      // if ('deleteContentForward' === evt.inputType) {
      //   cursorPos--;
      // }
      // if ('.' === formattedVal[cursorPos - 1]) {
      //   cursorPos--;
      // }
    }

    this.setMinus(formattedVal.indexOf('-') >= 0);
    el.value = formattedVal;
    const parsed = parseLocaleNumber(formattedVal);

    // console.log('>>>', cursorPos);

    if (
      'undefined' === typeof cursorPos ||
      cursorPos < this.settings.prefix.length
    ) {
      cursorPos = this.settings.prefix.length;
    }

    el.setSelectionRange(cursorPos, cursorPos);

    const value = isNaN(parsed) ? '' : parsed.toString();

    this._value = value;
    this._formattedValue = formattedVal;

    const result = {
      value,
      formattedVal,
    };

    this.element.dataset.value = value;
    this.emit(INPUT, result);

    return result;
  }

  setValue(value: number | string = '') {
    let parsed = Number(value);
    if (isNaN(parsed)) return;
    if (!this.settings.allowComma) {
      parsed = Math.floor(parsed);
    }
    let formatted = Number(parsed).toLocaleString('de-DE');
    this.element.value = formatted;
    const inputEvent = new InputEvent('input');
    this.element.dispatchEvent(inputEvent);
    this.dataChanged(inputEvent, '' + formatted);
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

    // if comma is allowed, add keys to array
    if (this.settings.allowComma) {
      this.allowedKeys = [...this.allowedKeys, '.', ','];
    }

    this.settings.originalType = this.element.type;
    this.element.type = 'text';

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
