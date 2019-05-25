import { html, render } from 'lit-html';

const style = html`
  <style>
    :host {
      display: block;
      box-sizing: border-box;
    }
    input {
      /*background-color: var(--surface);*/
      background-color: rgba(0, 0, 0, 0.3);
      border: 2px solid rgba(0, 0, 0, 0.1);
      border-radius: 3px;
      padding: 10px;
      line-height: 1.6em;
      font-size: 16px;
      color: var(--light-text-med-emph);
    }
  </style>
`;

class TextInput extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
    this.update();
  }
  get value() {
    return this.shadowRoot.querySelector('input').value;
  }
  set value(v) {
    this.shadowRoot.querySelector('input').value = v;
  }
  get size() {
    if (!this.getAttribute('size')) return 10;
    else return this.getAttribute('size');
  }
  update() {
    render(html`${style}
      <input id="${this.getAttribute('id')}" type="text" size="${this.size}"
             placeholder="${this.getAttribute('placeholder')}">`
      , this.shadowRoot);
  }
}

customElements.define('text-input', TextInput);
