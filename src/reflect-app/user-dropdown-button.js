import { html, render } from 'lit-html';
import { global_state } from './global_state.js';

const style = html`
  <style>
    :host {
      display: flex;
      box-sizing: border-box;
      background-color: rgba(0,0,0,0);
      justify-content: center;
      align-items: center;
      height: 100%;
    }
    :host(:hover) {
      cursor: pointer;
    }
    :host(.active) {
      background-color: rgb(15,15,15);
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
    /*this.addEventListener('click',
      (e)=>this.classList.toggle('active'));*/
    this.update();
  }
  update() {
    // unicode user icon: &#x1F464; doesn't work in chromium :(
    const user = global_state.user;
    //console.log(user);
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
