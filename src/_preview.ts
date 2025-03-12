import { NumberClass } from './index.ts';
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
`;

const options = {
  startValue: null,
  prefix: '$ ',
  showAffixWhenEmpty: true,
  allowComma: true,
};

const nc = new NumberClass('#num', options);

const result = document.querySelector('#result');
// const keyPressed = document.querySelector('#key-pressed');

function generateRandomNumber(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const buttonClicked = () => {
  const rand = generateRandomNumber(100, 99999);
  const minus = Math.random() > 0.6 ? '-' : '';
  nc.setValue(minus + rand);
  if (result) result.innerHTML = `value: ${nc.getValue()}`;
};
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
