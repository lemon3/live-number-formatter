import { vi, describe, expect, it, beforeEach, afterEach, test } from 'vitest';
import LiveNumberFormatter from '../src/index';

beforeEach(() => {
  globalThis.document = window.document;
  globalThis.window = window;
});

describe('LiveNumberFormatter and static methods', () => {
  it('LiveNumberFormatter should be an Object', () => {
    expect(LiveNumberFormatter).toBeTruthy();
    expect(typeof LiveNumberFormatter).toBe('function');
  });

  it('LiveNumberFormatter defaults -> is Object', () => {
    expect(LiveNumberFormatter.defaults).toBeTruthy();
    expect(typeof LiveNumberFormatter.defaults).toBe('object');
  });
});

describe('LiveNumberFormatter initialisation', () => {
  // beforeEach(() => {
  // });

  it('new LiveNumberFormatter(el) should be an Object', () => {
    const inp = document.createElement('input');
    const nc = new LiveNumberFormatter(inp);
    expect(nc).toBeTruthy();
    expect(nc).instanceOf(LiveNumberFormatter);
    expect(typeof nc).toBe('object');
  });

  it("new LiveNumberFormatter('string') should be an Object", () => {
    const inp = document.createElement('input');
    inp.id = 'test';
    document.body.append(inp);
    const nc = new LiveNumberFormatter('#test');
    expect(nc).toBeTruthy();
    expect(nc).instanceOf(LiveNumberFormatter);
    expect(typeof nc).toBe('object');

    inp.remove();
  });

  it('call new LiveNumberFormatter() without params, should give an error', () => {
    const inp = document.getElementById('test');
    expect(() => {
      // @ts-ignore
      new LiveNumberFormatter();
    }).toThrowError('no element given');
  });

  it("new LiveNumberFormatter('string', {}) should be an Object", () => {
    const inp = document.createElement('input');
    inp.id = 'test';
    document.body.append(inp);
    const options = {};
    const nc = new LiveNumberFormatter('#test', options);
    expect(nc).toBeTruthy();
    expect(nc).instanceOf(LiveNumberFormatter);
    expect(typeof nc).toBe('object');

    inp.remove();
  });

  it("new LiveNumberFormatter('string', options) should be an Object", () => {
    const inp = document.createElement('input');
    const startValue = 1234.44;
    document.body.append(inp);
    const options = {
      startValue,
      prefix: '>> ',
      locale: 'de-DE',
      showAffixWhenEmpty: true,
      allowComma: true,
      maxDecimalPlaces: 2,
    };
    const nc = new LiveNumberFormatter(inp, options);
    expect(nc.getValue()).toBe('' + startValue);
    expect(nc.getFormattedValue()).toBe('>> 1.234,44');
    expect(nc.element).toBe(inp);

    inp.remove();
  });
});

describe('setValue testing', () => {
  let inp;
  let nc;
  let options;

  beforeEach(() => {
    inp = document.createElement('input');
    inp.id = 'test';
    document.body.append(inp);
    options = { locale: 'de-DE' };
    nc = new LiveNumberFormatter(inp, options);
  });

  afterEach(() => {
    inp.remove();
  });

  test('with correct number value', () => {
    const val = 19234.41;
    nc.setValue(val);
    expect(nc.getValue()).toBe('' + val);
    expect(nc.getFormattedValue()).toBe('19.234,41');
  });

  test('with correct string value', () => {
    const val = '19234.41';
    nc.setValue(val);
    expect(nc.getValue()).toBe('' + val);
    expect(nc.getFormattedValue()).toBe('19.234,41');
  });

  test('with wrong string value', () => {
    const val = '-ds3.3441';
    nc.setValue(val);
    expect(nc.getValue()).toBe('');
    expect(nc.getFormattedValue()).toBe('');
  });
});

