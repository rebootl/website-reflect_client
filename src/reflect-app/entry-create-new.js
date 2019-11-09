import { html, render } from 'lit-html';
import './gen-elements/text-input.js';
import './entry-input.js';
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

class EntryCreateNew extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: 'open'});

    //this.detected_type = "";
    //this.inputData = {};
    this.inputHint = "";
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
    // check detection status
    console.log("input data:", this.inputData);
    if (!this.inputData) {
      this.inputHint = "no input data found...";
      this.update();
      console.log("empty obj.");
      return;
    }
    if (!this.inputData.ready) {
      this.inputHint = this.inputData.detectedType.hint;
      this.update();
      console.log("not ready");
      return;
    }
    /*const topics = this.shadowRoot.querySelector('main-menu').topics;
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
  detectUpdate(detail) {
    this.inputData = detail;

    this.update();
  }
  update() {
    render(html`${style}
      <div>
        <entry-input class="inline"
          @typedetected=${(e)=>this.detectUpdate(e.detail)}></entry-input>
        <labelled-button class="inline"
                         @click=${()=>this.submit()} label="Create"></labelled-button>
       ${ this.inputHint != "" ?
          html`<small id="input-err">${this.inputHint}</small>` :
          html`` }
      </div>
      <div id="input-overlay">
        <topics-list .activeTopics=${this.activeTopics}
          @selectionchanged=${(e)=>{this.activeTopics=e.detail}}></topics-list>
        <subtags-list></subtags-list>
      </div>
      `, this.shadowRoot);
  }
}

customElements.define('entry-create-new', EntryCreateNew);
