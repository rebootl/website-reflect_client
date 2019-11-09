import { html, render } from 'lit-html';
import { classMap } from 'lit-html/directives/class-map.js';
import './gen-elements/text-input.js';
import { api_req_get, api_req_post } from './api_request_helpers.js';
import { url_info_url, entries_url } from './urls.js';
import { global_state } from './global_state.js';
import auth from './auth.js';

const style = html`
  <style>
    :host {
      display: block;
      box-sizing: border-box;
      padding: 15px 15px 10px 15px;
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

async function getUrlInfo(url) {
  const url_info = await api_req_get(url_info_url + '?url=' + encodeURIComponent(url),
    auth.get_auth_header());
  if (url_info.success) {
    return {success: true, linkInfo: url_info.cont_type, linkTitle: url_info.title};
  } else {
    return {success: false, linkInfo: url_info.cont_type, linkTitle: url_info.title};
  }
}

class EntryInput extends HTMLElement {
  get result() {
    return this._result || {text: '', detection: 'inital'};
  }
  set result(v) {
    this._result = v;
    this.dispatchEvent(new CustomEvent('change', {detail: this.result}));
    this.update();
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
  async detect(text) {
    //const text = this.shadowRoot.querySelector('#entry-input').value;
    console.log("triggered detect");
    try {
      const url = new URL(text); // this should throw if not a url
      this.result = {text: text, detection: 'pending', type: 'link'};
      const res = await getUrlInfo(url)
      this.result = {text: text, detection: 'complete', type: 'link', ...res};
    } catch(e) {
      this.result = text ?
        {text: text, detection: 'complete', type: 'note'} :
        undefined;
    }
  }
  triggerDetect(text) {
    console.log("triggered");
    this.text = text;
    if (this.detectPending) return;
    this.detectQueue = (async ()=>{
      await this.detectQueue;
      this.detectPending = false;
      await this.detect(this.text);
    })();
    this.detectPending = true;
  }
  update() {
    console.log(this.result);

    const commentClasses = {
      active: this.result.type === 'link',
    }

    let typeText = "Autodetect";
    let typeClass = "";
    let linkTitle = "";
    let linkClass = "";
    let linkInfo = "";
    if (this.result.detection === 'typing') {
      typeText = "typing...";
    } else if (this.result.type === 'link' && this.result.detection === 'pending') {
      typeText = "Link";
      typeClass = "link";
      linkTitle = "getting URL info...";
    } else if (this.result.type === 'link' && this.result.detection === 'complete') {
      typeText = "Link";
      typeClass = "link";
      if (this.result.success) {
        linkTitle = this.result.linkTitle;
        linkInfo = this.result.linkInfo;
        linkClass = 'goodlink';
      } else {
        linkInfo = "broken link :(";
        linkClass = 'brokenlink';
      }
    } else if (this.result.type === 'note') {
      typeText = "Note";
      typeClass = "note";
    }

    render(html`${style}
      <text-input id="entry-input" size="25" class="inline"
        @input=${(e)=>this.triggerDetect(e.target.value.trim())}
        placeholder="New Entry..."></text-input>
      <small id="type-detection">Type:
        <span id="type" class="${typeClass}">${typeText}</span>
        <span id="link-info" class="${linkClass}">${linkInfo}</span>
        <span id="link-title">${linkTitle}</span>
      </small>
      <text-input id="comment" size="25" class=${classMap(commentClasses)}
        placeholder="Add a comment..."></text-input>
      `, this.shadowRoot);
      //@input=${(e)=>this.detectThrottled(e.target.value.trim())}
  }
}

customElements.define('entry-input', EntryInput);
