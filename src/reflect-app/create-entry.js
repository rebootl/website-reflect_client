import { html, render } from 'lit-html';
import './gen-elements/text-input.js';
import './input-entry.js';
import { api_req_get, api_req_post } from './api_request_helpers.js';
import { url_info_url, entries_url } from './urls.js';
import { myrouter } from './router.js';
import { global_state } from './global_state.js';
import auth from './auth.js';
import './main-menu.js';

const style = html`
  <style>
    :host {
      display: block;
      box-sizing: border-box;
      padding: 15px 15px 10px 15px;
      border-bottom: 1px solid var(--on-background-border);
      position: relative;
      color: var(--light-text-med-emph);
    }
    a {
      color: var(--primary);
    }
    .inline {
      display: inline-block;
    }
    #input-overlay-fix {
      position: relative;
    }
    #input-overlay {
      background-color: var(--surface);
      /*position: absolute;
      left: 40px;
      top: 5px;
      z-index: 500;*/
      border-radius: 5px;
      overflow: hidden;
    }
    .overlay {
      background-color: rgba(255, 255, 255, 0.10);
      padding: 10px;
    }
  </style>
`;

function check_sel_active(topics) {
  for (const topic of topics) {
    if (topic.active) return true;
  }
  return false;
}

const event_created = new CustomEvent('created', {
  bubbles: true,
});

class CreateEntry extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: 'open'});

    this.detected_type = "";
    this.update();
  }
  get activeTopics() {
    return this._activeTopics || [];
  }
  set activeTopics(v) {
    this._activeTopics = v;
  }
  async submit() {
    console.log("submitting...");
    /*
    // check detection status
    if (this.detected_type === entrytypes.unknown) {
      this.input_err = "Couldn't determine input...";
      this.update();
      return;
    } else if (this.detected_type === entrytypes.pending) {
      this.input_err = "Input detection pending, please retry...";
      this.update();
      return;
    }
    const topics = this.shadowRoot.querySelector('main-menu').topics;
    //console.log(topics);
    if (!check_sel_active(topics)) {
      this.input_err = "At least one topic must be selected...";
      this.update()
      return;
    }
    this.input_err = "";
    this.update();
    const params = {
      det_type: this.detected_type.class,
      text: this.textinput_el.value,
      author: global_state.user.name,
      sel_data: topics
    };
    // send request
    const res = await api_req_post(entries_url, params, auth.get_auth_header());
    if (res) {
      this.reset_types();
      this.textinput_el.value = "";
      // -> make this flash msg later
      this.input_err = "Entry created successfully! ID: " + res.id;
      console.log(res);
      this.dispatchEvent(event_created);
      this.update();
    } else {
      this.input_err = "Error creating entry... :(";
    }*/
  }
  template_get_selection() {
    /*if (this.detected_type !== entrytypes.unknown &&
        this.detected_type !== entrytypes.pending) {
      if (this.detected_type === entrytypes.link) {
        return html`
          <div id="input-overlay">
            <div class="overlay">
              <text-input id="comment" size="25"
                          placeholder="Add a comment..."></text-input>
            </div>
            <br>
            <topics-list></topics-list>
            <subtags-list></subtags-list>
          </div>`;
      } else {*/
        return html`<div id="input-overlay">
            <topics-list .activeTopics=${this.activeTopics}
              @selectionchanged=${(e)=>{this.activeTopics=e.detail}}></topics-list>
            <subtags-list></subtags-list>
          </div>`;
    /*  }
  } else { return html``; }*/
  }
  update() {
    const selection = this.template_get_selection();
    render(html`${style}
      <div>
        <input-entry class="inline"></input-entry>
        <labelled-button class="inline"
                         @click=${()=>this.submit()} label="Create"></labelled-button>
      </div>
      <div id="input-overlay-fix">
        ${selection}
      </div>
      `, this.shadowRoot);
  }
}

customElements.define('create-entry', CreateEntry);
