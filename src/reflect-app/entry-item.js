import { html, render } from 'lit-html';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';
import format from 'date-fns/format'
const md = window.markdownit().use(window.markdownitEmoji);
// add twemojis
// (attribution req.)
md.renderer.rules.emoji = (token, idx) => {
  return twemoji.parse(token[idx].content);
};
// -> also https://github.com/commonmark/commonmark.js looks kinda nice,
//    used by https://github.com/intcreator/markdown-element

const style = html`
  <style>
    :host {
      display: block;
      box-sizing: border-box;
      padding: 5px 5px 5px 5px;
      color: var(--light-text-med-emph);
      -background-color: #131e1e;
      -border: 1px solid #164141;
    }
    :host(.private) {
      /*background-color: var(--bg-private);
      color: var(--text-private);*/
    }
    :host(.private) a {
      color: var(--secondary);
    }
    .le-header-text {
      /*font-size: 0.8em;*/
      color: var(--light-text-low-emph);
    }
    .le-header-text a {
      /*font-size: 0.8em;*/
      display: none;
    }
    .le-header-icon {
      vertical-align: middle;
      padding-left: 3px;
      opacity: 0.87;
      /*float: right;*/
    }
    .le-body {
      /*overflow: hidden;*/
      box-sizing: border-box;
      margin: 0 15px 5px 15px;
      padding: 2px 50px 5px 50px;
      border-left: 1px solid var(--on-background-border);
      /*font-size: 18px;*/
      line-height: 1.5em;
    }
    .emoji {
      height: 1.5em;
      vertical-align: middle;
    }
    a {
      color: var(--primary);
    }
  </style>
`;

class EntryItem extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
  }
  connectedCallback() {
  }
  get entry() {
    return this._entry;
  }
  set entry(v) {
    this._entry = v;
    this.update();
    //this.state_update();
  }
  state_update() {
    if (this.entry.private) {
      this.shadowRoot.host.classList.add('private');
    }
    this.update();
  }
  getContent() {
    if (this.entry.type === 'note') {
      return html`<div class="le-body">${unsafeHTML(md.render(this.entry.text))}</div>`;
    } else if (this.entry.type === 'link' || this.entry.type === 'brokenlink') {
      return html`<div class="le-body">
                    <p>${this.entry.title}</p>
                    <a href=${this.entry.url}>${this.entry.url}</a><br />
                    <small>${this.entry.info}</small>
                    <div>${this.entry.comment !== "" ? this.entry.comment : html``}</div>
                  </div>
                 `;
    }
  }
  update() {
    const dateFormat = "ddd MMM d YYYY HH:mm:ss Z"

    render(html`${style}
                <small class="le-header-text">
                  ${format(this.entry.date, dateFormat)}
                  <a href="#entry?id=${this.entry.id}">#entry?id=${this.entry.id}</a>
                </small>
                ${this.getContent()}
      `, this.shadowRoot);
      /*
      <a href="#entry?id=${this.entry.id}">#entry?id=${this.entry.id}</a>
      ${ this.entry.private ?
        html`<img class="le-header-icon" src="layout/icons/private_32.png">
             <small class="le-header-text">(private)</small>` :
        html`` }
      ${ this.entry.pinned ?
        html`<img class="le-header-icon" src="layout/icons/pin_16.png">
             <small class="le-header-text">(pinned)</small>` :
        html`` }
      */
  }
}

customElements.define('entry-item', EntryItem);
