import { html, render } from 'lit-html';
import { myrouter } from './router.js';
import './subtag-item.js';
import { api, create_example_data } from './api-service.js';
import { observableList } from './observableList';

const style = html`
<style>
  :host {
    display: block;
    box-sizing: border-box;
    background-color: var(--surface);
    color: var(--light-text-hig-emph);
    /* stub height */
    min-height: 100px;
    padding-top: 5px;
    /*border: 1px dashed #333;*/
  }
  ul {
    margin: 0;
    padding-left: 0;
    list-style: none;
  }
  #subtags {
  }
  #subtags ul {
    border-top: 1px solid var(--on-surface-line);
    padding: 5px;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
  }
  .add-topic-tag {
    display: inline;
  }
</style>
`;

class SubtagsList extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
  }
  get activeTopics() {
    return this._activeTopics || [];
  }
  set activeTopics(v) {
    this._activeTopics = v;
    if (this.topics) this.update_query();
  }
  get activeSubtags() {
    return this._activeSubtags || [];
  }
  set activeSubtags(v) {
    this._activeSubtags = v;
    if (this.subtags) this.update_query();
  }
  connectedCallback() {
    this.subtags = api.observe('entries');
    this.update_query();
    this.update();
  }
  update_query() {
    // get subtags of selected topics
    this.subtags.query([
      {$unwind: "$topics"},
      {$project: {
        topic: "$topics.topic",
        tags: "$topics.tags",
        selected: {$in: [
          "$topics.topic",
          this.activeTopics
        ]}}
      },
      {$match: {selected: true}},
      {$unwind: "$tags"},
      {$group: {_id: "$tags"}},
      {$project: {
        _id: -1,
        name: "$_id",
        selected: {$in: [
          "$_id",
          this.activeSubtags
        ]}
      }},
      {$sort: {name: 1}}
    ]);
  }
  toggle_topic(topic_name) {
    if (this.activeTopics.includes(topic_name)) {
      this.activeTopics.splice(this.activeTopics.indexOf(topic_name), 1);
    } else {
      this.activeTopics.push(topic_name);
    }
    this.dispatchEvent(new CustomEvent('selectionchanged',
      {detail: this.activeTopics}));
    //this.update_url();
  }
  update() {
    render(html`${style}
      <nav id="subtags">
        <ul>
          ${observableList(
              this.subtags,
              (v, i) => html`<li>
                <subtag-item class="${ v.selected ?
                  'active' : ''}" @click="${() => this.toggle_topic(v.name)}">
                  ${v.name}
                </subtag-item>
              </li>`,
              html`<pre>loading...</pre>`
            )}
        </ul>
      </nav>`,
      this.shadowRoot);
  }
}

customElements.define('subtags-list', SubtagsList);
