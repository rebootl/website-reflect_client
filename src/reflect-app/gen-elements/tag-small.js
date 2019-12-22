import { html, render } from 'lit-html';

const style = html`
  <style>
    :host {
      display: inline-block;
      box-sizing: border-box;
      padding: 2px;
      border-radius: 3px;
    }
    :host(.topic) {
      background-color: var(--light-text-med-emph);
      padding: 3px;
      color: #000;
    }
    :host(.tag) {
      border: 2px solid var(--on-surface-line);
      padding-left: 2px;
      padding-right: 2px;
      color: var(--light-text-med-emph);
    }
  </style>
`;

class TagSmall extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
  }
  connectedCallback() {
    this.update();
  }
  update() {
    render(html`${style}
        <small><slot></slot></small>
        `, this.shadowRoot);
  }
}

customElements.define('tag-small', TagSmall);
