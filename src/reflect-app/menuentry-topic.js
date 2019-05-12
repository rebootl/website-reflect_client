import { html, render } from 'lit-html';

const style = html`
  <style>
    :host {
      display: block;
      box-sizing: border-box;
      height: 48px;
      line-height: 48px;
      padding-left: 20px;
      margin: 0 5px 5px 5px;
      border-radius: 3px;
      /*color: var(--text-menu-inactive);*/
      /*background-color: var(--surface);*/
      color: var(--light-text-med-emph);
      font-size: 18px;
      font-weight: lighter;
    }
    :host(:hover) {
      cursor: pointer;
      color: var(--light-text-hig-emph);
      background-color: rgba(255, 255, 255, 0.04);
    }
    :host(.active) {
      color: var(--light-text-hig-emph);
      font-weight: normal;
      background-color: rgba(255, 255, 255, 0.08);
    }
  </style>
`;

class MenuentryTopic extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: 'open'});

    this.update();
  }
  update() {
    render(html`${style}
      <slot></slot>`,
      this.shadowRoot);
  }
}

customElements.define('menuentry-topic', MenuentryTopic);
