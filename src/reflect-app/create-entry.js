import { html, render } from 'lit-html';
import './gen-elements/text-input.js';
import { api_req_get, api_req_post } from './api_request_helpers.js';
import { url_info_url, entries_url } from './urls.js';
import { myrouter } from './router.js';
import { global_state } from './global_state.js';
import auth from './auth.js';
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
    #input-overlay-fix {
      position: relative;
    }
    #input-overlay {
      background-color: var(--surface);
      position: absolute;
      left: 40px;
      top: 5px;
      z-index: 500;
      border-radius: 5px;
      overflow: hidden;
    }
    .overlay {
      background-color: rgba(255, 255, 255, 0.10);
      padding: 10px;
    }
    #input-err {
      color: yellow;
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

function check_sel_active(topics) {
  for (const topic of topics) {
    if (topic.active) return true;
  }
  return false;
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

class CreateEntry extends HTMLElement {
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
  async submit() {
    console.log("submiiiiiiiiiit :P");
    // check detection status
    if (this.detected_type === entrytypes.unknown) {
      this.input_err = "Couldn't determine input...";
      this.update();
      return;
    } else if (this.detected_type === entrytypes.pending) {
      this.input_err = "Input detection pending, please retry...";
      this.update();
      return;
    }
    const topics = this.shadowRoot.querySelector('main-menu').topics;
    //console.log(topics);
    if (!check_sel_active(topics)) {
      this.input_err = "At least one topic must be selected...";
      this.update()
      return;
    }
    this.input_err = "";
    this.update();
    const params = {
      det_type: this.detected_type.class,
      text: this.textinput_el.value,
      author: global_state.user.name,
      sel_data: topics
    };
    // -> send request
    const res = await api_req_post(entries_url, params, auth.get_auth_header());
    if (res) {
      this.reset_types();
      this.textinput_el.value = "";
      this.input_err = "Entry created successfully! ID: " + res.id;
      console.log(res);
      this.update();
    } else {
      this.input_err = "Error creating entry... :(";
    }
  }
  template_get_overlay() {
    if (this.detected_type !== entrytypes.unknown &&
        this.detected_type !== entrytypes.pending) {
      if (this.detected_type === entrytypes.link) {
        return html`
          <div id="input-overlay">
            <div class="overlay">
              <text-input id="comment" size="25"
                          placeholder="Add a comment..."></text-input>
            </div>
            <br>
            <main-menu></main-menu>
          </div>`;
      } else {
        return html`<div id="input-overlay">
            <main-menu></main-menu>
          </div>`;
      }
    } else { return html``; }
  }
  update() {
    const overlay = this.template_get_overlay();
    render(html`${style}
      <div>
        <text-input id="new-entry" size="25" class="inline"
                    placeholder="New Entry..."></text-input>
        <labelled-button class="inline"
                         @click=${()=>this.submit()} label="Create"></labelled-button>
      </div>
      <small id="input-err">${this.input_err}</small>
      <small id="new-entry-typedet">Type:
        <span id="new-entry-type" class="${this.detected_type.class}">${this.detected_type.label}</span>
        <span id="link-type-label" class="${this.link_type.class}">${this.link_type.label}</span>
        <span id="link-type-title">${this.link_type.title}</span>
      </small>
      <div id="input-overlay-fix">
        ${overlay}
      </div>
      `, this.shadowRoot);
  }
}

customElements.define('create-entry', CreateEntry);
