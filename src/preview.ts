import { NumberClass } from './index.ts';
import './preview.css';

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

const inp = document.querySelector('#num');
const nc = new NumberClass(inp);
const result = document.querySelector('#result');

function generateRandomNumber(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const buttonClicked = () => {
  const rand = generateRandomNumber(100, 99999);
  nc.setValue(rand);
  if (result) {
    result.innerHTML = 'value: ' + nc.getFormattedValue();
  }
};

buttonClicked();

nc.addEventListener('input', (evt) => {
  if (result) {
    result.innerHTML = evt.detail.value || '';
  }
});

const randButton = document.querySelector('#rand-button');
if (randButton) {
  randButton.addEventListener('click', buttonClicked);
}
