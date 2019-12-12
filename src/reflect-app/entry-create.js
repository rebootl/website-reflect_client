import { html, render } from 'lit-html';
import { api } from './resources/api-service.js';
import './entry-input.js';
import './add-items.js';

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
      display: none;
    }
    #input-overlay.active {
      display: block;
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

async function digestMessage(message) {
  const msgUint8 = new TextEncoder().encode(message);                           // encode as (utf-8) Uint8Array
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);           // hash the message
  const hashArray = Array.from(new Uint8Array(hashBuffer));                     // convert buffer to byte array
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join(''); // convert bytes to hex string
  return hashHex;
}

async function getPrefix(text) {
  text = text.trimStart().split(" ").slice(0,3).join().replace(/[^a-zA-Z0-9]/g,'-');
  if (text.length > 50) text = text.slice(0, 50);
  return text;
}

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
    const s = this.selectionElement.classList;
    if (Object.entries(v).length !== 0) s.add('active')
    else s.remove('active');
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
    this.selectionElement = this.shadowRoot.querySelector('#input-overlay');
  }
  async add_entry(_private) {
    if (!this.valid) {
      this.showHint = true;
      this.update();
      return;
    }
    this.showHint = false;
    this.update();
    const db = await api.getSource('entries');
    const date = new Date();
    let entry = {
      ...this.entry,
      date: date,
      topics: [ ...this.activeTopics, ...this.newTopics ],
      tags: [ ...this.activeTags, ...this.newTags ],
      private: _private,
    };
    // create id/ref
    const digest = await digestMessage(JSON.stringify(entry));
    let prefix = "";
    console.log(entry.type);
    if (entry.type === 'note') {
      prefix = await getPrefix(entry.text);
    } else if (entry.type === 'link') {
      prefix = "link";
    }
    const id = prefix + "-" + digest.slice(0, 10);
    console.log(id);
    entry = { ...entry, id };
    await db.add(entry);
    console.log("created entry!!");
    console.log("id: " + id);
    // -> return id ?
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
                         @click=${()=>this.add_entry(false)} label="Create"></labelled-button>
        <labelled-button class="inline" ?disabledstyle=${!this.valid}
                         @click=${()=>this.add_entry(true)} label="Create Private"></labelled-button>
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
}

customElements.define('entry-create', EntryCreate);
