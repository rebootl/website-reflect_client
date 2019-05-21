import { global_state } from './global_state.js';
import { login_url } from './urls.js';
import { api_req_post } from './api_request_helpers.js'

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
