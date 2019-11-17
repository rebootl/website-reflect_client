
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

export const api_req_get2 = async (api_url, header) => {
  const response = await fetch(api_url, {
    headers: header
  });
  if (!response.ok) {
    const e = new Error('HTTP error, status = ' + response.status);
    e.code = 'ESERVER';
    throw e;
  }
  const data = await response.json();
  if (!data.success) {
    const e = new Error(data.err_msg);
    e.code = 'ERESPONSE';
    throw e;
  }
  return data;
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
