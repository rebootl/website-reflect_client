import { html, render } from 'lit-html';
import { repeat } from 'lit-html/directives/repeat';
import { topics_url } from './urls.js';
import { myrouter } from './router.js';
import { api_req_get } from './api_request_helpers.js';
import './menuentry-topic.js';
import './menuentry-subtag.js';
import { api, create_example_data } from './api-service.js';

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
    .elevation-01dp {
      /* use el. to lighten bg */
      /*width: 100%;
      height: 100%;
      background-color: rgb(255, 255, 255, 0.05);
      padding-top: 5px;*/
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
    #subtags li {
      /*display: inline-block;*/
    }
  </style>
`;

class MainMenu extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: 'open'});

    myrouter.register(this);
  }
  async router_register(url_state_obj) {
    //create_example_data();

    // get topics
/*
    this.topics = await db.query([
      {$unwind: "$topics"},
      {$group: {_id: "$topics.topic"}},
      {$sort: {_id: 1}},
      {$project: {name: "$_id"}},
    ]);
*/
/*    this.topics = await db.query([
      {$unwind: "$topics"},
      {$group: {_id:"$topics.topic", tags:{$push:"$topics.tags"}}},
      {$project: {tags: {$concatArrays:"$tags"}}},
      {$unwind: "$tags"},
      {$sort: {tags: 1}},
      {$group: {_id:"$_id", tags:{$addToSet:"$tags"}}},
      {$project: {name: "$_id", tags: "$tags"}},
      {$sort: {_id: 1}}
    ]);*/
    console.log(this.topics);
    this.update_menu_by_url(url_state_obj);
  }
  router_load(url_state_obj) {}
  router_update(url_state_obj) {
    this.update_menu_by_url(url_state_obj);
  }
  async update_menu_by_url(url_state_obj) {
    // get topics from url
    const params = url_state_obj.params;
    console.log(params);
    this.active_topics = params.topic_ids || [];
    // get subtags
    this.active_subtags = params.subtag_ids || [];

    const db = await api.getSource('entries');
    // -> get selected topics
    this.topics = await db.query([
      {$unwind: "$topics"},
      {$group: {_id:"$topics.topic" }},
      {$sort: {_id: 1}},
      {$project: {
        _id: -1,
        name: "$_id",
        selected: {$in: [
          "$_id",
          this.active_topics
        ]}}
      },
    ]);
    // -> get subtags of selected topics
    this.tags = await db.query([
      {$unwind: "$topics"},
      {$project: {
        topic: "$topics.topic",
        tags: "$topics.tags",
        selected: {$in: [
          "$topics.topic",
          this.active_topics
        ]}}
      },
      {$match: {selected: true}},
      {$unwind: "$tags"},
      {$group: {_id: "$tags"}},
      {$project: {
        _id: -1,
        tag: "$_id",
        selected: {$in: [
          "$_id",
          this.active_subtags
        ]}
      }},
      {$sort: {tag: 1}}
    ]);

    this.update();
  }
  toggle_topic(topic_name) {
    if (this.active_topics.includes(topic_name)) {
      this.active_subtags = [];
      this.active_topics.splice(this.active_topics.indexOf(topic_name), 1);
    } else {
      this.active_topics.push(topic_name);
    }
    this.update_url();
  }
  toggle_subtag(subtag) {
    if (this.active_subtags.includes(subtag)) {
      this.active_subtags.splice(this.active_subtags.indexOf(subtag), 1);
    } else {
      this.active_subtags.push(subtag);
    }
    console.log(this.active_subtags);
    this.update_url();
  }
  update_url() {
    // generate url
    // format e.g. #entries?select=true&topic_id[]=3&tag_id[]=2&tag_id[]=3
    // elements:
    // #entries?select=true &topic_id[]=3 &tag_id[]=2 &tag_id[]=3
    let hash_url = "#entries";
    if (this.active_topics.length > 0) {
      hash_url += "?select";
      for (const t of this.active_topics) {
        hash_url += '&topic_ids[]=' + t;
      }
      for (const s of this.active_subtags) {
        hash_url += '&subtag_ids[]=' + s;
      }
    }
    // update it
    window.location.hash = hash_url;
  }
  get_subtags_torender() {
    const subtags_to_render = this.topics
      .filter(t => this.active_topics.includes(t.name))
      .flatMap(t => t.tags);
    // (make unique, sort)
    return [...new Set(subtags_to_render)].sort();
  }
  update() {

    const subtags_to_render = this.get_subtags_torender();

    render(html`${style}
      <div class="elevation-01dp">
        <nav id="topics">
          <ul>${this.topics.map(topic => html`
            <li>
              <menuentry-topic class="${ this.active_topics.includes(topic.name) ?
                'active' : ''}" @click="${() => this.toggle_topic(topic.name)}">
                ${topic.name}
              </menuentry-topic>
            </li>`)}
          </ul>
        </nav>
        <nav id="subtags">
          <ul>${repeat(subtags_to_render, subtag => subtag, subtag => html`
            <li>
              <menuentry-subtag class="${ this.active_subtags.includes(subtag) ?
                'active' : ''}" @click=${() => this.toggle_subtag(subtag)}>
                ${subtag}
              </menuentry-subtag>
            </li>`)}
          </ul>
        </nav>
      <div>`,
      this.shadowRoot);
  }
}

customElements.define('main-menu', MainMenu);
