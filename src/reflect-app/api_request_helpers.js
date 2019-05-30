
export const api_req_get = async (api_url, header) => {
  try {
    const response = await fetch(api_url, {
      headers: header
    });
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

const default_header = {
  'Accept': 'application/json',
  'Content-Type': 'application/json'
}

export const api_req_post = async (api_url, params, header=default_header) => {
  try {
    const response = await fetch(api_url, {
      method: 'POST',
      headers: header,
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
