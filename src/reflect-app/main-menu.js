import { html, render } from 'lit-html';
import { repeat } from 'lit-html/directives/repeat';
import { topics_url } from './urls.js';
import { Router } from './router.js';
import { api_req_get } from './api_request_helpers.js';
import './menuentry-topic.js';
import './menuentry-subtag.js';

const style = html`
  <style>
    :host {
      display: block;
      box-sizing: border-box;
      background-color: var(--surface);
      color: var(--light-text-hig-emph);
      /* stub height */
      min-height: 100px;
      border-radius: 10px;
      /*margin-top: 10px;
      margin-left: 10px;*/
      overflow: hidden;
      /*border: 1px dashed #333;*/
    }
    .elevation-01dp {
      width: 100%;
      height: 100%;
      background-color: rgb(255, 255, 255, 0.05);
      padding-top: 5px;
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

    Router.register(this);
  }
  // -> evtl. make router_load here !!!
  async router_load(url_state_obj) {
    this.topics = await api_req_get(topics_url, {});
    this.update_menu_by_url(url_state_obj);
  }
  router_update(url_state_obj) {
    //this.topics = await get_api_req(topics_url);
    // clear topics state!!
    this.topics.forEach(t => {
      t.active = false;
      t.subtags.forEach(s => s.active = false);
    });
    this.update_menu_by_url(url_state_obj);
  }
  update_menu_by_url(url_state_obj) {
    const params = url_state_obj.params;
    if (params.hasOwnProperty('select') && params.hasOwnProperty('topic_ids')) {
      this.topics.forEach(t => {
        if (params.topic_ids.includes(t.id.toString())) {
          t.active = true;
          if (params.hasOwnProperty('subtag_ids')) {
            t.subtags.forEach(s => {
              if (params.subtag_ids.includes(s.id.toString())) {
                s.active = true;
              }
            });
          }
        }
      });
    }
    this.update();
  }
  toggle_topic(topic) {
    if (topic.active) {
      topic.active = false;
      topic.subtags.forEach(s => {
        s.active = false;
      });
    } else {
      this.topics.forEach(t => {
        t.active = false;
        t.subtags.forEach(s => s.active = false);
      });
      topic.active = true;
    }
    /*this.topics.forEach(t => {
      const selected = t === topic ? !t.active : false;
      t.active = selected;
      t.subtags.forEach(s => s.active = !selected);
    });*/
    this.update_url();
    //this.update();
  }
  toggle_subtag(subtag) {
    subtag.active = !subtag.active;
    this.update_url();
    //this.update();
  }
  update_url() {
    // generate url
    // format e.g. #entries?select=true&topic_id[]=3&tag_id[]=2&tag_id[]=3
    // elements:
    // #entries?select=true &topic_id[]=3 &tag_id[]=2 &tag_id[]=3
    let hash_url = "";
    if (this.topics.some(t => t.active)) {
      hash_url = "#entries?select";
      this.topics.filter(t => t.active).forEach(t => {
        //console.log(t);
        hash_url += '&topic_ids[]=' + t.id;
        t.subtags.filter(t => t.active).forEach(s => {
          hash_url += '&subtag_ids[]=' + s.id;
        });
      });
    } else {
      hash_url = "#entries";
    }
    // update it
    window.location.hash = hash_url;
  }
  gen_subtags_torender() {
    const subtags_to_render = this.topics
      .filter(t => t.active)
      .flatMap(t => t.subtags);
    return subtags_to_render;
  }
  update() {
    const subtags_to_render = this.gen_subtags_torender();
    //console.log(subtags_to_render);

    // -> get the topic object once (from api server)
    //    -> maybe later get it on every url change (menu click),
    //       maybe make it async
    // on page load/url change  <------------------------------\
    // -> create a url state object (by parsing the url)       |
    // -> update the topic object accordingly                  |
    // -> render                                               |
    //                                                         |
    // on click (topic or subtag)                              |
    // -> update the topic object                              |
    // -> create url accordingly                               |
    // -> update url ------------------------------------------/

    render(html`${style}
      <div class="elevation-01dp">
        <nav id="topics">
          <ul>${this.topics.map(topic => html`
            <li>
              <menuentry-topic id="topic-${topic.id}"
                               class="${ topic.active ? 'active' : ''}"
                               @click="${()=>this.toggle_topic(topic)}">
                ${topic.label}
              </menuentry-topic>
            </li>`)}
          </ul>
        </nav>
        <nav id="subtags">
          <ul>${repeat(subtags_to_render, subtag => subtag.id, subtag => html`
            <li>
              <menuentry-subtag id="subtag-${subtag.id}"
                                class="${ subtag.active ? 'active' : ''}"
                                @click=${() => this.toggle_subtag(subtag)}>
                ${subtag.label}
              </menuentry-subtag>
            </li>`)}
          </ul>
        </nav>
      <div>`,
      this.shadowRoot);
  }
  //${subtags_to_render.length > 0 ? html`
  //` : ``}
}

customElements.define('main-menu', MainMenu);
