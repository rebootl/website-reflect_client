import { html, render } from 'lit-html';
import './gen-elements/text-input.js';
import './entry-input.js';
import './add-items.js';
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
    .hint {
      margin
      display: block;
      color: var(--error);
    }
  </style>
`;

const event_created = new CustomEvent('created', {
  bubbles: true,
});

class EntryCreateNew extends HTMLElement {
  get activeTopics() {
    return this._activeTopics || [];
  }
  set activeTopics(v) {
    this._activeTopics = v;
    this.showHint = false;
    this.update();
  }
  get entry() {
    return this._entry || {};
  }
  set entry(v) {
    this._entry = v;
    this.showHint = false;
    this.update();
  }
  get valid() {
    if (this.entry.detection !== 'complete' || this.activeTopics.length < 1)
      return false;
    return true;
  }
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
    this.showHint = false;
  }
  connectedCallback() {
    this.update();
  }
  async submit() {
    if (!this.valid) {
      this.showHint = true;
      this.update();
      return;
    }
    this.showHint = false;
    this.update();
    console.log("submitting...");
    // check detection status

  }
  getHint() {
    if (this.entry.detection !== 'complete')
      return html`<small class="hint">entry input incomplete...</small>`;
    if (this.activeTopics.length < 1)
      return html`<small class="hint">select one or more topics...</small>`;
  }
  update() {
    render(html`${style}
      <div>
        <entry-input class="inline"
                     @change=${(e)=>this.entry = e.detail}></entry-input>
        <labelled-button class="inline" ?disabledstyle=${!this.valid}
                         @click=${()=>this.submit()} label="Create"></labelled-button>
        ${this.showHint ? this.getHint() : html``}
      </div>
      <div id="input-overlay">
        <add-items label="New Topic..."></add-items>
        <topics-list .activeTopics=${this.activeTopics}
                     @selectionchanged=${(e)=>{this.activeTopics=e.detail}}>
        </topics-list>
        <subtags-list></subtags-list>
      </div>
      `, this.shadowRoot);
  }
  //?disabled=${this.entry.detection !== 'complete' ||
  //this.activeTopics.length < 1}
}

customElements.define('entry-create-new', EntryCreateNew);