describe('settings / options testing', () => {
  let inp;

  beforeEach(() => {
    inp = document.createElement('input');
    document.body.append(inp);
  });

  // locale
  test("'locale': with empty string", () => {
    const options = { locale: '' };
    expect(() => {
      new LiveNumberFormatter(inp, options);
    }).toThrowError('no locale defined');
  });

  test("'locale' with null", () => {
    const options = { locale: null };
    expect(() => {
      // @ts-ignore
      new LiveNumberFormatter(inp, options);
    }).toThrowError('no locale defined');
  });

  // startValue
  test("'startValue' with null", () => {
    const startValue = null;
    const options = { startValue };
    const nc = new LiveNumberFormatter(inp, options);
    expect(nc.getValue()).toBe('');
  });

  test("'startValue' with '23dd4'", () => {
    const startValue = '23dd4';
    const options = { startValue };
    // @ts-ignore
    const nc = new LiveNumberFormatter(inp, options);
    expect(nc.getValue()).toBe('');
  });

  test("'startValue' with '1234.56'", () => {
    const startValue = '-17234.56';
    const options = { startValue };
    // @ts-ignore
    const nc = new LiveNumberFormatter(inp, options);
    expect(nc.getValue()).toBe('-17234.56');
  });

  // prefix
  test("'prefix' with null", () => {
    const prefix = null;
    const options = { prefix };
    const nc = new LiveNumberFormatter(inp, options);
    expect(nc.getFormattedValue()).toBe('');
  });

  test("'prefix' with '>> '", () => {
    const prefix = '>> ';
    const options = { prefix };
    const nc = new LiveNumberFormatter(inp, options);
    expect(nc.getFormattedValue()).toBe('');
    nc.setValue(123.4);
    expect(nc.getFormattedValue()).toBe(prefix + '123.4');
  });

  // allowComma
  test("'allowComma': 'false'", () => {
    const startValue = '1234.56';
    const options = { allowComma: false, startValue };
    const nc = new LiveNumberFormatter(inp, options);
    expect(nc.getValue()).toBe('1234');
  });

  test("'allowComma': 'true'", () => {
    const startValue = '1234.56';
    const options = { allowComma: true, startValue };
    const nc = new LiveNumberFormatter(inp, options);
    expect(nc.getValue()).toBe('1234.56');
  });

  // showAffixWhenEmpty
  test("'showAffixWhenEmpty': 'true'", () => {
    const prefix = ':-)';
    const options = { showAffixWhenEmpty: true, prefix };
    const nc = new LiveNumberFormatter(inp, options);
    expect(nc.getValue()).toBe('');
    expect(nc.getFormattedValue()).toBe(prefix);
  });

  test("'showAffixWhenEmpty': 'false'", () => {
    const prefix = ':-)';
    const options = { showAffixWhenEmpty: false, prefix };
    const nc = new LiveNumberFormatter(inp, options);
    expect(nc.getValue()).toBe('');
    expect(nc.getFormattedValue()).toBe('');
  });
});

describe('beforeinput event', () => {
  let input;
  let beforeInputHandler;
  let beforeinputSpy;
  let nc;

  beforeEach(() => {
    input = document.createElement('input');
    document.body.appendChild(input);

    nc = new LiveNumberFormatter(input);
    beforeinputSpy = vi.spyOn(nc, 'onbeforeinput');
    // input.onbeforeinput = (event) => {
    //   console.log(event.data);
    //   nc.onbeforeinput(event);
    // };
    input.addEventListener('beforeinput', (event) => {
      nc.onbeforeinput(event);
    });

    beforeInputHandler = vi.fn();
    input.addEventListener('beforeinput', beforeInputHandler);
  });

  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  test('should trigger beforeinput event', () => {
    const myEvent = new InputEvent('beforeinput', {
      inputType: 'insertText',
      data: '5',
    });
    input.dispatchEvent(myEvent);
    expect(beforeInputHandler).toHaveBeenCalledTimes(1);
    expect(beforeinputSpy).toHaveBeenCalledTimes(1);
    expect(beforeinputSpy).toHaveReturnedWith(undefined);
    //TODO: 55 because called two times
    expect(nc.getValue()).toBe('55');
  });

  test('should trigger beforeinput event', () => {
    const myEvent = new InputEvent('beforeinput', {
      inputType: 'insertText',
      data: ',',
    });
    input.dispatchEvent(myEvent);
    expect(beforeinputSpy).toHaveBeenCalledTimes(1);
    expect(nc.getValue()).toBe('0');
  });
});

describe('keydown event', () => {
  let input;
  let beforeinputSpy;
  let keydownSpy;
  let nc;

  beforeEach(() => {
    input = document.createElement('input');
    document.body.appendChild(input);
    nc = new LiveNumberFormatter(input);

    beforeinputSpy = vi.spyOn(nc, 'onbeforeinput');
    keydownSpy = vi.spyOn(nc, 'onkeydown');

    input.addEventListener('beforeinput', (event) => {
      nc.onbeforeinput(event);
    });

    input.addEventListener('keydown', (evt) => {
      nc.onkeydown(evt);
    });
  });

  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  test('should return false if key is not allowes', () => {
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
    expect(keydownSpy).toHaveBeenCalledTimes(1);
    expect(keydownSpy).toHaveReturnedWith(false);

    input.dispatchEvent(new KeyboardEvent('keydown', { key: '!' }));
    expect(keydownSpy).toHaveBeenCalledTimes(2);
    expect(keydownSpy).toHaveReturnedWith(false);
  });

  test('should return undefined if key is allowes', () => {
    input.dispatchEvent(new KeyboardEvent('keydown', { key: '1' }));
    expect(keydownSpy).toHaveBeenCalledTimes(1);
    expect(keydownSpy).toHaveReturnedWith(undefined);

    input.dispatchEvent(new KeyboardEvent('keydown', { key: ',' }));
    expect(keydownSpy).toHaveBeenCalledTimes(2);
    expect(keydownSpy).toHaveReturnedWith(undefined);
  });
});
