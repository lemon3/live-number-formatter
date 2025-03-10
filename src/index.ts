import type { Number } from './index.types';
import { Emitter } from './utils/emitter';
import {
  insertCharsAt,
  deleteCharAt,
  replaceCharAt,
  formatNumber,
  parseLocaleNumber,
  // toShort,
  // toLong,
  // isInRange,
  // checkStringLength,
  isStringOrNumber,
} from './utils';

// event names for emitting
const INPUT = 'input';

const defaults = {
  prefix: '€ ',
  suffix: '', // TODO: implement
  min: null,
  max: null,
  minlength: 0,
  maxlength: 6,
  showAffixWhenEmpty: true,
  allowComma: false, // TODO: implement
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
  private _value: string;
  private _formattedValue: string;
  isMinus: boolean;

  constructor(el: any, options?: any) {
    super();
    this.element = el;
    this.options = options;
    this.settings = { ...defaults, ...options };

    this.selectionDirection = 'none';
    this.defaultPrevented = false;
    // this._selectedCharsCount = 0;
    this.isMinus = false;

    this._value = '';
    this._formattedValue = '';

    this.allowedEvents = [INPUT];

    this.init();
  }

  // oninput = (evt: Event) => {
  //   const el = evt.target as HTMLInputElement | null;
  //   if (!el) return;
  //   this.element.dataset.value = el.value.replace(/\./g, '');
  // };

  onblur = (evt: FocusEvent) => {
    const el = evt.currentTarget as HTMLInputElement | null;
    if (!el) return;

    if (',' === el.value.slice(-1)) {
      this.element.value = el.value.slice(0, -1);
    }
  };

  onkeydown = (evt: KeyboardEvent) => {
    const el = evt.currentTarget as HTMLInputElement | null;
    if (!el) return;

    const key = evt.key;
    const cursorStartPos = el.selectionStart || 0;
    const cursorEndPos = el.selectionEnd || 0;
    const multiSelect = cursorStartPos !== cursorEndPos;

    // console.log(key);

    // Check if the prefix is present and the cursor is within it
    const prefix = this.settings.prefix || '';
    const prefixLength = prefix.length || 0;

    const arrows = ['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft'];
    // TODO: '+', '-', 'e',
    const allowedKeys = [
      ...arrows,
      '.',
      ',',
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

    // Handle special keys
    if (
      ((evt.metaKey || evt.ctrlKey) && evt.key === 'c') ||
      (evt.metaKey && !arrows.includes(key))
    ) {
      // Allow cmd+c (or ctrl+c) to copy text
      return;
    }

    // Prevent default behavior for disallowed keys
    if (!allowedKeys.includes(key)) {
      evt.stopPropagation();
      evt.preventDefault();
      return false;
    }

    let end = cursorEndPos;
    let start = cursorStartPos;

    // Handle special keys
    switch (evt.key) {
      case 'ArrowLeft':
        if (evt.shiftKey) {
          end = cursorEndPos;
          start =
            cursorStartPos -
            (prefixLength && cursorStartPos <= prefixLength ? 0 : 1);
          if (!multiSelect) {
            this.selectionDirection = 'left';
          }
          // this.calcSelectionCount(el);
        } else {
          end = start;
          this.selectionDirection = 'none';
        }

        if (prefixLength && start <= prefixLength) {
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
          // this.calcSelectionCount(el);
        } else {
          this.defaultPrevented = false;
          this.selectionDirection = 'none';
        }
        break;

      case 'ArrowUp':
        end = cursorEndPos;
        start = prefixLength;

        if (evt.shiftKey) {
          if (multiSelect) {
            if ('right' === this.selectionDirection) {
              start = end = cursorStartPos;
              this.selectionDirection = 'none';
            }
          } else {
            this.selectionDirection = 'left';
            // this.calcSelectionCount(el);
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
          // this.calcSelectionCount(el);
        } else {
          this.defaultPrevented = false;
          this.selectionDirection = 'none';
        }
        break;

      case 'Backspace':
        if (prefixLength && cursorStartPos < prefixLength) {
          el.setSelectionRange(prefixLength, end);
        } else if (
          prefixLength &&
          cursorStartPos === prefixLength &&
          !multiSelect
        ) {
          evt.preventDefault();
        }

        break;

      // case '-':
      //   break;

      // case 'Delete':
      //   break;

      default:
        if (
          prefixLength &&
          0 !== cursorStartPos &&
          cursorStartPos < prefixLength
        ) {
          evt.preventDefault();
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

    const el = evt.target as HTMLInputElement | null;
    if (!el) return;

    const inputData = evt.data;
    let val = el.value;
    let startPosition = el.selectionStart;
    let endPosition = el.selectionEnd;
    let multiSelect = startPosition !== endPosition;
    const s = this.settings;

    if (null === endPosition || null === startPosition) {
      return;
    }

    if ('-' === inputData) {
      let tmp;
      if (this.isMinus) {
        tmp = val.replace('-', '');
      } else {
        tmp = val.slice(0, s.prefix.length) + '-' + val.slice(s.prefix.length);
      }
      this.setMinus(!this.isMinus);
      this.dataChanged(evt, tmp);
      return;
    }

    // insertText
    // insertFromPaste
    if (multiSelect) {
      // isDeleting
      if (
        evt.inputType === 'deleteContentForward' ||
        evt.inputType === 'deleteContentBackward'
      ) {
        val = deleteCharAt(val, startPosition, endPosition);
      } else {
        val = replaceCharAt(
          val,
          inputData as string,
          startPosition,
          endPosition
        );
      }
    } else {
      if (null === inputData) {
        if ('deleteContentForward' !== evt.inputType) {
          startPosition--;
        }
        if (startPosition >= 0) val = deleteCharAt(val, startPosition);
      } else {
        val = insertCharsAt(val, inputData as string, startPosition);
      }
    }

    this.setMinus(val.indexOf('-') > 0);

    const parsed = parseLocaleNumber(val) || '';
    const newString = parsed.toString().replace('-', '');
    const newNumber = Number(parsed);

    if (isStringOrNumber(s.min) && newNumber < +s.min) {
      console.log('to small, min: ', s.min);
      // this.dataChanged(evt, s.min);
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

    this.dataChanged(evt, val);
  };

  // calcSelectionCount(el: HTMLInputElement) {
  //   if (this.to) clearTimeout(this.to);
  //   this.to = setTimeout(() => {
  //     const start = el.selectionStart || 0;
  //     const end = el.selectionEnd || 0;
  //     // this._selectedCharsCount = Math.abs(end - start);
  //     clearTimeout(this.to);
  //   }, 0);
  // }

  dataChanged(evt: InputEvent, val: string) {
    const el = evt.target as HTMLInputElement | null;
    if (!el) return;

    const prevLen = el.value.length;
    const strBefore = val.length;

    console.log(strBefore, prevLen);

    // if (0 === prevLen && 0 === strBefore) return;

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
      if ('deleteContentForward' === evt.inputType) {
        cursorPos--;
      }
      if ('.' === formattedVal[cursorPos - 1]) {
        cursorPos--;
      }
    }

    el.value = formattedVal;
    if (cursorPos === null) cursorPos = formattedLen;
    el.setSelectionRange(cursorPos, cursorPos);

    // get number string
    const parsed = parseLocaleNumber(formattedVal);
    const value = isNaN(parsed) ? '' : parsed.toString();

    this.element.dataset.value = value;
    this._value = value;
    this._formattedValue = formattedVal;

    const result = {
      value,
      formattedVal,
    };

    this.emit(INPUT, result);

    return result;
  }

  setValue(value: number | string = '') {
    const parsed = Number(value);
    if (isNaN(parsed)) return;
    this.element.value = '' + parsed;
    const bi = new InputEvent('input');
    this.element.dispatchEvent(bi);
    this.dataChanged(bi, '' + parsed);
  }

  getFormattedValue() {
    return this._value;
  }

  getValue() {
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

    this.settings.originalType = this.element.type;
    // change to text if set to type number
    this.element.type = 'text';

    // this.element.addEventListener('input', this.oninput);
    this.element.addEventListener('keydown', this.onkeydown);
    this.element.addEventListener('blur', this.onblur);
    this.element.addEventListener('beforeinput', this.onbeforeinput);
  }
}

export { NumberClass };
