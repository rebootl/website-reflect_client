import { html, render } from 'lit-html';
import { global_state } from './state.js';

const style = html`
  <style>
    :host {
      background-color: rgba(0,0,0,0);
      box-sizing: content-box;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    :host(:hover) {
      cursor: pointer;
    }
    #icon-user {
      padding-left: 10px;
    }
    #text {
      padding-left: 5px;
      min-width: 10px;
    }
    #icon-down {
      padding-left: 5px;
      padding-right: 10px;
    }
  </style>
`;

class UserDropdownButton extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
    this.update();
  }
  static get observedAttributes() {
    return ["userstate"];
  }
  attributeChangedCallback(name, old, change) {
    //this.textContent = change;
    this.update();
  }
  update() {
    // unicode user icon: &#x1F464; doesn't work in chromium :(
    const { user } = global_state;
    //const templ = (user) => ;
    render(html`
      ${style}
      <img id="icon-user" src="layout/icons/user-dark_20.png">
      ${ user.logged_in ?
          html`<span id="text">${ user.name }</span>` :
          html`` }
      <img id="icon-down" src="/layout/icons/down_20.png">
    `
    , this.shadowRoot);
  }
}

customElements.define('user-dropdown-button', UserDropdownButton);
