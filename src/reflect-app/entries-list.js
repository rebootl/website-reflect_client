import { html, render } from 'lit-html';
import { myrouter } from './resources/router.js';
import { api } from './resources/api-service.js';
import { observableList } from './resources/observableList';
import './entry-item.js';

const style = html`
  <style>
    :host {
      display: block;
      box-sizing: border-box;
    }
    ul {
      list-style: none;
      margin: 0;
      padding: 0;
    }
    li {
      border-bottom: 1px solid var(--on-background-border);
    }
    entry-item {
      margin: 15px 20px 15px 20px;
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
    this.update();
  }
  router_load(url_state_obj) {
    this.router_update(url_state_obj);
  }
  router_update(url_state_obj) {
    console.log('updating entries-list...');
    const params = url_state_obj.params;
    this.activeTopics = params.topics || [];
    this.activeTags = params.subtags || [];
    this.updateQuery();
  }
  updateQuery() {
    if (this.activeTopics < 1) {
      this.entries.query([
        {$sort: {date: -1}},
      ]);
    } else if (this.activeTags < 1) {
      this.entries.query([
        { $match: { $and: [
          { topics: { $in: this.activeTopics } }
        ] } },
        { $sort: {date: -1 }},
      ]);
    } else {
      this.entries.query([
        { $match: { $and: [
          { topics: { $in: this.activeTopics } },
          { tags: { $in: this.activeTags } }
        ] } },
        { $sort: {date: -1 }},
      ]);
    }
  }
  update() {
    render(html`${style}
      <ul>
      ${observableList(
          this.entries,
          (v, i) => html`
            <li><entry-item .entry=${v}></entry-item></li>
          `,
          html`<pre>loading...</pre>`
        )}
      </ul>
      `, this.shadowRoot);
  }
}

customElements.define('entries-list', EntriesList);
