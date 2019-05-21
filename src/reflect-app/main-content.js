import { html, render } from 'lit-html';
import { myrouter } from './router.js';
import './listed-entries.js';

const style = html`
  <style>
    :host {
      display: block;
      box-sizing: content-box;
      /*background-color: var(--bg-front);*/
      padding: 0;
      /*border: 1px dashed #333;*/
    }
  </style>
`;

const routes = {
  'entries': (url_state_obj) => html`<listed-entries .url_state_obj=${url_state_obj}></listed-entries>`,
  //'add-entry': (a) => html`<add-entry></add-entry>`,
  'edit-entry': (a) => html`<edit-entry></edit-entry>`,
  //'edit-topic': (a) => html`<edit-topic></edit-topic>`,
};

class MainContent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: 'open'});

    myrouter.register(this);
  }
  router_register(url_state_obj) {}
  router_load(url_state_obj) {
    this.router_update(url_state_obj);
  }
  router_update(url_state_obj) {
    if (routes.hasOwnProperty(url_state_obj.route)) {
      this.routed_content = routes[url_state_obj.route](url_state_obj);
    } else {
      // -> maybe flash msg here... `route not found :(`
      // default to entries
      this.routed_content = routes['entries'](url_state_obj);
    }
    this.update();
  }
  update() {
    render(html`${style}
        ${this.routed_content}
      `, this.shadowRoot);
  }
}

customElements.define('main-content', MainContent);
