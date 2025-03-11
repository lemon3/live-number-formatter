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

  // oninput = (evt: Event) => {
  //   const el = evt.target as HTMLInputElement | null;
  //   if (!el) return;
  //   this.element.dataset.value = el.value.replace(/\./g, '');
  // };

  onblur = () => {
    const el = this.element;
    if (',' === el.value.slice(-1)) {
      this.element.value = el.value.slice(0, -1);
    }
  };

  onkeydown = (evt: KeyboardEvent) => {
    const el = this.element;

    let key = evt.key;
    const cursorStart = el.selectionStart || 0;
    const cursorEnd = el.selectionEnd || 0;
    const multiSelect = cursorStart !== cursorEnd;

    // Check if the prefix is present and the cursor is within it
    const prefix = this.settings.prefix || '';
    const prefixLength = prefix.length || 0;

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

    let end = cursorEnd;
    let start = cursorStart;

    console.log(evt.key);
    // Handle special keys
    switch (evt.key) {
      case 'ArrowLeft':
        if (evt.shiftKey) {
          // end = cursorEnd;
          start =
            cursorStart - (prefixLength && cursorStart <= prefixLength ? 0 : 1);
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
        end = cursorEnd;
        start = prefixLength;

        if (evt.shiftKey) {
          if (multiSelect) {
            if ('right' === this.selectionDirection) {
              start = end = cursorStart;
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
        if (prefixLength && cursorStart < prefixLength) {
          el.setSelectionRange(prefixLength, end);
        } else if (
          prefixLength &&
          cursorStart === prefixLength &&
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
        if (prefixLength && 0 !== cursorStart && cursorStart < prefixLength) {
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
    console.log('onbeforeinput');
    evt.preventDefault();
    const el = this.element;

    let val = el.value;
    let startPosition = el.selectionStart;
    let endPosition = el.selectionEnd;

    if (null === endPosition || null === startPosition) {
      return;
    }

    let inputData = evt.data;

    if ('insertFromPaste' === evt.inputType) {
      let tmp = parseFloat(inputData || '');
      if (!isNaN(tmp)) inputData = '' + tmp;
      else if (null !== inputData && isNaN(+tmp)) return;
    }

    if ('.' === inputData) inputData = ',';
    const s = this.settings;
    let multiSelect = startPosition !== endPosition;

    if ('-' === inputData) {
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

    if (
      this.settings.prefix &&
      this.settings.prefix.length > 0 &&
      val.startsWith(this.settings.prefix)
    ) {
      val = val.slice(this.settings.prefix.length);
    }

    if (val.startsWith(',')) {
      val = '0' + val;
      // val = val.slice(1);
    } else if (val.startsWith('-,')) {
      val = '-0' + val.slice(1);
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
    // console.log('dataChanged to:', val);
    const el = evt.target as HTMLInputElement | null;
    if (!el) return;

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
      if ('deleteContentForward' === evt.inputType) {
        cursorPos--;
      }
      if ('.' === formattedVal[cursorPos - 1]) {
        cursorPos--;
      }
    }

    this.setMinus(formattedVal.indexOf('-') >= 0);

    el.value = formattedVal;
    const parsed = parseLocaleNumber(formattedVal);

    // console.log('>>>', cursorPos);

    if (cursorPos === null) cursorPos = formattedLen;
    else if (cursorPos < this.settings.prefix.length)
      cursorPos = this.settings.prefix.length;

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

  // onpaste = (evt) => {
  //   console.log(evt);
  //   evt.preventDefault();

  //   const pastedData = evt.clipboardData
  //     ? evt.clipboardData.getData('text')
  //     : window.clipboardData.getData('text');

  //   console.log(pastedData);
  //   this.dataChanged(evt, pastedData);
  // };

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
    // change to text if set to type number
    this.element.type = 'text';

    // this.element.addEventListener('input', this.oninput);
    this.element.addEventListener('keydown', this.onkeydown);
    this.element.addEventListener('blur', this.onblur);
    this.element.addEventListener('beforeinput', this.onbeforeinput);
    // this.element.addEventListener('paste', this.onpaste);

    if (this.settings.startValue) {
      this.setValue(this.settings.startValue);
    }
  }
}

export { NumberClass };
