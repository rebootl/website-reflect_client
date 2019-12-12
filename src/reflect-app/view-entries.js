import { html, render } from 'lit-html';
import { loggedIn } from './resources/auth.js';
import { myrouter } from './resources/router.js';
import './entries-list.js';
import './entry-create.js';

const style = html`
  <style>
    :host {
      display: block;
      box-sizing: border-box;
    }
    #entries-list {
      list-style: none;
      margin: 0;
      padding: 0;
    }
  </style>
`;

class ViewEntries extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
  }
  connectedCallback() {
    myrouter.register(this);
    this.update();
  }
  router_register(url_state_obj) {}
  router_load(url_state_obj) {}
  router_update(url_state_obj) {
    this.update();
  }
  update() {
    //console.log(this.entries_obj.entries);
    render(html`${style}
      ${ loggedIn() ?
        html`<entry-create @created="${()=>this.state_update()}"></entry-create>` :
        html`` }
      <entries-list></entries-list>
      `, this.shadowRoot);
  }
}

customElements.define('view-entries', ViewEntries);
