import { html, render } from 'lit-html';
import { loggedIn } from './resources/auth.js';
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
    render(html`${style}
      ${ loggedIn() ? html`<entry-create @created="${()=>this.state_update()}">
        </entry-create>` : html`` }
      <entries-list></entries-list>
      `, this.shadowRoot);
  }
}

customElements.define('view-entries', ViewEntries);
