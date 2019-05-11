
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
  }
}
