export default function fullUrl(url, req) {
  if (url.indexOf('/') === 0) {
    return `${req.protocol}://${req.get('host')}${url}`;
  }
  return url;
}
