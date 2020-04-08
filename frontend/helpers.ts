export function setGetParamUrl(key, value) {
  let params = new URLSearchParams(window.location.search);
  params.set(key, value);
  let url =
    window.location.protocol +
    "//" +
    window.location.host +
    window.location.pathname +
    "?" +
    params.toString();

  return url;
}
