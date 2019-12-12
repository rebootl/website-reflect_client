import { html, render } from 'lit-html';
import { classMap } from 'lit-html/directives/class-map.js';
import { apiGetRequest } from './resources/api_request_helpers.js';
import { url_info_url } from './resources/urls.js';
import { get_auth_header } from './resources/auth.js';
import './gen-elements/text-input.js';

const style = html`
  <style>
    :host {
      display: block;
      box-sizing: border-box;
      padding: 15px 15px 0 15px;
      position: relative;
      color: var(--light-text-med-emph);
    }
    a {
      color: var(--primary);
    }
    .inline {
      display: inline-block;
    }
    #type-detection {
      display: block;
      padding: 10px 0 10px 10px;
      color: var(--light-text-low-emph);
    }
    #type {
      color: var(--light-text-low-emph);
      border-radius: 3px;
      padding: 2px;
    }
    #type.pend {
      /*color: var(--light-text-med-emph);*/
    }
    #type.note {
      color: var(--background);
      color: #000;
      background-color: var(--light-text-med-emph);
    }
    #type.link {
      color: var(--on-primary);
      background-color: var(--primary);
    }
    #link-info {
      border-radius: 3px;
      padding: 2px;
    }
    .brokenlink {
      color: var(--on-error);
      background-color: var(--error);
    }
    .goodlink {
      color: var(--on-primary);
      background-color: var(--primary-variant);
    }
    #input-err {
      display: block;
      color: var(--error);
      padding-left: 15px;
      padding-top: 5px;
    }
    #comment {
      display: none;
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
      return html`<span id="type">typing...</span>`;
    if (this.result.type === 'link' && this.status === 'pending') {
      return html`<span id="type" class="link">Link</span>
                  <span id="link-info">getting URL info...</span>`;
    }
    if ((this.result.type === 'link' || this.result.type === 'brokenlink')
      && this.status === 'complete') {
      const linkClass = {
        goodlink: this.result.type === 'link',
        brokenlink: this.result.type === 'brokenlink'
      }
      return html`<span id="type" class="link">Link</span>
                  <span id="link-info" class=${classMap(linkClass)}>${this.result.info}</span>
                  <span id="link-title">${this.result.title}</span>`;
    }
    if (this.result.type === 'note')
      return html`<span id="type" class="note">Note</span>`;
    return html`<span id="type">Autodetect</span>`;
  }
  update() {
    //console.log(this.result);

    const commentClasses = {
      active: this.result.type === 'link',
    };

    render(html`${style}
      <text-input id="entry-text" size="25" class="inline"
                  @input=${(e)=>this.triggerDetect(e.target.value.trim())}
                  placeholder="New Entry..."></text-input>
      <small id="type-detection">Type:
        ${this.getTypeDetect()}
      </small>
      <text-input id="comment" size="25" class=${classMap(commentClasses)}
                  @input=${(e)=>{this.comment = e.target.value.trim()}}
                  placeholder="Add a comment..."></text-input>
      `, this.shadowRoot);
      //@input=${(e)=>this.detectThrottled(e.target.value.trim())}
      //@input=${(e)=>this.triggerDetect(e.target.value.trim())}
  }
}

customElements.define('entry-input', EntryInput);
