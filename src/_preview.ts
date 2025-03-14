import LiveNumberFormatter from './index.ts';
import './_preview.css';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div class="main-form">
    <div id="result"></div>
    <input
      id="num"
      type="number"
      name="number"
      value=""
      placeholder="Number"
      autocomplete="off"
      autofocus />
    <label for="num">Please enter a number</label>
    <button id="rand-button">random number</button>
  </div>
  <div>
    <button class="currency">USD</button>
    <button class="currency">EUR</button>
    <button class="currency">GBP</button>
    <button class="currency">JPY</button>
  </div>
`;

const startValue = generateRandomNumber(100, 2000, 2);

const settings = [
  {
    locale: 'en-US',
    startValue,
    prefix: '$ ',
    showAffixWhenEmpty: true,
  },
  {
    locale: 'de-DE',
    startValue,
    prefix: '€ ',
    showAffixWhenEmpty: true,
  },
  {
    locale: 'uk-UK',
    startValue,
    prefix: '£ ',
    showAffixWhenEmpty: true,
  },
  {
    locale: 'ja-JP',
    startValue,
    prefix: '¥ ',
    showAffixWhenEmpty: true,
  },
];

let currentIndex = 0;

const nc = new LiveNumberFormatter('#num', settings[currentIndex]);

const result = document.querySelector('#result');
// const keyPressed = document.querySelector('#key-pressed');

function generateRandomNumber(
  min: number,
  max: number,
  commaPlaces: number = 0
) {
  const integerPart = Math.floor(Math.random() * (max - min + 1)) + min;
  const decimalPart = commaPlaces
    ? Math.floor(Math.random() * Math.pow(10, commaPlaces))
    : 0;
  return Number(
    `${integerPart}.${decimalPart.toString().padStart(commaPlaces, '0')}`
  );
}

const buttonClicked = () => {
  const rand = generateRandomNumber(100, 9999, 2);
  const minus = Math.random() > 0.6 ? '-' : '';
  nc.setValue(minus + rand);
  if (result) result.innerHTML = `value: ${nc.getValue()}`;
};
if (result) result.innerHTML = '' + startValue;
// buttonClicked();

nc.addEventListener('input', (evt) => {
  if (result) result.innerHTML = `value: ${evt.detail.value || ''}`;
});

// const inp: HTMLInputElement | null = document.querySelector('#num');
// if (inp) {
//   inp.addEventListener('keydown', (evt: KeyboardEvent) => {
//     if (keyPressed) keyPressed.innerHTML = evt.key;
//   });
// }

const randButton = document.querySelector('#rand-button');
if (randButton) {
  randButton.addEventListener('click', buttonClicked);
}

const currencyButtons = document.querySelectorAll('.currency');
const currencyButtonsClicked = (index: number) => {
  if (currentIndex === index) return;
  currencyButtons[currentIndex].classList.remove('active');
  currencyButtons[index].classList.add('active');
  currentIndex = index;
  nc.update(settings[index]);
};

if (currencyButtons) {
  currencyButtons.forEach((button, index) => {
    if (currentIndex === index) {
      button.classList.add('active');
    }
    button.addEventListener('click', (evt) => {
      evt.preventDefault();
      currencyButtonsClicked(index);
    });
  });
}
