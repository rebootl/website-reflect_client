import { html, render } from 'lit-html';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';
//import format from 'date-fns/format';
import moment from 'moment';
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
    render(html`${style}
                <small class="le-header-text">
                  ${moment(new Date(this.entry.date)).format('ddd MMM D YYYY - HH:mm:ss')}
                  ${ this.entry.private ? html`(private)` : html``}
                  <a href="#entry?id=${this.entry.id}">#entry?id=${this.entry.id}</a>
                </small>
                ${this.getContent()}
      `, this.shadowRoot);
  }
}

customElements.define('entry-item', EntryItem);
