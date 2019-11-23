import { html, render } from 'lit-html';
import { repeat } from 'lit-html/directives/repeat';
import { myrouter } from './router.js';
import { api } from './api-service.js';
import { observableList } from './observableList';
import './entry-item.js';

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

class EntriesList extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
  }
  connectedCallback() {
    myrouter.register(this);
  }
  router_register(url_state_obj) {
    this.entries = api.observe('entries');
    //this.updateQuery();
    this.update();
  }
  router_load(url_state_obj) {
    this.router_update(url_state_obj);
  }
  router_update(url_state_obj) {
    const params = url_state_obj.params;
    this.activeTopics = params.topics || [];
    this.activeTags = params.subtags || [];
    this.updateQuery();
  }
  updateQuery() {
    if (this.activeTopics < 1) {
      this.entries.query([]);
    } else if (this.activeTags < 1) {
      this.entries.query([
        { $match: { $and: [
          { topics: { $in: this.activeTopics } }
        ] } }
      ]);
    } else {
      this.entries.query([
        { $match: { $and: [
          { topics: { $in: this.activeTopics } },
          { tags: { $in: this.activeTags } }
        ] } }
      ]);
    }
  }
  update() {
    //console.log(this.entries_obj.entries);
    render(html`${style}
      <ul>
      ${observableList(
          this.entries

        )}
      </ul>`, this.shadowRoot);
      //<li><entry-item .entry=${v}></entry-item></li>
      /*          (v, i) => html`
                  <li>${v.text}</li>
                `,
                html`<pre>loading...</pre>`*/
  }
}

customElements.define('entries-list', EntriesList);
