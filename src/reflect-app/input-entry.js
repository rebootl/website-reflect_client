import { html, render } from 'lit-html';
import './gen-elements/text-input.js';
import { api_req_get, api_req_post } from './api_request_helpers.js';
import { url_info_url, entries_url } from './urls.js';
import auth from './auth.js';
import './main-menu.js';

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
    #new-entry-typedet {
      display: block;
      padding: 10px 0 0 10px;
      color: var(--light-text-low-emph);
    }
    #new-entry-type {
      color: var(--light-text-low-emph);
      border-radius: 3px;
      padding: 2px;
    }
    #new-entry-type.pend {
      /*color: var(--light-text-med-emph);*/
    }
    #new-entry-type.note {
      color: var(--background);
      color: #000;
      background-color: var(--light-text-med-emph);
    }
    #new-entry-type.link {
      color: var(--on-primary);
      background-color: var(--primary);
    }
    #link-type-label {
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
  </style>
`;

// adapted from: https://stackoverflow.com/questions/27078285/simple-throttle-in-js
function throttle(func, delay=500) {
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

const entrytypes = {
  unknown: {
    label: 'Autodetect',
    class: 'unkn'
  },
  pending: {
    label: 'detecting...',
    class: 'pend'
  },
  note: {
    label: 'Note',
    class: 'note'
  },
  link: {
    label: 'Link',
    class: 'link'
  },
};

const linktypes = {
  none: {
    label: '',
    title: '',
    class: ''
  },
  pending: {
    label: 'getting url info...',
    title: '',
    class: ''
  },
  error: {
    label: 'broken link :(',
    title: '',
    class: 'brokenlink'
  },
  success: {
    label: '',
    title: '',
    class: 'goodlink'
  }
}

async function get_link_type(url) {
  // make this one functional
  const url_info = await api_req_get(url_info_url + '?url=' + encodeURIComponent(url),
    auth.get_auth_header());
  let link_type;
  if (url_info.success) {
    link_type = { ...linktypes.success };
    link_type.label = url_info.cont_type;
    link_type.title = url_info.title;
  } else {
    link_type = { ...linktypes.error };
    link_type.title = url_info.err_msg;
  }
  return link_type;
}

const event_created = new CustomEvent('typedetected', {
  bubbles: true,
});

class InputEntry extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: 'open'});

    this.reset_types();
    this.input_err = "";
    this.update();
    // setup type detection
    const detect_type_throttled = throttle(() => this.detect_type(), 1000);
    this.textinput_el = this.shadowRoot.querySelector('#new-entry');
    this.textinput_el.oninput = () => {
      this.detect_type_pending();
      detect_type_throttled();
    }
  }
  get activeTopics() {
    return this._activeTopics || [];
  }
  set activeTopics(v) {
    this._activeTopics = v;
  }
  reset_types() {
    this.detected_type = entrytypes.unknown;
    this.link_type = linktypes.none;
  }
  detect_type_pending() {
    this.input_err = "";
    this.detected_type = entrytypes.pending;
    this.link_type = linktypes.none;
    this.update();
  }
  async detect_type() {
    // detect inputtype (throttled!)
    console.log(this.textinput_el.value);
    const val = this.textinput_el.value;
    if (val.startsWith('http://') || val.startsWith('https://')) {
      this.detected_type = entrytypes.link;
      this.link_type = linktypes.pending;
      this.update();
      this.link_type = await get_link_type(val);
    } else if (val == '') {
      this.reset_types();
    } else {
      this.detected_type = entrytypes.note;
      this.link_type = linktypes.none;
    }
    this.update();
  }
  update() {
    render(html`${style}
      <text-input id="new-entry" size="25" class="inline"
                  placeholder="New Entry..."></text-input>
      ${ this.input_err != "" ?
        html`<small id="input-err">${this.input_err}</small>` :
        html`` }
      <small id="new-entry-typedet">Type:
        <span id="new-entry-type" class="${this.detected_type.class}">${this.detected_type.label}</span>
        <span id="link-type-label" class="${this.link_type.class}">${this.link_type.label}</span>
        <span id="link-type-title">${this.link_type.title}</span>
      </small>
      `, this.shadowRoot);
  }
}

customElements.define('input-entry', InputEntry);
