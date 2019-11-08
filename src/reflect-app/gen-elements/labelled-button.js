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
      border-radius: 5px;
      padding: 5px 15px 5px 15px;
      font-weight: bold;
      font-size: 16px;
      cursor: pointer;
    }
  </style>
`;

class LabelledButton extends HTMLElement {
  static get observedAttributes() {return ['disabled']}
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
  }
  connectedCallback() {
    this.update();
  }
  attributeChangedCallback() {
    this.update();
  }
  update() {
    render(html`${style}
        <button ?disable=${this.getAttribute('disabled')}>
          ${this.getAttribute('label') || html`<slot />`}
        </button>`
      , this.shadowRoot);
  }
}

customElements.define('labelled-button', LabelledButton);
