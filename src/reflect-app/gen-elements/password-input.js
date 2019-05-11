import { html, render } from 'lit-html';

const style = html`
  <style>
    :host {
      display: block;
      box-sizing: border-box;
    }
    input {
      background-color: rgba(0, 0, 0, 0.3);
      border: 2px solid rgba(0, 0, 0, 0.1);
      border-radius: 15px;
      padding: 10px;
      line-height: 1.6em;
      font-size: 16px;
      color: var(--light-text-med-emph);
    }
  </style>
`;

class PasswordInput extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
    this.update();
  }
  get value() {
    return this.shadowRoot.querySelector('input').value;
  }
  update() {
    render(html`${style}
      <input id="${this.getAttribute('id')}" type="password" size="10"
             placeholder="${this.getAttribute('placeholder')}">`
      , this.shadowRoot);
  }
}

customElements.define('password-input', PasswordInput);
