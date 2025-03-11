<!-- PROJECT SHIELDS -->
[![MIT License][license-shield]][license-url]

# live-number-formatter

> currently (beta)

is an input field designed for numbers, which live formats the entered number.

## demo
### [go to the demo >>](https://lemon3.github.io/live-number-formatter/)

![demo](https://raw.githubusercontent.com/lemon3/live-number-formatter/refs/heads/main/_assets/demo.gif)

## usage
```js
// todo
```

## options
```js
const options = {
  // the startValue, will be set at initialization
  startValue: null,

  // the number prefix, e.g.: '€ '
  prefix: null,

  // the min value
  min: null,

  // the max value
  max: null,

  // the min length of the number
  minlength: null,

  // the max length of the number, eg.
  maxlength: null,

  // shot the prefix if the field is empty
  showAffixWhenEmpty: true,

  // allow comma numbers, e.g.: 12.4
  allowComma: true,
};
```


<!-- MARKDOWN LINKS & IMAGES -->
[license-shield]: https://img.shields.io/github/license/lemon3/live-number-formatter?style=for-the-badge
[license-url]: https://github.com/lemon3/live-number-formatter/blob/main/LICENSE
