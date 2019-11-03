import { html, render } from 'lit-html';
import { global_state } from './global_state.js';
import { myrouter } from './router.js';
import './topics-list.js';
import './subtags-list.js';
import './gen-elements/text-input.js';
import './gen-elements/labelled-button.js';
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
  </style>
`;

class MainMenu extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
  }
  connectedCallback() {
    myrouter.register(this);
  }
  router_register(url_state_obj) {
    this.subtags = api.observe('entries');

    this.update_menu_by_url(url_state_obj);
    this.update();
  }
  router_load(url_state_obj) {}
  router_update(url_state_obj) {
    this.update_menu_by_url(url_state_obj);
  }
  update_menu_by_url(url_state_obj) {
    const params = url_state_obj.params;
    this.active_topics = params.topics || [];
    this.active_subtags = params.subtags || [];
    this.update();
  }
  async add_topic() {
    const topic_name = this.shadowRoot.getElementById('add-topic').value;
    const db = await api.getSource('entries');
    // -> create a dummy entry containing the topic to add
    await db.add({
      "topics": [
        {
            "topic": topic_name,
            "tags": []
        }
      ]
    });
    //this.update_url();
  }
  update_url() {
    // generate url
    // format e.g. #entries?select=true&topic_id[]=3&tag_id[]=2&tag_id[]=3
    // elements:
    // #entries?select=true &topic_id[]=3 &tag_id[]=2 &tag_id[]=3
    let hash_url = "#entries";
    if (this.active_topics.length > 0) {
      hash_url += "?selected";
      for (const t of this.active_topics) {
        hash_url += '&topics[]=' + encodeURIComponent(t);
      }
      for (const s of this.active_subtags) {
        hash_url += '&subtags[]=' + encodeURIComponent(s);
      }
    }
    // update it
    window.location.hash = hash_url;
  }
  updateUrlTopics(active_topics) {
    this.active_topics = active_topics;
    this.update_url();
  }
  updateUrlSubtags(active_subtags) {
    this.active_subtags = active_subtags;
    this.update_url();
  }
  update() {

    const add_topic_html = (global_state.user.logged_in) ?
      html`<li>
        <text-input id="add-topic" class="inputfield add-topic-tag"
                    placeholder="New Topic..."></text-input>
        <labelled-button id="add-topic-button" class="add-topic-tag"
                         @click=${()=>this.add_topic()}
                         label="+"></labelled-button>
      </li>` : html``;

    const add_subtag_html = (global_state.user.logged_in && this.active_topics.length > 0) ?
      html`<li>
        <text-input id="add-tag" class="inputfield add-topic-tag"
                    placeholder="New Tag..."></text-input>
        <labelled-button id="add-tag-button" class="add-topic-tag"
                         @click=${()=>this.add_tag()}
                         label="+"></labelled-button>
      </li>` : html``;

    render(html`${style}
      ${add_topic_html}
      <topics-list .activeTopics=${this.active_topics}
        @selectionchanged=${(e) => this.updateUrlTopics(e.detail)}></topics-list>
      ${add_subtag_html}
      <subtags-list .activeTopics=${this.active_topics}
        .activeSubtags=${this.active_subtags}
        @selectionchanged=${(e) => this.updateUrlSubtags(e.detail)}></subtags-list>`,
      this.shadowRoot);
  }
}

customElements.define('main-menu', MainMenu);
