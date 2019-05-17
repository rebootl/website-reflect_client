import { html, render } from 'lit-html';
import './gen-elements/text-input.js';
import { api_req_get } from './api_request_helpers.js';
import { url_info_url } from './urls.js';
import auth from './auth.js';

const style = html`
  <style>
    :host {
      display: block;
      /*box-sizing: border-box;*/
      padding: 15px 15px 10px 15px;
      border-bottom: 1px solid var(--on-background-border);
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

const inputchange_deb = () => console.log("debounced :D");

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
  },
  /*image: {
    label: '',
    title: '',
    class: 'image'
  }*/
}

class CreateEntry extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: 'open'});

    this.detected_type = entrytypes.unknown;
    this.link_type = linktypes.none;
    this.update();
    // setup type detection
    const detect_type_throttled = throttle(() => this.detect_type(), 1000);
    this.textinput_el = this.shadowRoot.querySelector('#new-entry');
    this.textinput_el.oninput = () => {
      this.detect_type_pending();
      detect_type_throttled();
    }
  }
  submit() {
    console.log("submiiiiiiiiiit :P");
  }
  detect_type_pending() {
    //console.log("inputchaaaaaange :D")
    this.detected_type = entrytypes.pending;
    this.link_type = linktypes.none;
    this.update();
  }
  detect_type() {
    //console.log("throttled :D");
    // -> detect inputtype
    console.log(this.textinput_el.value);
    const val = this.textinput_el.value;
    if (val.startsWith('http://') || val.startsWith('https://')) {
      this.detected_type = entrytypes.link;
      this.update_link_type(val);
      //this.update();
    } else if (val == '') {
      this.detected_type = entrytypes.unknown;
      this.link_type = linktypes.none;
    } else {
      this.detected_type = entrytypes.note;
      this.link_type = linktypes.none;
    }
    this.update();link
  }
  async update_link_type(url) {
    this.link_type = linktypes.pending;
    const url_info = await api_req_get(url_info_url + '?url=' + encodeURIComponent(url),
      auth.get_auth_header());
    if (url_info.success) {
      this.link_type = linktypes.success;
      this.link_type.label = url_info.cont_type;
      this.link_type.title = url_info.title;
    } else {
      this.link_type = linktypes.error;
      this.link_type.title = url_info.err_msg;
    }
    this.update();
  }
  update() {
    //<div >
    //</div>
    render(html`${style}
      <div>
        <text-input id="new-entry" size="30" class="inline"
                    placeholder="New Entry...">></text-input>
        <labelled-button class="inline"
                         @click=${()=>this.submit()} label="Create"></labelled-button>
      </div>
      <small id="new-entry-typedet" >Type:
        <span id="new-entry-type" class="${this.detected_type.class}">${this.detected_type.label}</span>
        <span id="link-type-label" class="${this.link_type.class}">${this.link_type.label}</span>
        <span id="link-type-title">${this.link_type.title}</span>
      </small>
      `, this.shadowRoot);
  }
}

customElements.define('create-entry', CreateEntry);
