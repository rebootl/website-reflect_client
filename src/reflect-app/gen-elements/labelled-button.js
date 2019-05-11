import { html, render } from 'lit-html';

const style = html`
  <style>
    :host {
      display: block;
      box-sizing: border-box;
    }
    button {
      background-color: rgba(0, 0, 0, 0.4);
      color: var(--light-text-hig-emph);
      border: 2px solid rgba(0, 0, 0, 0.1); /*var(--on-surface-line);*/
      border-radius: 10px;
      padding: 5px 15px 5px 15px;
      font-weight: bold;
      font-size: 16px;
      cursor: pointer;
    }
  </style>
`;

class LabelledButton extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
    this.update();
  }
  update() {
    render(html`${style}
        <button>${this.getAttribute('label')}</button>`
      , this.shadowRoot);
  }
}

customElements.define('labelled-button', LabelledButton);
