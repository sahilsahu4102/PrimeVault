/**
 * The API address as the client calls it: always ending in /api/v1, whether the deployment's environment setting
 * gave the full address or only the host. A host-only value (easy to paste) would otherwise send every call to a
 * route that does not exist.
 */
export function normalizeApiUrl(raw) {
  const value = (raw || 'http://localhost:5000/api/v1').trim().replace(/\/+$/, '');
  return value.replace(/(\/api\/v1)?$/, '/api/v1');
}

/** The Swagger docs live on the same server as the API, one level above /api/v1. */
export function docsUrl(apiUrl) {
  return `${apiUrl.replace(/\/api\/v1\/?$/, '')}/api-docs`;
}
