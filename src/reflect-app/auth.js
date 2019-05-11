import { global_state } from './global_state.js';
import { login_url } from './urls.js';

const api_req_post = async (api_url, params) => {
  try {
    const response = await fetch(api_url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    });
    //console.log(response);
    if (!response.ok) {
      throw new Error('HTTP error, status = ' + response.status);
    }
    const data = await response.json();
    return data;
  } catch(err) {
    console.log(err);
    return false;
  }
}

export default {

  async login(username, pw) {
    const login_resp = await api_req_post(login_url, {
      username: username,
      password: pw
    });
    // check login login_resp
    //console.log(login_resp);
    if (!login_resp) {
      console.log("Login unsuccessful :(");
      return false;
    } else {
      console.log("Login successful!");
      //console.log(login_resp);
      // store JWT
      localStorage.setItem('access_token', login_resp.access_token);
      localStorage.setItem('username', username);
      // set logged_in = true
      // -> get rid of the global_state.user obj. entirely ?!
      global_state.user.name = username;
      global_state.user.logged_in = true;
      return true;
    }
  },

  logout() {
    localStorage.removeItem('username');
    localStorage.removeItem('access_token');
    global_state.user.name = '';
    global_state.user.logged_in = false;
  },

  update_login_status() {
    var username = localStorage.getItem('username');
    if (username) {
      global_state.user.name = username;
      global_state.user.logged_in = true;
    }
    else {
      global_state.user.logged_in = false;
    }
  },

  get_auth_header() {
    if (global_state.user.logged_in) {
      return {
        'Authorization':  'Bearer ' + localStorage.getItem('access_token')
      }
    } else {
      return {}
    }
  }

}
