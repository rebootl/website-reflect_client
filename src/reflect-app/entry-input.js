import { html, render } from 'lit-html';
import { classMap } from 'lit-html/directives/class-map.js';
import { apiGetRequest } from './resources/api_request_helpers.js';
import { url_info_url } from './resources/urls.js';
import { get_auth_header } from './resources/auth.js';
import './gen-elements/textarea-input.js';
import './gen-elements/text-input.js';
import './gen-elements/tag-small.js';

const style = html`
  <style>
    :host {
      display: block;
      box-sizing: border-box;
      color: var(--light-text-med-emph);
    }
    /* does this work?
    textarea-input {
      height: 25px;
    }*/
    #typeDetectionBox {
      /*display: block;*/
      padding: 10px 0 10px 10px;
      color: var(--light-text-low-emph);
    }
    tag-small {
      /* avoid moving down of stuff when element appears */
      display: inline;
      margin-right: 5px;
    }
    #comment {
      display: none;
      margin-bottom: 5px;
    }
    #comment.active {
      display: block;
    }
  </style>
`;

// adapted from: https://stackoverflow.com/questions/27078285/simple-throttle-in-js
function throttle(func, delay=1000) {
  //console.log("throttle :D:D:D");
  let timeout = null;
  return function() {
    if (!timeout) {
      timeout = setTimeout(() => {
        func.call();
        timeout = null;
      }, delay);
    }
  }
}

class EntryInput extends HTMLElement {
  get ready() {
    return this._ready || false;
  }
  set ready(v) {
    this._ready = v;
    this.dispatchEvent(new CustomEvent('ready', {detail: this._ready}));
  }
  get status() {
    return this._status || 'initial';
  }
  set status(v) {
    this._status = v;
    this.ready = this._status === 'complete' ? true : false;
    this.update();
  }
  get result() {
    return this._result || {};
  }
  set result(v) {
    this._result = v;
    this.dispatchEvent(new CustomEvent('inputchange', {detail: this.result}));
    this.update();
  }
  get comment() {
    return this._comment || "";
  }
  set comment(v) {
    this._comment = v;
    this.result = {...this.result, comment: v};
  }
  get loadtext() {
    return this.getAttribute('loadtext') || "";
  }
  get placeholder() {
    return this.getAttribute('placeholder') || "New Entry...";
  }
  get rows() {
    return this.getAttribute('rows') || 1;
  }
  get cols() {
    return this.getAttribute('cols') || 30;
  }
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
  }
  connectedCallback() {
    this.update();
    //this.detectThrottled = throttle((v)=>{this.detect(v)}, 1000);
    /*
    (v) => {
      this.result = {text: v, detection: 'typing'};
      this.update();
      throttle(()=>{this.detect(v)}, 1000);
    }*/
  }
  async setUrlInfo(url) {
    await apiGetRequest(
      url_info_url + '?url=' + encodeURIComponent(url),
      get_auth_header()
    )
      .then(data=>{
        this.result = {...this.result, info: data.cont_type, title: data.title};
        this.status = 'complete';
      })
      .catch((e)=>{
        if (e.code === 'ERESPONSE') {
          this.result = {...this.result, type: 'brokenlink', info: "broken link :(", title: e.message};
          this.status = 'complete';
        } else {
          this.result = {...this.result, info: "url info request failed...", title: e};
          this.status = 'complete';
        }
      });
  }
  async detect(text) {
    //const text = this.shadowRoot.querySelector('#entry-input').value;
    //console.log("triggered detect");
    /*const url = (()=>{try {return new URL(...);} catch (e) {}})();
    if (url) {
    } else {
    }*/
    let url;
    try {
      url = new URL(text); // this should throw if not a url
    } catch(e) {
      //console.log(e);
      if (text === "") {
        this.result = {};
        this.status = 'initial';
      } else {
        this.result = {text: text, type: 'note'};
        this.status = 'complete';
      }
      return;
    }
    this.status = 'pending';
    this.result = {url: text, type: 'link'};
    await this.setUrlInfo(url);
    //console.log(this.result);
  }
  triggerDetect(text) {
    // (by Luca)
    //console.log("triggered");
    this.text = text;
    if (this.detectPending) return;
    this.detectQueue = (async ()=>{
      await this.detectQueue;
      this.detectPending = false;
      await this.detect(this.text);
    })();
    this.detectPending = true;
  }
  reset() {
    this.shadowRoot.querySelector('#entry-text').reset();
    this.shadowRoot.querySelector('#comment').reset();
    this.status = 'initial';
    this.result = {};
  }
  getTypeDetect() {
    if (this.status.detection === 'typing')
      return html`<small>typing...</small>`;
    if (this.result.type === 'link' && this.status === 'pending') {
      return html`<tag-small type="link">Link</tag-small>
                  <small>getting URL info...</small>`;
    }
    if (this.result.type === 'link' && this.status === 'complete') {
      return html`<tag-small type="link">Link</tag-small>
                  <tag-small type="linkinfo">${this.result.info}</tag-small>
                  <small>${this.result.title}</small>`;
    }
    if (this.result.type === 'brokenlink' && this.status === 'complete') {
      return html`<tag-small type="link">Link</tag-small>
                  <tag-small type="brokenlink">${this.result.info}</tag-small>
                  <small>${this.result.title}</small>`;
    }
    if (this.result.type === 'note')
      return html`<tag-small type="note">Note</tag-small>`;
    return html`<small>Autodetect<small>`;
  }
  update() {
    const commentClasses = { active: this.result.type === 'link' };
    render(html`${style}
      <textarea-input id="entry-text" rows=${this.rows} cols=${this.cols}
                  @input=${(e)=>this.triggerDetect(e.target.value.trim())}
                  placeholder=${this.placeholder}
                  loadtext=${this.loadtext}></textarea-input>
      <div id="typeDetectionBox">
        <small id="typeDetection">Type: </small>${this.getTypeDetect()}
      </div>
      <text-input id="comment" size="25" class=${classMap(commentClasses)}
                  @input=${(e)=>{this.comment = e.target.value.trim()}}
                  placeholder="Add a comment..."></text-input>
      `,
      this.shadowRoot);
  }
}

customElements.define('entry-input', EntryInput);
