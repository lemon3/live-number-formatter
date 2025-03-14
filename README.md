<!-- PROJECT SHIELDS -->
[![MIT License][license-shield]][license-url]

# live-number-formatter

> currently (beta)

Is an input field for numbers that formats the entered number live.


## demo
### [go to the demo >>](https://lemon3.github.io/live-number-formatter/)

![demo](https://raw.githubusercontent.com/lemon3/live-number-formatter/refs/heads/main/_assets/demo.gif)

## usage
```Bash
pnpm add live-number-formatter
```

```js
import LiveNumberFormatter from 'live-number-formatter';

const numberField = document.querySelector('#numberField');
const options = {
  prefix: '$ ',
}; // see below

const lnf = new LiveNumberFormatter(numberField, options);
```


## options
```js
const options = {
  // the startValue, will be set at initialization
  startValue: null,

  // the number prefix, e.g.: '€ '
  prefix: null,

  locale: 'en-US',

  // the min value
  min: null,

  // the max value
  max: null,

  // the min length of the number
  minlength: null,

  // the max length of the number, eg.
  maxlength: null,

  // shot the prefix if the field is empty
  showAffixWhenEmpty: false,

  // allow comma numbers, e.g.: 12.4
  allowComma: true,

  // max number of decimal Places
  maxDecimalPlaces: 2,
};
```


<!-- MARKDOWN LINKS & IMAGES -->
[license-shield]: https://img.shields.io/github/license/lemon3/live-number-formatter?style=for-the-badge
[license-url]: https://github.com/lemon3/live-number-formatter/blob/main/LICENSE
