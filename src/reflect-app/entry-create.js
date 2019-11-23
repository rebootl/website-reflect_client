import { html, render } from 'lit-html';
import { api } from './api-service.js';
import './gen-elements/text-input.js';
import './entry-input.js';
import './add-items.js';
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
    #add-tags {
      border-top: 1px solid var(--on-surface-line);
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

class EntryCreate extends HTMLElement {
  get activeTopics() {
    return this._activeTopics || [];
  }
  set activeTopics(v) {
    this._activeTopics = v;
    if (v.length < 1) this.activeTags = [];
    this.showHint = false;
    this.update();
  }
  get activeTags() {
    return this._activeTags || [];
  }
  set activeTags(v) {
    this._activeTags = v;
    this.update();
  }
  get newTopics() {
    return this._newTopics || [];
  }
  set newTopics(v) {
    this._newTopics = v;
    this.showHint = false;
    this.update();
  }
  get newTags() {
    return this._newTags || [];
  }
  set newTags(v) {
    this._newTags = v;
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
  get inputReady() {
    return this._inputReady || false;
  }
  set inputReady(v) {
    this._inputReady = v;
    this.update();
  }
  get valid() {
    if ((this.activeTopics.length < 1 && this.newTopics.length < 1) ||
      !this.inputReady)
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
  async add_entry() {
    if (!this.valid) {
      this.showHint = true;
      this.update();
      return;
    }
    this.showHint = false;
    this.update();
    const db = await api.getSource('entries');
    const date = new Date();
    const entry = {
      ...this.entry,
      date: date,
      topics: [ ...this.activeTopics, ...this.newTopics ],
      tags: [ ...this.activeTags, ...this.newTags ],
    };
    await db.add(entry);
    console.log("created entry!!");
    console.log(entry);
    // -> return id ?
    //console.log(e);
    this.reset();
  }
  reset() {
    this.shadowRoot.querySelector('entry-input').reset();
    this.shadowRoot.querySelector('#add-topics').reset();
    this.shadowRoot.querySelector('topics-list').reset();
    this.shadowRoot.querySelector('#add-tags').reset();
    this.shadowRoot.querySelector('subtags-list').reset();
  }
  getHint() {
    if (!this.inputReady)
      return html`<small class="hint">entry input incomplete...</small>`;
    if (this.activeTopics.length < 1 || this.newTopics.length < 1)
      return html`<small class="hint">select/create one or more topics...</small>`;
  }
  update() {
    render(html`${style}
      <div>
        <entry-input class="inline"
                     @ready=${(e)=>{this.inputReady = e.detail}}
                     @inputchange=${(e)=>{this.entry = e.detail}}></entry-input>
        <labelled-button class="inline" ?disabledstyle=${!this.valid}
                         @click=${()=>this.add_entry()} label="Create"></labelled-button>
        ${this.showHint ? this.getHint() : html``}
      </div>
      <div id="input-overlay">
        <add-items id="add-topics" label="New Topic..."
                   @itemschanged=${(e)=>{this.newTopics = e.detail}}></add-items>
        <topics-list .activeTopics=${this.activeTopics}
                     @selectionchanged=${(e)=>{this.activeTopics = e.detail}}>
        </topics-list>
        <add-items id="add-tags" label="New Tag..."
                   @itemschanged=${(e)=>{this.newTags = e.detail}}></add-items>
        <subtags-list .activeTopics=${this.activeTopics} .activeSubtags=${this.activeTags}
                      @selectionchanged=${(e)=>{this.activeTags = e.detail}}>
        </subtags-list>
      </div>
      `, this.shadowRoot);
  }
  //${(e)=>this.newTopics = e.detail}

  //?disabled=${this.entry.detection !== 'complete' ||
  //this.activeTopics.length < 1}
}

customElements.define('entry-create', EntryCreate);
