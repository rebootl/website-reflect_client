import { html, render } from 'lit-html';
import { global_state } from './global_state.js';
import auth from './auth.js';
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
    this.update();
  }
  update() {
    //console.log(this.entries_obj.entries);
    render(html`${style}
      ${ global_state.user.logged_in ?
        html`<entry-create @created="${()=>this.state_update()}"></entry-create>` :
        html`` }
      <entries-list></entries-list>
      `, this.shadowRoot);
  }
}

customElements.define('view-entries', ViewEntries);
