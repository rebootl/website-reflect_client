import { html, render } from 'lit-html';
import './item-small.js';
import './gen-elements/text-input.js';
import './gen-elements/labelled-button.js';

const style = html`
  <style>
    :host {
      display: block;
      box-sizing: border-box;
      background-color: var(--surface);
      color: var(--light-text-hig-emph);
      /* stub height */
      padding-top: 5px;
      padding-left: 5px;
      /*border: 1px dashed #333;*/
    }
    .inline-block {
      display: inline-block;
    }
    .inline {
      display: inline;
    }
  </style>
`;

class AddItems extends HTMLElement {
  get inputValue() {
    return this._inputValue || "";
  }
  set inputValue(v) {
    this._inputValue = v;
    this.update();
  }
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
  }
  connectedCallback() {
    this.newItems = [];
    this.update();
  }
  add_topic() {
    if (this.newItems.includes(this.inputValue)) return;
    this.newItems.push(this.inputValue);
    this.inputValue = "";
    this.shadowRoot.querySelector('text-input').reset();
    this.update();
  }
  remove_topic(t) {
    this.newItems = this.newItems.filter((e)=> e !== t );
    this.update();
  }
  update() {
    render(html`${style}
      ${this.newItems.map((t) => html`<item-small>${t}</item-small>
      <labelled-button @click=${()=>this.remove_topic(t)}
                       label="-"></labelled-button>`)}
      <text-input @input=${(e)=>this.inputValue = e.target.value.trim()}
                  placeholder=${this.getAttribute('label')}></text-input>
      <labelled-button ?disabled=${!this.inputValue}
                       @click=${()=>this.add_topic()}
                       label="+"></labelled-button>
        `,
      this.shadowRoot);
  }
}

customElements.define('add-items', AddItems);
